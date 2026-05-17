const applicationService = require('../services/applications');

const ApplicationController = {
  apply: async (req, res, next) => {
    try {
      const app = await applicationService.apply(req.userId, req.body);
      res.status(201).json({ application: app });
    } catch (err) { next(err); }
  },
  getMine: async (req, res, next) => {
    try {
      const applications = await applicationService.getMine(req.userId, req.query.status);
      res.json({ applications });
    } catch (err) { next(err); }
  },
  getReceived: async (req, res, next) => {
    try {
      const applications = await applicationService.getReceived(req.userId, req.query.job_id);
      res.json({ applications });
    } catch (err) { next(err); }
  },
  updateStatus: async (req, res, next) => {
    try {
      const result = await applicationService.updateStatus(req.userId, parseInt(req.params.id), req.body.status);
      res.json({ application: result[0] });
    } catch (err) { next(err); }
  },
};

module.exports = ApplicationController;
