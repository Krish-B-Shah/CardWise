import { DbClient } from '../db/index.js';
import { MODEL_LIMITATIONS, selectRewardRule } from './rewardRules.js';

export interface RecommendationRequest {
  domain: string;
  category?: string;
  amount: number;
  userId?: string;
}

export class NoActiveCardsError extends Error {
  constructor() { super('No active cards configured. Add a card before requesting an estimate.'); }
}

export interface CardRecommendationResult {
  bestCard: {
    id: string;
    name: string;
    bank: string;
    network: string;
    lastFour: string;
    colorGradient: string;
    cashbackRate: number;
    cashbackPercentage: string;
    estimatedCashback: number;
    rewardRuleDescription: string;
  };
  alternatives: Array<{
    id: string;
    name: string;
    bank: string;
    network: string;
    lastFour: string;
    colorGradient: string;
    cashbackRate: number;
    cashbackPercentage: string;
    estimatedCashback: number;
    rewardRuleDescription: string;
  }>;
  merchant: {
    name: string;
    domain: string;
    category: string;
  };
  purchaseAmount: number;
  savingsVsBaseline: number; // vs standard 1% card
  explanation: string;
}

export async function calculateRecommendation(
  db: DbClient,
  req: RecommendationRequest
): Promise<CardRecommendationResult> {
  const userId = req.userId || 'demo-user-1';
  if (!Number.isFinite(req.amount) || req.amount < 0) throw new Error('Amount must be a finite nonnegative number');
  const amount = req.amount;
  const rawDomain = new URL(req.domain.includes('://') ? req.domain : `https://${req.domain}`).hostname.toLowerCase().replace(/^www\./, '');

  // 1. Merchant lookup
  let merchantCategory = req.category || 'general';
  let merchantName = rawDomain;

  const merchantRes = await db.query(
    'SELECT name, category FROM merchants WHERE domain = $1 OR domain = $2 LIMIT 1',
    [rawDomain, `www.${rawDomain}`]
  );

  if (merchantRes.rows.length > 0) {
    merchantName = merchantRes.rows[0].name;
    if (!req.category) {
      merchantCategory = merchantRes.rows[0].category;
    }
  }

  // 2. Fetch user's active cards and reward rules
  const cardsRes = await db.query(
    `SELECT id, name, bank, network, color_gradient, last_four, credit_limit 
     FROM cards 
     WHERE user_id = $1 AND is_active = TRUE`,
    [userId]
  );

  const rulesRes = await db.query(
    `SELECT rr.id, rr.card_id, rr.category, rr.reward_rate, rr.cap_amount, rr.description
     FROM reward_rules rr
     JOIN cards c ON rr.card_id = c.id
     WHERE c.user_id = $1`,
    [userId]
  );

  if (cardsRes.rows.length === 0) {
    throw new NoActiveCardsError();
  }

  // Group rules by card
  const rulesByCard = new Map<string, any[]>();
  for (const rule of rulesRes.rows) {
    if (!rulesByCard.has(rule.card_id)) {
      rulesByCard.set(rule.card_id, []);
    }
    rulesByCard.get(rule.card_id)!.push(rule);
  }

  // Evaluate rate for each card
  const scoredCards = cardsRes.rows.map(card => {
    const rules = rulesByCard.get(card.id) || [];
    
    const matchingRule = selectRewardRule(rules, merchantCategory);
    const rate = matchingRule ? Number(matchingRule.reward_rate) : 0;
    const desc = matchingRule?.description || (matchingRule ? 'Configured cashback rate' : 'No matching reward rule configured (0% estimate)');
    const estimatedCashback = Math.round(amount * rate * 100) / 100;

    return {
      id: card.id,
      name: card.name,
      bank: card.bank,
      network: card.network,
      lastFour: card.last_four,
      colorGradient: card.color_gradient,
      cashbackRate: rate,
      cashbackPercentage: `${(rate * 100).toFixed(1)}%`,
      estimatedCashback,
      rewardRuleDescription: desc,
      creditLimit: Number(card.credit_limit)
    };
  });

  // Rank cards: highest rate first, then highest credit limit
  scoredCards.sort((a, b) => {
    if (b.cashbackRate !== a.cashbackRate) {
      return b.cashbackRate - a.cashbackRate;
    }
    return b.creditLimit - a.creditLimit;
  });

  const best = scoredCards[0];
  const alternatives = scoredCards.slice(1, 4).map(({ creditLimit, ...rest }) => rest);
  const baselineCashback = Math.round(amount * 0.01 * 100) / 100;
  const savingsVsBaseline = Math.max(0, Math.round((best.estimatedCashback - baselineCashback) * 100) / 100);

  const explanation = `${best.name} (${best.bank}) has the highest configured rate: ${best.cashbackPercentage} ($${best.estimatedCashback.toFixed(2)}) on ${merchantName} (${merchantCategory}). ${MODEL_LIMITATIONS}${
    savingsVsBaseline > 0 ? ` That is $${savingsVsBaseline.toFixed(2)} more than a basic 1% card.` : ''
  }`;

  // Record model queries, including calculators and manually logged transactions.
  try {
    const logId = `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await db.query(
      `INSERT INTO recommendation_logs (id, domain, category, amount, recommended_card_id, cashback_rate, cashback_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [logId, rawDomain, merchantCategory, amount, best.id, best.cashbackRate, best.estimatedCashback]
    );
  } catch (err) {
    console.error('Failed to log recommendation:', err);
  }

  const { creditLimit, ...bestCard } = best;

  return {
    bestCard,
    alternatives,
    merchant: {
      name: merchantName,
      domain: rawDomain,
      category: merchantCategory
    },
    purchaseAmount: amount,
    savingsVsBaseline,
    explanation
  };
}
