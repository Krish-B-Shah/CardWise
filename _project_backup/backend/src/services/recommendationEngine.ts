import { DbClient } from '../db/index.js';

export interface RecommendationRequest {
  domain: string;
  category?: string;
  amount: number;
  userId?: string;
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
  const amount = Number(req.amount) > 0 ? Number(req.amount) : 0;
  const rawDomain = req.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split(':')[0];

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
  } else {
    // Basic domain heuristics if merchant is not yet in registry
    if (rawDomain.includes('amazon') || rawDomain.includes('ebay') || rawDomain.includes('etsy')) {
      merchantCategory = 'online_shopping';
      merchantName = 'Online Retailer';
    } else if (rawDomain.includes('bestbuy') || rawDomain.includes('newegg') || rawDomain.includes('microcenter')) {
      merchantCategory = 'electronics';
      merchantName = 'Electronics Merchant';
    } else if (rawDomain.includes('target') || rawDomain.includes('walmart')) {
      merchantCategory = 'retail';
      merchantName = 'Department Store';
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
    throw new Error('No active cards found for this profile');
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
    
    // Find category-specific rule first, otherwise general rule, otherwise 1% default
    let matchingRule = rules.find(r => r.category.toLowerCase() === merchantCategory.toLowerCase());
    
    // Special check for merchant domain (e.g. Amazon-specific rule on Prime Visa)
    if (rawDomain.includes('amazon') && card.id === 'card-prime-visa') {
      const amazonRule = rules.find(r => r.category === 'online_shopping');
      if (amazonRule) matchingRule = amazonRule;
    }

    if (!matchingRule) {
      matchingRule = rules.find(r => r.category.toLowerCase() === 'general');
    }

    const rate = matchingRule ? Number(matchingRule.reward_rate) : 0.01;
    const desc = matchingRule ? matchingRule.description : '1% standard cashback rate';
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

  const explanation = `${best.name} (${best.bank}) is your best choice, offering ${best.cashbackPercentage} return ($${best.estimatedCashback.toFixed(2)}) on ${merchantName} (${merchantCategory}).${
    savingsVsBaseline > 0 ? ` That is $${savingsVsBaseline.toFixed(2)} more than a basic 1% card.` : ''
  }`;

  // Log recommendation asynchronously for telemetry/dashboard history
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
