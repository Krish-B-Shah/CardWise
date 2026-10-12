import { Card, RewardRule, Merchant, Transaction, AnalyticsData, RecommendationResponse } from './types.js';

const BASE_URL = 'http://localhost:3001/api';

export async function readResponse(res: Response): Promise<any> {
  let data: any;
  try { data = await res.json(); } catch { throw new Error('The API returned an unreadable response. Please retry.'); }
  if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'Request failed (' + res.status + ')');
  if (data && typeof data === 'object' && 'error' in data) throw new Error(String(data.error));
  return data;
}

export async function request(url: string, options?: RequestInit): Promise<Response> {
  try { return await fetch(url, { ...options, signal: AbortSignal.timeout(10000) }); }
  catch { throw new Error('CardWise API unavailable. Start the backend and retry.'); }
}

const object = (value: any): value is Record<string, any> => value !== null && typeof value === 'object';
const strings = (value: any, keys: string[]) => object(value) && keys.every(key => typeof value[key] === 'string');
const numbers = (value: any, keys: string[]) => object(value) && keys.every(key => Number.isFinite(value[key]));
const list = (value: any, check: (item: any) => boolean) => Array.isArray(value) && value.every(check);
const rule = (value: any) => strings(value, ['id', 'card_id', 'category']) && numbers(value, ['reward_rate']);
const card = (value: any) => strings(value, ['id', 'name', 'bank', 'network', 'last_four']) && numbers(value, ['annual_fee', 'credit_limit']) && (value.rules === undefined || list(value.rules, rule));
const transaction = (value: any) => strings(value, ['id', 'merchant_name', 'category', 'date']) && numbers(value, ['amount', 'reward_earned', 'optimal_reward', 'reward_gap']);
const recommendationCard = (value: any) => strings(value, ['id', 'name', 'bank', 'lastFour', 'cashbackPercentage', 'rewardRuleDescription']) && numbers(value, ['estimatedCashback', 'cashbackRate']);

function checked<T>(value: any, valid: boolean): T {
  if (!valid) throw new Error('The API returned invalid data. Please retry.');
  return value;
}

export const api = {
  async getProfile() {
    const res = await request(`${BASE_URL}/profile`);
    return readResponse(res);
  },

  async getCards(): Promise<Card[]> {
    const res = await request(`${BASE_URL}/cards`);
    const data = await readResponse(res);
    return checked(data, list(data, card));
  },

  async createCard(card: Partial<Card>): Promise<Card> {
    const res = await request(`${BASE_URL}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });
    return readResponse(res);
  },

  async updateCard(id: string, card: Partial<Card>): Promise<Card> {
    const res = await request(`${BASE_URL}/cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });
    return readResponse(res);
  },

  async deleteCard(id: string): Promise<{ success: boolean }> {
    const res = await request(`${BASE_URL}/cards/${id}`, {
      method: 'DELETE'
    });
    return readResponse(res);
  },

  async getRewards(): Promise<RewardRule[]> {
    const res = await request(`${BASE_URL}/rewards`);
    const data = await readResponse(res);
    return checked(data, list(data, rule));
  },

  async createReward(rule: Partial<RewardRule>): Promise<RewardRule> {
    const res = await request(`${BASE_URL}/rewards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    return readResponse(res);
  },

  async deleteReward(id: string): Promise<{ success: boolean }> {
    const res = await request(`${BASE_URL}/rewards/${id}`, {
      method: 'DELETE'
    });
    return readResponse(res);
  },

  async getMerchants(): Promise<Merchant[]> {
    const res = await request(`${BASE_URL}/merchants`);
    return readResponse(res);
  },

  async getTransactions(): Promise<Transaction[]> {
    const res = await request(`${BASE_URL}/transactions`);
    const data = await readResponse(res);
    return checked(data, list(data, transaction));
  },

  async createTransaction(tx: {
    merchant_name: string;
    merchant_domain?: string;
    category: string;
    amount: number;
    card_used_id: string;
  }): Promise<Transaction> {
    const res = await request(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });
    return readResponse(res);
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await request(`${BASE_URL}/analytics`);
    const data = await readResponse(res);
    return checked(data, object(data) && numbers(data.summary, ['totalSpend', 'totalRewardsEarned', 'totalPotentialRewards', 'totalRewardGap', 'optimizationScore']) &&
      list(data.categoryBreakdown, item => strings(item, ['category']) && numbers(item, ['spend', 'earned', 'gap', 'count'])) &&
      list(data.cardBreakdown, item => strings(item, ['cardName']) && numbers(item, ['spend', 'earned'])) &&
      list(data.recentRecommendations, item => strings(item, ['id', 'domain', 'category', 'timestamp']) && numbers(item, ['amount', 'cashback_rate', 'cashback_amount'])));
  },

  async getRecommendation(domain: string, amount: number, category?: string): Promise<RecommendationResponse> {
    const res = await request(`${BASE_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, amount, category })
    });
    const data = await readResponse(res);
    if (!object(data) || !recommendationCard(data.bestCard) || !strings(data.merchant, ['name', 'category', 'domain']) || !list(data.alternatives, recommendationCard) || !numbers(data, ['purchaseAmount', 'savingsVsBaseline']) || typeof data.explanation !== 'string') {
      throw new Error('The API returned an invalid recommendation. Please retry.');
    }
    return data as RecommendationResponse;
  }
};
