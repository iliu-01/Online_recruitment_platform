const db = require('../config/db');

const Resume = {
  findByUserId: (userId) => db('online_resumes').where({ user_id: userId }).first(),
  upsert: (userId, data) => db('online_resumes')
    .insert({ ...data, user_id: userId })
    .onConflict('user_id')
    .merge(data)
    .returning('*'),

  countAttachments: (resumeId) => db('resume_attachments').where({ resume_id: resumeId }).count('id as count').first(),
  getAttachments: (resumeId) => db('resume_attachments').where({ resume_id: resumeId }),
  addAttachment: (data) => db('resume_attachments').insert(data).returning('*'),
  getAttachment: (id) => db('resume_attachments').where({ id }).first(),
  deleteAttachment: (id) => db('resume_attachments').where({ id }).del(),
};

module.exports = Resume;
