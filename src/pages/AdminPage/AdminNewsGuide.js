import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminNewsGuide.css';
import NewsDetail from '../NewsDetail';
import {
  getNewsData,
  CATEGORY_MAPPING,
  adminSoftDelete,
} from '../../api/news';

const CATEGORIES = ['오늘의 뉴스', '금융', '증권', '글로벌 경제', '생활 경제'];

export default function AdminNewsGuide() {
  const navigate = useNavigate();
  const params = useParams();
  const routeId = params.id ? Number(params.id) : null;
  const [activeCategory, setActiveCategory] = useState('오늘의 뉴스');
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  // Removed: detail, setDetail, detailLoading, setDetailLoading, detailError, setDetailError

  const [deleting, setDeleting] = useState({}); // id -> true while deleting
  const [adminMsg, setAdminMsg] = useState('');

  useEffect(() => {
    loadList(activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // When URL :id changes, set selectedId
  useEffect(() => {
    if (routeId) {
      setSelectedId(routeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  async function loadList(category) {
    try {
      setListLoading(true);
      setListError('');
      setSelectedId(null);
      const data = await getNewsData(category, 0, 20);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setListError('목록을 불러오지 못했습니다');
      console.error(e);
    } finally {
      setListLoading(false);
    }
  }

  // Removed: openDetail

  async function handleDelete(articleId) {
    const reason = window.prompt('삭제 사유를 입력하세요 (선택)', '');
    const lockHoursStr = window.prompt('락 시간(시간 단위, 기본 24)', '24');
    const lockHours = Number.isFinite(Number(lockHoursStr)) ? Number(lockHoursStr) : 24;
    try {
      setDeleting((d) => ({ ...d, [articleId]: true }));
      setAdminMsg('');
      await adminSoftDelete(articleId, { reason: reason || '', lockHours });
      setItems((arr) => arr.filter((it) => it.id !== articleId));
      if (selectedId === articleId) {
        setSelectedId(null);
      }
      setAdminMsg('삭제되었습니다 (소프트 삭제).');
    } catch (e) {
      console.error(e);
      setAdminMsg('삭제 실패: 관리자 키 설정 또는 서버 응답을 확인하세요');
    } finally {
      setDeleting((d) => ({ ...d, [articleId]: false }));
      setTimeout(() => setAdminMsg(''), 3000);
    }
  }

  return (
    <div className="ng-layout">
      <aside className="ng-sidebar">
        <div className="ng-title">News Guide Admin</div>
        <div className="ng-cats">
          {CATEGORIES.map((c) => (
            <div
              key={c}
              className={`ng-cat ${activeCategory === c ? 'active' : ''}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </div>
          ))}
        </div>
        <div className="ng-hint">/admin/news-guide</div>
      </aside>

      <main className="ng-content">
        <header className="ng-header">
          <div className="ng-header-title">{CATEGORY_MAPPING[activeCategory] || activeCategory}</div>
          {adminMsg && <div className="ng-admin-msg">{adminMsg}</div>}
        </header>

        <div className="ng-split">
          <section className="ng-detail-panel">
            <div className="ng-detail-inner">
              {!selectedId && <div className="ng-empty">항목을 선택하세요</div>}
              {selectedId && (
                <div className="ng-detail-embed">
                  {/* Render the exact user-facing detail UI with the same data via route params */}
                  <NewsDetail />
                </div>
              )}
            </div>
          </section>

          <aside className="ng-list-panel">
            {listLoading && <div className="ng-loading">불러오는 중…</div>}
            {listError && <div className="ng-error">{listError}</div>}
            {!listLoading && !listError && (
              <ul className="ng-list">
                {items.map((it) => (
                  <li key={it.id} className={`ng-card ${selectedId === it.id ? 'selected' : ''}`}>
                    <div className="ng-card-main" onClick={() => navigate(`/admin/news-guide/${it.id}`)}>
                      <div className="ng-card-title">{typeof it.title === 'string' ? it.title : JSON.stringify(it.title)}</div>
                      <div className="ng-card-desc">{typeof it.description === 'string' ? it.description : (it.description ? JSON.stringify(it.description) : '')}</div>
                    </div>
                    <div className="ng-card-actions">
                      <button
                        className="ng-delete"
                        disabled={!!deleting[it.id]}
                        onClick={() => handleDelete(it.id)}
                        title="소프트 삭제"
                      >
                        {deleting[it.id] ? '삭제 중…' : '삭제'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}