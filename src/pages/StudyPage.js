/**
 * 학습(Study) 페이지
 * - 단어/학습 관련 기능 진입점
 * - 탐험(퀴즈)와 별도 영역으로 분리
 */
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './StudyPage.css';
import StudyTabs from '../components/study/StudyTabs.js';
import WordSection from '../components/study/WordSection.js';
import WrongNoteSection from '../components/study/WrongNoteSection.js';
import { ReactComponent as BackIcon } from '../assets/icons/back.svg';
import { ReactComponent as DeleteIcon } from '../assets/icons/delete.svg';
import { ReactComponent as PlusIcon } from '../assets/icons/plus.svg';

export default function StudyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initial = searchParams.get('tab') === 'wrong' ? 'wrong' : 'words';
  const [tab, setTab] = useState(initial); 
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    const current = searchParams.get('tab');
    if (current && current !== tab) {
      setTab(current === 'wrong' ? 'wrong' : 'words');
    }
  }, [tab, searchParams]); // ESLint: searchParams 의존성 추가

  const handleChange = (next) => {
    // 탭 바꿀 때 삭제/추가 폼 상태 초기화
    setTab(next);
    setDeleteMode(false);
    setSearchParams({ tab: next });
  };

  return (
    <div className={`study-container${deleteMode ? ' delete-mode-active' : ''}`}>
      {!deleteMode && (
        <>
          <div className="study-topbar">
            <button
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              className="icon-btn"
            ><BackIcon /></button>
            <div className="right-icons">
              {tab === 'words' && (
                <button
                  aria-label="삭제 모드"
                  onClick={() => setDeleteMode(true)}
                  className="icon-btn"
                ><DeleteIcon /></button>
              )}
              {tab === 'words' && (
                <button
                  aria-label="단어 추가"
                  onClick={() => navigate('/study/words/add')}
                  className="icon-btn"
                ><PlusIcon /></button>
              )}
            </div>
          </div>
          <div className="study-tabs-wrapper">
            <StudyTabs active={tab} onChange={handleChange} />
          </div>
          <div className="study-divider" />
        </>
      )}
      <div className="study-content">
        {tab === 'words' ? (
          <WordSection
            deleteMode={deleteMode}
            onExitDelete={() => setDeleteMode(false)}
          />
        ) : <WrongNoteSection />}
      </div>
    </div>
  );
}
