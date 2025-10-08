// 커뮤니티 피드 페이지
// - 게시물 피드 / 랭크 필터 / 글쓰기 진입 FAB
// - 카테고리(오늘의 뉴스, 시황 등) 상태 관리
import React, { useState, useEffect } from 'react';
import './StudyPage.css';
import './CommunityPage.css';
import RankFilterDropdown from '../components/community/RankFilterDropdown';
import { fetchCommunityPosts, likeCommunityPost, unlikeCommunityPost } from '../api/community';
import { useNavigate } from 'react-router-dom';

// 카테고리 목록 (디자인 스펙 기반)
// '오늘의 뉴스'는 전체(ALL) 개념으로 처리
const CATEGORIES = ['자유게시판', '탐험지', '경제 시사', '투자'];
// 백엔드가 코드값을 기대할 수 있으므로 라벨→코드 매핑을 준비 (알 수 없으면 라벨 그대로 사용)
const CATEGORY_CODE = {
  '자유게시판': 'FREE',
  '탐험지': 'EXPLORE',
  '경제 시사': 'ECONOMY',
  '투자': 'INVEST',
};
const RANK_CODE = {
  '마스터': 'MASTER',
  '다이아': 'DIAMOND',
  '플레티넘': 'PLATINUM',
  '골드': 'GOLD',
  '실버': 'SILVER',
  '브론즈': 'BRONZE',
};

// CommunityPage: 커뮤니티 메인 피드 컴포넌트
export default function CommunityPage() {
  // 선택된 카테고리/랭크 상태
  const [showRank, setShowRank] = useState(false);
  const [rank, setRank] = useState(null); // 마스터, 다이아 등
  const [category, setCategory] = useState('자유게시판'); // 기본 탭: 자유게시판
  const [posts, setPosts] = useState([]);
  const [likedMap, setLikedMap] = useState(() => new Map()); // postId -> boolean
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 커뮤니티 글 목록 불러오기 (카테고리/티어별)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
  try {
  const token = localStorage.getItem('accessToken');
  // category가 비어있으면 전체 조회로 간주
  const apiCategory = category || undefined;
  const apiCategoryCode = apiCategory ? (CATEGORY_CODE[apiCategory] || apiCategory) : undefined;
  const apiTierCode = rank ? (RANK_CODE[rank] || rank) : undefined;
    const { data } = await fetchCommunityPosts({ category: apiCategoryCode, tier: apiTierCode }, token);
        if (!mounted) return;
        // 서버 응답 배열 가정: [{ id, author:{nickname,profileImage,tier}, body, tags, likeCount, commentCount, createdAt }]
        setPosts(Array.isArray(data) ? data : []);
        // 초기 likedMap 동기화 (서버에 liked 여부가 있다면 반영)
        if (Array.isArray(data)) {
          setLikedMap(prev => {
            const next = new Map(prev);
            data.forEach(p => {
              if (typeof p.liked === 'boolean') next.set(p.id, p.liked);
            });
            return next;
          });
        }
      } catch (e) {
        if (mounted) setError('글 목록을 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [category, rank]);

  const formatKDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  // 티어 텍스트는 오버레이 별 배지의 title/aria-label로만 사용합니다.

  // 백엔드 필드 보강: author.tierName / author.rank / author.levelName 등 다양한 키 대응
  const resolveTierText = (author = {}) => {
    const raw = author.tier ?? author.tierName ?? author.rank ?? author.levelName ?? author.grade;
    if (!raw) return null;
    // 한국어 매핑도 허용
    const s = String(raw);
    if (/마스터/i.test(s)) return 'Master';
    if (/다이아|diamond|dia/i.test(s)) return 'Diamond';
    if (/골드|gold/i.test(s)) return 'Gold';
    if (/실버|silver/i.test(s)) return 'Silver';
    if (/브론즈|bronze/i.test(s)) return 'Bronze';
    return s; // 알 수 없는 텍스트는 그대로 표시
  };

  const toggleLike = async (post) => {
    const wasLiked = !!likedMap.get(post.id);
    const nextLiked = !wasLiked;
    // 낙관적 업데이트: likeCount 조정 + liked 상태 토글
    setLikedMap(prev => new Map(prev).set(post.id, nextLiked));
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, likeCount: (p.likeCount ?? 0) + (nextLiked ? 1 : -1) }
      : p));
    try {
      const token = localStorage.getItem('accessToken');
      if (nextLiked) {
        await likeCommunityPost(post.id, token);
      } else {
        await unlikeCommunityPost(post.id, token);
      }
    } catch (_) {
      // 실패 시 롤백
      setLikedMap(prev => new Map(prev).set(post.id, wasLiked));
      setPosts(prev => prev.map(p => p.id === post.id
        ? { ...p, likeCount: (p.likeCount ?? 0) + (wasLiked ? 1 : -1) }
        : p));
    }
  };

  return (
    <div className="community-container has-bottom-nav">
      {/* Frame 86 - 커뮤니티 헤더 (타이틀 + 필터링 + 글쓰기) */}
      <div className="community-header">
        <h1 className="community-title">커뮤니티</h1>
        <div className="header-actions">
          <button
            type="button" 
            className="header-action-btn"
            aria-label="필터링"
            onClick={() => setShowRank(v => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M4.96134 2.00065H19.1413V2.01065C20.3363 1.98986 21.4217 2.70428 21.875 3.81009C22.3284 4.9159 22.057 6.1866 21.1913 7.01065L16.4213 11.7807C15.8904 12.3125 15.5858 13.0292 15.5713 13.7807V18.1807C15.5698 19.0931 15.1403 19.9519 14.4113 20.5007L13.1713 21.4307C12.2944 22.0979 11.1144 22.2085 10.1288 21.7157C9.14325 21.2229 8.52367 20.2125 8.53134 19.1107V13.7807C8.51691 13.0292 8.21231 12.3125 7.68134 11.7807L2.91134 7.01065C2.0381 6.18783 1.76172 4.91222 2.2161 3.80176C2.67049 2.6913 3.76178 1.97531 4.96134 2.00065ZM20.4413 4.37065C20.2255 3.84303 19.7114 3.49894 19.1413 3.50065H4.96134C4.3913 3.49894 3.87714 3.84303 3.66134 4.37065C3.43857 4.89571 3.56176 5.50372 3.97134 5.90065L8.76134 10.6707C9.59042 11.4928 10.0551 12.6131 10.0513 13.7807V19.1107C10.046 19.4793 10.1873 19.835 10.4443 20.0994C10.7012 20.3639 11.0527 20.5154 11.4213 20.5207C11.7226 20.5193 12.0148 20.4172 12.2513 20.2307L13.4913 19.3007C13.8439 19.0363 14.0513 18.6213 14.0513 18.1807V13.7807C14.0529 12.6102 14.5249 11.4895 15.3613 10.6707L20.1313 5.90065C20.5409 5.50372 20.6641 4.89571 20.4413 4.37065Z" fill="#474747" />
            </svg>
          </button>
          <button
            type="button"
            className="header-action-btn"
            aria-label="글쓰기"
            onClick={() => navigate('/community/write')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M7.79007 15.2699L8.52007 11.8599C8.62635 11.3861 8.86574 10.9524 9.21007 10.6099L15.8801 3.99993C16.5565 3.3109 17.4748 2.91271 18.4401 2.88993C19.1681 2.8795 19.8701 3.1603 20.3901 3.66993C21.5263 5.01239 21.3796 7.01715 20.0601 8.17993L13.3901 14.8499C13.0476 15.1943 12.6139 15.4337 12.1401 15.5399L8.73007 16.2699H8.54007C8.29078 16.2795 8.05268 16.1661 7.903 15.9665C7.75332 15.7669 7.71111 15.5066 7.79007 15.2699ZM10.2701 11.6799C10.13 11.8157 10.0326 11.9895 9.99007 12.1799L9.50007 14.5099L11.8301 14.0099C12.0205 13.9674 12.1943 13.87 12.3301 13.7299L19.0001 7.05993C19.7308 6.47495 19.8758 5.42041 19.3301 4.65993C19.0911 4.43164 18.7704 4.3091 18.4401 4.31993C17.8706 4.34279 17.3326 4.58673 16.9401 4.99993L10.2701 11.6799Z" fill="#474747"/>
              <path d="M19.9101 10.9299C19.4981 10.9353 19.1655 11.268 19.1601 11.6799V17.3699C19.1735 18.1742 18.8633 18.9502 18.2993 19.5236C17.7352 20.0971 16.9645 20.42 16.1601 20.4199H6.63008C4.96745 20.3873 3.63519 19.0329 3.63008 17.3699V7.87993C3.65738 6.21502 5.01494 4.87971 6.68008 4.87993H12.3701C12.7843 4.87993 13.1201 4.54414 13.1201 4.12993C13.1201 3.71572 12.7843 3.37993 12.3701 3.37993H6.63008C4.13658 3.37978 2.10748 5.38658 2.08008 7.87993V17.3699C2.08008 19.8828 4.11718 21.9199 6.63008 21.9199H16.1201C18.6291 21.9144 20.6601 19.8789 20.6601 17.3699V11.6799C20.6547 11.268 20.322 10.9353 19.9101 10.9299Z" fill="#474747"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* 카테고리 칩 바: CSS 규격 적용 (헤더 하단 16px, 가로 100%) */}
      <div className="community-category-row">
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              type="button"
              className={active ? 'cat-chip active' : 'cat-chip'}
              aria-pressed={active}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          );
        })}
      </div>
      
      <div className="community-content">
        {loading && <div className="community-loading">글 목록을 불러오는 중...</div>}
        {error && <div className="community-error">{error}</div>}
        {!loading && !error && posts.length === 0 && (
          <div className="community-empty">글이 없습니다.</div>
        )}
        {!loading && !error && posts.length > 0 && (
          <div className="community-feed-list">
            {posts.map(post => {
              const liked = !!likedMap.get(post.id);
              const tierText = resolveTierText(post.author || {});
              return (
                <div key={post.id} className="community-feed-card">
                  <div className="feed-card-header">
                    <div className="avatar-wrap">
                      <img src={post.author?.profileImage || require('../assets/community-default-avatar.svg')} alt="프로필" className="feed-card-profile" />
                      {/* 티어 배지: 프로필 오른쪽 아래 오버레이 (작은 골드 스타) */}
                      {tierText && (
                        <span className="avatar-tier-badge is-star" aria-label={`티어 ${tierText}`} title={tierText}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                            <defs>
                              <linearGradient id="tierGoldGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FFCD42"/>
                                <stop offset="35%" stopColor="#FFBC02"/>
                                <stop offset="100%" stopColor="#B94D00"/>
                              </linearGradient>
                              <filter id="tierShadow" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodColor="rgba(0,0,0,0.35)"/>
                              </filter>
                            </defs>
                            <path d="M12 2l2.834 5.744 6.336.92-4.585 4.47 1.082 6.312L12 16.9l-5.667 2.946 1.082-6.312L2.83 8.664l6.336-.92L12 2z" fill="url(#tierGoldGrad)" stroke="#FFFFFF" strokeWidth="1.2" filter="url(#tierShadow)"/>
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="feed-card-author-col">
                      <div className="feed-card-author-row">
                        <span className="feed-card-nickname">{post.author?.nickname || '익명'}</span>
                        {post.author?.badge?.iconUrl && (
                          <img
                            src={post.author.badge.iconUrl}
                            alt={post.author.badge.name || 'badge'}
                            className="feed-card-badge"
                            style={{ width: 16, height: 16, marginLeft: 6 }}
                          />
                        )}
                      </div>
                      <div className="feed-card-date-small">{formatKDate(post.createdAt)}</div>
                    </div>
                    {/* 인라인 티어 라벨 제거: 오버레이 배지로 대체 */}
                  </div>
                  {/* 본문 텍스트 */}
                  <div className="feed-card-content">{post.body}</div>

                  {/* 태그 영역: 문자열 배열 또는 {name} 배열 모두 지원 */}
                  {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="feed-card-tags">
                      {post.tags.map((t, i) => {
                        const label = typeof t === 'string' ? t : (t?.name || t?.label || '');
                        if (!label) return null;
                        return (
                          <span key={`tag-${post.id}-${i}`} className="feed-card-tag">#{label}</span>
                        );
                      })}
                    </div>
                  )}
                  <div className="feed-card-actions">
                    <button type="button" className="action" onClick={() => toggleLike(post)} aria-label={liked ? '좋아요 취소' : '좋아요'}>
                      <span className="icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Red fill behind when liked */}
                          {liked && (
                            <path d="M8.06683 13.8667C7.7335 13.8667 7.3335 13.7333 7.06683 13.4667C2.7335 9.66667 2.66683 9.6 2.66683 9.53333L2.60016 9.46667C1.80016 8.66667 1.3335 7.53333 1.3335 6.4V6.26667C1.40016 3.86667 3.3335 2 5.7335 2C6.46683 2 7.46683 2.4 8.06683 3.2C8.66683 2.4 9.73349 2 10.4668 2C12.8668 2 14.7335 3.86667 14.8668 6.26667V6.4C14.8668 7.6 14.4002 8.66667 13.6002 9.53333L13.5335 9.6C13.4668 9.66667 12.9335 10.1333 9.13349 13.5333C8.80016 13.7333 8.46683 13.8667 8.06683 13.8667ZM3.66683 9.33333C3.9335 9.6 5.26683 10.5333 7.7335 12.6667C7.9335 12.8667 8.20016 12.8667 8.40016 12.6667C10.9335 10.4 12.4002 9.13333 12.7335 8.86667L12.8002 8.8C13.4668 8.13333 13.8002 7.26667 13.8002 6.4V6.26667C13.7335 4.4 12.2668 3 10.4002 3C9.9335 3 9.00016 3.33333 8.66683 4.06667C8.5335 4.33333 8.26683 4.46667 8.00016 4.46667C7.7335 4.46667 7.46683 4.33333 7.3335 4.06667C7.00016 3.4 6.13349 3 5.60016 3C3.80016 3 2.26683 4.46667 2.20016 6.26667V6.46667C2.20016 7.33333 2.60016 8.2 3.20016 8.8L3.66683 9.33333Z" fill="#FF4D4F"/>
                          )}
                          {/* Grey outline on top */}
                          <path d="M8.06683 13.8667C7.7335 13.8667 7.3335 13.7333 7.06683 13.4667C2.7335 9.66667 2.66683 9.6 2.66683 9.53333L2.60016 9.46667C1.80016 8.66667 1.3335 7.53333 1.3335 6.4V6.26667C1.40016 3.86667 3.3335 2 5.7335 2C6.46683 2 7.46683 2.4 8.06683 3.2C8.66683 2.4 9.73349 2 10.4668 2C12.8668 2 14.7335 3.86667 14.8668 6.26667V6.4C14.8668 7.6 14.4002 8.66667 13.6002 9.53333L13.5335 9.6C13.4668 9.66667 12.9335 10.1333 9.13349 13.5333C8.80016 13.7333 8.46683 13.8667 8.06683 13.8667ZM3.66683 9.33333C3.9335 9.6 5.26683 10.5333 7.7335 12.6667C7.9335 12.8667 8.20016 12.8667 8.40016 12.6667C10.9335 10.4 12.4002 9.13333 12.7335 8.86667L12.8002 8.8C13.4668 8.13333 13.8002 7.26667 13.8002 6.4V6.26667C13.7335 4.4 12.2668 3 10.4002 3C9.9335 3 9.00016 3.33333 8.66683 4.06667C8.5335 4.33333 8.26683 4.46667 8.00016 4.46667C7.7335 4.46667 7.46683 4.33333 7.3335 4.06667C7.00016 3.4 6.13349 3 5.60016 3C3.80016 3 2.26683 4.46667 2.20016 6.26667V6.46667C2.20016 7.33333 2.60016 8.2 3.20016 8.8L3.66683 9.33333Z" fill="none" stroke="#999999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="count" aria-live="polite">{post.likeCount ?? 0}</span>
                    </button>
                    <div className="action" aria-label="댓글">
                      <span className="icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M6.33345 1.47975C6.78698 1.38226 7.24956 1.33309 7.71345 1.33308C9.56804 1.32402 11.3355 2.11906 12.5592 3.51273C13.7828 4.9064 14.3424 6.76193 14.0935 8.59975C13.6935 11.6664 10.6668 14.1464 7.57345 14.1464H3.13345C2.75603 14.1466 2.40627 13.9485 2.21229 13.6247C2.01831 13.301 2.00863 12.8991 2.18679 12.5664L2.36679 12.2198C2.54593 11.8859 2.53322 11.4817 2.33345 11.1598C1.21459 9.40082 1.02249 7.20718 1.81862 5.28056C2.61474 3.35394 4.29931 1.93578 6.33345 1.47975ZM7.52012 13.1397C10.2379 13.0969 12.5492 11.1452 13.0468 8.47308C13.2728 6.92447 12.8073 5.35472 11.7735 4.17975C10.7494 3.00793 9.26965 2.33487 7.71345 2.33308C7.31932 2.33384 6.92625 2.37404 6.54012 2.45308C4.82355 2.83502 3.39997 4.02793 2.72361 5.65121C2.04725 7.27448 2.20261 9.12528 3.14012 10.6131C3.53898 11.2397 3.56705 12.0332 3.21345 12.6864L3.03345 13.0264C3.0188 13.0487 3.0188 13.0775 3.03345 13.0997C3.06012 13.1398 3.10012 13.1397 3.10012 13.1397H7.52012Z" fill="#999999" />
                        </svg>
                      </span>
                      <span className="count">{post.commentCount ?? 0}</span>
                    </div>
                  </div>
                  {/* 카드 푸터: 카테고리와 날짜 표시 (디자인 스펙 반영) */}
                  <div className="feed-card-footer">
                    <span className="feed-card-category">{post.categoryName || post.category || category}</span>
                    <span className="feed-card-date">{formatKDate(post.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {showRank && (
        <RankFilterDropdown
          onSelect={(r) => { setRank(r); setShowRank(false); console.log('Selected rank:', r); }}
          selected={rank}
        />
      )}
    </div>
  );
}

// 카테고리 칩 스타일은 CommunityPage.css의 .community-category-row, .cat-chip, .cat-chip.active를 사용합니다.
