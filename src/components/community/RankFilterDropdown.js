import React from 'react';

/* RankFilterDropdown
 * Spec:
 * Container: absolute 82x196, padding:16px 12px, gap:10px, shadow, radius 16px
 * Internal list: column gap 8px, each item 58px width, 14px height, Roboto 700 12/14
 * Divider lines 58px width, 1px #F5F5F5
 */
const RANKS = ['마스터','다이아','플레티넘','골드','실버','브론즈'];

export default function RankFilterDropdown({ top = 192, left = 314, onSelect, selected }) {
  return (
    <div
      className="rank-filter-dropdown"
      style={{ top, left }}
      role="listbox"
      aria-label="랭크 필터"
    >
      <div className="rank-filter-inner">
        {RANKS.map((r, idx) => (
          <React.Fragment key={r}>
            <button
              type="button"
              role="option"
              aria-selected={selected === r}
              className={"rank-item" + (selected === r ? ' selected' : '')}
              onClick={() => onSelect && onSelect(r)}
            >
              {r}
            </button>
            {idx < RANKS.length - 1 && <div className="rank-divider" aria-hidden="true" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
