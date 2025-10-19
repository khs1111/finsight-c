
import { useWrongNoteStore } from './useWrongNoteStore';
import Illustration from '../../assets/study/wrongNoteIllustration.svg';



export default function WrongNoteSection() {
  const { wrongNotes, loading, error, stats } = useWrongNoteStore();
  const total = stats?.totalCount ?? stats?.total ?? wrongNotes.length;
  const empty = !loading && total === 0;

  // 통계 시각화: 카테고리별 비율
  const statList = (stats?.byCategory && Array.isArray(stats.byCategory)) ? stats.byCategory : [];
  return (
    <div className="wrongnote-wrapper" role="region" aria-label="오답노트">
      <div className="wrongnote-header-block">
        <h2 className="wrongnote-title-line">틀린 문제를 정리해보았어요!</h2>
  {!empty && <div className="wrongnote-total-overlay">총 {total}개</div>}
        {!empty && (
          <img src={Illustration} alt="오답 일러스트" className="wrongnote-float-illust" />
        )}
      </div>
      {/* 통계 시각화 영역 */}
      {!empty && statList.length > 0 && (
        <div className="wrongnote-stats-block">
          <h4 className="wrongnote-stats-title">카테고리별 오답 통계</h4>
          <ul className="wrongnote-stats-list">
            {statList.map((item) => {
              const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <li key={item.category} className="wrongnote-stats-item">
                  <span className="stat-cat">{item.category}</span>
                  <span className="stat-bar-wrap">
                    <span className="stat-bar" style={{width: percent + '%', background: '#FFBC02', display: 'inline-block', height: 8, borderRadius: 4}}></span>
                  </span>
                  <span className="stat-count">{item.count}개</span>
                  <span className="stat-percent">({percent}%)</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {loading ? (
        <div className="wrongnote-empty"><p>불러오는 중...</p></div>
      ) : empty ? (
        <div className="wrongnote-empty">
          <img src={Illustration} alt="오답 노트 일러스트" className="wrongnote-illust" />
          <h3>틀린 문제가 아직 없어요</h3>
          <p className="helper">문제를 풀면 여기에서 다시 복습할 수 있어요.</p>
        </div>
      ) : (
        <>
          {error && <div className="error-text">서버 통신 오류: {error}</div>}
          {/* 틀린문제 리스트 카드 UI */}
          <div className="wrongnote-card-list">
            {wrongNotes.map(note => (
              <div key={note.id} className="wrongnote-card">
                <div className="wrongnote-card-question">{note.questionText}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
