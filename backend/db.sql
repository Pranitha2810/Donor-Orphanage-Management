-- db.sql

-- enable uuid-ossp if needed (Neon may already support gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles/type enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('donor','ngo','orphanage');
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$ BEGIN
    CREATE TYPE donation_type AS ENUM ('money','item');
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$ BEGIN
    CREATE TYPE donation_status AS ENUM ('pending','distributed');
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('pending','accepted','rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$ BEGIN
    CREATE TYPE action_type AS ENUM ('accepted','rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

-- users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  description TEXT,
  experience VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ngo_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type donation_type NOT NULL,
  amount DECIMAL(10,2),
  item_name VARCHAR(255),
  count INTEGER,
  status donation_status DEFAULT 'pending',
  orphanage_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- orphanage_requests table
CREATE TABLE IF NOT EXISTS orphanage_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orphanage_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ngo_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type donation_type NOT NULL,
  amount DECIMAL(10,2),
  item_name VARCHAR(255),
  count INTEGER,
  status request_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- distribution_history table
CREATE TABLE IF NOT EXISTS distribution_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID REFERENCES donations(id),
  ngo_id UUID REFERENCES users(id),
  orphanage_id UUID REFERENCES users(id),
  donor_id UUID REFERENCES users(id),
  action action_type NOT NULL,
  distributed_at TIMESTAMP DEFAULT NOW()
);
