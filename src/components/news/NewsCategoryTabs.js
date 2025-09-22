import React from 'react';
import './NewsCategoryTabs.css';
import SonIcon from '../../assets/newspng/Son.svg';

export default function NewsCategoryTabs({ categories, activeCategory, onSelect }) {
  return (
    <nav className="category-tabs">
      {categories.map(cat => {
        const isActive = cat === activeCategory;
        const showIcon = cat === '오늘의 뉴스';
        return (
          <div
            key={cat}
            className={'category-tab' + (isActive ? ' active' : '')}
            onClick={() => onSelect(cat)}
          >
            {showIcon && (
              <span className="tab-icon" aria-hidden="true">
                <img src={SonIcon} alt="" />
              </span>
            )}
            {cat}
          </div>
        );
      })}
    </nav>
  );
}

