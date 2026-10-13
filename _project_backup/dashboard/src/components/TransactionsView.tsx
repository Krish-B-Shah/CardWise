import React, { useState } from 'react';
import { Card, Transaction } from '../types.js';
import { Plus, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';

interface TransactionsViewProps {
  cards: Card[];
  transactions: Transaction[];
  onAddTransaction: (tx: {
    merchant_name: string;
    merchant_domain?: string;
    category: string;
    amount: number;
    card_used_id: string;
  }) => Promise<void>;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ cards, transactions, onAddTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [merchantName, setMerchantName] = useState('Amazon.com');
  const [merchantDomain, setMerchantDomain] = useState('amazon.com');
  const [category, setCategory] = useState('online_shopping');
  const [amount, setAmount] = useState<number>(120.00);
  const [cardUsedId, setCardUsedId] = useState(cards[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAddTransaction({
        merchant_name: merchantName,
        merchant_domain: merchantDomain,
        category,
        amount: Number(amount),
        card_used_id: cardUsedId || cards[0]?.id
      });
      setIsModalOpen(false);
      setMerchantName('');
      setAmount(50.00);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Transactions & Reward Gap Analysis</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Tracks actual cashback earned vs optimal card recommendations
          </p>
        </div>
        <button
          onClick={() => {
            if (cards.length > 0 && !cardUsedId) setCardUsedId(cards[0].id);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
          disabled={cards.length === 0}
        >
          <Plus size={16} />
          <span>Log Simulated Transaction</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel" style={{ padding: 24, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Merchant</th>
              <th style={{ padding: '12px' }}>Category</th>
              <th style={{ padding: '12px' }}>Spend</th>
              <th style={{ padding: '12px' }}>Card Used</th>
              <th style={{ padding: '12px' }}>Earned</th>
              <th style={{ padding: '12px' }}>Optimal Card</th>
              <th style={{ padding: '12px' }}>Reward Gap</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No transactions recorded. Click "Log Simulated Transaction" to test reward optimization.
                </td>
              </tr>
            ) : (
              transactions.map(tx => {
                const isOptimal = tx.reward_gap === 0;
                return (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '14px 12px', color: 'var(--text-dim)', fontSize: 12 }}>
                      {new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: 600 }}>
                      <div style={{ color: '#f8fafc' }}>{tx.merchant_name}</div>
                      {tx.merchant_domain && (
                        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{tx.merchant_domain}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span className="badge badge-blue" style={{ textTransform: 'capitalize', fontSize: 11 }}>
                        {tx.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: 700, fontSize: 14 }}>
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 12px', color: '#cbd5e1' }}>
                      {tx.card_used_name || 'Card ' + tx.card_used_id}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: '#34d399' }}>
                      +${tx.reward_earned.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 12px', color: '#c084fc' }}>
                      {tx.optimal_card_name || 'Same'}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      {isOptimal ? (
                        <span className="badge badge-green" style={{ fontSize: 11 }}>
                          <CheckCircle2 size={12} />
                          Optimal ($0 gap)
                        </span>
                      ) : (
                        <span className="badge badge-amber" style={{ fontSize: 11, background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
                          <AlertCircle size={12} />
                          -${tx.reward_gap.toFixed(2)} missed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag size={20} color="#10b981" />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Log Simulated Purchase</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Merchant Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best Buy #1042"
                  value={merchantName}
                  onChange={e => setMerchantName(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Domain
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. bestbuy.com"
                    value={merchantDomain}
                    onChange={e => setMerchantDomain(e.target.value)}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                  >
                    <option value="online_shopping">Online Shopping</option>
                    <option value="electronics">Electronics</option>
                    <option value="groceries">Groceries</option>
                    <option value="dining">Dining</option>
                    <option value="travel">Travel</option>
                    <option value="retail">Retail</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Purchase Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={1}
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Card Used For Payment
                  </label>
                  <select
                    value={cardUsedId}
                    onChange={e => setCardUsedId(e.target.value)}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                  >
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (•••• {c.last_four})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Analyzing & Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
