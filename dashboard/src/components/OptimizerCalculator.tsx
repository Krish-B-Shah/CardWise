import React, { useState, useEffect } from 'react';
import { RecommendationResponse } from '../types.js';
import { api } from '../api.js';
import { Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export const OptimizerCalculator: React.FC = () => {
  const [domain, setDomain] = useState('amazon.com');
  const [category, setCategory] = useState('online_shopping');
  const [amount, setAmount] = useState<number>(249.99);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const rec = await api.getRecommendation(domain, amount, category);
      setResult(rec);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, []);

  const merchantPresets = [
    { label: 'Amazon', domain: 'amazon.com', category: 'online_shopping' },
    { label: 'Best Buy', domain: 'bestbuy.com', category: 'electronics' },
    { label: 'Target', domain: 'target.com', category: 'retail' },
    { label: 'Walmart', domain: 'walmart.com', category: 'groceries' },
    { label: 'Chipotle', domain: 'chipotle.com', category: 'dining' },
    { label: 'Delta Airlines', domain: 'delta.com', category: 'travel' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Rewards Opportunity Optimizer
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
          Simulate purchase amounts to identify your highest-earning credit card before checking out
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1fr) minmax(380px, 1.25fr)',
          gap: 20
        }}
      >
        {/* Left Column: Purchase Parameters Form */}
        <div className="fintech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Simulate an Upcoming Purchase
          </div>

          {/* Quick Presets */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Common Merchants
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {merchantPresets.map(preset => (
                <button
                  key={preset.domain}
                  type="button"
                  onClick={() => {
                    setDomain(preset.domain);
                    setCategory(preset.category);
                  }}
                  className="btn btn-secondary"
                  style={{
                    fontSize: 12,
                    padding: '5px 10px',
                    borderColor: domain === preset.domain ? 'var(--emerald-500)' : 'var(--border-default)',
                    background: domain === preset.domain ? 'var(--emerald-50)' : 'var(--bg-surface)',
                    color: domain === preset.domain ? 'var(--emerald-600)' : 'var(--text-secondary)'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Domain & Category Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Merchant Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="e.g. apple.com"
                className="input-control"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Spending Category
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
                <option value="gas">Gas Stations</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          {/* Purchase Amount Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Order Subtotal Amount ($)
              </label>
              <span className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color: 'var(--emerald-600)' }}>
                ${amount.toFixed(2)}
              </span>
            </div>
            <input
              type="number"
              step="5"
              min="1"
              max="50000"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="input-control tabular-nums"
              style={{ fontSize: 15, fontWeight: 600 }}
            />
          </div>

          <button
            onClick={calculate}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px 16px', marginTop: 4 }}
          >
            <Sparkles size={15} />
            <span>{loading ? 'Evaluating Reward Rates...' : 'Calculate Optimal Return'}</span>
          </button>
        </div>

        {/* Right Column: Recommendation Intelligence Result */}
        <div className="fintech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Header result row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-emerald">
                  <CheckCircle2 size={12} />
                  Top Recommendation
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Merchant: <strong style={{ color: 'var(--text-primary)' }}>{result.merchant.name}</strong>
                </span>
              </div>

              {/* Highlight Recommended Card Block */}
              <div
                style={{
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-default)',
                  borderLeft: '4px solid var(--emerald-500)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      {result.bestCard.bank}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                      {result.bestCard.name}
                    </div>
                    <div className="font-mono tabular-nums" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      •••• {result.bestCard.lastFour}
                    </div>
                  </div>

                  <span className="badge badge-emerald" style={{ fontSize: 13, fontWeight: 700, padding: '4px 10px' }}>
                    {result.bestCard.cashbackPercentage} Return
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '14px 0 8px 0' }}>
                  <span className="tabular-nums" style={{ fontSize: 32, fontWeight: 800, color: 'var(--emerald-600)', letterSpacing: '-0.02em' }}>
                    +${result.bestCard.estimatedCashback.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    estimated cashback on this order
                  </span>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {result.bestCard.rewardRuleDescription}
                </div>
              </div>

              {/* Clear Explanation / Rationale */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10
                }}
              >
                <ShieldCheck size={16} color="var(--emerald-500)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ lineHeight: 1.45 }}>
                  {result.explanation}
                </div>
              </div>

              {/* Wallet Comparison Alternatives */}
              {result.alternatives && result.alternatives.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: 8 }}>
                    Other Cards in Your Wallet
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.alternatives.map(alt => (
                      <div
                        key={alt.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '9px 12px',
                          background: 'var(--bg-surface-subtle)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 12
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{alt.name}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>({alt.bank})</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{alt.cashbackPercentage}</span>
                          <span className="tabular-nums" style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                            (+${alt.estimatedCashback.toFixed(2)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Configure purchase parameters and click Calculate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
