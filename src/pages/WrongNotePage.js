import React, { useState } from "react";
import WrongNoteList from "./WrongNoteList";
import QuizQuestion from "../components/explore/QuizQuestion";
import { getWrongNotes, getQuizById } from "../api/explore";

export default function WrongNotePage() {
  const [wrongNotes, setWrongNotes] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    async function fetchWrongNotes() {
      setLoading(true);
      try {
        const res = await getWrongNotes();
        setWrongNotes(res.wrongNotes || []);
        setStatistics(res.statistics || {});
      } finally {
        setLoading(false);
      }
    }
    fetchWrongNotes();
  }, []);

  async function handleCardClick(questionId) {
    setSelectedQuizId(questionId);
    setLoading(true);
    try {
      const quiz = await getQuizById(questionId);
      setQuizData(quiz);
    } finally {
      setLoading(false);
    }
  }

  function handleCloseQuiz() {
    setSelectedQuizId(null);
    setQuizData(null);
  }

  return (
    <div className="wrong-note-page-container">
      {loading && <div className="loading">불러오는 중...</div>}
      {!selectedQuizId ? (
        <WrongNoteList
          wrongNotes={wrongNotes}
          statistics={statistics}
          onCardClick={handleCardClick}
        />
      ) : (
        <div className="quiz-modal">
          <button className="close-btn" onClick={handleCloseQuiz}>닫기</button>
          <QuizQuestion
            quiz={quizData}
            readonly={true}
          />
        </div>
      )}
    </div>
  );
}
