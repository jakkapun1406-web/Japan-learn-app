// ============================================================
// IMPORTS
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JLPT_LEVELS, JLPT_COLORS } from '../constants/jlptLevels';
import { getListeningQuestions } from '../services/listeningService';

// ============================================================
// CONSTANTS
// ============================================================
const QUESTION_COUNTS = [5, 10, 20];

// ============================================================
// LISTENING PAGE — เลือกระดับ + จำนวนข้อ แล้วเริ่มเซสชัน
// ============================================================
export default function ListeningPage() {
  const navigate = useNavigate();

  // --- STATE ---
  const [activeLevel,    setActiveLevel]    = useState('N5');
  const [questionCount,  setQuestionCount]  = useState(10);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');

  // --- HANDLERS ---
  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const questions = await getListeningQuestions(activeLevel, questionCount);
      navigate('/listening/session', { state: { questions, level: activeLevel } });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="dashboard">
      {/* ---- HEADER ---- */}
      <header className="dashboard-header">
        <h1>Japanese App</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Dashboard
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section>
          <div className="lesson-header">
            <h2 className="lesson-title">ฝึกการฟัง</h2>
            <p style={{ color: '#666', marginTop: '0.25rem' }}>
              ฟังเสียงคำศัพท์ภาษาญี่ปุ่นแล้วเลือกความหมายที่ถูกต้อง
            </p>
          </div>

          {/* ---- LEVEL TABS ---- */}
          <div className="grammar-tabs">
            {JLPT_LEVELS.map((lvl) => (
              <button
                key={lvl}
                className={`grammar-tab${activeLevel === lvl ? ' active' : ''}`}
                style={activeLevel === lvl ? { borderColor: JLPT_COLORS[lvl], color: JLPT_COLORS[lvl] } : {}}
                onClick={() => setActiveLevel(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* ---- QUESTION COUNT SELECTOR ---- */}
          <div className="lesson-card">
            <h3 className="lesson-section-label">จำนวนข้อ</h3>
            <div className="speaking-word-count-group">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  className={`speaking-word-count-btn${questionCount === n ? ' active' : ''}`}
                  onClick={() => setQuestionCount(n)}
                >
                  {n} ข้อ
                </button>
              ))}
            </div>

            {error && <p className="error-msg">{error}</p>}

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                className="btn-primary"
                style={{ width: 'auto' }}
                disabled={loading}
                onClick={handleStart}
              >
                {loading ? 'กำลังโหลด...' : 'เริ่มฟัง →'}
              </button>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
