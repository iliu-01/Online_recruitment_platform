const db = require('../config/db');

const Notification = {
  create: (data) => db('notifications').insert(data).returning('*'),
  findByUser: (userId, page = 1, limit = 20) =>
    db('notifications').where({ user_id: userId }).orderBy('created_at', 'desc')
      .limit(limit).offset((page - 1) * limit),
  markRead: (id, userId) => db('notifications').where({ id, user_id: userId }).update({ is_read: true }),
  markAllRead: (userId) => db('notifications').where({ user_id: userId, is_read: false }).update({ is_read: true }),
  unreadCount: (userId) =>
    db('notifications').where({ user_id: userId, is_read: false }).count('id as count').first(),
};

module.exports = Notification;
