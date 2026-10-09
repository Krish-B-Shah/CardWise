// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import { checkoutContext } from '../src/content/checkoutContext.js';
import { backendRequest } from '../src/shared/backend.js';
import { ShadowPanelManager } from '../src/content/ui/shadowContainer.js';
import { displayRecommendation, queryRecommendation, renderCards, setupCalculator, setupTabs, syncData } from '../src/popup/popup.js';
import { RecommendationResult } from '../src/shared/types.js';

// Deliberately malicious strings are test inputs, not saved portfolio data.
const malicious = '<img src=x onerror="alert(1)">';
const fixture: RecommendationResult = {
  bestCard: { id: 'fixture', name: malicious, bank: malicious, network: 'Test', lastFour: '0000', colorGradient: '', cashbackRate: 0, cashbackPercentage: '0%', estimatedCashback: 0, rewardRuleDescription: malicious },
  alternatives: [], merchant: { name: malicious, domain: 'test.example', category: 'general' }, purchaseAmount: 0, savingsVsBaseline: 0, explanation: malicious
};
fixture.alternatives = [{ ...fixture.bestCard }];

beforeEach(() => {
  document.body.innerHTML = fs.readFileSync('src/popup/popup.html', 'utf8');
  sessionStorage.clear();
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('Extension readiness regressions', () => {
  it('switches popup tabs using the actual HTML selectors', () => {
    setupTabs();
    document.querySelector<HTMLButtonElement>('[data-tab="cards-tab"]')!.click();
    expect(document.getElementById('cards-tab')?.classList.contains('active')).toBe(true);
    expect(document.getElementById('active-tab')?.classList.contains('active')).toBe(false);
  });

  it('renders editable portfolio and recommendation strings as text', () => {
    displayRecommendation(fixture);
    renderCards([{ id: 'test', name: malicious, bank: malicious, network: malicious, last_four: '0000', annual_fee: 0, credit_limit: 1, color_gradient: '', rules: [{ id: 'r', card_id: 'test', category: malicious, reward_rate: 0 }] }]);
    expect(document.querySelector('img')).toBeNull();
    expect(document.getElementById('alternatives-list')?.textContent).toContain(malicious);
    expect(document.getElementById('cards-list-container')?.textContent).toContain(malicious);
  });

  it('removes old recommendations and offers retry after communication failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')));
    displayRecommendation(fixture);
    await queryRecommendation('amazon.com', 100);
    expect(document.getElementById('best-card-banner')?.style.display).toBe('none');
    expect(document.getElementById('rec-loading')?.textContent).toContain('unavailable');
    expect(document.getElementById('rec-loading')?.textContent).toContain('retry');
    expect(document.getElementById('alternatives-list')?.textContent).toBe('');
    expect(document.getElementById('rec-details')?.style.display).toBe('block');
  });

  it('rejects HTTP failures and malformed success payloads', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{"error":"Unavailable"}', { status: 503 })).mockResolvedValueOnce(new Response('{}')));
    await expect(backendRequest('recommend', {})).rejects.toThrow('Unavailable');
    await expect(backendRequest('recommend', {})).rejects.toThrow('Invalid recommendation');
  });

  it('does not announce successful popup sync after failed runtime messaging', async () => {
    vi.stubGlobal('chrome', { runtime: { sendMessage: (_request: unknown, callback: (value: unknown) => void) => callback({ success: false }) } });
    await syncData();
    expect(document.getElementById('sync-status-text')?.textContent).toContain('Sync unavailable');
    expect(document.getElementById('sync-status-text')?.textContent).not.toContain('successful');
  });

  it('renders calculator responses safely and handles retryable errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(fixture))).mockRejectedValueOnce(new Error('Offline')));
    setupCalculator();
    const button = document.getElementById('run-calc-btn') as HTMLButtonElement;
    await button.onclick!.call(button, new MouseEvent('click') as PointerEvent);
    expect(document.getElementById('calc-result-box')?.textContent).toContain(malicious);
    expect(document.querySelector('img')).toBeNull();
    await button.onclick!.call(button, new MouseEvent('click') as PointerEvent);
    expect(document.getElementById('calc-result-box')?.textContent).toContain('unavailable');
    expect(button.disabled).toBe(false);
  });

  it('uses simulator context only on the local lab and only from its allowlist', () => {
    document.body.innerHTML = '<div id="checkout-container" data-cardwise-store="bestbuy"></div>';
    expect(checkoutContext(new URL('http://localhost:3001/demo-store'), document, 'online_shopping')).toEqual({ domain: 'bestbuy.com', category: 'electronics' });
    expect(checkoutContext(new URL('https://target.com/cart'), document, 'retail')).toEqual({ domain: 'target.com', category: 'retail' });
    document.getElementById('checkout-container')!.setAttribute('data-cardwise-store', 'untrusted');
    expect(checkoutContext(new URL('http://localhost:3001/demo-store'), document, 'online_shopping').domain).toBe('localhost');
  });

  it('shows unavailable/manual input states without invented cards or amounts', () => {
    const panel = new ShadowPanelManager();
    const retry = vi.fn();
    panel.render(null, { status: 'failed', amount: null, rawText: null, confidence: 0 }, { onRetry: retry, onDismiss: vi.fn(), onOpenPopup: vi.fn(), onManualAmountChange: vi.fn() });
    const shadow = document.getElementById('cardwise-checkout-host')!.shadowRoot!;
    expect(shadow.textContent).toContain('Recommendation unavailable');
    expect(shadow.querySelector('.cw-card-highlight')).toBeNull();
    expect(shadow.querySelector('input')?.value).toBe('');
    [...shadow.querySelectorAll('button')].find(button => button.textContent === 'Retry')!.click();
    expect(retry).toHaveBeenCalledOnce();
    panel.remove();
  });
});
