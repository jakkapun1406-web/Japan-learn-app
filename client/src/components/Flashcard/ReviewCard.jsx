// ============================================================
// IMPORTS
// ============================================================
import { useState } from 'react';
import { GRADE_LABELS } from '../../utils/srsAlgorithm';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

// ============================================================
// REVIEW CARD — แสดงการ์ดและปุ่ม grade หลังพลิก
// ============================================================
export default function ReviewCard({ card, onGrade }) {
  // --- STATE ---
  const [flipped, setFlipped] = useState(false);
  const { speak } = useTextToSpeech();

  // --- HANDLERS ---
  const handleGrade = (grade) => {
    setFlipped(false);
    onGrade(grade);
  };

  // --- RENDER ---
  return (
    <div className="review-area">
      <div
        className={`review-card ${flipped ? 'is-flipped' : ''}`}
        onClick={() => !flipped && setFlipped(true)}
      >
        {!flipped ? (
          // FRONT — word เท่านั้น
          <div className="review-face review-front">
            <p className="review-word">{card.word}</p>
            <button
              className="btn-tts"
              onClick={(e) => { e.stopPropagation(); speak(card.word); }}
              title="ฟังเสียง"
            >
              🔊
            </button>
            <p className="review-hint">แตะเพื่อดูคำตอบ</p>
          </div>
        ) : (
          // BACK — reading + meaning + ชนิดคำ
          <div className="review-face review-back">
            <p className="review-word">{card.word}</p>
            <button
              className="btn-tts"
              onClick={(e) => { e.stopPropagation(); speak(card.word); }}
              title="ฟังเสียง"
            >
              🔊
            </button>
            <p className="review-reading">{card.reading}</p>
            <p className="review-meaning">{card.meaning}</p>
            {card.part_of_speech && (
              <span className="review-pos">{card.part_of_speech}</span>
            )}
          </div>
        )}
      </div>

      {flipped && (
        <div className="grade-buttons">
          {[0, 1, 2, 3].map((grade) => (
            <button
              key={grade}
              className={`grade-btn grade-btn-${grade}`}
              onClick={() => handleGrade(grade)}
            >
              {GRADE_LABELS[grade]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
