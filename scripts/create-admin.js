require('dotenv').config();

const { closePool, execute, initializePool } = require('../db/oracle');
const { hashPassword } = require('../utils/auth');

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !email || !password) {
    throw new Error('ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  const passwordHash = await hashPassword(password);
  await initializePool();
  await execute(
    `INSERT INTO USERS (USERNAME, EMAIL, PASSWORD_HASH, ROLE)
     VALUES (:username, :email, :passwordHash, 'ADMIN')`,
    { username, email: email.toLowerCase(), passwordHash },
    { autoCommit: true }
  );
  console.log('Admin account created.');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => closePool().catch(() => {}));
