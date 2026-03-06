import EmbeddedPostgres from 'embedded-postgres';

const pg = new EmbeddedPostgres({
  databaseDir: '/tmp/pg-taskflow',
  user: 'postgres',
  password: 'postgres',
  port: 5432,
  persistent: true,
});

try {
  await pg.initialise();
} catch (e) {
  console.log('Init:', e?.message || e);
}

try {
  await pg.start();
  console.log('PostgreSQL started');
} catch (e) {
  console.error('Start failed:', e?.message || e);
  process.exit(1);
}

try {
  await pg.createDatabase('taskflow');
  console.log('Database taskflow created');
} catch (e) {
  console.log('DB create:', e?.message || 'already exists');
}

console.log('Ready: postgresql://postgres:postgres@localhost:5432/taskflow');

process.on('SIGINT', async () => { await pg.stop(); process.exit(0); });
setInterval(() => {}, 60000);
