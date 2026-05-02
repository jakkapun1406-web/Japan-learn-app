// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgressStats } from '../services/progressService';
import { getDailyQuizStatus } from '../services/dailyQuizService';
import { getLessons } from '../services/grammarService';
import { JLPT_LEVELS, JLPT_COLORS } from '../constants/jlptLevels';
import AppShell from '../components/Layout/AppShell';

// ============================================================
// HELPERS
// ============================================================
function formatThaiDate() {
  return new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

// ============================================================
// ACTIVITY CARD — การ์ดกิจกรรมแต่ละรายการ (mobile-first vertical layout)
// ============================================================
function ActivityRow({ title, subtitle, isDone, noTrack, onGo, goLabel, color }) {
  const borderColor = isDone ? 'var(--color-secondary)' : noTrack ? 'var(--color-outline-variant)' : color;
  const btnBg       = isDone ? 'var(--color-secondary)' : color;

  return (
    <div className="lp-activity-card" style={{ borderLeftColor: borderColor }}>
      <div className="lp-card-header">
        <p className="lp-activity-title" style={isDone ? { color: 'var(--color-secondary)' } : {}}>
          {title}
        </p>
        {isDone && <span className="lp-badge-done">✓ สำเร็จ</span>}
      </div>
      <p className="lp-activity-sub">{subtitle}</p>
      <button
        className="lp-activity-btn pressable"
        style={{ background: btnBg, color: '#fff' }}
        onClick={onGo}
      >
        {goLabel || 'ไป'} →
      </button>
    </div>
  );
}

// ============================================================
// PROGRESS PAGE — แผนการเรียนประจำวัน
// ============================================================
export default function ProgressPage() {
  const navigate   = useNavigate();

  // ============================================================
  // STATE
  // ============================================================
  const [selectedLevel, setSelectedLevel] = useState('N5');
  const [progressStats, setProgressStats] = useState(null);
  const [quizStatus,    setQuizStatus]    = useState(null);
  const [grammarCount,  setGrammarCount]  = useState(null);
  const [error,         setError]         = useState('');
  const [levelLoading,  setLevelLoading]  = useState(true);

  // ============================================================
  // HOOKS
  // ============================================================

  // ดึง progress stats ครั้งเดียวตอน mount
  useEffect(() => {
    getProgressStats()
      .then((s) => setProgressStats(s))
      .catch((err) => setError(err.response?.data?.error || err.message));
  }, []);

  // ดึงข้อมูลเฉพาะ level เมื่อ selectedLevel เปลี่ยน
  useEffect(() => {
    let cancelled = false;
    const fetchLevelData = async () => {
      setLevelLoading(true);
      setError('');
      try {
        const [quiz, lessons] = await Promise.all([
          getDailyQuizStatus(selectedLevel),
          getLessons(selectedLevel),
        ]);
        if (!cancelled) {
          setQuizStatus(quiz);
          setGrammarCount((lessons ?? []).length);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || err.message);
      } finally {
        if (!cancelled) setLevelLoading(false);
      }
    };
    fetchLevelData();
    return () => { cancelled = true; };
  }, [selectedLevel]);

  // ============================================================
  // DERIVED
  // ============================================================
  const color       = JLPT_COLORS[selectedLevel];
  const levelStats  = progressStats?.byLevel?.[selectedLevel] ?? { total: 0, mastered: 0, due: 0 };
  const isInitialLoad = !progressStats || levelLoading;

  // ทดสอบ: done ถ้าตอบครบวันนี้
  const quizDone = quizStatus && quizStatus.total > 0 && quizStatus.answered >= quizStatus.total;

  // รีวิว: done ถ้าไม่มีการ์ดรอ
  const reviewDone = progressStats && levelStats.total > 0 && levelStats.due === 0;

  // subtitle ทดสอบ
  let quizSub = 'ยังไม่ได้ทดสอบวันนี้';
  if (quizStatus) {
    if (quizStatus.total === 0) {
      quizSub = 'ไม่มีคำศัพท์ระดับนี้';
    } else if (quizDone) {
      const pct = Math.round((quizStatus.correct / quizStatus.total) * 100);
      quizSub = `${quizStatus.answered}/${quizStatus.total} · ${pct}% ถูกต้อง`;
    } else if (quizStatus.answered > 0) {
      quizSub = `ทำไปแล้ว ${quizStatus.answered}/${quizStatus.total} คำ`;
    }
  }

  // subtitle รีวิว
  let reviewSub = 'กำลังโหลด...';
  if (progressStats) {
    if (levelStats.total === 0) {
      reviewSub = 'ไม่มีคำศัพท์ระดับนี้';
    } else if (reviewDone) {
      reviewSub = `ทบทวนครบแล้ว · ${levelStats.mastered}/${levelStats.total} เชี่ยวชาญ`;
    } else {
      reviewSub = `${levelStats.due} การ์ดรอรีวิว · ${levelStats.mastered}/${levelStats.total} เชี่ยวชาญ`;
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <AppShell title="แผนการเรียน">
      <div className="lp-page">

        {/* ---- HEADER CARD ---- */}
        <div className="lp-header" style={{ '--lp-color': color }}>
          <p className="lp-header-date">{formatThaiDate()}</p>
          <div className="lp-header-bottom">
            <p className="lp-header-level">ระดับ {selectedLevel}</p>
            {progressStats?.streak > 0 && (
              <span className="lp-streak-chip">🔥 {progressStats.streak} วัน</span>
            )}
          </div>
        </div>

        {/* ---- LEVEL TABS ---- */}
        <div className="lp-level-tabs">
          {JLPT_LEVELS.map((lvl) => {
            const isActive = selectedLevel === lvl;
            const c = JLPT_COLORS[lvl];
            return (
              <button
                key={lvl}
                className={`lp-level-tab${isActive ? ' lp-level-tab--active' : ''}`}
                style={isActive
                  ? { background: c, borderColor: c, color: '#fff' }
                  : { borderColor: c, color: c }}
                onClick={() => setSelectedLevel(lvl)}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {/* ---- ACTIVITY LIST ---- */}
        {error ? (
          <p className="error-msg" style={{ margin: '1rem 0' }}>{error}</p>
        ) : isInitialLoad ? (
          <div className="lp-loading">กำลังโหลด...</div>
        ) : (
          <div className="lp-activity-list" style={{ '--lp-color': color }}>

            {/* ---- ทดสอบประจำวัน ---- */}
            <ActivityRow
              title="ทดสอบประจำวัน"
              subtitle={quizSub}
              isDone={quizDone}
              noTrack={false}
              color={color}
              goLabel={quizDone ? 'ดูผล' : quizStatus?.answered > 0 ? 'ทำต่อ' : 'เริ่ม'}
              onGo={() => navigate(`/daily-quiz?level=${selectedLevel}`)}
            />

            {/* ---- รีวิวคำศัพท์ ---- */}
            <ActivityRow
              title="รีวิวคำศัพท์"
              subtitle={reviewSub}
              isDone={reviewDone}
              noTrack={false}
              color={color}
              goLabel="ไปรีวิว"
              onGo={() => navigate('/dashboard')}
            />

            {/* ---- ไวยากรณ์ ---- */}
            <ActivityRow
              title="ไวยากรณ์"
              subtitle={grammarCount === null
                ? 'กำลังโหลด...'
                : grammarCount === 0
                ? `ยังไม่มีบทเรียน ${selectedLevel}`
                : `${grammarCount} บทเรียน ${selectedLevel}`}
              isDone={false}
              noTrack={true}
              color={color}
              goLabel="ไปเรียน"
              onGo={() => navigate('/grammar')}
            />

            {/* ---- ฝึกออกเสียง ---- */}
            <ActivityRow
              title="ฝึกออกเสียง"
              subtitle={`ฝึกพูดคำศัพท์ระดับ ${selectedLevel}`}
              isDone={false}
              noTrack={true}
              color={color}
              goLabel="ไปฝึก"
              onGo={() => navigate('/speaking')}
            />

          </div>
        )}

      </div>
    </AppShell>
  );
}
