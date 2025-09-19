// 뉴스 상세 페이지
// - 선택된 뉴스 아이템 제목/내용 표시
// - 향후: 공유 / 북마크 / 관련 기사 확장 포인트
import React from 'react';
import { useParams } from 'react-router-dom';

const dummyNews = [
  {
    id: '1',
    emoji: '📈',
    title: '코스피 2600선 회복',
    content: '오늘 코스피가 2600선을 회복하며 투자자 심리가 개선되고 있습니다.',
  },
  {
    id: '2',
    emoji: '💸',
    title: '환율 하락, 원달러 1350원대 진입',
    content: '미국 금리 인하 기대감에 따라 환율이 최근 하락세를 보이고 있습니다.',
  },
];

// NewsDetail: 뉴스 상세 컴포넌트
function NewsDetail() {
  const { id } = useParams();
  const news = dummyNews.find((item) => item.id === id);

  if (!news) return <p>뉴스 정보를 찾을 수 없습니다.</p>;

  return (
    <div style={{ padding: '24px' }}>
      <h1>{news.emoji} {news.title}</h1>
      <p style={{ marginTop: '12px', fontSize: '18px' }}>{news.content}</p>
    </div>
  );
}

export default NewsDetail;
