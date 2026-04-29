// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getVocabByDeck, addVocabCard, deleteVocabCard, updateVocabCard } from '../services/vocabService';
import VocabCard from '../components/Vocabulary/VocabCard';
import AddVocabModal from '../components/Vocabulary/AddVocabModal';
import EditVocabModal from '../components/Vocabulary/EditVocabModal';
import AppShell from '../components/Layout/AppShell';

// ============================================================
// VOCAB PAGE — แสดงคำศัพท์ทั้งหมดใน deck
// ============================================================
export default function VocabPage() {
  const { deckId } = useParams();
  const [searchParams] = useSearchParams();
  const deckLevel = searchParams.get('level');
  const navigate  = useNavigate();

  // ============================================================
  // STATE
  // ============================================================
  const [cards, setCards]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [error, setError]           = useState('');

  // ============================================================
  // HOOKS
  // ============================================================
  useEffect(() => {
    fetchVocab();
  }, [deckId]);

  // ============================================================
  // HANDLERS
  // ============================================================
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

  const handleEdit = (card) => {
    setEditingCard(card);
  };

  const handleSave = async (form) => {
    const updated = await updateVocabCard(deckId, editingCard.id, form);
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditingCard(null);
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

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <AppShell
      title={`คำศัพท์ (${cards.length})`}
      onBack={() => navigate(-1)}
    >
      <div className="page">

        {/* ---- ADD BUTTON ROW ---- */}
        <div className="section-header" style={{ marginBottom: 'var(--space-4)' }}>
          <h2>คำศัพท์</h2>
          <button className="btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + เพิ่มคำศัพท์
          </button>
        </div>

        {error && <p className="error-msg">{error}</p>}

        {loading ? (
          <p className="loading-text">กำลังโหลด...</p>
        ) : cards.length === 0 ? (
          <p className="empty-state">ยังไม่มีคำศัพท์ — กด "+ เพิ่มคำศัพท์" เพื่อเริ่มต้น</p>
        ) : (
          <div className="vocab-list">
            {cards.map((card) => (
              <VocabCard key={card.id} card={card} onDelete={handleDelete} onEdit={handleEdit} />
            ))}
          </div>
        )}

      </div>

      {showModal && (
        <AddVocabModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}

      {editingCard && (
        <EditVocabModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSave={handleSave}
        />
      )}
    </AppShell>
  );
}
