import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import { getDb, DbClient } from '../src/db/index.js';
import { selectRewardRule } from '../src/services/rewardRules.js';
import { calculateRecommendation } from '../src/services/recommendationEngine.js';

describe('Interview readiness regressions', () => {
  let db: DbClient;
  beforeAll(async () => { db = await getDb(); });

  it('makes category precedence deterministic, including duplicate rules', () => {
    const rules = [
      { id: 'general', category: 'general', reward_rate: 0.05 },
      { id: 'b', category: 'retail', reward_rate: 0.01 },
      { id: 'a', category: 'retail', reward_rate: 0.02 }
    ];
    expect(selectRewardRule(rules, 'retail')?.id).toBe('a');
    expect(selectRewardRule([...rules].reverse(), 'RETAIL')?.id).toBe('a');
    expect(selectRewardRule([], 'retail')).toBeUndefined();
  });

  it('does not treat an impersonating domain as Amazon', async () => {
    const rec = await calculateRecommendation(db, { domain: 'amazon.evil.example', amount: 100 });
    expect(rec.merchant.category).toBe('general');
    expect(rec.bestCard.cashbackRate).toBe(0.015);
  });

  it('discloses that estimates ignore spending caps', async () => {
    const rec = await calculateRecommendation(db, { domain: 'bestbuy.com', amount: 1000 });
    expect(rec.bestCard.estimatedCashback).toBe(50);
    expect(rec.explanation).toMatch(/caps.*not evaluated/i);
  });

  it('rejects nonfinite amounts before querying', async () => {
    await expect(calculateRecommendation(db, { domain: 'amazon.com', amount: Infinity })).rejects.toThrow('finite');
  });

  it('uses the same rule policy for transaction rewards and recommendations', async () => {
    const card = await request(app).post('/api/cards').send({ name: 'Regression fixture', bank: 'Test', network: 'Visa', last_four: '0000', credit_limit: 50000 });
    expect(card.status).toBe(201);
    const cardId = card.body.id;
    for (const rate of [0.005, 0.01]) {
      const rule = await request(app).post('/api/rewards').send({ card_id: cardId, category: 'retail', reward_rate: rate });
      expect(rule.status).toBe(201);
    }
    const rec = await request(app).post('/api/recommend').send({ domain: 'target.com', amount: 100 });
    const scored = [rec.body.bestCard, ...rec.body.alternatives].find((c: { id: string }) => c.id === cardId);
    expect(scored.estimatedCashback).toBe(1);
    const tx = await request(app).post('/api/transactions').send({ merchant_name: 'Test fixture', merchant_domain: 'target.com', category: 'retail', amount: 100, card_used_id: cardId });
    expect(tx.status).toBe(201);
    expect(Number(tx.body.reward_earned)).toBe(scored.estimatedCashback);
    await request(app).delete('/api/cards/' + cardId);
  });

  it('does not invent a reward rate when rules are absent', async () => {
    const noRules: DbClient = { query: async sql => ({
      rows: sql.includes('FROM cards') ? [{ id: 'fixture', name: 'No rules', bank: 'Test', network: 'Visa', last_four: '0000', color_gradient: '', credit_limit: 1 }] : [],
      rowCount: 0
    }) };
    const rec = await calculateRecommendation(noRules, { domain: 'unknown.example', amount: 100 });
    expect(rec.bestCard.cashbackRate).toBe(0);
    expect(rec.bestCard.estimatedCashback).toBe(0);
    expect(rec.bestCard.rewardRuleDescription).toContain('No matching reward rule');
  });

  it('seeds the Target fixture consistently with configured category rates', async () => {
    const historical = (await db.query("SELECT * FROM transactions WHERE id = 'tx-103'")).rows[0];
    const rec = await calculateRecommendation(db, { domain: historical.merchant_domain, category: historical.category, amount: Number(historical.amount) });
    expect(Number(historical.optimal_reward)).toBe(rec.bestCard.estimatedCashback);
    expect(Number(historical.reward_gap)).toBe(0.44);
  });
});
