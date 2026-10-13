const { isDatabaseConfigured } = require('../../db/oracle');

const databaseConfigured = isDatabaseConfigured();

(databaseConfigured ? describe : describe.skip)('Oracle database prerequisites', () => {
  test('database environment is configured for integration tests', () => {
    expect(databaseConfigured).toBe(true);
  });
});

if (!databaseConfigured) {
  console.warn(
    'Skipping Oracle integration tests: DB_USER, DB_PASSWORD and DB_CONNECT_STRING are not configured.'
  );
}
