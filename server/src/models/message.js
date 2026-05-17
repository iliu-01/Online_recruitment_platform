const db = require('../config/db');

const Message = {
  create: (data) => db('messages').insert(data).returning('*'),
  findByConversation: (conversationId, before, limit = 50) => {
    let q = db('messages').where({ conversation_id: conversationId }).orderBy('created_at', 'desc').limit(limit);
    if (before) q = q.where('id', '<', before);
    return q;
  },
  markRead: (conversationId, userId) =>
    db('messages')
      .where({ conversation_id: conversationId, is_read: false })
      .whereNot({ sender_id: userId })
      .update({ is_read: true }),
  unreadCount: (userId) =>
    db('messages')
      .join('conversations', 'messages.conversation_id', 'conversations.id')
      .where(function () {
        this.where('conversations.job_seeker_user_id', userId)
          .orWhere('conversations.company_user_id', userId);
      })
      .where('messages.is_read', false)
      .whereNot('messages.sender_id', userId)
      .count('messages.id as count')
      .first(),
};

module.exports = Message;
