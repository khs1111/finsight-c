// 퀴즈 더미 데이터

export const dummyQuizzes = [
  {
    id: 1,
    type: 'normal',
    question: '다음 중 예금과 적금의 차이점으로 올바른 것은?',
    options: [
      { id: 1, text: '예금은 언제든 자유롭게 입출금 가능하고, 적금은 일정 기간 동안 매월 일정 금액을 넣어야 한다', isCorrect: true },
      { id: 2, text: '예금은 이자율이 높고, 적금은 이자율이 낮다', isCorrect: false },
      { id: 3, text: '예금은 원금 보장이 안 되고, 적금은 원금이 보장된다', isCorrect: false },
      { id: 4, text: '예금과 적금은 완전히 동일한 상품이다', isCorrect: false }
    ],
    correctAnswer: 0,
    explanation: '예금은 자유입출금이 가능한 상품이고, 적금은 일정 기간 동안 매월 정해진 금액을 납입하는 상품입니다.',
    hint: '예금과 적금의 기본적인 특성을 생각해보세요.',
    level: 'beginner',
    topic: '은행',
    subTopic: '예금/적금'
  },
  {
    id: 2,
    type: 'normal',
    question: '신용카드 사용 시 주의해야 할 점으로 가장 적절한 것은?',
    options: [
      { id: 1, text: '무조건 현금보다 카드를 사용하는 것이 좋다', isCorrect: false },
      { id: 2, text: '결제일을 놓쳐도 큰 문제가 되지 않는다', isCorrect: false },
      { id: 3, text: '본인의 상환 능력을 고려하여 적절히 사용해야 한다', isCorrect: true },
      { id: 4, text: '카드 사용액에는 제한이 없다', isCorrect: false }
    ],
    correctAnswer: 2,
    explanation: '신용카드는 미래의 소득으로 현재 소비를 하는 것이므로, 본인의 상환 능력을 고려하여 사용해야 합니다.',
    hint: '신용카드의 본질적인 특성을 생각해보세요.',
    level: 'beginner',
    topic: '카드',
    subTopic: '신용카드'
  },
  {
    id: 3,
    type: 'normal',
    question: '다음 중 소득공제에 해당하는 것은?',
    options: [
      { id: 1, text: '의료비 세액공제', isCorrect: false },
      { id: 2, text: '교육비 세액공제', isCorrect: false },
      { id: 3, text: '인적공제', isCorrect: true },
      { id: 4, text: '기부금 세액공제', isCorrect: false }
    ],
    correctAnswer: 2,
    explanation: '인적공제는 소득공제 항목입니다. 의료비, 교육비, 기부금은 세액공제 항목입니다.',
    hint: '소득공제와 세액공제의 차이를 생각해보세요.',
    level: 'intermediate',
    topic: '세금/절세',
    subTopic: '소득세'
  },
  {
    id: 4,
    type: 'articleImage',
    question: '다음 뉴스 기사를 보고 답하세요. 한국은행이 기준금리를 인상했을 때 나타날 수 있는 현상은?',
    image: '/assets/q4-article.png',
    options: [
      { id: 1, text: '예금 이자율 상승, 대출 이자율 하락', isCorrect: false },
      { id: 2, text: '예금 이자율 하락, 대출 이자율 상승', isCorrect: false },
      { id: 3, text: '예금 이자율 상승, 대출 이자율 상승', isCorrect: true },
      { id: 4, text: '예금 이자율 하락, 대출 이자율 하락', isCorrect: false }
    ],
    correctAnswer: 2,
    explanation: '기준금리가 인상되면 일반적으로 예금 이자율과 대출 이자율이 모두 상승합니다.',
    hint: '기준금리는 시중 금리의 기준이 됩니다.',
    level: 'intermediate',
    topic: '은행',
    subTopic: '금융권'
  }
];

// 학습 진도 더미 데이터
export const dummyProgress = {
  totalProgress: 75,
  topicProgress: {
    '은행': 90,
    '카드': 60,
    '세금/절세': 80,
    '투자': 45
  }
};

// 뱃지 더미 데이터
export const dummyBadges = [
  {
    id: 1,
    name: '은행 마스터',
    description: '은행 관련 퀴즈를 모두 완료했습니다',
    icon: '🏦',
    achieved: true,
    achievedAt: '2024-03-15'
  },
  {
    id: 2,
    name: '카드 전문가',
    description: '카드 관련 퀴즈 80% 이상 완료',
    icon: '💳',
    achieved: true,
    achievedAt: '2024-03-20'
  },
  {
    id: 3,
    name: '투자 입문자',
    description: '투자 관련 첫 퀴즈 완료',
    icon: '📈',
    achieved: false,
    achievedAt: null
  },
  {
    id: 4,
    name: '절세 달인',
    description: '세금/절세 관련 퀴즈를 모두 완료했습니다',
    icon: '💰',
    achieved: false,
    achievedAt: null
  }
];

// 주제별 퀴즈 개수 더미 데이터
export const dummyTopicStats = {
  '은행': { total: 20, completed: 18 },
  '카드': { total: 15, completed: 9 },
  '세금/절세': { total: 12, completed: 10 },
  '투자': { total: 25, completed: 5 }
};

// API 응답 형태의 더미 데이터
export const dummyQuizResponse = {
  success: true,
  data: {
    questions: dummyQuizzes,
    totalCount: dummyQuizzes.length
  },
  message: 'Quiz loaded successfully'
};

// 답안 제출 응답 더미 데이터  
export const dummySubmitResponse = {
  success: true,
  data: {
    correct: true,
    score: 85,
    explanation: '정답입니다! 예금과 적금의 차이점을 잘 이해하고 계시네요.',
    nextQuizId: 2
  },
  message: 'Answer submitted successfully'
};

// ========================================
// 🔄 기존 형태 더미 데이터 (호환성 유지)
// ========================================

// 기존 getQuestions용 더미 데이터
export const dummyQuestionsData = [
  {
    id: 1,
    stemMd: "## 예금과 적금의 차이\n\n다음 중 예금과 적금의 차이점으로 올바른 것은?",
    answerExplanationMd: "## 해설\n\n예금은 자유입출금이 가능한 상품이고, 적금은 일정 기간 동안 매월 정해진 금액을 납입하는 상품입니다.\n\n- **예금**: 언제든 자유롭게 입출금 가능\n- **적금**: 정해진 기간 동안 매월 일정 금액 납입",
    hintMd: "**힌트**: 예금과 적금의 기본적인 특성을 생각해보세요.",
    teachingExplainerMd: "## 예금과 적금 알아보기\n\n### 예금의 특징\n- 자유입출금 가능\n- 필요할 때 언제든 돈을 찾을 수 있음\n- 대표적으로 보통예금, 자유적금\n\n### 적금의 특징\n- 일정 기간 동안 매월 정해진 금액 납입\n- 중도해지 시 불이익 발생 가능\n- 목돈 마련에 유리",
    solvingKeypointsMd: "**핵심 포인트**\n\n1. 예금 = 자유입출금\n2. 적금 = 정기납입\n3. 둘 다 원금보장 상품",
    options: [
      { id: 1, label: "A", contentMd: "예금은 언제든 자유롭게 입출금 가능하고, 적금은 일정 기간 동안 매월 일정 금액을 넣어야 한다", isCorrect: true },
      { id: 2, label: "B", contentMd: "예금은 이자율이 높고, 적금은 이자율이 낮다", isCorrect: false },
      { id: 3, label: "C", contentMd: "예금은 원금 보장이 안 되고, 적금은 원금이 보장된다", isCorrect: false },
      { id: 4, label: "D", contentMd: "예금과 적금은 완전히 동일한 상품이다", isCorrect: false }
    ]
  },
  {
    id: 2,
    stemMd: "## 기준금리의 영향\n\n한국은행이 기준금리를 **인상**했을 때 나타날 수 있는 현상은?",
    answerExplanationMd: "## 해설\n\n기준금리가 인상되면 시중 이자율 전반이 상승합니다.\n\n- **예금 이자율 상승**: 은행이 더 높은 이자를 제공\n- **대출 이자율 상승**: 대출받을 때 더 많은 이자 부담",
    hintMd: "**힌트**: 기준금리는 모든 이자율의 기준이 됩니다.",
    teachingExplainerMd: "## 기준금리와 시중 이자율\n\n### 기준금리란?\n- 한국은행이 정하는 정책금리\n- 모든 이자율의 기준이 됨\n\n### 기준금리 인상 시\n- 예금 이자율 ↑\n- 대출 이자율 ↑\n- 물가 안정 효과\n- 경기 진정 효과",
    solvingKeypointsMd: "**핵심 포인트**\n\n1. 기준금리 ↑ → 모든 이자율 ↑\n2. 예금자에게 유리\n3. 대출자에게 불리",
    options: [
      { id: 1, label: "A", contentMd: "예금 이자율 상승, 대출 이자율 하락", isCorrect: false },
      { id: 2, label: "B", contentMd: "예금 이자율 하락, 대출 이자율 상승", isCorrect: false },
      { id: 3, label: "C", contentMd: "예금 이자율 상승, 대출 이자율 상승", isCorrect: true },
      { id: 4, label: "D", contentMd: "예금 이자율 하락, 대출 이자율 하락", isCorrect: false }
    ]
  },
  {
    id: 3,
    stemMd: "## 투자의 기본원칙\n\n투자할 때 **분산투자**를 하는 이유는?",
    answerExplanationMd: "## 해설\n\n분산투자는 투자 리스크를 줄이는 가장 기본적인 방법입니다.\n\n- **한 곳에 집중투자**: 큰 손실 위험\n- **여러 곳에 분산투자**: 리스크 분산",
    hintMd: "**힌트**: '계란을 한 바구니에 담지 마라'는 격언을 생각해보세요.",
    teachingExplainerMd: "## 분산투자의 원리\n\n### 분산투자란?\n- 투자 자금을 여러 자산에 나누어 투자\n- 리스크 분산 효과\n\n### 분산 방법\n- 종목 분산\n- 시간 분산\n- 지역 분산\n- 통화 분산",
    solvingKeypointsMd: "**핵심 포인트**\n\n1. 분산투자 = 리스크 분산\n2. 한 곳에 몰빵 금지\n3. 안정적인 투자의 기본",
    options: [
      { id: 1, label: "A", contentMd: "투자 수익률을 극대화하기 위해", isCorrect: false },
      { id: 2, label: "B", contentMd: "투자 리스크를 분산시키기 위해", isCorrect: true },
      { id: 3, label: "C", contentMd: "세금을 절약하기 위해", isCorrect: false },
      { id: 4, label: "D", contentMd: "투자 시간을 단축하기 위해", isCorrect: false }
    ]
  }
];