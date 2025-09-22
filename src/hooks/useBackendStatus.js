// src/hooks/useBackendStatus.js - 백엔드 연결 상태 관리 훅
import { useState, useEffect } from 'react';
import { isBackendOnline, recheckBackendConnection } from '../api/explore.js';

export const useBackendStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 초기 상태 확인
    const checkInitialStatus = async () => {
      setIsLoading(true);
      const connected = await recheckBackendConnection();
      setIsConnected(connected);
      setIsLoading(false);
    };

    checkInitialStatus();

    // 주기적으로 백엔드 상태 확인 (30초마다)
    const interval = setInterval(async () => {
      const connected = await recheckBackendConnection();
      setIsConnected(connected);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 수동으로 연결 상태 재확인
  const recheckStatus = async () => {
    setIsLoading(true);
    const connected = await recheckBackendConnection();
    setIsConnected(connected);
    setIsLoading(false);
    return connected;
  };

  return {
    isConnected,
    isLoading,
    recheckStatus,
    // 현재 상태 즉시 확인 (캐시된 값)
    isOnline: isBackendOnline()
  };
};

// 백엔드 상태 표시용 컴포넌트
export const BackendStatusIndicator = ({ showText = true, className = '' }) => {
  const { isConnected, isLoading, recheckStatus } = useBackendStatus();

  if (isLoading) {
    return (
      <div className={`backend-status checking ${className}`}>
        <span className="status-icon">🔄</span>
        {showText && <span>연결 확인 중...</span>}
      </div>
    );
  }

  return (
    <div 
      className={`backend-status ${isConnected ? 'connected' : 'disconnected'} ${className}`}
      onClick={recheckStatus}
      style={{ cursor: 'pointer' }}
      title="클릭하여 연결 상태 다시 확인"
    >
      <span className="status-icon">
        {isConnected ? '✅' : '🔄'}
      </span>
      {showText && (
        <span>
          {isConnected ? '백엔드 연결됨' : '더미 데이터 모드'}
        </span>
      )}
    </div>
  );
};