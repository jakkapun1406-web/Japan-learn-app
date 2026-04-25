// ============================================================
// IMPORTS
// ============================================================
import { useState, useCallback } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { JLPT_COLORS } from '../constants/jlptLevels';

// ============================================================
// HELPERS
// ============================================================
const normalize = (s) => s.trim().replace(/\s+/g, '').toLowerCase();

// ============================================================
// SPEAKING SESSION PAGE — ฝึกออกเสียงทีละคำ
// ============================================================
export default function SpeakingSessionPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const words  = location.state?.words  || [];
  const level  = location.state?.level  || 'N5';

  // --- GUARD: ถ้าไม่มีคำ → กลับหน้าเลือก ---
  if (words.length === 0) {
    return <Navigate to="/speaking" replace />;
  }

  const accentColor = JLPT_COLORS[level] || '#667eea';

  // --- STATE ---
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [showHint,    setShowHint]    = useState(false);
  const [result,      setResult]      = useState(null);  // null | 'correct' | 'wrong'
  const [score,       setScore]       = useState(0);
  const [done,        setDone]        = useState(false);

  const word = words[currentIdx];

  // --- SPEECH RECOGNITION ---
  const handleResult = useCallback((alternatives) => {
    const correct = alternatives.some(
      (alt) => normalize(alt) === normalize(word.reading)
    );
    setResult(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
  }, [word]);

  const { listening, start, stop } = useSpeechRecognition({ onResult: handleResult });

  // --- HANDLERS ---
  const handleNext = () => {
    const next = currentIdx + 1;
    if (next >= words.length) {
      setDone(true);
    } else {
      setCurrentIdx(next);
      setShowHint(false);
      setResult(null);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setShowHint(false);
    setResult(null);
    setScore(0);
    setDone(false);
  };

  // --- RENDER: DONE SCREEN ---
  if (done) {
    const pct   = Math.round((score / words.length) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚';
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Japanese App</h1>
          <div className="header-actions">
            <button onClick={() => navigate('/speaking')} className="btn-secondary">
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
              <p className="quiz-result-score">{score} / {words.length} คำ ({pct}%)</p>
              <p className="quiz-result-msg">
                {pct >= 80 ? 'เยี่ยมมาก! ออกเสียงได้ถูกต้องมาก' : pct >= 60 ? 'ดีมาก! ลองฝึกอีกครั้ง' : 'ลองฝึกอีกรอบแล้วค่อยทำใหม่นะ'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
                <button className="btn-primary" style={{ width: 'auto' }} onClick={handleRestart}>
                  เริ่มใหม่
                </button>
                <button className="btn-secondary" onClick={() => navigate('/speaking')}>
                  เลือกระดับ
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // --- RENDER: PRACTICE SCREEN ---
  return (
    <div className="dashboard">
      {/* ---- HEADER ---- */}
      <header className="dashboard-header">
        <h1>Japanese App</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/speaking')} className="btn-secondary">
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
            <p className="quiz-progress">ข้อ {currentIdx + 1} / {words.length}</p>

            {/* ---- LEVEL BADGE ---- */}
            <span
              className="grammar-lesson-badge"
              style={{ backgroundColor: accentColor }}
            >
              {level}
            </span>

            {/* ---- WORD ---- */}
            <div className="speaking-word-display">{word.word}</div>

            {/* ---- READING HINT ---- */}
            <div className="speaking-reading-hint">
              {showHint ? word.reading : ''}
            </div>
            <button
              className="speaking-hint-toggle"
              onClick={() => setShowHint((v) => !v)}
            >
              {showHint ? 'ซ่อนการอ่าน' : 'แสดงการอ่าน'}
            </button>

            {/* ---- MIC BUTTON ---- */}
            {result === null && (
              <button
                className={`speaking-mic-btn${listening ? ' listening' : ''}`}
                onClick={listening ? stop : start}
                title={listening ? 'หยุดฟัง' : 'เริ่มพูด'}
              >
                {listening ? '🔴' : '🎤'}
              </button>
            )}
            <p className="speaking-transcript">
              {listening ? 'กำลังฟัง...' : ''}
            </p>

            {/* ---- RESULT ---- */}
            {result && (
              <>
                <div className={`speaking-result ${result}`}>
                  {result === 'correct'
                    ? '✅ ถูกต้อง!'
                    : `❌ ผิด — การอ่านที่ถูก: ${word.reading}`}
                </div>
                {word.meaning && (
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                    ความหมาย: {word.meaning}
                  </p>
                )}
                <button
                  className="btn-primary quiz-next-btn"
                  onClick={handleNext}
                >
                  {currentIdx + 1 < words.length ? 'ถัดไป →' : 'ดูผลลัพธ์'}
                </button>
              </>
            )}

          </div>
        </section>
      </main>
    </div>
  );
}
