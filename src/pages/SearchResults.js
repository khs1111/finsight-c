import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import NewsCard from '../components/news/NewsCard';
import { searchArticles } from '../api/news';

export default function SearchResults() {
  const { query } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const data = await searchArticles(query, 0, 20);
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
    return () => { active = false; };
  }, [query]);

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>🔎 ‘{query}’ 검색 결과</h2>

      {loading && <p>불러오는 중…</p>}
      {error && !loading && <p style={{ color: 'crimson' }}>오류: {error}</p>}
      {!loading && !error && (
        items.length > 0 ? (
          items.map((news) => (
            <NewsCard
              key={news.id}
              title={news.title}
              description={news.description}
              image={news.image_url}
              tags={news.hashtags || []}
              date={news.published_at ? new Date(news.published_at).toLocaleDateString('ko-KR') : undefined}
              onClick={() => navigate(`/news/${news.id}`)}
            />
          ))
        ) : (
          <p>검색 결과가 없습니다.</p>
        )
      )}
    </div>
  );
}