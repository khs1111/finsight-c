import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from './NewsletterWizardContext';
import ProgressBar from './ProgressBar';
import { WIZARD_STEPS } from './wizardSteps';

const TOPICS = ['경제','증시','부동산','AI','테크','기업','ETF','원자재','정책','환율'];

export default function TopicSelection() {
  const [selected, setSelected] = useState([]);
  const { econTopics, techTopics, companyInterests, commitFinalTopics } = useWizard();
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('newsletterSelectedTopics') || '[]');
      if (Array.isArray(stored) && stored.length) {
        setSelected(stored);
        return;
      }
    } catch {/* ignore */}
    // Merge interim topics (econ + tech) distinct
    const merged = Array.from(new Set([...econTopics, ...techTopics]));
    setSelected(merged);
  }, [econTopics, techTopics]);
  const navigate = useNavigate();
  const toggle = (t) => setSelected(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const handleNext = () => {
    commitFinalTopics(selected);
    navigate('/newsletter/feed');
  };
  return (
    <div style={{ padding: '64px 24px 140px' }}>
      <button onClick={() => navigate('/newsletter/companies')} aria-label="뒤로가기" style={backBtnStyle}>←</button>
      <ProgressBar currentStep={WIZARD_STEPS.GENERAL_TOPICS} />
      <h2 style={{ fontSize: 22, margin: '0 0 12px' }}>최종 관심 분야 선택</h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#666' }}>최대 10개까지 고를 수 있어요. (이전 단계 관심사 포함)</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {TOPICS.map(t => (
          <button key={t} onClick={() => toggle(t)} style={chipStyle(selected.includes(t))}>{t}</button>
        ))}
      </div>
      <button disabled={!selected.length} onClick={handleNext} style={{ ...nextStyle, opacity: selected.length ? 1 : 0.4 }}>다음</button>
    </div>
  );
}

/** Style factory for topic chip. */
const chipStyle = (active) => ({
  padding: '10px 16px',
  borderRadius: 999,
  border: '1px solid ' + (active ? '#377BFF' : '#D0D5DD'),
  background: active ? 'linear-gradient(90deg,#377BFF,#5AA2FF)' : '#fff',
  color: active ? '#fff' : '#333',
  fontSize: 14,
  cursor: 'pointer'
});

const nextStyle = {
  position: 'fixed',
  left: 16,
  right: 16,
  bottom: 24,
  background: 'linear-gradient(90deg,#377BFF,#5AA2FF)',
  color: '#fff',
  border: 'none',
  borderRadius: 16,
  padding: '16px 0',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer'
};

const backBtnStyle = {
  position: 'fixed',
  top: 16,
  left: 16,
  width: 40,
  height: 40,
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  fontSize: 20,
  lineHeight: '36px',
  textAlign: 'center',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
};
