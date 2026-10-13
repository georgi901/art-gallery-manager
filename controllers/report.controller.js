const asyncHandler = require('../middleware/asyncHandler');
const service = require('../services/report.service');

function reportHandler(name) {
  return asyncHandler(async (req, res) => {
    const data = await service.runReport(name, req.query);
    res.json(data);
  });
}

const dashboardHandler = asyncHandler(async (req, res) => {
  const data = await service.dashboard();
  res.json({ data, message: 'Dashboard loaded successfully' });
});

module.exports = {
  dashboardHandler,
  reportHandler,
};
