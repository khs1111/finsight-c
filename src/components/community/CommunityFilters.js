import React from 'react';

const FILTERS = ['오늘의 뉴스','섹터','이벤트','종목'];

export default function CommunityFilters({ value, onChange }) {
  return (
    <div className="community-filters">
      <div className="filters-inner">
        {FILTERS.map(f => {
          const active = f === value;
            return (
              <button
                key={f}
                className={`filter-chip ${active ? 'active' : ''}`}
                onClick={() => onChange(f)}
                type="button"
              >
                <span>{f}</span>
              </button>
            );
        })}
      </div>
    </div>
  );
}
