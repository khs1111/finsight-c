import './NewsCard.css';

// Props:
// - title: string
// - description: string
// - date: string (optional)
// - image: string (background image url)
// - tags: array of strings (optional display above description)
// - onClick: handler
export default function NewsCard({ title, description, date, image, tags = [], onClick }) {
  const bgImage = image || 'https://via.placeholder.com/400x200?text=News';
  // Fallback trimming in case line clamp unsupported or description extremely long
  const MAX_LEN = 160; // approx 2 lines on mobile
  const truncatedDescription = description && description.length > MAX_LEN
    ? description.slice(0, MAX_LEN - 1).trimEnd() + '…'
    : description;

  return (
    <div className="news-card gradient-border" onClick={onClick}>
      <div
        className="news-card__image-header"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      >
        <h3 className="news-card__title" title={title}>{title}</h3>
      </div>
      <div className="news-card__body">
        {tags.length > 0 && (
          <div className="news-card__tags-row">
            {tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}
  <p className="news-card__description">{truncatedDescription}</p>
        {date && (
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{date}</div>
        )}
      </div>
    </div>
  );
}

