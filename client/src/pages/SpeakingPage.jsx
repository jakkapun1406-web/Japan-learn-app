// ============================================================
// IMPORTS
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JLPT_LEVELS, JLPT_COLORS } from '../constants/jlptLevels';
import { getSpeakingWords } from '../services/speakingService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// ============================================================
// CONSTANTS
// ============================================================
const WORD_COUNTS = [5, 10, 20];

// ============================================================
// SPEAKING PAGE — เลือกระดับ + จำนวนคำ แล้วเริ่มเซสชัน
// ============================================================
export default function SpeakingPage() {
  const navigate = useNavigate();
  const { supported } = useSpeechRecognition();

  // --- STATE ---
  const [activeLevel, setActiveLevel] = useState('N5');
  const [wordCount,   setWordCount]   = useState(10);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  // --- HANDLERS ---
  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const words = await getSpeakingWords(activeLevel, wordCount);
      navigate('/speaking/session', { state: { words, level: activeLevel } });
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
            <h2 className="lesson-title">ฝึกการออกเสียง</h2>
          </div>

          {/* ---- BROWSER SUPPORT WARNING ---- */}
          {!supported && (
            <div className="speaking-unsupported">
              เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียง — ใช้ Chrome หรือ Edge เพื่อใช้งานฟีเจอร์นี้
            </div>
          )}

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

          {/* ---- WORD COUNT SELECTOR ---- */}
          <div className="lesson-card">
            <h3 className="lesson-section-label">จำนวนคำ</h3>
            <div className="speaking-word-count-group">
              {WORD_COUNTS.map((n) => (
                <button
                  key={n}
                  className={`speaking-word-count-btn${wordCount === n ? ' active' : ''}`}
                  onClick={() => setWordCount(n)}
                >
                  {n} คำ
                </button>
              ))}
            </div>

            {error && <p className="error-msg">{error}</p>}

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                className="btn-primary"
                style={{ width: 'auto', opacity: !supported ? 0.4 : 1 }}
                disabled={loading || !supported}
                onClick={handleStart}
              >
                {loading ? 'กำลังโหลด...' : 'เริ่มฝึก →'}
              </button>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
