// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { JLPT_LEVELS, JLPT_COLORS, JLPT_DESCRIPTIONS } from '../constants/jlptLevels';
import { getDecks, createDeck, deleteDeck } from '../services/deckService';
import DeckCard from '../components/Deck/DeckCard';
import CreateDeckModal from '../components/Deck/CreateDeckModal';

// ============================================================
// DASHBOARD PAGE
// ============================================================
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [decks, setDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // --- HOOKS ---
  useEffect(() => {
    fetchDecks();
  }, []);

  // --- HANDLERS ---
  const fetchDecks = async () => {
    setLoadingDecks(true);
    setError('');
    try {
      const data = await getDecks();
      setDecks(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoadingDecks(false);
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // --- RENDER ---
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Japanese App</h1>
        <div className="header-actions">
          <span>สวัสดี, {user?.user_metadata?.display_name || user?.email}</span>
          <button onClick={handleLogout} className="btn-secondary">ออกจากระบบ</button>
        </div>
      </header>

      <main className="dashboard-content">

        {/* ---- JLPT LEVELS ---- */}
        <section>
          <h2>JLPT Decks</h2>
          <p>เลือกระดับที่ต้องการเรียน</p>
          <div className="level-grid">
            {JLPT_LEVELS.map((level) => (
              <div
                key={level}
                className="level-card"
                style={{ borderColor: JLPT_COLORS[level] }}
                onClick={() => navigate(`/decks/${level}`)}
              >
                <h3 style={{ color: JLPT_COLORS[level] }}>{level}</h3>
                <p>{JLPT_DESCRIPTIONS[level]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- MY DECKS ---- */}
        <section>
          <div className="section-header">
            <h2>ห้องเรียนของฉัน</h2>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + สร้าง Deck
            </button>
          </div>

          {error && <p className="error-msg">{error}</p>}

          {loadingDecks ? (
            <p className="loading-text">กำลังโหลด...</p>
          ) : decks.length === 0 ? (
            <p className="empty-state">ยังไม่มี deck — กด "+ สร้าง Deck" เพื่อเริ่มต้น</p>
          ) : (
            <div className="deck-grid">
              {decks.map((deck) => (
                <DeckCard key={deck.id} deck={deck} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>

      </main>

      {showModal && (
        <CreateDeckModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
