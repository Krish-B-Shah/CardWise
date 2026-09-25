import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import path from 'path';
import fs from 'fs';

export interface DbClient {
  query: (text: string, params?: any[]) => Promise<{ rows: any[]; rowCount: number }>;
}

let dbInstance: DbClient | null = null;
let closeConnection: (() => Promise<void>) | null = null;

export async function closeDb(): Promise<void> {
  if (closeConnection) await closeConnection();
  closeConnection = null;
  dbInstance = null;
}

export async function getDb(): Promise<DbClient> {
  if (dbInstance) {
    return dbInstance;
  }

  // Automated checks must never connect to or mutate the saved demo database.
  const isTest = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);
  const databaseUrl = isTest ? undefined : process.env.DATABASE_URL;

  if (databaseUrl) {
    try {
      console.log('[DB] Connecting to PostgreSQL via DATABASE_URL...');
      const pool = new pg.Pool({ connectionString: databaseUrl });
      await pool.query('SELECT 1');
      closeConnection = () => pool.end();
      console.log('[DB] Connected to PostgreSQL server.');
      
      dbInstance = {
        query: async (text: string, params?: any[]) => {
          const res = await pool.query(text, params);
          return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
        }
      };
      await initDb(dbInstance);
      return dbInstance;
    } catch (err) {
      console.warn('[DB] PostgreSQL server connection failed, falling back to embedded PGlite:', err);
    }
  }

  // Use embedded PostgreSQL (PGlite)
  let pglite: PGlite;
  if (isTest) {
    console.log('[DB] Initializing in-memory embedded PostgreSQL (PGlite) for tests...');
    pglite = new PGlite();
  } else {
    const dataDir = process.env.PGLITE_DATA_DIR
      ? path.resolve(process.env.PGLITE_DATA_DIR)
      : path.resolve(__dirname, '../../data/cardwise-pg');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    console.log(`[DB] Initializing embedded PostgreSQL (PGlite) at ${dataDir}...`);
    pglite = new PGlite(dataDir);
  }
  try {
    await pglite.waitReady;
  } catch (error) {
    if (!isTest) throw new Error(`Embedded database could not open. Existing files have not been reset. For a separate demo database using the existing fixtures, run "npm --workspace=backend run start:demo". Original error: ${String(error)}`);
    throw error;
  }
  closeConnection = () => pglite.close();
  console.log('[DB] Embedded PostgreSQL ready.');

  dbInstance = {
    query: async (text: string, params?: any[]) => {
      const res = await pglite.query(text, params);
      return { rows: res.rows, rowCount: res.rows.length };
    }
  };

  await initDb(dbInstance);
  return dbInstance;
}

export async function initDb(db: DbClient) {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    await db.query(statement);
  }

  // Seed demo data if profile does not exist
  const existingProfile = await db.query("SELECT id FROM profiles WHERE id = 'demo-user-1'");
  if (existingProfile.rows.length === 0) {
    console.log('[DB] Seeding demo profile and fictional cards...');
    await seedDemoData(db);
  }
}

async function seedDemoData(db: DbClient) {
  // 1. Profile
  await db.query(
    `INSERT INTO profiles (id, name, email, demo_mode)
     VALUES ('demo-user-1', 'Alex Morgan (Demo Profile)', 'alex.demo@cardwise.local', true)`
  );

  // 2. Fictional Cards
  const cards = [
    {
      id: 'card-prime-visa',
      name: 'Prime Rewards Visa',
      bank: 'Chase',
      network: 'Visa',
      color_gradient: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
      last_four: '7291',
      annual_fee: 0,
      credit_limit: 12000,
      notes: 'Best for Amazon purchases and Whole Foods'
    },
    {
      id: 'card-amex-blue-cash',
      name: 'Blue Cash Everyday',
      bank: 'American Express',
      network: 'Amex',
      color_gradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
      last_four: '3810',
      annual_fee: 0,
      credit_limit: 8500,
      notes: '3% on U.S. online retail purchases up to $6,000/yr'
    },
    {
      id: 'card-citi-custom',
      name: 'Custom Cash',
      bank: 'Citi',
      network: 'Mastercard',
      color_gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
      last_four: '5192',
      annual_fee: 0,
      credit_limit: 7500,
      notes: '5% on your highest eligible spend category each billing cycle up to $500'
    },
    {
      id: 'card-chase-freedom',
      name: 'Freedom Unlimited',
      bank: 'Chase',
      network: 'Visa',
      color_gradient: 'linear-gradient(135deg, #059669, #065f46)',
      last_four: '9424',
      annual_fee: 0,
      credit_limit: 9000,
      notes: '1.5% cash back on all other purchases, 3% dining'
    },
    {
      id: 'card-capital-quicksilver',
      name: 'Quicksilver Cash Rewards',
      bank: 'Capital One',
      network: 'Mastercard',
      color_gradient: 'linear-gradient(135deg, #475569, #1e293b)',
      last_four: '6011',
      annual_fee: 0,
      credit_limit: 6000,
      notes: '1.5% flat cash back on everything'
    }
  ];

  for (const c of cards) {
    await db.query(
      `INSERT INTO cards (id, user_id, name, bank, network, color_gradient, last_four, annual_fee, credit_limit, notes)
       VALUES ($1, 'demo-user-1', $2, $3, $4, $5, $6, $7, $8, $9)`,
      [c.id, c.name, c.bank, c.network, c.color_gradient, c.last_four, c.annual_fee, c.credit_limit, c.notes]
    );
  }

  // 3. Reward Rules
  const rules = [
    // Prime Visa
    { id: 'rule-pv-1', card_id: 'card-prime-visa', category: 'online_shopping', rate: 0.05, desc: '5% back at Amazon.com' },
    { id: 'rule-pv-2', card_id: 'card-prime-visa', category: 'dining', rate: 0.02, desc: '2% back at restaurants' },
    { id: 'rule-pv-3', card_id: 'card-prime-visa', category: 'general', rate: 0.01, desc: '1% back on all other purchases' },

    // Amex Blue Cash Everyday
    { id: 'rule-bce-1', card_id: 'card-amex-blue-cash', category: 'online_shopping', rate: 0.03, cap: 6000, desc: '3% back on U.S. online retail (up to $6k/yr)' },
    { id: 'rule-bce-2', card_id: 'card-amex-blue-cash', category: 'groceries', rate: 0.03, cap: 6000, desc: '3% back at U.S. supermarkets (up to $6k/yr)' },
    { id: 'rule-bce-3', card_id: 'card-amex-blue-cash', category: 'gas', rate: 0.03, cap: 6000, desc: '3% back at U.S. gas stations (up to $6k/yr)' },
    { id: 'rule-bce-4', card_id: 'card-amex-blue-cash', category: 'general', rate: 0.01, desc: '1% back on other purchases' },

    // Citi Custom Cash
    { id: 'rule-ccc-1', card_id: 'card-citi-custom', category: 'electronics', rate: 0.05, cap: 500, desc: '5% back on top category (Electronics) up to $500/billing cycle' },
    { id: 'rule-ccc-2', card_id: 'card-citi-custom', category: 'dining', rate: 0.01, desc: '1% back general' },
    { id: 'rule-ccc-3', card_id: 'card-citi-custom', category: 'general', rate: 0.01, desc: '1% back on all other purchases' },

    // Freedom Unlimited
    { id: 'rule-fu-1', card_id: 'card-chase-freedom', category: 'dining', rate: 0.03, desc: '3% back on dining & takeout' },
    { id: 'rule-fu-2', card_id: 'card-chase-freedom', category: 'drugstores', rate: 0.03, desc: '3% back at drugstores' },
    { id: 'rule-fu-3', card_id: 'card-chase-freedom', category: 'general', rate: 0.015, desc: '1.5% back on all other purchases' },

    // Quicksilver
    { id: 'rule-qs-1', card_id: 'card-capital-quicksilver', category: 'general', rate: 0.015, desc: '1.5% flat cash back on everything' }
  ];

  for (const r of rules) {
    await db.query(
      `INSERT INTO reward_rules (id, card_id, category, reward_rate, cap_amount, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [r.id, r.card_id, r.category, r.rate, r.cap ?? null, r.desc]
    );
  }

  // 4. Merchants Registry
  const merchants = [
    {
      id: 'merch-amazon',
      name: 'Amazon',
      domain: 'amazon.com',
      category: 'online_shopping',
      supported_adapter: 'amazon',
      logo_icon: 'shopping-cart'
    },
    {
      id: 'merch-bestbuy',
      name: 'Best Buy',
      domain: 'bestbuy.com',
      category: 'electronics',
      supported_adapter: 'bestbuy',
      logo_icon: 'tv'
    },
    {
      id: 'merch-target',
      name: 'Target',
      domain: 'target.com',
      category: 'retail',
      supported_adapter: 'target',
      logo_icon: 'bullseye'
    },
    {
      id: 'merch-walmart',
      name: 'Walmart',
      domain: 'walmart.com',
      category: 'groceries',
      supported_adapter: 'walmart',
      logo_icon: 'store'
    },
    {
      id: 'merch-demo-store',
      name: 'CardWise Demo Store',
      domain: 'localhost',
      category: 'online_shopping',
      supported_adapter: 'localdemostore',
      logo_icon: 'laptop'
    }
  ];

  for (const m of merchants) {
    await db.query(
      `INSERT INTO merchants (id, name, domain, category, supported_adapter, logo_icon)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (domain) DO UPDATE SET category = EXCLUDED.category, supported_adapter = EXCLUDED.supported_adapter`,
      [m.id, m.name, m.domain, m.category, m.supported_adapter, m.logo_icon]
    );
  }

  // 5. Historical Transactions (demonstrating earned vs missed opportunities)
  const transactions = [
    {
      id: 'tx-101',
      merchant_name: 'Amazon.com',
      merchant_domain: 'amazon.com',
      category: 'online_shopping',
      amount: 149.99,
      card_used_id: 'card-prime-visa',
      reward_earned: 7.50,
      optimal_card_id: 'card-prime-visa',
      optimal_reward: 7.50,
      reward_gap: 0.00,
      date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'tx-102',
      merchant_name: 'Best Buy #0412',
      merchant_domain: 'bestbuy.com',
      category: 'electronics',
      amount: 420.00,
      card_used_id: 'card-capital-quicksilver', // Used 1.5% card instead of 5% Citi Custom Cash!
      reward_earned: 6.30,
      optimal_card_id: 'card-citi-custom',
      optimal_reward: 21.00,
      reward_gap: 14.70, // Missed $14.70!
      date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'tx-103',
      merchant_name: 'Target Supercenter',
      merchant_domain: 'target.com',
      category: 'retail',
      amount: 88.50,
      card_used_id: 'card-amex-blue-cash',
      reward_earned: 0.89,
      optimal_card_id: 'card-chase-freedom',
      optimal_reward: 1.33,
      reward_gap: 0.44,
      date: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'tx-104',
      merchant_name: 'Whole Foods Market',
      merchant_domain: 'amazon.com',
      category: 'groceries',
      amount: 112.40,
      card_used_id: 'card-amex-blue-cash',
      reward_earned: 3.37,
      optimal_card_id: 'card-amex-blue-cash',
      optimal_reward: 3.37,
      reward_gap: 0.00,
      date: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'tx-105',
      merchant_name: 'Chipotle Mexican Grill',
      merchant_domain: 'chipotle.com',
      category: 'dining',
      amount: 24.80,
      card_used_id: 'card-chase-freedom',
      reward_earned: 0.74,
      optimal_card_id: 'card-chase-freedom',
      optimal_reward: 0.74,
      reward_gap: 0.00,
      date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
    }
  ];

  for (const t of transactions) {
    await db.query(
      `INSERT INTO transactions (id, user_id, merchant_name, merchant_domain, category, amount, card_used_id, reward_earned, optimal_card_id, optimal_reward, reward_gap, date)
       VALUES ($1, 'demo-user-1', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [t.id, t.merchant_name, t.merchant_domain, t.category, t.amount, t.card_used_id, t.reward_earned, t.optimal_card_id, t.optimal_reward, t.reward_gap, t.date]
    );
  }

  console.log('[DB] Demo data seeding complete.');
}
