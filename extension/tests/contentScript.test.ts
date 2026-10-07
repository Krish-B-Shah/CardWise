// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { RecommendationResult } from '../src/shared/types.js';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.resetModules(); });

it('tracks lab merchant changes at the same amount, ignores stale replies, and never invents a failed recommendation', async () => {
  vi.resetModules();
  const requests: { payload: { domain: string; category: string; amount: number }; reply: (value: unknown) => void }[] = [];
  let runObserver = () => {};
  vi.stubGlobal('MutationObserver', class { constructor(callback: () => void) { runObserver = callback; } observe() {} disconnect() {} });
  vi.useFakeTimers();
  history.replaceState(null, '', '/demo-store');
  document.body.innerHTML = '<div id="checkout-container" data-cardwise-store="amazon"><span id="order-subtotal">$100.00</span></div>';
  sessionStorage.clear();
  vi.stubGlobal('chrome', { runtime: { sendMessage: (message: { payload: typeof requests[number]['payload'] }, reply: typeof requests[number]['reply']) => requests.push({ ...message, reply }) } });
  await import('../src/content/contentScript.js');
  expect(requests[0].payload).toEqual({ domain: 'amazon.com', category: 'online_shopping', amount: 100 });
  document.getElementById('checkout-container')!.setAttribute('data-cardwise-store', 'bestbuy');
  window.dispatchEvent(new Event('cardwise:cart-updated'));
  expect(requests[1].payload).toEqual({ domain: 'bestbuy.com', category: 'electronics', amount: 100 });
  // A reply to the previous merchant must not replace the current UI.
  const oldRecommendation: RecommendationResult = {
    bestCard: { id: 'fixture', name: 'STALE CARD', bank: 'Test', network: 'Visa', lastFour: '0000', colorGradient: '', cashbackRate: 0, cashbackPercentage: '0%', estimatedCashback: 0, rewardRuleDescription: 'Test fixture' },
    alternatives: [], merchant: { name: 'Old merchant', domain: 'amazon.com', category: 'online_shopping' }, purchaseAmount: 100, savingsVsBaseline: 0, explanation: 'Test fixture'
  };
  requests[0].reply({ success: true, payload: oldRecommendation });
  expect(document.getElementById('cardwise-checkout-host')!.shadowRoot!.textContent).not.toContain('STALE CARD');
  requests[1].reply({ success: false, error: 'Offline' });
  let shadow = document.getElementById('cardwise-checkout-host')!.shadowRoot!;
  expect(shadow.textContent).toContain('Recommendation unavailable');
  expect(shadow.querySelector('.cw-card-highlight')).toBeNull();
  const input = shadow.querySelector('input')!;
  input.value = '25';
  [...shadow.querySelectorAll('button')].find(button => button.textContent === 'Update')!.click();
  expect(requests[2].payload.amount).toBe(25);
  runObserver();
  vi.advanceTimersByTime(700);
  expect(requests).toHaveLength(3); // Panel mutations must not overwrite a manual amount.
  document.getElementById('order-subtotal')!.remove();
  window.dispatchEvent(new Event('cardwise:cart-updated'));
  expect(requests).toHaveLength(3); // No $100 fallback on failed extraction.
  shadow = document.getElementById('cardwise-checkout-host')!.shadowRoot!;
  expect(shadow.textContent).toContain('Subtotal not detected');
  expect(shadow.querySelector('input')?.value).toBe('');
});
