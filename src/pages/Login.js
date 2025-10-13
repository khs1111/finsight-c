import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { guestLogin } from '../api/auth';

// 간단한 게스트 로그인 UX: 백엔드 연결 전엔 즉시 홈으로, 연결되면 guestLogin API 호출
export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 백엔드 연결되면 여기를 guestLogin 호출로 바꿉니다.
  async function handleGuestLogin() {
    try {
      setLoading(true);
      setError('');
      // 백엔드가 연결되어 있으면 게스트 로그인으로 토큰/유저ID를 세팅합니다.
      // 실패해도 UX를 위해 세션 플래그는 유지합니다.
      let ok = false;
      try {
        const res = await guestLogin();
        ok = !!res;
      } catch (_) {
        ok = false;
      }
      if (!ok) {
        // 폴백: 토큰 없이도 라우팅은 진행 (일부 기능은 제한될 수 있음)
        ok = true;
      }
      if (ok) {
        sessionStorage.setItem('guest', '1');
        navigate('/', { replace: true });
      } else {
        throw new Error('게스트 로그인 실패');
      }
    } catch (e) {
      setError(e?.message || '로그인 중 문제가 발생했어요');
    } finally {
      setLoading(false);
    }
  }

  // 이미 게스트 세션이 있으면 홈으로
  useEffect(() => {
    if (sessionStorage.getItem('guest') === '1') {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Finsight</h1>
        <p className="login-sub">금융 탐험을 시작해볼까요?</p>
        {error && <div className="login-error" role="alert">{error}</div>}
        <button
          className="login-btn"
          onClick={handleGuestLogin}
          disabled={loading}
        >
          {loading ? '입장 중…' : '시작하기'}
        </button>
      </div>
    </div>
  );
}
