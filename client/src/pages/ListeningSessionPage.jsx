// ============================================================
// IMPORTS
// ============================================================
import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { JLPT_COLORS } from '../constants/jlptLevels';

// ============================================================
// CONSTANTS
// ============================================================
const LABELS = ['A', 'B', 'C', 'D'];

// ============================================================
// LISTENING SESSION PAGE — ฟังเสียงคำแล้วเลือกความหมายที่ถูก
// ============================================================
export default function ListeningSessionPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { speak } = useTextToSpeech();

  const questions = location.state?.questions || [];
  const level     = location.state?.level     || 'N5';
  const accentColor = JLPT_COLORS[level] || '#2d6482';

  // --- STATE — ต้องอยู่ก่อน early return เสมอ (Rules of Hooks) ---
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [score,      setScore]      = useState(0);
  const [done,       setDone]       = useState(false);
  // ซ่อน pulse ring หลังจาก user แตะปุ่มฟังครั้งแรก
  const [hasTapped,  setHasTapped]  = useState(false);

  // --- GUARD: ไม่มีข้อสอบ → กลับหน้าเลือก (หลัง hooks ทั้งหมด) ---
  if (questions.length === 0) {
    return <Navigate to="/listening" replace />;
  }

  const question = questions[currentIdx];
  const pctDone  = Math.round(((currentIdx + (selected !== null ? 1 : 0)) / questions.length) * 100);

  // --- HANDLERS ---

  // ฟังเสียง — เรียกโดยตรงจาก user gesture เพื่อผ่าน mobile browser audio policy
  const handleListen = () => {
    setHasTapped(true);
    speak(question.word, 'ja-JP');
  };

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === question.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    const next = currentIdx + 1;
    if (next >= questions.length) {
      setDone(true);
    } else {
      // เรียก speak ภายใน gesture call stack → ผ่าน mobile policy โดยไม่ต้อง autoplay
      speak(questions[next].word, 'ja-JP');
      setCurrentIdx(next);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setHasTapped(false);
  };

  // --- HELPERS: className ปุ่มตัวเลือก ---
  const optionClass = (idx) => {
    if (selected === null) return 'ls-option-btn pressable';
    if (idx === question.correctIndex) return 'ls-option-btn correct';
    if (idx === selected) return 'ls-option-btn wrong';
    return 'ls-option-btn dimmed';
  };

  // --- RENDER: DONE SCREEN ---
  if (done) {
    const pct   = Math.round((score / questions.length) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    const msg   = pct >= 80 ? 'เยี่ยมมาก! การฟังดีมากเลย'
                : pct >= 50 ? 'ดีมาก! ลองฝึกอีกครั้ง'
                : 'ลองฝึกอีกรอบแล้วค่อยทำใหม่นะ';
    return (
      <div className="ls-page">
        <header className="ls-header">
          <button className="ls-back-btn" onClick={() => navigate('/listening')}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
            เลือกระดับ
          </button>
          <span className="ls-header-title">ผลลัพธ์</span>
          <span className="ls-level-pill" style={{ backgroundColor: accentColor }}>{level}</span>
        </header>

        <div className="ls-content">
          <div className="ls-card" style={{ textAlign: 'center' }}>
            <div className="ls-score-emoji">{emoji}</div>
            <div className="ls-score-value">{score} / {questions.length}</div>
            <p className="ls-score-msg">{pct}% — {msg}</p>
            <div className="ls-done-actions">
              <button className="ls-done-btn-outline pressable" onClick={handleRestart}>
                เล่นอีกครั้ง
              </button>
              <button
                className="ls-next-btn pressable"
                style={{ flex: 1 }}
                onClick={() => navigate('/listening')}
              >
                เลือกระดับ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: SESSION SCREEN ---
  return (
    <div className="ls-page">

      {/* ---- HEADER ---- */}
      <header className="ls-header">
        <button className="ls-back-btn" onClick={() => navigate('/listening')}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
          เลือกระดับ
        </button>
        <span className="ls-counter">ข้อ {currentIdx + 1} / {questions.length}</span>
        <span className="ls-level-pill" style={{ backgroundColor: accentColor }}>{level}</span>
      </header>

      {/* ---- PROGRESS BAR ---- */}
      <div className="ls-progress-track">
        <div className="ls-progress-fill" style={{ width: `${pctDone}%` }} />
      </div>

      <div className="ls-content">

        {/* ---- PLAYER CARD ---- */}
        <div className="ls-card" style={{ textAlign: 'center' }}>
          <div className="ls-player-icon">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '2.5rem', fontVariationSettings: "'FILL' 1" }}
            >
              headphones
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--ls-on-variant)', marginBottom: '1.25rem' }}>
            เลือกความหมายของคำนี้
          </p>
          <button
            className={`ls-listen-btn pressable${!hasTapped ? ' pulsing' : ''}`}
            onClick={handleListen}
          >
            <span className="material-symbols-outlined">volume_up</span>
            ฟัง
          </button>
        </div>

        {/* ---- ANSWER OPTIONS ---- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              className={optionClass(idx)}
              disabled={selected !== null}
              onClick={() => handleSelect(idx)}
            >
              <span className="ls-option-label">{LABELS[idx]}</span>
              {opt}
            </button>
          ))}
        </div>

        {/* ---- RESULT FEEDBACK ---- */}
        {selected !== null && (
          <div>
            <div className={`ls-feedback ${selected === question.correctIndex ? 'correct' : 'wrong'}`}>
              {selected === question.correctIndex
                ? '✅ ถูกต้อง!'
                : `❌ ผิด — คำตอบที่ถูก: ${question.options[question.correctIndex]}`}
              <div className="ls-word-reveal">
                {question.word}{question.reading ? ` (${question.reading})` : ''}
              </div>
            </div>
            <button className="ls-next-btn pressable" onClick={handleNext}>
              {currentIdx + 1 < questions.length ? 'ถัดไป →' : 'ดูผลลัพธ์'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
