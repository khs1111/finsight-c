// Cards: AI, 블록체인, 빅데이터, 로봇틱스, 우주항공

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from './NewsletterWizardContext';
import { STORAGE_KEYS } from './wizardSteps';
import BasicProgressBar from './BasicProgressBar';
import BackIcon from './BackIcon';

const TECH_CARDS = [
  { id: 'AI', label: 'AI' },
  { id: 'blockchain', label: '블록체인' },
  { id: 'bigdata', label: '빅데이터' },
  { id: 'robotics', label: '로봇틱스' },
  { id: 'space', label: '우주항공' }
];

export default function StepTechTopicsRedesign() {
  const navigate = useNavigate();
  const { techTopics, setTechTopics, persistInterim } = useWizard();
  const toggle = (id) => {
    setTechTopics(prev => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter(x => x !== id);
      } else {
        next = [...prev, id];
      }
      if (!prev.includes(id) && next.length === 3) {
        localStorage.setItem(STORAGE_KEYS.TECH, JSON.stringify(next));
        persistInterim();
        setTimeout(() => navigate('/newsletter/companies'), 150);
      }
      return next;
    });
  };
  const goNext = () => {
    localStorage.setItem(STORAGE_KEYS.TECH, JSON.stringify(techTopics));
    persistInterim();
    navigate('/newsletter/companies');
  };
  return (
    <div style={outer}>
      <div style={canvas}>
        <Header onBack={() => navigate('/newsletter/econ')} />
        <div style={progressRow}><BasicProgressBar step={2} /></div>
        <div style={titleBlock}>
          <h1 style={titleTxt}>어떤 기술에 관심있으세요?</h1>
        </div>
        <div style={cardsGrid}>
          {TECH_CARDS.map(card => (
            <Card key={card.id} active={techTopics.includes(card.id)} onClick={() => toggle(card.id)} label={card.label} iconVariant={card.id} />
          ))}
        </div>
        <button onClick={goNext} style={nextBtn}>다음</button>
      </div>
    </div>
  );
}

function Card({ active, label, onClick }) {
  return (
    <button onClick={onClick} style={{ ...cardBox, boxShadow: active ? '0 0 0 2px #448FFF,0 0 8px rgba(10,26,51,0.18)' : '0px 0px 8px rgba(10,26,51,0.18)' }}>
      <div style={cardIcon} />
      <div style={cardLabel(active)}>{label}</div>
      <div style={plusIcon(active)}>+</div>
    </button>
  );
}

function Header({ onBack }) {
  return (
    <div style={headerBar}>
      <button onClick={onBack} aria-label="뒤로" style={iconBtn}><BackIcon /></button>
      <div style={headerTitle}>기본 정보 입력</div>
    </div>
  );
}

const outer = { width: '100%', minHeight: '100vh', background: '#F4F6FA', display: 'flex', justifyContent: 'center' };
const canvas = { position: 'relative', width: 412, maxWidth: '100%', minHeight: 917, background: '#F4F6FA', paddingBottom: 120 };
const progressRow = { position: 'absolute', top: 104, left: 16, width: 380 };
const titleBlock = { position: 'absolute', top: 168, left: 16, width: 380 };
const titleTxt = { fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 24, lineHeight: '28px', color: '#000', margin: 0 };
const cardsGrid = { position: 'absolute', top: 260, left: 16, width: 380, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 16, rowGap: 16 };
const cardBox = { position: 'relative', width: 182, height: 100, borderRadius: 8, background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '9px 29px', gap: 12, cursor: 'pointer', border: 'none' };
const cardIcon = { width: 40, height: 40, background: '#D9D9D9', borderRadius: 8, marginBottom: 8 };
const gradText = 'linear-gradient(104.45deg,#448FFF -6.51%,#4833D0 105.13%)';
const cardLabel = (active) => ({ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 14, lineHeight: '16px', letterSpacing: '-0.04em', background: gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textFillColor: 'transparent', opacity: active ? 1 : 1 });
const plusIcon = (active) => ({ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: active ? '#fff' : '#448FFF', background: active ? gradText : '#E6F0FF' });
const nextBtn = { position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 26, width: 380, maxWidth: '90%', height: 60, background: 'linear-gradient(91.43deg,#448FFF 0%,#4833D0 100%)', borderRadius: 8, border: 'none', color: '#FFFFFF', fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 18, cursor: 'pointer', letterSpacing: '-0.02em' };
const headerBar = { position: 'absolute', top: 64, left: 16, right: 16, height: 24, display: 'flex', alignItems: 'center', gap: 16 };
const iconBtn = { width: 24, height: 24, background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const headerTitle = { fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 18, lineHeight: '21px', letterSpacing: '-0.02em', color: '#282828', whiteSpace: 'nowrap' };
