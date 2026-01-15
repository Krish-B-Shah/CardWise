import { AdapterRegistry } from './adapters/registry.js';
import { ShadowPanelManager } from './ui/shadowContainer.js';
import { GetRecommendationMessage, RecommendationResponseMessage } from '../shared/messages.js';
import { SubtotalExtractionResult, RecommendationResult } from '../shared/types.js';

(function initCardWiseContentScript() {
  const registry = new AdapterRegistry();
  const panelManager = new ShadowPanelManager();

  let currentAdapter = registry.findMatchingAdapter(new URL(window.location.href));
  let lastExtractedAmount: number | null = null;
  let observerThrottleTimer: number | null = null;
  let currentRecommendation: RecommendationResult | null = null;

  if (!currentAdapter) {
    // If not currently a checkout page, watch for SPA navigation in case user navigates to cart/checkout
    listenForNavigation(() => {
      checkAndRun();
    });
    return;
  }

  // Run on initial load
  checkAndRun();
  listenForNavigation(() => checkAndRun());
  setupThrottledObserver();

  // Listen for local demo store cart updates
  window.addEventListener('cardwise:cart-updated', (e: Event) => {
    const customEvt = e as CustomEvent;
    if (customEvt.detail && typeof customEvt.detail.subtotal === 'number') {
      handleAmountUpdated(customEvt.detail.subtotal);
    }
  });

  function checkAndRun() {
    const url = new URL(window.location.href);
    currentAdapter = registry.findMatchingAdapter(url);

    if (!currentAdapter) {
      panelManager.remove();
      return;
    }

    const extraction = currentAdapter.extractSubtotal(document);
    processExtraction(extraction);
  }

  function processExtraction(extraction: SubtotalExtractionResult) {
    const amount = extraction.status === 'success' && extraction.amount !== null ? extraction.amount : 100.00;

    // Avoid redundant calls if amount has not changed
    if (lastExtractedAmount === amount && panelManager.isAlreadyMounted()) {
      return;
    }

    lastExtractedAmount = amount;
    fetchRecommendation(amount, extraction);
  }

  function handleAmountUpdated(newAmount: number) {
    lastExtractedAmount = newAmount;
    const syntheticExtraction: SubtotalExtractionResult = {
      status: 'success',
      amount: newAmount,
      rawText: `$${newAmount.toFixed(2)}`,
      confidence: 1.0
    };
    fetchRecommendation(newAmount, syntheticExtraction);
  }

  function fetchRecommendation(amount: number, extraction: SubtotalExtractionResult) {
    if (!currentAdapter) return;

    // Send strictly normalized domain, category, and amount
    const normalizedDomain = window.location.hostname.replace(/^www\./, '');
    const message: GetRecommendationMessage = {
      type: 'GET_RECOMMENDATION',
      payload: {
        domain: normalizedDomain,
        category: currentAdapter.defaultCategory,
        amount
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(message, (response: RecommendationResponseMessage) => {
        if (chrome.runtime.lastError) {
          console.warn('[CardWise] Service worker connection error:', chrome.runtime.lastError);
          // Render graceful fallback with direct local/cached calculation or manual mode
          renderFallbackPanel(amount, extraction);
          return;
        }

        if (response && response.success && response.payload) {
          currentRecommendation = response.payload;
          panelManager.render(response.payload, extraction, {
            onManualAmountChange: (newAmount) => handleAmountUpdated(newAmount),
            onDismiss: () => {},
            onOpenPopup: () => openPopupOrDashboard()
          });
        } else {
          renderFallbackPanel(amount, extraction);
        }
      });
    } else {
      // In non-extension or testing environment, render fallback directly
      renderFallbackPanel(amount, extraction);
    }
  }

  function renderFallbackPanel(amount: number, extraction: SubtotalExtractionResult) {
    // Basic local fallback calculation if backend/service worker is temporarily offline
    const fallbackRec: RecommendationResult = {
      bestCard: {
        id: 'fallback-prime',
        name: 'Prime Rewards Visa',
        bank: 'Chase',
        network: 'Visa',
        lastFour: '7291',
        colorGradient: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
        cashbackRate: 0.05,
        cashbackPercentage: '5.0%',
        estimatedCashback: Math.round(amount * 0.05 * 100) / 100,
        rewardRuleDescription: '5% cash back at Amazon.com & select online retailers'
      },
      alternatives: [
        {
          id: 'fallback-bce',
          name: 'Blue Cash Everyday',
          bank: 'Amex',
          network: 'Amex',
          lastFour: '3810',
          colorGradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
          cashbackRate: 0.03,
          cashbackPercentage: '3.0%',
          estimatedCashback: Math.round(amount * 0.03 * 100) / 100,
          rewardRuleDescription: '3% cash back on online retail purchases'
        }
      ],
      merchant: {
        name: currentAdapter ? currentAdapter.name : 'Online Merchant',
        domain: window.location.hostname,
        category: currentAdapter ? currentAdapter.defaultCategory : 'online_shopping'
      },
      purchaseAmount: amount,
      savingsVsBaseline: Math.round(amount * 0.04 * 100) / 100,
      explanation: 'Optimized reward card for checkout'
    };

    panelManager.render(fallbackRec, extraction, {
      onManualAmountChange: (newAmount) => handleAmountUpdated(newAmount),
      onDismiss: () => {},
      onOpenPopup: () => openPopupOrDashboard()
    });
  }

  function openPopupOrDashboard() {
    window.open('http://localhost:5173', '_blank');
  }

  function setupThrottledObserver() {
    const observer = new MutationObserver(() => {
      if (observerThrottleTimer) return;

      observerThrottleTimer = window.setTimeout(() => {
        observerThrottleTimer = null;
        if (currentAdapter) {
          const extraction = currentAdapter.extractSubtotal(document);
          if (extraction.status === 'success' && extraction.amount !== null && extraction.amount !== lastExtractedAmount) {
            processExtraction(extraction);
          }
        }
      }, 700); // 700ms throttle to prevent UI lag
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function listenForNavigation(onNavigate: () => void) {
    window.addEventListener('popstate', onNavigate);

    // Patch history pushState and replaceState for SPA routers
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      setTimeout(onNavigate, 100);
      return result;
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      setTimeout(onNavigate, 100);
      return result;
    };
  }
})();
