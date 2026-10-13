require('dotenv').config();

const app = require('./app');
const { closePool, initializePool, isDatabaseConfigured } = require('./db/oracle');

const port = Number(process.env.PORT || 3000);
let server;

async function start() {
  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
  ) {
    throw new Error('JWT_SECRET must contain at least 32 characters in production');
  }
  if (isDatabaseConfigured()) {
    await initializePool();
  } else {
    console.warn('Database is not configured; starting without an Oracle connection pool.');
  }

  server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  if (server) {
    server.close();
  }
  await closePool();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT').catch(() => process.exit(1)));
process.on('SIGTERM', () => shutdown('SIGTERM').catch(() => process.exit(1)));

start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
