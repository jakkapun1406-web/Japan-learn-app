// ============================================================
// IMPORTS
// ============================================================
import { useState } from 'react';
import { JLPT_LEVELS } from '../../constants/jlptLevels';

// ============================================================
// ADD VOCAB MODAL — form เพิ่มคำศัพท์ใหม่เข้า deck
// ============================================================
export default function AddVocabModal({ defaultLevel, onClose, onAdd }) {
  // --- STATE ---
  const [form, setForm] = useState({
    word: '',
    reading: '',
    meaning: '',
    part_of_speech: '',
    jlpt_level: defaultLevel || 'N5',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- HANDLERS ---
  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.word || !form.reading || !form.meaning) {
      return setError('กรุณากรอก word, reading, และ meaning');
    }
    setLoading(true);
    setError('');
    try {
      await onAdd(form);
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
        <h2>เพิ่มคำศัพท์</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>คำศัพท์ (word)</label>
            <input
              value={form.word}
              onChange={setField('word')}
              placeholder="食べる"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>การอ่าน (reading)</label>
            <input
              value={form.reading}
              onChange={setField('reading')}
              placeholder="たべる"
            />
          </div>

          <div className="form-group">
            <label>ความหมาย (meaning)</label>
            <input
              value={form.meaning}
              onChange={setField('meaning')}
              placeholder="กิน / to eat"
            />
          </div>

          <div className="form-group">
            <label>ชนิดคำ (ไม่บังคับ)</label>
            <input
              value={form.part_of_speech}
              onChange={setField('part_of_speech')}
              placeholder="verb / noun / adjective"
            />
          </div>

          <div className="form-group">
            <label>ระดับ JLPT</label>
            <select
              value={form.jlpt_level}
              onChange={setField('jlpt_level')}
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
              {loading ? 'กำลังเพิ่ม...' : 'เพิ่มคำศัพท์'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
