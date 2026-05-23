const router = require('express').Router();
const AdminController = require('../controllers/admin');
const auth = require('../middleware/auth');

function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
}

router.get('/stats', auth, requireAdmin, AdminController.stats);
router.get('/users', auth, requireAdmin, AdminController.listUsers);
router.put('/users/:id', auth, requireAdmin, AdminController.updateUser);
router.delete('/users/:id', auth, requireAdmin, AdminController.deleteUser);
router.get('/jobs', auth, requireAdmin, AdminController.listJobs);
router.delete('/jobs/:id', auth, requireAdmin, AdminController.deleteJob);

module.exports = router;
