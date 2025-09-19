import React, { useMemo } from 'react';
import BackIcon from './BackIcon';

// PostSubscribe: 구독 완료 후 보여줄 3장 스토리형 화면
// - Blue (이번주 HOT 쿠키)
// - Yellow (청년 쿠키 - 지출 구조)
// - Green (애플 쿠키 - 기업 관심)
// 각 섹션은 이미지/텍스트 레이아웃과 색상, 타이틀/부제/그래프 박스를 디자인 스펙에 맞춰 구현
// 스크롤 스냅으로 위로 스와이프하면 다음 장이 보이는 구조

export default function PostSubscribe() {
  const sections = useMemo(() => [
    BlueHotSection(),
    YellowYouthSection(),
    GreenCompanySection(),
  ], []);

  return (
    <div style={outer}>
      <div style={canvas}>
        <Header />
        <div style={snapContainer}>
          {sections.map((S, i) => (
            <div key={i} style={snapPage}>
              {S}
            </div>
          ))}
        </div>
        <div style={bottomHint}>
          <div style={{ color:'#9B9B9B', fontFamily:'Roboto, sans-serif', fontWeight:400, fontSize:14, lineHeight:'16px' }}>아래에서 위로 스크롤하면 다음장으로 넘어가요</div>
          <ChevronDown />
        </div>
      </div>
    </div>
  );
}

function Header(){
  return (
    <div style={headerRow}>
      <div style={{ width:24, height:24 }}><BackIcon/></div>
      <div style={headerTitle}>뉴스레터</div>
    </div>
  );
}

// ----- Blue Section -----
function BlueHotSection(){
  return (
    <div style={{ ...sectionBox, background:'#BBD6FF' }}>
      <div style={sectionInner}>
        <div style={sectionKicker('#448FFF')}>이번주 이슈</div>
        <div style={sectionTitle}>이번주 HOT 쿠키</div>
        <div style={cardBox}>
          <div style={{ ...imageHero, backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 107.14%), url(/assets/newsletters/cards/common-79.jpg)'}} />
          <div style={cardTitle}>카카오, 11% 상승…490일만에 6만원 넘겨</div>
          <div style={cardDesc}>AI 정책 수혜 기대감, 52주 신고가 경신도</div>
        </div>
        <div style={{ height:16 }} />
        <div style={cardBox}>
          <div style={{ ...imageHero, backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 107.14%), url(/assets/newsletters/cards/common-80.jpg)'}} />
          <div style={{ ...cardTitle, color:'#F4F6FA' }}>카카오, 11% 상승…490일만에 6만원 넘겨</div>
          <div style={cardDesc}>AI 정책 수혜 기대감, 52주 신고가 경신도</div>
        </div>
      </div>
    </div>
  );
}

// ----- Yellow Section -----
function YellowYouthSection(){
  return (
    <div style={{ ...sectionBox, background:'#FFEDBA' }}>
      <div style={sectionInner}>
        <div style={sectionKicker('#E36600')}>연령대 맞춤</div>
        <div style={sectionTitle}>청년 쿠키</div>
        <div style={imageWide('/assets/newsletters/cards/g.chung._a_small_investment.png')} />
        <div style={{ height:16 }} />
        <div style={sectionSubTitle}>2030세대의 경제 생존 전략</div>
        <div style={rowTitleWithIcon}>
          <ChartIcon/>
          <div style={rowTitleText}>지출구조의 점검 필요</div>
        </div>
        <div style={paragraph('#4A422D')}>
          많은 사람들이 첫 번째 재테크를 투자로 시작하지만, 사실 가장 먼저 해야 할 일은 지출 구조 점검입니다. 예를 들어, 월급 300만 원 중 필수 고정지출 (주거비, 통신비, 구독료 등)이 200만 원이라면, 어떤 투자도 효과가 없어요.
        </div>
        <div style={rowTitleWithIcon}>
          <BadgeIcon/>
          <div style={rowTitleText}>현실적 조정 포인트</div>
        </div>
        <div style={paragraph('#4A422D')}>
          사회 초년생이라 저축이 부담스럽다면 첫 1년은 저축 20% + 소비 30%로 시작해 점차 투자 비율을 늘려가요. 또한 대출이 있다면, 상환액을 저축·투자 항목 안에 포함해 함께 관리해요.
        </div>
      </div>
    </div>
  );
}

// ----- Green Section -----
function GreenCompanySection(){
  return (
    <div style={{ ...sectionBox, background:'#C3F3C1' }}>
      <div style={sectionInner}>
        <div style={sectionKicker('#057800')}>관심 기업</div>
        <div style={sectionTitle}>재미있는 기업 이야기</div>
        <div style={imageWide('/assets/newsletters/cards/common-78.jpg')} />
        <div style={{ height:16 }} />
        <div style={sectionSubTitle}>애플의 최근 경제 동향 요약</div>
        <div style={rowTitleWithIcon}>
          <PersonIcon/>
          <div style={rowTitleText}>iPhone 17 시리즈 출시 및 시장 반응</div>
        </div>
        <div style={paragraph('#516250')}>
          애플이 최근 'Awe-Dropping' 이벤트를 통해 iPhone 17, iPhone Air, Pro 모델 등 신제품을 선보였습니다. 특히 iPhone Air는 초박형 디자인과 안드로이드 시장 공략을 위한 전략적 포지셔닝으로 주목 받고 있습니다.
        </div>
        <div style={rowTitleWithIcon}>
          <BarIcon/>
          <div style={rowTitleText}>애플의 실적 성장 <span style={{ fontSize:12, color:'#89BF86' }}>( 단위 : 달러(Billion) )</span></div>
        </div>
        <div style={barChartRow}>
          {[
            { label:'2024/6', val:41, txt:'85B' },
            { label:'2024/9', val:53, txt:'94B' },
            { label:'2024/12', val:80, txt:'124B' },
            { label:'2025/3', val:66, txt:'95B' },
            { label:'2025/6', val:51, txt:'94B' },
          ].map((b, i) => (
            <div key={i} style={barCol}>
              <div style={barTopLabel}>{b.txt}</div>
              <div style={{ ...barRect, height:b.val }} />
              <div style={barBottomLabel}>{b.label}</div>
            </div>
          ))}
        </div>
        <div style={paragraph('#516250')}>
          2025년 6월 분기 매출은 약 940억 달러로, 전년 동기 대비 약 10% 성장했습니다. 다만 2024년 12월 연말 성수기 매출이 가장 높아, 이후 분기들은 계절적 요인으로 감소한 모습입니다.
        </div>
      </div>
    </div>
  );
}

// --- Small UI atoms ---
const outer = { width:'100%', minHeight:'100vh', background:'#F4F6FA', display:'flex', justifyContent:'center' };
const canvas = { position:'relative', width:412, maxWidth:'100%', minHeight:917, background:'#F4F6FA', overflow:'hidden' };
const headerRow = { position:'absolute', top:64, left:16, width:380, height:24, display:'flex', alignItems:'center', gap:16 };
const headerTitle = { fontFamily:'Roboto, sans-serif', fontWeight:700, fontSize:18, lineHeight:'21px', letterSpacing:'-0.02em', color:'#282828' };
const snapContainer = { position:'absolute', top:120, left:16, width:380, height:781, overflowY:'auto', scrollSnapType:'y mandatory', borderRadius:12, background:'#FFFFFF' };
const snapPage = { width:380, height:781, scrollSnapAlign:'start' };
const bottomHint = { position:'absolute', left:70, bottom:16, width:272, height:52, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 };

const sectionBox = { width:380, height:781, borderRadius:12, display:'flex', justifyContent:'center' };
const sectionInner = { width:348, display:'flex', flexDirection:'column', gap:16, paddingTop:20 };
const sectionKicker = (color) => ({ width:348, height:16, fontFamily:'Roboto, sans-serif', fontWeight:700, fontSize:14, lineHeight:'16px', letterSpacing:'-0.04em', color });
const sectionTitle = { width:348, height:28, fontFamily:'Roboto, sans-serif', fontWeight:700, fontSize:24, lineHeight:'28px', color:'#1B1B1B' };
const imageHero = { width:348, height:118.67, backgroundSize:'cover', backgroundPosition:'center', borderRadius:'4px 4px 0 0', boxShadow:'0 0 8px rgba(0,0,0,0.18)' };
const imageWide = (src) => ({ width:348, height:177, borderRadius:8, backgroundImage:`url(${src})`, backgroundSize:'cover', backgroundPosition:'center' });
const cardBox = { width:348, height:212.67, background:'#F9F9F9', borderRadius:8, boxShadow:'0 0 8px rgba(0,0,0,0.18)', paddingBottom:16 };
const cardTitle = { width:316, height:42, margin:'10px 16px 0', fontFamily:'Roboto, sans-serif', fontWeight:700, fontSize:18, lineHeight:'21px', letterSpacing:'-0.02em', color:'#F9F9F9' };
const cardDesc = { width:316, height:66, margin:'8px 16px 0', fontFamily:'Roboto, sans-serif', fontWeight:400, fontSize:14, lineHeight:'22px', letterSpacing:'-0.02em', color:'#616161' };
const sectionSubTitle = { width:348, height:28, fontFamily:'Roboto, sans-serif', fontWeight:700, fontSize:24, lineHeight:'28px', color:'#1B1B1B' };
const rowTitleWithIcon = { width:348, height:21, display:'flex', flexDirection:'row', alignItems:'center', gap:8 };
const rowTitleText = { fontFamily:'Roboto, sans-serif', fontWeight:700, fontSize:18, lineHeight:'21px', letterSpacing:'-0.02em', color:'#1B1B1B' };
const paragraph = (color) => ({ width:348, fontFamily:'Roboto, sans-serif', fontWeight:400, fontSize:14, lineHeight:'22px', letterSpacing:'-0.02em', color });

// Chart styles
const barChartRow = { width:348, display:'flex', flexDirection:'row', alignItems:'flex-end', justifyContent:'space-between', gap:32, height:178, padding:'0 0 16px' };
const barCol = { width:32, display:'flex', flexDirection:'column', alignItems:'center', gap:7 };
const barTopLabel = { width:32, textAlign:'center', fontFamily:'Roboto, sans-serif', fontWeight:700, fontSize:12, lineHeight:'14px', color:'#89BF86' };
const barRect = { width:32, background:'#057800', borderRadius:4 };
const barBottomLabel = { width:40, textAlign:'center', fontFamily:'Roboto, sans-serif', fontWeight:400, fontSize:12, lineHeight:'14px', color:'#89BF86' };

// icons
function ChevronDown(){
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 16.75c-.199.001-.39-.078-.53-.219l-8-8a.75.75 0 0 1 1.06-1.062L12 14.94l7.47-7.47a.75.75 0 0 1 1.062 1.06l-8 8a.75.75 0 0 1-.532.22Z" fill="#9B9B9B"/></svg>
  );
}
function ChartIcon(){
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="7" width="3" height="10" rx="1" fill="#1B9F7A"/><rect x="8.5" y="5" width="3" height="12" rx="1" fill="#1B9F7A"/><rect x="14" y="9" width="3" height="8" rx="1" fill="#1B9F7A"/></svg>
  );
}
function BadgeIcon(){
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#448FFF" strokeWidth="2"/><path d="M6 10l2 2 5-5" stroke="#448FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}
function PersonIcon(){
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" fill="#1B1B1B"/><rect x="4" y="11" width="12" height="6" rx="3" fill="#1B1B1B"/></svg>
  );
}
function BarIcon(){
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="9" width="3" height="8" rx="1" fill="#448FFF"/><rect x="8.5" y="6" width="3" height="11" rx="1" fill="#448FFF"/><rect x="14" y="3" width="3" height="14" rx="1" fill="#448FFF"/></svg>
  );
}
