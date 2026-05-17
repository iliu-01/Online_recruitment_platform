const authService = require('../services/auth');

const AuthController = {
  register: async (req, res, next) => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password || !role) throw Object.assign(new Error('缺少必填字段'), { status: 400 });
      if (!['job_seeker', 'company'].includes(role)) throw Object.assign(new Error('无效角色'), { status: 400 });
      if (password.length < 6) throw Object.assign(new Error('密码至少6位'), { status: 400 });

      const result = await authService.register(email, password, role);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw Object.assign(new Error('缺少邮箱或密码'), { status: 400 });

      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) { next(err); }
  },

  me: async (req, res, next) => {
    try {
      const user = await authService.getMe(req.userId);
      res.json({ user });
    } catch (err) { next(err); }
  },
};

module.exports = AuthController;
