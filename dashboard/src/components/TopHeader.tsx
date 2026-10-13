import React from 'react';
import { RefreshCw, Database } from 'lucide-react';

interface TopHeaderProps {
  title: string;
  subtitle: string;
  onRefresh: () => void;
  refreshing: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  refreshing
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 32px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          {title}
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* PostgreSQL status chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--text-secondary)'
          }}
        >
          <Database size={12} color="var(--emerald-500)" />
          <span>PostgreSQL Active</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: 12 }}
          title="Refresh database records"
        >
          <RefreshCw size={13} className={refreshing ? 'spin-anim' : ''} />
          <span>Sync</span>
        </button>
      </div>
    </header>
  );
};
