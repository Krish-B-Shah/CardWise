export interface CheckoutContext { domain: string; category: string }

const DEMO_STORES: Record<string, CheckoutContext> = {
  amazon: { domain: 'amazon.com', category: 'online_shopping' },
  bestbuy: { domain: 'bestbuy.com', category: 'electronics' },
  target: { domain: 'target.com', category: 'retail' },
  custom: { domain: 'localhost', category: 'online_shopping' }
};

// Only the local simulator may select a merchant from this fixed allowlist.
export function checkoutContext(url: URL, doc: Document, defaultCategory: string): CheckoutContext {
  if (['localhost', '127.0.0.1'].includes(url.hostname) && url.pathname === '/demo-store') {
    const store = doc.getElementById('checkout-container')?.getAttribute('data-cardwise-store');
    if (store && Object.hasOwn(DEMO_STORES, store)) return { ...DEMO_STORES[store] };
  }
  return { domain: url.hostname.replace(/^www\./, ''), category: defaultCategory };
}
