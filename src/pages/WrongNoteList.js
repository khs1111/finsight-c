
import React from "react";
import { useNavigate } from "react-router-dom";

export default function WrongNoteList({ wrongNotes, statistics, onCardClick }) {
  const navigate = useNavigate();
  const notes = Array.isArray(wrongNotes) ? wrongNotes : [];

  return (
    <div className="wrong-note-list-container">
      <div className="wrong-note-list-header">
        총 틀린 문제 {statistics?.totalCount ?? notes.length}개
      </div>
      <div className="wrong-note-list-cards">
        {notes.length === 0 ? (
          <div className="wrong-note-list-empty">오답노트가 없습니다.</div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className="wrong-note-card"
              onClick={() => onCardClick ? onCardClick(note.questionId) : navigate(`/quiz/${note.questionId}?readonly=1`)}
            >
              <div className="wrong-note-card-title">
                {note.questionText}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
