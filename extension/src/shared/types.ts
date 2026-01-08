export interface Card {
  id: string;
  name: string;
  bank: string;
  network: string;
  color_gradient: string;
  last_four: string;
  annual_fee: number;
  credit_limit: number;
  notes?: string;
  rules?: RewardRule[];
}

export interface RewardRule {
  id: string;
  card_id: string;
  category: string;
  reward_rate: number;
  cap_amount?: number | null;
  description?: string;
}

export interface Merchant {
  id: string;
  name: string;
  domain: string;
  category: string;
  supported_adapter: string;
  logo_icon?: string;
}

export interface CardRecommendationItem {
  id: string;
  name: string;
  bank: string;
  network: string;
  lastFour: string;
  colorGradient: string;
  cashbackRate: number;
  cashbackPercentage: string;
  estimatedCashback: number;
  rewardRuleDescription: string;
}

export interface RecommendationResult {
  bestCard: CardRecommendationItem;
  alternatives: CardRecommendationItem[];
  merchant: {
    name: string;
    domain: string;
    category: string;
  };
  purchaseAmount: number;
  savingsVsBaseline: number;
  explanation: string;
}

export interface SubtotalExtractionResult {
  status: 'success' | 'fallback' | 'failed';
  amount: number | null;
  rawText: string | null;
  confidence: number; // 0.0 to 1.0
  selectorUsed?: string;
  errorMessage?: string;
}
