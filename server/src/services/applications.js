const Application = require('../models/application');
const Job = require('../models/job');
const notificationService = require('./notifications');
const { getIO } = require('../socket');

const STATUS_LABELS = {
  delivered: '已投递',
  interviewing: '面试中',
  offered: '已发Offer',
  accepted: '已接受',
  rejected: '已拒绝',
};

class ApplicationService {
  async apply(jobSeekerUserId, { job_id, resume_id, cover_letter, status }) {
    const job = await Job.findById(job_id);
    if (!job || job.status !== 'open') throw Object.assign(new Error('职位不存在或已关闭'), { status: 400 });

    // 检查是否已投递
    const existing = await Application.findBySeeker(jobSeekerUserId);
    const alreadyApplied = existing.find((a) => a.job_id === parseInt(job_id));
    if (alreadyApplied) throw Object.assign(new Error('您已向该职位投递过，请勿重复投递'), { status: 409 });

    const [app] = await Application.create({
      job_id,
      job_seeker_user_id: jobSeekerUserId,
      resume_id,
      cover_letter: cover_letter || '',
      status: status || 'delivered',
    });

    // 通知公司方：收到新投递
    try {
      const notif = await notificationService.create(
        job.company_user_id,
        'new_application',
        '收到新投递',
        `有求职者投递了职位「${job.title}」`,
        app.id
      );
      const io = getIO();
      if (io) io.to(`user:${job.company_user_id}`).emit('notification', {
        id: notif.id, type: notif.type, title: notif.title, content: notif.content, createdAt: notif.created_at,
      });
    } catch (e) { console.error('通知发送失败:', e.message); }

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

    const result = await Application.updateStatus(applicationId, newStatus);

    // 通知求职者：状态变更
    try {
      const label = STATUS_LABELS[newStatus] || newStatus;
      const notif = await notificationService.create(
        app.job_seeker_user_id,
        'status_change',
        '投递状态更新',
        `职位「${job.title}」状态已更新为：${label}`,
        app.id
      );
      const io = getIO();
      if (io) io.to(`user:${app.job_seeker_user_id}`).emit('notification', {
        id: notif.id, type: notif.type, title: notif.title, content: notif.content, createdAt: notif.created_at,
      });
    } catch (e) { console.error('通知发送失败:', e.message); }

    return result;
  }
}

module.exports = new ApplicationService();
