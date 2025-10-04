import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

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
      // TODO: backend ready 시 아래 주석 해제
      // const ok = await guestLogin();
      const ok = true; // 현재는 바로 통과
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
