const db = require('../config/db');

const Conversation = {
  findOrCreate: (jobSeekerUserId, companyUserId, jobId) =>
    db('conversations')
      .insert({ job_seeker_user_id: jobSeekerUserId, company_user_id: companyUserId, job_id: jobId })
      .onConflict(['job_seeker_user_id', 'company_user_id', 'job_id'])
      .merge()
      .returning('*'),

  findByUser: (userId) =>
    db('conversations')
      .where('job_seeker_user_id', userId)
      .orWhere('company_user_id', userId)
      .orderBy('created_at', 'desc'),

  findById: (id) => db('conversations').where({ id }).first(),
};

module.exports = Conversation;
