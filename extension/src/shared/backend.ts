import { RecommendationResult } from './types.js';

export function isRecommendation(value: unknown): value is RecommendationResult {
  if (!value || typeof value !== 'object') return false;
  const r = value as RecommendationResult;
  const card = (c: RecommendationResult['bestCard']) => c &&
    ['id', 'name', 'bank', 'network', 'lastFour', 'colorGradient', 'cashbackPercentage', 'rewardRuleDescription'].every(key => typeof c[key as keyof typeof c] === 'string') &&
    Number.isFinite(c.cashbackRate) && Number.isFinite(c.estimatedCashback);
  return Boolean(card(r.bestCard) && Array.isArray(r.alternatives) && r.alternatives.every(card) &&
    r.merchant && ['name', 'domain', 'category'].every(key => typeof r.merchant[key as keyof typeof r.merchant] === 'string') &&
    Number.isFinite(r.purchaseAmount) && Number.isFinite(r.savingsVsBaseline) && typeof r.explanation === 'string');
}

export async function backendRequest(path: string, body?: unknown): Promise<any> {
  const response = await fetch(`http://localhost:3001/api/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  });
  const data = await response.json();
  if (!response.ok || data?.error) throw new Error(data?.error || `Backend returned ${response.status}`);
  if (path === 'recommend' && !isRecommendation(data)) throw new Error('Invalid recommendation response');
  if ((path === 'cards' || path === 'merchants') && !Array.isArray(data)) throw new Error('Invalid list response');
  return data;
}
