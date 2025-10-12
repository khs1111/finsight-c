import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import './Newsletter.css';

// 아이콘 및 데이터 import
import finletterIcon from '../../assets/newsletter/finletter.svg'
import newsIcon from '../../assets/newsletter/news-icon.png';
import newsData from './NewsletterData';
import newsDate from '../../assets/newsletter/Calendar.svg';

function TopBar() {
  return (
    <div className="nl-topbar">
      <div className="nl-title"> <img src={finletterIcon} alt="핀레터 아이콘" /></div>
    </div>
  );
}

function Tabs() {
  const tabs = [
    { key: 'hot', label: 'HOT', to: '/newsletter/hot' },
    { key: 'topics', label: '주제별', to: '/newsletter/topics' },
    { key: 'my', label: 'My news', to: '/newsletter/my' },
  ];
  return (
    <div className="nl-tabs">
      {tabs.map((t) => (
        <NavLink key={t.key} to={t.to} className={({ isActive }) => `nl-tab ${isActive ? 'active' : ''}`}>
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}

function Banner() {
  const navigate = useNavigate();
  const handleBannerClick = () => {
    navigate('/newsletter/my');
  };

  return (
    <div className="nl-banner" onClick={handleBannerClick}>
      <img src={newsIcon} alt="NEWS" className="nl-banner-news-img" />
      <div className="nl-banner-text">
        <div className="nl-banner-title">My news로 맞춤 뉴스 보자!</div>
        <div className="nl-banner-desc">핀레터에서 나의 관심사에 딱 맞는 정보들만 확인해요</div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, date, readTime, category, tags, imageUrl, url }) { // url prop 추가
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="nl-card-link">
      <article className="nl-card">
        {imageUrl && (
          <div className="nl-card-image" style={{ backgroundImage: `url(${imageUrl})` }} aria-hidden="true" />
        )}
        <div className="nl-card-content">
          {tags && (
            <div className="nl-card-tags">
              {tags.map((tag, index) => (
                <span key={index} className="nl-badge">{tag}</span>
              ))}
            </div>
          )}
          {category && <span className="nl-badge">{category}</span>}
          <h3 className="nl-card-title">{title}</h3>
          {subtitle && <p className="nl-card-sub">{subtitle}</p>}
          <div className="nl-card-meta">
            <span> <img src={newsDate} alt="날짜 아이콘" /> {date}</span>
            {readTime && <span>🕔 {readTime}</span>}
          </div>
        </div>
      </article>
    </a>
  );
}

function CategoryFilters({ activeCategory, onSelectCategory }) {
  const categories = ['전체', '국내 경제', '해외 경제', '테크', '미국 증시', '부동산'];
  return (
    <div className="nl-category-filters">
      {categories.map((category, index) => (
        <button
          key={`${category}-${index}`}
          className={`nl-category-btn ${activeCategory === category ? 'active' : ''}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

function HotList() {
  const items = newsData.filter(item => item.id !== 4); // My news 전용 데이터 제외
  return (
    <div className="nl-section">
      <Banner />
      <div className="nl-list-meta">{items.length}개의 소식이 있어요</div>
      {items.map((item) => (
        <Card key={item.id} {...item} />
      ))}
    </div>
  );
}

function Topics() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  
  // My news 전용 데이터를 먼저 제외합니다.
  const topicNews = newsData.filter(item => item.id !== 4);

  const filteredNews = topicNews.filter(item => {
    if (selectedCategory === '전체') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="nl-section">
      <CategoryFilters activeCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      <Banner />
      <div className="nl-list-meta">
        {filteredNews.length > 0 ? `${filteredNews.length}개의 소식이 있어요` : '소식이 없어요'}
      </div>
      {filteredNews.map((item) => (<Card key={item.id} {...item} />))}
    </div>
  );
}

function MyNews() {
  const myNewsItems = newsData.filter(item => item.id === 4);
  return (
    <div className="nl-section">
      {myNewsItems.length > 0 ? (
        <>
          <div className="nl-list-meta">{myNewsItems.length}개의 소식이 있어요</div>
          {myNewsItems.map((item) => (
            <Card key={item.id} {...item} />
          ))}
        </>
      ) : (
        <div className="nl-empty">My news가 없습니다.</div>
      )}
    </div>
  );
}

export default function NewsletterRoot() {
  return (
    <div className="nl-container">
      <TopBar />
      <Tabs />
      <Routes>
        <Route path="hot" element={<HotList />} />
        <Route path="topics" element={<Topics />} />
        <Route path="my" element={<MyNews />} />
        <Route index element={<Navigate to="/newsletter/hot" replace />} />
        <Route path="*" element={<Navigate to="/newsletter/hot" replace />} />
      </Routes>
    </div>
  );
}