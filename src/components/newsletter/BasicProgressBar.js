// 3단계 진행바
import React from 'react';

export default function BasicProgressBar({ step }) {
  // step: 1 | 2 | 3
  const segments = [1,2,3];
  return (
    <div style={wrap}>
      {segments.map(s => (
        <div key={s} style={{ ...seg, background: s <= step ? '#448FFF' : '#E0E8F3' }} />
      ))}
    </div>
  );
}

const wrap = { display: 'flex', alignItems: 'center', gap: 16, width: 380, height: 16 };
const seg = { width: 116, height: 16, borderRadius: 8 };
