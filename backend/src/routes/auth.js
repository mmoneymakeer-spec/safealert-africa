const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
  const { phone, city } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Numéro de téléphone requis' });
  }
  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    user: {
      id: `USR-${Date.now()}`,
      phone,
      city: city || 'Non définie',
      trust_score: 1.0,
      created_at: new Date().toISOString()
    }
  });
});

router.post('/login', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Numéro de téléphone requis' });
  }
  res.json({
    success: true,
    token: 'jwt-token-here',
    message: 'Connecté avec succès'
  });
});

module.exports = router;
