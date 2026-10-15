import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/App.js';
import { CardManager } from '../src/components/CardManager.js';
import { RewardRules } from '../src/components/RewardRules.js';
import { TransactionsView } from '../src/components/TransactionsView.js';
import { OptimizerCalculator } from '../src/components/OptimizerCalculator.js';
import { AnalyticsView } from '../src/components/AnalyticsView.js';
import { api } from '../src/api.js';

vi.mock('../src/api.js', () => ({ api: {
  getCards: vi.fn(), getRewards: vi.fn(), getTransactions: vi.fn(), getAnalytics: vi.fn(),
  getRecommendation: vi.fn()
} }));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: Root;
const analytics = {
  summary: { totalSpend: 0, totalRewardsEarned: 0, totalPotentialRewards: 0, totalRewardGap: 0, optimizationScore: 100 },
  categoryBreakdown: [], cardBreakdown: [], recentRecommendations: []
};

beforeEach(() => {
  vi.clearAllMocks();
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  vi.mocked(api.getCards).mockResolvedValue([]); vi.mocked(api.getRewards).mockResolvedValue([]);
  vi.mocked(api.getTransactions).mockResolvedValue([]); vi.mocked(api.getAnalytics).mockResolvedValue(analytics);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); });
async function render(node: React.ReactNode) { await act(async () => { root.render(node); }); }
async function click(label: string) {
  const button = [...host.querySelectorAll('button')].find(b => b.textContent?.includes(label));
  expect(button).toBeDefined();
  await act(async () => button!.click());
}

describe('Dashboard readiness behavior', () => {
  it('does not announce a successful refresh when loading fails', async () => {
    await render(<App />);
    vi.mocked(api.getCards).mockRejectedValueOnce(new Error('Backend unavailable'));
    await click('Sync');
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Backend unavailable');
    expect(host.textContent).not.toContain('Dashboard refreshed.');
    await click('Retry');
    expect(host.textContent).toContain('Dashboard refreshed.');
  });
  it('shows a recoverable initial-load error rather than an endless loading message', async () => {
    vi.mocked(api.getAnalytics).mockRejectedValue(new Error('Offline'));
    await render(<App />);
    expect(host.textContent).toContain('Analytics unavailable');
    expect(host.textContent).not.toContain('Loading financial analytics');
  });
  it('renders estimates and cap disclosure without unsupported health or tracking claims', async () => {
    await render(<App />);
    expect(host.textContent).toContain('Caps, billing periods, issuer eligibility and points valuation are not evaluated');
    expect(host.textContent).toContain('Estimated cashback');
    for (const claim of ['PostgreSQL Active', '100% Tracking', 'Engine Active', 'Active Cards Configured']) expect(host.textContent).not.toContain(claim);
  });
  it('does not invent the cause of an aggregate reward gap', async () => {
    await render(<AnalyticsView analytics={{ ...analytics, summary: { ...analytics.summary, totalRewardGap: 1 } }} transactions={[]} loading={false} onNavigateToOptimizer={vi.fn()} onNavigateToCards={vi.fn()} />);
    expect(host.textContent).toContain('modeled difference');
    expect(host.textContent).not.toContain('Citi Custom Cash');
    expect(host.textContent).not.toContain('forfeited');
    expect(host.textContent).not.toContain('Real-time Data');
  });
  it('keeps rejected card submissions open with a visible error', async () => {
    const save = vi.fn().mockRejectedValue(new Error('Card rejected'));
    await render(<CardManager cards={[]} onAddCard={save} onDeleteCard={vi.fn()} />);
    await click('Add');
    await act(async () => { host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(host.querySelector('form')).not.toBeNull();
    expect(host.querySelector('[role="alert"]')?.textContent).toBe('Card rejected');
  });
  it('displays rule and transaction submission failures', async () => {
    const save = vi.fn().mockRejectedValue(new Error('Save rejected'));
    // A test-only card fixture allows opening forms; no financial records are persisted.
    const cards = [{ id: 'fixture', name: 'Test', bank: 'Test', network: 'Visa', user_id: 'test', last_four: '0000', color_gradient: '', annual_fee: 0, credit_limit: 1, is_active: true }];
    await render(<RewardRules cards={cards} rules={[]} onAddRule={save} onDeleteRule={vi.fn()} />);
    await click('Add rule');
    await act(async () => { host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(host.querySelector('[role="alert"]')?.textContent).toBe('Save rejected');
    await render(<TransactionsView cards={cards} transactions={[]} onAddTransaction={save} />);
    await click('Record');
    await act(async () => { host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(host.querySelector('[role="alert"]')?.textContent).toBe('Save rejected');
  });
  it('shows optimizer errors and permits retry without rendering an error object as a card', async () => {
    vi.mocked(api.getRecommendation).mockRejectedValue(new Error('Recommendation unavailable'));
    await render(<OptimizerCalculator />);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Recommendation unavailable');
    await click('Calculate');
    expect(api.getRecommendation).toHaveBeenCalledTimes(2);
    expect(host.querySelector('button:disabled')).toBeNull();
  });
});
