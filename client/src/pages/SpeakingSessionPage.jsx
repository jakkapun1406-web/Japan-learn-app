// ============================================================
// IMPORTS
// ============================================================
import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { JLPT_COLORS } from '../constants/jlptLevels';
import AppShell from '../components/Layout/AppShell';

// ============================================================
// HELPERS
// ============================================================
const normalize = (s) =>
  s.replace(/[。、！？.!?,\s　 ]/g, '')
    .trim()
    .normalize('NFKC')
    .toLowerCase();

const matchesWord = (alt, wordObj) =>
  normalize(alt) === normalize(wordObj.reading) ||
  normalize(alt) === normalize(wordObj.word);

// ============================================================
// SPEAKING SESSION PAGE — ฝึกออกเสียงทีละคำ
// ============================================================
export default function SpeakingSessionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const words = location.state?.words || [];
  const level = location.state?.level || 'N5';

  const accentColor = JLPT_COLORS[level] || 'var(--color-primary)';

  // ============================================================
  // STATE
  // ============================================================
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showHint,   setShowHint]   = useState(false);
  const [result,     setResult]     = useState(null);
  const [score,      setScore]      = useState(0);
  const [done,       setDone]       = useState(false);
  const [heard,      setHeard]      = useState('');

  const word    = words[currentIdx];
  const wordRef = useRef(word);
  useEffect(() => { wordRef.current = word; }, [word]);

  // ============================================================
  // SPEECH RECOGNITION
  // ============================================================
  const handleResult = useCallback((alternatives) => {
    const current = wordRef.current;
    const best    = alternatives[0] || '';
    setHeard(best);
    const correct = alternatives.some((alt) => matchesWord(alt, current));
    setResult(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
  }, []);

  const { listening, start, stop } = useSpeechRecognition({ onResult: handleResult });
  const { speak } = useTextToSpeech();

  // --- GUARD: ไม่มีคำ → กลับหน้าเลือก (หลัง hooks ทั้งหมด) ---
  if (words.length === 0) {
    return <Navigate to="/speaking" replace />;
  }

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleNext = () => {
    const next = currentIdx + 1;
    if (next >= words.length) {
      setDone(true);
    } else {
      setCurrentIdx(next);
      setShowHint(false);
      setResult(null);
      setHeard('');
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setShowHint(false);
    setResult(null);
    setScore(0);
    setDone(false);
    setHeard('');
  };

  // ============================================================
  // RENDER — done screen
  // ============================================================
  if (done) {
    const pct   = Math.round((score / words.length) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚';
    return (
      <AppShell title="ฝึกพูด" onBack={() => navigate('/speaking')}>
        <div className="dashboard">
          <div className="lesson-card" style={{ textAlign: 'center' }}>
            <p className="quiz-result-emoji">{emoji}</p>
            <p className="quiz-result-score">{score} / {words.length} คำ ({pct}%)</p>
            <p className="quiz-result-msg">
              {pct >= 80
                ? 'เยี่ยมมาก! ออกเสียงได้ถูกต้องมาก'
                : pct >= 60
                ? 'ดีมาก! ลองฝึกอีกครั้ง'
                : 'ลองฝึกอีกรอบแล้วค่อยทำใหม่นะ'}
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
        </div>
      </AppShell>
    );
  }

  // ============================================================
  // RENDER — practice screen
  // ============================================================
  return (
    <AppShell
      title="ฝึกพูด"
      onBack={() => navigate('/speaking')}
      rightContent={`${currentIdx + 1} / ${words.length}`}
    >
      <div className="dashboard">
        <div className="lesson-card" style={{ textAlign: 'center' }}>

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

          {/* ---- LISTEN BUTTON ---- */}
          <div style={{ marginTop: '0.5rem' }}>
            <button
              className="btn-tts btn-tts-lg"
              onClick={() => speak(word.word)}
              title="ฟังเสียงตัวอย่าง"
            >
              🔊 ฟังเสียงตัวอย่าง
            </button>
          </div>

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
              {heard && (
                <p className="speaking-heard">
                  ระบบได้ยินว่า: <strong>{heard}</strong>
                </p>
              )}
              {word.meaning && (
                <p style={{ fontSize: '0.9rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>
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
      </div>
    </AppShell>
  );
}
