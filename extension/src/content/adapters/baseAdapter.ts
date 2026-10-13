/**
 * Safe DOM extraction helpers for CardWise Merchant Adapters
 */

const SENSITIVE_ATTR_PATTERNS = [
  'password',
  'card',
  'cvv',
  'cvc',
  'exp',
  'credit',
  'securitycode',
  'cc-number',
  'pan'
];

export function isElementSensitive(el: Element): boolean {
  if (el.tagName.toLowerCase() === 'input') {
    const inputType = (el.getAttribute('type') || '').toLowerCase();
    if (inputType === 'password') return true;
  }

  const nameAttr = (el.getAttribute('name') || '').toLowerCase();
  const idAttr = (el.getAttribute('id') || '').toLowerCase();
  const autocomplete = (el.getAttribute('autocomplete') || '').toLowerCase();

  for (const pattern of SENSITIVE_ATTR_PATTERNS) {
    if (nameAttr.includes(pattern) || idAttr.includes(pattern) || autocomplete.includes(pattern)) {
      return true;
    }
  }

  return false;
}

export function parseCurrencyText(raw: string | null | undefined): number | null {
  if (!raw) return null;

  // Extract amount pattern e.g. $149.99, 1,249.50, USD 45.00
  const cleaned = raw.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return null;

  // Handle commas as thousands separators: 1,499.50 -> 1499.50
  const normalized = cleaned.replace(/,/g, '');
  const parsed = parseFloat(normalized);

  if (isNaN(parsed) || parsed <= 0 || parsed > 1000000) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
}

export function safeTextContent(el: Element | null): string | null {
  if (!el || isElementSensitive(el)) return null;
  return el.textContent?.trim() || null;
}

export async function pollForSubtotal(
  extractor: () => number | null,
  maxAttempts = 4,
  intervalMs = 200
): Promise<number | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = extractor();
    if (result !== null) {
      return result;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return null;
}

