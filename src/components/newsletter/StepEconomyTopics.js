// 경제 관심사 선택 단계 (1단계)
// - 최대 3개 선택 / 3개 도달 시 자동 다음 단계 이동
// - 진행 바 표시 / 헤더 뒤로가기 제공
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from './NewsletterWizardContext';
import { STORAGE_KEYS } from './wizardSteps';
import BasicProgressBar from './BasicProgressBar';
import BackIcon from './BackIcon';

// Map to card data (id, label, icon placeholder type)
const ECON_CARDS = [
  { id: 'domesticEconomy', label: '국내 경제' },
  { id: 'globalEconomy', label: '해외 경제' },
  { id: 'usMarket', label: '미국 증시' },
  { id: 'krMarket', label: '국내 증시' },
  { id: 'realEstate', label: '부동산' }
];

// StepEconomyTopics: 경제 관련 관심사 선택 컴포넌트
export default function StepEconomyTopics() {
  const navigate = useNavigate();
  const { econTopics, setEconTopics, persistInterim } = useWizard();
  // 항목 토글 (3개 도달 시 자동 이동)
  const toggle = (id) => {
    setEconTopics(prev => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter(x => x !== id);
      } else {
        next = [...prev, id];
      }
      if (!prev.includes(id) && next.length === 3) {
        localStorage.setItem(STORAGE_KEYS.ECON, JSON.stringify(next));
        persistInterim();
        setTimeout(() => navigate('/newsletter/tech'), 150);
      }
      return next;
    });
  };
  // 다음 단계로 이동 
  const goNext = () => {
    localStorage.setItem(STORAGE_KEYS.ECON, JSON.stringify(econTopics));
    persistInterim();
    navigate('/newsletter/tech');
  };
  return (
    <div style={outer}>
      <div style={canvas}>
        <Header onBack={() => navigate('/newsletter/subscribe')} />
        <div style={progressRow}><BasicProgressBar step={1} /></div>
        <div style={titleBlock}>
          <h1 style={titleTxt}>어떤 경제에 관심있으세요?</h1>
        </div>
        <div style={cardsGrid}>
          {ECON_CARDS.map(card => (
            <Card key={card.id} active={econTopics.includes(card.id)} onClick={() => toggle(card.id)} label={card.label} />
          ))}
        </div>
        <button onClick={goNext} style={nextBtn}>다음</button>
      </div>
    </div>
  );
}

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

const outer = { width: '100%', minHeight: '100vh', background: '#F4F6FA', display: 'flex', justifyContent: 'center' };
const canvas = { position: 'relative', width: 412, maxWidth: '100%', minHeight: 917, background: '#F4F6FA', paddingBottom: 120 };
const progressRow = { position: 'absolute', top: 104, left: 16, width: 380 };
const titleBlock = { position: 'absolute', top: 168, left: 16, width: 380 };
const titleTxt = { fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 24, lineHeight: '28px', color: '#000', margin: 0 };
const cardsGrid = { position: 'absolute', top: 260, left: 16, width: 380, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 16, rowGap: 16 };

function Card({ active, label, onClick }) {
  return (
    <button onClick={onClick} style={{ ...cardBox, boxShadow: active ? '0 0 0 2px #448FFF,0 0 8px rgba(10,26,51,0.18)' : '0px 0px 8px rgba(10,26,51,0.18)' }}>
      <div style={cardIcon} />
      <div style={cardLabel(active)}>{label}</div>
      <div style={plusIcon(active)}>+</div>
    </button>
  );
}

const cardBox = { position: 'relative', width: 182, height: 100, borderRadius: 8, background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '9px 29px', gap: 12, cursor: 'pointer', border: 'none' };
const cardIcon = { width: 40, height: 40, background: '#D9D9D9', borderRadius: 8, marginBottom: 8 };
const gradText = 'linear-gradient(104.45deg,#448FFF -6.51%,#4833D0 105.13%)';
const cardLabel = (active) => ({ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 14, lineHeight: '16px', letterSpacing: '-0.04em', background: gradText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textFillColor: 'transparent', opacity: active ? 1 : 1 });
const plusIcon = (active) => ({ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: active ? '#fff' : '#448FFF', background: active ? gradText : '#E6F0FF' });

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

const nextBtn = { position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 26, width: 380, maxWidth: '90%', height: 60, background: 'linear-gradient(91.43deg,#448FFF 0%,#4833D0 100%)', borderRadius: 8, border: 'none', color: '#FFFFFF', fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 18, cursor: 'pointer', letterSpacing: '-0.02em' };

