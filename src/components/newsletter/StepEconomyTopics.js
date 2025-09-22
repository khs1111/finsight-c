// 경제 관심사 선택 단계 (1단계)
// - 최대 3개 선택 / 3개 도달 시 자동 다음 단계 이동
// - 진행 바 표시 / 헤더 뒤로가기 제공
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from './NewsletterWizardContext';
import { STORAGE_KEYS } from './wizardSteps';
import BackIcon from './BackIcon';

// Map to card data (id, label, icon placeholder type)
const ECON_CARDS = [
  { id: 'domesticEconomy', label: '국내 경제' },
  { id: 'globalEconomy', label: '해외 경제' },
  { id: 'usMarket', label: '미국 증시' },
  { id: 'krMarket', label: '국내 증시' },
  { id: 'realEstate', label: '부동산' },
  { id: 'tech', label: '테크' }
];

// StepEconomyTopics: 경제 관련 관심사 선택 컴포넌트
export default function StepEconomyTopics() {
  const navigate = useNavigate();
  const { econTopics, setEconTopics, persistInterim } = useWizard();
  // 항목 토글 (최대 3개까지 선택 가능)
  const toggle = (id) => {
    setEconTopics(prev => {
      if (prev.includes(id)) {
        // 이미 선택된 항목을 클릭하면 제거
        return prev.filter(x => x !== id);
      } else {
        // 새로 선택하려는 경우
        if (prev.length >= 3) {
          // 이미 3개 선택된 경우 더 이상 선택 불가
          return prev;
        }
        return [...prev, id];
      }
    });
  };
  // 다음 단계로 이동 
  const goNext = () => {
    localStorage.setItem(STORAGE_KEYS.ECON, JSON.stringify(econTopics));
    persistInterim();
    navigate('/newsletter/companies');
  };
  return (
    <div style={outer}>
      <div style={canvas}>
        <Header onBack={() => navigate('/newsletter/subscribe')} />
        <div style={titleBlock}>
          <h1 style={titleTxt}>어떤 경제에 관심있으세요?</h1>
        </div>
        <div style={infoRow}>
          <div style={infoIcon}>ⓘ</div>
          <div style={infoText}>최대 3개까지 추가할 수 있어요.</div>
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
const titleBlock = { position: 'absolute', top: 152, left: 16, width: 380 };
const infoRow = { position: 'absolute', top: 192, left: 16, width: 380, height: 14, display: 'flex', alignItems: 'center', gap: 2 };
const infoIcon = { width: 12, height: 12, fontSize: 10, color: '#818181', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const infoText = { fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 12, lineHeight: '14px', letterSpacing: '-0.02em', color: '#818181' };
const titleTxt = { fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 24, lineHeight: '28px', color: '#000', margin: 0 };
const cardsGrid = { position: 'absolute', top: 244, left: 16, width: 380, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 16, rowGap: 16 };

function Card({ active, label, onClick }) {
  // 각 카테고리별 아이콘 컴포넌트
  const getIcon = () => {
    switch(label) {
      case '국내 경제': return <DomesticEconomyIcon active={active} />;
      case '해외 경제': return <GlobalEconomyIcon active={active} />;
      case '미국 증시': return <USMarketIcon active={active} />;
      case '국내 증시': return <KRMarketIcon active={active} />;
      case '부동산': return <RealEstateIcon active={active} />;
      case '테크': return <TechIcon active={active} />;
      default: return <div style={defaultIcon(active)} />;
    }
  };

  return (
    <button onClick={onClick} style={cardBox(active)}>
      <div style={cardIconContainer}>
        {getIcon()}
      </div>
      <div style={cardLabel(active)}>{label}</div>
      <div style={plusIcon(active)}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.1667 5.33333H6.33333V0.5C6.33333 0.223858 6.10948 0 5.83333 0C5.55719 0 5.33333 0.223858 5.33333 0.5V5.33333H0.5C0.223858 5.33333 0 5.55719 0 5.83333C0 6.10948 0.223858 6.33333 0.5 6.33333H5.33333V11.1667C5.33333 11.4428 5.55719 11.6667 5.83333 11.6667C6.10948 11.6667 6.33333 11.4428 6.33333 11.1667V6.33333H11.1667C11.4428 6.33333 11.6667 6.10948 11.6667 5.83333C11.6667 5.55719 11.4428 5.33333 11.1667 5.33333Z" fill={active ? '#448FFF' : '#9B9B9B'}/>
        </svg>
      </div>
    </button>
  );
}

const cardBox = (active) => ({ 
  position: 'relative', 
  width: 182, 
  height: 100, 
  borderRadius: 8, 
  background: '#FFFFFF', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  justifyContent: 'center', 
  padding: '9px 29px', 
  gap: 12, 
  cursor: 'pointer', 
  border: 'none',
  boxShadow: active ? '0 0 0 2px #448FFF, 0px 0px 8px rgba(10, 26, 51, 0.18)' : '0px 0px 8px rgba(10, 26, 51, 0.18)'
});

const cardIconContainer = { 
  width: 40, 
  height: 40, 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center' 
};

const defaultIcon = (active) => ({ 
  width: 40, 
  height: 40, 
  background: active ? '#BAD5FF' : '#D9D9D9', 
  borderRadius: 8 
});

const gradText = 'linear-gradient(104.45deg,#448FFF -6.51%,#4833D0 105.13%)';

const cardLabel = (active) => ({ 
  fontFamily: 'Roboto, sans-serif', 
  fontWeight: 700, 
  fontSize: 14, 
  lineHeight: '16px', 
  letterSpacing: '-0.04em', 
  color: active ? '#4833D0' : '#9B9B9B',
  background: active ? gradText : 'none',
  WebkitBackgroundClip: active ? 'text' : 'none',
  WebkitTextFillColor: active ? 'transparent' : '#9B9B9B',
  backgroundClip: active ? 'text' : 'none'
});

const plusIcon = (active) => ({ 
  position: 'absolute', 
  top: 6, 
  right: 6, 
  width: 16, 
  height: 16, 
  borderRadius: 8, 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  fontSize: 12, 
  fontWeight: 600, 
  color: active ? '#448FFF' : '#9B9B9B'
});

// 아이콘 컴포넌트들
const DomesticEconomyIcon = ({ active }) => (
  <div style={{ width: 40, height: 40, position: 'relative' }}>
    <div style={{ 
      width: 26.67, 
      height: 26.67, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-end', 
      gap: 1.33, 
      margin: '6.67px auto' 
    }}>
      <div style={{ width: 8, height: 10.67, background: active ? '#448FFF' : '#B0B0B0', borderRadius: 1.33 }} />
      <div style={{ width: 8, height: 17.33, background: active ? '#448FFF' : '#B0B0B0', borderRadius: 1.33 }} />
      <div style={{ width: 8, height: 24, background: active ? '#448FFF' : '#B0B0B0', borderRadius: 1.33 }} />
    </div>
    <div style={{
      position: 'absolute',
      width: 13.33,
      height: 13.33,
      right: 0,
      bottom: 2.67,
      background: active ? '#FFBC02' : '#A2A2A2',
      border: `1.33px solid ${active ? '#FF8800' : '#7F7F7F'}`,
      borderRadius: 6.33,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 6.67,
      fontWeight: 900,
      color: active ? '#FF8800' : '#7F7F7F'
    }}>$</div>
  </div>
);

const GlobalEconomyIcon = ({ active }) => (
  <svg width="36" height="37" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="17" r="15" fill={active ? "#BAD5FF" : "#E0E0E0"} stroke={active ? "#448FFF" : "#B0B0B0"} strokeWidth="2"/>
    <path d="M3.2002 9.20039C4.25045 10.2671 8.24143 12.4004 15.8033 12.4004C23.3651 12.4004 27.6187 10.2671 28.8002 9.20039" stroke={active ? "#448FFF" : "#B0B0B0"} strokeWidth="2"/>
    <path d="M3.2002 25.2C4.25045 24.1333 8.24143 22 15.8033 22C23.3651 22 27.6187 24.1333 28.8002 25.2" stroke={active ? "#448FFF" : "#B0B0B0"} strokeWidth="2"/>
    <path d="M0.799805 17H31.1998" stroke={active ? "#448FFF" : "#B0B0B0"} strokeWidth="2"/>
    <path d="M16.7998 1.7998C19.7331 3.37903 25.5998 8.66941 25.5998 17.1972C25.5998 25.725 19.7331 30.7522 16.7998 32.1998" stroke={active ? "#448FFF" : "#B0B0B0"} strokeWidth="2"/>
    <path d="M15.2002 1.7998C12.5335 3.37903 7.2002 8.66941 7.2002 17.1972C7.2002 25.725 12.5335 30.7522 15.2002 32.1998" stroke={active ? "#448FFF" : "#B0B0B0"} strokeWidth="2"/>
    <path d="M16 1.7998V32.1998" stroke={active ? "#448FFF" : "#B0B0B0"} strokeWidth="2"/>
    <rect x="17" y="18" width="18" height="18" rx="8.5" fill={active ? "#FFBC02" : "#A2A2A2"}/>
    <rect x="17" y="18" width="18" height="18" rx="8.5" stroke={active ? "#FF8800" : "#7F7F7F"} strokeWidth="2"/>
    <path d="M26.5859 21.7725V23.1934H25.8096V21.7725H26.5859ZM26.4883 29.7461V31.0645H25.7119V29.7461H26.4883ZM26.8154 28.1152C26.8154 27.9362 26.7878 27.7881 26.7324 27.6709C26.6771 27.5537 26.5876 27.4512 26.4639 27.3633C26.3402 27.2754 26.1758 27.1875 25.9707 27.0996C25.5378 26.9238 25.1553 26.7432 24.8232 26.5576C24.4945 26.3721 24.2357 26.141 24.0469 25.8643C23.8613 25.5876 23.7686 25.2279 23.7686 24.7852C23.7686 24.3815 23.8678 24.0299 24.0664 23.7305C24.2682 23.431 24.5449 23.1999 24.8965 23.0371C25.2513 22.8711 26.6598 22.7881 26.1221 22.7881C26.4736 22.7881 26.7943 22.8402 27.084 22.9443C27.3737 23.0485 27.6243 23.1999 27.8359 23.3984C28.0475 23.5938 28.2103 23.8346 28.3242 24.1211C28.4382 24.4043 28.4951 24.7266 28.4951 25.0879H26.8496C26.8496 24.9023 26.8301 24.7428 26.791 24.6094C26.7552 24.4759 26.7031 24.3669 26.6348 24.2822C26.5664 24.1976 26.4867 24.1357 26.3955 24.0967C26.3044 24.0544 26.2051 24.0332 26.0977 24.0332C25.9349 24.0332 25.8031 24.069 25.7021 24.1406C25.6012 24.209 25.528 24.3001 25.4824 24.4141C25.4368 24.528 25.4141 24.6549 25.4141 24.7949C25.4141 24.9414 25.4385 25.07 25.4873 25.1807C25.5394 25.2881 25.6273 25.389 25.751 25.4834C25.8747 25.5745 26.0439 25.6689 26.2588 25.7666C26.682 25.9456 27.0596 26.1312 27.3916 26.3232C27.7236 26.5153 27.984 26.7513 28.1729 27.0312C28.3649 27.3079 28.4609 27.666 28.4609 28.1055C28.4609 28.5286 28.3617 28.89 28.1631 29.1895C27.9645 29.4857 27.6878 29.7119 27.333 29.8682C26.9782 30.0244 26.568 30.1025 26.1025 30.1025C25.79 30.1025 25.4792 30.0618 25.1699 29.9805C24.8639 29.8991 24.584 29.7673 24.3301 29.585C24.0794 29.3994 23.8792 29.1536 23.7295 28.8477C23.5798 28.5417 23.5049 28.1657 23.5049 27.7197H25.1504C25.1504 27.9378 25.1764 28.1201 25.2285 28.2666C25.2806 28.4131 25.3506 28.5303 25.4385 28.6182C25.5296 28.7028 25.6322 28.7646 25.7461 28.8037C25.86 28.8395 25.9788 28.8574 26.1025 28.8574C26.2686 28.8574 26.4036 28.8249 26.5078 28.7598C26.612 28.6914 26.6885 28.6019 26.7373 28.4912C26.7894 28.3773 26.8154 28.252 26.8154 28.1152Z" fill={active ? "#FF8800" : "#7F7F7F"}/>
  </svg>
);

const USMarketIcon = ({ active }) => (
  <svg width="40" height="26" viewBox="0 0 40 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="0.0419922" width="40" height="25.9155" rx="3.38028" fill="white"/>
    <path d="M0 3.42228C0 1.5554 1.5134 0.0419922 3.38028 0.0419922H18.5915V14.1265H0V3.42228Z" fill={active ? "#1B2E6B" : "#474747"}/>
    <rect x="18.5918" y="11.873" width="21.4085" height="2.25352" fill={active ? "#E70E0E" : "#7C7C7C"}/>
    <rect y="15.8174" width="40" height="2.25352" fill={active ? "#E70E0E" : "#7C7C7C"}/>
    <rect y="19.7607" width="40" height="2.25352" fill={active ? "#E70E0E" : "#7C7C7C"}/>
    <mask id="mask0_1442_7314" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="26">
      <rect y="0.0419922" width="40" height="25.9155" rx="3.38028" fill="white"/>
    </mask>
    <g mask="url(#mask0_1442_7314)">
      <rect x="18.5918" y="0.0419922" width="21.4085" height="2.25352" fill={active ? "#E70E0E" : "#7C7C7C"}/>
      <rect y="23.7041" width="40" height="2.25352" fill={active ? "#E70E0E" : "#7C7C7C"}/>
    </g>
    <rect x="18.5918" y="7.92969" width="21.4085" height="2.25352" fill={active ? "#E70E0E" : "#7C7C7C"}/>
    <rect x="18.5918" y="3.98633" width="21.4085" height="2.25352" fill={active ? "#E70E0E" : "#7C7C7C"}/>
    <path d="M2.41478 2.2959L2.5774 2.79641H3.10367L2.67791 3.10574L2.84054 3.60625L2.41478 3.29692L1.98902 3.60625L2.15164 3.10574L1.72588 2.79641H2.25215L2.41478 2.2959Z" fill="white"/>
    <path d="M5.23118 2.2959L5.39381 2.79641H5.92008L5.49432 3.10574L5.65694 3.60625L5.23118 3.29692L4.80542 3.60625L4.96805 3.10574L4.54229 2.79641H5.06856L5.23118 2.2959Z" fill="white"/>
    <path d="M8.04856 2.2959L8.21119 2.79641H8.73746L8.3117 3.10574L8.47432 3.60625L8.04856 3.29692L7.6228 3.60625L7.78543 3.10574L7.35967 2.79641H7.88594L8.04856 2.2959Z" fill="white"/>
    <path d="M10.865 2.2959L11.0276 2.79641H11.5539L11.1281 3.10574L11.2907 3.60625L10.865 3.29692L10.4392 3.60625L10.6018 3.10574L10.1761 2.79641H10.7023L10.865 2.2959Z" fill="white"/>
    <path d="M13.6824 2.2959L13.845 2.79641H14.3712L13.9455 3.10574L14.1081 3.60625L13.6824 3.29692L13.2566 3.60625L13.4192 3.10574L12.9935 2.79641H13.5197L13.6824 2.2959Z" fill="white"/>
    <path d="M16.4997 2.2959L16.6624 2.79641H17.1886L16.7629 3.10574L16.9255 3.60625L16.4997 3.29692L16.074 3.60625L16.2366 3.10574L15.8108 2.79641H16.3371L16.4997 2.2959Z" fill="white"/>
    <path d="M3.86302 3.74512L4.02564 4.24563H4.55191L4.12615 4.55496L4.28878 5.05547L3.86302 4.74614L3.43726 5.05547L3.59988 4.55496L3.17412 4.24563H3.70039L3.86302 3.74512Z" fill="white"/>
    <path d="M6.6804 3.74512L6.84303 4.24563H7.36929L6.94353 4.55496L7.10616 5.05547L6.6804 4.74614L6.25464 5.05547L6.41727 4.55496L5.99151 4.24563H6.51777L6.6804 3.74512Z" fill="white"/>
    <path d="M9.49583 3.74512L9.65846 4.24563H10.1847L9.75896 4.55496L9.92159 5.05547L9.49583 4.74614L9.07007 5.05547L9.2327 4.55496L8.80694 4.24563H9.3332L9.49583 3.74512Z" fill="white"/>
    <path d="M12.3142 3.74512L12.4768 4.24563H13.0031L12.5773 4.55496L12.7399 5.05547L12.3142 4.74614L11.8884 5.05547L12.0511 4.55496L11.6253 4.24563H12.1516L12.3142 3.74512Z" fill="white"/>
    <path d="M15.1306 3.74512L15.2932 4.24563H15.8195L15.3937 4.55496L15.5564 5.05547L15.1306 4.74614L14.7048 5.05547L14.8675 4.55496L14.4417 4.24563H14.968L15.1306 3.74512Z" fill="white"/>
    <path d="M2.41478 5.19336L2.5774 5.69387H3.10367L2.67791 6.0032L2.84054 6.50371L2.41478 6.19438L1.98902 6.50371L2.15164 6.0032L1.72588 5.69387H2.25215L2.41478 5.19336Z" fill="white"/>
    <path d="M5.23118 5.19336L5.39381 5.69387H5.92008L5.49432 6.0032L5.65694 6.50371L5.23118 6.19438L4.80542 6.50371L4.96805 6.0032L4.54229 5.69387H5.06856L5.23118 5.19336Z" fill="white"/>
    <path d="M8.04856 5.19336L8.21119 5.69387H8.73746L8.3117 6.0032L8.47432 6.50371L8.04856 6.19438L7.6228 6.50371L7.78543 6.0032L7.35967 5.69387H7.88594L8.04856 5.19336Z" fill="white"/>
    <path d="M10.865 5.19336L11.0276 5.69387H11.5539L11.1281 6.0032L11.2907 6.50371L10.865 6.19438L10.4392 6.50371L10.6018 6.0032L10.1761 5.69387H10.7023L10.865 5.19336Z" fill="white"/>
    <path d="M13.6824 5.19336L13.845 5.69387H14.3712L13.9455 6.0032L14.1081 6.50371L13.6824 6.19438L13.2566 6.50371L13.4192 6.0032L12.9935 5.69387H13.5197L13.6824 5.19336Z" fill="white"/>
    <path d="M16.4997 5.19336L16.6624 5.69387H17.1886L16.7629 6.0032L16.9255 6.50371L16.4997 6.19438L16.074 6.50371L16.2366 6.0032L15.8108 5.69387H16.3371L16.4997 5.19336Z" fill="white"/>
    <path d="M2.41478 8.09082L2.5774 8.59133H3.10367L2.67791 8.90066L2.84054 9.40117L2.41478 9.09184L1.98902 9.40117L2.15164 8.90066L1.72588 8.59133H2.25215L2.41478 8.09082Z" fill="white"/>
    <path d="M5.23118 8.09082L5.39381 8.59133H5.92008L5.49432 8.90066L5.65694 9.40117L5.23118 9.09184L4.80542 9.40117L4.96805 8.90066L4.54229 8.59133H5.06856L5.23118 8.09082Z" fill="white"/>
    <path d="M8.04856 8.09082L8.21119 8.59133H8.73746L8.3117 8.90066L8.47432 9.40117L8.04856 9.09184L7.6228 9.40117L7.78543 8.90066L7.35967 8.59133H7.88594L8.04856 8.09082Z" fill="white"/>
    <path d="M10.865 8.09082L11.0276 8.59133H11.5539L11.1281 8.90066L11.2907 9.40117L10.865 9.09184L10.4392 9.40117L10.6018 8.90066L10.1761 8.59133H10.7023L10.865 8.09082Z" fill="white"/>
    <path d="M13.6824 8.09082L13.845 8.59133H14.3712L13.9455 8.90066L14.1081 9.40117L13.6824 9.09184L13.2566 9.40117L13.4192 8.90066L12.9935 8.59133H13.5197L13.6824 8.09082Z" fill="white"/>
    <path d="M16.4997 8.09082L16.6624 8.59133H17.1886L16.7629 8.90066L16.9255 9.40117L16.4997 9.09184L16.074 9.40117L16.2366 8.90066L15.8108 8.59133H16.3371L16.4997 8.09082Z" fill="white"/>
    <path d="M3.86302 9.53906L4.02564 10.0396H4.55191L4.12615 10.3489L4.28878 10.8494L3.86302 10.5401L3.43726 10.8494L3.59988 10.3489L3.17412 10.0396H3.70039L3.86302 9.53906Z" fill="white"/>
    <path d="M6.6804 9.53906L6.84303 10.0396H7.36929L6.94353 10.3489L7.10616 10.8494L6.6804 10.5401L6.25464 10.8494L6.41727 10.3489L5.99151 10.0396H6.51777L6.6804 9.53906Z" fill="white"/>
    <path d="M9.49583 9.53906L9.65846 10.0396H10.1847L9.75896 10.3489L9.92159 10.8494L9.49583 10.5401L9.07007 10.8494L9.2327 10.3489L8.80694 10.0396H9.3332L9.49583 9.53906Z" fill="white"/>
    <path d="M12.3142 9.53906L12.4768 10.0396H13.0031L12.5773 10.3489L12.7399 10.8494L12.3142 10.5401L11.8884 10.8494L12.0511 10.3489L11.6253 10.0396H12.1516L12.3142 9.53906Z" fill="white"/>
    <path d="M15.1306 9.53906L15.2932 10.0396H15.8195L15.3937 10.3489L15.5564 10.8494L15.1306 10.5401L14.7048 10.8494L14.8675 10.3489L14.4417 10.0396H14.968L15.1306 9.53906Z" fill="white"/>
    <path d="M2.41478 10.9883L2.5774 11.4888H3.10367L2.67791 11.7981L2.84054 12.2986L2.41478 11.9893L1.98902 12.2986L2.15164 11.7981L1.72588 11.4888H2.25215L2.41478 10.9883Z" fill="white"/>
    <path d="M5.23118 10.9883L5.39381 11.4888H5.92008L5.49432 11.7981L5.65694 12.2986L5.23118 11.9893L4.80542 12.2986L4.96805 11.7981L4.54229 11.4888H5.06856L5.23118 10.9883Z" fill="white"/>
    <path d="M8.04856 10.9883L8.21119 11.4888H8.73746L8.3117 11.7981L8.47432 12.2986L8.04856 11.9893L7.6228 12.2986L7.78543 11.7981L7.35967 11.4888H7.88594L8.04856 10.9883Z" fill="white"/>
    <path d="M10.865 10.9883L11.0276 11.4888H11.5539L11.1281 11.7981L11.2907 12.2986L10.865 11.9893L10.4392 12.2986L10.6018 11.7981L10.1761 11.4888H10.7023L10.865 10.9883Z" fill="white"/>
    <path d="M13.6824 10.9883L13.845 11.4888H14.3712L13.9455 11.7981L14.1081 12.2986L13.6824 11.9893L13.2566 12.2986L13.4192 11.7981L12.9935 11.4888H13.5197L13.6824 10.9883Z" fill="white"/>
    <path d="M16.4997 10.9883L16.6624 11.4888H17.1886L16.7629 11.7981L16.9255 12.2986L16.4997 11.9893L16.074 12.2986L16.2366 11.7981L15.8108 11.4888H16.3371L16.4997 10.9883Z" fill="white"/>
    <path d="M3.86302 6.6416L4.02564 7.14211H4.55191L4.12615 7.45145L4.28878 7.95196L3.86302 7.64262L3.43726 7.95196L3.59988 7.45145L3.17412 7.14211H3.70039L3.86302 6.6416Z" fill="white"/>
    <path d="M6.6804 6.6416L6.84303 7.14211H7.36929L6.94353 7.45145L7.10616 7.95196L6.6804 7.64262L6.25464 7.95196L6.41727 7.45145L5.99151 7.14211H6.51777L6.6804 6.6416Z" fill="white"/>
    <path d="M9.49583 6.6416L9.65846 7.14211H10.1847L9.75896 7.45145L9.92159 7.95196L9.49583 7.64262L9.07007 7.95196L9.2327 7.45145L8.80694 7.14211H9.3332L9.49583 6.6416Z" fill="white"/>
    <path d="M12.3142 6.6416L12.4768 7.14211H13.0031L12.5773 7.45145L12.7399 7.95196L12.3142 7.64262L11.8884 7.95196L12.0511 7.45145L11.6253 7.14211H12.1516L12.3142 6.6416Z" fill="white"/>
    <path d="M15.1306 6.6416L15.2932 7.14211H15.8195L15.3937 7.45145L15.5564 7.95196L15.1306 7.64262L14.7048 7.95196L14.8675 7.45145L14.4417 7.14211H14.968L15.1306 6.6416Z" fill="white"/>
  </svg>
);

const KRMarketIcon = ({ active }) => (
  <div style={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 2 }}>
    <div style={{ width: 12, height: 16, background: active ? '#448FFF' : '#A8A8A8', borderRadius: 2 }} />
    <div style={{ width: 12, height: 26, background: active ? '#448FFF' : '#A8A8A8', borderRadius: 2 }} />
    <div style={{ width: 12, height: 36, background: active ? '#448FFF' : '#A8A8A8', borderRadius: 2 }} />
  </div>
);

const RealEstateIcon = ({ active }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="17.3975" y="8.4209" width="21.4907" height="29.4735" rx="3" fill={active ? "#B6CCED" : "#C9C9C9"}/>
    <rect x="21.4912" y="26.3154" width="5.11684" height="4.2105" rx="1" fill={active ? "#77ADFF" : "#B5B5B5"}/>
    <rect x="29.6777" y="26.3154" width="5.11684" height="4.2105" rx="1" fill={active ? "#77ADFF" : "#B5B5B5"}/>
    <rect x="21.4912" y="13.6846" width="5.11684" height="4.2105" rx="1" fill={active ? "#77ADFF" : "#B5B5B5"}/>
    <rect x="21.4912" y="20" width="5.11684" height="4.2105" rx="1" fill={active ? "#77ADFF" : "#B5B5B5"}/>
    <rect x="29.6777" y="13.6846" width="5.11684" height="4.2105" rx="1" fill={active ? "#77ADFF" : "#B5B5B5"}/>
    <rect x="29.6777" y="20" width="5.11684" height="4.2105" rx="1" fill={active ? "#77ADFF" : "#B5B5B5"}/>
    <rect width="27.6309" height="37.8945" rx="3.85714" fill={active ? "#BAD5FF" : "#D9D9D9"}/>
    <rect x="5.26367" y="23.0068" width="6.5788" height="5.4135" rx="1.28571" fill={active ? "#77ADFF" : "#B5B5B5"}/>
    <rect x="15.7891" y="23.0068" width="6.5788" height="5.4135" rx="1.28571" fill={active ? "#77ADFF" : "#B5B5B5"}/>
    <rect x="5.26367" y="6.7666" width="6.5788" height="5.4135" rx="1.28571" fill={active ? "#77ADFF" : "#B5B5B5"}/>
    <rect x="5.26367" y="14.8877" width="6.5788" height="5.4135" rx="1.28571" fill={active ? "#77ADFF" : "#B5B5B5"}/>
    <rect x="15.7891" y="6.7666" width="6.5788" height="5.4135" rx="1.28571" fill={active ? "#77ADFF" : "#B5B5B5"}/>
    <rect x="15.7891" y="14.8877" width="6.5788" height="5.4135" rx="1.28571" fill={active ? "#77ADFF" : "#B5B5B5"}/>
    <path d="M11.6873 40.0002H38.1694C39.1676 40.0002 40.0428 39.2608 39.986 38.2642C39.8868 36.5241 39.1942 34.1052 36.3291 32.6315C32.2356 30.5261 28.995 32.1051 28.1422 33.1579C28.1422 31.5788 26.1978 27.7899 20.4669 27.3689C14.736 26.9478 12.9621 31.9301 12.7915 33.6844C9.81993 33.6844 9.5337 36.4237 9.89215 38.5881C10.0338 39.4434 10.8203 40.0002 11.6873 40.0002Z" fill={active ? "#46A874" : "#767676"}/>
  </svg>
);

const TechIcon = ({ active }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.88867 2.22222C8.88867 0.994924 9.8836 0 11.1109 0C12.3382 0 13.3331 0.994923 13.3331 2.22222V4.44444H8.88867V2.22222Z" fill={active ? "#6384B5" : "#939393"}/>
    <path d="M31.1113 37.7778C31.1113 39.0051 30.1164 40 28.8891 40C27.6618 40 26.6669 39.0051 26.6669 37.7778V35.5556H31.1113V37.7778Z" fill={active ? "#6384B5" : "#939393"}/>
    <path d="M2.22222 31.1113C0.994924 31.1113 -4.34895e-08 30.1164 -9.71364e-08 28.8891C-1.50783e-07 27.6618 0.994923 26.6669 2.22222 26.6669L4.44444 26.6669L4.44444 31.1113L2.22222 31.1113Z" fill={active ? "#6384B5" : "#939393"}/>
    <path d="M37.7778 8.88867C39.0051 8.88867 40 9.8836 40 11.1109C40 12.3382 39.0051 13.3331 37.7778 13.3331L35.5556 13.3331L35.5556 8.88867L37.7778 8.88867Z" fill={active ? "#6384B5" : "#939393"}/>
    <path d="M17.7773 2.22222C17.7773 0.994924 18.7723 0 19.9996 0C21.2269 0 22.2218 0.994923 22.2218 2.22222V4.44444H17.7773V2.22222Z" fill={active ? "#6384B5" : "#939393"}/>
    <path d="M22.2227 37.7778C22.2227 39.0051 21.2277 40 20.0004 40C18.7731 40 17.7782 39.0051 17.7782 37.7778V35.5556H22.2227V37.7778Z" fill={active ? "#6384B5" : "#939393"}/>
    <path d="M2.22222 22.2227C0.994924 22.2227 -4.34895e-08 21.2277 -9.71364e-08 20.0004C-1.50783e-07 18.7731 0.994923 17.7782 2.22222 17.7782L4.44444 17.7782L4.44444 22.2227L2.22222 22.2227Z" fill={active ? "#6384B5" : "#939393"}/>
    <path d="M37.7778 17.7773C39.0051 17.7773 40 18.7723 40 19.9996C40 21.2269 39.0051 22.2218 37.7778 22.2218L35.5556 22.2218L35.5556 17.7773L37.7778 17.7773Z" fill={active ? "#6384B5" : "#939393"}/>
    <path d="M26.667 2.22222C26.667 0.994924 27.6619 0 28.8892 0C30.1165 0 31.1114 0.994923 31.1114 2.22222V4.44444H26.667V2.22222Z" fill={active ? "#6384B5" : "#939393"}/>
    <path d="M13.333 37.7778C13.333 39.0051 12.3381 40 11.1108 40C9.88349 40 8.88856 39.0051 8.88856 37.7778V35.5556H13.333V37.7778Z" fill={active ? "#6384B5" : "#939393"}/>
    <path d="M2.22222 13.333C0.994924 13.333 -4.34895e-08 12.3381 -9.71364e-08 11.1108C-1.50783e-07 9.88349 0.994923 8.88856 2.22222 8.88856L4.44444 8.88856L4.44444 13.333L2.22222 13.333Z" fill={active ? "#6384B5" : "#939393"}/>
    <path d="M37.7778 26.667C39.0051 26.667 40 27.6619 40 28.8892C40 30.1165 39.0051 31.1114 37.7778 31.1114L35.5556 31.1114L35.5556 26.667L37.7778 26.667Z" fill={active ? "#6384B5" : "#939393"}/>
    <rect x="4.44434" y="4.44434" width="31.1111" height="31.1111" rx="4.44444" fill={active ? "#BAD5FF" : "#E1E1E1"}/>
    <rect x="8.88867" y="8.88867" width="22.2222" height="22.2222" rx="2.22222" fill={active ? "#448FFF" : "#9F9F9F"}/>
    <path d="M21.8806 22.4678C21.9202 22.5705 21.9399 22.6575 21.9399 22.7286C21.9399 22.8945 21.8806 23.0367 21.7621 23.1552C21.6436 23.2737 21.4974 23.333 21.3236 23.333C21.2051 23.333 21.0905 23.3014 20.9799 23.2382C20.8772 23.1671 20.8021 23.0723 20.7547 22.9537L20.091 21.2945H15.8362L15.1606 22.9537C15.1053 23.0723 15.0263 23.1671 14.9236 23.2382C14.8209 23.3014 14.7103 23.333 14.5918 23.333C14.4179 23.333 14.2718 23.2737 14.1532 23.1552C14.0426 23.0288 13.9873 22.8826 13.9873 22.7167C13.9873 22.6377 14.0071 22.5468 14.0466 22.4441L17.3769 14.4915C17.4955 14.215 17.689 14.0767 17.9577 14.0767C18.2421 14.0767 18.4357 14.215 18.5384 14.4915L21.8806 22.4678ZM16.251 20.2752H19.6762L17.9814 16.056L16.251 20.2752ZM25.094 23.333C24.9202 23.333 24.774 23.2737 24.6555 23.1552C24.5369 23.0367 24.4777 22.8905 24.4777 22.7167V14.693C24.4777 14.5113 24.5369 14.3651 24.6555 14.2545C24.774 14.136 24.9202 14.0767 25.094 14.0767C25.2757 14.0767 25.4219 14.136 25.5325 14.2545C25.651 14.3651 25.7103 14.5113 25.7103 14.693V22.7167C25.7103 22.8905 25.651 23.0367 25.5325 23.1552C25.4219 23.2737 25.2757 23.333 25.094 23.333Z" fill="white"/>
  </svg>
);

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

