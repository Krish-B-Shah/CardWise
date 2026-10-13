import React from 'react';
import { AnalyticsData } from '../types.js';
import { TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Sparkles } from 'lucide-react';

interface AnalyticsViewProps {
  analytics: AnalyticsData | null;
  loading: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, loading }) => {
  if (loading || !analytics) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>Loading spending analytics...</div>
      </div>
    );
  }

  const { summary, categoryBreakdown, cardBreakdown, recentRecommendations } = analytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16
      }}>
        {/* Total Spend */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Tracked Spend
            </span>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: 8, borderRadius: 8, color: '#60a5fa' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12, color: '#f8fafc' }}>
            ${summary.totalSpend.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
            Across 5 tracked demo purchases
          </div>
        </div>

        {/* Rewards Earned */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Cashback Earned
            </span>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: 8, borderRadius: 8, color: '#34d399' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12, color: '#34d399' }}>
            ${summary.totalRewardsEarned.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: '#10b981', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} />
            Effective rate: {((summary.totalRewardsEarned / summary.totalSpend) * 100).toFixed(1)}%
          </div>
        </div>

        {/* Potential Optimal Rewards */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Potential Optimal Cashback
            </span>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: 8, borderRadius: 8, color: '#c084fc' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12, color: '#c084fc' }}>
            ${summary.totalPotentialRewards.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
            Max yield if best card was chosen every time
          </div>
        </div>

        {/* Reward Gap / Missed Savings */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Missed Reward Gap
            </span>
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: 8, borderRadius: 8, color: '#fb7185' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12, color: summary.totalRewardGap > 0 ? '#fb7185' : '#34d399' }}>
            ${summary.totalRewardGap.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Optimization Score: <strong style={{ color: '#60a5fa' }}>{summary.optimizationScore}%</strong>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 20
      }}>
        {/* Spending Category Breakdown */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Category Spend & Rewards Yield</h3>
            <span className="badge badge-purple">By Merchant Category</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {categoryBreakdown.map(cat => {
              const spendPercent = Math.min(100, Math.round((cat.spend / summary.totalSpend) * 100));
              return (
                <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {cat.category.replace('_', ' ')}
                    </span>
                    <div>
                      <strong style={{ color: '#f8fafc' }}>${cat.spend.toFixed(2)}</strong>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                        (Earned ${cat.earned.toFixed(2)})
                      </span>
                      {cat.gap > 0 && (
                        <span style={{ color: '#fb7185', marginLeft: 8, fontSize: 12 }}>
                          [-${cat.gap.toFixed(2)} gap]
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: 8,
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${spendPercent}%`,
                      height: '100%',
                      background: cat.gap > 0
                        ? 'linear-gradient(90deg, #3b82f6, #f43f5e)'
                        : 'linear-gradient(90deg, #3b82f6, #10b981)',
                      borderRadius: 4
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Spend Distribution */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Card Utilization & Earnings</h3>
            <span className="badge badge-blue">Portfolio Share</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cardBreakdown.map(card => {
              const share = Math.round((card.spend / summary.totalSpend) * 100);
              return (
                <div key={card.cardName} style={{
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{card.cardName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {share}% of total spend
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>${card.spend.toFixed(2)}</div>
                    <div style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>
                      +${card.earned.toFixed(2)} earned
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Extension Recommendations Live Audit Log */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Contextual Recommendations</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Audit log of recommendations served to content scripts and extension popup
            </p>
          </div>
          <span className="badge badge-green">Real-time Telemetry</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
                <th style={{ padding: '10px 12px' }}>Merchant / Domain</th>
                <th style={{ padding: '10px 12px' }}>Category</th>
                <th style={{ padding: '10px 12px' }}>Purchase Amount</th>
                <th style={{ padding: '10px 12px' }}>Recommended Card</th>
                <th style={{ padding: '10px 12px' }}>Rate</th>
                <th style={{ padding: '10px 12px' }}>Est. Cashback</th>
              </tr>
            </thead>
            <tbody>
              {recentRecommendations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No recent recommendation queries logged yet. Use the extension or simulated checkout lab to generate recommendations.
                  </td>
                </tr>
              ) : (
                recentRecommendations.map(rec => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-dim)', fontSize: 12 }}>
                      {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{rec.domain}</td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-blue" style={{ fontSize: 11 }}>
                        {rec.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>${rec.amount.toFixed(2)}</td>
                    <td style={{ padding: '12px', color: '#60a5fa' }}>{rec.card_name || 'Card ' + rec.recommended_card_id}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#34d399' }}>
                      {(rec.cashback_rate * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#34d399' }}>
                      +${rec.cashback_amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
