import { useNavigate } from 'react-router-dom';

export default function StudyTabs({ active, onChange }) {
  const navigate = useNavigate();
  const tabs = [
    { key: 'words', label: '단어장' },
    { key: 'wrong', label: '오답노트' }
  ];
  return (
    <div className="study-tabs">
      {tabs.map(t => {
        const isActive = active === t.key;
        return (
          <div key={t.key} className="study-tab">
            <button
              onClick={() => { onChange(t.key); navigate(`/study?tab=${t.key}`); }}
              className={isActive ? 'active' : 'inactive'}
            >{t.label}</button>
            <div className={`underline ${isActive ? 'active':''}`} />
          </div>
        );
      })}
    </div>
  );
}
