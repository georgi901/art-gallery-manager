const { execute } = require('../db/oracle');
const { mapOracleError } = require('../utils/oracleErrors');

async function list(config) {
  const result = await execute(`SELECT ${config.columns.join(', ')} FROM ${config.table}`);
  return result.rows;
}

async function create(config, data) {
  const fields = Object.keys(data);
  const bindNames = fields.map((field) => `:${field}`).join(', ');
  try {
    await execute(
      `INSERT INTO ${config.table} (${fields.join(', ')}) VALUES (${bindNames})`,
      data,
      { autoCommit: true }
    );
    return data;
  } catch (error) {
    throw mapOracleError(error);
  }
}

async function remove(config, values) {
  const clauses = config.primaryKeys.map((key) => `${key} = :${key}`);
  try {
    const result = await execute(
      `DELETE FROM ${config.table} WHERE ${clauses.join(' AND ')}`,
      values,
      { autoCommit: true }
    );
    return result.rowsAffected > 0;
  } catch (error) {
    throw mapOracleError(error);
  }
}

module.exports = {
  create,
  list,
  remove,
};
