// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { getProgressStats } from '../services/progressService';
import { getDailyQuizStatus } from '../services/dailyQuizService';
import { JLPT_LEVELS, JLPT_COLORS } from '../constants/jlptLevels';
import AppShell from '../components/Layout/AppShell';

// ============================================================
// HELPERS
// ============================================================
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ============================================================
// ANIMATED BAR — JLPT progress bar that animates width on mount
// ============================================================
function AnimatedBar({ pct, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay + 80);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ flex: 1, height: 6, background: '#e3efff', borderRadius: 999, overflow: 'hidden' }}>
      <div
        className="prog-fill-anim"
        style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 999 }}
      />
    </div>
  );
}

// ============================================================
// COUNT-UP HOOK — animates a number from 0 to target
// ============================================================
function useCountUp(target, duration = 900, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    let raf;
    const t = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3); // ease out cubic
        setVal(Math.round(e * target));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [target, duration, delay]);
  return val;
}

// ============================================================
// PROFILE PAGE — โปรไฟล์ผู้ใช้ + สถิติการเรียน
// ============================================================
export default function ProfilePage() {
  const navigate       = useNavigate();
  const { user, logout } = useAuth();

  // ============================================================
  // STATE
  // ============================================================
  const [stats,          setStats]          = useState(null);
  const [quizStatus,     setQuizStatus]     = useState(null);
  const [preferredLevel, setPreferredLevel] = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState('');

  // ============================================================
  // HOOKS
  // ============================================================

  // ดึง stats + daily quiz status ครั้งเดียวตอน mount
  useEffect(() => {
    Promise.all([getProgressStats(), getDailyQuizStatus(null)])
      .then(([s, q]) => {
        setStats(s);
        setQuizStatus(q);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  // โหลด preferred level จาก user_metadata
  useEffect(() => {
    if (user) {
      setPreferredLevel(user.user_metadata?.preferred_level ?? null);
    }
  }, [user]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleLevelSelect = async (lvl) => {
    const next = preferredLevel === lvl ? null : lvl;
    setSaving(true);
    try {
      await supabase.auth.updateUser({ data: { preferred_level: next } });
      setPreferredLevel(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ============================================================
  // DERIVED
  // ============================================================
  const displayName = user?.user_metadata?.display_name || user?.email || '';
  const email       = user?.email || '';
  const initials    = getInitials(displayName);

  const streak      = stats?.reviewStreak ?? 0;
  const studyDays   = stats?.totalStudyDays ?? 0;
  const mastered    = stats?.cardsMastered ?? 0;
  const totalCards  = stats?.totalCards ?? 0;
  const masteryPct  = totalCards > 0 ? Math.round((mastered / totalCards) * 100) : 0;

  const quizAnswered = quizStatus?.answered ?? 0;
  const quizTotal    = quizStatus?.total ?? 0;
  const quizCorrect  = quizStatus?.correct ?? 0;
  const quizPct      = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0;

  // Count-up values — only start counting after stats load (target stays 0 until then)
  const cStreak    = useCountUp(streak,     900, 100);
  const cStudyDays = useCountUp(studyDays,  900, 200);
  const cMastered  = useCountUp(mastered,   900, 300);
  const cTotal     = useCountUp(totalCards, 900, 150);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <AppShell title="โปรไฟล์">
      <div className="prof-page">

        {error && <p className="error-msg">{error}</p>}

        {/* ---- AVATAR + INFO ---- */}
        <div className="prof-avatar-wrap">
          <div className="prof-avatar">{initials}</div>
          <p className="prof-name">{displayName}</p>
          {email !== displayName && <p className="prof-email">{email}</p>}
        </div>

        {/* ---- ระดับที่สนใจ ---- */}
        <p className="prof-section-label">ระดับที่สนใจ</p>
        <div className="prof-level-chips">
          {JLPT_LEVELS.map((lvl) => {
            const isActive  = preferredLevel === lvl;
            const chipColor = JLPT_COLORS[lvl];
            return (
              <button
                key={lvl}
                className={`prof-level-chip${isActive ? ' prof-level-chip--active' : ''}`}
                style={isActive
                  ? { background: chipColor, borderColor: chipColor }
                  : { borderColor: chipColor, color: chipColor }}
                onClick={() => handleLevelSelect(lvl)}
                disabled={saving}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {/* ---- สถิติรวม + คะแนน (แสดงหลัง load) ---- */}
        {loading ? (
          <div className="prof-loading">กำลังโหลดสถิติ...</div>
        ) : (
          <>
            <p className="prof-section-label">สถิติรวม</p>
            <div className="prof-stats-row">
              <div className="prof-stat-badge stat-pop" style={{ animationDelay: '0ms' }}>
                <div className="prof-stat-icon">🔥</div>
                <div className="prof-stat-value">{cStreak}</div>
                <div className="prof-stat-label">วันติดต่อกัน</div>
              </div>
              <div className="prof-stat-badge stat-pop" style={{ animationDelay: '80ms' }}>
                <div className="prof-stat-icon">📅</div>
                <div className="prof-stat-value">{cStudyDays}</div>
                <div className="prof-stat-label">วันที่เรียน</div>
              </div>
            </div>

            <p className="prof-section-label">คะแนนแต่ละส่วน</p>
            <div className="prof-score-grid">

              {/* คำศัพท์ */}
              <div className="prof-score-card stat-pop" style={{ animationDelay: '0ms' }}>
                <span className="prof-score-icon">📚</span>
                <span className="prof-score-title">คำศัพท์</span>
                {cTotal > 0 ? (
                  <>
                    <span className="prof-score-value">{cMastered}/{cTotal}</span>
                    <span className="prof-score-sub">เชี่ยวชาญ {masteryPct}%</span>
                  </>
                ) : (
                  <span className="prof-score-none">ยังไม่มีคำศัพท์</span>
                )}
              </div>

              {/* ทดสอบประจำวัน */}
              <div className="prof-score-card stat-pop" style={{ animationDelay: '80ms' }}>
                <span className="prof-score-icon">📝</span>
                <span className="prof-score-title">ทดสอบวันนี้</span>
                {quizTotal > 0 ? (
                  <>
                    <span className="prof-score-value">{quizAnswered}/{quizTotal}</span>
                    <span className="prof-score-sub">ถูก {quizPct}%</span>
                  </>
                ) : (
                  <span className="prof-score-none">ยังไม่ได้ทดสอบ</span>
                )}
              </div>

              {/* ไวยากรณ์ */}
              <div className="prof-score-card stat-pop" style={{ animationDelay: '160ms' }}>
                <span className="prof-score-icon">📖</span>
                <span className="prof-score-title">ไวยากรณ์</span>
                <span className="prof-score-none">ไม่มีสถิติ</span>
              </div>

              {/* ฝึกออกเสียง */}
              <div className="prof-score-card stat-pop" style={{ animationDelay: '240ms' }}>
                <span className="prof-score-icon">🎤</span>
                <span className="prof-score-title">ฝึกออกเสียง</span>
                <span className="prof-score-none">ไม่มีสถิติ</span>
              </div>

            </div>

            {/* ---- ความก้าวหน้าตาม JLPT ---- */}
            {stats?.byLevel && (
              <>
                <p className="prof-section-label">ความก้าวหน้าตาม JLPT</p>
                <div className="prof-jlpt-bars">
                  {JLPT_LEVELS.map((lv, i) => {
                    const d   = stats.byLevel[lv];
                    const pct = d?.total > 0 ? Math.round((d.mastered / d.total) * 100) : 0;
                    return (
                      <div key={lv} className="prof-jlpt-row">
                        <span
                          className="prof-jlpt-badge"
                          style={{ background: JLPT_COLORS[lv] }}
                        >
                          {lv}
                        </span>
                        <div className="prof-jlpt-bar">
                          <AnimatedBar pct={pct} color={JLPT_COLORS[lv]} delay={i * 100 + 200} />
                        </div>
                        <span className="prof-jlpt-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ---- LOGOUT ---- */}
        <button className="btn-logout" onClick={handleLogout}>
          ออกจากระบบ
        </button>

      </div>
    </AppShell>
  );
}
