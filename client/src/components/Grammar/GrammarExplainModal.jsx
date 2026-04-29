// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { getGrammarExplain } from '../../services/aiService';

// ============================================================
// GRAMMAR EXPLAIN MODAL — AI อธิบายไวยากรณ์เชิงลึก
// ============================================================
export default function GrammarExplainModal({ grammarTitle, example, onClose }) {
  // ---- STATE ---
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // ---- HANDLERS ---
  const fetchExplanation = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getGrammarExplain(
        grammarTitle,
        example.japanese,
        example.reading,
        example.thai
      );
      setExplanation(data);
    } catch (err) {
      setError(err.response?.data?.error || 'ไม่สามารถโหลดคำอธิบายได้');
    } finally {
      setLoading(false);
    }
  };

  // ---- HOOKS ---
  useEffect(() => {
    fetchExplanation();
  }, []);

  // ---- RENDER ---
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '560px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>อธิบายเพิ่มเติม</h2>

        {/* ---- EXAMPLE SENTENCE ---- */}
        <p className="explain-sentence">{example.japanese}</p>

        {loading && <p className="hint-loading">กำลังโหลด...</p>}
        {error   && <p className="hint-error">{error}</p>}

        {explanation && (
          <>
            {/* ---- DEEPER EXPLANATION ---- */}
            <div className="hint-section">
              <h4 className="hint-label">คำอธิบายเชิงลึก</h4>
              <p>{explanation.deeperExplanation}</p>
            </div>

            {/* ---- SENTENCE BREAKDOWN ---- */}
            {explanation.breakdown?.length > 0 && (
              <div className="hint-section">
                <h4 className="hint-label">การแยกส่วนประโยค</h4>
                {explanation.breakdown.map((b, i) => (
                  <div key={i} className="explain-breakdown-row">
                    <span className="explain-part">{b.part}</span>
                    <span className="explain-role">{b.role}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ---- COMMON MISTAKES ---- */}
            {explanation.commonMistakes?.length > 0 && (
              <div className="hint-section">
                <h4 className="hint-label">ข้อผิดพลาดที่พบบ่อย</h4>
                <ul className="explain-mistakes-list">
                  {explanation.commonMistakes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* ---- CLOSE BUTTON ---- */}
        <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
          <button className="btn-secondary" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  );
}
