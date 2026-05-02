// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDueCards, submitReview } from '../services/reviewService';
import ReviewCard from '../components/Flashcard/ReviewCard';
import ReviewResult from '../components/Flashcard/ReviewResult';
import AppShell from '../components/Layout/AppShell';

// ============================================================
// REVIEW PAGE — lobby เลือก mode แล้วเริ่ม session
// ============================================================
export default function ReviewPage() {
  const { deckId } = useParams();
  const navigate   = useNavigate();

  // ============================================================
  // STATE
  // ============================================================
  const [phase, setPhase]       = useState('lobby');   // lobby | session | done
  const [allCards, setAllCards] = useState([]);
  const [cards, setCards]       = useState([]);
  const [index, setIndex]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [stats, setStats]       = useState({ total: 0, good: 0, hard: 0 });

  // ============================================================
  // HOOKS
  // ============================================================
  useEffect(() => {
    fetchCounts();
  }, [deckId]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const fetchCounts = async () => {
    try {
      const all = await getDueCards(deckId, 'all');
      setAllCards(all.cards);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const startSession = (selectedCards) => {
    setCards(selectedCards);
    setIndex(0);
    setStats({ total: selectedCards.length, good: 0, hard: 0 });
    setPhase('session');
  };

  const handleGrade = async (grade) => {
    const card = cards[index];
    try {
      await submitReview(deckId, card.id, grade);
    } catch (err) {
      console.error('[handleGrade]', err.message);
    }

    setStats((prev) => ({
      ...prev,
      good: grade >= 2 ? prev.good + 1 : prev.good,
      hard: grade < 2  ? prev.hard + 1 : prev.hard,
    }));

    if (index + 1 >= cards.length) {
      setPhase('done');
    } else {
      setIndex((i) => i + 1);
    }
  };

  // ============================================================
  // RENDER — loading
  // ============================================================
  if (loading) return <div className="loading">กำลังโหลด...</div>;

  // ============================================================
  // RENDER — error
  // ============================================================
  if (error) {
    return (
      <AppShell title="รีวิว" onBack={() => navigate(-1)}>
        <div className="page">
          <p className="error-msg">{error}</p>
        </div>
      </AppShell>
    );
  }

  // ============================================================
  // RENDER — lobby
  // ============================================================
  if (phase === 'lobby') {
    const masteredCount = allCards.filter(c => (c.repetitions || 0) >= 2).length;
    const masteredPct   = allCards.length > 0 ? Math.round((masteredCount / allCards.length) * 100) : 0;

    return (
      <AppShell title="รีวิว" onBack={() => navigate(-1)}>
        <div className="page">
          <div className="rv-lobby">
            <div className="rv-lobby-icon">📚</div>
            <p className="rv-lobby-count">{allCards.length}</p>
            <p className="rv-lobby-label">คำศัพท์ทั้งหมด</p>

            <div className="rv-mastered-wrap">
              <div className="rv-mastered-bar">
                <div className="rv-mastered-fill" style={{ width: `${masteredPct}%` }} />
              </div>
              <p className="rv-mastered-text">เชี่ยวชาญ {masteredCount}/{allCards.length} · {masteredPct}%</p>
            </div>

            <button
              className="rv-start-btn pressable"
              disabled={allCards.length === 0}
              onClick={() => startSession(allCards)}
            >
              เริ่มรีวิว →
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ============================================================
  // RENDER — session
  // ============================================================
  if (phase === 'session') {
    const progressPct = Math.round((index / cards.length) * 100);
    return (
      <AppShell title="รีวิว" onBack={() => navigate(-1)}>
        <div className="page">
          <div className="rv-session-progress">
            <div className="rv-session-bar">
              <div className="rv-session-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="rv-session-count">{index + 1} / {cards.length}</span>
          </div>
          <ReviewCard card={cards[index]} onGrade={handleGrade} />
        </div>
      </AppShell>
    );
  }

  // ============================================================
  // RENDER — done
  // ============================================================
  return (
    <AppShell title="รีวิว" onBack={() => navigate(-1)}>
      <div className="page">
        <ReviewResult stats={stats} deckId={deckId} />
      </div>
    </AppShell>
  );
}
