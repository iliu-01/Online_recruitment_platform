const db = require('../config/db');

class AdminService {
  async getStats() {
    const [users, jobs, applications] = await Promise.all([
      db('users').count('id as total').first(),
      db('jobs').count('id as total').first(),
      db('applications').count('id as total').first(),
    ]);
    return {
      totalUsers: parseInt(users.total),
      totalJobs: parseInt(jobs.total),
      totalApplications: parseInt(applications.total),
    };
  }

  async listUsers(filters) {
    let q = db('users').select('id', 'email', 'role', 'created_at', 'updated_at');
    if (filters.role) q = q.where('role', filters.role);
    if (filters.search) q = q.where('email', 'ilike', `%${filters.search}%`);
    return q.orderBy('created_at', 'desc');
  }

  async updateUser(userId, data) {
    const allowed = ['role'];
    const filtered = {};
    allowed.forEach((k) => { if (data[k] !== undefined) filtered[k] = data[k]; });
    const [user] = await db('users').where({ id: userId }).update(filtered).returning(['id', 'email', 'role', 'created_at', 'updated_at']);
    if (!user) throw Object.assign(new Error('用户不存在'), { status: 404 });
    return user;
  }

  async deleteUser(userId) {
    const user = await db('users').where({ id: userId }).first();
    if (!user) throw Object.assign(new Error('用户不存在'), { status: 404 });
    if (user.role === 'admin') throw Object.assign(new Error('不能删除管理员账户'), { status: 403 });
    await db('users').where({ id: userId }).del();
    return { deleted: true };
  }

  async listJobs(filters) {
    let q = db('jobs').select(
      'jobs.*',
      db.raw("(SELECT email FROM users WHERE users.id = jobs.company_user_id) as company_email")
    );
    if (filters.status) q = q.where('jobs.status', filters.status);
    if (filters.search) q = q.where('jobs.title', 'ilike', `%${filters.search}%`);
    return q.orderBy('jobs.created_at', 'desc');
  }

  async deleteJob(jobId) {
    const job = await db('jobs').where({ id: jobId }).first();
    if (!job) throw Object.assign(new Error('职位不存在'), { status: 404 });
    await db('jobs').where({ id: jobId }).del();
    return { deleted: true };
  }
}

module.exports = new AdminService();
