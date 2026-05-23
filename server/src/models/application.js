const db = require('../config/db');

const Application = {
  create: (data) => db('applications').insert(data).returning('*'),
  findBySeeker: (userId, status) => {
    let q = db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .where('applications.job_seeker_user_id', userId)
      .select('applications.*', 'jobs.title as job_title', 'jobs.city as job_city', 'jobs.company_user_id');
    if (status) q = q.where('applications.status', status);
    return q.orderBy('applications.created_at', 'desc');
  },
  findByCompany: (companyUserId, jobId) => {
    let q = db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('online_resumes', 'applications.resume_id', 'online_resumes.id')
      .where('jobs.company_user_id', companyUserId)
      .select(
        'applications.id', 'applications.job_id', 'applications.job_seeker_user_id',
        'applications.resume_id', 'applications.status', 'applications.cover_letter',
        'applications.created_at', 'applications.updated_at',
        'jobs.title as job_title', 'online_resumes.full_name as seeker_name'
      );
    if (jobId) q = q.where('applications.job_id', jobId);
    return q.orderBy('applications.created_at', 'desc');
  },
  findById: (id) => db('applications').where({ id }).first(),
  updateStatus: (id, status) => db('applications').where({ id }).update({ status, updated_at: db.fn.now() }).returning('*'),
};

module.exports = Application;
