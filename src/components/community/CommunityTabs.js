import React from 'react';

export default function CommunityTabs({ active, onChange }) {
  return (
    <div className="community-tabs">
      {[
        { key: 'feed', label: '피드' },
        { key: 'myposts', label: '내 글' }
      ].map(t => (
        <div className="community-tab" key={t.key}>
          <button
            className={active === t.key ? 'active' : 'inactive'}
            onClick={() => onChange(t.key)}
          >{t.label}</button>
          <div className={"underline" + (active === t.key ? ' active' : '')} />
        </div>
      ))}
    </div>
  );
}
