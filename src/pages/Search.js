import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';
import SearchTopbar from '../components/search/SearchTopbar';
import useRecentSearches from '../hooks/useRecentSearches';
import { ReactComponent as AlarmIcon } from '../assets/newspng/Alarm.svg';
import { ReactComponent as CloseIcon } from '../assets/newspng/Close.svg';
import { searchArticles } from '../api/news';
import NewsCard from '../components/news/NewsCard';

export default function Search() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [showRecents, setShowRecents] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;
  const debRef = useRef(null);
  const queryVersionRef = useRef(0);
  const { recent, add, remove, clear } = useRecentSearches();
  const submit = () => {
    const q = text.trim();
    if (q) {
      add(q);
      navigate(`/search/${encodeURIComponent(q)}`);
      setShowRecents(false);
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
      // when cleared, show recents again
      setShowRecents(true);
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
      <SearchTopbar
        value={text}
        onChange={setText}
        onSubmit={submit}
        onBack={() => navigate('/', { replace: true })}
      />
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
          showRecents ? (
            <RecentList
              items={recent}
              onSelect={(term) => { setText(term); navigate(`/search/${encodeURIComponent(term)}`); setShowRecents(false); }}
              onDelete={(term) => remove(term)}
              onClear={() => { clear(); setShowRecents(true); }}
            />
          ) : null
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

// 최근 검색어 리스트 (기초 틀)
function RecentList({ items, onSelect, onDelete, onClear }) {
  return (
    <div>
      <div className="recent-header">
        <div className="title">최근검색어</div>
        {!!items?.length && (
          <button className="clear-btn" onClick={onClear}>
            전체 삭제
          </button>
        )}
      </div>
      {(!items || items.length === 0) ? (
        <div className="empty-recent">아직 최근검색어가 없어요!</div>
      ) : (
        <div className="recent-list">
          {items.map((it) => (
            <div className="recent-row" key={it.term}>
              <div className="left">
                <span className="icon icon-clock" aria-hidden>
                  <AlarmIcon className="svg-icon" />
                </span>
                <button className="term" onClick={() => onSelect(it.term)} title={it.term}>{it.term}</button>
              </div>
              <div className="right">
                <span className="date">{formatDate(it.ts)}</span>
                <button className="del icon-close" aria-label="삭제" onClick={() => onDelete(it.term)}>
                  <CloseIcon className="svg-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${y}.${m}.${day}`;
  } catch {
    return '';
  }
}
