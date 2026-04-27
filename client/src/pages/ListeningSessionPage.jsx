// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { JLPT_COLORS } from '../constants/jlptLevels';

// ============================================================
// LISTENING SESSION PAGE — ฟังเสียงคำแล้วเลือกความหมายที่ถูก
// ============================================================
export default function ListeningSessionPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { speak } = useTextToSpeech();

  const questions = location.state?.questions || [];
  const level     = location.state?.level     || 'N5';

  // --- GUARD: ถ้าไม่มีข้อสอบ → กลับหน้าเลือก ---
  if (questions.length === 0) {
    return <Navigate to="/listening" replace />;
  }

  const accentColor = JLPT_COLORS[level] || '#667eea';

  // --- STATE ---
  const [currentIdx,   setCurrentIdx]   = useState(0);
  const [selected,     setSelected]     = useState(null);  // index ที่เลือก หรือ null
  const [score,        setScore]        = useState(0);
  const [done,         setDone]         = useState(false);

  const question = questions[currentIdx];

  // --- AUTO-PLAY: เล่นเสียงอัตโนมัติเมื่อเปลี่ยนข้อ ---
  useEffect(() => {
    if (!done && question) {
      speak(question.word, 'ja-JP');
    }
  }, [currentIdx, done]);

  // --- HANDLERS ---
  const handleSelect = (idx) => {
    if (selected !== null) return;  // ป้องกันการเปลี่ยนคำตอบหลังจากเลือกแล้ว
    setSelected(idx);
    if (idx === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    const next = currentIdx + 1;
    if (next >= questions.length) {
      setDone(true);
    } else {
      setCurrentIdx(next);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

  // --- HELPERS: สีปุ่มตัวเลือก ---
  const getOptionStyle = (idx) => {
    if (selected === null) return {};
    if (idx === question.correctIndex) return { backgroundColor: '#4caf50', color: '#fff', borderColor: '#4caf50' };
    if (idx === selected) return { backgroundColor: '#f44336', color: '#fff', borderColor: '#f44336' };
    return { opacity: 0.5 };
  };

  // --- RENDER: DONE SCREEN ---
  if (done) {
    const pct   = Math.round((score / questions.length) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Japanese App</h1>
          <div className="header-actions">
            <button onClick={() => navigate('/listening')} className="btn-secondary">
              ← เลือกระดับ
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              Dashboard
            </button>
          </div>
        </header>
        <main className="dashboard-content">
          <section>
            <div className="lesson-card" style={{ textAlign: 'center' }}>
              <p className="quiz-result-emoji">{emoji}</p>
              <p className="quiz-result-score">{score} / {questions.length} ข้อ ({pct}%)</p>
              <p className="quiz-result-msg">
                {pct >= 80
                  ? 'เยี่ยมมาก! การฟังดีมากเลย'
                  : pct >= 50
                  ? 'ดีมาก! ลองฝึกอีกครั้ง'
                  : 'ลองฝึกอีกรอบแล้วค่อยทำใหม่นะ'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
                <button className="btn-primary" style={{ width: 'auto' }} onClick={handleRestart}>
                  เล่นอีกครั้ง
                </button>
                <button className="btn-secondary" onClick={() => navigate('/listening')}>
                  เลือกระดับ
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // --- RENDER: SESSION SCREEN ---
  return (
    <div className="dashboard">
      {/* ---- HEADER ---- */}
      <header className="dashboard-header">
        <h1>Japanese App</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/listening')} className="btn-secondary">
            ← เลือกระดับ
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Dashboard
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section>
          <div className="lesson-card" style={{ textAlign: 'center' }}>

            {/* ---- PROGRESS ---- */}
            <p className="quiz-progress">ข้อ {currentIdx + 1} / {questions.length}</p>

            {/* ---- LEVEL BADGE ---- */}
            <span
              className="grammar-lesson-badge"
              style={{ backgroundColor: accentColor }}
            >
              {level}
            </span>

            {/* ---- PLAY BUTTON ---- */}
            <div style={{ margin: '1.5rem 0 1rem' }}>
              <button
                className="btn-tts btn-tts-lg"
                onClick={() => speak(question.word, 'ja-JP')}
                title="ฟังอีกครั้ง"
              >
                🔊 ฟังอีกครั้ง
              </button>
            </div>

            {/* ---- ANSWER OPTIONS ---- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    transition: 'all 0.15s',
                    cursor: selected !== null ? 'default' : 'pointer',
                    ...getOptionStyle(idx),
                  }}
                  onClick={() => handleSelect(idx)}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* ---- RESULT FEEDBACK ---- */}
            {selected !== null && (
              <div style={{ marginTop: '1rem' }}>
                <div className={`speaking-result ${selected === question.correctIndex ? 'correct' : 'wrong'}`}>
                  {selected === question.correctIndex
                    ? '✅ ถูกต้อง!'
                    : `❌ ผิด — คำตอบที่ถูก: ${question.options[question.correctIndex]}`}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.4rem' }}>
                  {question.word} ({question.reading})
                </p>
                <button
                  className="btn-primary quiz-next-btn"
                  onClick={handleNext}
                >
                  {currentIdx + 1 < questions.length ? 'ถัดไป →' : 'ดูผลลัพธ์'}
                </button>
              </div>
            )}

          </div>
        </section>
      </main>
    </div>
  );
}
