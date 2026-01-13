import { MerchantAdapter } from './types.js';
import { AmazonAdapter } from './amazonAdapter.js';
import { BestBuyAdapter } from './bestbuyAdapter.js';
import { TargetAdapter, WalmartAdapter, LocalDemoStoreAdapter } from './targetAdapter.js';

export class AdapterRegistry {
  private adapters: MerchantAdapter[] = [];

  constructor() {
    this.register(new AmazonAdapter());
    this.register(new BestBuyAdapter());
    this.register(new TargetAdapter());
    this.register(new WalmartAdapter());
    this.register(new LocalDemoStoreAdapter());
  }

  register(adapter: MerchantAdapter): void {
    this.adapters.push(adapter);
  }

  findMatchingAdapter(url: URL): MerchantAdapter | null {
    for (const adapter of this.adapters) {
      if (adapter.matches(url)) {
        return adapter;
      }
    }
    return null;
  }

  getAllSupportedDomains(): string[] {
    const domains = new Set<string>();
    for (const adapter of this.adapters) {
      for (const d of adapter.supportedDomains) {
        domains.add(d);
      }
    }
    return Array.from(domains);
  }
}
