const Conversation = require('../models/conversation');
const Message = require('../models/message');

class ConversationService {
  async list(userId) {
    const conversations = await Conversation.findByUser(userId);
    const result = [];
    for (const c of conversations) {
      const msgs = await Message.findByConversation(c.id, null, 1);
      result.push({ ...c, lastMessage: msgs[0] || null });
    }
    return result;
  }

  async getMessages(conversationId, before) {
    const messages = await Message.findByConversation(conversationId, before);
    return messages.reverse();
  }

  async markRead(conversationId, userId) {
    await Message.markRead(conversationId, userId);
  }

  async unreadCount(userId) {
    const { count } = await Message.unreadCount(userId);
    return parseInt(count);
  }
}

module.exports = new ConversationService();
