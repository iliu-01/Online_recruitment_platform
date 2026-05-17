const notificationService = require('../services/notifications');

const NotificationController = {
  list: async (req, res, next) => {
    try {
      const notifications = await notificationService.list(req.userId, parseInt(req.query.page || 1));
      const count = await notificationService.unreadCount(req.userId);
      res.json({ notifications, unreadCount: count });
    } catch (err) { next(err); }
  },
  markRead: async (req, res, next) => {
    try {
      await notificationService.markRead(parseInt(req.params.id), req.userId);
      res.json({ success: true });
    } catch (err) { next(err); }
  },
  markAllRead: async (req, res, next) => {
    try {
      await notificationService.markAllRead(req.userId);
      res.json({ success: true });
    } catch (err) { next(err); }
  },
};

module.exports = NotificationController;
