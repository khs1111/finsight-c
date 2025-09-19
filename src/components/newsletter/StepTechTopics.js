/*  AI 관련 2차 관심사.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from './NewsletterWizardContext';
import ProgressBar from './ProgressBar';
import { WIZARD_STEPS, STORAGE_KEYS } from './wizardSteps';

const TECH_OPTIONS = ['AI','반도체','클라우드','전기차','로봇','바이오','핀테크','그린에너지'];

export default function StepTechTopics() {
  const navigate = useNavigate();
  const { techTopics, setTechTopics, persistInterim } = useWizard();
  const toggle = (t) => setTechTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const goNext = () => {
    localStorage.setItem(STORAGE_KEYS.TECH, JSON.stringify(techTopics));
    persistInterim();
    navigate('/newsletter/companies');
  };
  return (
    <div style={{ padding: '64px 24px 140px' }}>
      <button onClick={() => navigate('/newsletter/econ')} aria-label="뒤로가기" style={backBtnStyle}>←</button>
      <ProgressBar currentStep={WIZARD_STEPS.TECH_TOPICS} />
      <h2 style={{ fontSize: 22, margin: '0 0 12px' }}>기술/산업 관심사</h2>
      <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>관심 있는 분야를 추가로 선택하세요. (선택)</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 56 }}>
        {TECH_OPTIONS.map(o => (
          <button key={o} onClick={() => toggle(o)} style={chipStyle(techTopics.includes(o))}>{o}</button>
        ))}
      </div>
      <button onClick={goNext} style={nextBtn}>다음</button>
    </div>
  );
}

const backBtnStyle = {
  position: 'fixed', top: 16, left: 16, width: 40, height: 40,
  background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
  fontSize: 20, lineHeight: '36px', textAlign: 'center', cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
};
const chipStyle = (active) => ({
  padding: '10px 16px', borderRadius: 999,
  border: '1px solid ' + (active ? '#377BFF' : '#D0D5DD'),
  background: active ? 'linear-gradient(90deg,#377BFF,#5AA2FF)' : '#fff',
  color: active ? '#fff' : '#333', fontSize: 14, cursor: 'pointer'
});
const nextBtn = {
  position: 'fixed', left: 16, right: 16, bottom: 28,
  background: 'linear-gradient(90deg,#377BFF,#5AA2FF)', color: '#fff',
  border: 'none', borderRadius: 16, padding: '16px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer'
};
