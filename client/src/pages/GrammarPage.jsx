// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLessons } from '../services/grammarService';
import { JLPT_LEVELS, JLPT_COLORS } from '../constants/jlptLevels';
import AppShell from '../components/Layout/AppShell';

// ============================================================
// GRAMMAR PAGE — lesson browser จัดกลุ่มตาม JLPT level
// ============================================================
export default function GrammarPage() {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================
  const [activeLevel, setActiveLevel] = useState('N5');
  const [lessons, setLessons]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  // ============================================================
  // HOOKS
  // ============================================================
  useEffect(() => {
    fetchLessons(activeLevel);
  }, [activeLevel]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const fetchLessons = async (level) => {
    setLoading(true);
    setError('');
    try {
      const data = await getLessons(level);
      setLessons(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  const accentColor = JLPT_COLORS[activeLevel];

  return (
    <AppShell title="ไวยากรณ์">
      <div className="dashboard">

        <h2 style={{ marginBottom: '0.25rem' }}>ไวยากรณ์ภาษาญี่ปุ่น</h2>
        <p className="section-subtitle">เรียนรู้ไวยากรณ์ตาม JLPT level พร้อม quiz ทดสอบ</p>

        {/* ---- LEVEL TABS ---- */}
        <div className="grammar-tabs">
          {JLPT_LEVELS.map((level) => (
            <button
              key={level}
              className={`grammar-tab${activeLevel === level ? ' active' : ''}`}
              style={activeLevel === level ? { borderColor: JLPT_COLORS[level], color: JLPT_COLORS[level] } : {}}
              onClick={() => setActiveLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>

        {/* ---- LESSON GRID ---- */}
        {error && <p className="error-msg">{error}</p>}

        {loading ? (
          <p className="loading-text">กำลังโหลด...</p>
        ) : lessons.length === 0 ? (
          <div className="empty-state">
            <p>ยังไม่มีบทเรียนสำหรับ {activeLevel}</p>
            <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>
              รัน <code>node server/scripts/seedGrammarLessons.js {activeLevel.toLowerCase()}</code> เพื่อ seed ข้อมูล
            </p>
          </div>
        ) : (
          <div className="grammar-grid">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                className="grammar-lesson-card"
                style={{ borderLeftColor: accentColor }}
                onClick={() => navigate(`/grammar/${lesson.id}`)}
              >
                <span
                  className="grammar-lesson-badge"
                  style={{ backgroundColor: accentColor }}
                >
                  {lesson.jlpt_level}
                </span>
                <h3 className="grammar-lesson-title">{lesson.title}</h3>
                <span className="grammar-lesson-arrow">→</span>
              </button>
            ))}
          </div>
        )}

      </div>
    </AppShell>
  );
}
