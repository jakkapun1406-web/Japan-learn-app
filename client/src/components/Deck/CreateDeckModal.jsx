// ============================================================
// IMPORTS
// ============================================================
import { useState } from 'react';
import { JLPT_LEVELS } from '../../constants/jlptLevels';

// ============================================================
// CREATE DECK MODAL — form สร้าง deck ใหม่
// ============================================================
export default function CreateDeckModal({ defaultLevel, onClose, onCreate }) {
  // --- STATE ---
  const [name, setName] = useState('');
  const [level, setLevel] = useState(defaultLevel || 'N5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- HANDLERS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('กรุณาใส่ชื่อ deck');
    setLoading(true);
    setError('');
    try {
      await onCreate(name.trim(), level);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>สร้าง Deck ใหม่</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ชื่อ Deck</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น N5 คำศัพท์พื้นฐาน"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>ระดับ JLPT</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="form-select"
            >
              {JLPT_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'กำลังสร้าง...' : 'สร้าง Deck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
