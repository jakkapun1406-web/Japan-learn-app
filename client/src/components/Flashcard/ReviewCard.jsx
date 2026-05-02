// ============================================================
// IMPORTS
// ============================================================
import { useState } from 'react';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

// ============================================================
// REVIEW CARD — 3D flip card + grade buttons after reveal
// ============================================================
export default function ReviewCard({ card, onGrade }) {
  // ============================================================
  // STATE
  // ============================================================
  const [flipped, setFlipped] = useState(false);
  const { speak } = useTextToSpeech();

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleFlip = () => {
    if (!flipped) setFlipped(true);
  };

  const handleGrade = (grade) => {
    setFlipped(false);
    onGrade(grade);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="review-area">
      {/* 3D flip scene */}
      <div className="card-scene" onClick={handleFlip} style={{ cursor: flipped ? 'default' : 'pointer' }}>
        <div className={`card-inner ${flipped ? 'flipped' : ''}`}>

          {/* FRONT — word only */}
          <div className="card-face card-face-front">
            <div className="card-face-front-content">
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
          </div>

          {/* BACK — reading + meaning + part of speech */}
          <div className="card-face card-back">
            <div className="card-face-back-content">
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
          </div>

        </div>
      </div>

      {/* Grade buttons — visible after flip */}
      {flipped && (
        <div className="rv-grade-row">
          <button className="rv-grade-btn rv-grade-no" onClick={() => handleGrade(1)}>
            ไม่รู้
          </button>
          <button className="rv-grade-btn rv-grade-yes" onClick={() => handleGrade(3)}>
            รู้ ✓
          </button>
        </div>
      )}
    </div>
  );
}
