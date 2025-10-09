// 백엔드 연결 테스트 컴포넌트
import React, { useState, useEffect } from 'react';
import { getQuestions, submitAnswer } from '../../api/explore';

const BackendTest = () => {
  const [quizData, setQuizData] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    testServerConnection();
  }, []);

  const testServerConnection = async () => {
    // 퀴즈 데이터 조회 테스트
    const result = await getQuestions({ levelId: 1 });
    if (result?.questions) {
      setQuizData({ title: `Level 1 Quiz`, questions: result.questions, quizId: result.quizId });
    }
  };

  const testSubmitAnswer = async () => {
    if (!quizData?.questions?.[0]) return;
    const question = quizData.questions[0];
    const firstOption = question.options?.[0];
    if (firstOption) {
      const result = await submitAnswer({ quizId: quizData.quizId, questionId: question.id, selectedOptionId: firstOption.id });
      setTestResult(result);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f5f5f5', 
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <h3>🔗 백엔드 연결 테스트</h3>

      {quizData && (
        <div style={{ marginBottom: '10px' }}>
          <strong>✅ 퀴즈 데이터 로드 성공:</strong>
          <div style={{ marginLeft: '20px', fontSize: '14px' }}>
            <div>제목: {quizData.title}</div>
            <div>문제 수: {quizData.questions?.length || 0}개</div>
            {quizData.questions?.[0] && (
              <div>첫 번째 문제: {quizData.questions[0].stemMd}</div>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={testSubmitAnswer}
        disabled={!quizData?.questions?.[0]}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        답안 제출 테스트
      </button>

      <button 
        onClick={testServerConnection}
        style={{
          padding: '8px 16px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        다시 테스트
      </button>

      {testResult && (
        <div style={{ marginTop: '10px', padding: '10px', background: '#e9ecef' }}>
          <strong>답안 제출 결과:</strong>
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default BackendTest;