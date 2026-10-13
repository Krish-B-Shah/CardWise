import React from 'react';

interface CardWiseLogoProps {
  variant?: 'full' | 'mark';
  theme?: 'dark' | 'light' | 'monochrome';
  size?: number;
  className?: string;
}

/**
 * CardWise Custom Brand Logo
 * Geometric mark combining:
 * 1. Dual-layered credit card silhouettes
 * 2. Interlocking 'C' arch and 'W' dynamic apex
 * 3. Emerald upward optimization vector
 */
export const CardWiseLogo: React.FC<CardWiseLogoProps> = ({
  variant = 'full',
  theme = 'dark',
  size = 32,
  className = ''
}) => {
  // Color tokens
  const navyColor = theme === 'dark' ? '#FFFFFF' : '#14283F';
  const emeraldColor = '#16866A';
  const slateColor = theme === 'dark' ? '#94A3B8' : '#64748B';

  // Standalone Mark SVG
  const renderMark = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CardWise Logo Symbol"
    >
      {/* Background soft geometric container */}
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="7.5"
        fill={theme === 'dark' ? '#14283F' : '#0F1E31'}
      />
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="7.5"
        stroke={theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(20,40,63,0.1)'}
      />

      {/* Primary Card Contour (C-profile) */}
      <path
        d="M8 11C8 9.89543 8.89543 9 10 9H22C23.1046 9 24 9.89543 24 11V13H8V11Z"
        fill="#FFFFFF"
        fillOpacity="0.9"
      />
      <path
        d="M8 15H15V22C15 22.5523 14.5523 23 14 23H10C8.89543 23 8 22.1046 8 21V15Z"
        fill="#FFFFFF"
        fillOpacity="0.45"
      />

      {/* Upward Emerald Optimization Angle / 'W' Crest */}
      <path
        d="M17 23L20.5 16L24 23H17Z"
        fill={emeraldColor}
      />
      <circle cx="20.5" cy="14" r="1.5" fill="#34D399" />
    </svg>
  );

  if (variant === 'mark') {
    return renderMark();
  }

  // Full Horizontal Lockup (Mark + Professional Wordmark)
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.round(size * 0.32),
        lineHeight: 1,
        userSelect: 'none'
      }}
      className={className}
    >
      {renderMark()}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span
            style={{
              fontSize: Math.round(size * 0.58),
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: navyColor,
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Card
          </span>
          <span
            style={{
              fontSize: Math.round(size * 0.58),
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: emeraldColor,
              fontFamily: "'Inter', sans-serif",
              marginLeft: '1px'
            }}
          >
            Wise
          </span>
        </div>
        <span
          style={{
            fontSize: Math.max(9, Math.round(size * 0.22)),
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: slateColor,
            marginTop: '2px',
            fontFamily: "'Inter', sans-serif"
          }}
        >
          Smart Rewards
        </span>
      </div>
    </div>
  );
};
