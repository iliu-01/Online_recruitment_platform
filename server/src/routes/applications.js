const router = require('express').Router();
const ApplicationController = require('../controllers/applications');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/validate');

router.post('/', auth, requireRole('job_seeker'), ApplicationController.apply);
router.get('/mine', auth, requireRole('job_seeker'), ApplicationController.getMine);
router.get('/received', auth, requireRole('company'), ApplicationController.getReceived);
router.put('/:id/status', auth, requireRole('company'), ApplicationController.updateStatus);

module.exports = router;
