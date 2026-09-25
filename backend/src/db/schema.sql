-- CardWise PostgreSQL Schema
-- Fictional Single-User MVP Demo Profile

CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL,
    demo_mode BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    bank VARCHAR(64) NOT NULL,
    network VARCHAR(32) NOT NULL,
    color_gradient VARCHAR(128) NOT NULL,
    last_four VARCHAR(4) NOT NULL,
    annual_fee NUMERIC(10, 2) DEFAULT 0.00,
    credit_limit NUMERIC(10, 2) DEFAULT 5000.00,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reward_rules (
    id VARCHAR(64) PRIMARY KEY,
    card_id VARCHAR(64) NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL,
    reward_rate NUMERIC(5, 4) NOT NULL, -- e.g. 0.0500 for 5%, 0.0300 for 3%
    reward_type VARCHAR(32) DEFAULT 'cashback', -- 'cashback' or 'points'
    cap_amount NUMERIC(10, 2), -- Optional quarterly/yearly cap
    current_spend_in_cap NUMERIC(10, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merchants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    domain VARCHAR(128) UNIQUE NOT NULL,
    category VARCHAR(64) NOT NULL,
    supported_adapter VARCHAR(64) NOT NULL,
    logo_icon VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    merchant_name VARCHAR(128) NOT NULL,
    merchant_domain VARCHAR(128),
    category VARCHAR(64) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    card_used_id VARCHAR(64) REFERENCES cards(id) ON DELETE SET NULL,
    reward_earned NUMERIC(10, 2) NOT NULL,
    optimal_card_id VARCHAR(64) REFERENCES cards(id) ON DELETE SET NULL,
    optimal_reward NUMERIC(10, 2) NOT NULL,
    reward_gap NUMERIC(10, 2) DEFAULT 0.00,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendation_logs (
    id VARCHAR(64) PRIMARY KEY,
    domain VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    recommended_card_id VARCHAR(64) REFERENCES cards(id) ON DELETE CASCADE,
    cashback_rate NUMERIC(5, 4) NOT NULL,
    cashback_amount NUMERIC(10, 2) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes follow the current portfolio, rule lookup and chronological read paths.
CREATE INDEX IF NOT EXISTS cards_user_active_idx ON cards (user_id, is_active);
CREATE INDEX IF NOT EXISTS reward_rules_card_idx ON reward_rules (card_id);
CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS recommendation_logs_timestamp_idx ON recommendation_logs (timestamp DESC);
