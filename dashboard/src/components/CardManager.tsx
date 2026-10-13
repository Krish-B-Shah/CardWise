import React, { useState } from 'react';
import { Card } from '../types.js';
import { Plus, Trash2, ShieldCheck, CreditCard as CardIcon, X } from 'lucide-react';

interface CardManagerProps {
  cards: Card[];
  onAddCard: (card: Partial<Card>) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
}

// Sophisticated, restrained fintech card finishes (inspired by physical metal cards)
const CARD_FINISHES = [
  { label: 'Sapphire Navy', value: 'linear-gradient(135deg, #0F1E31 0%, #1A3352 100%)' },
  { label: 'Matte Obsidian', value: 'linear-gradient(135deg, #18191B 0%, #2A2D32 100%)' },
  { label: 'Emerald Reserve', value: 'linear-gradient(135deg, #0D4537 0%, #156550 100%)' },
  { label: 'Slate Platinum', value: 'linear-gradient(135deg, #334155 0%, #475569 100%)' },
  { label: 'Royal Indigo', value: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 100%)' },
  { label: 'Bronze Titanium', value: 'linear-gradient(135deg, #451A03 0%, #78350F 100%)' },
];

export const CardManager: React.FC<CardManagerProps> = ({ cards, onAddCard, onDeleteCard }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [bank, setBank] = useState('Chase');
  const [network, setNetwork] = useState('Visa');
  const [colorGradient, setColorGradient] = useState(CARD_FINISHES[0].value);
  const [lastFour, setLastFour] = useState('4821');
  const [annualFee, setAnnualFee] = useState(0);
  const [creditLimit, setCreditLimit] = useState(10000);
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
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Credit Card Portfolio
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
            Manage the payment cards in your rewards optimization strategy ({cards.length} active)
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={15} />
          <span>Add Credit Card</span>
        </button>
      </div>

      {/* Security notice banner */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          color: 'var(--text-secondary)'
        }}
      >
        <ShieldCheck size={16} color="var(--emerald-500)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Zero Financial Credentials Stored:</strong> CardWise operates strictly using reward rules, spending caps, and tokenized card labels. Real account numbers, PINs, and CVVs are never handled.
        </span>
      </div>

      {/* Credit Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20
        }}
      >
        {cards.map(card => (
          <div
            key={card.id}
            className="fintech-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16
            }}
          >
            {/* Realistic Physical Card Canvas */}
            <div
              className="fintech-card-graphic"
              style={{
                background: card.color_gradient || 'linear-gradient(135deg, #0F1E31 0%, #1A3352 100%)'
              }}
            >
              {/* Top Row: Issuer Bank & Network */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85 }}>
                  {card.bank}
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.04em' }}>
                  {card.network}
                </span>
              </div>

              {/* Middle Row: Metallic Chip */}
              <div>
                <div className="fintech-chip-metal" />
              </div>

              {/* Bottom Row: Card Product Name & Masked Account */}
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                  {card.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span className="font-mono tabular-nums" style={{ fontSize: 12, letterSpacing: '0.12em', opacity: 0.85 }}>
                    •••• {card.last_four}
                  </span>
                  <span style={{ fontSize: 11, opacity: 0.85 }}>
                    {card.annual_fee === 0 ? '$0 Annual Fee' : `$${card.annual_fee}/yr`}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Metadata & Attributes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Credit Limit</span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  ${card.credit_limit.toLocaleString()}
                </span>
              </div>

              {card.notes && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {card.notes}
                </div>
              )}

              {/* Category Multipliers Tags */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Active Reward Rules
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {card.rules && card.rules.length > 0 ? (
                    card.rules.map(r => (
                      <span key={r.id} className="badge badge-emerald" style={{ fontSize: 11 }}>
                        {(r.reward_rate * 100).toFixed(1)}% {r.category}
                      </span>
                    ))
                  ) : (
                    <span className="badge badge-slate" style={{ fontSize: 11 }}>1.5% Base</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
              <span className="badge badge-slate" style={{ fontSize: 10 }}>
                {card.is_active ? 'Active in Wallet' : 'Inactive'}
              </span>
              <button
                onClick={() => {
                  if (confirm(`Remove ${card.name} from your card portfolio?`)) {
                    onDeleteCard(card.id);
                  }
                }}
                className="btn btn-danger-ghost"
                style={{ padding: '4px 8px', fontSize: 11 }}
                title="Remove Card"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Card Modal */}
      {isModalOpen && (
        <div className="fintech-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="fintech-modal-container" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CardIcon size={18} color="var(--emerald-500)" />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Add Payment Card
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
                  Card Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SavorOne Cash Rewards"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Issuing Bank
                  </label>
                  <select
                    value={bank}
                    onChange={e => setBank(e.target.value)}
                    className="input-control"
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
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Network
                  </label>
                  <select
                    value={network}
                    onChange={e => setNetwork(e.target.value)}
                    className="input-control"
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
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Last 4 Digits
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={lastFour}
                    onChange={e => setLastFour(e.target.value.replace(/\D/g, ''))}
                    className="input-control tabular-nums font-mono"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Annual Fee ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={annualFee}
                    onChange={e => setAnnualFee(Number(e.target.value))}
                    className="input-control tabular-nums"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Credit Limit ($)
                  </label>
                  <input
                    type="number"
                    min={500}
                    value={creditLimit}
                    onChange={e => setCreditLimit(Number(e.target.value))}
                    className="input-control tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Card Visual Finish
                </label>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {CARD_FINISHES.map((finish, idx) => (
                    <div
                      key={idx}
                      onClick={() => setColorGradient(finish.value)}
                      style={{
                        width: 44,
                        height: 28,
                        borderRadius: 6,
                        background: finish.value,
                        cursor: 'pointer',
                        border: colorGradient === finish.value ? '2px solid var(--emerald-500)' : '1px solid var(--border-default)',
                        boxShadow: colorGradient === finish.value ? '0 0 0 2px rgba(22, 134, 106, 0.25)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                      title={finish.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Benefits & Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3% back on dining and grocery delivery"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
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
                  {submitting ? 'Saving...' : 'Save Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
