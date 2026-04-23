// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVocabByDeck, addVocabCard, deleteVocabCard } from '../services/vocabService';
import VocabCard from '../components/Vocabulary/VocabCard';
import AddVocabModal from '../components/Vocabulary/AddVocabModal';

// ============================================================
// VOCAB PAGE — แสดงคำศัพท์ทั้งหมดใน deck
// ============================================================
export default function VocabPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // --- HOOKS ---
  useEffect(() => {
    fetchVocab();
  }, [deckId]);

  // --- HANDLERS ---
  const fetchVocab = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getVocabByDeck(deckId);
      setCards(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (form) => {
    const newCard = await addVocabCard(deckId, form);
    setCards((prev) => [...prev, newCard]);
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm('ลบคำศัพท์นี้ใช่ไหม?')) return;
    try {
      await deleteVocabCard(deckId, cardId);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  // --- RENDER ---
  return (
    <div className="page">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← กลับ
        </button>
        <h1>คำศัพท์ ({cards.length})</h1>
        <button className="btn-primary btn-sm" onClick={() => setShowModal(true)}>
          + เพิ่มคำศัพท์
        </button>
      </header>

      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <p className="loading-text">กำลังโหลด...</p>
      ) : cards.length === 0 ? (
        <p className="empty-state">ยังไม่มีคำศัพท์ — กด "+ เพิ่มคำศัพท์" เพื่อเริ่มต้น</p>
      ) : (
        <div className="vocab-list">
          {cards.map((card) => (
            <VocabCard key={card.id} card={card} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <AddVocabModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
