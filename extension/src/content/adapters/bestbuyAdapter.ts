import { MerchantAdapter } from './types.js';
import { SubtotalExtractionResult } from '../../shared/types.js';
import { parseCurrencyText, safeTextContent } from './baseAdapter.js';

export class BestBuyAdapter implements MerchantAdapter {
  readonly id = 'bestbuy';
  readonly name = 'Best Buy';
  readonly defaultCategory = 'electronics';
  readonly supportedDomains = ['bestbuy.com', 'www.bestbuy.com'];

  private readonly selectors = [
    { query: '[data-automation-id="order-total"]', confidence: 0.95 },
    { query: '.price-summary__total-value', confidence: 0.90 },
    { query: '.order-summary__price', confidence: 0.85 },
    { query: '.summary-subtotal__amount', confidence: 0.80 }
  ];

  matches(url: URL): boolean {
    const host = url.hostname.toLowerCase();
    const isHost = this.supportedDomains.some(d => host === d || host.endsWith('.' + d));
    if (!isHost) return false;

    const path = url.pathname.toLowerCase();
    return path.includes('/cart') || path.includes('/checkout') || path.includes('/order');
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
      errorMessage: 'Could not detect Best Buy subtotal'
    };
  }
}
