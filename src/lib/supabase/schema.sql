-- 0GBomber Database Schema

CREATE TABLE profiles (
  address TEXT PRIMARY KEY,
  spout_balance BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE heroes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_address TEXT REFERENCES profiles(address),
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  rarity TEXT NOT NULL,
  level INT DEFAULT 1,
  xp BIGINT DEFAULT 0,
  energy INT NOT NULL,
  max_energy INT NOT NULL,
  generation INT DEFAULT 1,
  legacy_tier TEXT,
  is_alive BOOLEAN DEFAULT TRUE,
  is_legendary BOOLEAN DEFAULT FALSE,
  personality JSONB DEFAULT '{}',
  intelligence JSONB DEFAULT '{}',
  traits TEXT[] DEFAULT '{}',
  equipment JSONB DEFAULT '{}',
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id UUID REFERENCES heroes(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  detail TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_address TEXT REFERENCES profiles(address),
  biome TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  hero_ids TEXT[] DEFAULT '{}',
  cleared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_config (
  id INT PRIMARY KEY DEFAULT 1,
  reward_multiplier FLOAT DEFAULT 1.0,
  currency_drop_rate FLOAT DEFAULT 1.0,
  equipment_drop_rate FLOAT DEFAULT 1.0,
  cosmetic_drop_rate FLOAT DEFAULT 1.0,
  upgrade_seed_drop_rate FLOAT DEFAULT 1.0,
  rare_loot_drop_rate FLOAT DEFAULT 1.0,
  event_reward_multiplier FLOAT DEFAULT 1.0,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  marketplace_enabled BOOLEAN DEFAULT TRUE,
  trading_enabled BOOLEAN DEFAULT TRUE,
  reward_claims_enabled BOOLEAN DEFAULT TRUE,
  currency_conversion_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE legacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id UUID REFERENCES heroes(id),
  tier TEXT NOT NULL,
  transferred_to UUID REFERENCES heroes(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller TEXT NOT NULL,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  price TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin config
INSERT INTO admin_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
