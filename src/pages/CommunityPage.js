// 커뮤니티 피드 페이지
// - 게시물 피드 / 랭크 필터 / 글쓰기 진입 FAB
// - 카테고리(오늘의 뉴스, 시황 등) 상태 관리
import React, { useState, useEffect } from 'react';
import './StudyPage.css';
import './CommunityPage.css';
import RankFilterDropdown from '../components/community/RankFilterDropdown';
import { fetchCommunityPosts } from '../api/community';
import { useNavigate } from 'react-router-dom';

// 카테고리 목록 (디자인 스펙 기반) - '오늘의 뉴스' = 전체 개념
const CATEGORIES = ['자유게시판', '탐험지', '경제 시사', '투자'];

// CommunityPage: 커뮤니티 메인 피드 컴포넌트
export default function CommunityPage() {
  // 선택된 카테고리/랭크 상태
  const [category, setCategory] = useState('오늘의 뉴스');
  const [showRank, setShowRank] = useState(false);
  const [rank, setRank] = useState(null); // 마스터, 다이아 등
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 커뮤니티 글 목록 불러오기 (카테고리/티어별)
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchCommunityPosts({ category, tier: rank })
      .then(data => {
        setPosts(data);
      })
      .catch(() => {
        setError('글 목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, rank]);

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
      
      {/* 카테고리 칩 바 (Frame 42) */}
      <div style={chipBarWrapper}>
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={active ? chipActive : chipInactive}
            >
              <span style={active ? chipActiveLabel : chipLabel}>{c}</span>
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
            {posts.map(post => (
              <div key={post.id} className="community-feed-card">
                <div className="feed-card-header">
                  <img
                    src={post.author?.profileImage || '/default-profile.png'}
                    alt="프로필"
                    className="feed-card-profile"
                  />
                  <div className="feed-card-author">
                    <span className="feed-card-nickname">{post.author?.nickname || '익명'}</span>
                    {post.author?.badge && (
                      <img src={post.author.badge.iconUrl} alt={post.author.badge.name} className="feed-card-badge" style={{width:24,height:24,marginLeft:8}} />
                    )}
                  </div>
                </div>
                <div className="feed-card-content">{post.body}</div>
                <div className="feed-card-tags">
                  {post.tags && post.tags.map(tag => <span key={tag} className="feed-card-tag">#{tag}</span>)}
                </div>
                <div className="feed-card-footer">
                  <span className="feed-card-date">{post.createdAt ? post.createdAt.slice(0, 10) : ''}</span>
                  <span className="feed-card-likes">좋아요 {post.likeCount}</span>
                  <span className="feed-card-comments">댓글 {post.commentCount}</span>
                </div>
              </div>
            ))}
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

const chipBarWrapper = {
  position: 'absolute',
  top: 88, 
  left: 0,
  width: 412,
  height: 64,
  padding: 16,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 10,
  boxSizing: 'border-box'
};

const baseChip = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  height: 32,
  borderRadius: 30,
  border: '1px solid #DFE5EE',
  padding: '18px 10px', 
  boxSizing: 'border-box',
  cursor: 'pointer',
  background: '#EEF2F6',
  outline: 'none'
};

const chipInactive = { ...baseChip };
const chipActive = {
  ...baseChip,
  background: 'linear-gradient(104.45deg, #448FFF -6.51%, #4833D0 105.13%)',
  border: 'none',
  boxShadow: '0 0 2px rgba(0,0,0,0.25)'
};

const chipLabelBase = {
  fontFamily: 'Roboto',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '16px',
  letterSpacing: '-0.03em',
  color: '#626262'
};
const chipLabel = { ...chipLabelBase };
const chipActiveLabel = {
  ...chipLabelBase,
  fontWeight: 700,
  letterSpacing: '-0.04em',
  color: '#F9F9F9',
  textShadow: '0px 0px 2px rgba(0,0,0,0.25)'
};
