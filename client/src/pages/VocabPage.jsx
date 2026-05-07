// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getVocabByDeck, addVocabCard, deleteVocabCard, updateVocabCard } from '../services/vocabService';
import VocabCard from '../components/Vocabulary/VocabCard';
import AddVocabModal from '../components/Vocabulary/AddVocabModal';
import EditVocabModal from '../components/Vocabulary/EditVocabModal';
import AppShell from '../components/Layout/AppShell';

const LEVEL_OPTIONS = ['all', 'N5', 'N4', 'N3', 'N2', 'N1'];

// ============================================================
// VOCAB PAGE — แสดงคำศัพท์ทั้งหมดใน deck
// ============================================================
export default function VocabPage() {
  const { deckId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate  = useNavigate();

  // ============================================================
  // STATE
  // ============================================================
  const [cards, setCards]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [error, setError]             = useState('');
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterPOS, setFilterPOS]     = useState('all');

  // ============================================================
  // DERIVED — filtered card list + available POS options
  // ============================================================
  const posOptions = useMemo(
    () => [...new Set(cards.map((c) => c.part_of_speech).filter(Boolean))].sort(),
    [cards]
  );

  const filteredCards = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return cards.filter((c) => {
      const matchSearch =
        !q ||
        c.word.toLowerCase().includes(q) ||
        c.reading.toLowerCase().includes(q) ||
        c.meaning.toLowerCase().includes(q);
      const matchLevel = filterLevel === 'all' || c.jlpt_level === filterLevel;
      const matchPOS   = filterPOS === 'all' || c.part_of_speech === filterPOS;
      return matchSearch && matchLevel && matchPOS;
    });
  }, [cards, searchTerm, filterLevel, filterPOS]);

  const isFiltering = !!searchTerm.trim() || filterLevel !== 'all' || filterPOS !== 'all';

  // ============================================================
  // HOOKS
  // ============================================================
  useEffect(() => {
    setSearchTerm('');
    setFilterLevel('all');
    setFilterPOS('all');
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
  const titleCount = isFiltering
    ? `${filteredCards.length}/${cards.length}`
    : cards.length;

  return (
    <AppShell
      title={`คำศัพท์ (${titleCount})`}
      onBack={() => navigate(-1)}
    >
      <div className="page">

        {/* ---- ADD BUTTON ROW ---- */}
        <div className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
          <h2>คำศัพท์</h2>
          <button className="btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + เพิ่มคำศัพท์
          </button>
        </div>

        {/* ---- SEARCH BAR ---- */}
        <div className="vc-search-wrap">
          <input
            className="vc-search-input"
            type="text"
            placeholder="🔍 ค้นหา คำ, reading, ความหมาย..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ---- LEVEL FILTER CHIPS ---- */}
        <div className="vc-filter-row">
          {LEVEL_OPTIONS.map((lvl) => (
            <button
              key={lvl}
              className={`vc-chip ${filterLevel === lvl ? 'vc-chip--active' : ''}`}
              onClick={() => setFilterLevel(lvl)}
            >
              {lvl === 'all' ? 'ทั้งหมด' : lvl}
            </button>
          ))}
        </div>

        {/* ---- PART-OF-SPEECH FILTER CHIPS (shown only when cards have POS data) ---- */}
        {posOptions.length > 0 && (
          <div className="vc-filter-row">
            <button
              className={`vc-chip vc-chip--pos ${filterPOS === 'all' ? 'vc-chip--active' : ''}`}
              onClick={() => setFilterPOS('all')}
            >
              ทุกประเภท
            </button>
            {posOptions.map((pos) => (
              <button
                key={pos}
                className={`vc-chip vc-chip--pos ${filterPOS === pos ? 'vc-chip--active' : ''}`}
                onClick={() => setFilterPOS(pos)}
              >
                {pos}
              </button>
            ))}
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}

        {/* ---- CARD LIST ---- */}
        {loading ? (
          <p className="loading-text">กำลังโหลด...</p>
        ) : cards.length === 0 ? (
          <p className="empty-state">ยังไม่มีคำศัพท์ — กด "+ เพิ่มคำศัพท์" เพื่อเริ่มต้น</p>
        ) : filteredCards.length === 0 ? (
          <p className="empty-state">ไม่พบคำศัพท์ที่ตรงกับการค้นหา</p>
        ) : (
          <div className="vocab-list">
            {filteredCards.map((card) => (
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
