import { describe, it, expect, beforeAll } from 'vitest';
import { getDb, DbClient } from '../src/db/index.js';
import { calculateRecommendation } from '../src/services/recommendationEngine.js';

describe('CardWise Recommendation Engine Unit Tests', () => {
  let db: DbClient;

  beforeAll(async () => {
    db = await getDb();
  });

  it('recommends Prime Visa (5%) for Amazon online shopping', async () => {
    const result = await calculateRecommendation(db, {
      domain: 'amazon.com',
      category: 'online_shopping',
      amount: 100.00
    });

    expect(result).toBeDefined();
    expect(result.bestCard.name).toContain('Prime');
    expect(result.bestCard.cashbackRate).toBe(0.05);
    expect(result.bestCard.estimatedCashback).toBe(5.00);
    expect(result.purchaseAmount).toBe(100.00);
    expect(result.alternatives.length).toBeGreaterThan(0);
  });

  it('recommends Citi Custom Cash (5%) for Best Buy electronics', async () => {
    const result = await calculateRecommendation(db, {
      domain: 'bestbuy.com',
      category: 'electronics',
      amount: 400.00
    });

    expect(result).toBeDefined();
    expect(result.bestCard.name).toContain('Custom Cash');
    expect(result.bestCard.cashbackRate).toBe(0.05);
    expect(result.bestCard.estimatedCashback).toBe(20.00);
  });

  it('falls back gracefully to general reward rate for unknown merchants', async () => {
    const result = await calculateRecommendation(db, {
      domain: 'unknown-hardware-store.net',
      amount: 200.00
    });

    expect(result).toBeDefined();
    expect(result.bestCard).toBeDefined();
    expect(result.bestCard.cashbackRate).toBeGreaterThanOrEqual(0.01);
  });

  it('normalizes domains with protocols, subdomains, and ports correctly', async () => {
    const result = await calculateRecommendation(db, {
      domain: 'https://www.amazon.com/gp/cart/view.html?ref_=nav_cart',
      amount: 50.00
    });

    expect(result.merchant.domain).toBe('amazon.com');
    expect(result.bestCard.name).toContain('Prime');
  });

  it('calculates savings vs 1% baseline correctly', async () => {
    const result = await calculateRecommendation(db, {
      domain: 'amazon.com',
      category: 'online_shopping',
      amount: 200.00
    });

    // 5% of 200 = 10, 1% of 200 = 2 -> savings = 8
    expect(result.bestCard.estimatedCashback).toBe(10.00);
    expect(result.savingsVsBaseline).toBe(8.00);
  });
});
