const router = require('express').Router();
const ResumeController = require('../controllers/resume');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { requireRole } = require('../middleware/validate');

router.get('/', auth, requireRole('job_seeker'), ResumeController.get);
router.put('/', auth, requireRole('job_seeker'), ResumeController.upsert);
router.post('/attachments', auth, requireRole('job_seeker'), upload.single('file'), ResumeController.uploadAttachment);
router.delete('/attachments/:id', auth, requireRole('job_seeker'), ResumeController.deleteAttachment);
router.get('/attachments/:id', auth, ResumeController.downloadAttachment);

module.exports = router;
