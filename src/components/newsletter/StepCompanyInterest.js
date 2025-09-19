import React, { useState, useEffect } from 'react';
import { useWizard } from './NewsletterWizardContext';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from './wizardSteps';
import BasicProgressBar from './BasicProgressBar';
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
        <Header onBack={() => navigate('/newsletter/tech')} />
        <div style={progressRow}><BasicProgressBar step={3} /></div>
        <div style={titleWrap}>
          <h1 style={titleTxt}>어떤 기업에 관심있으세요?</h1>
          <p style={infoLine}>기업의 핫 이슈를 집중적으로 만나볼 수 있어요</p>
        </div>
        <div style={inputRow}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="기업명을 입력하세요(예:엔디비아)"
            style={inputStyle}
          />
          <button onClick={addCompany} style={addBtn}>추가</button>
        </div>
        <div style={chipsArea}>
          {companyInterests.map(c => (
            <div key={c} style={chip}>{c}<button onClick={() => remove(c)} style={chipClose}>×</button></div>
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

const outer = { width: '100%', minHeight: '100vh', background: '#F4F6FA', display: 'flex', justifyContent: 'center' };
const canvas = { position: 'relative', width: 412, maxWidth: '100%', minHeight: 917, background: '#F4F6FA', paddingBottom: 140 };
const progressRow = { position: 'absolute', top: 104, left: 16, width: 380 };
const titleWrap = { position: 'absolute', top: 168, left: 16, width: 380, display: 'flex', flexDirection: 'column', gap: 8 };
const titleTxt = { margin: 0, fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 24, lineHeight: '28px', color: '#000' };
const infoLine = { margin: 0, fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 12, lineHeight: '14px', letterSpacing: '-0.02em', color: '#818181' };
const inputRow = { position: 'absolute', top: 260, left: 16, width: 380, display: 'flex', gap: 8 };
const inputStyle = { flex: 1, height: 48, padding: '0 16px', borderRadius: 16, border: 'none', background: '#FFFFFF', boxShadow: '0 0 2px rgba(0,0,0,0.25)', fontSize: 14 };
const addBtn = { height: 48, padding: '0 20px', borderRadius: 16, border: 'none', background: 'linear-gradient(91.43deg,#448FFF 0%,#4833D0 100%)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 };
const chipsArea = { position: 'absolute', top: 324, left: 16, width: 380, display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 34 };
const chip = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#DDEAFF', borderRadius: 40, fontSize: 14, letterSpacing: '-0.03em', color: '#0056D7' };
const chipClose = { background: 'none', border: 'none', cursor: 'pointer', color: '#0056D7', fontSize: 14, lineHeight: 1 };
const emptyHint = { fontSize: 12, color: '#94A3B8' };
const checkboxCard = { position: 'absolute', top: 370, left: 16, width: 380, height: 60, background: '#FFFFFF', boxShadow: '0 0 2px rgba(0,0,0,0.25)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', cursor: 'pointer' };
const checkCircle = (active) => ({ width: 24, height: 24, borderRadius: 12, background: active ? '#448FFF' : '#E1E8EF', color: active ? '#fff' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 });
const checkboxLabel = { fontFamily: 'Roboto, sans-serif', fontSize: 14, letterSpacing: '-0.03em', color: '#535A64' };
const finishBtn = { position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 26, width: 380, maxWidth: '90%', height: 60, background: 'linear-gradient(91.43deg,#448FFF 0%,#4833D0 100%)', borderRadius: 8, border: 'none', color: '#FFFFFF', fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 18, cursor: 'pointer', letterSpacing: '-0.02em' };

function Header({ onBack }) {
  return (
    <div style={headerBar}>
      <button onClick={onBack} aria-label="뒤로" style={iconBtn}><BackIcon /></button>
      <div style={headerTitle}>기본 정보 입력</div>
    </div>
  );
}
const headerBar = { position: 'absolute', top: 64, left: 16, right: 16, height: 24, display: 'flex', alignItems: 'center', gap: 16 };
const iconBtn = { width: 24, height: 24, background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const headerTitle = { fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 18, lineHeight: '21px', letterSpacing: '-0.02em', color: '#282828', whiteSpace: 'nowrap' };
