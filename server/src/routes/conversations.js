const router = require('express').Router();
const ConversationController = require('../controllers/conversations');
const auth = require('../middleware/auth');

router.post('/', auth, ConversationController.create);
router.get('/', auth, ConversationController.list);
router.get('/unread-count', auth, ConversationController.unreadCount);
router.get('/:id/messages', auth, ConversationController.getMessages);

module.exports = router;
