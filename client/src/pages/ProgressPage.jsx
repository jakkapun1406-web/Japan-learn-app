// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgressStats } from '../services/progressService';
import { JLPT_LEVELS, JLPT_COLORS } from '../constants/jlptLevels';

// ============================================================
// SUB-COMPONENTS
// ============================================================
function StatCard({ label, value, icon, color = '#667eea' }) {
  return (
    <div className="progress-stat-card">
      <div className="progress-stat-icon">{icon}</div>
      <div className="progress-stat-value" style={{ color }}>{value}</div>
      <div className="progress-stat-label">{label}</div>
    </div>
  );
}

function ProgressLevelRow({ level, data }) {
  const pct = data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0;
  const color = JLPT_COLORS[level];

  return (
    <div className="progress-level-row">
      <span
        className="grammar-lesson-badge"
        style={{ backgroundColor: color, minWidth: '36px', textAlign: 'center' }}
      >
        {level}
      </span>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="progress-level-count">{data.mastered} / {data.total} คำ</span>
    </div>
  );
}

// ============================================================
// PROGRESS PAGE — สถิติการเรียนรู้ของผู้ใช้
// ============================================================
export default function ProgressPage() {
  const navigate = useNavigate();

  // ---- STATE ---
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // ---- HOOKS ---
  useEffect(() => {
    fetchStats();
  }, []);

  // ---- HANDLERS ---
  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProgressStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---- RENDER ---
  if (loading) return <div className="loading">กำลังโหลด...</div>;
  if (error)   return <div className="dashboard"><p className="error-msg">{error}</p></div>;

  return (
    <div className="dashboard">

      {/* ---- HEADER ---- */}
      <header className="dashboard-header">
        <h1>Japanese App</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section>
          <h2 className="section-title">สถิติการเรียนรู้</h2>
          <p className="section-subtitle">ภาพรวมความก้าวหน้าของคุณ</p>

          {/* ---- STATS GRID ---- */}
          <div className="progress-stats-grid">
            <StatCard label="คำศัพท์ทั้งหมด"        value={stats.totalCards}    icon="📚" />
            <StatCard label="เชี่ยวชาญแล้ว"          value={stats.cardsMastered} icon="✅" color="#43a047" />
            <StatCard label="ครบกำหนดวันนี้"          value={stats.cardsDueToday} icon="📅" color="#fb8c00" />
            <StatCard label="รีวิวทั้งหมด"            value={stats.totalReviews}  icon="🔄" />
            <StatCard label="วันติดต่อกัน (Streak)"   value={`${stats.reviewStreak} วัน`} icon="🔥" color="#e53935" />
          </div>

          {/* ---- BY-LEVEL BREAKDOWN ---- */}
          <div className="lesson-card" style={{ marginTop: '1.5rem' }}>
            <h3 className="lesson-section-label">ความก้าวหน้าตามระดับ JLPT</h3>
            <div className="progress-level-list">
              {JLPT_LEVELS.map((level) => (
                <ProgressLevelRow
                  key={level}
                  level={level}
                  data={stats.byLevel[level] || { total: 0, mastered: 0 }}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
