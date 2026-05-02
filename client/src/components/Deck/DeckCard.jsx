// ============================================================
// IMPORTS
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JLPT_COLORS } from '../../constants/jlptLevels';

// ============================================================
// DECK CARD — แสดง deck พร้อม actions
// isJlpt: true = JLPT deck (ไม่มีปุ่มลบ/แก้ไข, แสดง badge JLPT)
// ============================================================
export default function DeckCard({ deck, onDelete, onRename, isJlpt = false }) {
  const navigate = useNavigate();

  // ============================================================
  // STATE — inline rename
  // ============================================================
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(deck.name);
  const inputRef              = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(deck.id);
  };

  const startEdit = (e) => {
    e.stopPropagation();
    setDraft(deck.name);
    setEditing(true);
  };

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== deck.name) {
      onRename(deck.id, trimmed);
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(deck.name);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  // ============================================================
  // RENDER
  // ============================================================
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
        {!isJlpt && !editing && (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="btn-icon-edit" onClick={startEdit} title="แก้ไขชื่อ">✏️</button>
            <button className="btn-icon-danger" onClick={handleDelete} title="ลบ deck">✕</button>
          </div>
        )}
      </div>

      {editing ? (
        <input
          ref={inputRef}
          className="deck-name-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveEdit}
          maxLength={60}
        />
      ) : (
        <h3 className="deck-name">{deck.name}</h3>
      )}

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
