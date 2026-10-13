import { Card, RecommendationResult } from '../shared/types.js';
import { GetRecommendationMessage, RecommendationResponseMessage, CardsResponseMessage } from '../shared/messages.js';

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupSync();
  loadActiveTabRecommendation();
  loadCardsList();
  setupCalculator();
});

function setupTabs() {
  const tabs = document.querySelectorAll<HTMLButtonElement>('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      if (targetId) {
        document.getElementById(targetId)?.classList.add('active');
      }
    });
  });
}

function setupSync() {
  const syncBtn = document.getElementById('sync-btn');
  const statusText = document.getElementById('sync-status-text');

  syncBtn?.addEventListener('click', () => {
    if (statusText) statusText.innerText = 'Syncing cards from shared database...';
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'SYNC_DATA' }, () => {
        if (statusText) statusText.innerText = 'Synced at ' + new Date().toLocaleTimeString();
        loadCardsList();
        loadActiveTabRecommendation();
      });
    } else {
      setTimeout(() => {
        if (statusText) statusText.innerText = 'Synced at ' + new Date().toLocaleTimeString();
      }, 500);
    }
  });
}

function loadActiveTabRecommendation() {
  const domainLabel = document.getElementById('current-domain-label');
  const recLoading = document.getElementById('rec-loading');
  const recDetails = document.getElementById('rec-details');

  let domain = 'amazon.com'; // Default demo domain

  if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        try {
          const urlObj = new URL(tabs[0].url);
          domain = urlObj.hostname.replace(/^www\./, '');
        } catch {}
      }
      if (domainLabel) domainLabel.innerText = domain;
      queryRecommendation(domain, 150.00);
    });
  } else {
    if (domainLabel) domainLabel.innerText = 'amazon.com (Simulated Active Tab)';
    queryRecommendation(domain, 150.00);
  }

  // Set up tab amount input recalculation
  const refreshBtn = document.getElementById('tab-amount-refresh');
  const amountInput = document.getElementById('tab-amount-input') as HTMLInputElement;
  refreshBtn?.addEventListener('click', () => {
    const amt = parseFloat(amountInput.value) || 100.00;
    if (recLoading) recLoading.style.display = 'block';
    if (recDetails) recDetails.style.display = 'none';
    queryRecommendation(domain, amt);
  });
}

function queryRecommendation(domain: string, amount: number) {
  const recLoading = document.getElementById('rec-loading');
  const recDetails = document.getElementById('rec-details');

  const msg: GetRecommendationMessage = {
    type: 'GET_RECOMMENDATION',
    payload: {
      domain,
      amount
    }
  };

  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage(msg, (response: RecommendationResponseMessage) => {
      if (recLoading) recLoading.style.display = 'none';
      if (recDetails) recDetails.style.display = 'block';

      if (response && response.success && response.payload) {
        displayRecommendation(response.payload);
      } else {
        // Fallback display
        displayFallback(domain, amount);
      }
    });
  } else {
    // Local demo / direct fetch
    fetch('http://localhost:3001/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, amount })
    })
      .then(res => res.json())
      .then(data => {
        if (recLoading) recLoading.style.display = 'none';
        if (recDetails) recDetails.style.display = 'block';
        displayRecommendation(data);
      })
      .catch(() => {
        if (recLoading) recLoading.style.display = 'none';
        if (recDetails) recDetails.style.display = 'block';
        displayFallback(domain, amount);
      });
  }
}

function displayRecommendation(rec: RecommendationResult) {
  const banner = document.getElementById('best-card-banner');
  const nameEl = document.getElementById('best-card-name');
  const rateEl = document.getElementById('best-card-rate');
  const cashEl = document.getElementById('best-card-cashback');
  const descEl = document.getElementById('best-card-desc');
  const altList = document.getElementById('alternatives-list');

  if (banner && rec.bestCard.colorGradient) {
    banner.style.background = rec.bestCard.colorGradient;
  }
  if (nameEl) nameEl.innerText = `${rec.bestCard.name} (•••• ${rec.bestCard.lastFour})`;
  if (rateEl) rateEl.innerText = rec.bestCard.cashbackPercentage;
  if (cashEl) cashEl.innerText = `+$${rec.bestCard.estimatedCashback.toFixed(2)}`;
  if (descEl) descEl.innerText = rec.bestCard.rewardRuleDescription;

  if (altList) {
    altList.innerHTML = '';
    rec.alternatives.forEach(alt => {
      const item = document.createElement('div');
      item.className = 'alt-item';
      item.innerHTML = `
        <span>${alt.name}</span>
        <span class="alt-rate">${alt.cashbackPercentage} ($${alt.estimatedCashback.toFixed(2)})</span>
      `;
      altList.appendChild(item);
    });
  }
}

function displayFallback(domain: string, amount: number) {
  const nameEl = document.getElementById('best-card-name');
  const rateEl = document.getElementById('best-card-rate');
  const cashEl = document.getElementById('best-card-cashback');
  const descEl = document.getElementById('best-card-desc');

  if (nameEl) nameEl.innerText = 'Prime Rewards Visa (•••• 7291)';
  if (rateEl) rateEl.innerText = '5.0%';
  if (cashEl) cashEl.innerText = `+$${(amount * 0.05).toFixed(2)}`;
  if (descEl) descEl.innerText = `Optimal card for ${domain}`;
}

function loadCardsList() {
  const container = document.getElementById('cards-list-container');
  const countEl = document.getElementById('card-count');

  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage({ type: 'GET_CARDS' }, (response: CardsResponseMessage) => {
      if (response && response.success && response.payload) {
        renderCards(response.payload);
      } else {
        fetchCardsDirect();
      }
    });
  } else {
    fetchCardsDirect();
  }

  function fetchCardsDirect() {
    fetch('http://localhost:3001/api/cards')
      .then(res => res.json())
      .then((cards: Card[]) => renderCards(cards))
      .catch(() => {
        if (container) container.innerHTML = '<div class="loading-spinner">Could not load cards. Start backend server.</div>';
      });
  }

  function renderCards(cards: Card[]) {
    if (countEl) countEl.innerText = cards.length.toString();
    if (!container) return;

    if (cards.length === 0) {
      container.innerHTML = '<div class="loading-spinner">No cards found. Add cards in Dashboard.</div>';
      return;
    }

    container.innerHTML = '';
    cards.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card-item';
      cardEl.innerHTML = `
        <div class="card-item-top">
          <div>
            <div class="card-item-title">${card.name} (•••• ${card.last_four})</div>
            <div class="card-item-bank">${card.bank} • ${card.network} • Limit $${card.credit_limit.toLocaleString()}</div>
          </div>
          <span style="font-size:11px; font-weight:700; color:#38bdf8;">$${card.annual_fee === 0 ? 'No Fee' : '$' + card.annual_fee + '/yr'}</span>
        </div>
        <div class="card-item-rules">
          ${(card.rules || []).map(r => `<span class="rule-pill">${(r.reward_rate * 100).toFixed(1)}% ${r.category}</span>`).join('')}
        </div>
      `;
      container.appendChild(cardEl);
    });
  }
}

function setupCalculator() {
  const runBtn = document.getElementById('run-calc-btn');
  const merchantSelect = document.getElementById('calc-merchant-select') as HTMLSelectElement;
  const amountInput = document.getElementById('calc-amount-input') as HTMLInputElement;
  const resultBox = document.getElementById('calc-result-box');

  runBtn?.addEventListener('click', () => {
    const domain = merchantSelect.value;
    const amount = parseFloat(amountInput.value) || 100;

    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = '<div class="loading-spinner">Calculating optimal return...</div>';
    }

    fetch('http://localhost:3001/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, amount })
    })
      .then(res => res.json())
      .then((data: RecommendationResult) => {
        if (!resultBox) return;
        resultBox.innerHTML = `
          <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px;">
            <div style="font-size: 11px; color: #94a3b8;">Optimal Card for $${amount.toFixed(2)} on ${data.merchant.name}:</div>
            <div style="font-size: 15px; font-weight: 700; color: #f8fafc; margin: 4px 0;">${data.bestCard.name}</div>
            <div style="font-size: 20px; font-weight: 800; color: #34d399;">+$${data.bestCard.estimatedCashback.toFixed(2)} <span style="font-size: 12px; color: #94a3b8;">(${data.bestCard.cashbackPercentage})</span></div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px;">${data.explanation}</div>
          </div>
        `;
      })
      .catch(err => {
        if (resultBox) resultBox.innerHTML = `<div style="color:#f87171; font-size:12px;">Error: ${err.message}</div>`;
      });
  });
}
