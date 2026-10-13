import React from 'react';
import { AnalyticsData, Transaction } from '../types.js';
import {
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface AnalyticsViewProps {
  analytics: AnalyticsData | null;
  transactions: Transaction[];
  loading: boolean;
  onNavigateToOptimizer: () => void;
  onNavigateToCards: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  transactions,
  loading,
  onNavigateToOptimizer,
  onNavigateToCards
}) => {
  if (loading || !analytics) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: 14 }}>Loading financial analytics...</p>
      </div>
    );
  }

  const { summary, categoryBreakdown, cardBreakdown, recentRecommendations } = analytics;
  const effectiveReturnRate = summary.totalSpend > 0
    ? ((summary.totalRewardsEarned / summary.totalSpend) * 100).toFixed(2)
    : '0.00';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Primary Highlighted Metric & Secondary Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.4fr) repeat(3, minmax(200px, 1fr))',
          gap: 16
        }}
      >
        {/* Primary Highlighted Metric Card: Cashback Earned */}
        <div
          className="fintech-card"
          style={{
            padding: '24px',
            borderLeft: '4px solid var(--emerald-500)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAF9 100%)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Cashback Earned
              </span>
              <span className="badge badge-emerald">
                {effectiveReturnRate}% Avg Return
              </span>
            </div>
            <div
              className="tabular-nums"
              style={{
                fontSize: 34,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                marginTop: 10
              }}
            >
              ${summary.totalRewardsEarned.toFixed(2)}
            </div>
          </div>

          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} color="var(--emerald-500)" />
            <span>Accumulated across all tracked demo orders</span>
          </div>
        </div>

        {/* Secondary Metric 1: Tracked Spend */}
        <div className="fintech-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tracked Spending
            </span>
            <div
              className="tabular-nums"
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginTop: 8
              }}
            >
              ${summary.totalSpend.toFixed(2)}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {transactions.length} logged transactions
          </div>
        </div>

        {/* Secondary Metric 2: Potential Optimal Cashback */}
        <div className="fintech-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Optimal Target
            </span>
            <div
              className="tabular-nums"
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginTop: 8
              }}
            >
              ${summary.totalPotentialRewards.toFixed(2)}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Max yield with optimal card selection
          </div>
        </div>

        {/* Secondary Metric 3: Missed Opportunity Gap */}
        <div
          className="fintech-card"
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: summary.totalRewardGap > 0 ? '#FFFDFD' : '#FFFFFF'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Missed Rewards Gap
              </span>
              {summary.totalRewardGap > 0 && (
                <span className="badge badge-amber" style={{ fontSize: 10 }}>
                  Opportunity
                </span>
              )}
            </div>
            <div
              className="tabular-nums"
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: summary.totalRewardGap > 0 ? 'var(--status-warning)' : 'var(--emerald-600)',
                letterSpacing: '-0.02em',
                marginTop: 8
              }}
            >
              ${summary.totalRewardGap.toFixed(2)}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Wallet efficiency: <strong style={{ color: 'var(--text-primary)' }}>{summary.optimizationScore}%</strong>
          </div>
        </div>
      </div>

      {/* Actionable Insight Callout (if gap exists) */}
      {summary.totalRewardGap > 0 && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderLeft: '4px solid var(--status-warning)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={18} color="var(--status-warning)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong>Optimization Opportunity:</strong> You forfeited <strong>${summary.totalRewardGap.toFixed(2)}</strong> by using a generic 1.5% card on Electronics. CardWise recommends using your <strong>Citi Custom Cash (5.0%)</strong> for upcoming electronics purchases.
            </div>
          </div>
          <button
            onClick={onNavigateToOptimizer}
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '6px 12px', flexShrink: 0 }}
          >
            <span>Run Calculator</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Middle Section: Spending by Category & Portfolio Share */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(350px, 1.3fr) minmax(300px, 1fr)',
          gap: 20
        }}
      >
        {/* Category Breakdown Ledger */}
        <div className="fintech-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Spending by Merchant Category
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Distribution of expenditure and rewards yield
              </p>
            </div>
            <span className="badge badge-slate">Real-time Data</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categoryBreakdown.map(cat => {
              const percentage = summary.totalSpend > 0
                ? ((cat.spend / summary.totalSpend) * 100).toFixed(1)
                : '0';

              return (
                <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                        {cat.category.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        ({percentage}%)
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        ${cat.spend.toFixed(2)}
                      </span>
                      <span className="tabular-nums" style={{ fontSize: 12, color: 'var(--emerald-600)', fontWeight: 600 }}>
                        +${cat.earned.toFixed(2)}
                      </span>
                      {cat.gap > 0 && (
                        <span className="badge badge-rose" style={{ fontSize: 10, padding: '1px 5px' }}>
                          -${cat.gap.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Restrained single-color progress bar */}
                  <div
                    style={{
                      height: 5,
                      background: 'var(--bg-surface-subtle)',
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: cat.gap > 0 ? 'var(--navy-700)' : 'var(--emerald-500)',
                        borderRadius: 3
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Portfolio Utilization */}
        <div className="fintech-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Card Share of Spend
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Utilization across your active credit cards
                </p>
              </div>
              <button
                onClick={onNavigateToCards}
                style={{ background: 'transparent', border: 'none', color: 'var(--emerald-600)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                View Cards &rarr;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cardBreakdown.map(card => {
                const sharePercent = summary.totalSpend > 0
                  ? ((card.spend / summary.totalSpend) * 100).toFixed(0)
                  : '0';

                return (
                  <div
                    key={card.cardName}
                    style={{
                      padding: '10px 14px',
                      background: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {card.cardName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {sharePercent}% of total wallet volume
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        ${card.spend.toFixed(2)}
                      </div>
                      <div className="tabular-nums" style={{ fontSize: 11, color: 'var(--emerald-600)', fontWeight: 600 }}>
                        +${card.earned.toFixed(2)} back
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid var(--border-subtle)',
              marginTop: 16,
              fontSize: 12,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Active Cards Configured: <strong>{cardBreakdown.length}</strong></span>
            <span style={{ color: 'var(--emerald-600)', fontWeight: 600 }}>100% Tracking</span>
          </div>
        </div>
      </div>

      {/* Recent Recommendations Telemetry Table */}
      <div className="fintech-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Recent Checkout Recommendations
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Live queries serviced by the CardWise recommendation engine
            </p>
          </div>
          <span className="badge badge-emerald">Engine Active</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Time</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Domain / Merchant</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Subtotal</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recommended Card</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Rate</th>
                <th style={{ padding: '10px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Estimated Return</th>
              </tr>
            </thead>
            <tbody>
              {recentRecommendations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No recent recommendation requests recorded. Visit the simulated checkout lab to see live queries.
                  </td>
                </tr>
              ) : (
                recentRecommendations.map(rec => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="tabular-nums" style={{ padding: '12px', color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {rec.domain}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-slate" style={{ textTransform: 'capitalize' }}>
                        {rec.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="tabular-nums" style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                      ${rec.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--navy-900)', fontWeight: 600 }}>
                      {rec.card_name || 'Card ' + rec.recommended_card_id}
                    </td>
                    <td className="tabular-nums" style={{ padding: '12px', textAlign: 'right', color: 'var(--emerald-600)', fontWeight: 700 }}>
                      {(rec.cashback_rate * 100).toFixed(1)}%
                    </td>
                    <td className="tabular-nums" style={{ padding: '12px', textAlign: 'right', color: 'var(--emerald-600)', fontWeight: 700 }}>
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
