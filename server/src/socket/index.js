const jwt = require('jsonwebtoken');
const config = require('../config');
const conversationService = require('../services/conversations');
const notificationService = require('../services/notifications');
const Message = require('../models/message');

let _io = null;

function getIO() {
  return _io;
}

function initSocket(server) {
  const io = require('socket.io')(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });
  _io = io;

  const onlineUsers = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('未提供Token'));
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Token无效'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    socket.join(`user:${userId}`);
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} connected`);

    socket.on('send_message', async ({ conversationId, receiverId, content }) => {
      try {
        const [msg] = await Message.create({
          conversation_id: conversationId,
          sender_id: userId,
          content,
        });

        const payload = {
          id: msg.id,
          conversationId,
          senderId: userId,
          content,
          createdAt: msg.created_at,
        };
        io.to(`user:${receiverId}`).emit('new_message', payload);

        const notif = await notificationService.create(
          receiverId,
          'new_message',
          '新消息',
          content.substring(0, 50),
          conversationId
        );
        io.to(`user:${receiverId}`).emit('notification', {
          id: notif.id,
          type: notif.type,
          title: notif.title,
          content: notif.content,
          createdAt: notif.created_at,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('mark_read', async ({ conversationId }) => {
      await conversationService.markRead(conversationId, userId);
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });

  return { io, onlineUsers };
}

module.exports = { initSocket, getIO };
