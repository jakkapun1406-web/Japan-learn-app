// ============================================================
// VOCAB CARD — แสดงคำศัพท์ 1 คำ
// ============================================================
export default function VocabCard({ card, onDelete }) {
  // --- RENDER ---
  return (
    <div className="vocab-card">
      <div className="vocab-main">
        <span className="vocab-word">{card.word}</span>
        <span className="vocab-reading">{card.reading}</span>
        <span className="vocab-meaning">{card.meaning}</span>
        {card.part_of_speech && (
          <span className="vocab-pos">{card.part_of_speech}</span>
        )}
      </div>
      <button
        className="btn-icon-danger"
        onClick={() => onDelete(card.id)}
        title="ลบคำศัพท์"
      >
        ✕
      </button>
    </div>
  );
}
