// src/components/BackendStatusDemo.js - 백엔드 연결 상태 데모 컴포넌트
import React from 'react';
import { useBackendStatus, BackendStatusIndicator } from '../hooks/useBackendStatus.js';
import { getQuiz, submitAnswer, getProgress, getBadges } from '../api/explore.js';

const BackendStatusDemo = () => {
  const { isConnected, isLoading, recheckStatus } = useBackendStatus();

  const testAPI = async () => {
    console.log('=== API 테스트 시작 ===');
    
    try {
      // 퀴즈 데이터 테스트
      console.log('1. 퀴즈 데이터 조회 테스트');
      const quizResult = await getQuiz(1);
      console.log('퀴즈 결과:', quizResult);
      
      // 답안 제출 테스트
      console.log('2. 답안 제출 테스트');
      const submitResult = await submitAnswer(1, 1);
      console.log('제출 결과:', submitResult);
      
      // 진행률 조회 테스트
      console.log('3. 진행률 조회 테스트');
      const progressResult = await getProgress();
      console.log('진행률 결과:', progressResult);
      
      // 뱃지 조회 테스트
      console.log('4. 뱃지 조회 테스트');
      const badgesResult = await getBadges();
      console.log('뱃지 결과:', badgesResult);
      
      console.log('=== API 테스트 완료 ===');
    } catch (error) {
      console.error('API 테스트 중 오류:', error);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔗 백엔드 연결 상태 테스트</h3>
      
      {/* 상태 표시기 */}
      <div style={{ marginBottom: '15px' }}>
        <BackendStatusIndicator showText={true} />
      </div>
      
      {/* 상세 정보 */}
      <div style={{ marginBottom: '15px' }}>
        <p><strong>연결 상태:</strong> {isLoading ? '확인 중...' : (isConnected ? '✅ 연결됨' : '🔄 더미 데이터 모드')}</p>
        <p><strong>데이터 소스:</strong> {isConnected ? '실제 백엔드 API' : '더미 데이터 (testData.js)'}</p>
      </div>
      
      {/* 버튼들 */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={recheckStatus}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 연결 상태 다시 확인
        </button>
        
        <button 
          onClick={testAPI}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🧪 API 테스트 실행
        </button>
      </div>
      
      {/* 설명 */}
      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        backgroundColor: '#e9f7ff', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <h4>💡 사용 방법:</h4>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li><strong>백엔드 연결됨:</strong> 실제 서버 API를 사용합니다</li>
          <li><strong>더미 데이터 모드:</strong> 개발용 더미 데이터를 사용합니다</li>
          <li><strong>자동 감지:</strong> 앱 시작시와 30초마다 자동으로 연결 상태를 확인합니다</li>
          <li><strong>수동 확인:</strong> "연결 상태 다시 확인" 버튼을 클릭하여 즉시 확인 가능합니다</li>
        </ul>
      </div>
    </div>
  );
};

export default BackendStatusDemo;