// 주제 선택
import { useState } from "react";
// 주제 선택 - 백엔드 연동
import { useState, useEffect, useMemo } from "react";
import { getSectorsWithSubsectors } from "../../api/explore";

export default function TopicPicker({ onConfirm }) {
  const [openTopicId, setOpenTopicId] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null); // { id, name }
  const [selectedSub, setSelectedSub] = useState(null);     // { id, name }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tree, setTree] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const sectors = await getSectorsWithSubsectors();
        if (!mounted) return;
        setTree(Array.isArray(sectors) ? sectors : []);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setTree([]);
        setError(e?.message || '주제를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const topics = useMemo(() => tree.map(s => ({ id: s.id, name: s.name })), [tree]);
  const subTopicMap = useMemo(() => {
    const m = {};
    tree.forEach(s => { m[s.id] = s.subsectors || []; });
    return m;
  }, [tree]);

  const toggleTopic = (topicId) => {
    setOpenTopicId(openTopicId === topicId ? null : topicId);
    setSelectedSub(null);
    const t = topics.find(t => String(t.id) === String(topicId));
    if (t) setSelectedTopic(t);
  };
  // 모바일 대응: 600px 이하에서 width 100%
  const containerStyle = {
    maxWidth: "auto",
    width: "100%",
    margin: "0 auto",
    padding: "60px 16px 140px 16px",
    background: "#F4F6FA",
    minHeight: "100vh",
    boxSizing: "border-box",
    position: "relative",
  };
  if (typeof window !== 'undefined' && window.innerWidth <= 600) {
    containerStyle.width = "100vw";
    containerStyle.padding = "40px 4vw 100px 4vw";
  }

  return (
    <div style={containerStyle}>
      <h1
        style={{
          fontFamily: "Roboto, sans-serif",
          fontWeight: 900,
          fontStyle: "normal",
          fontSize: "30px",
          lineHeight: "100%",
          letterSpacing: "0",
          marginBottom: "98px",
          color: "#000",
        }}
      >
        내가 고른 주제, <br />
        깊이 있게 배워 봐요!
      </h1>

      {loading && (
        <div style={{ maxWidth: 380, margin: '0 auto 24px', color: '#666' }}>주제를 불러오는 중...</div>
      )}
      {error && !loading && (
        <div style={{ maxWidth: 380, margin: '0 auto 24px', color: '#c00' }}>{String(error)}</div>
      )}

      {topics.map((topic) => (
        <div key={topic.id} style={{ marginBottom: "12px" }}>
          <div
            style={{
              width: 'calc(100vw - 32px)',
              maxWidth: 380,
              margin: '0 auto',
              borderRadius: openTopic === topic ? '8px 8px 0 0' : 8,
              boxShadow: '0px 0px 2px rgba(0,0,0,0.10)',
              background: openTopicId === topic.id ? '#448FFF' : '#FFF',
              transition: 'box-shadow 0.2s, background 0.2s',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 60,
              padding: 0,
              position: 'relative',
            }}
            onClick={() => toggleTopic(topic.id)}
          >
            <span style={{
              fontFamily: 'Roboto',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: 18,
              lineHeight: '100%',
              letterSpacing: 0,
              color: openTopicId === topic.id ? '#fff' : '#4D4D4D',
              marginLeft: 16,
              width: 348,
              textAlign: 'left',
              height: 21,
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>{topic.name}</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{marginRight: 16}} xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke={openTopicId === topic.id ? '#fff' : '#BDBDBD'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {openTopicId === topic.id && (
            <div
              style={{
                width: 'calc(100vw - 32px)',
                maxWidth: 380,
                margin: '0 auto',
                background: '#fff',
                boxShadow: '0px 0px 4px rgba(0,0,0,0.25)',
                borderRadius: '0 0 8px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 0,
                gap: 0,
                borderTop: 'none',
                overflow: 'hidden',
              }}
            >
              {(subTopicMap[topic.id] || []).map((sub, idx) => (
                <>
                  <div
                    key={sub.id}
                    onClick={e => { e.stopPropagation(); setSelectedSub({ id: sub.id, name: sub.name }); }}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: '16px',
                      gap: 10,
                      width: '100%',
                      height: 53,
                      background: '#fff',
                      color: '#474747',
                      fontFamily: 'Roboto',
                      fontWeight: 400,
                      fontSize: 18,
                      lineHeight: '21px',
                      cursor: 'pointer',
                      border: (selectedSub?.id === sub.id) ? '1px solid #448FFF' : '1px solid transparent',
                      boxShadow: (selectedSub?.id === sub.id) ? '0px 0px 4px #448FFF' : 'none',
                      borderRadius: 8,
                      boxSizing: 'border-box',
                      margin: selectedSub === sub ? '0 0 0 0' : '0',
                      transition: 'border 0.15s, box-shadow 0.15s',
                    }}
                  >
                    <span style={{
                      width: 348,
                      height: 21,
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: 'Roboto',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      fontSize: 18,
                      lineHeight: '100%',
                      letterSpacing: 0,
                      color: '#474747',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{sub.name}</span>
                  </div>
                  {idx !== (subTopicMap[topic.id] || []).length - 1 && (
                    <div style={{ width: '100%', height: 0, border: '1px solid #F5F5F5' }} />
                  )}
                </>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => onConfirm(selectedTopic?.name, selectedSub?.name, selectedTopic?.id, selectedSub?.id)}
        disabled={!selectedSub || !selectedTopic}
        style={{
          position: "fixed",
          left: "50%",
          bottom: "72px",
          transform: "translateX(-50%)",
          width: 'calc(100vw - 32px)',
          maxWidth: 380,
          height: "60px",
          background: (selectedSub && selectedTopic)
            ? "linear-gradient(104.45deg, #448FFF -6.51%, #4833D0 105.13%)"
            : "#CACACA",
          color: "#fff",
          fontSize: "18px",
          fontWeight: "700",
          border: "none",
          borderRadius: "8px",
          cursor: selectedSub ? "pointer" : "not-allowed",
          boxShadow: selectedSub ? "0 0 8px rgba(0,0,0,0.25)" : "none",
          zIndex: 120,
        }}
      >
        {loading ? '로딩 중...' : '확인'}
      </button>
    </div>
  );
}
