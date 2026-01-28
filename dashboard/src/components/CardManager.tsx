import React, { useState } from 'react';
import { Card } from '../types.js';
import { Plus, Trash2, ShieldAlert, Sparkles, CreditCard as CardIcon } from 'lucide-react';

interface CardManagerProps {
  cards: Card[];
  onAddCard: (card: Partial<Card>) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
}

const GRADIENT_PRESETS = [
  { label: 'Deep Blue', value: 'linear-gradient(135deg, #1e3a8a, #0f172a)' },
  { label: 'Sky Azure', value: 'linear-gradient(135deg, #0284c7, #0369a1)' },
  { label: 'Royal Violet', value: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
  { label: 'Emerald Forest', value: 'linear-gradient(135deg, #059669, #065f46)' },
  { label: 'Midnight Slate', value: 'linear-gradient(135deg, #334155, #0f172a)' },
  { label: 'Sunset Amber', value: 'linear-gradient(135deg, #d97706, #b45309)' },
  { label: 'Rose Gold', value: 'linear-gradient(135deg, #e11d48, #9f1239)' },
];

export const CardManager: React.FC<CardManagerProps> = ({ cards, onAddCard, onDeleteCard }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [bank, setBank] = useState('Chase');
  const [network, setNetwork] = useState('Visa');
  const [colorGradient, setColorGradient] = useState(GRADIENT_PRESETS[0].value);
  const [lastFour, setLastFour] = useState('1234');
  const [annualFee, setAnnualFee] = useState(0);
  const [creditLimit, setCreditLimit] = useState(5000);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAddCard({
        name,
        bank,
        network,
        color_gradient: colorGradient,
        last_four: lastFour,
        annual_fee: Number(annualFee),
        credit_limit: Number(creditLimit),
        notes
      });
      setIsModalOpen(false);
      setName('');
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Credit Card Portfolio</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Fictional credit cards synced across CardWise Dashboard & Chrome MV3 Extension
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Add Fictional Card</span>
        </button>
      </div>

      {/* Demo Notice Banner */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 14,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }}>
        <ShieldAlert size={20} color="#60a5fa" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: '#93c5fd' }}>
          <strong>Fictional Demo Data Security:</strong> No actual credit card numbers, CVVs, or bank credentials are ever stored or queried. CardWise uses fictional profile tokens to recommend optimal rewards.
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 20
      }}>
        {cards.map(card => (
          <div key={card.id} className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Visual Card Canvas */}
            <div
              className="credit-card-canvas"
              style={{ background: card.color_gradient || 'linear-gradient(135deg, #1e3a8a, #0f172a)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', opacity: 0.9 }}>
                  {card.bank.toUpperCase()}
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.05em' }}>
                  {card.network}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="credit-card-chip" />
                <Sparkles size={16} style={{ opacity: 0.6 }} />
              </div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.03em', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                  {card.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <span style={{ fontSize: 13, letterSpacing: '0.15em', fontFamily: 'monospace' }}>
                    •••• •••• •••• {card.last_four}
                  </span>
                  <span style={{ fontSize: 11, opacity: 0.85 }}>
                    {card.annual_fee === 0 ? '$0 Fee' : `$${card.annual_fee}/yr`}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Details & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Credit Limit:</span>
                <strong style={{ color: '#f8fafc' }}>${card.credit_limit.toLocaleString()}</strong>
              </div>

              {card.notes && (
                <div style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                  "{card.notes}"
                </div>
              )}

              {/* Reward Rules Pointers */}
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
                  Active Reward Multipliers:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {card.rules && card.rules.length > 0 ? (
                    card.rules.map(r => (
                      <span key={r.id} className="badge badge-green" style={{ fontSize: 11 }}>
                        {(r.reward_rate * 100).toFixed(1)}% {r.category}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>1.5% Base Cashback</span>
                  )}
                </div>
              </div>
            </div>

            {/* Delete Card Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => {
                  if (confirm(`Remove ${card.name} from your fictional portfolio?`)) {
                    onDeleteCard(card.id);
                  }
                }}
                className="btn btn-danger"
                style={{ padding: '6px 12px', fontSize: 12 }}
              >
                <Trash2 size={13} />
                <span>Remove Card</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Card Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CardIcon size={20} color="#3b82f6" />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Add Fictional Credit Card</h3>
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
                  Card Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SavorOne Cash Rewards"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Issuing Bank
                  </label>
                  <select
                    value={bank}
                    onChange={e => setBank(e.target.value)}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                  >
                    <option value="Chase">Chase</option>
                    <option value="American Express">American Express</option>
                    <option value="Citi">Citi</option>
                    <option value="Capital One">Capital One</option>
                    <option value="Discover">Discover</option>
                    <option value="Bank of America">Bank of America</option>
                    <option value="Wells Fargo">Wells Fargo</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Card Network
                  </label>
                  <select
                    value={network}
                    onChange={e => setNetwork(e.target.value)}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">Amex</option>
                    <option value="Discover">Discover</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Last 4 Digits
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={lastFour}
                    onChange={e => setLastFour(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Annual Fee ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={annualFee}
                    onChange={e => setAnnualFee(Number(e.target.value))}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Limit ($)
                  </label>
                  <input
                    type="number"
                    min={500}
                    value={creditLimit}
                    onChange={e => setCreditLimit(Number(e.target.value))}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Visual Card Theme
                </label>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                  {GRADIENT_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setColorGradient(preset.value)}
                      style={{
                        width: 38,
                        height: 28,
                        borderRadius: 6,
                        background: preset.value,
                        cursor: 'pointer',
                        border: colorGradient === preset.value ? '2px solid white' : '1px solid transparent',
                        transform: colorGradient === preset.value ? 'scale(1.1)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Notes & Special Benefits
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3% Dining & Entertainment"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
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
                  {submitting ? 'Saving...' : 'Save Card to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
