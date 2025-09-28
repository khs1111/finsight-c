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

const pageOuter = { width: '100%', minHeight: '100vh', background: '#F4F6FA', display: 'flex', justifyContent: 'center' };
const canvas = { position: 'relative', width: CANVAS_W, maxWidth: '100%', height:953, background: '#F4F6FA', fontFamily: 'Roboto, sans-serif', overflow:'hidden' };
const headerBar = { position: 'absolute', top:64, left:16, width:CONTENT_W, height:24, display:'flex', alignItems:'center', gap:16 };
const iconBtn = { width:24, height:24, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#282828' };
const headerTitle = { fontSize:18, fontWeight:700, lineHeight:'21px', letterSpacing:'-0.02em', color:'#282828' };
const bookmarkBtn = { width:24, height:24, marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#474747', display:'flex', alignItems:'center', justifyContent:'center' };

const fullImageWrap = { position:'absolute', top:64, left:16, width:CONTENT_W, paddingBottom:32 };

