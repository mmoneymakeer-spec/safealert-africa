const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { analyzeAlert, checkDuplicate } = require('../services/mistral');

let alerts = [];

router.post('/', async (req, res) => {
  try {
    const { text, city, lang = 'fr', lat, lng, userId } = req.body;

    if (!text || text.trim().length < 5) {
      return res.status(400).json({ error: 'Description trop courte' });
    }
    if (!city) {
      return res.status(400).json({ error: 'Ville requise' });
    }

    const aiResult = await analyzeAlert(text, city, lang);

    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentAlerts = alerts
      .filter(a => a.city === city && new Date(a.created_at) > thirtyMinsAgo)
      .slice(0, 10);

    const duplicateCheck = await checkDuplicate(text, recentAlerts);

    const alert = {
      id: `ALT-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`,
      text, city, lang,
      lat: lat || null,
      lng: lng || null,
      userId: userId || 'anonymous',
      category: aiResult.category,
      severity: aiResult.severity,
      is_fake: aiResult.is_fake,
      confidence: aiResult.confidence,
      summary: aiResult.summary,
      recommended_response: aiResult.recommended_response,
      tags: aiResult.tags || [],
      is_duplicate: duplicateCheck.is_duplicate,
      duplicate_of: duplicateCheck.duplicate_id,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    alerts.unshift(alert);
    if (alerts.length > 500) alerts = alerts.slice(0, 500);

    console.log(`[ALERT] ${alert.id} | ${city} | ${alert.category} | severity:${alert.severity}`);

    if (alert.severity >= 7 && !alert.is_fake) {
      console.log(`[URGENT] Notifier ${alert.recommended_response} pour ${alert.id}`);
    }

    res.status(201).json({ success: true, alert });

  } catch (err) {
    console.error('[ERROR] POST /alerts:', err.message);
    if (err.response?.status === 401) {
      return res.status(401).json({ error: 'Clé API Mistral invalide' });
    }
    res.status(500).json({ error: 'Erreur analyse', details: err.message });
  }
});

router.get('/', (req, res) => {
  const { city, category, limit = 50, offset = 0 } = req.query;
  let filtered = [...alerts];
  if (city) filtered = filtered.filter(a => a.city.toLowerCase() === city.toLowerCase());
  if (category) filtered = filtered.filter(a => a.category === category);
  res.json({
    total: filtered.length,
    alerts: filtered.slice(Number(offset), Number(offset) + Number(limit))
  });
});

router.get('/:id', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Signalement non trouvé' });
  res.json(alert);
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'dispatched', 'resolved', 'false_alarm'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Signalement non trouvé' });
  alert.status = status;
  alert.updated_at = new Date().toISOString();
  res.json({ success: true, alert });
});

module.exports = router;
