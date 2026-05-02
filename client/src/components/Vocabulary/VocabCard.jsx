// ============================================================
// IMPORTS
// ============================================================
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

// ============================================================
// VOCAB CARD — แสดงคำศัพท์ 1 คำ
// ============================================================
export default function VocabCard({ card, onDelete, onEdit }) {
  const { speak } = useTextToSpeech();

  // --- RENDER ---
  return (
    <div className="vocab-card">
      <div className="vocab-main">
        <div className="vocab-top-row">
          <span className="vocab-word">{card.word}</span>
          <span className="vocab-reading">{card.reading}</span>
        </div>
        <span className="vocab-meaning">{card.meaning}</span>
      </div>
      <div className="vocab-right">
        {card.part_of_speech && (
          <span className="vocab-pos">{card.part_of_speech}</span>
        )}
        <div className="vocab-actions">
          <button
            className="btn-tts"
            onClick={() => speak(card.word)}
            title="ฟังเสียง"
          >
            🔊
          </button>
          <button
            className="btn-icon"
            onClick={() => onEdit(card)}
            title="แก้ไขคำศัพท์"
          >
            ✏️
          </button>
          <button
            className="btn-icon-danger"
            onClick={() => onDelete(card.id)}
            title="ลบคำศัพท์"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
