import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import NewsCard from '../components/news/NewsCard';
import { searchArticles } from '../api/news';
import './Search.css';
import Magnifier from '../assets/newspng/Magnifier.svg';

// 최근검색어 관리 유틸
const RECENT_KEY = 'recent_search_keywords';
function getRecentSearches() {
  try {
    const arr = JSON.parse(localStorage.getItem(RECENT_KEY));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function addRecentSearch(keyword) {
  if (!keyword) return;
  let arr = getRecentSearches();
  arr = arr.filter(k => k !== keyword); // 중복 제거
  arr.unshift(keyword); // 최신이 앞으로
  if (arr.length > 10) arr = arr.slice(0, 10); // 최대 10개
  localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
}

export default function SearchResults() {
  const { query } = useParams();
  const q = query ? decodeURIComponent(query) : '';
  const navigate = useNavigate();
  const [text, setText] = useState(q || '');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState(getRecentSearches());

  useEffect(() => {
    let active = true;
    async function run() {
      try {
        setLoading(true);
        setError(null);
  const data = await searchArticles(q, 0, 20);
        if (!active) return;
        setItems(data || []);
      } catch (e) {
        if (!active) return;
        setError(e.message || '검색 실패');
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
  // 최근검색어 저장 및 갱신
  if (q) addRecentSearch(q);
    setRecent(getRecentSearches());
    return () => { active = false; };
  }, [q]);

  useEffect(() => {
    // keep local text in sync when route param changes
    setText(q || '');
  }, [q]);

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
            onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/search/${encodeURIComponent(text)}`); }}
            placeholder="관심 있는 주제나 키워드를 검색하세요"
          />
          <button type="button" className="search-submit-btn" aria-label="검색" onClick={() => navigate(`/search/${encodeURIComponent(text || q)}`)}>
            <img src={Magnifier} alt="" width={24} height={24} />
          </button>
        </div>
      </div>

      <div className="search-content">
        <div style={{ margin: '12px 0 20px 0' }}>
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
                  onClick={() => navigate(`/search/${encodeURIComponent(word)}`)}
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && <p>불러오는 중…</p>}
        {error && !loading && <p style={{ color: 'crimson' }}>오류: {error}</p>}
        {!loading && !error && (
          items.length > 0 ? (
            items.map((news) => (
              <div key={news.id} style={{ marginBottom: '12px' }}>
                <NewsCard
                  title={news.title}
                  description={news.description}
                  image={news.image_url}
                  tags={news.hashtags || []}
                  date={news.published_at ? new Date(news.published_at).toLocaleDateString('ko-KR') : undefined}
                  onClick={() => navigate(`/news/${news.id}`)}
                />
              </div>
            ))
          ) : (
            <p>검색 결과가 없습니다.</p>
          )
        )}
      </div>
    </div>
  );
}