import React, { useState } from 'react';
import { Card, RewardRule } from '../types.js';
import { Plus, Trash2, Percent, Sliders, X } from 'lucide-react';

interface RewardRulesProps {
  cards: Card[];
  rules: RewardRule[];
  onAddRule: (rule: Partial<RewardRule>) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
}

const CATEGORY_DEFINITIONS = [
  { value: 'online_shopping', label: 'Online Shopping / E-commerce', defaultRate: 3.0 },
  { value: 'electronics', label: 'Electronics & Computers', defaultRate: 5.0 },
  { value: 'dining', label: 'Dining & Restaurants', defaultRate: 3.0 },
  { value: 'groceries', label: 'Supermarkets & Groceries', defaultRate: 3.0 },
  { value: 'travel', label: 'Travel, Flights & Hotels', defaultRate: 2.0 },
  { value: 'gas', label: 'Gas Stations & EV Charging', defaultRate: 3.0 },
  { value: 'retail', label: 'Department Stores & Retail', defaultRate: 2.0 },
  { value: 'drugstores', label: 'Drugstores & Pharmacies', defaultRate: 3.0 },
  { value: 'general', label: 'General / All Other Purchases', defaultRate: 1.5 },
];

export const RewardRules: React.FC<RewardRulesProps> = ({
  cards,
  rules,
  onAddRule,
  onDeleteRule
}) => {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Reward Rules & Category Multipliers
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
            Configure merchant category cashback rates and annual spending caps ({rules.length} active rules)
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
          <Plus size={15} />
          <span>New Multiplier Rule</span>
        </button>
      </div>

      {/* Rules Table */}
      <div className="fintech-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Card</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cashback Multiplier</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Spend Cap</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rule Description</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No reward multiplier rules configured.
                  </td>
                </tr>
              ) : (
                rules.map(rule => (
                  <tr key={rule.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rule.card_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rule.card_bank}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-slate" style={{ textTransform: 'capitalize' }}>
                        {rule.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: 13, fontWeight: 700 }}>
                        {(rule.reward_rate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="tabular-nums" style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                      {rule.cap_amount ? `$${rule.cap_amount.toLocaleString()}/yr` : 'No Cap'}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', maxWidth: 300 }}>
                      {rule.description || '—'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          if (confirm('Delete this reward rule?')) {
                            onDeleteRule(rule.id);
                          }
                        }}
                        className="btn btn-danger-ghost"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        title="Delete Rule"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      {isModalOpen && (
        <div className="fintech-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="fintech-modal-container" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sliders size={18} color="var(--emerald-500)" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Configure Category Multiplier
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
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Select Credit Card
                </label>
                <select
                  value={selectedCardId}
                  onChange={e => setSelectedCardId(e.target.value)}
                  className="input-control"
                >
                  {cards.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.bank}) •••• {c.last_four}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Spending Category
                </label>
                <select
                  value={category}
                  onChange={e => {
                    setCategory(e.target.value);
                    const def = CATEGORY_DEFINITIONS.find(d => d.value === e.target.value);
                    if (def) setRatePercent(def.defaultRate);
                  }}
                  className="input-control"
                >
                  {CATEGORY_DEFINITIONS.map(def => (
                    <option key={def.value} value={def.value}>
                      {def.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
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
                      className="input-control tabular-nums"
                    />
                    <Percent size={14} color="var(--text-muted)" style={{ position: 'absolute', right: 12, top: 11 }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Annual Spend Cap ($) (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500 or 6000"
                    value={capAmount}
                    onChange={e => setCapAmount(e.target.value)}
                    className="input-control tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Terms & Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5% back on Amazon.com purchases"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input-control"
                />
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
                  {submitting ? 'Saving...' : 'Save Multiplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
