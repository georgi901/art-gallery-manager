const { execute } = require('../db/oracle');
const AppError = require('../utils/AppError');

const cascadeRelations = {
  SEDIU: [
    { table: 'SPONSORIZARE', column: 'ID_SEDIU', rule: 'CASCADE' },
    { table: 'EXPOZITIE', column: 'ID_SEDIU', rule: 'RESTRICT' },
  ],
  ARTIST: [{ table: 'OPERA', column: 'ID_ARTIST', rule: 'CASCADE' }],
  OPERA: [
    { table: 'EXPOZITIE_OPERA', column: 'ID_OPERA', rule: 'CASCADE' },
    { table: 'OPERA_PREMIU', column: 'ID_OPERA', rule: 'CASCADE' },
  ],
  EXPOZITIE: [{ table: 'EXPOZITIE_OPERA', column: 'ID_EXPOZITIE', rule: 'CASCADE' }],
  LOCATIE: [{ table: 'EXPOZITIE', column: 'ID_LOCATIE', rule: 'RESTRICT' }],
  SPONSOR: [{ table: 'SPONSORIZARE', column: 'ID_SPONSOR', rule: 'CASCADE' }],
  PREMIU: [{ table: 'OPERA_PREMIU', column: 'ID_PREMIU', rule: 'CASCADE' }],
};

const primaryKeys = {
  SEDIU: 'ID_SEDIU',
  ARTIST: 'ID_ARTIST',
  OPERA: 'ID_OPERA',
  EXPOZITIE: 'ID_EXPOZITIE',
  LOCATIE: 'ID_LOCATIE',
  SPONSOR: 'ID_SPONSOR',
  PREMIU: 'ID_PREMIU',
};

async function check(table, id) {
  const relations = cascadeRelations[table];
  const primaryKey = primaryKeys[table];
  if (!relations || !primaryKey) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Table is not allowed for cascade checks');
  }

  const affectedRecords = await Promise.all(
    relations.map(async (relation) => {
      const result = await execute(
        `SELECT COUNT(*) AS COUNT FROM ${relation.table} WHERE ${relation.column} = :id`,
        { id }
      );
      return {
        table: relation.table,
        rule: relation.rule,
        count: result.rows[0].COUNT,
      };
    })
  );

  return {
    table,
    primaryKey,
    id,
    affectedRecords,
  };
}

module.exports = {
  cascadeRelations,
  check,
};
