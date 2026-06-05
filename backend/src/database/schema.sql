CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  city VARCHAR(100),
  trust_score FLOAT DEFAULT 1.0,
  reports_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(50) PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  text TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  lang VARCHAR(10) DEFAULT 'fr',
  location GEOMETRY(Point, 4326),
  category VARCHAR(50),
  severity INT CHECK (severity BETWEEN 1 AND 10),
  is_fake BOOLEAN DEFAULT FALSE,
  confidence FLOAT,
  summary TEXT,
  recommended_response VARCHAR(50),
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'pending',
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_of VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_location
  ON alerts USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_alerts_city
  ON alerts(city);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at
  ON alerts(created_at DESC);

CREATE OR REPLACE VIEW active_incidents AS
SELECT
  id, city, category, severity, summary,
  ST_X(location) as lng,
  ST_Y(location) as lat,
  status, created_at
FROM alerts
WHERE
  created_at > NOW() - INTERVAL '24 hours'
  AND is_fake = FALSE
  AND is_duplicate = FALSE
ORDER BY severity DESC, created_at DESC;
