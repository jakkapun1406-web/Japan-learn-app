// ============================================================
// IMPORTS
// ============================================================
import { useNavigate } from 'react-router-dom';
import { JLPT_COLORS } from '../../constants/jlptLevels';

// ============================================================
// DECK CARD — แสดง deck พร้อม actions
// isJlpt: true = JLPT deck (ไม่มีปุ่มลบ, แสดง badge JLPT)
// ============================================================
export default function DeckCard({ deck, onDelete, isJlpt = false }) {
  const navigate = useNavigate();

  // --- HANDLERS ---
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(deck.id);
  };

  // --- RENDER ---
  return (
    <div
      className={`deck-card${isJlpt ? ' jlpt-deck' : ''}`}
      style={{ borderColor: JLPT_COLORS[deck.jlpt_level] }}
    >
      <div className="deck-card-top">
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span className="deck-badge" style={{ background: JLPT_COLORS[deck.jlpt_level] }}>
            {deck.jlpt_level}
          </span>
          {isJlpt && <span className="badge-jlpt">JLPT</span>}
        </div>
        {!isJlpt && (
          <button className="btn-icon-danger" onClick={handleDelete} title="ลบ deck">✕</button>
        )}
      </div>

      <h3 className="deck-name">{deck.name}</h3>

      <div className="deck-card-actions">
        <button
          className="btn-secondary"
          onClick={() => navigate(`/decks/${deck.id}/vocab?level=${deck.jlpt_level}`)}
        >
          คำศัพท์
        </button>
        <button
          className="btn-primary"
          onClick={() => navigate(`/decks/${deck.id}/review`)}
        >
          รีวิว
        </button>
      </div>
    </div>
  );
}
