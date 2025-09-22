import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWordStore } from './useWordStore.js';
import HeaderCharacter from '../../assets/study/wordHeaderCharacter.svg';

export default function WordSection({ deleteMode = false, onExitDelete }) {
  const { words, removeMany } = useWordStore();
  const [selected, setSelected] = useState([]); // ids

  // 삭제 모드 진입/해제 시 선택 초기화
  useEffect(() => { if (!deleteMode) setSelected([]); }, [deleteMode]);

  const toggleSelect = (id) => {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  };

  const removeSelected = () => {
    if (!selected.length) return;
    removeMany(selected);
    setSelected([]);
    onExitDelete && onExitDelete();
  };

  const empty = words.length === 0;
  const navigate = useNavigate();

  return (
    <div>
      {(!empty || deleteMode) && (
        <div className="word-heading-block">
          <h2 className="word-heading-title">
            {deleteMode ? '삭제할 단어를 선택해주세요' : <>오늘 어려웠던 <span className="word-highlight">단어</span>에요!</>}
          </h2>
        </div>
      )}
      {empty ? (
        <div className="empty-state empty-state-v2">
          <div className="empty-illustration" aria-hidden="true" />
          {deleteMode ? (
            <>
              <h3 className="empty-main-title">삭제할 단어가 없습니다</h3>
              <p className="helper">단어를 먼저 추가한 뒤 삭제 모드를 이용하세요.</p>
            </>
          ) : (
            <>
              <h3 className="empty-main-title">아직 단어를 추가하지 않았어요!</h3>
              <p className="helper">모르는 단어가 있다면, 뉴스의 단어 또는 직접 추가 해보세요!</p>
              <div className="empty-actions-bottom single">
                <button className="empty-action-btn" onClick={() => navigate('/')}>홈으로 가기</button>
              </div>
            </>
          )}
        </div>
      ) : (
        <ul className={`word-card-list ${deleteMode ? 'delete-mode':''}`}>
          {words.map((w, idx) => {
            const showChar = !deleteMode && idx === 0;
            return (
              <li key={w.id} className={`word-card ${showChar ? 'with-character' : ''}`}>
                {showChar && (
                  <img src={HeaderCharacter} alt="캐릭터" className="word-card-character-outside" />
                )}
                <div className="row">
                  <strong className="word-term">{w.term}</strong>
                  {deleteMode && (
                    <button
                      onClick={() => toggleSelect(w.id)}
                      className={`select-btn ${selected.includes(w.id)?'selected':''}`}
                      aria-label={selected.includes(w.id)?'선택 해제':'선택'}
                    >
                      {selected.includes(w.id) ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <rect width="24" height="24" rx="12" fill="#448FFF"/>
                          <path d="M9.96421 16.1561C9.73325 16.1559 9.50947 16.0758 9.33087 15.9294L6.3442 13.4827C5.93582 13.128 5.8836 12.5127 6.22636 12.0942C6.56912 11.6757 7.18256 11.6056 7.61087 11.9361L9.92421 13.8294L16.5909 7.6894C16.8415 7.39145 17.2422 7.26601 17.6179 7.3679C17.9937 7.46979 18.2761 7.78049 18.3418 8.16422C18.4076 8.54795 18.2446 8.93494 17.9242 9.15607L10.6442 15.8894C10.46 16.062 10.2166 16.1574 9.96421 16.1561Z" fill="white"/>
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <rect x="0.5" y="0.5" width="23" height="23" rx="11.5" stroke="#999999"/>
                          <path d="M9.96421 16.1561C9.73325 16.1559 9.50947 16.0758 9.33087 15.9294L6.3442 13.4827C5.93582 13.128 5.8836 12.5127 6.22636 12.0942C6.56912 11.6757 7.18256 11.6056 7.61087 11.9361L9.92421 13.8294L16.5909 7.6894C16.8415 7.39145 17.2422 7.26601 17.6179 7.3679C17.9937 7.46979 18.2761 7.78049 18.3418 8.16422C18.4076 8.54795 18.2446 8.93494 17.9242 9.15607L10.6442 15.8894C10.46 16.062 10.2166 16.1574 9.96421 16.1561Z" fill="#999999"/>
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                <p className="word-meaning">{w.meaning}</p>
              </li>
            );
          })}
        </ul>
      )}
      {deleteMode && (
        <div className="delete-bar">
          <div className="delete-bar-inner">
            <button onClick={() => { setSelected([]); onExitDelete && onExitDelete(); }}>취소</button>
            <button disabled={selected.length===0} onClick={removeSelected}>삭제</button>
          </div>
        </div>
      )}
    </div>
  );
}
