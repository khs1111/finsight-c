import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';
import Magnifier from '../assets/newspng/Magnifier.svg';
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
  const submit = () => {
    const q = text.trim();
    if (q) navigate(`/search/${encodeURIComponent(q)}`);
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
      <div className="search-topbar">
  <button className="search-back-btn" aria-label="뒤로가기" onClick={() => navigate('/', { replace: true })}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10.9498 19.5201C11.0931 19.6553 11.2828 19.7304 11.4798 19.7301C11.6761 19.7318 11.8643 19.6521 11.9998 19.5101C12.1428 19.3708 12.2234 19.1797 12.2234 18.9801C12.2234 18.7805 12.1428 18.5894 11.9998 18.4501L6.29975 12.75H19.52C19.9342 12.75 20.27 12.4142 20.27 12C20.27 11.5858 19.9342 11.25 19.52 11.25H6.29756L12.0098 5.52006C12.1528 5.38077 12.2334 5.18965 12.2334 4.99006C12.2334 4.79048 12.1528 4.59935 12.0098 4.46006C11.717 4.16761 11.2426 4.16761 10.9498 4.46006L3.94981 11.4601C3.65736 11.7529 3.65736 12.2272 3.94981 12.5201L10.9498 19.5201Z" fill="#282828"/>
          </svg>
        </button>
        <div className="search-input-wrap">
          <input
            className="search-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder="관심 있는 주제나 키워드를 검색하세요"
          />
          <button type="button" className="search-submit-btn" aria-label="검색" onClick={submit}>
            <img src={Magnifier} alt="" width={24} height={24} />
          </button>
        </div>
      </div>
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
            <div className="empty-recent">아직 최근검색어가 없어요!</div>
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
