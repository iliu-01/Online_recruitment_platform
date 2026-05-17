const db = require('../config/db');

const User = {
  findByEmail: (email) => db('users').where({ email }).first(),
  findById: (id) => db('users').where({ id }).first().select('id', 'email', 'role', 'created_at'),
  create: (data) => db('users').insert(data).returning(['id', 'email', 'role', 'created_at']),
};

module.exports = User;
