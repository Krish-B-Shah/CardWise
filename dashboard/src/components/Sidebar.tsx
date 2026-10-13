import React from 'react';
import { CardWiseLogo } from './CardWiseLogo.js';
import {
  BarChart2,
  CreditCard,
  Percent,
  Receipt,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Store
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cardsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  cardsCount
}) => {
  const navItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart2, badge: null },
    { id: 'cards', label: 'Cards', icon: CreditCard, badge: cardsCount.toString() },
    { id: 'rules', label: 'Reward Multipliers', icon: Percent, badge: null },
    { id: 'transactions', label: 'Transactions & Gap', icon: Receipt, badge: null },
    { id: 'optimizer', label: 'Reward Optimizer', icon: Sparkles, badge: 'Smart' },
  ];

  return (
    <aside
      style={{
        width: 260,
        backgroundColor: 'var(--navy-900)',
        color: 'var(--text-inverse)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        flexShrink: 0,
        minHeight: '100vh',
        position: 'sticky',
        top: 0
      }}
    >
      {/* Top Brand & Nav */}
      <div style={{ padding: '20px 16px' }}>
        {/* Brand Header */}
        <div style={{ padding: '0 8px', marginBottom: 24 }}>
          <CardWiseLogo variant="full" theme="dark" size={32} />
        </div>

        {/* Workspace Label */}
        <div
          style={{
            padding: '6px 10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 11,
            color: 'var(--text-inverse-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20
          }}
        >
          <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Personal Wallet
          </span>
          <span className="badge badge-emerald" style={{ fontSize: 10, padding: '2px 6px' }}>
            Active
          </span>
        </div>

        {/* Navigation Section */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  border: 'none',
                  background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.72)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease, color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon
                    size={17}
                    color={isActive ? '#34D399' : 'rgba(255, 255, 255, 0.6)'}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: isActive ? 'var(--emerald-500)' : 'rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & External Tools */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        {/* Checkout Lab Shortcut */}
        <a
          href="http://localhost:3001/demo-store"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-md)',
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: 12,
            fontWeight: 500,
            transition: 'background 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Store size={14} color="#34D399" />
            <span>Simulated Checkout</span>
          </div>
          <ExternalLink size={12} style={{ opacity: 0.6 }} />
        </a>

        {/* User Profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)'
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #1B3554, #24446A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            AM
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Alex Morgan
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={10} color="#34D399" />
              <span>Demo Profile</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
