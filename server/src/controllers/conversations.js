const conversationService = require('../services/conversations');

const ConversationController = {
  list: async (req, res, next) => {
    try {
      const conversations = await conversationService.list(req.userId);
      res.json({ conversations });
    } catch (err) { next(err); }
  },
  getMessages: async (req, res, next) => {
    try {
      const messages = await conversationService.getMessages(parseInt(req.params.id), req.query.before);
      await conversationService.markRead(parseInt(req.params.id), req.userId);
      res.json({ messages });
    } catch (err) { next(err); }
  },
  unreadCount: async (req, res, next) => {
    try {
      const count = await conversationService.unreadCount(req.userId);
      res.json({ count });
    } catch (err) { next(err); }
  },
};

module.exports = ConversationController;
