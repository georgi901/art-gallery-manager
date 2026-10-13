const request = require('supertest');

const app = require('../app');

describe('application smoke tests', () => {
  test('GET /api/health returns a successful health response', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        status: 'ok',
      },
      message: 'API is running',
    });
  });

  test('protected unknown API routes require authentication', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  test('protected write routes require authentication', async () => {
    const response = await request(app).post('/api/artists').send({
      NUME: 'Artist',
      PASSWORD: 'not-allowed',
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });
});
