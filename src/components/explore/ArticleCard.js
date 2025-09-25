
import React from "react";
import "./ArticleCard.css";

export default function ArticleCard({ article }) {
  if (!article) return null;

  return (
    <div className="article-card">
      <div className="article-card-title">{article.title}</div>
      <div className="article-card-meta">{article.meta}</div>
      <div className="article-card-divider" />
      <div className="article-card-body">{article.body}</div>
    </div>
  );
}
