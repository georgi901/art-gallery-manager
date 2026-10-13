const { execute } = require('../db/oracle');
const { paginationResult, parsePagination } = require('../utils/pagination');
const AppError = require('../utils/AppError');

const reportQueries = {
  'exposed-artworks': {
    sql: `
      SELECT o.ID_OPERA, o.TITLU AS OPERA_TITLU, a.NUME AS ARTIST_NUME,
             e.ID_EXPOZITIE, e.NUME AS EXPOZITIE_NUME, e.TAXA_INTRARE,
             e.DATA_START, e.DATA_SFARSIT, s.NUME AS SEDIU_NUME, l.NUME AS LOCATIE_NUME
        FROM OPERA o
        JOIN ARTIST a ON a.ID_ARTIST = o.ID_ARTIST
        JOIN EXPOZITIE_OPERA eo ON eo.ID_OPERA = o.ID_OPERA
        JOIN EXPOZITIE e ON e.ID_EXPOZITIE = eo.ID_EXPOZITIE
        JOIN SEDIU s ON s.ID_SEDIU = e.ID_SEDIU
        JOIN LOCATIE l ON l.ID_LOCATIE = e.ID_LOCATIE
       WHERE e.TAXA_INTRARE >= :taxaMin
         AND EXTRACT(YEAR FROM e.DATA_START) >= :anStart
       ORDER BY e.DATA_START DESC`,
    validate(query) {
      return {
        taxaMin: nonNegativeNumber(query.taxaMin, 'taxaMin'),
        anStart: integerNumber(query.anStart, 'anStart'),
      };
    },
  },
  'artists-exposed': {
    sql: `
      SELECT a.ID_ARTIST, a.NUME, COUNT(DISTINCT o.ID_OPERA) AS NUMAR_OPERE,
             COUNT(eo.ID_OPERA) AS TOTAL_EXPUNERI
        FROM ARTIST a
        JOIN OPERA o ON o.ID_ARTIST = a.ID_ARTIST
        JOIN EXPOZITIE_OPERA eo ON eo.ID_OPERA = o.ID_OPERA
       GROUP BY a.ID_ARTIST, a.NUME
      HAVING COUNT(eo.ID_OPERA) >= :minExpuneri
       ORDER BY TOTAL_EXPUNERI DESC`,
    validate(query) {
      return { minExpuneri: positiveInteger(query.minExpuneri, 'minExpuneri') };
    },
  },
  'top-artists': {
    sql: `
      SELECT a.ID_ARTIST, a.NUME, COUNT(eo.ID_OPERA) AS TOTAL_EXPUNERI
        FROM ARTIST a
        JOIN OPERA o ON o.ID_ARTIST = a.ID_ARTIST
        JOIN EXPOZITIE_OPERA eo ON eo.ID_OPERA = o.ID_OPERA
       GROUP BY a.ID_ARTIST, a.NUME
       ORDER BY TOTAL_EXPUNERI DESC`,
    validate: () => ({}),
  },
  'galleries-by-exhibitions': {
    sql: `
      SELECT s.ID_SEDIU, s.NUME AS SEDIU_NUME, COUNT(e.ID_EXPOZITIE) AS NUMAR_EXPOZITII
        FROM SEDIU s
        LEFT JOIN EXPOZITIE e ON e.ID_SEDIU = s.ID_SEDIU
       GROUP BY s.ID_SEDIU, s.NUME
       ORDER BY NUMAR_EXPOZITII DESC`,
    validate: () => ({}),
  },
  'sponsors-by-value': {
    sql: `
      SELECT sp.ID_SPONSOR, sp.NUME AS SPONSOR_NUME,
             COALESCE(SUM(s.SUMA_SPONSORIZARE), 0) AS TOTAL_SPONSORIZARI
        FROM SPONSOR sp
        LEFT JOIN SPONSORIZARE s ON s.ID_SPONSOR = sp.ID_SPONSOR
       GROUP BY sp.ID_SPONSOR, sp.NUME
       ORDER BY TOTAL_SPONSORIZARI DESC`,
    validate: () => ({}),
  },
  'top-entry-fees': {
    sql: `
      SELECT ID_EXPOZITIE, NUME, TAXA_INTRARE, DATA_START, DATA_SFARSIT
        FROM EXPOZITIE
       ORDER BY TAXA_INTRARE DESC`,
    validate: () => ({}),
  },
  'unexhibited-artworks': {
    sql: `
      SELECT o.ID_OPERA, o.TITLU, o.ID_ARTIST
        FROM OPERA o
       WHERE NOT EXISTS (
         SELECT 1 FROM EXPOZITIE_OPERA eo WHERE eo.ID_OPERA = o.ID_OPERA
       )
       ORDER BY o.TITLU`,
    validate: () => ({}),
  },
  'awarded-artists': {
    sql: `
      SELECT DISTINCT a.ID_ARTIST, a.NUME
        FROM ARTIST a
        JOIN OPERA o ON o.ID_ARTIST = a.ID_ARTIST
        JOIN OPERA_PREMIU op ON op.ID_OPERA = o.ID_OPERA
       ORDER BY a.NUME`,
    validate: () => ({}),
  },
  'locations-capacity': {
    sql: `
      SELECT l.ID_LOCATIE, l.NUME AS LOCATIE_NUME, l.CAPACITATE_MAXIMA,
             COUNT(e.ID_EXPOZITIE) AS NUMAR_EXPOZITII
        FROM LOCATIE l
        LEFT JOIN EXPOZITIE e ON e.ID_LOCATIE = l.ID_LOCATIE
       GROUP BY l.ID_LOCATIE, l.NUME, l.CAPACITATE_MAXIMA
       ORDER BY l.CAPACITATE_MAXIMA DESC`,
    validate: () => ({}),
  },
};

function positiveInteger(value, field) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new AppError(400, 'VALIDATION_ERROR', `${field} must be a positive integer`, {
      [field]: 'Must be a positive integer',
    });
  }
  return number;
}

function integerNumber(value, field) {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    throw new AppError(400, 'VALIDATION_ERROR', `${field} must be an integer`, {
      [field]: 'Must be an integer',
    });
  }
  return number;
}

function nonNegativeNumber(value, field) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number < 0) {
    throw new AppError(400, 'VALIDATION_ERROR', `${field} must be non-negative`, {
      [field]: 'Must be non-negative',
    });
  }
  return number;
}

async function runReport(name, query) {
  const report = reportQueries[name];
  if (!report) throw new AppError(404, 'NOT_FOUND', 'Report not found');
  const binds = report.validate(query);
  const pageData = parsePagination(query);
  const pagedSql = `SELECT * FROM (${report.sql}) report_rows OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
  const countSql = `SELECT COUNT(*) AS TOTAL FROM (${report.sql}) report_rows`;
  const [rows, count] = await Promise.all([
    execute(pagedSql, { ...binds, offset: pageData.offset, limit: pageData.limit }),
    execute(countSql, binds),
  ]);
  return paginationResult(rows.rows, pageData.page, pageData.limit, count.rows[0].TOTAL);
}

async function dashboard() {
  const queries = {
    galleries: 'SELECT COUNT(*) AS TOTAL FROM SEDIU',
    artists: 'SELECT COUNT(*) AS TOTAL FROM ARTIST',
    artworks: 'SELECT COUNT(*) AS TOTAL FROM OPERA',
    exhibitions: 'SELECT COUNT(*) AS TOTAL FROM EXPOZITIE',
    locations: 'SELECT COUNT(*) AS TOTAL FROM LOCATIE',
    sponsors: 'SELECT COUNT(*) AS TOTAL FROM SPONSOR',
    awards: 'SELECT COUNT(*) AS TOTAL FROM PREMIU',
    entryFees: 'SELECT COALESCE(SUM(TAXA_INTRARE), 0) AS TOTAL FROM EXPOZITIE',
    sponsorships: 'SELECT COALESCE(SUM(SUMA_SPONSORIZARE), 0) AS TOTAL FROM SPONSORIZARE',
    artworksByArtist: `
      SELECT a.NUME AS LABEL, COUNT(o.ID_OPERA) AS VALUE
        FROM ARTIST a LEFT JOIN OPERA o ON o.ID_ARTIST = a.ID_ARTIST
       GROUP BY a.NUME ORDER BY VALUE DESC`,
    exhibitionsByYear: `
      SELECT EXTRACT(YEAR FROM DATA_START) AS LABEL, COUNT(*) AS VALUE
        FROM EXPOZITIE GROUP BY EXTRACT(YEAR FROM DATA_START) ORDER BY LABEL`,
    sponsorshipsByGallery: `
      SELECT s.NUME AS LABEL, COALESCE(SUM(sp.SUMA_SPONSORIZARE), 0) AS VALUE
        FROM SEDIU s LEFT JOIN SPONSORIZARE sp ON sp.ID_SEDIU = s.ID_SEDIU
       GROUP BY s.NUME ORDER BY VALUE DESC`,
    artworksByTechnique: `
      SELECT TEHNICA AS LABEL, COUNT(*) AS VALUE
        FROM OPERA GROUP BY TEHNICA ORDER BY VALUE DESC`,
    exhibitionsByLocation: `
      SELECT l.NUME AS LABEL, COUNT(e.ID_EXPOZITIE) AS VALUE
        FROM LOCATIE l LEFT JOIN EXPOZITIE e ON e.ID_LOCATIE = l.ID_LOCATIE
       GROUP BY l.NUME ORDER BY VALUE DESC`,
  };

  const entries = await Promise.all(
    Object.entries(queries).map(async ([name, sql]) => [name, (await execute(sql)).rows])
  );
  const result = Object.fromEntries(entries);
  return {
    totals: Object.fromEntries(
      [
        'galleries',
        'artists',
        'artworks',
        'exhibitions',
        'locations',
        'sponsors',
        'awards',
        'entryFees',
        'sponsorships',
      ].map((key) => [key, result[key][0].TOTAL])
    ),
    series: {
      artworksByArtist: result.artworksByArtist,
      exhibitionsByYear: result.exhibitionsByYear,
      sponsorshipsByGallery: result.sponsorshipsByGallery,
      artworksByTechnique: result.artworksByTechnique,
      exhibitionsByLocation: result.exhibitionsByLocation,
    },
  };
}

module.exports = {
  dashboard,
  reportQueries,
  runReport,
};
