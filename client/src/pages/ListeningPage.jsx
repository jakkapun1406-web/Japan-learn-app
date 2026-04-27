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
  const [activeLevel,   setActiveLevel]   = useState('N5');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

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
    <div className="ls-page">

      {/* ---- HEADER ---- */}
      <header className="ls-header">
        <button className="ls-back-btn" onClick={() => navigate('/dashboard')}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
          Dashboard
        </button>
        <span className="ls-header-title">ฝึกการฟัง</span>
        <div style={{ width: '6rem' }} />
      </header>

      <div className="ls-content">

        {/* ---- SUBTITLE ---- */}
        <p className="ls-subtitle">
          ฟังเสียงคำศัพท์ภาษาญี่ปุ่น แล้วเลือกความหมายที่ถูกต้อง
        </p>

        {/* ---- LEVEL SELECTOR ---- */}
        <div>
          <p className="ls-section-label">เลือกระดับ</p>
          <div className="ls-level-tabs">
            {JLPT_LEVELS.map((lvl) => (
              <button
                key={lvl}
                className={`ls-level-tab${activeLevel === lvl ? ' active' : ''}`}
                style={
                  activeLevel === lvl
                    ? { borderColor: JLPT_COLORS[lvl], color: JLPT_COLORS[lvl] }
                    : {}
                }
                onClick={() => setActiveLevel(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* ---- QUESTION COUNT + START ---- */}
        <div className="ls-card">
          <p className="ls-section-label">จำนวนข้อ</p>
          <div className="ls-count-group">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                className={`ls-count-btn${questionCount === n ? ' active' : ''}`}
                onClick={() => setQuestionCount(n)}
              >
                {n} ข้อ
              </button>
            ))}
          </div>

          {error && (
            <p className="error-msg" style={{ marginTop: '1rem', marginBottom: 0 }}>
              {error}
            </p>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <button
              className="ls-listen-btn pressable"
              disabled={loading}
              onClick={handleStart}
            >
              {loading ? (
                'กำลังโหลด...'
              ) : (
                <>
                  <span className="material-symbols-outlined">play_arrow</span>
                  เริ่มฟัง
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
