import React, { useEffect, useState } from 'react';
import { fetchCommunityPosts } from '../../api/community';

// Inline SVG icon components (gray icons)
const IconHeart = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.06683 13.8667C7.7335 13.8667 7.3335 13.7333 7.06683 13.4667C2.7335 9.66667 2.66683 9.6 2.66683 9.53333L2.60016 9.46667C1.80016 8.66667 1.3335 7.53333 1.3335 6.4V6.26667C1.40016 3.86667 3.3335 2 5.7335 2C6.46683 2 7.46683 2.4 8.06683 3.2C8.66683 2.4 9.73349 2 10.4668 2C12.8668 2 14.7335 3.86667 14.8668 6.26667V6.4C14.8668 7.6 14.4002 8.66667 13.6002 9.53333L13.5335 9.6C13.4668 9.66667 12.9335 10.1333 9.13349 13.5333C8.80016 13.7333 8.46683 13.8667 8.06683 13.8667ZM3.66683 9.33333C3.9335 9.6 5.26683 10.5333 7.7335 12.6667C7.9335 12.8667 8.20016 12.8667 8.40016 12.6667C10.9335 10.4 12.4002 9.13333 12.7335 8.86667L12.8002 8.8C13.4668 8.13333 13.8002 7.26667 13.8002 6.4V6.26667C13.7335 4.4 12.2668 3 10.4002 3C9.9335 3 9.00016 3.33333 8.66683 4.06667C8.5335 4.33333 8.26683 4.46667 8.00016 4.46667C7.7335 4.46667 7.46683 4.33333 7.3335 4.06667C7.00016 3.4 6.13349 3 5.60016 3C3.80016 3 2.26683 4.46667 2.20016 6.26667V6.46667C2.20016 7.33333 2.60016 8.2 3.20016 8.8L3.66683 9.33333Z" fill="#999999" />
  </svg>
);

const IconCommentBubble = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M5.33345 0.479751C5.78698 0.382256 6.24956 0.333093 6.71345 0.333085C8.56804 0.324016 10.3355 1.11906 11.5592 2.51273C12.7828 3.9064 13.3424 5.76193 13.0935 7.59975C12.6935 10.6664 9.66679 13.1464 6.57345 13.1464H2.13345C1.75603 13.1466 1.40627 12.9485 1.21229 12.6247C1.01831 12.301 1.00863 11.8991 1.18679 11.5664L1.36679 11.2198C1.54593 10.8859 1.53322 10.4817 1.33345 10.1598C0.214588 8.40082 0.0224923 6.20718 0.818617 4.28056C1.61474 2.35394 3.29931 0.935784 5.33345 0.479751ZM6.52012 12.1397C9.23788 12.0969 11.5492 10.1452 12.0468 7.47308C12.2728 5.92447 11.8073 4.35472 10.7735 3.17975C9.74943 2.00793 8.26965 1.33487 6.71345 1.33308C6.31932 1.33384 5.92625 1.37404 5.54012 1.45308C3.82355 1.83502 2.39997 3.02793 1.72361 4.65121C1.04725 6.27448 1.20261 8.12528 2.14012 9.61308C2.53898 10.2397 2.56705 11.0332 2.21345 11.6864L2.03345 12.0264C2.0188 12.0487 2.0188 12.0775 2.03345 12.0997C2.06012 12.1398 2.10012 12.1397 2.10012 12.1397H6.52012Z" fill="#999999" />
  </svg>
);

const IconShare = () => (
  <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M5.96857 8.15348C6.26956 8.15432 6.56461 8.2373 6.82191 8.39348H6.81524C7.59096 8.85616 7.85439 9.85415 7.40808 10.6394C6.96177 11.4247 5.96954 11.709 5.1751 11.2792C4.38066 10.8495 4.0756 9.86343 4.48857 9.06015L2.53524 7.06682C2.39419 7.15269 2.24152 7.2178 2.08191 7.26015C1.949 7.29428 1.81245 7.31218 1.67524 7.31348C0.829425 7.31777 0.114514 6.68782 0.0123276 5.84819C-0.0898587 5.00856 0.453087 4.22553 1.27524 4.02682C1.40615 3.99489 1.5405 3.97921 1.67524 3.98015C2.01929 3.98042 2.35475 4.08758 2.63524 4.28682L4.48857 2.43348C4.21246 1.91757 4.22962 1.29413 4.53369 0.794179C4.83777 0.294232 5.38347 -0.00774307 5.96857 0.000151064C6.26898 -0.00136551 6.56407 0.0793244 6.82191 0.233484C7.3459 0.521679 7.67633 1.06753 7.68874 1.66541C7.70115 2.2633 7.39365 2.82239 6.88208 3.13208C6.3705 3.44177 5.73256 3.45501 5.20857 3.16682L3.24857 5.12682C3.27033 5.17417 3.28817 5.22322 3.30191 5.27348C3.39047 5.63231 3.35523 6.01053 3.20191 6.34682L5.20191 8.34682C5.43872 8.22301 5.70137 8.15678 5.96857 8.15348ZM5.96857 1.00015C5.73454 0.998788 5.51693 1.12024 5.39524 1.32015C5.30434 1.47255 5.27794 1.6549 5.32191 1.82682C5.36039 1.99847 5.46926 2.14604 5.6219 2.23348C5.72414 2.29688 5.84162 2.33144 5.96191 2.33348C6.19728 2.33344 6.41519 2.20928 6.53524 2.00682C6.72412 1.6919 6.62277 1.28354 6.30857 1.09348C6.20651 1.03048 6.0885 0.998082 5.96857 1.00015ZM1.67524 6.31348C1.36144 6.32263 1.08378 6.11161 1.00857 5.80682C0.9666 5.63402 0.995401 5.45161 1.08857 5.30015C1.17951 5.15066 1.32557 5.04291 1.49524 5.00015H1.65524C1.96904 4.99101 2.2467 5.20203 2.32191 5.50682C2.36403 5.67665 2.33769 5.85623 2.24857 6.00682L2.20857 6.05348C2.12013 6.17998 1.99054 6.27188 1.84191 6.31348H1.67524ZM5.96191 10.4535C6.19594 10.4548 6.41354 10.3334 6.53524 10.1335C6.70227 9.82611 6.60331 9.44191 6.30857 9.25348C6.20634 9.19009 6.08885 9.15553 5.96857 9.15348C5.73319 9.15353 5.51528 9.27768 5.39524 9.48015C5.20636 9.79506 5.3077 10.2034 5.6219 10.3935C5.72738 10.4449 5.84519 10.4657 5.96191 10.4535Z" fill="#999999" />
  </svg>
);

function formatKDate(iso) {
  try {
    const d = new Date(iso);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${m}월 ${day}일`;
  } catch { return ''; }
}


const PostCard = ({ post }) => {
  return (
    <li className="c-post-card">
      <div className="c-post-header">
        <div className="avatar"><div className="avatar-icon" /></div>
        <div className="meta">
          <span className="author">{post.author}</span>
          <span className="date">{post.date}</span>
        </div>
      </div>
      {/* Hashtag tags removed as per request (previously rendered #카카오 style category pills) */}
      {post.thumbnail && (
        <div className="thumb-and-text">
          <div className="thumb" />
          <div className="text-block">
            <h3 className="title">{post.title}</h3>
            <p className="body">{post.body}</p>
          </div>
        </div>
      )}
      {!post.thumbnail && (
        <div className="only-text">
          <h3 className="title">{post.title}</h3>
          <p className="body">{post.body}</p>
        </div>
      )}
      <div className="stats-row">
        <div className="stat like"><IconHeart />{post.stats.likes}</div>
        <div className="stat comment"><IconCommentBubble />{post.stats.comments}</div>
        <div className="stat share"><IconShare />{post.stats.shares}</div>
      </div>
    </li>
  );
};

export default function FeedSection({ categoryFilter = '전체', token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const { data } = await fetchCommunityPosts(token);
        const mapped = (Array.isArray(data) ? data : [])
          .map(p => ({
            id: p.id,
            author: p.author?.nickname || '익명',
            date: p.createdAt ? formatKDate(p.createdAt) : '',
            title: p.body?.substring(0, 30) || '', // 간단 타이틀 대체
            body: p.body || '',
            tags: Array.isArray(p.tags) ? p.tags : [],
            thumbnail: false, // 서버 모델에 썸네일 정보 없음 → 기본값
            stats: { likes: p.likeCount ?? 0, comments: p.commentCount ?? 0, shares: 0 },
            category: (Array.isArray(p.tags) && p.tags[0]) || '기타'
          }));
        if (mounted) setPosts(mapped);
      } catch (e) {
        if (mounted) setError(e?.message || '피드 불러오기 실패');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  const filtered = categoryFilter === '전체'
    ? posts
    : posts.filter(p => (p.category === categoryFilter) || p.tags?.includes(categoryFilter));

  return (
    <div className="community-feed">
      {loading && <div className="loading">불러오는 중...</div>}
      {error && <div className="error-text">{error}</div>}
      <ul className="c-post-card-list">
        {filtered.map(p => <PostCard key={p.id} post={p} />)}
      </ul>
    </div>
  );
}
