import React from 'react';
import { useNavigate } from 'react-router-dom';


export default function Onboarding() {
  const navigate = useNavigate();
  const handleStart = () => {
    localStorage.setItem('newsletterOnboardingDone', 'true');
    navigate('/newsletter/topics');
  };
  return (
    <div style={{ padding: '32px 24px 120px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '24px', lineHeight: '32px', margin: '0 0 16px' }}>맞춤 뉴스레터</h1>
      <p style={{ margin: '0 0 32px', color: '#555', fontSize: '14px' }}>관심 분야를 선택하고 나만의 HOT / My news 피드를 받아보세요.</p>
      <div style={{ display: 'grid', gap: 16, marginBottom: 48 }}>
        <FeatureCard title="맞춤형 콘텐츠" desc="관심사를 기반으로 추천" />
        <FeatureCard title="무제한 퀴즈" desc="학습형 퀴즈 연계" />
        <FeatureCard title="카카오 알림" desc="새로운 소식 푸시" />
      </div>
      <button onClick={handleStart} style={ctaStyle}>시작하기</button>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button onClick={handleStart} style={skipStyle}>건너뛰기</button>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div style={{ padding: '16px 20px', borderRadius: 16, background: '#F4F6FA' }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#555' }}>{desc}</div>
    </div>
  );
}

const ctaStyle = {
  background: 'linear-gradient(90deg,#377BFF,#5AA2FF)',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '14px 20px',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer'
};

const skipStyle = {
  background: 'none',
  color: '#888',
  border: 'none',
  fontSize: 12,
  textDecoration: 'underline',
  cursor: 'pointer'
};
