// 뉴스레터 피드 화면 (HOT / 주제별 / My news 탭)
import React, { useState, useEffect } from 'react';
import { CTA_WITH_NAV_BOTTOM } from './layoutConstants';
import Logo from './Logo';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from './wizardSteps';
import { SAMPLE_ARTICLES } from './feedData';
import newsIcon from '../../assets/news-icon.png';
import targetIcon from '../../assets/target-icon.png';
import financeIcon from '../../assets/finance-icon.png';
import bellIcon from '../../assets/bell-icon.png';

const CANVAS_W = 412;
const CONTENT_W = 380;

const TABS = ['HOT','주제별','My news'];

export default function Feed() {
  const [activeTab, setActiveTab] = useState('HOT');
  const [topics, setTopics] = useState([]);
  const categories = ['오늘의 뉴스','금융','부동산','해외 경제','테크'];
  const [selectedCategory, setSelectedCategory] = useState('오늘의 뉴스');
  const navigate = useNavigate();

  useEffect(() => {
    try { setTopics(JSON.parse(localStorage.getItem('newsletterSelectedTopics') || '[]')); } catch { setTopics([]); }
  }, []);

  const filtered = SAMPLE_ARTICLES.filter(a => {
    if (activeTab === 'HOT') return true;
    if (activeTab === '주제별') {
      if (selectedCategory === '오늘의 뉴스') return ['금융','부동산','해외 경제','테크'].includes(a.category); // treat as all
      return a.category === selectedCategory;
    }
    if (activeTab === 'My news') return topics.length ? topics.some(t => a.title.includes(t) || a.summary.includes(t)) : false;
    return true;
  });

  return (
    <div style={pageOuter}>
      <div style={canvas}> 
        <TopBar />
        <Tabs active={activeTab} onChange={setActiveTab} />
        {activeTab === 'HOT' && <>
          <Banner />
          <div style={countText}>{filtered.length}개의 소식이 있어요</div>
          <div style={cardsColumn}>
            {filtered.filter(a => ['부동산','테크'].includes(a.category)).slice(0,3).map(a => (
              <ArticleCard key={a.id} data={a} onClick={() => navigate(`/newsletter/${a.id}`)} />
            ))}
          </div>
        </>}
        {activeTab === '주제별' && <>
          <div style={topicDivider} />
          <div style={topicFlow}> 
            <div style={topicSectionHeader}>
              <div style={topicCategoryRow}>{categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} style={cat === selectedCategory ? catBtnActive : catBtn}>{cat}</button>
              ))}</div>
              <div style={topicBannerBox}><div style={topicBannerInner} onClick={() => navigate('/newsletter/subscribe')}> <div style={bannerImg} /> <div style={topicBannerTextCol}> <div style={topicBannerTitle}>My news 로 맞춤 뉴스 보자!</div><div style={topicBannerSub}>핀래터에서 나의 관심사에 딱 맞는 정보들만 확인해요</div></div></div></div>
              <div style={topicCountRow}><span style={topicCountText}>{filtered.length}개의 소식이 있어요</span></div>
            </div>
            <div style={topicCardsWrap}>
              <div style={topicCardsCol}>
                {filtered.map(a => (
                  <ArticleCard key={a.id} data={a} onClick={() => navigate(`/newsletter/${a.id}`)} />
                ))}
                {!filtered.length && <div style={emptyState}>해당 카테고리 소식이 아직 없어요.</div>}
              </div>
            </div>
          </div>
        </>}
        {activeTab === 'My news' && <>
          <div style={myHeroArea}>
            <div style={myHeroImage}>
              <img src={newsIcon} alt="뉴스 아이콘" style={{ width: 120, height: 120 }} />
            </div>
            <h1 style={myHeadline}>나만의 뉴스레터를 만나보세요</h1>
            <p style={mySubCopy}>관심 분야와 투자 성향에 맞는 맞춤형 뉴스레터를 구독하고 더 스마트한 투자자가 되어보세요!</p>
            <div style={myCardsWrap}>
              <div style={myFeatureCard}>
                <div style={myFeatureInnerRow}>
                  <div style={myIconBox}>
                    <img src={targetIcon} alt="타겟 아이콘" style={{ width: 48, height: 48 }} />
                  </div>
                  <div style={myFeatureTextCol}>
                    <div style={myFeatureTitle}>맞춤형 콘텐츠</div>
                    <div style={myFeatureDesc} title="나에게 필요한 정보만 받을 수 있어요.">나에게 필요한 정보만 받을 수 있어요.</div>
                  </div>
                </div>
              </div>
              <div style={myFeatureCard}>
                <div style={myFeatureInnerRow}>
                  <div style={myIconBox}>
                    <img src={financeIcon} alt="금융 아이콘" style={{ width: 48, height: 48 }} />
                  </div>
                  <div style={myFeatureTextCol}>
                    <div style={myFeatureTitle}>무제한 퀴즈</div>
                    <div style={myFeatureDesc} title="재미있게 경제 공부를 핀사이트에서 시작하세요.">재미있게 경제 공부를 핀사이트에서 시작하세요.</div>
                  </div>
                </div>
              </div>
              <div style={myFeatureCard}>
                <div style={myFeatureInnerRow}>
                  <div style={myIconBox}>
                    <img src={bellIcon} alt="벨 아이콘" style={{ width: 48, height: 48 }} />
                  </div>
                  <div style={myFeatureTextCol}>
                    <div style={myFeatureTitle}>카카오톡 알림</div>
                    <div style={myFeatureDesc} title="실시간 맞춤 알림 서비스 제공해요.">실시간 맞춤 알림 서비스 제공해요.</div>
                  </div>
                </div>
              </div>
            </div>
            <button style={myCTAButton} onClick={() => navigate('/newsletter/subscribe')}>구독하기</button>
          </div>
        </>}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div style={topBar}>
      <Logo />
      <div style={searchIcon} />
    </div>
  );
}

function Tabs({ active, onChange }) {
  return (
    <div style={tabsWrap}>
      {TABS.map(tab => (
        <div key={tab} style={tabCol} onClick={() => onChange(tab)}>
          <div style={tabLabel(tab===active)}>{tab}</div>
          <div style={underline(tab===active)} />
        </div>
      ))}
    </div>
  );
}

function CategoryRow({ categories, selected, onSelect }) {
  return (
    <div style={categoryRow}>      
      {categories.map(cat => (
        <button key={cat} onClick={() => onSelect(cat)} style={cat === selected ? catBtnActive : catBtn}>{cat}</button>
      ))}
    </div>
  );
}

function Banner() {
  const navigate = useNavigate();
  return (
    <div style={bannerBox} onClick={() => navigate('/newsletter/subscribe')}>
      <div style={bannerInner}>
        <div style={bannerImg} />
        <div style={bannerTextCol}>
          <div style={bannerTitle}>My news 로 맞춤 뉴스 보자!</div>
          <div style={bannerSub}>핀래터에서 나의 관심사에 딱 맞는 정보들만 확인해요</div>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ data, onClick }) {
  const [step, setStep] = useState(0);
  const base = (data && (data.image || data.id)) || null;
  const exts = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
  const candidates = base ? exts.flatMap(ext => [
    `/assets/newsletters/cards/${base}${ext}`,
    `/assets/newsletters/${base}${ext}`,
  ]) : [];
  const src = candidates[step] || null;
  return (
    <div style={imgCard} onClick={onClick}>
      {src && (
        <img
          src={src}
          alt=""
          onError={() => setStep(s => s + 1)}
          style={{ display:'block', width:'100%', height:'auto' }}
        />
      )}
    </div>
  );
}

const pageOuter = { width: '100%', display: 'flex', justifyContent: 'center', background: '#F4F6FA', minHeight: '100vh', paddingBottom: 120 };
const canvas = { position: 'relative', width: CANVAS_W, maxWidth: '100%', background: '#F4F6FA', minHeight: 917, fontFamily: 'Roboto, sans-serif' };
const topBar = { position: 'absolute', top: 64, left: 16, width: CONTENT_W, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 };
const logoImg = { width:120, height:'auto', objectFit:'contain' };
const searchIcon = { width:24, height:24, borderRadius:4, border:'1px solid #474747', background:'#fff', position:'relative' };
const tabsWrap = { position:'absolute', top:108, left:16, width:CONTENT_W, height:38, display:'flex', gap:16, zIndex: 10 };
const tabCol = { flex:1, display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer' };
const tabLabel = active => ({ fontSize:20, fontWeight: active?700:400, color: active?'#1B1B1B':'#9B9B9B', lineHeight:'34px', letterSpacing:'-0.04em' });
const underline = active => ({ width:'100%', height:2, background: active?'#1B1B1B':'transparent' });
const bannerBox = { position:'absolute', top:162, left:16, width:CONTENT_W, height:80, background:'#B8D4FF', borderRadius:8, padding:'10px 16px', display:'flex', alignItems:'center' };
const bannerInner = { display:'flex', flexDirection:'row', alignItems:'center', gap:20 };
const bannerImg = { width:60, height:60, background:'#D9D9D9', borderRadius:8 };
const bannerTextCol = { display:'flex', flexDirection:'column', gap:8 };
const bannerTitle = { fontSize:18, fontWeight:700, color:'#10274A', letterSpacing:'-0.02em', lineHeight:'21px' };
const bannerSub = { fontSize:12, fontWeight:400, color:'#122C54', letterSpacing:'-0.02em', lineHeight:'14px', maxWidth:255 };
const countText = { position:'absolute', top:258, left:16, fontSize:14, fontWeight:500, color:'#616161', letterSpacing:'-0.04em' };
const resetWrap = { position:'absolute', top:64, right:16, transform:'translateY(32px)', display:'flex', justifyContent:'flex-end', width:140 };
const resetBtn = { background:'none', border:'1px solid #CBD5E1', borderRadius:20, padding:'4px 10px', fontSize:11, cursor:'pointer', color:'#475569' };
const cardsColumn = { position:'absolute', top:290, left:32, width:348, display:'flex', flexDirection:'column', gap:16 };
// 주제별 전용 레이아웃
const categoryRow = { position:'absolute', top:162, left:0, width:CANVAS_W, display:'flex', flexWrap:'nowrap', padding:'16px', gap:8, overflowX:'auto' };
const catBtnBase = { height:32, padding:'0 10px', borderRadius:30, fontSize:14, letterSpacing:'-0.03em', cursor:'pointer', border:'1px solid #DFE5EE', background:'#EEF2F6', color:'#626262', fontFamily:'Roboto, sans-serif', fontWeight:400, flex:'0 0 auto', display:'flex', alignItems:'center' };
const catBtnActive = { ...catBtnBase, background:'linear-gradient(104.45deg,#448FFF -6.51%,#4833D0 105.13%)', color:'#F9F9F9', fontWeight:700, border:'none', textShadow:'0 0 2px rgba(0,0,0,0.25)' };
const catBtn = catBtnBase;
const topicBannerWrap = { position:'absolute', top:224, left:16, width:CONTENT_W };
const topicCountWrap = { position:'absolute', top:320, left:16, fontSize:14, fontWeight:500, color:'#616161', letterSpacing:'-0.04em' };
const topicCardsColumn = { position:'absolute', top:352, left:32, width:348, display:'flex', flexDirection:'column', gap:16, paddingBottom:40 };
// My news 전용 스타일 (Subscribe 화면과 동일한 absolute positioning 사용)
const myHeroArea = { position: 'relative', width: CANVAS_W, height: 917, zIndex: 1 };
const myHeroImage = { position: 'absolute', width: 120, height: 120, left: 'calc(50% - 60px)', top: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const myHeadline = { position: 'absolute', width: 244, height: 24, left: 'calc(50% - 122px)', top: 432, textAlign: 'center', fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 20, lineHeight: '24px', letterSpacing: '-0.02em', color: '#000000', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const mySubCopy = { position: 'absolute', width: 256, height: 44, left: 'calc(50% - 128px)', top: 476, textAlign: 'center', fontFamily: 'Roboto, sans-serif', fontWeight: 400, fontSize: 14, lineHeight: '22px', letterSpacing: '-0.02em', color: '#4D4D4D', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const myCardsWrap = { position: 'absolute', width: 380, height: 272, left: 16, top: 589, display: 'flex', flexDirection: 'column', gap: 16 };
const myFeatureCard = { boxSizing:'border-box', background:'linear-gradient(#FFFFFF,#FFFFFF) padding-box, linear-gradient(90deg,#448FFF 0%,#4833D0 100%) border-box', border:'1px solid transparent', borderRadius:16, padding:'11px 16px', width:380, height:72, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'flex-start', gap:10, boxShadow:'0 4px 10px -2px rgba(56,111,255,0.12)' };
const myFeatureInnerRow = { display:'flex', flexDirection:'row', alignItems:'center', gap:16, width:'100%', height:48 };
const myFeatureInnerRowWide = { display:'flex', flexDirection:'row', alignItems:'center', gap:16, width:'100%', height:48 };
const myIconBox = { width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center' };
const myFeatureTextCol = { display:'flex', flexDirection:'column', gap:4, width:300, height:48 };
const myFeatureTextColWide = { display:'flex', flexDirection:'column', gap:4, width:300, height:48 };
const myFeatureTitle = { width:'100%', height:22, fontFamily:'Roboto, sans-serif', fontWeight:700, fontSize:14, lineHeight:'22px', letterSpacing:'-0.02em', color:'#000', display:'flex', alignItems:'center' };
const myFeatureDesc = { width:'100%', height:22, fontFamily:'Roboto, sans-serif', fontWeight:400, fontSize:14, lineHeight:'22px', letterSpacing:'-0.02em', color:'#474747', display:'flex', alignItems:'center', wordBreak:'keep-all', overflowWrap:'break-word' };
const myCTAButton = { position:'absolute', left:'50%', transform:'translateX(-50%)', top: 881, width:380, maxWidth:'90%', height:60, background:'linear-gradient(91.43deg,#448FFF 0%,#4833D0 100%)', borderRadius:8, border:'none', color:'#FFFFFF', fontFamily:'Roboto, sans-serif', fontWeight:700, fontSize:18, cursor:'pointer', letterSpacing:'-0.02em' };

const topicDivider = { position:'absolute', top:144, left:0, width:CANVAS_W, height:2, background:'#E6EBF2' };
const topicFlow = { position:'absolute', top:146, left:0, width:CANVAS_W, height:768, display:'flex', flexDirection:'column' };
const topicSectionHeader = { width:CANVAS_W, display:'flex', flexDirection:'column', alignItems:'flex-start' };
const topicCategoryRow = { width:CANVAS_W, height:64, display:'flex', flexDirection:'row', alignItems:'flex-start', padding:16, gap:8, boxSizing:'border-box', overflowX:'auto' };
const topicBannerBox = { width:CANVAS_W, height:96, display:'flex', flexDirection:'column', padding:'0 16px 16px', boxSizing:'border-box' };
const topicBannerInner = { width:380, height:80, background:'#B8D4FF', borderRadius:8, padding:10, display:'flex', flexDirection:'row', alignItems:'center', gap:20 };
const topicBannerTextCol = { display:'flex', flexDirection:'column', gap:8, width:174 };
const topicBannerTitle = { fontSize:18, fontWeight:700, color:'#10274A', letterSpacing:'-0.02em', lineHeight:'21px' };
const topicBannerSub = { fontSize:12, fontWeight:400, color:'#122C54', letterSpacing:'-0.02em', lineHeight:'14px', width:255 };
const topicCountRow = { width:CANVAS_W, height:32, padding:'0 16px 16px', display:'flex', alignItems:'center', boxSizing:'border-box' };
const topicCountText = { fontSize:14, fontWeight:500, color:'#616161', letterSpacing:'-0.04em' };
const topicCardsWrap = { width:CANVAS_W, height:576, display:'flex', flexDirection:'row', justifyContent:'center', padding:'0 32px', boxSizing:'border-box' };
const topicCardsCol = { width:348, display:'flex', flexDirection:'column', gap:16 };
const articleCard = { width:348, height:280, background:'#FFFFFF', boxShadow:'0 0 8px rgba(10,26,51,0.18)', borderRadius:16, display:'flex', flexDirection:'column', padding:'0 0 14px' };
const imgCard = { width:348, background:'#FFFFFF', boxShadow:'0 0 8px rgba(10,26,51,0.18)', borderRadius:16, overflow:'hidden', cursor:'pointer' };
const chipRow = { display:'flex', flexDirection:'column', gap:10 };
const chip = { display:'inline-flex', padding:'4px 8px', background:'#DCEAFF', borderRadius:30, fontSize:12, color:'#234E8F', letterSpacing:'-0.02em', fontWeight:400 };
const title = { fontSize:18, fontWeight:700, color:'#000', lineHeight:'22px', letterSpacing:'-0.02em' };
const summary = { fontSize:12, fontWeight:400, color:'#474747', lineHeight:'14px', letterSpacing:'-0.02em', height:28, overflow:'hidden' };
const metaRow = { display:'flex', flexDirection:'row', alignItems:'center', gap:4 };
const metaGroup = { display:'flex', flexDirection:'row', alignItems:'center', gap:4 };
const calendarIcon = { width:16, height:16, background:'#9B9B9B', borderRadius:4, position:'relative' };
const timeIcon = { width:16, height:16, background:'#9B9B9B', borderRadius:4 };
const metaText = { fontSize:10, fontWeight:500, color:'#9B9B9B', lineHeight:'20px' };
const emptyState = { width:348, padding:40, textAlign:'center', color:'#64748B', background:'#fff', borderRadius:16 };
