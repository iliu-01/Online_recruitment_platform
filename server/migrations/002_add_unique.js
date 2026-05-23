exports.up = function (knex) {
  return knex.schema.alterTable('online_resumes', (t) => {
    t.unique('user_id');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('online_resumes', (t) => {
    t.dropUnique('user_id');
  });
};
