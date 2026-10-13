const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const service = require('../services/auth.service');
const { publicUser, validateRole } = require('../utils/auth');
const { execute } = require('../db/oracle');

const register = asyncHandler(async (req, res) => {
  const data = await service.register(req.body);
  res.status(201).json({ data, message: 'Account created successfully' });
});

const login = asyncHandler(async (req, res) => {
  const data = await service.login(req.body);
  res.json({ data, message: 'Login successful' });
});

const me = asyncHandler(async (req, res) => {
  const user = await service.findById(req.user.sub);
  if (!user) throw new AppError(401, 'INVALID_TOKEN', 'Authentication token is invalid');
  res.json({ data: publicUser(user), message: 'Current user loaded successfully' });
});

const updateRole = asyncHandler(async (req, res) => {
  const role = String(req.body.role || '').toUpperCase();
  validateRole(role);
  const user = await service.findById(Number(req.params.id));
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');
  await execute(
    'UPDATE USERS SET ROLE = :role WHERE ID_USER = :id',
    {
      role,
      id: Number(req.params.id),
    },
    { autoCommit: true }
  );
  const updated = await service.findById(Number(req.params.id));
  res.json({ data: publicUser(updated), message: 'User role updated successfully' });
});

const logout = asyncHandler(async (req, res) => {
  res.json({ data: null, message: 'Logout completed; discard the token on the client' });
});

module.exports = {
  login,
  logout,
  me,
  register,
  updateRole,
};
