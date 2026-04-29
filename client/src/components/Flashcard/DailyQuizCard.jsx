// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

// ============================================================
// DAILY QUIZ CARD — พลิกบัตร + ปุ่มรู้/ไม่รู้
// Props:
//   card       — { id, word, reading, meaning, part_of_speech, jlpt_level }
//   onAnswer   — (is_correct: boolean) => void
// ============================================================
export default function DailyQuizCard({ card, onAnswer }) {
  // --- STATE ---
  const [flipped, setFlipped] = useState(false);
  const { speak } = useTextToSpeech();

  // reset เมื่อเปลี่ยนบัตร
  useEffect(() => {
    setFlipped(false);
  }, [card]);

  // --- HANDLERS ---
  const handleFlip = () => {
    if (!flipped) {
      speak(card.word, 'ja-JP');
      setFlipped(true);
    }
  };

  const handleAnswer = (is_correct) => {
    onAnswer(is_correct);
  };

  // --- RENDER ---
  return (
    <div className="dq-card-area">
      {/* ---- FLIP CARD ---- */}
      <div
        className={`dq-flashcard${flipped ? ' is-flipped' : ''}`}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
        aria-label={flipped ? 'บัตรด้านหลัง' : 'กดเพื่อดูความหมาย'}
      >
        {!flipped ? (
          // FRONT — แสดงคำภาษาญี่ปุ่น
          <div className="dq-face dq-front">
            {card.jlpt_level && (
              <span className="dq-level-badge">{card.jlpt_level}</span>
            )}
            <p className="dq-word">{card.word}</p>
            <p className="dq-hint">แตะเพื่อดูความหมาย</p>
          </div>
        ) : (
          // BACK — reading + meaning + ชนิดคำ
          <div className="dq-face dq-back">
            <p className="dq-word">{card.word}</p>
            <button
              className="dq-tts-btn"
              onClick={(e) => { e.stopPropagation(); speak(card.word, 'ja-JP'); }}
              aria-label="ฟังเสียง"
            >
              🔊
            </button>
            {card.reading && card.reading !== card.word && (
              <p className="dq-reading">{card.reading}</p>
            )}
            <p className="dq-meaning">{card.meaning}</p>
            {card.part_of_speech && (
              <span className="dq-pos">{card.part_of_speech}</span>
            )}
          </div>
        )}
      </div>

      {/* ---- ANSWER BUTTONS — ปรากฏหลังพลิก ---- */}
      {flipped && (
        <div className="dq-answer-btns">
          <button
            className="dq-answer-btn dq-answer-btn--wrong pressable"
            onClick={() => handleAnswer(false)}
          >
            ✗ ไม่รู้
          </button>
          <button
            className="dq-answer-btn dq-answer-btn--correct pressable"
            onClick={() => handleAnswer(true)}
          >
            ✓ รู้
          </button>
        </div>
      )}
    </div>
  );
}
