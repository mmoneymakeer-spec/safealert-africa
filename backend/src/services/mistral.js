const axios = require('axios');

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

const SYSTEM_PROMPT = `Tu es un expert en securite publique africaine.
Analyse ce signalement et retourne UNIQUEMENT du JSON valide, sans markdown.
Format:
{"category":"crime|accident|incendie|medical|autre","severity":1-10,"is_fake":true|false,"confidence":0.0-1.0,"summary":"resume","recommended_response":"police|ambulance|pompiers|securite_privee","tags":["tag"]}`;

async function analyzeAlert(text, city, lang) {
  const response = await axios.post(
    MISTRAL_API_URL,
    {
      model: 'mistral-small-latest',
      temperature: 0.1,
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Signalement de ${city} (${lang}): "${text}"` }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );

  const raw = response.data.choices[0].message.content
    .trim().replace(/```json|```/g, '');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {
      category: 'autre', severity: 5, is_fake: false,
      confidence: 0.3, summary: text.substring(0, 100),
      recommended_response: 'police', tags: []
    };
  }
}

async function checkDuplicate(text, recentAlerts) {
  if (!recentAlerts.length) return { is_duplicate: false, duplicate_id: null };
  const alertList = recentAlerts.map(a => `ID:${a.id} "${a.summary}"`).join('\n');
  const response = await axios.post(
    MISTRAL_API_URL,
    {
      model: 'mistral-small-latest',
      temperature: 0,
      max_tokens: 80,
      messages: [{
        role: 'user',
        content: `Signalement: "${text}"\nIncidents recents:\n${alertList}\nDoublon? JSON: {"is_duplicate":bool,"duplicate_id":"ID|null"}`
      }]
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    }
  );
  const raw = response.data.choices[0].message.content
    .trim().replace(/```json|```/g, '');
  try { return JSON.parse(raw); }
  catch (e) { return { is_duplicate: false, duplicate_id: null }; }
}

module.exports = { analyzeAlert, checkDuplicate };
