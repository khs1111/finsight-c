// 단어 추가 페이지 
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWordStore } from '../components/study/useWordStore.js';

export default function AddWordPage() {
  const { add } = useWordStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ term: '', meaning: '' });
  const backTarget = `/study?tab=${searchParams.get('tab') || 'words'}`;
  const canSave = form.term.trim() && form.meaning.trim();

  useEffect(() => {
    const updateVH = () => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty('--vvh', vh + 'px');
    };
    updateVH();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateVH);
      window.visualViewport.addEventListener('scroll', updateVH);
    } else {
      window.addEventListener('resize', updateVH);
    }
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateVH);
        window.visualViewport.removeEventListener('scroll', updateVH);
      } else {
        window.removeEventListener('resize', updateVH);
      }
    };
  }, []);

  const save = () => {
    if (!canSave) return;
    add(form.term.trim(), form.meaning.trim());
    navigate(backTarget, { replace: true });
  };

  return (
    <div className="add-word-page">
  <header className="add-word-topbar" />
      <div className="add-word-scroll">
        <div className="add-word-heading">
          <h2 className="add-word-title">추가할 단어를 입력해주세요</h2>
        </div>
        <div className="add-word-form-block">
          <div className="input-wrapper">
            <input
              placeholder="단어의 이름을 입력하세요."
              value={form.term}
              onChange={e => setForm(f => ({ ...f, term: e.target.value }))}
            />
          </div>
          <div className="textarea-wrapper">
            <textarea
              placeholder="단어의 정보를 입력하세요."
              value={form.meaning}
              onChange={e => setForm(f => ({ ...f, meaning: e.target.value }))}
            />
          </div>
        </div>
      </div>
      <div className="add-word-actions">
        <div className="delete-bar-inner">
          <button
            onClick={() => {
              navigate(backTarget, { replace: true });
            }}
          >취소</button>
          <button disabled={!canSave} onClick={save}>저장</button>
        </div>
      </div>
    </div>
  );
}