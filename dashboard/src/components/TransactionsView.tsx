import React, { useState, useMemo } from 'react';
import { Card, Transaction } from '../types.js';
import { Plus, Search, Filter, CheckCircle2, AlertCircle, ShoppingBag, X } from 'lucide-react';

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

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  cards,
  transactions,
  onAddTransaction
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal form states
  const [merchantName, setMerchantName] = useState('Apple Store');
  const [merchantDomain, setMerchantDomain] = useState('apple.com');
  const [category, setCategory] = useState('electronics');
  const [amount, setAmount] = useState<number>(199.00);
  const [cardUsedId, setCardUsedId] = useState(cards[0]?.id || '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch =
        tx.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.merchant_domain && tx.merchant_domain.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'all' || tx.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {error && !isModalOpen && <p role="alert" style={{ color: 'var(--status-danger)' }}>{error}</p>}
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Transactions & Optimization Ledger
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
            Estimated rewards on seeded and manually recorded purchases
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
          <Plus size={15} />
          <span>Record Purchase</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="fintech-card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: 10 }} />
            <input
              type="text"
              placeholder="Filter by merchant or domain..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-control"
              style={{ paddingLeft: 34, fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="input-control"
              style={{ padding: '7px 10px', fontSize: 12, width: 'auto' }}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Showing <strong>{filteredTransactions.length}</strong> of {transactions.length} records
        </div>
      </div>

      {/* Transactions Table */}
      <div className="fintech-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Merchant</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Card Used</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Estimated reward</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Modeled best card</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Optimization</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => {
                  const isOptimal = tx.reward_gap === 0;
                  return (
                    <tr
                      key={tx.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.1s ease'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td className="tabular-nums" style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: 12 }}>
                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.merchant_name}</div>
                        {tx.merchant_domain && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.merchant_domain}</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className="badge badge-slate" style={{ textTransform: 'capitalize' }}>
                          {tx.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="tabular-nums" style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ${tx.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        {tx.card_used_name || 'Card ' + tx.card_used_id}
                      </td>
                      <td className="tabular-nums" style={{ padding: '14px 18px', textAlign: 'right', color: 'var(--emerald-600)', fontWeight: 700 }}>
                        +${tx.reward_earned.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--navy-900)', fontWeight: 500 }}>
                        {tx.optimal_card_name || 'Unavailable'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {isOptimal ? (
                          <span className="badge badge-emerald">
                            <CheckCircle2 size={11} />
                            No modeled gap
                          </span>
                        ) : (
                          <span className="badge badge-rose">
                            <AlertCircle size={11} />
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
      </div>

      {/* Record Purchase Modal */}
      {isModalOpen && (
        <div className="fintech-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="fintech-modal-container" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag size={18} color="var(--emerald-500)" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Record Simulated Purchase
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && <p role="alert" style={{ color: 'var(--status-danger)' }}>{error}</p>}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Merchant Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best Buy #1042"
                  value={merchantName}
                  onChange={e => setMerchantName(e.target.value)}
                  className="input-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Domain
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. bestbuy.com"
                    value={merchantDomain}
                    onChange={e => setMerchantDomain(e.target.value)}
                    className="input-control"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="input-control"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Purchase Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={1}
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="input-control tabular-nums"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Card Used For Payment
                  </label>
                  <select
                    value={cardUsedId}
                    onChange={e => setCardUsedId(e.target.value)}
                    className="input-control"
                  >
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (•••• {c.last_four})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
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
                  {submitting ? 'Analyzing...' : 'Log & Calculate Gap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
