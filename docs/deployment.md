# Déploiement SafeAlert Africa

## Option 1 : Railway (gratuit pour tester)

1. Aller sur https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Sélectionner `safealert-africa`
4. Ajouter variable : `MISTRAL_API_KEY=sk-...`
5. Railway génère une URL publique automatiquement

## Option 2 : DigitalOcean ($12/mois)

```bash
git clone https://github.com/TON_USERNAME/safealert-africa
cd safealert-africa/backend
cp .env.example .env
npm install
npm install -g pm2
pm2 start src/index.js --name safealert-api
```

## Test API

```bash
curl -X POST https://TON_URL/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '{"text":"Accident Treichville","city":"Abidjan","lang":"fr"}'
```
