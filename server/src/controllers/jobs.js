const jobService = require('../services/jobs');

const JobController = {
  create: async (req, res, next) => {
    try {
      const job = await jobService.create(req.userId, req.body);
      res.status(201).json({ job });
    } catch (err) { next(err); }
  },
  update: async (req, res, next) => {
    try {
      const job = await jobService.update(parseInt(req.params.id), req.userId, req.body);
      res.json({ job });
    } catch (err) { next(err); }
  },
  get: async (req, res, next) => {
    try {
      const { keyword, city, salary_min, experience, page, page_size } = req.query;
      const result = await jobService.search({ keyword, city, salary_min, experience, page, page_size });
      res.json(result);
    } catch (err) { next(err); }
  },
  getById: async (req, res, next) => {
    try {
      const job = await jobService.getById(parseInt(req.params.id));
      res.json({ job });
    } catch (err) { next(err); }
  },
  getMine: async (req, res, next) => {
    try {
      const jobs = await jobService.getMine(req.userId);
      res.json({ jobs });
    } catch (err) { next(err); }
  },
  delete: async (req, res, next) => {
    try {
      const job = await jobService.close(parseInt(req.params.id), req.userId);
      res.json({ job });
    } catch (err) { next(err); }
  },
};

module.exports = JobController;
