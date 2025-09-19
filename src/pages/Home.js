// 홈 
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NewsCategoryTabs from '../components/news/NewsCategoryTabs';
import BackendTest from '../components/dev/BackendTest';
import './Home.css';


export default function Home() {
  const [newsItems, setNewsItems]     = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError]     = useState('');

  const categories = ['오늘의 뉴스', '금융', '증권', '글로벌 경제', '생활 경제'];
  const [activeCategory, setActiveCategory] = useState('오늘의 뉴스');
  const navigate = useNavigate();

  useEffect(() => {
    setNewsLoading(true);
    setNewsError('');
    axios
      .get('http://localhost:4000/api/news', {
        params: { category: activeCategory }
      })
      .then(res => setNewsItems(res.data.items))
      .catch(() => setNewsError('뉴스 불러오기 실패'))
      .finally(() => setNewsLoading(false));
  }, [activeCategory]);

  return (
    <div className="home-container">
      <h1 className="section-title">{activeCategory}</h1>

      <NewsCategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {newsLoading && <p className="loading">뉴스를 불러오는 중…</p>}
      {newsError   && <p className="error">{newsError}</p>}

      <section className="news-list">
        {newsItems.map((item, idx) => (
          <div
            key={idx}
            className="news-card"
            onClick={() => window.open(item.link, '_blank')}
            style={{ cursor: 'pointer' }}
          >
            <div className="content">
              <h2 className="news-title">{item.title}</h2>
              <p>{item.description}</p>
              <small>{new Date(item.pubDate).toLocaleString()}</small>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}


