const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    city: req.query.city || 'Abidjan',
    total_today: 24,
    by_category: {
      crime: 9,
      accident: 7,
      medical: 5,
      incendie: 2,
      autre: 1
    },
    avg_severity: 6.2,
    resolution_rate: 0.87,
    avg_response_time_min: 4.2,
    fake_alert_rate: 0.08
  });
});

module.exports = router;
