const jwt = require('jsonwebtoken');

const { hashPassword, validatePassword, validateRole } = require('../utils/auth');

describe('authentication helpers', () => {
  test('hashes passwords with bcrypt and never returns the clear text', async () => {
    const password = 'securepass123';
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(hash).not.toBe(password);
  });

  test('rejects weak passwords', () => {
    expect(() => validatePassword('short')).toThrow('Password must contain');
  });

  test('accepts only supported roles', () => {
    expect(() => validateRole('VIEWER')).not.toThrow();
    expect(() => validateRole('ADMIN')).not.toThrow();
    expect(() => validateRole('UNKNOWN')).toThrow('Invalid role');
  });

  test('creates a token payload containing the user role', () => {
    process.env.JWT_SECRET = 'test-secret';
    const token = jwt.sign({ sub: 1, role: 'VIEWER' }, process.env.JWT_SECRET);
    expect(jwt.verify(token, process.env.JWT_SECRET).role).toBe('VIEWER');
  });
});
