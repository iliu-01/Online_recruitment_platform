const Resume = require('../models/resume');
const config = require('../config');

class ResumeService {
  async getResume(userId) {
    const resume = await Resume.findByUserId(userId);
    if (!resume) return null;
    const attachments = await Resume.getAttachments(resume.id);
    return { ...resume, attachments };
  }

  async upsertResume(userId, data) {
    const allowed = ['full_name', 'email', 'phone', 'city', 'education', 'work_experience', 'skills', 'self_intro'];
    const jsonFields = ['education', 'work_experience', 'skills'];
    const filtered = {};
    allowed.forEach((k) => {
      if (data[k] !== undefined) {
        filtered[k] = jsonFields.includes(k) ? JSON.stringify(data[k]) : data[k];
      }
    });
    const [resume] = await Resume.upsert(userId, filtered);
    const attachments = await Resume.getAttachments(resume.id);
    return { ...resume, attachments };
  }

  async uploadAttachment(userId, file) {
    const resume = await Resume.findByUserId(userId);
    if (!resume) throw Object.assign(new Error('请先创建在线简历'), { status: 400 });

    const { count } = await Resume.countAttachments(resume.id);
    if (parseInt(count) >= config.upload.maxFiles) {
      throw Object.assign(new Error(`最多上传${config.upload.maxFiles}份附件`), { status: 400 });
    }

    // 修复中文文件名编码
    let fileName = file.originalname;
    try {
      fileName = Buffer.from(fileName, 'latin1').toString('utf8');
    } catch (e) { /* keep original */ }

    const [attachment] = await Resume.addAttachment({
      resume_id: resume.id,
      file_name: fileName,
      file_path: file.path,
      file_size: file.size,
    });
    return attachment;
  }

  async deleteAttachment(userId, attachmentId) {
    const resume = await Resume.findByUserId(userId);
    if (!resume) throw Object.assign(new Error('简历不存在'), { status: 404 });

    const attachment = await Resume.getAttachment(attachmentId);
    if (!attachment || attachment.resume_id !== resume.id) {
      throw Object.assign(new Error('附件不存在'), { status: 404 });
    }

    const fs = require('fs');
    fs.unlink(attachment.file_path, () => {});
    await Resume.deleteAttachment(attachmentId);
    return { deleted: true };
  }

  async getAttachmentFile(attachmentId) {
    const attachment = await Resume.getAttachment(attachmentId);
    if (!attachment) throw Object.assign(new Error('附件不存在'), { status: 404 });
    return attachment;
  }
}

module.exports = new ResumeService();
