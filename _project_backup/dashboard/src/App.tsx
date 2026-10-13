import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
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
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAddCard = async (cardData: Partial<Card>) => {
    await api.createCard(cardData);
    showToast(`Added ${cardData.name} to portfolio!`);
    await loadAllData();
  };

  const handleDeleteCard = async (id: string) => {
    await api.deleteCard(id);
    showToast('Card removed from portfolio.');
    await loadAllData();
  };

  const handleAddRule = async (ruleData: Partial<RewardRule>) => {
    await api.createReward(ruleData);
    showToast('Reward multiplier rule saved!');
    await loadAllData();
  };

  const handleDeleteRule = async (id: string) => {
    await api.deleteReward(id);
    showToast('Reward multiplier deleted.');
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
    showToast('Transaction logged & gap analyzed!');
    await loadAllData();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 80,
          right: 24,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          color: '#f8fafc',
          padding: '12px 18px',
          borderRadius: 12,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 600,
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle size={16} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ maxWidth: 1300, width: '100%', margin: '0 auto', padding: '32px 24px', flex: 1 }}>
        {activeTab === 'analytics' && (
          <AnalyticsView analytics={analytics} loading={loading} />
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
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--text-dim)',
        background: 'rgba(7, 10, 19, 0.8)'
      }}>
        CardWise — Smart Checkout Recommendations & Rewards Dashboard • Fictional Demo Profile (Alex Morgan)
      </footer>
    </div>
  );
};
