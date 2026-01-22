export interface Card {
  id: string;
  user_id: string;
  name: string;
  bank: string;
  network: string;
  color_gradient: string;
  last_four: string;
  annual_fee: number;
  credit_limit: number;
  is_active: boolean;
  notes?: string;
  rules?: RewardRule[];
}

export interface RewardRule {
  id: string;
  card_id: string;
  card_name?: string;
  card_bank?: string;
  category: string;
  reward_rate: number;
  reward_type?: string;
  cap_amount?: number | null;
  current_spend_in_cap?: number;
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

export interface Transaction {
  id: string;
  user_id: string;
  merchant_name: string;
  merchant_domain?: string;
  category: string;
  amount: number;
  card_used_id: string;
  card_used_name?: string;
  reward_earned: number;
  optimal_card_id?: string;
  optimal_card_name?: string;
  optimal_reward: number;
  reward_gap: number;
  date: string;
}

export interface AnalyticsSummary {
  totalSpend: number;
  totalRewardsEarned: number;
  totalPotentialRewards: number;
  totalRewardGap: number;
  optimizationScore: number;
}

export interface CategoryBreakdown {
  category: string;
  spend: number;
  earned: number;
  gap: number;
  count: number;
}

export interface CardBreakdown {
  cardName: string;
  spend: number;
  earned: number;
}

export interface RecommendationLog {
  id: string;
  domain: string;
  category: string;
  amount: number;
  recommended_card_id: string;
  card_name?: string;
  card_bank?: string;
  cashback_rate: number;
  cashback_amount: number;
  timestamp: string;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  categoryBreakdown: CategoryBreakdown[];
  cardBreakdown: CardBreakdown[];
  recentRecommendations: RecommendationLog[];
}

export interface RecommendationResponse {
  bestCard: {
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
  };
  alternatives: Array<{
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
  }>;
  merchant: {
    name: string;
    domain: string;
    category: string;
  };
  purchaseAmount: number;
  savingsVsBaseline: number;
  explanation: string;
}
