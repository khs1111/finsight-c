// 뉴스레터 구독 시작 화면
import React, { useState } from 'react';
import BackIcon from './BackIcon';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from './wizardSteps';
import newsIcon from '../../assets/news-icon.png';
import targetIcon from '../../assets/target-icon.png';
import financeIcon from '../../assets/finance-icon.png';
import bellIcon from '../../assets/bell-icon.png';

// Subscribe: 구독 온보딩 첫 화면
export default function Subscribe() {
  const navigate = useNavigate();
  const [allowKakao] = useState(false); // 디자인 상 첫 화면에서는 체크박스 제거 (추후 별도 동의 단계 가능)

  const proceed = (skip = false) => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIBED, 'true');
    if (!skip && allowKakao) localStorage.setItem(STORAGE_KEYS.KAKAO, 'true');
    if (skip) {
      navigate('/newsletter/feed', { replace: true });
    } else {
      navigate('/newsletter/econ', { replace: true });
    }
  };

  return (
    <div style={outerWrap}>
      <div style={canvas}> {/* Simulated 412x917 design canvas centered */}
        <Header onBack={() => navigate(-1)} onSkip={() => proceed(true)} />
        <div style={scrollArea}>
          {/* 뉴스 아이콘이 포함된 히어로 영역 */}
          <div style={heroImage} aria-label="뉴스레터 아이콘">
            <img src={newsIcon} alt="뉴스 아이콘" style={{ width: 120, height: 120 }} />
          </div>
          <h1 style={headline}>나만의 뉴스레터를 만나보세요</h1>
          <p style={subCopy}>관심 분야와 투자 성향에 맞는 맞춤형 뉴스레터를 구독하고 더 스마트한 투자자가 되어보세요!</p>
          <div style={cardsWrap}>
            <FeatureCard
              icon={<img src={targetIcon} alt="타겟 아이콘" style={{ width: 48, height: 48 }} />}
              title="맞춤형 콘텐츠"
              desc="나에게 필요한 정보만 받을 수 있어요."
            />
            <FeatureCard
              icon={<img src={financeIcon} alt="금융 아이콘" style={{ width: 48, height: 48 }} />}
              title="무제한 퀴즈"
              desc="재미있게 경제 공부를 핀사이트에서 시작하세요."
            />
            <FeatureCard
              icon={<img src={bellIcon} alt="벨 아이콘" style={{ width: 48, height: 48 }} />}
              title="카카오톡 알림"
              desc="실시간 맞춤 알림 서비스 제공해요."
            />
          </div>
        </div>
  <button style={ctaButton} onClick={() => proceed(false)}>구독하기</button>
      </div>
    </div>
  );
}

function Header({ onBack, onSkip }) {
  return (
    <div style={headerBar}>
      <div style={backWrapper}>
        <button onClick={onBack} aria-label="뒤로" style={backBtn}><BackIcon /></button>
      </div>
      <div style={titleBox}>뉴스레터 구독</div>
      <button onClick={onSkip} style={skipBtn}>건너뛰기</button>
    </div>
  );
}

// FeatureCard: 기능 소개 카드
function FeatureCard({ icon, title, desc }) {
  const cleanDesc = typeof desc === 'string' ? desc.replace(/[\u2028\u2029]/g, ' ') : desc;
  return (
    <div style={featureCard}>
      <div style={featureInnerRow}>
        <div style={iconBox}>{icon}</div>
        <div style={featureTextCol}>
          <div style={featureTitle}>{title}</div>
          <div style={featureDesc} title={cleanDesc}>{cleanDesc}</div>
        </div>
      </div>
    </div>
  );
}

const outerWrap = {
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
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
};

const headerBar = {
  position: 'absolute',
  top: 16,
  left: 16,
  right: 16,
  height: 24,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 16,
  padding: 0
};


const backWrapper = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: 24,
  height: 24
};

const backBtn = {
  width: 24,
  height: 24,
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const titleBox = {
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 700,
  fontSize: 18,
  lineHeight: '18px',
  letterSpacing: '-0.02em',
  color: '#282828',
  whiteSpace: 'nowrap',
  flexGrow: 1
};

const skipBtn = {
  background: 'none',
  border: 'none',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 700,
  fontSize: 18,
  lineHeight: '18px',
  letterSpacing: '0',
  color: '#9B9B9B',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  marginLeft: 'auto'
};

const scrollArea = {
  flex: 1,
  overflowY: 'auto',
  paddingTop: 158,
  paddingBottom: 140,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const heroImage = {
  position: 'absolute',
  width: 120,
  height: 120,
  left: 'calc(50% - 60px)', // 중앙 정렬 (120px의 절반)
  top: 206,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const headline = {
  position: 'absolute',
  width: 293,
  height: 22,
  left: 'calc(50% - 146.5px)', // 중앙 정렬
  top: 358,
  textAlign: 'center',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 700,
  fontSize: 24,
  lineHeight: '22px',
  letterSpacing: '-0.02em',
  color: '#000000',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const subCopy = {
  position: 'absolute',
  width: 256,
  height: 44,
  left: 'calc(50% - 128px)', // 중앙 정렬
  top: 396,
  textAlign: 'center',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '22px',
  letterSpacing: '-0.02em',
  color: '#4D4D4D',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const cardsWrap = {
  position: 'absolute',
  width: 380,
  height: 272,
  left: 16,
  top: 509,
  display: 'flex',
  flexDirection: 'column',
  gap: 16
};

const featureCard = {
  boxSizing: 'border-box',
  background: 'linear-gradient(#FFFFFF,#FFFFFF) padding-box, linear-gradient(90deg,#448FFF 0%,#4833D0 100%) border-box',
  border: '1px solid transparent',
  borderRadius: 16,
  padding: '11px 16px',
  width: 380,
  height: 72,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: 10,
  boxShadow: '0 4px 10px -2px rgba(56,111,255,0.12)'
};

const featureInnerRow = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: 0,
  gap: 16,
  width: 265,
  height: 48
};

const featureTextCol = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: 0,
  gap: 4,
  width: 209,
  height: 48
};

const iconBox = {
  width: 48,
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const featureTitle = {
  display: 'flex',
  alignItems: 'center',
  width: 209,
  height: 22,
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 700,
  fontSize: 14,
  lineHeight: '22px',
  letterSpacing: '-0.02em',
  color: '#000'
};

const featureDesc = {
  display: 'flex',
  alignItems: 'center',
  width: 209,
  height: 22,
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '22px',
  letterSpacing: '-0.02em',
  color: '#474747',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const ctaButton = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  top: 801, // 카드 끝(509 + 272) + 20px 간격
  width: 380,
  maxWidth: '90%',
  height: 60,
  background: 'linear-gradient(91.43deg,#448FFF 0%,#4833D0 100%)',
  borderRadius: 8,
  border: 'none',
  color: '#FFFFFF',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 700,
  fontSize: 18,
  cursor: 'pointer',
  letterSpacing: '-0.02em'
};

const primaryBtn = {
  width: '100%',
  background: 'linear-gradient(90deg,#377BFF,#5AA2FF)',
  color: '#fff',
  border: 'none',
  borderRadius: 16,
  padding: '16px 0',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  marginBottom: 12
};

const secondaryBtn = {
  width: '100%',
  background: 'none',
  color: '#64748B',
  border: 'none',
  borderRadius: 16,
  padding: '12px 0',
  fontSize: 14,
  cursor: 'pointer'
};

const backBtnStyle = {
  position: 'absolute',
  top: 16,
  left: 16,
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  width: 44,
  height: 44,
  fontSize: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
};
