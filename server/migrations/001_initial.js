exports.up = function (knex) {
  return knex.schema
    .createTable('users', (t) => {
      t.increments('id').primary();
      t.string('email', 255).notNullable().unique();
      t.string('password_hash', 255).notNullable();
      t.string('role', 20).notNullable(); // 'job_seeker' | 'company'
      t.timestamps(true, true);
    })
    .createTable('online_resumes', (t) => {
      t.increments('id').primary();
      t.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.string('full_name', 100);
      t.string('email', 255);
      t.string('phone', 20);
      t.string('city', 50);
      t.jsonb('education').defaultTo('[]');
      t.jsonb('work_experience').defaultTo('[]');
      t.jsonb('skills').defaultTo('[]');
      t.text('self_intro');
      t.timestamps(true, true);
    })
    .createTable('resume_attachments', (t) => {
      t.increments('id').primary();
      t.integer('resume_id').unsigned().notNullable()
        .references('id').inTable('online_resumes').onDelete('CASCADE');
      t.string('file_name', 255).notNullable();
      t.string('file_path', 500).notNullable();
      t.integer('file_size').notNullable();
      t.timestamp('uploaded_at').defaultTo(knex.fn.now());
    })
    .createTable('jobs', (t) => {
      t.increments('id').primary();
      t.integer('company_user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.string('title', 200).notNullable();
      t.string('city', 50);
      t.integer('salary_min');
      t.integer('salary_max');
      t.string('experience_level', 50);
      t.string('education_level', 50);
      t.jsonb('description').defaultTo('{}');
      t.string('status', 20).defaultTo('open');
      t.timestamps(true, true);
    })
    .createTable('applications', (t) => {
      t.increments('id').primary();
      t.integer('job_id').unsigned().notNullable()
        .references('id').inTable('jobs').onDelete('CASCADE');
      t.integer('job_seeker_user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.integer('resume_id').unsigned().notNullable()
        .references('id').inTable('online_resumes').onDelete('CASCADE');
      t.string('status', 20).defaultTo('saved');
      t.text('cover_letter');
      t.timestamps(true, true);
    })
    .createTable('conversations', (t) => {
      t.increments('id').primary();
      t.integer('job_seeker_user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.integer('company_user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.integer('job_id').unsigned()
        .references('id').inTable('jobs').onDelete('SET NULL');
      t.timestamps(true, true);
      t.unique(['job_seeker_user_id', 'company_user_id', 'job_id']);
    })
    .createTable('messages', (t) => {
      t.increments('id').primary();
      t.integer('conversation_id').unsigned().notNullable()
        .references('id').inTable('conversations').onDelete('CASCADE');
      t.integer('sender_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.text('content').notNullable();
      t.boolean('is_read').defaultTo(false);
      t.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('notifications', (t) => {
      t.increments('id').primary();
      t.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      t.string('type', 50).notNullable();
      t.string('title', 200).notNullable();
      t.text('content');
      t.integer('related_id');
      t.boolean('is_read').defaultTo(false);
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('notifications')
    .dropTableIfExists('messages')
    .dropTableIfExists('conversations')
    .dropTableIfExists('applications')
    .dropTableIfExists('jobs')
    .dropTableIfExists('resume_attachments')
    .dropTableIfExists('online_resumes')
    .dropTableIfExists('users');
};
