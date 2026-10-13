import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { TopHeader } from './components/TopHeader.js';
import { AnalyticsView } from './components/AnalyticsView.js';
import { CardManager } from './components/CardManager.js';
import { RewardRules } from './components/RewardRules.js';
import { TransactionsView } from './components/TransactionsView.js';
import { OptimizerCalculator } from './components/OptimizerCalculator.js';
import { api } from './api.js';
import { Card, RewardRule, Transaction, AnalyticsData } from './types.js';
import { CheckCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [cards, setCards] = useState<Card[]>([]);
  const [rules, setRules] = useState<RewardRule[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAllData = async () => {
    try {
      const [cardsData, rulesData, txData, analyticsData] = await Promise.all([
        api.getCards(),
        api.getRewards(),
        api.getTransactions(),
        api.getAnalytics()
      ]);
      setCards(cardsData);
      setRules(rulesData);
      setTransactions(txData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching data from shared API:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    showToast('Synchronized with shared database.');
  };

  const handleAddCard = async (cardData: Partial<Card>) => {
    await api.createCard(cardData);
    showToast(`Added ${cardData.name} to portfolio.`);
    await loadAllData();
  };

  const handleDeleteCard = async (id: string) => {
    await api.deleteCard(id);
    showToast('Card removed from portfolio.');
    await loadAllData();
  };

  const handleAddRule = async (ruleData: Partial<RewardRule>) => {
    await api.createReward(ruleData);
    showToast('Reward multiplier rule saved.');
    await loadAllData();
  };

  const handleDeleteRule = async (id: string) => {
    await api.deleteReward(id);
    showToast('Reward rule removed.');
    await loadAllData();
  };

  const handleAddTransaction = async (txData: {
    merchant_name: string;
    merchant_domain?: string;
    category: string;
    amount: number;
    card_used_id: string;
  }) => {
    await api.createTransaction(txData);
    showToast('Transaction logged & gap analyzed.');
    await loadAllData();
  };

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    analytics: {
      title: 'Financial Analytics',
      subtitle: 'Overview of spending patterns, cashback yield, and optimization efficiency'
    },
    cards: {
      title: 'Payment Cards',
      subtitle: 'Manage credit cards, spending limits, and issuer configurations'
    },
    rules: {
      title: 'Reward Multipliers',
      subtitle: 'Category-specific percentages and spend caps'
    },
    transactions: {
      title: 'Transaction Ledger',
      subtitle: 'Review historical purchases and reward gap performance'
    },
    optimizer: {
      title: 'Rewards Optimizer',
      subtitle: 'Real-time card recommendation calculator for upcoming purchases'
    }
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.analytics;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cardsCount={cards.length}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopHeader
          title={currentTabInfo.title}
          subtitle={currentTabInfo.subtitle}
          onRefresh={handleManualRefresh}
          refreshing={refreshing}
        />

        {/* Floating Notification Toast */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'var(--navy-900)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-inverse)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 500,
              zIndex: 1000
            }}
          >
            <CheckCircle size={15} color="var(--emerald-400)" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main style={{ padding: '32px', maxWidth: 1200, width: '100%', margin: '0 auto', flex: 1 }}>
          {activeTab === 'analytics' && (
            <AnalyticsView
              analytics={analytics}
              transactions={transactions}
              loading={loading}
              onNavigateToOptimizer={() => setActiveTab('optimizer')}
              onNavigateToCards={() => setActiveTab('cards')}
            />
          )}

          {activeTab === 'cards' && (
            <CardManager
              cards={cards}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
            />
          )}

          {activeTab === 'rules' && (
            <RewardRules
              cards={cards}
              rules={rules}
              onAddRule={handleAddRule}
              onDeleteRule={handleDeleteRule}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              cards={cards}
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeTab === 'optimizer' && (
            <OptimizerCalculator />
          )}
        </main>

        {/* Footer */}
        <footer
          style={{
            padding: '20px 32px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            fontSize: 12,
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>CardWise Financial Intelligence Platform</span>
          <span>Fictional Demo Environment (Alex Morgan)</span>
        </footer>
      </div>
    </div>
  );
};
