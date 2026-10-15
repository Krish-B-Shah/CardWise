import { Card, RecommendationResult } from '../shared/types.js';
import { backendRequest, isRecommendation } from '../shared/backend.js';

function text(id: string, value: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function element(tag: string, value: string, className = '') {
  const el = document.createElement(tag);
  el.textContent = value;
  el.className = className;
  return el;
}

async function message(request: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('Backend request timed out')), 12000);
    chrome.runtime.sendMessage(request, response => {
      window.clearTimeout(timeout);
      const error = chrome.runtime.lastError;
      if (error || !response?.success) reject(new Error(error?.message || response?.error || 'Backend unavailable'));
      else resolve(response);
    });
  });
}

export function setupTabs() {
  document.querySelectorAll<HTMLButtonElement>('.nav-btn').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.nav-btn, .tab-panel').forEach(el => el.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab || '')?.classList.add('active');
    };
  });
}

export function displayRecommendation(rec: RecommendationResult) {
  text('best-card-name', `${rec.bestCard.name} (•••• ${rec.bestCard.lastFour})`);
  text('best-card-rate', rec.bestCard.cashbackPercentage);
  text('best-card-cashback', `+$${rec.bestCard.estimatedCashback.toFixed(2)}`);
  text('best-card-desc', rec.bestCard.rewardRuleDescription);
  const list = document.getElementById('alternatives-list');
  list?.replaceChildren();
  rec.alternatives.forEach(alt => {
    const row = element('div', '', 'alt-item');
    row.append(element('span', alt.name), element('span', `${alt.cashbackPercentage} ($${alt.estimatedCashback.toFixed(2)})`, 'alt-rate'));
    list?.append(row);
  });
}

export function renderCards(cards: Card[]) {
  text('card-count', String(cards.length));
  const container = document.getElementById('cards-list-container');
  container?.replaceChildren();
  if (!cards.length) container?.append(element('p', 'No cards configured. Add one in the dashboard.'));
  cards.forEach(card => {
    const row = element('div', '', 'card-item');
    row.append(element('div', `${card.name} (•••• ${card.last_four})`, 'card-item-title'));
    row.append(element('div', `${card.bank} · ${card.network} · Limit $${Number(card.credit_limit).toLocaleString()}`, 'card-item-bank'));
    row.append(element('div', Number(card.annual_fee) === 0 ? 'No annual fee' : `$${card.annual_fee}/yr`));
    const rules = element('div', '', 'card-item-rules');
    (card.rules || []).forEach(rule => rules.append(element('span', `${(rule.reward_rate * 100).toFixed(1)}% ${rule.category}`, 'rule-pill')));
    row.append(rules);
    container?.append(row);
  });
}

export async function queryRecommendation(domain: string, amount: number) {
  const loading = document.getElementById('rec-loading');
  const details = document.getElementById('rec-details');
  const banner = document.getElementById('best-card-banner');
  if (loading) { loading.style.display = 'block'; loading.textContent = 'Requesting estimate…'; }
  if (details) details.style.display = 'block';
  if (banner) banner.style.display = 'none';
  document.getElementById('alternatives-list')?.replaceChildren();
  try {
    if (!domain || !Number.isFinite(amount) || amount < 0) throw new Error('Invalid purchase context');
    const response = typeof chrome !== 'undefined' && typeof chrome.runtime?.sendMessage === 'function'
      ? (await message({ type: 'GET_RECOMMENDATION', payload: { domain, amount } })).payload
      : await backendRequest('recommend', { domain, amount });
    if (!isRecommendation(response)) throw new Error('Invalid recommendation response');
    displayRecommendation(response);
    if (banner) banner.style.display = 'block';
    if (loading) loading.style.display = 'none';
  } catch {
    if (loading) loading.textContent = 'Recommendation unavailable. Start the backend, check the amount, then select Recalculate to retry.';
  }
}

async function loadCardsList() {
  try {
    const response = typeof chrome !== 'undefined' && typeof chrome.runtime?.sendMessage === 'function'
      ? await message({ type: 'GET_CARDS' })
      : { payload: await backendRequest('cards') };
    renderCards(response.payload);
    if (response.cached) text('sync-status-text', 'Offline · showing cached wallet. Use Sync to retry.');
    return !response.cached;
  } catch {
    text('cards-list-container', 'Wallet unavailable. Start the backend and use Sync to retry.');
    text('sync-status-text', 'Wallet unavailable. Use Sync to retry.');
    return false;
  }
}

export async function syncData() {
  text('sync-status-text', 'Syncing…');
  try {
    if (typeof chrome !== 'undefined' && typeof chrome.runtime?.sendMessage === 'function') await message({ type: 'SYNC_DATA' });
    else { await backendRequest('cards'); await backendRequest('merchants'); }
    if (await loadCardsList()) text('sync-status-text', 'Last successful sync: ' + new Date().toLocaleTimeString());
  } catch {
    text('sync-status-text', 'Sync unavailable. Start the backend and use Sync to retry.');
  }
}

export function setupCalculator() {
  const button = document.getElementById('run-calc-btn') as HTMLButtonElement | null;
  if (!button) return;
  button.onclick = async () => {
    const box = document.getElementById('calc-result-box');
    if (!box) return;
    box.style.display = 'block';
    box.textContent = 'Calculating…';
    button.disabled = true;
    try {
      const domain = (document.getElementById('calc-merchant-select') as HTMLSelectElement).value;
      const amount = Number((document.getElementById('calc-amount-input') as HTMLInputElement).value);
      if (!Number.isFinite(amount) || amount < 0) throw new Error('Invalid amount');
      const rec = await backendRequest('recommend', { domain, amount }) as RecommendationResult;
      box.replaceChildren(element('div', rec.bestCard.name), element('div', `$${rec.bestCard.estimatedCashback.toFixed(2)} estimated cashback`), element('p', rec.explanation));
    } catch {
      box.textContent = 'Recommendation unavailable. Start the backend, check the amount, and select Find Highest Return Card to retry.';
    } finally { button.disabled = false; }
  };
}

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupCalculator();
  const sync = document.getElementById('sync-btn');
  if (sync) sync.onclick = () => { void syncData(); };
  let domain = '';
  const update = () => {
    text('current-domain-label', domain || 'Active tab unavailable');
    const amount = Number((document.getElementById('tab-amount-input') as HTMLInputElement)?.value);
    void queryRecommendation(domain, amount);
  };
  if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (chrome.runtime.lastError) { update(); return; }
      try { domain = new URL(tabs[0]?.url || '').hostname.replace(/^www\./, ''); } catch { /* Display unavailable. */ }
      update();
    });
  } else update();
  const refresh = document.getElementById('tab-amount-refresh') as HTMLButtonElement | null;
  if (refresh) refresh.onclick = async () => {
    refresh.disabled = true;
    try { await queryRecommendation(domain, Number((document.getElementById('tab-amount-input') as HTMLInputElement).value)); }
    finally { refresh.disabled = false; }
  };
  void loadCardsList();
});
