import { MerchantAdapter } from './types.js';
import { SubtotalExtractionResult } from '../../shared/types.js';
import { parseCurrencyText, safeTextContent } from './baseAdapter.js';

export class AmazonAdapter implements MerchantAdapter {
  readonly id = 'amazon';
  readonly name = 'Amazon';
  readonly defaultCategory = 'online_shopping';
  readonly supportedDomains = ['amazon.com', 'www.amazon.com', 'smile.amazon.com'];

  private readonly selectors = [
    { query: '#sc-subtotal-amount-buybox .a-price .a-offscreen', confidence: 0.95 },
    { query: '#sc-subtotal-amount-activecart .a-price .a-offscreen', confidence: 0.95 },
    { query: '#subtotal .a-offscreen', confidence: 0.90 },
    { query: '[data-testid="amazon-subtotal"] .a-offscreen', confidence: 0.90 },
    { query: '#subtotal', confidence: 0.85 },
    { query: '.order-summary__subtotal', confidence: 0.80 },
    { query: '#subtotals-marketplace-table .grand-total-price', confidence: 0.75 }
  ];

  matches(url: URL): boolean {
    const host = url.hostname.toLowerCase();
    const isHost = this.supportedDomains.some(d => host === d || host.endsWith('.' + d));
    if (!isHost) return false;

    const path = url.pathname.toLowerCase();
    return (
      path.includes('/cart') ||
      path.includes('/gp/cart') ||
      path.includes('/buy/payselect') ||
      path.includes('/gp/buy') ||
      path.includes('/checkout')
    );
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
      errorMessage: 'Could not detect Amazon subtotal from known selectors'
    };
  }
}
