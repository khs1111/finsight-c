import { useParams } from 'react-router-dom';
import NewsCard from '../components/news/NewsCard';
import { useNavigate } from 'react-router-dom';

export default function SearchResults() {
  const { query } = useParams();
  const navigate = useNavigate();

  const dummyNews = [
    {
      id: 1,
      title: '삼성전자, 2분기 실적 발표',
      description: '삼성전자가 올해 2분기 호실적을 기록했다는 소식입니다.',
      date: '2025.07.13',
    },
    {
      id: 2,
      title: '미국 증시 급락',
      description: '나스닥 지수가 급락하며 글로벌 시장에 충격을 주고 있습니다.',
      date: '2025.07.12',
    },
    {
      id: 3,
      title: '한국은행 금리 동결 발표',
      description: '기준금리를 동결한 한국은행의 발표에 대한 기사입니다.',
      date: '2025.07.11',
    },
  ];

  const filteredNews = dummyNews.filter(
    (news) =>
      news.title.includes(query) || news.description.includes(query)
  );

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>🔎 ‘{query}’ 검색 결과</h2>

      {filteredNews.length > 0 ? (
        filteredNews.map((news) => (
          <NewsCard
            key={news.id}
            title={news.title}
            description={news.description}
            date={news.date}
            onClick={() => navigate(`/news/${news.id}`)}
          />
        ))
      ) : (
        <p>검색 결과가 없습니다.</p>
      )}
    </div>
  );
}
