const resumeService = require('../services/resume');

const ResumeController = {
  get: async (req, res, next) => {
    try {
      const data = await resumeService.getResume(req.userId);
      res.json({ resume: data });
    } catch (err) { next(err); }
  },

  upsert: async (req, res, next) => {
    try {
      const resume = await resumeService.upsertResume(req.userId, req.body);
      res.json({ resume });
    } catch (err) { next(err); }
  },

  uploadAttachment: async (req, res, next) => {
    try {
      const attachment = await resumeService.uploadAttachment(req.userId, req.file);
      res.status(201).json({ attachment });
    } catch (err) { next(err); }
  },

  deleteAttachment: async (req, res, next) => {
    try {
      const result = await resumeService.deleteAttachment(req.userId, parseInt(req.params.id));
      res.json(result);
    } catch (err) { next(err); }
  },

  downloadAttachment: async (req, res, next) => {
    try {
      const attachment = await resumeService.getAttachmentFile(parseInt(req.params.id));
      res.download(attachment.file_path, attachment.file_name);
    } catch (err) { next(err); }
  },
};

module.exports = ResumeController;
