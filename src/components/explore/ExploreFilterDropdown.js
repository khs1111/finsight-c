import React, { useEffect, useRef } from 'react';

export default function ExploreFilterDropdown({
  open,
  onClose,
  selectedLevel,
  onSelectLevel,
  selectedTopic,
  selectedSubTopic,
  onConfirm,
}) {
  const ref = useRef(null);

  const topic = '은행';
  const sub = '예금/적금';
  const levels = ['초급자','중급자','고급자'];

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 56, 
        left: 16,
        width: 380,
        background: '#FFFFFF',
        boxShadow: '0 0 16px rgba(10,26,51,0.32)',
        borderRadius: 16,
        padding: '16px 16px 88px 16px', 
        boxSizing: 'border-box',
        zIndex: 80,
      }}
      ref={ref}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#626262', marginBottom: 12 }}>난이도 선택</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {levels.map(lv => {
              const active = lv === selectedLevel;
              return (
                <button
                  key={lv}
                  type="button"
                  onClick={() => onSelectLevel(lv)}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 8,
                    border: active ? '1px solid #448FFF' : '1px solid #DFE5EE',
                    background: active ? 'linear-gradient(104.45deg,#448FFF -6.51%,#4833D0 105.13%)' : '#EEF2F6',
                    color: active ? '#FFFFFF' : '#626262',
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >{lv}</button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#626262', marginBottom: 12 }}>학습 주제</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              padding: '14px 16px',
              borderRadius: 8,
              background: '#FFFFFF',
              border: '1px solid #448FFF',
              boxShadow: '0 0 4px rgba(68,143,255,0.35)',
              fontSize: 16,
              fontWeight: 600,
              color: '#448FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>{topic} - {sub}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12L10 7L15 12" stroke="#448FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ fontSize: 12, color: '#888', lineHeight: '16px' }}>현재는 해당 주제만 제공됩니다.</div>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!selectedLevel}
        onClick={() => { onConfirm({ level: selectedLevel, topic, subTopic: sub }); onClose(); }}
        style={{
          position: 'absolute',
          left: 16,
            bottom: 16,
          width: 348,
          height: 56,
          borderRadius: 8,
          border: 'none',
          background: selectedLevel ? 'linear-gradient(104.45deg,#448FFF -6.51%,#4833D0 105.13%)' : '#CACACA',
          color: '#FFFFFF',
          fontSize: 18,
          fontWeight: 700,
          cursor: selectedLevel ? 'pointer' : 'not-allowed',
          boxShadow: selectedLevel ? '0 0 8px rgba(0,0,0,0.25)' : 'none'
        }}
      >확인</button>
    </div>
  );
}
