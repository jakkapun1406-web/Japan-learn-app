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
  // แสดงสถานะกำลังเล่น (blink animation ใน play button)
  const [playing,    setPlaying]    = useState(false);

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
    setPlaying(true);
    speak(question.word, 'ja-JP');
    // SpeechSynthesis ไม่มี onend ที่เชื่อถือได้บน mobile — reset หลัง 2s
    setTimeout(() => setPlaying(false), 2000);
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
      setHasTapped(true);
      setPlaying(true);
      setTimeout(() => setPlaying(false), 2000);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setHasTapped(false);
    setPlaying(false);
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
        <div style={{ width: 48 }} />
      </header>

      {/* ---- PROGRESS BAR ---- */}
      <div className="ls-progress-track">
        <div className="ls-progress-fill" style={{ width: `${pctDone}%` }} />
      </div>

      <div className="ls-content">

        {/* ---- PLAYER CARD — gradient dark ---- */}
        <div style={{
          background: 'linear-gradient(135deg,#1f4a62,#2d6482)',
          borderRadius: 18,
          padding: '24px',
          marginBottom: 16,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* decorative circle */}
          <div style={{
            position: 'absolute', width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', top: -20, right: -20,
          }} />
          {/* speaker icon */}
          <div style={{ fontSize: '2.2rem', marginBottom: 8, position: 'relative', zIndex: 1 }}>🔊</div>
          {/* level + instruction */}
          <div style={{
            fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)',
            marginBottom: 16, position: 'relative', zIndex: 1,
          }}>
            {level} · เลือกความหมายที่ถูกต้อง
          </div>
          {/* play button — blinks until first tap, then blinks while playing */}
          <button
            className={!hasTapped || playing ? 'listen-playing' : ''}
            onClick={handleListen}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: playing ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
              border: 'none', borderRadius: 999, padding: '10px 22px',
              color: '#fff', fontFamily: 'Lexend,sans-serif', fontSize: '0.95rem',
              fontWeight: 600, cursor: 'pointer', position: 'relative', zIndex: 1,
            }}
          >
            ▶ {playing ? 'กำลังเล่น...' : 'ฟังเสียง'}
          </button>
        </div>

        {/* ---- QUESTION LABEL ---- */}
        <div style={{
          fontFamily: 'Lexend,sans-serif', fontSize: '0.82rem',
          fontWeight: 700, color: '#0c1d2b', marginBottom: 10,
        }}>
          ความหมายคืออะไร?
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
