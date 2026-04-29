// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getDecks, createDeck, deleteDeck, initJlptDecks } from '../services/deckService';
import DeckCard from '../components/Deck/DeckCard';
import CreateDeckModal from '../components/Deck/CreateDeckModal';
import AppShell from '../components/Layout/AppShell';
import { JLPT_COLORS, JLPT_DESCRIPTIONS } from '../constants/jlptLevels';

// ============================================================
// JLPT LEVEL TILE — bento grid tile for each JLPT level
// ============================================================
function JlptLevelTile({ deck, onClick }) {
  const color = JLPT_COLORS[deck.jlpt_level] || 'var(--color-primary)';
  return (
    <button
      className="jlpt-tile"
      style={{ '--tile-color': color }}
      onClick={onClick}
    >
      <span className="jlpt-tile__level">{deck.jlpt_level}</span>
      <span className="jlpt-tile__desc">
        {JLPT_DESCRIPTIONS[deck.jlpt_level] || ''}
      </span>
      <span className="jlpt-tile__arrow">→</span>
    </button>
  );
}

// ============================================================
// DASHBOARD PAGE
// ============================================================
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================
  const [jlptDecks, setJlptDecks]       = useState([]);
  const [userDecks, setUserDecks]       = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [error, setError]               = useState('');

  // ============================================================
  // HANDLERS
  // ============================================================

  // โหลด deck ทั้งหมด แล้ว init JLPT decks ถ้ายังไม่มี
  const bootstrap = async () => {
    setLoadingDecks(true);
    setError('');
    try {
      const all = await getDecks();
      const jlpt = all.filter((d) => d.deck_type === 'jlpt');
      const mine = all.filter((d) => d.deck_type !== 'jlpt');

      if (jlpt.length === 0) {
        await initJlptDecks();
        const refreshed = await getDecks();
        setJlptDecks(refreshed.filter((d) => d.deck_type === 'jlpt'));
        setUserDecks(refreshed.filter((d) => d.deck_type !== 'jlpt'));
      } else {
        setJlptDecks(jlpt);
        setUserDecks(mine);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoadingDecks(false);
    }
  };

  const handleCreate = async (name, jlptLevel) => {
    const newDeck = await createDeck(name, jlptLevel);
    setUserDecks((prev) => [newDeck, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ลบ deck นี้ใช่ไหม? คำศัพท์ทั้งหมดจะถูกลบด้วย')) return;
    try {
      await deleteDeck(id);
      setUserDecks((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // ============================================================
  // HOOKS
  // ============================================================
  useEffect(() => {
    bootstrap();
  }, []);

  // ============================================================
  // DERIVED VALUES
  // ============================================================
  const displayName = user?.user_metadata?.display_name || user?.email || 'ผู้เรียน';

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <AppShell title="Japanese Learning">
      <div className="dashboard-page">

        {/* ---- HERO CARD ---- */}
        <div className="hero-card">
          <div className="hero-card__body">
            <p className="hero-card__eyebrow">おはようございます</p>
            <h1 className="hero-card__title">{displayName}</h1>
            <p className="hero-card__sub">เริ่มทบทวนวันนี้เลย</p>
          </div>
          <div className="hero-card__deco" aria-hidden="true">日本語</div>
        </div>

        {error && (
          <div className="dashboard-section">
            <p className="error-msg">{error}</p>
          </div>
        )}

        {/* ---- JLPT DECKS ---- */}
        <div className="dashboard-section">
          <h2>JLPT Decks</h2>
          <p className="section-subtitle">คลังคำศัพท์มาตรฐาน — เลือกระดับที่ต้องการ</p>

          {loadingDecks ? (
            <p className="loading-text">กำลังโหลด...</p>
          ) : (
            <div className="jlpt-level-grid">
              {jlptDecks
                .sort((a, b) => a.jlpt_level.localeCompare(b.jlpt_level))
                .map((deck) => (
                  <JlptLevelTile
                    key={deck.id}
                    deck={deck}
                    onClick={() => navigate(`/decks/${deck.jlpt_level}`)}
                  />
                ))}
            </div>
          )}
        </div>

        {/* ---- MY DECKS ---- */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>ห้องเรียนของฉัน</h2>
            <button className="btn-primary btn-sm" onClick={() => setShowModal(true)}>
              + สร้าง Deck
            </button>
          </div>

          {loadingDecks ? (
            <p className="loading-text">กำลังโหลด...</p>
          ) : userDecks.length === 0 ? (
            <p className="empty-state">ยังไม่มี deck — กด "+ สร้าง Deck" เพื่อเริ่มต้น</p>
          ) : (
            <div className="deck-grid">
              {userDecks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  isJlpt={false}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {showModal && (
        <CreateDeckModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </AppShell>
  );
}
