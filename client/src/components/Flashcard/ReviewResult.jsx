// ============================================================
// IMPORTS
// ============================================================
import { useNavigate } from 'react-router-dom';

// ============================================================
// REVIEW RESULT — สรุปผลหลังรีวิวครบทุกใบ
// ============================================================
export default function ReviewResult({ stats, deckId }) {
  const navigate = useNavigate();

  const pct = stats.total > 0
    ? Math.round((stats.good / stats.total) * 100)
    : 0;

  // --- RENDER ---
  return (
    <div className="review-result">
      <div className="result-icon">{pct >= 70 ? '🎉' : '💪'}</div>
      <h2>รีวิวเสร็จแล้ว!</h2>
      <p className="result-pct">{pct}% จำได้</p>

      <div className="result-stats">
        <div className="stat-item">
          <span className="stat-num">{stats.total}</span>
          <span className="stat-label">ทั้งหมด</span>
        </div>
        <div className="stat-item stat-good">
          <span className="stat-num">{stats.good}</span>
          <span className="stat-label">จำได้ / ดีมาก</span>
        </div>
        <div className="stat-item stat-hard">
          <span className="stat-num">{stats.hard}</span>
          <span className="stat-label">ลืม / ยาก</span>
        </div>
      </div>

      <div className="result-actions">
        <button
          className="btn-secondary"
          onClick={() => navigate(`/decks/${deckId}/vocab`)}
        >
          ดูคำศัพท์
        </button>
        <button
          className="btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
}
