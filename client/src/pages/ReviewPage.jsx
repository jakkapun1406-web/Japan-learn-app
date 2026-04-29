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
  const [dueCards, setDueCards] = useState([]);
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
      const [due, all] = await Promise.all([
        getDueCards(deckId, 'due'),
        getDueCards(deckId, 'all'),
      ]);
      setDueCards(due.cards);
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
    return (
      <AppShell title="รีวิว" onBack={() => navigate(-1)}>
        <div className="page">
          <div className="review-lobby">
            <p className="lobby-title">เลือกโหมดรีวิว</p>

            <button
              className="lobby-option"
              disabled={dueCards.length === 0}
              onClick={() => startSession(dueCards)}
            >
              <span className="lobby-option-label">รีวิวตามกำหนด</span>
              <span className="lobby-option-count">
                {dueCards.length > 0
                  ? `${dueCards.length} ใบที่ถึงเวลาแล้ว`
                  : 'ไม่มีการ์ดที่ถึงเวลา'}
              </span>
            </button>

            <button
              className="lobby-option lobby-option-all"
              disabled={allCards.length === 0}
              onClick={() => startSession(allCards)}
            >
              <span className="lobby-option-label">รีวิวทั้งหมด</span>
              <span className="lobby-option-count">
                {allCards.length > 0
                  ? `${allCards.length} ใบทั้งหมดใน deck`
                  : 'ยังไม่มีคำศัพท์ใน deck'}
              </span>
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
    return (
      <AppShell
        title="รีวิว"
        onBack={() => navigate(-1)}
        rightContent={`${index + 1} / ${cards.length}`}
      >
        <div className="page">
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
