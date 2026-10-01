import { Router } from 'express';
import { createCardSchema, rewardRuleSchema, recommendSchema, transactionSchema } from '../contracts.js';
import { ApiError, sendApiError } from '../http/errors.js';
import { createCardWithDefaultRule } from '../services/cardService.js';
import { getDb } from '../db/index.js';
import { calculateRecommendation } from '../services/recommendationEngine.js';
import { selectRewardRule } from '../services/rewardRules.js';

export const apiRouter = Router();

// Profile
apiRouter.get('/profile', async (_req, res) => {
  try {
    const db = await getDb();
    const result = await db.query("SELECT * FROM profiles WHERE id = 'demo-user-1'");
    if (result.rows.length === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Profile not found');
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return sendApiError(res, err);
  }
});

// Cards
apiRouter.get('/cards', async (_req, res) => {
  try {
    const db = await getDb();
    const cardsRes = await db.query(
      `SELECT * FROM cards WHERE user_id = 'demo-user-1' ORDER BY created_at ASC`
    );
    const rulesRes = await db.query(
      `SELECT * FROM reward_rules ORDER BY created_at ASC`
    );

    const cards = cardsRes.rows.map(card => ({
      ...card,
      annual_fee: Number(card.annual_fee),
      credit_limit: Number(card.credit_limit),
      rules: rulesRes.rows
        .filter(r => r.card_id === card.id)
        .map(r => ({
          ...r,
          reward_rate: Number(r.reward_rate),
          cap_amount: r.cap_amount ? Number(r.cap_amount) : null,
          current_spend_in_cap: Number(r.current_spend_in_cap)
        }))
    }));

    return res.json(cards);
  } catch (err) {
    return sendApiError(res, err);
  }
});


apiRouter.post('/cards', async (req, res) => {
  try {
    const parsed = createCardSchema.parse(req.body);
    const db = await getDb();
    const created = await createCardWithDefaultRule(db, parsed);
    return res.status(201).json(created);
  } catch (err) {
    return sendApiError(res, err);
  }
});

apiRouter.put('/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = createCardSchema.partial().parse(req.body);
    const db = await getDb();

    const existing = await db.query('SELECT * FROM cards WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Card not found');
    }

    const card = existing.rows[0];
    await db.query(
      `UPDATE cards 
       SET name = $1, bank = $2, network = $3, color_gradient = $4, last_four = $5, annual_fee = $6, credit_limit = $7, notes = $8
       WHERE id = $9`,
      [
        parsed.name ?? card.name,
        parsed.bank ?? card.bank,
        parsed.network ?? card.network,
        parsed.color_gradient ?? card.color_gradient,
        parsed.last_four ?? card.last_four,
        parsed.annual_fee ?? card.annual_fee,
        parsed.credit_limit ?? card.credit_limit,
        parsed.notes ?? card.notes,
        id
      ]
    );

    const updated = await db.query('SELECT * FROM cards WHERE id = $1', [id]);
    return res.json(updated.rows[0]);
  } catch (err) {
    return sendApiError(res, err);
  }
});

apiRouter.delete('/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const deleted = await db.query('DELETE FROM cards WHERE id = $1 RETURNING id', [id]);
    if (!deleted.rows.length) throw new ApiError(404, 'NOT_FOUND', 'Card not found');
    return res.json({ success: true });
  } catch (err) {
    return sendApiError(res, err);
  }
});

// Reward Rules
apiRouter.get('/rewards', async (_req, res) => {
  try {
    const db = await getDb();
    const result = await db.query(
      `SELECT r.*, c.name as card_name, c.bank as card_bank 
       FROM reward_rules r 
       JOIN cards c ON r.card_id = c.id 
       ORDER BY r.category ASC, r.reward_rate DESC`
    );
    return res.json(
      result.rows.map(r => ({
        ...r,
        reward_rate: Number(r.reward_rate),
        cap_amount: r.cap_amount ? Number(r.cap_amount) : null
      }))
    );
  } catch (err) {
    return sendApiError(res, err);
  }
});


apiRouter.post('/rewards', async (req, res) => {
  try {
    const parsed = rewardRuleSchema.parse(req.body);
    const db = await getDb();
    const id = `rule-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    await db.query(
      `INSERT INTO reward_rules (id, card_id, category, reward_rate, cap_amount, description)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, parsed.card_id, parsed.category, parsed.reward_rate, parsed.cap_amount ?? null, parsed.description || '']
    );

    const created = await db.query('SELECT * FROM reward_rules WHERE id = $1', [id]);
    return res.status(201).json(created.rows[0]);
  } catch (err) {
    return sendApiError(res, err);
  }
});

apiRouter.delete('/rewards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    const deleted = await db.query('DELETE FROM reward_rules WHERE id = $1 RETURNING id', [id]);
    if (!deleted.rows.length) throw new ApiError(404, 'NOT_FOUND', 'Reward rule not found');
    return res.json({ success: true });
  } catch (err) {
    return sendApiError(res, err);
  }
});

// Merchants Registry
apiRouter.get('/merchants', async (_req, res) => {
  try {
    const db = await getDb();
    const result = await db.query('SELECT * FROM merchants ORDER BY name ASC');
    return res.json(result.rows);
  } catch (err) {
    return sendApiError(res, err);
  }
});

// Strictly-validated recommendation endpoint
// "Send only the merchant category, normalized domain, and purchase amount to the recommendation service.
// Never inspect payment fields, credit card numbers, CVVs, passwords, or other sensitive checkout information."

apiRouter.post('/recommend', async (req, res) => {
  try {
    const validated = recommendSchema.parse(req.body);
    const db = await getDb();
    const rec = await calculateRecommendation(db, validated);
    return res.json(rec);
  } catch (err) {
    return sendApiError(res, err);
  }
});

// Transactions
apiRouter.get('/transactions', async (_req, res) => {
  try {
    const db = await getDb();
    const result = await db.query(
      `SELECT t.*, c.name as card_used_name, c.bank as card_used_bank, oc.name as optimal_card_name 
       FROM transactions t
       LEFT JOIN cards c ON t.card_used_id = c.id
       LEFT JOIN cards oc ON t.optimal_card_id = oc.id
       ORDER BY t.date DESC`
    );
    return res.json(
      result.rows.map(t => ({
        ...t,
        amount: Number(t.amount),
        reward_earned: Number(t.reward_earned),
        optimal_reward: Number(t.optimal_reward),
        reward_gap: Number(t.reward_gap)
      }))
    );
  } catch (err) {
    return sendApiError(res, err);
  }
});


apiRouter.post('/transactions', async (req, res) => {
  try {
    const parsed = transactionSchema.parse(req.body);
    const db = await getDb();

    // Evaluate recommendation to compute optimal card and gap
    const rec = await calculateRecommendation(db, {
      domain: parsed.merchant_domain || 'general.com',
      category: parsed.category,
      amount: parsed.amount
    });

    // Compute reward earned with card used
    const cardUsedRules = await db.query(
      `SELECT id, category, reward_rate FROM reward_rules WHERE card_id = $1`,
      [parsed.card_used_id]
    );
    const usedRule = selectRewardRule(cardUsedRules.rows, rec.merchant.category);
    const cardUsedRate = usedRule ? Number(usedRule.reward_rate) : 0;
    const rewardEarned = Math.round(parsed.amount * cardUsedRate * 100) / 100;
    const optimalReward = rec.bestCard.estimatedCashback;
    const rewardGap = Math.max(0, Math.round((optimalReward - rewardEarned) * 100) / 100);

    const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.query(
      `INSERT INTO transactions (id, user_id, merchant_name, merchant_domain, category, amount, card_used_id, reward_earned, optimal_card_id, optimal_reward, reward_gap)
       VALUES ($1, 'demo-user-1', $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        parsed.merchant_name,
        parsed.merchant_domain || '',
        parsed.category,
        parsed.amount,
        parsed.card_used_id,
        rewardEarned,
        rec.bestCard.id,
        optimalReward,
        rewardGap
      ]
    );

    const created = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
    return res.status(201).json(created.rows[0]);
  } catch (err) {
    return sendApiError(res, err);
  }
});

// Analytics
apiRouter.get('/analytics', async (_req, res) => {
  try {
    const db = await getDb();
    const txRes = await db.query(
      `SELECT t.*, c.name as card_used_name 
       FROM transactions t 
       LEFT JOIN cards c ON t.card_used_id = c.id`
    );

    const transactions = txRes.rows.map(t => ({
      ...t,
      amount: Number(t.amount),
      reward_earned: Number(t.reward_earned),
      optimal_reward: Number(t.optimal_reward),
      reward_gap: Number(t.reward_gap)
    }));

    const totalSpend = transactions.reduce((acc, t) => acc + t.amount, 0);
    const totalRewardsEarned = transactions.reduce((acc, t) => acc + t.reward_earned, 0);
    const totalPotentialRewards = transactions.reduce((acc, t) => acc + t.optimal_reward, 0);
    const totalRewardGap = transactions.reduce((acc, t) => acc + t.reward_gap, 0);
    const optimizationScore = totalPotentialRewards > 0 
      ? Math.round((totalRewardsEarned / totalPotentialRewards) * 100) 
      : 100;

    // Group by category
    const categoryMap = new Map<string, { spend: number; earned: number; gap: number; count: number }>();
    for (const t of transactions) {
      const cat = t.category || 'general';
      const entry = categoryMap.get(cat) || { spend: 0, earned: 0, gap: 0, count: 0 };
      entry.spend += t.amount;
      entry.earned += t.reward_earned;
      entry.gap += t.reward_gap;
      entry.count += 1;
      categoryMap.set(cat, entry);
    }

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      spend: Math.round(stats.spend * 100) / 100,
      earned: Math.round(stats.earned * 100) / 100,
      gap: Math.round(stats.gap * 100) / 100,
      count: stats.count
    }));

    // Group by card
    const cardMap = new Map<string, { cardName: string; spend: number; earned: number }>();
    for (const t of transactions) {
      const cardName = t.card_used_name || 'Unassigned Card';
      const entry = cardMap.get(cardName) || { cardName, spend: 0, earned: 0 };
      entry.spend += t.amount;
      entry.earned += t.reward_earned;
      cardMap.set(cardName, entry);
    }

    const cardBreakdown = Array.from(cardMap.values()).map(c => ({
      cardName: c.cardName,
      spend: Math.round(c.spend * 100) / 100,
      earned: Math.round(c.earned * 100) / 100
    }));

    // Recent recommendation logs
    const logsRes = await db.query(
      `SELECT r.*, c.name as card_name, c.bank as card_bank 
       FROM recommendation_logs r 
       LEFT JOIN cards c ON r.recommended_card_id = c.id 
       ORDER BY timestamp DESC LIMIT 10`
    );

    return res.json({
      summary: {
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalRewardsEarned: Math.round(totalRewardsEarned * 100) / 100,
        totalPotentialRewards: Math.round(totalPotentialRewards * 100) / 100,
        totalRewardGap: Math.round(totalRewardGap * 100) / 100,
        optimizationScore
      },
      categoryBreakdown,
      cardBreakdown,
      recentRecommendations: logsRes.rows.map(l => ({
        ...l,
        amount: Number(l.amount),
        cashback_rate: Number(l.cashback_rate),
        cashback_amount: Number(l.cashback_amount)
      }))
    });
  } catch (err) {
    return sendApiError(res, err);
  }
});

// Health check
apiRouter.get('/health', async (_req, res) => {
  try {
    await (await getDb()).query('SELECT 1');
    return res.json({ status: 'ready', database: 'reachable', version: '1.0.0', timestamp: new Date().toISOString() });
  } catch {
    return sendApiError(res, new ApiError(503, 'NOT_READY', 'Database is unavailable.'));
  }
});
