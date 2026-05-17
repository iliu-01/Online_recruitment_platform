const router = require('express').Router();
const JobController = require('../controllers/jobs');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/validate');

router.get('/', JobController.get);
router.get('/mine', auth, requireRole('company'), JobController.getMine);
router.get('/:id', JobController.getById);
router.post('/', auth, requireRole('company'), JobController.create);
router.put('/:id', auth, requireRole('company'), JobController.update);
router.delete('/:id', auth, requireRole('company'), JobController.delete);

module.exports = router;
