import { MerchantAdapter } from './types.js';
import { SubtotalExtractionResult } from '../../shared/types.js';
import { parseCurrencyText, safeTextContent } from './baseAdapter.js';

export class TargetAdapter implements MerchantAdapter {
  readonly id = 'target';
  readonly name = 'Target';
  readonly defaultCategory = 'retail';
  readonly supportedDomains = ['target.com', 'www.target.com'];

  private readonly selectors = [
    { query: '[data-test="cart-summary-total"]', confidence: 0.95 },
    { query: '[data-test="checkout-subtotal"]', confidence: 0.90 },
    { query: '.cart-summary-subtotal', confidence: 0.85 }
  ];

  matches(url: URL): boolean {
    const host = url.hostname.toLowerCase();
    const isHost = this.supportedDomains.some(d => host === d || host.endsWith('.' + d));
    if (!isHost) return false;

    const path = url.pathname.toLowerCase();
    return path.includes('/cart') || path.includes('/checkout');
  }

  extractSubtotal(doc: Document): SubtotalExtractionResult {
    for (const { query, confidence } of this.selectors) {
      const el = doc.querySelector(query);
      if (el) {
        const text = safeTextContent(el);
        const amount = parseCurrencyText(text);
        if (amount !== null) {
          return {
            status: 'success',
            amount,
            rawText: text,
            confidence,
            selectorUsed: query
          };
        }
      }
    }

    return {
      status: 'failed',
      amount: null,
      rawText: null,
      confidence: 0,
      errorMessage: 'Could not detect Target subtotal'
    };
  }
}

export class WalmartAdapter implements MerchantAdapter {
  readonly id = 'walmart';
  readonly name = 'Walmart';
  readonly defaultCategory = 'groceries';
  readonly supportedDomains = ['walmart.com', 'www.walmart.com'];

  private readonly selectors = [
    { query: '[data-automation-id="summary-subtotal"]', confidence: 0.95 },
    { query: '[data-automation-id="summary-price"]', confidence: 0.90 },
    { query: '.checkout-subtotal-amount', confidence: 0.85 }
  ];

  matches(url: URL): boolean {
    const host = url.hostname.toLowerCase();
    const isHost = this.supportedDomains.some(d => host === d || host.endsWith('.' + d));
    if (!isHost) return false;

    const path = url.pathname.toLowerCase();
    return path.includes('/cart') || path.includes('/checkout');
  }

  extractSubtotal(doc: Document): SubtotalExtractionResult {
    for (const { query, confidence } of this.selectors) {
      const el = doc.querySelector(query);
      if (el) {
        const text = safeTextContent(el);
        const amount = parseCurrencyText(text);
        if (amount !== null) {
          return {
            status: 'success',
            amount,
            rawText: text,
            confidence,
            selectorUsed: query
          };
        }
      }
    }

    return {
      status: 'failed',
      amount: null,
      rawText: null,
      confidence: 0,
      errorMessage: 'Could not detect Walmart subtotal'
    };
  }
}

export class LocalDemoStoreAdapter implements MerchantAdapter {
  readonly id = 'localdemostore';
  readonly name = 'CardWise Demo Store';
  readonly defaultCategory = 'online_shopping';
  readonly supportedDomains = ['localhost', '127.0.0.1'];

  private readonly selectors = [
    { query: '#active-subtotal-elem', confidence: 0.99 },
    { query: '#subtotal .a-offscreen', confidence: 0.95 },
    { query: '#subtotal', confidence: 0.90 },
    { query: '[data-automation-id="order-total"]', confidence: 0.95 },
    { query: '.price-summary__total-value', confidence: 0.90 },
    { query: '[data-test="cart-summary-total"]', confidence: 0.95 },
    { query: '#order-subtotal', confidence: 0.95 },
    { query: '#subtotal-val', confidence: 0.85 }
  ];

  matches(url: URL): boolean {
    const host = url.hostname.toLowerCase();
    const isHost = this.supportedDomains.includes(host);
    if (!isHost) return false;

    const path = url.pathname.toLowerCase();
    // Matches localhost demo-store, checkout lab, or simulated checkout pages
    return path.includes('/demo-store') || path.includes('/checkout') || path.includes('/cart');
  }

  extractSubtotal(doc: Document): SubtotalExtractionResult {
    for (const { query, confidence } of this.selectors) {
      const el = doc.querySelector(query);
      if (el) {
        const text = safeTextContent(el);
        const amount = parseCurrencyText(text);
        if (amount !== null) {
          return {
            status: 'success',
            amount,
            rawText: text,
            confidence,
            selectorUsed: query
          };
        }
      }
    }

    return {
      status: 'failed',
      amount: null,
      rawText: null,
      confidence: 0,
      errorMessage: 'Could not extract subtotal from demo store'
    };
  }
}
