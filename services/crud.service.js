const { execute } = require('../db/oracle');
const fs = require('node:fs/promises');
const path = require('node:path');
const { mapOracleError } = require('../utils/oracleErrors');
const { paginationResult } = require('../utils/pagination');

function buildSearch(search, columns) {
  if (!search) return { clause: '', binds: {} };

  const escaped = String(search).replace(/([%_\\])/g, '\\$1');
  const conditions = columns.map(
    (column, index) => `UPPER(${column}) LIKE UPPER(:search${index}) ESCAPE '\\'`
  );
  const binds = Object.fromEntries(columns.map((_, index) => [`search${index}`, `%${escaped}%`]));
  return {
    clause: `AND (${conditions.join(' OR ')})`,
    binds,
  };
}

function normalizeDates(data, columns) {
  const result = { ...data };
  columns
    .filter((column) => column.startsWith('DATA_'))
    .forEach((column) => {
      if (result[column]) result[column] = new Date(`${result[column]}T00:00:00Z`);
    });
  return result;
}

async function list(resource, config, query, pageData, sortData) {
  const search = buildSearch(query.search, config.searchColumns);
  const countSql = `SELECT COUNT(*) AS TOTAL FROM ${config.table} WHERE 1 = 1 ${search.clause}`;
  const dataSql = `
    SELECT ${[config.primaryKey, ...config.columns].join(', ')}
    FROM ${config.table}
    WHERE 1 = 1 ${search.clause}
    ORDER BY ${sortData.sort} ${sortData.order}
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
  const [countResult, dataResult] = await Promise.all([
    execute(countSql, search.binds),
    execute(dataSql, { ...search.binds, offset: pageData.offset, limit: pageData.limit }),
  ]);
  return paginationResult(
    dataResult.rows,
    pageData.page,
    pageData.limit,
    countResult.rows[0].TOTAL
  );
}

async function findById(config, id) {
  const result = await execute(
    `SELECT ${[config.primaryKey, ...config.columns].join(', ')}
       FROM ${config.table}
      WHERE ${config.primaryKey} = :id`,
    { id }
  );
  return result.rows[0] || null;
}

async function create(config, data) {
  const fields = Object.keys(data);
  const columns = fields.join(', ');
  const bindNames = fields.map((field) => `:${field}`).join(', ');
  try {
    const result = await execute(
      `INSERT INTO ${config.table} (${columns}) VALUES (${bindNames}) RETURNING ${config.primaryKey} INTO :generatedId`,
      {
        ...normalizeDates(data, config.columns),
        generatedId: { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER },
      },
      { autoCommit: true }
    );
    return findById(config, result.outBinds.generatedId[0]);
  } catch (error) {
    throw mapOracleError(error);
  }
}

async function update(config, id, data) {
  const fields = Object.keys(data);
  if (fields.length === 0) return findById(config, id);
  const assignments = fields.map((field) => `${field} = :${field}`).join(', ');
  try {
    await execute(
      `UPDATE ${config.table} SET ${assignments} WHERE ${config.primaryKey} = :id`,
      { ...normalizeDates(data, config.columns), id },
      { autoCommit: true }
    );
    return findById(config, id);
  } catch (error) {
    throw mapOracleError(error);
  }
}

async function remove(config, id) {
  try {
    let imageUrl;
    if (config.table === 'OPERA') {
      const existing = await findById(config, id);
      imageUrl = existing?.IMAGE_URL;
    }
    const result = await execute(
      `DELETE FROM ${config.table} WHERE ${config.primaryKey} = :id`,
      { id },
      { autoCommit: true }
    );
    if (result.rowsAffected > 0 && imageUrl) {
      const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
      const filename = path.basename(imageUrl);
      await fs.unlink(path.join(uploadDir, filename)).catch(() => {});
    }
    return result.rowsAffected > 0;
  } catch (error) {
    throw mapOracleError(error);
  }
}

module.exports = {
  create,
  findById,
  list,
  remove,
  update,
};
