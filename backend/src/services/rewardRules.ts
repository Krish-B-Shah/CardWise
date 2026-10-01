export interface CashbackRule {
  id: string;
  category: string;
  reward_rate: string | number;
  description?: string;
}

// Category rules take precedence over general rules. Duplicate rules use the
// highest configured rate, then ID for deterministic results. Caps are metadata
// only in this MVP; no spending-period or remaining-cap accounting is performed.
export function selectRewardRule<T extends CashbackRule>(rules: T[], category: string): T | undefined {
  const normalized = category.trim().toLowerCase();
  const specific = rules.filter(rule => rule.category.toLowerCase() === normalized);
  const eligible = specific.length ? specific : rules.filter(rule => rule.category.toLowerCase() === 'general');
  return [...eligible].sort((a, b) => Number(b.reward_rate) - Number(a.reward_rate) || a.id.localeCompare(b.id))[0];
}

export const MODEL_LIMITATIONS = 'Demo estimate from configured category rates. Spending caps, billing periods, issuer eligibility and points valuation are not evaluated. Historical records are seeded or manually entered, not verified payments.';
