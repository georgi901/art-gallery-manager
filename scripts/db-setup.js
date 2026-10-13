require('dotenv').config();

const fs = require('node:fs/promises');
const path = require('node:path');

const oracledb = require('oracledb');

const { closePool, getConnection, initializePool, isDatabaseConfigured } = require('../db/oracle');

const databaseDirectory = path.join(__dirname, '..', 'db');
const tables = [
  'USERS',
  'OPERA_PREMIU',
  'EXPOZITIE_OPERA',
  'SPONSORIZARE',
  'EXPOZITIE',
  'OPERA',
  'PREMIU',
  'SPONSOR',
  'LOCATIE',
  'ARTIST',
  'SEDIU',
];
const views = ['VIEW_STATISTICI_GALERII_PICTURA', 'VIEW_OPERE_ARTISTI'];

function parseStatements(contents) {
  return contents
    .split(';')
    .map((statement) => statement.replace(/--.*$/gm, '').trim())
    .filter(Boolean);
}

async function runFile(connection, filename) {
  const contents = await fs.readFile(path.join(databaseDirectory, filename), 'utf8');
  const statements = parseStatements(contents);

  for (const statement of statements) {
    await connection.execute(statement);
  }
}

async function objectExists(connection, objectName, objectType) {
  const result = await connection.execute(
    `SELECT COUNT(*) AS COUNT
       FROM USER_OBJECTS
      WHERE OBJECT_NAME = :objectName
        AND OBJECT_TYPE = :objectType`,
    {
      objectName,
      objectType,
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return result.rows[0].COUNT > 0;
}

async function dropObject(connection, statement, objectName, objectType) {
  if (!(await objectExists(connection, objectName, objectType))) {
    return;
  }

  await connection.execute(statement);
}

async function resetDatabase(connection) {
  for (const view of views) {
    await dropObject(connection, `DROP VIEW ${view}`, view, 'VIEW');
  }

  for (const table of tables) {
    await dropObject(connection, `DROP TABLE ${table} CASCADE CONSTRAINTS`, table, 'TABLE');
  }
}

async function setupDatabase({ reset = false, seed = true } = {}) {
  if (!isDatabaseConfigured()) {
    throw new Error('DB_USER, DB_PASSWORD and DB_CONNECT_STRING are required');
  }

  await initializePool();
  const connection = await getConnection();

  try {
    if (reset) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Database reset is disabled in production');
      }
      await resetDatabase(connection);
    }

    await runFile(connection, 'schema.sql');
    await runFile(connection, 'constraints.sql');
    await runFile(connection, 'views.sql');

    if (seed) {
      await runFile(connection, 'seed.sql');
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.close();
  }
}

async function main() {
  const reset = process.argv.includes('--reset');
  const seed = !process.argv.includes('--no-seed');

  await setupDatabase({ reset, seed });
  console.log(
    `Database setup completed${reset ? ' with reset' : ''}${seed ? ' and seed data' : ''}.`
  );
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    })
    .finally(() => closePool().catch(() => {}));
}

module.exports = {
  parseStatements,
  resetDatabase,
  setupDatabase,
};
