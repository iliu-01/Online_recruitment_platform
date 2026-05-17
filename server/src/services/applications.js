const Application = require('../models/application');
const Job = require('../models/job');

class ApplicationService {
  async apply(jobSeekerUserId, { job_id, resume_id, cover_letter, status }) {
    const job = await Job.findById(job_id);
    if (!job || job.status !== 'open') throw Object.assign(new Error('职位不存在或已关闭'), { status: 400 });

    const [app] = await Application.create({
      job_id,
      job_seeker_user_id: jobSeekerUserId,
      resume_id,
      cover_letter: cover_letter || '',
      status: status || 'delivered',
    });
    return app;
  }

  async getMine(jobSeekerUserId, status) {
    return Application.findBySeeker(jobSeekerUserId, status);
  }

  async getReceived(companyUserId, jobId) {
    return Application.findByCompany(companyUserId, jobId);
  }

  async updateStatus(companyUserId, applicationId, newStatus) {
    const app = await Application.findById(applicationId);
    if (!app) throw Object.assign(new Error('投递不存在'), { status: 404 });

    const job = await Job.findById(app.job_id);
    if (job.company_user_id !== companyUserId) {
      throw Object.assign(new Error('无权操作'), { status: 403 });
    }

    const validTransitions = {
      delivered: ['interviewing', 'rejected'],
      interviewing: ['offered', 'rejected'],
      offered: ['accepted', 'rejected'],
      accepted: [],
      rejected: [],
      saved: ['delivered'],
    };

    if (!validTransitions[app.status]?.includes(newStatus)) {
      throw Object.assign(new Error(`不能从 ${app.status} 变更到 ${newStatus}`), { status: 400 });
    }

    return Application.updateStatus(applicationId, newStatus);
  }
}

module.exports = new ApplicationService();
