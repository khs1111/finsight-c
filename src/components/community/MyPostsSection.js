import React from 'react';

export default function MyPostsSection() {
  return (
    <div className="community-myposts">
      <div className="empty-state-v2">
        <div className="empty-illustration" />
        <h3 className="empty-main-title">내가 쓴 글이 없어요</h3>
        <p className="helper">피드에서 다른 사람 글을 보고 첫 글을 남겨보세요.</p>
        <button className="empty-primary-btn">글 쓰기</button>
        <button className="empty-secondary-link">작성 가이드 보기</button>
      </div>
    </div>
  );
}
