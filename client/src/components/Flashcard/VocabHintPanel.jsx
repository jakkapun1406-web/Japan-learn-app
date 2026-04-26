// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { getVocabHint } from '../../services/aiService';

// ============================================================
// VOCAB HINT PANEL — แสดง AI hint บนการ์ดด้านหลัง
// ============================================================
export default function VocabHintPanel({ word, reading, meaning }) {
  // ---- STATE ---
  const [open, setOpen]       = useState(false);
  const [hint, setHint]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // ---- HOOKS ---
  // Reset when card changes
  useEffect(() => {
    setHint(null);
    setOpen(false);
    setError('');
  }, [word]);

  // ---- HANDLERS ---
  const handleToggle = async (e) => {
    e.stopPropagation();

    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);

    if (hint) return; // already fetched

    setLoading(true);
    setError('');
    try {
      const data = await getVocabHint(word, reading, meaning);
      setHint(data);
    } catch (err) {
      setError(err.response?.data?.error || 'ไม่สามารถโหลดคำใบ้ได้');
    } finally {
      setLoading(false);
    }
  };

  // ---- RENDER ---
  return (
    <div style={{ width: '100%' }}>
      <button className="btn-hint" onClick={handleToggle}>
        💡 {open ? 'ซ่อนคำใบ้' : 'คำใบ้'}
      </button>

      {open && (
        <div className="hint-panel">
          {loading && <p className="hint-loading">กำลังโหลดคำใบ้...</p>}
          {error   && <p className="hint-error">{error}</p>}

          {hint && (
            <>
              {/* ---- MNEMONIC ---- */}
              <div className="hint-section">
                <h4 className="hint-label">เทคนิคจำ</h4>
                <p>{hint.mnemonic}</p>
              </div>

              {/* ---- EXAMPLE SENTENCE ---- */}
              {hint.example && (
                <div className="hint-section">
                  <h4 className="hint-label">ตัวอย่างประโยค</h4>
                  <p className="hint-japanese">{hint.example.japanese}</p>
                  <p className="hint-reading">{hint.example.reading}</p>
                  <p className="hint-thai">{hint.example.thai}</p>
                </div>
              )}

              {/* ---- RELATED WORDS ---- */}
              {hint.related?.length > 0 && (
                <div className="hint-section">
                  <h4 className="hint-label">คำที่เกี่ยวข้อง</h4>
                  <div className="hint-related-list">
                    {hint.related.map((w, i) => (
                      <span key={i} className="hint-related-chip">{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
