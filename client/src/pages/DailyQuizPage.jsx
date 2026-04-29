// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyQuizStatus } from '../services/dailyQuizService';
import BottomNavBar from '../components/Layout/BottomNavBar';
import { JLPT_LEVELS, JLPT_COLORS } from '../constants/jlptLevels';

// ============================================================
// CONSTANTS
// ============================================================
const LEVEL_OPTIONS = [{ label: 'ทั้งหมด', value: null }, ...JLPT_LEVELS.map((l) => ({ label: l, value: l }))];

// ============================================================
// DAILY QUIZ PAGE — Lobby: เลือก level + แสดงสถานะวันนี้ + ปุ่มเริ่ม/ทำต่อ
// ============================================================
export default function DailyQuizPage() {
  const navigate = useNavigate();

  // --- STATE ---
  const [selectedLevel, setSelectedLevel] = useState(null); // null = ทั้งหมด
  const [status,        setStatus]        = useState({ answered: 0, correct: 0, total: 0 });
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  // --- HOOKS: โหลด status เมื่อ level เปลี่ยน ---
  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getDailyQuizStatus(selectedLevel);
        setStatus(data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [selectedLevel]);

  // --- DERIVED ---
  const total      = status.total;
  const isDone     = total > 0 && status.answered >= total;
  const hasStarted = status.answered > 0 && !isDone;
  const pct        = isDone ? Math.round((status.correct / total) * 100) : 0;
  const scoreEmoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';

  // --- HANDLER: เริ่ม/ทำต่อ session ---
  const handleStart = () => {
    const url = selectedLevel
      ? `/daily-quiz/session?level=${selectedLevel}`
      : '/daily-quiz/session';
    navigate(url);
  };

  // --- RENDER ---
  return (
    <div className="dq-page dq-page--with-nav">

      {/* ---- HEADER ---- */}
      <header className="dq-header">
        <button className="dq-back-btn" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
          Dashboard
        </button>
        <span className="dq-header-title">ทดสอบประจำวัน</span>
        <div style={{ width: '6rem' }} />
      </header>

      <div className="dq-content">

        {/* ---- HERO ---- */}
        <div className="dq-hero">
          <div className="dq-hero-icon">試</div>
          <h2 className="dq-hero-title">ทดสอบคำศัพท์ประจำวัน</h2>
          <p className="dq-hero-sub">สุ่มจากคำศัพท์ของฉัน</p>
        </div>

        {/* ---- LEVEL SELECTOR ---- */}
        <div className="dq-level-selector">
          {LEVEL_OPTIONS.map(({ label, value }) => {
            const isActive  = selectedLevel === value;
            const chipColor = value ? JLPT_COLORS[value] : 'var(--ls-primary)';
            return (
              <button
                key={label}
                className={`dq-level-chip${isActive ? ' dq-level-chip--active' : ''}`}
                style={isActive ? { background: chipColor, borderColor: chipColor } : { borderColor: chipColor, color: chipColor }}
                onClick={() => setSelectedLevel(value)}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ---- STATUS CARD ---- */}
        {loading ? (
          <div className="dq-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="dq-loading-text">กำลังโหลด...</p>
          </div>
        ) : error ? (
          <div className="dq-card">
            <p className="error-msg">{error}</p>
          </div>
        ) : total === 0 ? (
          /* ---- NO VOCAB ---- */
          <div className="dq-card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</p>
            <p className="dq-done-label" style={{ marginBottom: '0.5rem' }}>
              {selectedLevel ? `ไม่มีคำศัพท์ระดับ ${selectedLevel}` : 'ยังไม่มีคำศัพท์'}
            </p>
            <p className="dq-done-hint">เพิ่มคำศัพท์ในหน้าคำศัพท์ก่อนเริ่มทดสอบ</p>
            <button
              className="dq-start-btn pressable"
              style={{ marginTop: '1.25rem' }}
              onClick={() => navigate('/dashboard')}
            >
              ไปเพิ่มคำศัพท์
            </button>
          </div>
        ) : isDone ? (
          /* ---- COMPLETED ---- */
          <div className="dq-card dq-card--done">
            <div className="dq-done-emoji">{scoreEmoji}</div>
            <p className="dq-done-label">ทำครบแล้ววันนี้!</p>
            <div className="dq-score-row">
              <span className="dq-score-num">{status.correct}</span>
              <span className="dq-score-sep">/</span>
              <span className="dq-score-total">{total}</span>
            </div>
            <p className="dq-score-pct">{pct}% ถูกต้อง</p>
            <p className="dq-done-hint">กลับมาพรุ่งนี้เพื่อทดสอบชุดใหม่</p>
          </div>
        ) : (
          /* ---- START / CONTINUE ---- */
          <div className="dq-card">
            <div className="dq-ring-wrap">
              <div
                className="dq-ring"
                style={{ '--pct': total > 0 ? (status.answered / total) * 100 : 0 }}
              >
                <div className="dq-ring-inner">
                  <span className="dq-ring-num">{status.answered}</span>
                  <span className="dq-ring-den">/{total}</span>
                </div>
              </div>
              <div className="dq-ring-stats">
                <p className="dq-ring-label">ความคืบหน้าวันนี้</p>
                {hasStarted && (
                  <p className="dq-correct-hint">ถูกแล้ว {status.correct} คำ</p>
                )}
              </div>
            </div>
            <button
              className="dq-start-btn pressable"
              onClick={handleStart}
            >
              <span className="material-symbols-outlined">play_arrow</span>
              {hasStarted ? `ทำต่อ (${status.answered}/${total})` : 'เริ่มทดสอบ'}
            </button>
          </div>
        )}

      </div>

      <BottomNavBar />
    </div>
  );
}
