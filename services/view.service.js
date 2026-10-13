const { execute } = require('../db/oracle');
const AppError = require('../utils/AppError');

const views = {
  VIEW_OPERE_ARTISTI: {
    columns:
      'ID_OPERA, TITLU, AN_REALIZARE, TEHNICA, SUPORT, INALTIME_CM, LATIME_CM, ID_ARTIST, ARTIST_NUME, NATIONALITATE',
  },
  VIEW_STATISTICI_GALERII_PICTURA: {
    columns:
      'ID_SEDIU, SEDIU_NUME, NUMAR_OPERE, NUMAR_ARTISTI, SUPRAFATA_MEDIE_CM2, CEA_MAI_MARE_OPERA_CM2',
  },
};

async function listViews() {
  const result = await execute(
    `SELECT VIEW_NAME FROM USER_VIEWS WHERE VIEW_NAME IN (:firstView, :secondView) ORDER BY VIEW_NAME`,
    {
      firstView: 'VIEW_OPERE_ARTISTI',
      secondView: 'VIEW_STATISTICI_GALERII_PICTURA',
    }
  );
  return result.rows;
}

async function readView(viewName, page, limit) {
  const config = views[viewName];
  if (!config) throw new AppError(404, 'NOT_FOUND', 'View not found');
  const offset = (page - 1) * limit;
  const rows = await execute(
    `SELECT ${config.columns} FROM ${viewName} OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
    { offset, limit }
  );
  const count = await execute(`SELECT COUNT(*) AS TOTAL FROM ${viewName}`);
  return {
    data: rows.rows,
    pagination: {
      page,
      limit,
      total: count.rows[0].TOTAL,
      totalPages: Math.ceil(count.rows[0].TOTAL / limit),
    },
  };
}

async function recreateViews() {
  const sql = [
    `CREATE OR REPLACE VIEW VIEW_OPERE_ARTISTI AS
     SELECT o.ID_OPERA, o.TITLU, o.AN_REALIZARE, o.TEHNICA, o.SUPORT,
            o.INALTIME_CM, o.LATIME_CM, a.ID_ARTIST,
            a.NUME AS ARTIST_NUME, a.NATIONALITATE
       FROM OPERA o JOIN ARTIST a ON a.ID_ARTIST = o.ID_ARTIST`,
    `CREATE OR REPLACE VIEW VIEW_STATISTICI_GALERII_PICTURA AS
     SELECT s.ID_SEDIU, s.NUME AS SEDIU_NUME,
            COUNT(DISTINCT o.ID_OPERA) AS NUMAR_OPERE,
            COUNT(DISTINCT a.ID_ARTIST) AS NUMAR_ARTISTI,
            ROUND(AVG(o.INALTIME_CM * o.LATIME_CM), 2) AS SUPRAFATA_MEDIE_CM2,
            MAX(o.INALTIME_CM * o.LATIME_CM) AS CEA_MAI_MARE_OPERA_CM2
       FROM SEDIU s
       JOIN EXPOZITIE e ON e.ID_SEDIU = s.ID_SEDIU
       JOIN EXPOZITIE_OPERA eo ON eo.ID_EXPOZITIE = e.ID_EXPOZITIE
       JOIN OPERA o ON o.ID_OPERA = eo.ID_OPERA
       JOIN ARTIST a ON a.ID_ARTIST = o.ID_ARTIST
      WHERE LOWER(s.TIP_GALERIE) = 'pictura'
      GROUP BY s.ID_SEDIU, s.NUME
      HAVING COUNT(DISTINCT o.ID_OPERA) >= 1`,
  ];

  for (const statement of sql) {
    await execute(statement, {}, { autoCommit: true });
  }
  return listViews();
}

module.exports = {
  listViews,
  readView,
  recreateViews,
};
