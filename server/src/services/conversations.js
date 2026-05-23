const Conversation = require('../models/conversation');
const Message = require('../models/message');
const User = require('../models/user');

class ConversationService {
  async create(jobSeekerUserId, companyUserId, jobId) {
    const [conv] = await Conversation.findOrCreate(jobSeekerUserId, companyUserId, jobId || null);
    return conv;
  }

  async list(userId) {
    const conversations = await Conversation.findByUser(userId);
    const result = [];
    for (const c of conversations) {
      const msgs = await Message.findByConversation(c.id, null, 1);
      const lastMsg = msgs[0] || null;
      // 确定对方是谁
      const partnerId = c.job_seeker_user_id === userId ? c.company_user_id : c.job_seeker_user_id;
      const partner = await User.findById(partnerId);
      result.push({
        ...c,
        lastMessage: lastMsg,
        last_message: lastMsg?.content || '',
        last_message_at: lastMsg?.created_at || c.created_at,
        partner_name: partner?.email || '对方',
      });
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
