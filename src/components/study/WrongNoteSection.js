
import { useEffect, useState } from 'react';
import { getWrongNotes } from '../../api/explore';
import Illustration from '../../assets/study/wrongNoteIllustration.svg';

export default function WrongNoteSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [subsectorStats, setSubsectorStats] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const userId = localStorage.getItem('userId') || undefined;
        const resp = await getWrongNotes(userId, 0, 50, 'all');
        if (!mounted) return;
        setTotalCount(resp?.statistics?.totalCount ?? resp?.totalCount ?? 0);
        setSubsectorStats(Array.isArray(resp?.subsectorStatistics) ? resp.subsectorStatistics : []);
      } catch (e) {
        if (mounted) setError(e?.message || '오답노트 불러오기 실패');
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const empty = !loading && (!subsectorStats || subsectorStats.length === 0);

  return (
    <div className="wrongnote-wrapper" role="region" aria-label="오답노트">
      <div className="wrongnote-header-block">
        <h2 className="wrongnote-title-line">틀린 문제를 정리해보았어요!</h2>
        <p className="wrongnote-subtitle">총 <strong>{totalCount}</strong>개의 오답이 있어요.</p>
        <img src={Illustration} alt="오답 일러스트" className="wrongnote-float-illust" />
      </div>

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
          <div className="wrongnote-list" style={{paddingLeft: 4, paddingRight: 4, boxSizing: 'border-box'}}>
            {subsectorStats.map((sector) => (
              <div key={sector.subsectorId} className="wrongnote-card" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 18, gap: 10,
                width: '100%', maxWidth: '100%', minHeight: 84, background: '#F9F9F9', boxShadow: '0px 0px 1px rgba(0,0,0,0.18)', borderRadius: '0px 16px 16px 16px', marginBottom: 16, boxSizing: 'border-box'
              }}>
                <div style={{fontFamily: 'Roboto', fontWeight: 700, fontSize: 17, lineHeight: '21px', letterSpacing: '-0.02em', color: '#1B1B1B', marginBottom: 2}}>
                  {sector.subsectorName}
                </div>
                <div style={{fontFamily: 'Roboto', fontWeight: 400, fontSize: 15, lineHeight: '20px', color: '#616161', marginBottom: 2}}>
                  틀린 문제 개수: {sector.wrongCount}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
