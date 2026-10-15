import { AdapterRegistry } from './adapters/registry.js';
import { ShadowPanelManager, PanelCallbacks } from './ui/shadowContainer.js';
import { RecommendationResponseMessage } from '../shared/messages.js';
import { SubtotalExtractionResult } from '../shared/types.js';
import { isRecommendation } from '../shared/backend.js';
import { checkoutContext } from './checkoutContext.js';

(function initCardWiseContentScript() {
  const registry = new AdapterRegistry();
  const panel = new ShadowPanelManager();
  let lastKey = '';
  let requestVersion = 0;
  let throttle: number | undefined;

  function request(amount: number | null, extraction: SubtotalExtractionResult) {
    const url = new URL(location.href);
    const adapter = registry.findMatchingAdapter(url);
    if (!adapter) { requestVersion++; lastKey = ''; panel.remove(); return; }
    const context = checkoutContext(url, document, adapter.defaultCategory);
    const version = ++requestVersion;
    const callbacks: PanelCallbacks = {
      onManualAmountChange: value => {
        if (Number.isFinite(value) && value >= 0) request(value, { status: 'success', amount: value, rawText: null, confidence: 0 });
      },
      onRetry: () => request(amount, extraction),
      onDismiss: () => {},
      onOpenPopup: () => { window.open('http://localhost:5173', '_blank', 'noopener'); }
    };
    if (amount === null) {
      panel.render(null, extraction, callbacks, 'Subtotal not detected. Enter an amount to request an estimate.');
      return;
    }
    panel.render(null, extraction, callbacks, 'Requesting a recommendation…');
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
      panel.render(null, extraction, callbacks);
      return;
    }
    const timeout = window.setTimeout(() => {
      if (version === requestVersion && location.href === url.href) panel.render(null, extraction, callbacks);
    }, 12000);
    try {
      chrome.runtime.sendMessage({ type: 'GET_RECOMMENDATION', payload: { ...context, amount } }, (response: RecommendationResponseMessage) => {
        window.clearTimeout(timeout);
        const transportError = chrome.runtime.lastError;
        if (version !== requestVersion || location.href !== url.href) return;
        if (!transportError && response?.success && isRecommendation(response.payload)) panel.render(response.payload, extraction, callbacks);
        else panel.render(null, extraction, callbacks);
      });
    } catch {
      window.clearTimeout(timeout);
      panel.render(null, extraction, callbacks);
    }
  }

  function checkAndRun() {
    const url = new URL(location.href);
    const adapter = registry.findMatchingAdapter(url);
    if (!adapter) { requestVersion++; lastKey = ''; panel.remove(); return; }
    const extraction = adapter.extractSubtotal(document);
    const amount = extraction.status === 'success' && extraction.amount !== null && Number.isFinite(extraction.amount) ? extraction.amount : null;
    const context = checkoutContext(url, document, adapter.defaultCategory);
    const key = JSON.stringify([url.href, context.domain, context.category, amount]);
    if (key !== lastKey) { lastKey = key; request(amount, extraction); }
  }

  checkAndRun();
  window.addEventListener('popstate', checkAndRun);
  // Re-read the DOM, rather than trusting custom event payloads.
  window.addEventListener('cardwise:cart-updated', checkAndRun);
  const observer = new MutationObserver(() => {
    if (throttle !== undefined) return;
    throttle = window.setTimeout(() => { throttle = undefined; checkAndRun(); }, 700);
  });
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-cardwise-store'] });
})();
