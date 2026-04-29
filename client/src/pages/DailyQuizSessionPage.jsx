// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDailyQuizWords, submitDailyQuizAnswer } from '../services/dailyQuizService';
import DailyQuizCard from '../components/Flashcard/DailyQuizCard';

// ============================================================
// DAILY QUIZ SESSION PAGE — วนบัตร → summary
// ============================================================
export default function DailyQuizSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level'); // 'N5' | 'N4' | ... | null

  // --- STATE ---
  const [words,      setWords]      = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correct,    setCorrect]    = useState(0);
  const [done,       setDone]       = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  // --- HOOKS: โหลดคำศัพท์เมื่อ mount ---
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const { words: fetched } = await getDailyQuizWords(level);
        if (fetched.length === 0) {
          navigate('/daily-quiz', { replace: true });
          return;
        }
        setWords(fetched);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [navigate, level]);

  // --- HANDLER: ตอบรู้/ไม่รู้ ---
  const handleAnswer = async (is_correct) => {
    const word = words[currentIdx];

    submitDailyQuizAnswer(word.id, is_correct).catch((err) => {
      console.error('[submitDailyQuizAnswer]', err.message);
    });

    const newCorrect = correct + (is_correct ? 1 : 0);
    const nextIdx    = currentIdx + 1;

    if (nextIdx >= words.length) {
      setCorrect(newCorrect);
      setDone(true);
    } else {
      setCorrect(newCorrect);
      setCurrentIdx(nextIdx);
    }
  };

  // --- DERIVED ---
  const total   = words.length;
  const pctDone = total > 0 ? Math.round((currentIdx / total) * 100) : 0;

  // ป้ายกำกับระดับสำหรับแสดงใน header
  const levelLabel = level ? ` — ${level}` : '';
  const backUrl    = level ? `/daily-quiz` : '/daily-quiz';

  // --- RENDER: LOADING ---
  if (loading) {
    return (
      <div className="dq-page">
        <header className="dq-header">
          <button className="dq-back-btn" onClick={() => navigate(backUrl)}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
            ทดสอบ
          </button>
          <span className="dq-header-title">ทดสอบประจำวัน{levelLabel}</span>
          <div style={{ width: '5rem' }} />
        </header>
        <div className="dq-content" style={{ textAlign: 'center', paddingTop: '3rem' }}>
          <p className="dq-loading-text">กำลังโหลดคำศัพท์...</p>
        </div>
      </div>
    );
  }

  // --- RENDER: ERROR ---
  if (error) {
    return (
      <div className="dq-page">
        <header className="dq-header">
          <button className="dq-back-btn" onClick={() => navigate(backUrl)}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
            ทดสอบ
          </button>
          <span className="dq-header-title">ทดสอบประจำวัน{levelLabel}</span>
          <div style={{ width: '5rem' }} />
        </header>
        <div className="dq-content">
          <div className="dq-card">
            <p className="error-msg">{error}</p>
            <button className="dq-start-btn pressable" onClick={() => navigate(backUrl)}>
              กลับ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: DONE SCREEN ---
  if (done) {
    const pct   = total > 0 ? Math.round((correct / total) * 100) : 0;
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    const msg   = pct >= 80 ? 'เยี่ยมมาก! จำคำศัพท์ได้ดีมาก'
                : pct >= 50 ? 'ดีมาก! ลองฝึกอีกรอบพรุ่งนี้'
                : 'ฝึกต่อไปเรื่อยๆ นะ!';
    return (
      <div className="dq-page">
        <header className="dq-header">
          <div style={{ width: '5rem' }} />
          <span className="dq-header-title">ผลลัพธ์{levelLabel}</span>
          <div style={{ width: '5rem' }} />
        </header>
        <div className="dq-content">
          <div className="dq-card dq-card--done" style={{ textAlign: 'center' }}>
            <div className="dq-done-emoji">{emoji}</div>
            <div className="dq-score-row">
              <span className="dq-score-num">{correct}</span>
              <span className="dq-score-sep">/</span>
              <span className="dq-score-total">{total}</span>
            </div>
            <p className="dq-score-pct">{pct}% ถูกต้อง</p>
            <p className="dq-score-msg">{msg}</p>
            <button
              className="dq-start-btn pressable"
              style={{ marginTop: '1.5rem' }}
              onClick={() => navigate('/daily-quiz')}
            >
              กลับหน้าทดสอบ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: SESSION ---
  return (
    <div className="dq-page">

      {/* ---- HEADER ---- */}
      <header className="dq-header">
        <button className="dq-back-btn" onClick={() => navigate(backUrl)}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
          ทดสอบ
        </button>
        <span className="dq-counter">คำที่ {currentIdx + 1} / {total}</span>
        <div style={{ width: '5rem' }} />
      </header>

      {/* ---- PROGRESS BAR ---- */}
      <div className="dq-progress-track">
        <div className="dq-progress-fill" style={{ width: `${pctDone}%` }} />
      </div>

      {/* ---- CONTENT ---- */}
      <div className="dq-content">
        <DailyQuizCard
          key={words[currentIdx].id}
          card={words[currentIdx]}
          onAnswer={handleAnswer}
        />
      </div>

    </div>
  );
}
