import React, { useState } from 'react';
import { Card, RewardRule } from '../types.js';
import { Plus, Trash2, Settings2, Percent } from 'lucide-react';

interface RewardRulesProps {
  cards: Card[];
  rules: RewardRule[];
  onAddRule: (rule: Partial<RewardRule>) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
}

const CATEGORY_OPTIONS = [
  { value: 'online_shopping', label: 'Online Shopping / E-commerce' },
  { value: 'electronics', label: 'Electronics & Gadgets' },
  { value: 'dining', label: 'Dining & Takeout' },
  { value: 'groceries', label: 'Groceries & Supermarkets' },
  { value: 'travel', label: 'Travel & Flights' },
  { value: 'gas', label: 'Gas Stations & EV Charging' },
  { value: 'retail', label: 'Retail & Department Stores' },
  { value: 'drugstores', label: 'Drugstores & Pharmacies' },
  { value: 'general', label: 'General / All Purchases' },
];

export const RewardRules: React.FC<RewardRulesProps> = ({ cards, rules, onAddRule, onDeleteRule }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || '');
  const [category, setCategory] = useState('online_shopping');
  const [ratePercent, setRatePercent] = useState(3.0);
  const [capAmount, setCapAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAddRule({
        card_id: selectedCardId || cards[0]?.id,
        category,
        reward_rate: Number(ratePercent) / 100,
        cap_amount: capAmount ? Number(capAmount) : null,
        description: description || `${ratePercent}% back on ${category.replace('_', ' ')}`
      });
      setIsModalOpen(false);
      setDescription('');
      setCapAmount('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Reward Rates & Rules Engine</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Configure cashback rates and categories used by CardWise recommendation algorithms
          </p>
        </div>
        <button
          onClick={() => {
            if (cards.length > 0 && !selectedCardId) setSelectedCardId(cards[0].id);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
          disabled={cards.length === 0}
        >
          <Plus size={16} />
          <span>Add Reward Rule</span>
        </button>
      </div>

      {/* Rules Table */}
      <div className="glass-panel" style={{ padding: 24, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Card Name</th>
              <th style={{ padding: '12px' }}>Category</th>
              <th style={{ padding: '12px' }}>Reward Rate</th>
              <th style={{ padding: '12px' }}>Spend Cap</th>
              <th style={{ padding: '12px' }}>Description</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No rules configured. Click "Add Reward Rule" to add custom cashback percentages.
                </td>
              </tr>
            ) : (
              rules.map(rule => (
                <tr key={rule.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 12px', fontWeight: 600 }}>
                    <div style={{ color: '#f8fafc' }}>{rule.card_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{rule.card_bank}</div>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
                      {rule.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className="badge badge-green" style={{ fontSize: 13, fontWeight: 700 }}>
                      {(rule.reward_rate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>
                    {rule.cap_amount ? `$${rule.cap_amount.toLocaleString()}/yr` : 'Unlimited'}
                  </td>
                  <td style={{ padding: '14px 12px', color: 'var(--text-muted)', maxWidth: 280 }}>
                    {rule.description || '—'}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        if (confirm('Delete this reward rule?')) {
                          onDeleteRule(rule.id);
                        }
                      }}
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Rule Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Settings2 size={20} color="#8b5cf6" />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Add Category Reward Rule</h3>
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
                  Select Credit Card
                </label>
                <select
                  value={selectedCardId}
                  onChange={e => setSelectedCardId(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                >
                  {cards.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.bank}) •••• {c.last_four}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Spending Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Cashback Rate (%)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="20"
                      required
                      value={ratePercent}
                      onChange={e => setRatePercent(Number(e.target.value))}
                      style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                    />
                    <Percent size={14} color="#94a3b8" style={{ position: 'absolute', right: 12, top: 12 }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Optional Cap ($)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={capAmount}
                    onChange={e => setCapAmount(e.target.value)}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Rule Description / Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5% back on Amazon purchases"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                />
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
                  {submitting ? 'Saving...' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
