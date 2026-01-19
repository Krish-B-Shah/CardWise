import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { AmazonAdapter } from '../src/content/adapters/amazonAdapter.js';
import { BestBuyAdapter } from '../src/content/adapters/bestbuyAdapter.js';
import { TargetAdapter, LocalDemoStoreAdapter } from '../src/content/adapters/targetAdapter.js';
import { AdapterRegistry } from '../src/content/adapters/registry.js';
import { parseCurrencyText, isElementSensitive } from '../src/content/adapters/baseAdapter.js';

describe('Merchant Adapters Unit Tests', () => {
  describe('Base Adapter Utilities', () => {
    it('parses various currency formats safely', () => {
      expect(parseCurrencyText('$149.99')).toBe(149.99);
      expect(parseCurrencyText('1,249.50 USD')).toBe(1249.50);
      expect(parseCurrencyText('   $ 89.00  ')).toBe(89.00);
      expect(parseCurrencyText('Free')).toBeNull();
      expect(parseCurrencyText(null)).toBeNull();
      expect(parseCurrencyText('-50.00')).toBe(50.00); // stripped minus sign or positive
    });

    it('identifies sensitive DOM elements to protect user privacy', () => {
      const dom = new JSDOM(`
        <div>
          <input type="password" id="pass" />
          <input type="text" name="creditcard_number" />
          <input type="text" id="cvv" />
          <span id="subtotal">$149.99</span>
        </div>
      `);
      const doc = dom.window.document;

      expect(isElementSensitive(doc.getElementById('pass')!)).toBe(true);
      expect(isElementSensitive(doc.querySelector('[name="creditcard_number"]')!)).toBe(true);
      expect(isElementSensitive(doc.getElementById('cvv')!)).toBe(true);
      expect(isElementSensitive(doc.getElementById('subtotal')!)).toBe(false);
    });
  });

  describe('AmazonAdapter', () => {
    const adapter = new AmazonAdapter();

    it('matches Amazon cart and checkout URLs', () => {
      expect(adapter.matches(new URL('https://www.amazon.com/gp/cart/view.html'))).toBe(true);
      expect(adapter.matches(new URL('https://amazon.com/checkout/summary'))).toBe(true);
      expect(adapter.matches(new URL('https://www.amazon.com/product/B08N5WRWNW'))).toBe(false);
      expect(adapter.matches(new URL('https://www.google.com'))).toBe(false);
    });

    it('extracts subtotal from Amazon buybox and cart DOM structure', () => {
      const dom = new JSDOM(`
        <div>
          <div id="sc-subtotal-amount-buybox">
            <span class="a-price"><span class="a-offscreen">$229.95</span></span>
          </div>
        </div>
      `);
      const res = adapter.extractSubtotal(dom.window.document);
      expect(res.status).toBe('success');
      expect(res.amount).toBe(229.95);
      expect(res.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('handles DOM change gracefully with failed status and zero confidence', () => {
      const dom = new JSDOM(`<div><span>Unrecognized structure</span></div>`);
      const res = adapter.extractSubtotal(dom.window.document);
      expect(res.status).toBe('failed');
      expect(res.amount).toBeNull();
      expect(res.confidence).toBe(0);
    });
  });

  describe('BestBuyAdapter', () => {
    const adapter = new BestBuyAdapter();

    it('matches Best Buy checkout URLs', () => {
      expect(adapter.matches(new URL('https://www.bestbuy.com/cart'))).toBe(true);
      expect(adapter.matches(new URL('https://www.bestbuy.com/checkout'))).toBe(true);
      expect(adapter.matches(new URL('https://www.bestbuy.com/site/apple-ipad/6526848.p'))).toBe(false);
    });

    it('extracts order total from Best Buy automation attribute', () => {
      const dom = new JSDOM(`
        <div>
          <div class="price-summary__total-value" data-automation-id="order-total">$649.99</div>
        </div>
      `);
      const res = adapter.extractSubtotal(dom.window.document);
      expect(res.status).toBe('success');
      expect(res.amount).toBe(649.99);
      expect(res.confidence).toBe(0.95);
    });
  });

  describe('LocalDemoStoreAdapter', () => {
    const adapter = new LocalDemoStoreAdapter();

    it('matches localhost demo-store URL', () => {
      expect(adapter.matches(new URL('http://localhost:3001/demo-store'))).toBe(true);
      expect(adapter.matches(new URL('http://127.0.0.1:3001/demo-store'))).toBe(true);
    });

    it('extracts subtotal from simulated store elements', () => {
      const dom = new JSDOM(`
        <div>
          <div id="active-subtotal-elem">$161.99</div>
        </div>
      `);
      const res = adapter.extractSubtotal(dom.window.document);
      expect(res.status).toBe('success');
      expect(res.amount).toBe(161.99);
    });
  });

  describe('AdapterRegistry', () => {
    const registry = new AdapterRegistry();

    it('resolves correct adapter for each supported store', () => {
      expect(registry.findMatchingAdapter(new URL('https://www.amazon.com/cart'))?.id).toBe('amazon');
      expect(registry.findMatchingAdapter(new URL('https://www.bestbuy.com/checkout'))?.id).toBe('bestbuy');
      expect(registry.findMatchingAdapter(new URL('http://localhost:3001/demo-store'))?.id).toBe('localdemostore');
      expect(registry.findMatchingAdapter(new URL('https://www.wikipedia.org'))).toBeNull();
    });
  });
});
