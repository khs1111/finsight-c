import React, { useState, useEffect } from 'react';

export default function NewsCategoryTabs({ categories, activeCategory, onSelect }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navStyle = {
    display: 'flex',
    overflowX: 'auto',
    gap: isMobile ? 6 : 12,
    padding: isMobile ? '8px' : '16px',
  };
  const tabStyle = (cat) => ({
    flex: '0 0 auto',
    padding: isMobile ? '6px 10px' : '8px 16px',
    borderRadius: '16px',
    background: cat === activeCategory ? '#6366f1' : '#eee',
    color: cat === activeCategory ? 'white' : '#333',
    fontSize: isMobile ? '12px' : '14px',
    cursor: 'pointer',
  });

  return (
    <nav style={navStyle}>
      {categories.map(cat => (
        <div
          key={cat}
          style={tabStyle(cat)}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </div>
      ))}
    </nav>
  );
}

