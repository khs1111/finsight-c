import React, { useState } from 'react';
import { createCommunityPost } from '../api/community';
import { updateBadges } from '../api/profile';
import { useNavigate } from 'react-router-dom';
import './CommunityPage.css';
import './CommunityWritePage.css';
import { guestLogin } from '../api/auth';

const INFO_TEXT = `금융·경제 관련 정보 공유와 학습 목적으로 작성할 수 있어요.\n글 작성 시에는 타인의 권리를 침해하지 않도록 주의하고, \n허위 정보, 광고성 글, 불법적인 내용은 금지되어요.\n주식 리딩, 명예훼손, 광고/홍보 목적 글은 올리실 수 없어요.\n본 커뮤니티에서 얻은 정보로 인한 투자·재정적 의사결정의 최종 책임은 전적으로 본인에게 있어요.\n건전한 토론과 지식 공유를 위해, 존중과 매너를 지켜주세요.`;

const CATEGORIES = ['자유게시판','탐험지','경제 시사','투자'];
const CATEGORY_CODE = {
  '자유게시판': 'FREE',
  '탐험지': 'EXPLORE',
  '경제 시사': 'ECONOMY',
  '투자': 'INVEST',
};

export default function CommunityWritePage() {
  const navigate = useNavigate();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [body, setBody] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = body.trim().length > 0;


  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      // Require auth: retrieve token for authorized post creation
      let token = localStorage.getItem('accessToken');
      if (!token) {
        // 토큰 없으면 게스트 로그인 시도 (백엔드 연결 시)
        try {
          const ok = await guestLogin();
          if (ok) token = localStorage.getItem('accessToken');
        } catch (_) {}
        if (!token) {
          setError('로그인이 필요합니다. 먼저 로그인해 주세요.');
          return;
        }
      }
  const tags = category ? [category] : [];
  const categoryCode = category ? (CATEGORY_CODE[category] || category) : undefined;
  await createCommunityPost({ body, tags, category: categoryCode }, token);
  // 배지 진행 상황 업데이트: POST /api/badges/update/{userId}
  try {
    const userId = localStorage.getItem('userId');
    if (userId) {
      await updateBadges(userId, token);
    }
  } catch (_) { /* 배지 업데이트 실패는 화면 흐름에 영향 주지 않음 */ }
      navigate(-1);
    } catch (e) {
      // Try to surface server message if available
      const msg = e?.response?.data?.message || e?.message;
      setError(msg ? `글 등록에 실패했습니다: ${msg}` : '글 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="write-container">
      <div className="write-header">
        <button className="close-btn" aria-label="닫기" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 6L18 18" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="write-header-title">커뮤니티 작성</div>
        <button
          className={"write-header-done" + (canSubmit ? ' active' : '')}
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? '등록 중...' : '완료'}
        </button>
      </div>
  {error && <div className="write-error-message">{error}</div>}

      <div className="write-category-bar">
        <div className="write-category-inner">
          <div className="write-category-text" onClick={() => setCategoryOpen(v=>!v)} role="button" aria-haspopup="listbox" aria-expanded={categoryOpen}>
            {category ? category : '게시글의 카테고리를 선택해주세요.'}
          </div>
          <div className="write-category-arrow" onClick={() => setCategoryOpen(v=>!v)} aria-label="카테고리 선택">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="#474747" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      {categoryOpen && (
        <div className="write-category-dropdown" role="listbox">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className="write-category-option"
              role="option"
              aria-selected={category === c}
              onClick={() => { setCategory(c); setCategoryOpen(false); }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {body.length === 0 && !focused && (
        <div className="write-info-card" aria-hidden={body.length > 0 || focused}>
          <div className="write-info-inner">
            <div className="write-info-title">글 작성하기 전에 알려드려요.</div>
            <div className="write-info-body">{INFO_TEXT}</div>
          </div>
        </div>
      )}

      <textarea
        className={"write-body-area" + (body.length === 0 && !focused ? ' with-info' : '')}
        placeholder="금융·경제 관련 질문이나 이야기를 해보세요."
        value={body}
        onChange={e => setBody(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      
      <div className="write-bottom-spacer" />
    </div>
  );
}
