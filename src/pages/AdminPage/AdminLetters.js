import React, { useEffect, useState, useRef } from 'react';
import './AdminLetters.css';
import {
  fetchLetterLatest,
  fetchLetterHistory,
} from '../../api/letters';

// Default sector -> keys mapping provided by the user. Admin will call the
// server endpoints with these exact (sector, key) pairs.
// - us_economy => sector: 'macro', key: 'us_economy'
// - us_market  => sector: 'market', key: 'us_market'
// - companies  => sector: 'company', keys: ['nvidia', 'samsung']
const DEFAULT_MAP = {
  macro: ['us_economy'],
  market: ['us_market'],
  company: ['nvidia', 'samsung'],
};

function idOf(sector, key) {
  return `${sector}::${key}`;
}

export default function AdminLetters() {
  const [sectors] = useState(Object.keys(DEFAULT_MAP));
  const [keysBySector, setKeysBySector] = useState(DEFAULT_MAP);
  const [selected, setSelected] = useState(null); // { sector, key }
  const [data, setData] = useState({}); // id -> { latest, history, loading, error }
  const [viewMode, setViewMode] = useState('prose'); // 'json' | 'prose'

  const savedPadding = useRef(null);

  useEffect(() => {
    // on mount, clear app bottom nav padding to avoid empty whitespace in admin
    const container = document.querySelector('.has-bottom-nav');
    if (container) {
      savedPadding.current = container.style.paddingBottom;
      container.style.paddingBottom = '0px';
    }
    // Use the DEFAULT_MAP provided above to initialize keys per sector.
    setKeysBySector(DEFAULT_MAP);
    // pick the first available key as selected
    if (!selected) {
      const firstSector = Object.keys(DEFAULT_MAP)[0];
      const firstKey = DEFAULT_MAP[firstSector] && DEFAULT_MAP[firstSector][0];
      if (firstSector && firstKey) setSelected({ sector: firstSector, key: firstKey });
    }

    return () => {
      if (container) {
        container.style.paddingBottom = savedPadding.current || '';
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected) ensureLoaded(selected.sector, selected.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  async function ensureLoaded(sector, key, force = false) {
    const keyId = idOf(sector, key);
    setData((d) => ({ ...d, [keyId]: { ...(d[keyId] || {}), loading: true, error: null } }));
    try {
      const [latest, history] = await Promise.all([
        fetchLetterLatest(sector, key).catch((e) => ({ error: String(e) })),
        fetchLetterHistory(sector, key).catch((e) => ({ error: String(e) })),
      ]);
      setData((d) => ({ ...d, [keyId]: { latest, history, loading: false } }));
    } catch (e) {
      setData((d) => ({ ...d, [keyId]: { ...(d[keyId] || {}), loading: false, error: String(e) } }));
    }
  }

  function handleSelectSector(sector) {
    setSelected({ sector, key: (keysBySector[sector] && keysBySector[sector][0]) || 'latest' });
  }

  function handleSelectKey(sector, key) {
    setSelected({ sector, key });
  }

  function renderProse(outline) {
    if (!outline || !outline.sections) return <div className="empty">No outline available</div>;
    return (
      <div className="prose-view">
        {outline.sections.map((sec, idx) => (
          <div className="prose-section" key={idx}>
            {sec.title && <h4 className="prose-title">{sec.title}</h4>}
            <div className="prose-meta">
              {sec.visual_hint && <span className="meta-hint">{sec.visual_hint}</span>}
              {sec.needs_visual ? <span className="meta-need">이미지 필요</span> : null}
            </div>
            {sec.body && (
              <>
                {Array.isArray(sec.body)
                  ? sec.body.map((p, i) => (
                      <p className="prose-paragraph" key={i}>
                        {p}
                      </p>
                    ))
                  : <p className="prose-paragraph">{sec.body}</p>}
              </>
            )}
            {sec.bullets && sec.bullets.length > 0 && (
              <ul className="prose-bullets">
                {sec.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  const currentId = selected ? idOf(selected.sector, selected.key) : null;
  const current = currentId ? data[currentId] || {} : {};

  return (
    <div className="admin-desktop-layout">
      <aside className="sidebar">
        <div className="sidebar-title">AdminPage</div>
        <div className="sectors">
          {sectors.map((s) => (
            <div key={s} className={`sector ${selected && selected.sector === s ? 'active' : ''}`}>
              <div className="sector-name" onClick={() => handleSelectSector(s)}>{s}</div>
              <div className="sector-keys">
                {(keysBySector[s] || []).map((k) => (
                  <div
                    key={k}
                    className={`sector-key ${selected && selected.sector === s && selected.key === k ? 'active' : ''}`}
                    onClick={() => handleSelectKey(s, k)}
                  >
                    {k}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-footer"></div>
      </aside>

      <main className="content-area">
        <header className="detail-header">
          <div className="meta">
            <div className="meta-title">{selected ? `${selected.sector} / ${selected.key}` : '선택하세요'}</div>
            <div className="meta-actions">
              <label className="mode-label">보기: </label>
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                <option value="prose">지문형 보기</option>
                <option value="json">JSON 보기</option>
              </select>
              <button className="refresh" onClick={() => selected && ensureLoaded(selected.sector, selected.key)}>새로고침</button>
            </div>
          </div>
        </header>

        <div className="split-panels">
          <section className="outline-panel">
            <div className="panel-inner">
              {current.loading && <div className="loading">Loading...</div>}
              {current.error && <div className="error">{String(current.error)}</div>}
              {!current.loading && !current.error && (
                <div className="outline-full">
                  {viewMode === 'json' ? (
                    <pre className="json-view">{JSON.stringify(current.latest || {}, null, 2)}</pre>
                  ) : (
                    renderProse((current.latest && current.latest.outline) || current.latest)
                  )}
                </div>
              )}
            </div>
          </section>

          <aside className="history-panel">
            <div className="history-inner">
              <h4>History</h4>
              {!current.history && <div className="empty">No history loaded</div>}
              {current.history && Array.isArray(current.history) && (
                <ul className="history-list">
                  {current.history.map((h) => (
                    <li key={h.batch_id || JSON.stringify(h)} className="history-item">
                      <div className="hist-row">
                        <div className="hist-batch">{h.batch_id}</div>
                        <div className="hist-date">{h.created_at || h.date || ''}</div>
                        <div className={`hist-delivered ${h.delivered ? 'yes' : 'no'}`}>{h.delivered ? '발행됨' : '미발행'}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}