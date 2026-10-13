const express = require('express');

const { dashboardHandler, reportHandler } = require('../controllers/report.controller');

const router = express.Router();

router.get('/dashboard/stats', dashboardHandler);
router.get('/stats/dashboard', dashboardHandler);

[
  'exposed-artworks',
  'artists-exposed',
  'top-artists',
  'galleries-by-exhibitions',
  'sponsors-by-value',
  'top-entry-fees',
  'unexhibited-artworks',
  'awarded-artists',
  'locations-capacity',
].forEach((name) => {
  router.get(`/reports/${name}`, reportHandler(name));
});

router.get('/rapoarte/opere-expuse', reportHandler('exposed-artworks'));
router.get('/rapoarte/artisti-expusi', reportHandler('artists-exposed'));

module.exports = router;
