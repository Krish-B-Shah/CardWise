import React from 'react';
import { CreditCard, BarChart3, Settings2, Receipt, Calculator, Store, ExternalLink } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'analytics', label: 'Spending & Analytics', icon: BarChart3 },
    { id: 'cards', label: 'Card Portfolio', icon: CreditCard },
    { id: 'rules', label: 'Reward Rules', icon: Settings2 },
    { id: 'transactions', label: 'Transactions & Gap', icon: Receipt },
    { id: 'optimizer', label: 'Rewards Calculator', icon: Calculator },
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1300,
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38,
            height: 38,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 18,
            color: 'white',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
          }}>
            CW
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>CardWise</span>
              <span className="badge badge-blue" style={{ fontSize: 10 }}>Demo MVP</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Alex Morgan (Fictional Demo Profile)
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                  background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                  color: isActive ? '#60a5fa' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* External Lab Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a
            href="http://localhost:3001/demo-store"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '7px 12px' }}
          >
            <Store size={14} />
            <span>Simulated Checkout Lab</span>
            <ExternalLink size={12} style={{ opacity: 0.7 }} />
          </a>
        </div>
      </div>
    </header>
  );
};
