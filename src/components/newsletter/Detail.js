// 뉴스레터 상세 화면 (Figma 스펙 구현)
// - 고정 캔버스 폭 412 / 컨텐츠 폭 380 (좌우 16)
// - 영역 구성: 헤더 / 카테고리+제목 / 히어로 이미지 / 인트로 하이라이트 / 비교 리스트 카드 / 분석 섹션
// - 고정 높이 프레임 구조로 픽셀 단위 디자인 재현
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Layout constants
const CANVAS_W = 412;
const CONTENT_W = 380; // left/right 16

// Detail: 뉴스레터 상세 본문 컴포넌트
export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = DETAIL_DATA[id] || DETAIL_DATA.default;
  const [step, setStep] = useState(0);
  const exts = ['.png','.jpg','.jpeg','.webp','.svg'];
  const candidates = id ? exts.flatMap(ext => [
    `/assets/newsletters/detail/${id}${ext}`,
    `/assets/newsletters/${id}${ext}`,
  ]) : [];
  const src = candidates[step] || null;

  return (
    <div style={pageOuter}>
      <div style={canvas}>
        <Header onBack={() => navigate(-1)} />
        <div style={fullImageWrap}>
          {src && (
            <img
              src={src}
              alt=""
              onError={() => setStep(s => s + 1)}
              style={{ display:'block', width:'100%', height:'auto' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Header: 상단 뒤로가기 + 제목 + 북마크 영역
function Header({ onBack }) {
  return (
    <div style={headerBar}>
      <button onClick={onBack} aria-label="뒤로" style={iconBtn}>←</button>
      <div style={headerTitle}>뉴스레터</div>
      <button aria-label="북마크" style={bookmarkBtn}>★</button>
    </div>
  );
}

// 목록
const DETAIL_DATA = {
  a1: {
    category: '부동산',
    title: '2030 투자자들이 요즘 선택하는 ETF는?',
    heroImg: '',
    intro: { heading: '테크·AI·ESG ETF, 어떤 선택이 내 투자 스타일에 맞을까?', desc: '최근 20대 후반 투자자들 사이에서 테크 ETF, AI ETF, ESG ETF가 뜨거운 관심을 받고 있습니다. 이 세 가지 ETF는 모두 성장 가능성이 높지만, 투자 전략과 수익률에서 차이가 있는데요.' },
    listBlocks: [
      '테크 ETF는 빅테크 기업 중심으로 구성되어 안정성과 성장성을 동시에 추구합니다.',
      'AI ETF는 인공지능 혁신 기업에 집중 투자해 변동성은 크지만 고수익을 노립니다.',
      'ESG ETF는 친환경·사회책임·지배구조를 고려한 포트폴리오로 장기 성장성을 추구합니다.'
    ],
    analysis: { heading: '현실적 조정 포인트', body: '이번 뉴스레터에서는 최근 수익률, 주요 편입 종목, 그리고 2030 세대가 선택하는 이유를 중심으로 이 세 가지 ETF를 비교 분석해드립니다. 내 투자 성향에 맞는 ETF가 무엇인지 함께 찾아보세요.' }
  },
  default: {
    category: '카테고리',
    title: '샘플 기사 제목입니다',
    heroImg: '',
    intro: { heading: '소제목 강조 라인', desc: '예시 설명 문단입니다. 실제 데이터가 로딩되기 전 기본 형태를 표시하기 위한 플레이스홀더 텍스트입니다.' },
    listBlocks: [ '첫 번째 포인트 예시입니다.', '두 번째 포인트 예시입니다.', '세 번째 포인트 예시입니다.' ],
    analysis: { heading: '분석 포인트', body: '추가 분석 세부 내용이 여기에 배치됩니다. 사용자에게 인사이트를 제공하는 서술형 텍스트입니다.' }
  }
};

const pageOuter = { width: '100%', minHeight: '100vh', background: '#F4F6FA', display: 'flex', justifyContent: 'center' };
const canvas = { position: 'relative', width: CANVAS_W, maxWidth: '100%', height:953, background: '#F4F6FA', fontFamily: 'Roboto, sans-serif', overflow:'hidden' };
const headerBar = { position: 'absolute', top:64, left:16, width:CONTENT_W, height:24, display:'flex', alignItems:'center', gap:16 };
const iconBtn = { width:24, height:24, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#282828' };
const headerTitle = { fontSize:18, fontWeight:700, lineHeight:'21px', letterSpacing:'-0.02em', color:'#282828' };
const bookmarkBtn = { width:24, height:24, marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#474747', display:'flex', alignItems:'center', justifyContent:'center' };

const fullImageWrap = { position:'absolute', top:64, left:16, width:CONTENT_W, paddingBottom:32 };

