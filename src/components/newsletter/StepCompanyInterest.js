import React, { useState, useEffect } from 'react';
import { useWizard } from './NewsletterWizardContext';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from './wizardSteps';
import BackIcon from './BackIcon';

export default function StepCompanyInterest() {
  const navigate = useNavigate();
  const { companyInterests, setCompanyInterests, econTopics, techTopics, commitFinalTopics } = useWizard();
  const [input, setInput] = useState('');
  const [ageOptIn, setAgeOptIn] = useState(false);

  useEffect(() => {
    try {
      const econ = JSON.parse(localStorage.getItem(STORAGE_KEYS.ECON) || '[]');
      if (!econ.length) navigate('/newsletter/econ', { replace: true });
    } catch {}
  }, [navigate]);

  const addCompany = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (companyInterests.includes(trimmed)) { setInput(''); return; }
    setCompanyInterests(prev => [...prev, trimmed].slice(0, 10));
    setInput('');
  };
  
  const remove = (c) => setCompanyInterests(prev => prev.filter(x => x !== c));
  const handleKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); addCompany(); } };
  
  const finish = () => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companyInterests));
    const finalTopics = Array.from(new Set([...econTopics, ...techTopics]));
    commitFinalTopics(finalTopics);
    if (ageOptIn) localStorage.setItem('newsletterAgeOptIn', 'true'); else localStorage.removeItem('newsletterAgeOptIn');
    navigate('/newsletter/subscriber');
  };

  return (
    <div style={outer}>
      <div style={canvas}>
        <Header onBack={() => navigate('/newsletter/econ')} />
        <div style={titleWrap}>
          <h1 style={titleTxt}>어떤 기업에 관심있으세요?</h1>
          <div style={infoSection}>
            <div style={infoRow}>
              <div style={infoIcon}>ℹ</div>
              <span style={infoText}>기업의 이번주 핫 이슈를 집중적으로 만나볼 수 있어요!</span>
            </div>
            <div style={infoRow}>
              <div style={infoIcon}>ℹ</div>
              <span style={infoText}>최대 3개까지 추가할 수 있어요.</span>
            </div>
            <div style={infoRow}>
              <div style={infoIcon}>ℹ</div>
              <span style={infoText}>소식이 없으면 발행되지 않아요.</span>
            </div>
          </div>
        </div>
        <div style={inputRow}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="기업명을 입력하세요(예:엔디비아)"
            style={inputStyle}
          />
        </div>
        <div style={chipsArea}>
          {companyInterests.map(c => (
            <div key={c} style={chip}>
              {c}
              <button onClick={() => remove(c)} style={chipClose}>×</button>
            </div>
          ))}
          {!companyInterests.length && <div style={emptyHint}>예: 엔디비아, MS ...</div>}
        </div>
        <div style={checkboxCard} onClick={() => setAgeOptIn(v => !v)}>
          <div style={checkCircle(ageOptIn)}>{ageOptIn && '✓'}</div>
          <span style={checkboxLabel}>나잇대에 맞는 맞춤 정보 받기</span>
        </div>
        <button onClick={finish} style={finishBtn}>다음</button>
      </div>
    </div>
  );
}

// 기본 레이아웃 스타일
const outer = { 
  width: '100%', 
  minHeight: '100vh', 
  background: '#F4F6FA', 
  display: 'flex', 
  justifyContent: 'center' 
};

const canvas = { 
  position: 'relative', 
  width: 412, 
  maxWidth: '100%', 
  minHeight: 917, 
  background: '#F4F6FA', 
  paddingBottom: 140 
};

// 제목 섹션
const titleWrap = {
  position: 'absolute',
  width: 380,
  left: 16,
  top: 152,
  display: 'flex',
  flexDirection: 'column',
  gap: 32
};

const titleTxt = {
  margin: 0,
  fontFamily: 'Roboto',
  fontWeight: 700,
  fontSize: 24,
  lineHeight: '28px',
  color: '#000000'
};

const infoSection = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4
};

const infoRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 2
};

const infoIcon = {
  width: 12,
  height: 12,
  color: '#818181',
  fontSize: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const infoText = {
  fontFamily: 'Roboto',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: '14px',
  letterSpacing: '-0.02em',
  color: '#818181'
};

// 입력 영역
const inputRow = {
  position: 'absolute',
  top: 331,
  left: 16,
  width: 380,
  display: 'flex',
  gap: 8
};

const inputStyle = {
  flex: 1,
  height: 48,
  padding: '0 16px',
  borderRadius: 16,
  border: 'none',
  background: '#FFFFFF',
  boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)',
  fontSize: 14,
  fontFamily: 'Roboto',
  color: '#999999'
};

// 칩 영역
const chipsArea = {
  position: 'absolute',
  top: 395,
  left: 16,
  width: 380,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  minHeight: 28
};

const chip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 2,
  padding: '6px 12px',
  background: '#DDEAFF',
  borderRadius: 40,
  fontSize: 14,
  letterSpacing: '-0.03em',
  color: '#0056D7'
};

const chipClose = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#0056D7',
  fontSize: 12,
  lineHeight: 1,
  width: 12,
  height: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const emptyHint = {
  fontSize: 12,
  color: '#94A3B8'
};

// 체크박스 카드
const checkboxCard = {
  position: 'absolute',
  top: 456,
  left: 16,
  width: 380,
  height: 60,
  background: '#FFFFFF',
  boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)',
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '0 16px',
  cursor: 'pointer'
};

const checkCircle = (active) => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  background: active ? '#448FFF' : '#E1E8EF',
  color: active ? '#fff' : '#6B7280',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 600
});

const checkboxLabel = {
  fontFamily: 'Roboto',
  fontSize: 14,
  letterSpacing: '-0.03em',
  color: '#535A64'
};

// 버튼
const finishBtn = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: 26,
  width: 380,
  height: 60,
  background: 'linear-gradient(91.43deg, #448FFF 0%, #4833D0 100%)',
  borderRadius: 8,
  border: 'none',
  color: '#FFFFFF',
  fontFamily: 'Roboto',
  fontWeight: 700,
  fontSize: 18,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

// 헤더 컴포넌트
function Header({ onBack }) {
  return (
    <div style={headerBar}>
      <button onClick={onBack} aria-label="뒤로" style={iconBtn}><BackIcon /></button>
      <div style={headerTitle}>기본 정보 입력</div>
    </div>
  );
}

const headerBar = {
  position: 'absolute',
  top: 64,
  left: 16,
  right: 16,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  gap: 16
};

const iconBtn = {
  width: 24,
  height: 24,
  background: 'none',
  border: 'none',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};

const headerTitle = {
  fontFamily: 'Roboto',
  fontWeight: 700,
  fontSize: 18,
  lineHeight: '21px',
  letterSpacing: '-0.02em',
  color: '#282828',
  whiteSpace: 'nowrap'
};
