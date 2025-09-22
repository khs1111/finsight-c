import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsCategoryTabs from '../components/news/NewsCategoryTabs';
import NewsCard from '../components/news/NewsCard';
import { getNewsData } from '../api/news';
import './Home.css';
import Magnifier from '../assets/newspng/Magnifier.svg';

// 카테고리별 뉴스 간단 캐시 (메모리)
// Search에서 돌아올 때 매번 네트워크 호출하지 않도록 즉시 하이드레이션
const NEWS_CACHE_TTL = 3 * 60 * 1000; // 3분
const newsCache = new Map(); // key: category, value: { items, ts, page, hasMore }

export default function Home() {
  const [newsItems, setNewsItems]     = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError]     = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const categories = ['오늘의 뉴스', '금융', '증권', '글로벌 경제', '생활 경제'];
  const [activeCategory, setActiveCategory] = useState('오늘의 뉴스');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const goSearch = () => navigate('/search', { replace: true });

  const fetchNews = async (category, skipCount = 0, limit = 20) => {
    try {
      setNewsLoading(true);
      setNewsError('');
      const response = await getNewsData(category, skipCount, limit);
      
      if (response && Array.isArray(response)) {
        const pageIndex = skipCount / limit;
        const hasMoreNext = response.length === limit;

        if (skipCount === 0) {
          setNewsItems(() => {
            const newItems = response;
            newsCache.set(category, { items: newItems, ts: Date.now(), page: pageIndex, hasMore: hasMoreNext });
            return newItems;
          });
        } else {
          setNewsItems(prev => {
            const newItems = [...prev, ...response];
            newsCache.set(category, { items: newItems, ts: Date.now(), page: pageIndex, hasMore: hasMoreNext });
            return newItems;
          });
        }
        setHasMore(hasMoreNext);
      } else {
        setNewsError('응답 형식이 올바르지 않습니다');
      }
    } catch (error) {
      console.error('뉴스 불러오기 실패:', error);
      setNewsError('뉴스 불러오기에 실패했습니다');
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    const cached = newsCache.get(activeCategory);
    if (cached && Date.now() - cached.ts < NEWS_CACHE_TTL) {
      setNewsItems(cached.items || []);
      setPage(cached.page || 0);
      setHasMore(typeof cached.hasMore === 'boolean' ? cached.hasMore : true);
      setNewsLoading(false);
    } else {
      setPage(0);
      fetchNews(activeCategory, 0);
    }
  }, [activeCategory]);

  return (
    <div className="home-container">
      <div className="home-search-wrapper">
  <div className="home-search" onClick={goSearch}>
          <input
            type="text"
            placeholder="관심 있는 주제나 키워드를 검색하세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '14px',
              color: 'var(--disable_text_Color, #9B9B9B)'
            }}
          />
          <button
            aria-label="검색"
            style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={(e) => { e.stopPropagation(); goSearch(); }}
          >
            <img src={Magnifier} alt="" style={{ width: 24, height: 24 }} />
          </button>
        </div>
      </div>
      <NewsCategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {newsLoading && <p className="loading">뉴스를 불러오는 중…</p>}
      {newsError   && <p className="error">{newsError}</p>}

      <section className="news-list">
        {newsItems.map((item, idx) => (
          <NewsCard
            key={idx}
            title={item.title}
            description={item.description}
            image={item.image_url}
            tags={item.tags || []}
            onClick={() => navigate(`/news/${item.id}`)}
          />
        ))}
        
        {hasMore && !newsLoading && (
          <div className="load-more-container">
            <button 
              className="load-more-button"
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchNews(activeCategory, nextPage * 20);
              }}
            >
              더 보기
            </button>
          </div>
        )}
      </section>
    </div>
  );
}


