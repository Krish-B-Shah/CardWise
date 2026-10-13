import React, { useState, useEffect } from 'react';
import { RecommendationResponse } from '../types.js';
import { api } from '../api.js';
import { Calculator, ShieldCheck, Sparkles } from 'lucide-react';

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
    { label: 'Amazon.com', domain: 'amazon.com', category: 'online_shopping' },
    { label: 'Best Buy', domain: 'bestbuy.com', category: 'electronics' },
    { label: 'Target', domain: 'target.com', category: 'retail' },
    { label: 'Walmart', domain: 'walmart.com', category: 'groceries' },
    { label: 'Chipotle / Dining', domain: 'chipotle.com', category: 'dining' },
    { label: 'Delta Airlines', domain: 'delta.com', category: 'travel' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Rewards Opportunity Optimizer</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Simulate upcoming online purchases to discover which card yields maximum cash return
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 24
      }}>
        {/* Left Column: Input Form & Merchant Selector */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calculator size={20} color="#3b82f6" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Purchase Parameters</h3>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
              Quick Presets
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
                    fontSize: 11,
                    padding: '6px 10px',
                    borderColor: domain === preset.domain ? '#3b82f6' : undefined,
                    background: domain === preset.domain ? 'rgba(59, 130, 246, 0.15)' : undefined,
                    color: domain === preset.domain ? '#60a5fa' : undefined
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Domain & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Merchant Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="e.g. apple.com"
                style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
              />
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

          {/* Purchase Amount Slider & Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                Estimated Checkout Subtotal ($)
              </label>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8' }}>${amount.toFixed(2)}</span>
            </div>
            <input
              type="number"
              step="5"
              min="1"
              max="10000"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              style={{ width: '100%', background: '#1e293b', border: '1px solid var(--border)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
            />
          </div>

          <button
            onClick={calculate}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: 14 }}
          >
            {loading ? 'Evaluating Reward Matrix...' : 'Compare Rewards Across Wallet'}
          </button>
        </div>

        {/* Right Column: Optimal Card Recommendation Result */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-green" style={{ fontSize: 12 }}>
                  <Sparkles size={13} />
                  Optimal Recommendation
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Merchant: <strong style={{ color: '#f8fafc' }}>{result.merchant.name}</strong>
                </span>
              </div>

              {/* Best Card Highlight Banner */}
              <div
                style={{
                  background: result.bestCard.colorGradient || 'linear-gradient(135deg, #1e3a8a, #0f172a)',
                  borderRadius: 16,
                  padding: 20,
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>
                    {result.bestCard.name} (•••• {result.bestCard.lastFour})
                  </span>
                  <span style={{ background: 'rgba(255, 255, 255, 0.25)', padding: '3px 10px', borderRadius: 12, fontWeight: 800, fontSize: 12 }}>
                    {result.bestCard.cashbackPercentage}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '10px 0' }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: '#38ef7d', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    +${result.bestCard.estimatedCashback.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 13, opacity: 0.9 }}>
                    cash back return
                  </span>
                </div>

                <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.4 }}>
                  {result.bestCard.rewardRuleDescription}
                </div>
              </div>

              {/* Explanation & Baseline comparison */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid var(--border)',
                fontSize: 12,
                color: '#cbd5e1'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontWeight: 600, marginBottom: 4 }}>
                  <ShieldCheck size={15} />
                  <span>Recommendation Summary</span>
                </div>
                {result.explanation}
              </div>

              {/* Alternatives List */}
              {result.alternatives && result.alternatives.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                    Wallet Comparison Alternatives
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {result.alternatives.map(alt => (
                      <div
                        key={alt.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          fontSize: 13
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{alt.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{alt.bank}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: '#60a5fa' }}>{alt.cashbackPercentage}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
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
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Select a merchant and click Compare Rewards
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
