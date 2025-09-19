// 커뮤니티 피드 페이지
// - 게시물 피드 / 랭크 필터 / 글쓰기 진입 FAB
// - 카테고리(오늘의 뉴스, 시황 등) 상태 관리
import React, { useState } from 'react';
import './StudyPage.css';
import './CommunityPage.css';
import RankFilterDropdown from '../components/community/RankFilterDropdown';
import FeedSection from '../components/community/FeedSection';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';

// 카테고리 목록 (디자인 스펙 기반) - '오늘의 뉴스' = 전체 개념
const CATEGORIES = ['오늘의 뉴스', '시황', '채권', '부동산', '원자재'];

// CommunityPage: 커뮤니티 메인 피드 컴포넌트
export default function CommunityPage() {
  // 선택된 카테고리/랭크 상태
  const [category, setCategory] = useState('오늘의 뉴스');
  const [showRank, setShowRank] = useState(false);
  const [rank, setRank] = useState(null); // 마스터, 다이아 등
  const navigate = useNavigate();

  return (
    <div className="community-container has-bottom-nav">
      <div className="community-topbar community-topbar-logo">
        <Logo />
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
      <div className="community-divider" />
      <div className="community-content">
  <FeedSection />
      </div>
  {/* 인라인 필터 토글 버튼 */}
      <div
        className="community-filter-inline"
        role="button"
        aria-label="랭크 필터 열기"
        onClick={() => setShowRank(v => !v)}
      >
        <span className="label">필터링</span>
        <span className="icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.96134 2.00065H19.1413V2.01065C20.3363 1.98986 21.4217 2.70428 21.875 3.81009C22.3284 4.9159 22.057 6.1866 21.1913 7.01065L16.4213 11.7807C15.8904 12.3125 15.5858 13.0292 15.5713 13.7807V18.1807C15.5698 19.0931 15.1403 19.9519 14.4113 20.5007L13.1713 21.4307C12.2944 22.0979 11.1144 22.2085 10.1288 21.7157C9.14325 21.2229 8.52367 20.2125 8.53134 19.1107V13.7807C8.51691 13.0292 8.21231 12.3125 7.68134 11.7807L2.91134 7.01065C2.0381 6.18783 1.76172 4.91222 2.2161 3.80176C2.67049 2.6913 3.76178 1.97531 4.96134 2.00065ZM20.4413 4.37065C20.2255 3.84303 19.7114 3.49894 19.1413 3.50065H4.96134C4.3913 3.49894 3.87714 3.84303 3.66134 4.37065C3.43857 4.89571 3.56176 5.50372 3.97134 5.90065L8.76134 10.6707C9.59042 11.4928 10.0551 12.6131 10.0513 13.7807V19.1107C10.046 19.4793 10.1873 19.835 10.4443 20.0994C10.7012 20.3639 11.0527 20.5154 11.4213 20.5207C11.7226 20.5193 12.0148 20.4172 12.2513 20.2307L13.4913 19.3007C13.8439 19.0363 14.0513 18.6213 14.0513 18.1807V13.7807C14.0529 12.6102 14.5249 11.4895 15.3613 10.6707L20.1313 5.90065C20.5409 5.50372 20.6641 4.89571 20.4413 4.37065Z" fill="#9B9B9B" />
          </svg>
        </span>
      </div>
      {showRank && (
        <RankFilterDropdown
          onSelect={(r) => { setRank(r); setShowRank(false); console.log('Selected rank:', r); }}
          selected={rank}
          top={165}
          // Positioned relative to spec (left:314, top:192). Since our container is centered max-width 412, absolute coordinates should match design.
        />
      )}
      <button
        type="button"
        className="community-fab"
        aria-label="글쓰기"
        onClick={() => navigate('/community/write')}
        style={{ border:'none', padding:0, background:'#FFFFFF' }}
      >
        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M10.8868 20.8596L11.8601 16.3129C12.0018 15.6811 12.321 15.1029 12.7801 14.6462L21.6734 5.83291C22.5753 4.91421 23.7998 4.38329 25.0868 4.35291C26.0574 4.33901 26.9935 4.71341 27.6868 5.39291C29.2017 7.18287 29.0061 9.85587 27.2468 11.4062L18.3534 20.2996C17.8968 20.7587 17.3186 21.0779 16.6868 21.2196L12.1401 22.1929H11.8868C11.5544 22.2056 11.2369 22.0544 11.0373 21.7883C10.8378 21.5222 10.7815 21.1751 10.8868 20.8596ZM14.1934 16.0729C14.0066 16.254 13.8768 16.4857 13.8201 16.7396L13.1668 19.8462L16.2734 19.1796C16.5273 19.1228 16.7591 18.9931 16.9401 18.8062L25.8334 9.91291C26.8077 9.13294 27.001 7.72688 26.2734 6.71291C25.9548 6.40852 25.5272 6.24514 25.0868 6.25958C24.3275 6.29007 23.6101 6.61531 23.0868 7.16625L14.1934 16.0729Z" fill="#474747" />
          <path d="M27.0468 15.0729C26.4975 15.0801 26.054 15.5236 26.0468 16.0729V23.6596C26.0646 24.732 25.6511 25.7666 24.899 26.5312C24.1469 27.2958 23.1193 27.7264 22.0468 27.7262H9.3401C7.12326 27.6828 5.34692 25.8768 5.3401 23.6596V11.0062C5.3765 8.78637 7.18659 7.00595 9.40677 7.00625H16.9934C17.5457 7.00625 17.9934 6.55853 17.9934 6.00625C17.9934 5.45396 17.5457 5.00625 16.9934 5.00625H9.3401C6.01544 5.00605 3.30997 7.68178 3.27344 11.0062V23.6596C3.27344 27.0101 5.98958 29.7262 9.3401 29.7262H21.9934C25.3388 29.7189 28.0468 27.0049 28.0468 23.6596V16.0729C28.0396 15.5236 27.5961 15.0801 27.0468 15.0729Z" fill="#474747" />
        </svg>
      </button>
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
