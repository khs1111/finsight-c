export default function NewsCard({ title, description, date, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
      }}
    >
      <h3 style={{ margin: 0 }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: '#555' }}>{description}</p>
      <div style={{ fontSize: '0.8rem', color: '#888' }}>{date}</div>
    </div>
  );
}

