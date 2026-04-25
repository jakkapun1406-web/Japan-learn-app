// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLessonById } from '../services/grammarService';
import { JLPT_COLORS } from '../constants/jlptLevels';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

// ============================================================
// GRAMMAR LESSON PAGE — lesson detail + mini-quiz
// ============================================================
export default function GrammarLessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [lesson, setLesson]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ]       = useState(0);
  const [selected, setSelected]       = useState(null);    // index ที่เลือก
  const [answered, setAnswered]       = useState(false);   // กดเฉลยแล้ว
  const [score, setScore]             = useState(0);
  const [quizDone, setQuizDone]       = useState(false);

  // --- HOOKS ---
  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  // --- HANDLERS ---
  const fetchLesson = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getLessonById(lessonId);
      setLesson(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === lesson.quiz[currentQ].answer_index) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    const next = currentQ + 1;
    if (next >= lesson.quiz.length) {
      setQuizDone(true);
    } else {
      setCurrentQ(next);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setQuizDone(false);
  };

  // --- RENDER HELPERS ---
  const renderQuiz = () => {
    if (!lesson?.quiz?.length) return null;
    const q = lesson.quiz[currentQ];

    if (quizDone) {
      const pct = Math.round((score / lesson.quiz.length) * 100);
      const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚';
      return (
        <div className="quiz-result">
          <p className="quiz-result-emoji">{emoji}</p>
          <p className="quiz-result-score">{score} / {lesson.quiz.length} ข้อ ({pct}%)</p>
          <p className="quiz-result-msg">
            {pct >= 80 ? 'เยี่ยมมาก! เข้าใจบทเรียนนี้ดีแล้ว' : pct >= 60 ? 'ดีมาก! ลองทบทวนอีกครั้ง' : 'อ่านอีกรอบแล้วลองใหม่นะ'}
          </p>
          <button className="btn-secondary" onClick={handleRestartQuiz}>
            ลองอีกครั้ง
          </button>
        </div>
      );
    }

    return (
      <div className="quiz-question-block">
        <p className="quiz-progress">ข้อ {currentQ + 1} / {lesson.quiz.length}</p>
        <p className="quiz-question">{q.question}</p>
        <div className="quiz-options">
          {q.options.map((opt, idx) => {
            let cls = 'quiz-option';
            if (answered) {
              if (idx === q.answer_index) cls += ' correct';
              else if (idx === selected) cls += ' wrong';
            } else if (idx === selected) {
              cls += ' selected';
            }
            return (
              <button
                key={idx}
                className={cls}
                onClick={() => handleSelectAnswer(idx)}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <button className="btn-primary quiz-next-btn" onClick={handleNextQuestion}>
            {currentQ + 1 < lesson.quiz.length ? 'ข้อถัดไป →' : 'ดูผลลัพธ์'}
          </button>
        )}
      </div>
    );
  };

  // --- RENDER ---
  if (loading) return <div className="loading">กำลังโหลด...</div>;
  if (error)   return <div className="dashboard"><p className="error-msg">{error}</p></div>;
  if (!lesson) return null;

  const accentColor = JLPT_COLORS[lesson.jlpt_level] || '#667eea';
  const { speak } = useTextToSpeech();

  return (
    <div className="dashboard">
      {/* ---- HEADER ---- */}
      <header className="dashboard-header">
        <h1>Japanese App</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/grammar')} className="btn-secondary">
            ← บทเรียน
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Dashboard
          </button>
        </div>
      </header>

      <main className="dashboard-content">

        {/* ---- LESSON HEADER ---- */}
        <section>
          <div className="lesson-header">
            <span
              className="grammar-lesson-badge"
              style={{ backgroundColor: accentColor }}
            >
              {lesson.jlpt_level}
            </span>
            <h2 className="lesson-title">{lesson.title}</h2>
          </div>

          {/* ---- EXPLANATION ---- */}
          <div className="lesson-card">
            <h3 className="lesson-section-label">คำอธิบาย</h3>
            <p className="lesson-explanation">{lesson.explanation}</p>
          </div>

          {/* ---- EXAMPLES ---- */}
          {lesson.examples?.length > 0 && (
            <div className="lesson-card">
              <h3 className="lesson-section-label">ตัวอย่างประโยค</h3>
              <div className="examples-list">
                {lesson.examples.map((ex, i) => (
                  <div key={i} className="example-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <p className="example-japanese" style={{ margin: 0 }}>{ex.japanese}</p>
                      <button className="btn-tts" onClick={() => speak(ex.japanese)} title="ฟังเสียง">🔊</button>
                    </div>
                    <p className="example-reading">{ex.reading}</p>
                    <p className="example-thai">{ex.thai}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---- QUIZ ---- */}
          {lesson.quiz?.length > 0 && (
            <div className="lesson-card">
              <h3 className="lesson-section-label">Mini Quiz</h3>
              {!quizStarted ? (
                <div className="quiz-start">
                  <p>{lesson.quiz.length} ข้อ — ทดสอบความเข้าใจบทเรียนนี้</p>
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', marginTop: '1rem' }}
                    onClick={() => setQuizStarted(true)}
                  >
                    เริ่ม Quiz
                  </button>
                </div>
              ) : (
                renderQuiz()
              )}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
