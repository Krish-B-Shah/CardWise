import { expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { getDemoStoreHtml } from '../../backend/src/demoStoreHtml.js';
import { checkoutContext } from '../src/content/checkoutContext.js';
import { LocalDemoStoreAdapter } from '../src/content/adapters/targetAdapter.js';

it('runs the real simulator script and extracts the selected merchant and amount', async () => {
  const dom = new JSDOM(getDemoStoreHtml(), { url: 'http://localhost:3001/demo-store', runScripts: 'dangerously' });
  try {
    await new Promise(resolve => dom.window.addEventListener('load', resolve, { once: true }));
    const adapter = new LocalDemoStoreAdapter();
    const context = () => checkoutContext(new URL(dom.window.location.href), dom.window.document, adapter.defaultCategory);
    expect(context().domain).toBe('amazon.com');
    expect(adapter.extractSubtotal(dom.window.document).amount).toBe(179.98);
    (dom.window as unknown as { switchStore: (key: string) => void }).switchStore('bestbuy');
    expect(context()).toEqual({ domain: 'bestbuy.com', category: 'electronics' });
    expect(adapter.extractSubtotal(dom.window.document).amount).toBe(648.99);
    (dom.window as unknown as { switchStore: (key: string) => void }).switchStore('target');
    expect(context()).toEqual({ domain: 'target.com', category: 'retail' });
    expect(adapter.extractSubtotal(dom.window.document).amount).toBe(394.99);
  } finally { dom.window.close(); }
});
