// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProgressStats } from '../services/progressService';
import { JLPT_LEVELS, JLPT_COLORS } from '../constants/jlptLevels';
import AppShell from '../components/Layout/AppShell';

// ============================================================
// SUB-COMPONENTS
// ============================================================
function StatCard({ label, value, icon, color }) {
  return (
    <div className="progress-stat-card">
      <div className="progress-stat-icon">{icon}</div>
      <div
        className="progress-stat-value"
        style={color ? { color } : {}}
      >
        {value}
      </div>
      <div className="progress-stat-label">{label}</div>
    </div>
  );
}

function ProgressLevelRow({ level, data }) {
  const pct   = data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0;
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
  const { logout } = useAuth();

  // ============================================================
  // STATE
  // ============================================================
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // ============================================================
  // HOOKS
  // ============================================================
  useEffect(() => {
    fetchStats();
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (loading) return <div className="loading">กำลังโหลด...</div>;
  if (error) {
    return (
      <AppShell title="ความก้าวหน้า">
        <div className="dashboard">
          <p className="error-msg">{error}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="ความก้าวหน้า">
      <div className="dashboard">

        <h2 style={{ marginBottom: '0.25rem' }}>สถิติการเรียนรู้</h2>
        <p className="section-subtitle">ภาพรวมความก้าวหน้าของคุณ</p>

        {/* ---- STATS GRID ---- */}
        <div className="progress-stats-grid">
          <StatCard label="คำศัพท์ทั้งหมด"      value={stats.totalCards}    icon="📚" />
          <StatCard label="เชี่ยวชาญแล้ว"        value={stats.cardsMastered} icon="✅" color="var(--color-secondary)" />
          <StatCard label="ครบกำหนดวันนี้"        value={stats.cardsDueToday} icon="📅" color="#c07825" />
          <StatCard label="รีวิวทั้งหมด"          value={stats.totalReviews}  icon="🔄" />
          <StatCard label="Streak (วันติดต่อกัน)" value={`${stats.reviewStreak} วัน`} icon="🔥" color="#c0392b" />
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

        {/* ---- LOGOUT ---- */}
        <button className="btn-logout" onClick={handleLogout}>
          ออกจากระบบ
        </button>

      </div>
    </AppShell>
  );
}
