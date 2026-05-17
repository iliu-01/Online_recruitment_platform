const validate = {
  requireRole: (...roles) => (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: '无权限执行此操作' });
    }
    next();
  },
};

module.exports = validate;
