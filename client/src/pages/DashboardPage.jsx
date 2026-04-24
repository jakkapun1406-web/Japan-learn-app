// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getDecks, createDeck, deleteDeck, initJlptDecks } from '../services/deckService';
import DeckCard from '../components/Deck/DeckCard';
import CreateDeckModal from '../components/Deck/CreateDeckModal';

// ============================================================
// DASHBOARD PAGE
// ============================================================
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [jlptDecks, setJlptDecks]     = useState([]);
  const [userDecks, setUserDecks]     = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [error, setError]             = useState('');

  // --- HOOKS ---
  useEffect(() => {
    bootstrap();
  }, []);

  // --- HANDLERS ---

  // โหลด deck ทั้งหมด แล้ว init JLPT decks ถ้ายังไม่มี
  const bootstrap = async () => {
    setLoadingDecks(true);
    setError('');
    try {
      const all = await getDecks();
      const jlpt = all.filter((d) => d.deck_type === 'jlpt');
      const user = all.filter((d) => d.deck_type !== 'jlpt');

      if (jlpt.length === 0) {
        // สร้าง JLPT decks ครั้งแรก แล้ว reload
        await initJlptDecks();
        const refreshed = await getDecks();
        setJlptDecks(refreshed.filter((d) => d.deck_type === 'jlpt'));
        setUserDecks(refreshed.filter((d) => d.deck_type !== 'jlpt'));
      } else {
        setJlptDecks(jlpt);
        setUserDecks(user);
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

        {error && <p className="error-msg">{error}</p>}

        {/* ---- JLPT DECKS ---- */}
        <section>
          <h2>JLPT Decks</h2>
          <p className="section-subtitle">คลังคำศัพท์มาตรฐาน JLPT พร้อมใช้งาน</p>

          {loadingDecks ? (
            <p className="loading-text">กำลังโหลด...</p>
          ) : (
            <div className="deck-grid">
              {jlptDecks
                .sort((a, b) => a.jlpt_level.localeCompare(b.jlpt_level))
                .map((deck) => (
                  <DeckCard key={deck.id} deck={deck} isJlpt onDelete={() => {}} />
                ))}
            </div>
          )}
        </section>

        {/* ---- MY DECKS ---- */}
        <section>
          <div className="section-header">
            <h2>ห้องเรียนของฉัน</h2>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
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
                <DeckCard key={deck.id} deck={deck} isJlpt={false} onDelete={handleDelete} />
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
