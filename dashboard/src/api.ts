import { Card, RewardRule, Merchant, Transaction, AnalyticsData, RecommendationResponse } from './types.js';

const BASE_URL = 'http://localhost:3001/api';

export const api = {
  async getProfile() {
    const res = await fetch(`${BASE_URL}/profile`);
    return res.json();
  },

  async getCards(): Promise<Card[]> {
    const res = await fetch(`${BASE_URL}/cards`);
    return res.json();
  },

  async createCard(card: Partial<Card>): Promise<Card> {
    const res = await fetch(`${BASE_URL}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });
    return res.json();
  },

  async updateCard(id: string, card: Partial<Card>): Promise<Card> {
    const res = await fetch(`${BASE_URL}/cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    });
    return res.json();
  },

  async deleteCard(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/cards/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getRewards(): Promise<RewardRule[]> {
    const res = await fetch(`${BASE_URL}/rewards`);
    return res.json();
  },

  async createReward(rule: Partial<RewardRule>): Promise<RewardRule> {
    const res = await fetch(`${BASE_URL}/rewards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    return res.json();
  },

  async deleteReward(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/rewards/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getMerchants(): Promise<Merchant[]> {
    const res = await fetch(`${BASE_URL}/merchants`);
    return res.json();
  },

  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch(`${BASE_URL}/transactions`);
    return res.json();
  },

  async createTransaction(tx: {
    merchant_name: string;
    merchant_domain?: string;
    category: string;
    amount: number;
    card_used_id: string;
  }): Promise<Transaction> {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });
    return res.json();
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch(`${BASE_URL}/analytics`);
    return res.json();
  },

  async getRecommendation(domain: string, amount: number, category?: string): Promise<RecommendationResponse> {
    const res = await fetch(`${BASE_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, amount, category })
    });
    return res.json();
  }
};
