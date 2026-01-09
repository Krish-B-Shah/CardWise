import { SubtotalExtractionResult } from '../../shared/types.js';

export interface MerchantAdapter {
  /**
   * Unique identifier for the adapter (e.g. 'amazon', 'bestbuy', 'target', 'localdemostore')
   */
  readonly id: string;

  /**
   * Human-readable merchant name
   */
  readonly name: string;

  /**
   * Associated spending category
   */
  readonly defaultCategory: string;

  /**
   * Hostnames/domains supported by this adapter
   */
  readonly supportedDomains: string[];

  /**
   * Evaluates if the current URL matches this merchant's checkout or cart page
   */
  matches(url: URL): boolean;

  /**
   * Attempts to safely detect and extract the visible subtotal from the page DOM.
   * MUST NEVER inspect inputs of type password, credit card fields, or CVV.
   */
  extractSubtotal(doc: Document): SubtotalExtractionResult;
}
