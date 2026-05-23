const Job = require('../models/job');

class JobService {
  async create(companyUserId, data) {
    const [job] = await Job.create({ ...data, company_user_id: companyUserId });
    return job;
  }

  async update(jobId, companyUserId, data) {
    const [job] = await Job.update(jobId, companyUserId, data);
    if (!job) throw Object.assign(new Error('职位不存在或无权操作'), { status: 404 });
    return job;
  }

  async getById(jobId) {
    const job = await Job.findById(jobId);
    if (!job) throw Object.assign(new Error('职位不存在'), { status: 404 });
    return job;
  }

  async getMine(companyUserId) {
    return Job.findByCompany(companyUserId);
  }

  async search(filters) {
    const [jobs, { total }] = await Promise.all([
      Job.search(filters),
      Job.searchCount(filters),
    ]);
    return { items: jobs, total: parseInt(total), page: parseInt(filters.page || 1) };
  }

  async close(jobId, companyUserId) {
    const [job] = await Job.close(jobId, companyUserId);
    if (!job) throw Object.assign(new Error('职位不存在或无权操作'), { status: 404 });
    return job;
  }
}

module.exports = new JobService();
