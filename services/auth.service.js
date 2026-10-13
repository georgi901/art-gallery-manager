const { execute } = require('../db/oracle');
const AppError = require('../utils/AppError');
const { comparePassword, hashPassword, publicUser, signToken } = require('../utils/auth');

const AUTH_FAILURE = new AppError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');

async function findByLogin(login) {
  const result = await execute(
    `SELECT ID_USER, USERNAME, EMAIL, PASSWORD_HASH, ROLE
       FROM USERS
      WHERE USERNAME = :login OR LOWER(EMAIL) = LOWER(:login)`,
    { login }
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await execute(
    `SELECT ID_USER, USERNAME, EMAIL, ROLE
       FROM USERS
      WHERE ID_USER = :id`,
    { id }
  );
  return result.rows[0] || null;
}

async function register({ username, email, password }) {
  if (!username || !email) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Username and email are required', {
      username: 'This field is required',
      email: 'This field is required',
    });
  }
  const passwordHash = await hashPassword(password);
  try {
    const result = await execute(
      `INSERT INTO USERS (USERNAME, EMAIL, PASSWORD_HASH, ROLE)
       VALUES (:username, :email, :passwordHash, 'VIEWER')
       RETURNING ID_USER INTO :id`,
      {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        id: { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER },
      },
      { autoCommit: true }
    );
    const user = await findById(result.outBinds.id[0]);
    return { user: publicUser(user), token: signToken(user) };
  } catch (error) {
    if (error.message?.includes('ORA-00001')) {
      throw new AppError(409, 'CONFLICT', 'Username or email already exists');
    }
    throw error;
  }
}

async function login({ username, password }) {
  const user = username ? await findByLogin(username.trim()) : null;
  const valid = user ? await comparePassword(password || '', user.PASSWORD_HASH) : false;
  if (!valid) throw AUTH_FAILURE;
  return { user: publicUser(user), token: signToken(user) };
}

module.exports = {
  findById,
  login,
  register,
};
