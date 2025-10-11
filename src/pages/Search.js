import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';
import SearchTopbar from '../components/search/SearchTopbar';
import useRecentSearches from '../hooks/useRecentSearches';
import { searchArticles } from '../api/news';
import NewsCard from '../components/news/NewsCard';

export default function Search() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;
  const debRef = useRef(null);
  const queryVersionRef = useRef(0);
  const { recent, add } = useRecentSearches();
  const submit = () => {
    const q = text.trim();
    if (q) {
      add(q);
      navigate(`/search/${encodeURIComponent(q)}`);
    }
  };

  // Debounced live search when typing
  useEffect(() => {
    const q = text.trim();
    // reset when text changes
    setItems([]);
    setSkip(0);
    setHasMore(false);
    setError(null);

    // if empty, do not search
    if (!q) {
      if (debRef.current) { clearTimeout(debRef.current); debRef.current = null; }
      setLoading(false);
      return;
    }

    const ver = ++queryVersionRef.current;
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchArticles(q, 0, limit);
        // ignore stale results
        if (queryVersionRef.current !== ver) return;
        setItems(data || []);
        setSkip((data || []).length);
        setHasMore((data || []).length === limit);
      } catch (e) {
        if (queryVersionRef.current !== ver) return;
        setError(e.message || '검색 실패');
      } finally {
        if (queryVersionRef.current === ver) setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debRef.current) { clearTimeout(debRef.current); debRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Infinite scroll when near bottom
  useEffect(() => {
    function onScroll() {
      const q = text.trim();
      if (!q || loading || !hasMore) return;
      const threshold = 200; // px from bottom
      const scrolled = window.innerHeight + window.scrollY;
      const full = document.documentElement.scrollHeight || document.body.offsetHeight;
      if (scrolled >= full - threshold) {
        // load more
        loadMore(q);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, loading, hasMore, skip]);

  async function loadMore(q) {
    if (loading) return;
    setLoading(true);
    const ver = queryVersionRef.current; // same query version
    try {
      const data = await searchArticles(q, skip, limit);
      if (queryVersionRef.current !== ver) return; // query changed, ignore
      const newItems = data || [];
      setItems((prev) => prev.concat(newItems));
      setSkip(skip + newItems.length);
      setHasMore(newItems.length === limit);
    } catch (e) {
      if (queryVersionRef.current !== ver) return;
      setError(e.message || '추가 로딩 실패');
    } finally {
      if (queryVersionRef.current === ver) setLoading(false);
    }
  }

  return (
    <div className="search-page">
      <SearchTopbar value={text} onChange={setText} onSubmit={submit} />
      <div className="search-content">
        {text.trim() ? (
          <div className="live-results">
            {items.map((news) => (
              <div key={news.id} style={{ marginBottom: '12px' }}>
                {/* NewsCard already stops propagation on tags row */}
                <NewsItemCard news={news} onClick={() => navigate(`/news/${news.id}`)} />
              </div>
            ))}
            {loading && <p>불러오는 중…</p>}
            {!loading && items.length === 0 && !error && <p>검색 결과가 없습니다.</p>}
            {error && <p style={{ color: 'crimson' }}>오류: {error}</p>}
          </div>
        ) : (
          <>
            <div className="section-title">최근검색어</div>
            {recent.length === 0 ? (
              <div className="empty-recent">아직 최근검색어가 없어요!</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {recent.map((word, i) => (
                  <button
                    key={word + i}
                    style={{
                      background: '#E7ECF3',
                      border: 0,
                      borderRadius: 16,
                      padding: '4px 12px',
                      fontSize: 13,
                      color: '#333',
                      cursor: 'pointer',
                    }}
                    onClick={() => { setText(word); navigate(`/search/${encodeURIComponent(word)}`); }}
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 작은 어댑터: 서버 응답을 NewsCard 프롭으로 매핑
function NewsItemCard({ news, onClick }) {
  return (
    <NewsCard
      title={news.title}
      description={news.description}
      image={news.image_url}
      tags={news.hashtags || []}
      date={news.published_at ? new Date(news.published_at).toLocaleDateString('ko-KR') : undefined}
      onClick={onClick}
    />
  );
}
