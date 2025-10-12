// 뉴스레터 피드 화면 (HOT / 주제별 / My news 탭)
import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_ARTICLES } from './feedData';
import './Feed.css';
import newsIcon from '../../assets/news-icon.png';
import targetIcon from '../../assets/target-icon.png';
import financeIcon from '../../assets/finance-icon.png';
import bellIcon from '../../assets/bell-icon.png';

// widths are now handled via CSS classes

const TABS = ['HOT','주제별','My news'];

export default function Feed() {
  const [activeTab, setActiveTab] = useState('HOT');
  const [topics, setTopics] = useState([]);
  // Keep categories aligned with current data taxonomy
  const categories = ['오늘의 뉴스', '금융', '부동산', '해외 경제', '테크'];
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
    <div className="nl-page-outer">
      <div className="nl-canvas"> 
        <TopBar />
        <Tabs active={activeTab} onChange={setActiveTab} />
  {activeTab === 'HOT' && <>
          <div className="nl-banner-box">
            <div className="nl-banner-inner">
              <div className="nl-banner-img" />
              <div className="nl-banner-text-col">
                <div className="nl-banner-title">이번 주 핫 토픽</div>
                <div className="nl-banner-sub">이번 주 핫한 뉴스 토픽을 모아봤어요. 가장 많이 읽힌 이슈만 엄선했어요.</div>
              </div>
            </div>
          </div>
          <div className="nl-count-text">{filtered.length}개의 소식이 있어요</div>
          <div className="nl-cards-col">
            {filtered.filter(a => ['부동산','테크'].includes(a.category)).slice(0,3).map(a => (
              <ArticleCard key={a.id} data={a} onClick={() => navigate(`/newsletter/${a.id}`)} />
            ))}
          </div>
        </>}
  {activeTab === '주제별' && <>
          <div className="nl-topic-divider" />
          <div className="nl-topic-flow"> 
              <div className="nl-topic-header">
              <div className="nl-topic-cat-row">{categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`nl-topic-cat ${cat === selectedCategory ? 'active' : ''}`}>{cat}</button>
              ))}</div>
              <div className="nl-topic-banner-box"><div className="nl-topic-banner-inner" onClick={() => navigate('/newsletter/subscribe')}> <div className="nl-banner-img" /> <div className="nl-topic-banner-text-col"> <div className="nl-topic-banner-title">My news 로 맞춤 뉴스 보자!</div><div className="nl-topic-banner-sub">핀래터에서 나의 관심사에 딱 맞는 정보들만 확인해요</div></div></div></div>
              <div className="nl-topic-count-row"><span className="nl-topic-count-text">{filtered.length}개의 소식이 있어요</span></div>
            </div>
            <div className="nl-topic-cards-wrap">
              <div className="nl-topic-cards-col">
                {filtered.map(a => (
                  <ArticleCard key={a.id} data={a} onClick={() => navigate(`/newsletter/${a.id}`)} />
                ))}
                {!filtered.length && <div className="nl-empty">해당 카테고리 소식이 아직 없어요.</div>}
              </div>
            </div>
          </div>
        </>}
  {activeTab === 'My news' && <>
          <div className="nl-my-hero">
            <div className="nl-my-img">
              <img src={newsIcon} alt="뉴스 아이콘" style={{ width: '100%', height: '100%' }} />
            </div>
            <h2 className="nl-my-headline">내 관심사에 맞는 뉴스레터</h2>
            <p className="nl-my-subcopy">관심 있는 카테고리와 키워드를 선택하면, 딱 맞는 뉴스만 골라드릴게요</p>
            <div className="nl-my-cards-wrap">
              <div className="nl-my-feature-card">
                <div className="nl-my-feature-row">
                  <div className="nl-my-icon-box">
                    <img src={targetIcon} alt="타겟 아이콘" style={{ width: 48, height: 48 }} />
                  </div>
                  <div className="nl-my-text-col">
                    <div className="nl-my-title">맞춤형 콘텐츠</div>
                    <div className="nl-my-desc">나에게 필요한 정보만 받을 수 있어요.</div>
                  </div>
                </div>
              </div>
              <div className="nl-my-feature-card">
                <div className="nl-my-feature-row">
                  <div className="nl-my-icon-box">
                    <img src={financeIcon} alt="금융 아이콘" style={{ width: 48, height: 48 }} />
                  </div>
                  <div className="nl-my-text-col">
                    <div className="nl-my-title">무제한 퀴즈</div>
                    <div className="nl-my-desc">재미있게 경제 공부를 핀사이트에서 시작하세요.</div>
                  </div>
                </div>
              </div>
              <div className="nl-my-feature-card">
                <div className="nl-my-feature-row">
                  <div className="nl-my-icon-box">
                    <img src={bellIcon} alt="벨 아이콘" style={{ width: 48, height: 48 }} />
                  </div>
                  <div className="nl-my-text-col">
                    <div className="nl-my-title">카카오톡 알림</div>
                    <div className="nl-my-desc">실시간 맞춤 알림 서비스 제공해요.</div>
                  </div>
                </div>
              </div>
            </div>
            <button className="nl-my-cta" onClick={() => navigate('/newsletter/subscribe')}>구독하기</button>
          </div>
        </>}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="nl-top-bar">
      <Logo />
      <div className="nl-search-icon" />
    </div>
  );
}

function Tabs({ active, onChange }) {
  return (
    <div className="nl-tabs">
      {TABS.map(tab => (
        <div key={tab} className="nl-tab-col" onClick={() => onChange(tab)}>
          <div className={`nl-tab-label ${tab === active ? 'active' : ''}`}>{tab}</div>
          <div className={`nl-underline ${tab === active ? 'active' : ''}`} />
        </div>
      ))}
    </div>
  );
}


// Banner inlined in JSX using CSS classes

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
    <div className="nl-img-card" onClick={onClick}>
      {src && (
        <img
          src={src}
          alt=""
          onError={() => setStep(s => s + 1)}
          className="nl-article-img"
        />
      )}
    </div>
  );
}

// Inline style constants removed in favor of CSS classes
