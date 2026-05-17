const router = require('express').Router();
const NotificationController = require('../controllers/notifications');
const auth = require('../middleware/auth');

router.get('/', auth, NotificationController.list);
router.put('/:id/read', auth, NotificationController.markRead);
router.put('/read-all', auth, NotificationController.markAllRead);

module.exports = router;
