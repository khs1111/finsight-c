import React, { useState, useEffect, useRef } from 'react';
import { getPostComments, createComment } from '../../api/community';
import { API_BASE, IMAGE_BASE } from '../../api/config';
import BronzeBadge from '../../assets/tier/bronze.png';
import SilverBadge from '../../assets/tier/silver.png';
import GoldBadge from '../../assets/tier/gold.png';
import EmeraldBadge from '../../assets/tier/emerald.png';
import DiamondBadge from '../../assets/tier/diamond.png';
import MasterBadge from '../../assets/tier/master.png';
import './CommentDropdown.css';

export default function CommentDropdown({ postId, open, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    getPostComments(postId)
      .then(data => setComments(Array.isArray(data) ? data : (data.items || [])))
      .catch(e => setError(e.message || '댓글을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current && inputRef.current.focus(), 200);
    }
  }, [postId, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const userId = localStorage.getItem('userId');
      await createComment(userId, postId, content);
      setContent('');
      setLoading(true);
      const data = await getPostComments(postId);
      setComments(Array.isArray(data) ? data : (data.items || []));
    } catch (e) {
      setError(e.message || '댓글 작성 실패');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  if (!open) return null;

  // ----- Tier image helpers (align with profile page) -----
  const normalizeTier = (t) => {
    const s = String(t || '').trim().toLowerCase();
    if (!s) return '';
    if (/(master|마스터)/.test(s)) return 'MASTER';
    if (/(diamond|다이아|dia)/.test(s)) return 'DIAMOND';
    if (/(emerald|에메랄드)/.test(s)) return 'EMERALD';
    if (/(gold|골드)/.test(s)) return 'GOLD';
    if (/(silver|실버)/.test(s)) return 'SILVER';
    if (/(bronze|브론즈)/.test(s)) return 'BRONZE';
    return s.toUpperCase();
  };
  const makeAbsolute = (u) => {
    if (!u || typeof u !== 'string') return null;
    const s = u.trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s; // already absolute
    if (s.startsWith('//')) return (typeof window !== 'undefined' ? window.location.protocol : 'https:') + s;
    // build base origin from IMAGE_BASE or API_BASE
    let origin = '';
    try {
      if (IMAGE_BASE) origin = String(IMAGE_BASE).replace(/\/+$/, '');
      else if (API_BASE) origin = new URL(API_BASE, (typeof window !== 'undefined' ? window.location.origin : undefined)).origin;
    } catch (_) { origin = ''; }
    if (!origin) return s; // best-effort
    if (s.startsWith('/')) return origin + s;
    return origin + '/' + s.replace(/^\.\//, '');
  };
  const tierImageFor = (tier, urlFromApi) => {
    const abs = makeAbsolute(urlFromApi);
    if (abs) return abs;
    const t = String(tier || '').toUpperCase();
    if (/MASTER/.test(t)) return MasterBadge;
    if (/DIAMOND|다이아|DIA/.test(t)) return DiamondBadge;
    if (/EMERALD|에메랄드/.test(t)) return EmeraldBadge;
    if (/GOLD|골드/.test(t)) return GoldBadge;
    if (/SILVER|실버/.test(t)) return SilverBadge;
    if (/BRONZE|브론즈/.test(t)) return BronzeBadge;
    return null;
  };

  return (
    <div className="comment-dropdown ig-style">
      <div className="comment-dropdown-list">
        {loading ? (
          <div className="comment-loading">불러오는 중...</div>
        ) : error ? (
          <div className="comment-error">{error}</div>
        ) : comments.length === 0 ? (
          <div className="comment-empty">아직 댓글이 없습니다.</div>
        ) : (
          <ul className="comment-list">
            {comments.map(c => (
              <li key={c.id || c.commentId} className="comment-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {(() => {
                    const b = c.author?.badge || {};
                    const tierName = b.name || b.tier;
                    const serverIcon = b.imageUrl || b.iconUrl || b.icon_url || b.image_url;
                    const iconSrc = tierImageFor(normalizeTier(tierName), serverIcon);
                    if (iconSrc) {
                      return (
                        <img
                          src={iconSrc}
                          alt={tierName || '티어'}
                          width={20}
                          height={20}
                          decoding="async"
                          style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', marginRight: 4, verticalAlign: 'middle', background: '#f5f5f7', border: '1px solid #eee' }}
                          className="comment-badge-img"
                        />
                      );
                    }
                    // 최종 폴백: 텍스트 뱃지 유지
                    if (tierName) {
                      return (
                        <span className="comment-badge" style={{ background: '#f5f5f7', color: '#6c6c6c', borderRadius: 8, fontSize: 13, padding: '2px 8px', marginRight: 4, fontWeight: 500 }}>
                          {tierName}
                        </span>
                      );
                    }
                    return null;
                  })()}
                  <span className="comment-author" style={{ fontWeight: 700, fontSize: 15 }}>{c.author?.nickname || '익명'}</span>
                  <span className="comment-date" style={{ color: '#aaa', fontSize: 12, marginLeft: 4 }}>
                    {c.createdAt ? new Date(new Date(c.createdAt).getTime() + (9 * 60 * 60 * 1000)).toLocaleString('ko-KR', { hour12: false }) : ''}
                  </span>
                </div>
                <div className="comment-content" style={{ whiteSpace: 'pre-line', wordBreak: 'break-word', fontSize: 15, marginTop: 2, lineHeight: 1.6, color: '#222' }}>{c.body}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <form className="comment-form ig-style" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="댓글 달기..."
          disabled={submitting}
          maxLength={200}
        />
        <button type="submit" disabled={submitting || !content.trim()} className="ig-submit-btn">게시</button>
        <button type="button" className="close-btn" onClick={onClose} aria-label="닫기">×</button>
      </form>
    </div>
  );
}
