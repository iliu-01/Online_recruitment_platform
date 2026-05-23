const adminService = require('../services/admin');

const AdminController = {
  stats: async (req, res, next) => {
    try {
      const stats = await adminService.getStats();
      res.json({ stats });
    } catch (err) { next(err); }
  },

  listUsers: async (req, res, next) => {
    try {
      const { role, search } = req.query;
      const users = await adminService.listUsers({ role, search });
      res.json({ users });
    } catch (err) { next(err); }
  },

  updateUser: async (req, res, next) => {
    try {
      const user = await adminService.updateUser(parseInt(req.params.id), req.body);
      res.json({ user });
    } catch (err) { next(err); }
  },

  deleteUser: async (req, res, next) => {
    try {
      const result = await adminService.deleteUser(parseInt(req.params.id));
      res.json(result);
    } catch (err) { next(err); }
  },

  listJobs: async (req, res, next) => {
    try {
      const { status, search } = req.query;
      const jobs = await adminService.listJobs({ status, search });
      res.json({ jobs });
    } catch (err) { next(err); }
  },

  deleteJob: async (req, res, next) => {
    try {
      const result = await adminService.deleteJob(parseInt(req.params.id));
      res.json(result);
    } catch (err) { next(err); }
  },
};

module.exports = AdminController;
