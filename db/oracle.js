const oracledb = require('oracledb');

const AppError = require('../utils/AppError');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool;

function isDatabaseConfigured() {
  return Boolean(process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_CONNECT_STRING);
}

async function initializePool() {
  if (pool) {
    return pool;
  }

  if (!isDatabaseConfigured()) {
    throw new AppError(500, 'DATABASE_NOT_CONFIGURED', 'Database configuration is incomplete');
  }

  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 1,
      poolMax: 5,
      poolIncrement: 1,
      poolTimeout: 60,
      enableStatistics: false,
    });
    return pool;
  } catch {
    throw new AppError(500, 'DATABASE_POOL_ERROR', 'Could not initialize database pool');
  }
}

async function getConnection() {
  if (!pool) {
    await initializePool();
  }

  try {
    return await pool.getConnection();
  } catch {
    throw new AppError(503, 'DATABASE_CONNECTION_ERROR', 'Could not acquire database connection');
  }
}

async function execute(sql, binds = {}, options = {}) {
  let connection;

  try {
    connection = await getConnection();
    return await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: options.autoCommit ?? false,
      ...options,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error.message?.includes('ORA-00001')) {
      throw new AppError(409, 'CONFLICT', 'A record with these unique values already exists');
    }
    if (error.message?.includes('ORA-02291')) {
      throw new AppError(400, 'FOREIGN_KEY_ERROR', 'A referenced record does not exist');
    }
    if (error.message?.includes('ORA-02292')) {
      throw new AppError(409, 'DEPENDENCY_CONFLICT', 'The record has dependent records');
    }
    if (error.message?.includes('ORA-02290')) {
      throw new AppError(400, 'VALIDATION_ERROR', 'The data violates a database constraint');
    }
    throw new AppError(500, 'DATABASE_QUERY_ERROR', 'Database query failed');
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function withTransaction(callback) {
  let connection;

  try {
    connection = await getConnection();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error instanceof AppError
      ? error
      : new AppError(500, 'DATABASE_TRANSACTION_ERROR', 'Database transaction failed');
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

async function closePool() {
  if (pool) {
    await pool.close(10);
    pool = undefined;
  }
}

module.exports = {
  closePool,
  execute,
  getConnection,
  initializePool,
  isDatabaseConfigured,
  withTransaction,
};
