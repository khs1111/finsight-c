import React, { useState } from 'react';

/**
 * TierBadge
 * - Shows backend-provided badge icon when available
 * - Falls back to inline SVG (orange hex with white star) if the image is missing or fails to load
 */
export default function TierBadge({ iconUrl, name = '티어', size = 24, className, style }) {
  const [broken, setBroken] = useState(false);
  const s = { width: size, height: size, display: 'inline-block', ...style };

  if (broken || !iconUrl) {
    const view = 64; // Render at 64 and scale to size via width/height
    return (
      <span className={className} style={s} aria-label={name} title={name}>
        <svg width={size} height={size} viewBox={`0 0 ${view} ${view}`} xmlns="http://www.w3.org/2000/svg" role="img">
          <defs>
            <linearGradient id="tb_grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F1992E"/>
              <stop offset="100%" stopColor="#CE6A00"/>
            </linearGradient>
            <filter id="tb_shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.25)"/>
            </filter>
          </defs>
          {/* Hexagon */}
          <polygon filter="url(#tb_shadow)" points="32,2 58,16 58,48 32,62 6,48 6,16" fill="url(#tb_grad)" stroke="#FFFFFF" strokeWidth="2"/>
          {/* Star */}
          <path d="M32 18 L36.9 27.8 L47.8 29.3 L39.9 36.4 L41.8 47.1 L32 42 L22.2 47.1 L24.1 36.4 L16.2 29.3 L27.1 27.8 Z" fill="#FFFFFF"/>
        </svg>
      </span>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={name}
      className={className}
      style={s}
      onError={() => setBroken(true)}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}
