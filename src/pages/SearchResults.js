import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import NewsCard from '../components/news/NewsCard';
import { searchArticles } from '../api/news';
import './Search.css';
import Magnifier from '../assets/newspng/Magnifier.svg';

// 최근검색어 저장 유틸 (표시는 하지 않음)
const RECENT_KEY = 'recent_search_keywords';
function addRecentSearch(keyword) {
  if (!keyword) return;
  let arr;
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY));
    arr = Array.isArray(parsed) ? parsed : [];
  } catch {
    arr = [];
  }
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
  // 최근검색어는 저장만 하고, 검색 결과 화면에서는 표시하지 않음

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
  // 최근검색어는 저장만 (UI 미표시)
  if (q) addRecentSearch(q);
    return () => { active = false; };
  }, [q]);

  useEffect(() => {
    // keep local text in sync when route param changes
    setText(q || '');
  }, [q]);

  return (
    <div className="search-page">
      <div className="search-topbar">
        <button
          className="search-back-btn"
          aria-label="뒤로가기"
          onClick={() => {
            // 뒤로 갈 곳이 있으면 이전 화면으로, 없으면 검색 뎁스로 이동
            if (typeof window !== 'undefined' && window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/search');
            }
          }}
        >
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