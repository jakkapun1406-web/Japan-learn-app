// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JLPT_LEVELS, JLPT_COLORS } from '../constants/jlptLevels';
import { getDecks, createDeck, deleteDeck, renameDeck } from '../services/deckService';
import DeckCard from '../components/Deck/DeckCard';
import CreateDeckModal from '../components/Deck/CreateDeckModal';
import AppShell from '../components/Layout/AppShell';

// ============================================================
// DECK PAGE — แสดง deck ทั้งหมดของ JLPT level นั้น
// ============================================================
export default function DeckPage() {
  const { level } = useParams();
  const navigate  = useNavigate();

  // ============================================================
  // STATE
  // ============================================================
  const [decks, setDecks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError]       = useState('');

  // ============================================================
  // HOOKS
  // ============================================================
  useEffect(() => {
    fetchDecks();
  }, [level]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const fetchDecks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDecks(level);
      setDecks(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (name, jlptLevel) => {
    const newDeck = await createDeck(name, jlptLevel);
    setDecks((prev) => [newDeck, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ลบ deck นี้ใช่ไหม? คำศัพท์ทั้งหมดจะถูกลบด้วย')) return;
    try {
      await deleteDeck(id);
      setDecks((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleRename = async (id, newName) => {
    try {
      await renameDeck(id, newName);
      setDecks((prev) => prev.map((d) => d.id === id ? { ...d, name: newName } : d));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <AppShell
      title="คำศัพท์"
      onBack={() => navigate('/dashboard')}
    >
      <div className="page">

        {/* ---- LEVEL TAB BAR ---- */}
        <div className="deck-level-tabs">
          {JLPT_LEVELS.map((lv) => (
            <button
              key={lv}
              className={`deck-level-tab${lv === level ? ' deck-level-tab--active' : ''}`}
              style={lv === level ? { background: JLPT_COLORS[lv], borderColor: JLPT_COLORS[lv] } : { borderColor: JLPT_COLORS[lv], color: JLPT_COLORS[lv] }}
              onClick={() => navigate(`/decks/${lv}`)}
            >
              {lv}
            </button>
          ))}
        </div>

        {/* ---- ADD DECK BUTTON ---- */}
        <div className="section-header" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 style={{ color: JLPT_COLORS[level] }}>JLPT {level}</h2>
          <button className="btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + สร้าง Deck
          </button>
        </div>

        {error && <p className="error-msg">{error}</p>}

        {loading ? (
          <p className="loading-text">กำลังโหลด...</p>
        ) : decks.length === 0 ? (
          <p className="empty-state">ยังไม่มี deck — กด "+ สร้าง Deck" เพื่อเริ่มต้น</p>
        ) : (
          <div className="deck-grid">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} onDelete={handleDelete} onRename={handleRename} />
            ))}
          </div>
        )}

      </div>

      {showModal && (
        <CreateDeckModal
          defaultLevel={level}
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </AppShell>
  );
}
