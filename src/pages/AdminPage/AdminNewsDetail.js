import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NewsDetail from './NewsDetail';
import { adminSoftDelete } from '../../api/news';
import './AdminNewsDetail.css';

export default function AdminNewsDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const onDelete = async () => {
    const reason = window.prompt('삭제 사유를 입력하세요 (선택)', '');
    const lockHoursStr = window.prompt('락 시간(시간 단위, 기본 24)', '24');
    const lockHours = Number.isFinite(Number(lockHoursStr)) ? Number(lockHoursStr) : 24;
    try {
      setBusy(true);
      await adminSoftDelete(Number(id), { reason: reason || '', lockHours });
      setMsg('삭제 완료 (소프트 삭제)');
      setTimeout(() => {
        navigate('/admin/news-guide', { replace: true });
      }, 600);
    } catch (e) {
      console.error(e);
      setMsg('삭제 실패: 관리자 키 또는 서버 로그 확인');
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(''), 2500);
    }
  };

  return (
    <div className="admin-newsdetail-wrap">
      <NewsDetail />
      <div className="admin-action-bar">
        {msg && <span className="admin-msg">{msg}</span>}
        <button className="admin-delete-btn" disabled={busy} onClick={onDelete}>
          {busy ? '삭제중…' : '삭제'}
        </button>
      </div>
    </div>
  );
}