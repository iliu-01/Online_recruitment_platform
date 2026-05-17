const db = require('../config/db');

const Job = {
  create: (data) => db('jobs').insert(data).returning('*'),
  update: (id, companyUserId, data) => db('jobs').where({ id, company_user_id: companyUserId }).update(data).returning('*'),
  findById: (id) => db('jobs').where({ id }).first(),
  findByCompany: (companyUserId) => db('jobs').where({ company_user_id: companyUserId }).orderBy('created_at', 'desc'),
  search: (filters) => {
    let query = db('jobs').where({ status: 'open' });
    if (filters.keyword) query = query.where('title', 'ilike', `%${filters.keyword}%`);
    if (filters.city) query = query.where('city', 'ilike', `%${filters.city}%`);
    if (filters.salary_min) query = query.where('salary_max', '>=', filters.salary_min);
    if (filters.experience) query = query.where('experience_level', filters.experience);
    return query.orderBy('created_at', 'desc')
      .limit(filters.page_size || 20)
      .offset(((filters.page || 1) - 1) * (filters.page_size || 20));
  },
  searchCount: (filters) => {
    let query = db('jobs').where({ status: 'open' });
    if (filters.keyword) query = query.where('title', 'ilike', `%${filters.keyword}%`);
    if (filters.city) query = query.where('city', 'ilike', `%${filters.city}%`);
    if (filters.salary_min) query = query.where('salary_max', '>=', filters.salary_min);
    if (filters.experience) query = query.where('experience_level', filters.experience);
    return query.count('id as total').first();
  },
  delete: (id, companyUserId) => db('jobs').where({ id, company_user_id: companyUserId }).update({ status: 'closed' }),
};

module.exports = Job;
