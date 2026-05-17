const Notification = require('../models/notification');

class NotificationService {
  async list(userId, page) {
    return Notification.findByUser(userId, page);
  }

  async markRead(id, userId) {
    await Notification.markRead(id, userId);
  }

  async markAllRead(userId) {
    await Notification.markAllRead(userId);
  }

  async unreadCount(userId) {
    const { count } = await Notification.unreadCount(userId);
    return parseInt(count);
  }

  async create(userId, type, title, content, relatedId) {
    const [notification] = await Notification.create({ user_id: userId, type, title, content, related_id: relatedId });
    return notification;
  }
}

module.exports = new NotificationService();
