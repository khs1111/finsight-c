//초 중 고 레벨 선택
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { getLevelsBySubsector, getSectorsWithSubsectors, getLevelDetail } from "../../api/explore";
import "./LevelPicker.css";

// props: mainTopic (대분류), subTopic (선택된 소분류)
export default function LevelPicker({ mainTopic, subTopic, onConfirm, onBack }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const containerRef = useRef(null);
  const goalRef = useRef(null);
  const [spacerH, setSpacerH] = useState(156); // 기본 여유 공간(버튼/네비 고려)

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    function measure() {
      try {
        const containerEl = containerRef.current;
        if (!containerEl) return;
        const cRect = containerEl.getBoundingClientRect();
        let bottomAbs = 0;
        if (goalRef.current) {
          const gRect = goalRef.current.getBoundingClientRect();
          bottomAbs = Math.max(bottomAbs, Math.round(gRect.bottom - cRect.top));
        }
        // 추가 여유: 고정 버튼(60) + 버튼 상단여백(12) + 네비(72) + 추가 마진(24)
        const extra = 60 + 12 + 72 + 24;
        const desired = Math.max(156, bottomAbs + extra);
        setSpacerH(desired);
      } catch (e) { /* noop */ }
    }
    // 초기 2번 rAF로 주소창 애니메이션 보정
    requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, [selectedLevel]);

  // 서브섹터 기반 레벨 목록 가져오기 (subTopic이 이름 문자열이어도 동작)
  useEffect(() => {
    let cancelled = false;
    const resolveSubsectorId = async () => {
      // 1) 객체 형태로 id 포함된 경우
      if (subTopic && typeof subTopic === 'object') {
        const sid = subTopic.id ?? subTopic.subsectorId ?? subTopic.code;
        if (sid != null) return sid;
      }
      // 2) 숫자 또는 숫자형 문자열인 경우
      if (subTopic != null) {
        const n = Number(subTopic);
        if (Number.isFinite(n) && n > 0) return n;
      }
      // 3) 이름 문자열인 경우: 섹터/서브섹터 트리에서 탐색
      try {
        const tree = await getSectorsWithSubsectors();
        const name = (subTopic || '').toString().trim().toLowerCase();
        if (!name) return null;
        // mainTopic이 제공되면 해당 섹터 안에서 우선 탐색
        let candidates = Array.isArray(tree) ? tree : [];
        if (mainTopic) {
          const mt = mainTopic.toString().trim().toLowerCase();
          const sect = candidates.find(s => (s.name || '').toString().trim().toLowerCase() === mt);
          if (sect) candidates = [sect];
        }
        for (const sec of candidates) {
          for (const ss of (sec.subsectors || [])) {
            const nm = (ss.name || '').toString().trim().toLowerCase();
            if (nm === name) return ss.id;
          }
        }
        // 완전 일치가 없으면 포함 매칭으로 한 번 더 시도
        for (const sec of (Array.isArray(tree) ? tree : [])) {
          for (const ss of (sec.subsectors || [])) {
            const nm = (ss.name || '').toString().trim().toLowerCase();
            if (nm.includes(name)) return ss.id;
          }
        }
      } catch (_) { /* ignore */ }
      return null;
    };

    (async () => {
      setLoading(true);
      try {
        if (!subTopic) {
          if (!cancelled) { setLevels([]); setSelectedLevel(null); }
          return;
        }
        const subsectorId = await resolveSubsectorId();
        if (!subsectorId) {
          if (!cancelled) { setLevels([]); setSelectedLevel(null); }
          return;
        }
        const list = await getLevelsBySubsector(subsectorId);
        // 상세가 비어있을 수 있어 보강: 개별 레벨 상세 호출로 desc/goal/title 채움
        const mapped = Array.isArray(list)
          ? await Promise.all(list.map(async (l) => {
              const id = l.id ?? l.levelId ?? l.level_id;
              let title = l.title ?? l.name ?? (l.levelNumber ? `레벨 ${l.levelNumber}` : (id ? `레벨 ${id}` : '레벨'));
              let desc = l.desc ?? l.description ?? '';
              let goal = l.goal ?? l.learning_goal ?? l.learningGoal ?? '';
              let levelNumber = l.levelNumber ?? l.level_number ?? l.number;
              if ((!desc || !goal) && id) {
                try {
                  const detail = await getLevelDetail(id);
                  if (detail) {
                    title = detail.title || title;
                    desc = detail.desc ?? desc;
                    goal = detail.goal ?? goal;
                    if (detail.levelNumber != null) levelNumber = detail.levelNumber;
                  }
                } catch (_) { /* ignore */ }
              }
              return {
                id: id ?? levelNumber,
                key: id ?? levelNumber,
                title,
                desc,
                goal,
                levelNumber,
              };
            }))
          : [];
        if (!cancelled) {
          setLevels(mapped);
          // 선택 상태는 기존 값이 없다면 초기화하되, 의존성에 selectedLevel을 넣지 않기 위해 함수형 업데이트 사용
          setSelectedLevel(prev => (prev ? prev : (mapped[0]?.key ?? null)));
        }
      } catch (e) {
        console.warn('레벨 목록 로딩 실패:', e);
        if (!cancelled) { setLevels([]); setSelectedLevel(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  // 의존성: 레벨 목록은 subTopic/mainTopic 변화에만 재호출
  }, [subTopic, mainTopic]); 

  const getDescForLevel = (lvKey) => levels.find(l => l.key === lvKey)?.desc || '';
  const getGoalForLevel = (lvKey) => levels.find(l => l.key === lvKey)?.goal || '';

  return (
    <div ref={containerRef} className="level-picker-container">
      {/* 상단 헤더 */}
      <div className="level-picker-header">
        <button
          onClick={onBack}
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 22,
            color: '#1B1B1B',
            padding: 0,
            marginRight: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.9498 19.5201C11.0931 19.6553 11.2828 19.7304 11.4798 19.7301C11.6761 19.7318 11.8643 19.6521 11.9998 19.5101C12.1428 19.3708 12.2234 19.1797 12.2234 18.9801C12.2234 18.7805 12.1428 18.5894 11.9998 18.4501L6.29975 12.75H19.52C19.9342 12.75 20.27 12.4142 20.27 12C20.27 11.5858 19.9342 11.25 19.52 11.25H6.29756L12.0098 5.52006C12.1528 5.38077 12.2334 5.18965 12.2334 4.99006C12.2334 4.79048 12.1528 4.59935 12.0098 4.46006C11.717 4.16761 11.2426 4.16761 10.9498 4.46006L3.94981 11.4601C3.65736 11.7529 3.65736 12.2272 3.94981 12.5201L10.9498 19.5201Z" fill="#1B1B1B"/>
          </svg>
        </button>
        <span style={{
          fontFamily: 'Pretendard, Roboto, sans-serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          lineHeight: '1.3',
          color: '#474747',
          flex: 1,
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '-0.01em',
        }}>{mainTopic ? `${mainTopic} - ${subTopic || ''}` : subTopic || ''}</span>
      </div>

      {/* 메인 타이틀 */}
      <h1 className="level-picker-title">
        단계별로 맞춘 집중학습, <br />
        함께 시작해요!
      </h1>

      {/* 서브 타이틀 */}
      <p className="level-picker-desc">
        학습 목표를 확인하고 실습할 수 있어요.
      </p>

      {/* 레벨 카드 리스트 */}
      <div className="level-picker-list">
        {loading && (
          <div className="level-picker-card" style={{ opacity: 0.6 }}>레벨 데이터를 불러오는 중...</div>
        )}
        {!loading && levels.length === 0 && (
          <div className="level-picker-card" style={{ opacity: 0.8 }}>표시할 레벨이 없습니다.</div>
        )}
        {!loading && levels.map((lv) => (
          <div
            key={lv.key}
            className={
              'level-picker-card' +
              (selectedLevel === lv.key ? ' selected' : '')
            }
            onClick={() => setSelectedLevel(lv.key)}
          >
            <div className="level-picker-card-content">
              <div className="level-picker-card-title">
                {lv.title}
              </div>
              <div className="level-picker-card-desc">
                {getDescForLevel(lv.key)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 학습 목표 카드 */}
      {selectedLevel && (
        <div ref={goalRef} className="level-picker-goal">
          <div className="level-picker-goal-title">학습 목표</div>
          <div style={{ width: '100%', borderTop: '1px solid #F5F5F5', marginTop: 10, marginBottom: 10 }} />
          <div className="level-picker-goal-desc">
            {getGoalForLevel(selectedLevel)}
          </div>
        </div>
      )}

      {/* 확인 버튼 */}
      <button
  onClick={() => {
    if (!selectedLevel) return;
    const sel = levels.find(l => String(l.key) === String(selectedLevel));
    if (!sel) return;
    const entityId = Number(sel.id);
    const levelNo = Number(sel.levelNumber ?? sel.number ?? sel.level_no);
    onConfirm({
      levelId: entityId, // 실제 backend PK
      levelNumber: Number.isFinite(levelNo) ? levelNo : undefined, // 1/2/3 등 난이도 번호
      levelName: sel.title,
      learningGoal: sel.goal,
    });
  }}
        disabled={!selectedLevel}
        style={{
          position: "fixed",
          left: "50%",
          bottom: "72px",
          transform: "translateX(-50%)",
          width: 'calc(100vw - 32px)',
          maxWidth: 380,
          height: "60px",
          background: selectedLevel
            ? "linear-gradient(104.45deg, #448FFF -6.51%, #4833D0 105.13%)"
            : "#CACACA",
          color: "#fff",
          fontSize: "18px",
          fontWeight: "700",
          border: "none",
          borderRadius: "8px",
          cursor: selectedLevel ? "pointer" : "not-allowed",
          boxShadow: selectedLevel ? "0 0 8px rgba(0,0,0,0.25)" : "none",
          zIndex: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          boxSizing: 'border-box',
          transition: 'background 0.15s',
        }}
      >
        확인
      </button>

      {/* 바닥 여유 공간(고정 버튼/네비 아래로 내용이 숨지 않도록) */}
      <div className="level-picker-bottom-spacer" style={{ height: spacerH }} />
    </div>
  );
}
