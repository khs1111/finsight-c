import React, { useState, useEffect, useRef } from 'react';
import { getPostComments, createComment } from '../../api/community';
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
                  <span className="comment-author" style={{ fontWeight: 700, fontSize: 15 }}>{c.author?.nickname || '익명'}</span>
                  {c.author?.badge && c.author.badge.imageUrl && (
                    <img
                      src={c.author.badge.imageUrl}
                      alt={c.author.badge.name || c.author.badge.tier || '티어'}
                      style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', marginRight: 4, verticalAlign: 'middle', background: '#f5f5f7', border: '1px solid #eee' }}
                      className="comment-badge-img"
                    />
                  )}
                  {c.author?.badge && !c.author.badge.imageUrl && (
                    <span className="comment-badge" style={{ background: '#f5f5f7', color: '#6c6c6c', borderRadius: 8, fontSize: 13, padding: '2px 8px', marginRight: 4, fontWeight: 500 }}>
                      {c.author.badge.name || c.author.badge.tier || '뱃지'}
                    </span>
                  )}
                  <span className="comment-date" style={{ color: '#aaa', fontSize: 12, marginLeft: 4 }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
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
