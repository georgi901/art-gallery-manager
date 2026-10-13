const request = require('supertest');

const app = require('../app');
const { cascadeRelations } = require('../services/cascade.service');
const { reportQueries } = require('../services/report.service');

describe('advanced API guards', () => {
  test('unknown report is protected before route resolution', async () => {
    const response = await request(app).get('/api/reports/not-a-report');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  test('view creation route requires authentication before database access', async () => {
    const response = await request(app)
      .post('/api/views/create')
      .send({ sql: 'DROP TABLE ARTIST' });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  test('cascade configuration contains only known parent tables', () => {
    expect(Object.keys(cascadeRelations).sort()).toEqual([
      'ARTIST',
      'EXPOZITIE',
      'LOCATIE',
      'OPERA',
      'PREMIU',
      'SEDIU',
      'SPONSOR',
    ]);
  });

  test('reports use fixed server-side definitions', () => {
    expect(Object.keys(reportQueries)).toContain('unexhibited-artworks');
    expect(reportQueries['unexhibited-artworks'].sql).not.toContain('${');
  });
});
