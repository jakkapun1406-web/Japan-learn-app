// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getKanaLessons, getKanjiLessons } from '../services/readingService';
import { JLPT_LEVELS, JLPT_COLORS } from '../constants/jlptLevels';

// ============================================================
// CONSTANTS — accent colors per lesson type
// ============================================================
const TYPE_COLORS = {
  hiragana: '#e91e8c',
  katakana: '#00bcd4',
};

const TYPE_LABELS = {
  hiragana: 'ฮิระงะนะ',
  katakana: 'คาตะกะนะ',
  kanji:    'คันจิ',
};

// ============================================================
// READING PAGE — lesson browser จัดกลุ่มตามประเภท + JLPT level
// ============================================================
export default function ReadingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [activeType, setActiveType]   = useState('hiragana');
  const [activeLevel, setActiveLevel] = useState('N5');
  const [lessons, setLessons]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  // --- HOOKS ---
  useEffect(() => {
    if (activeType === 'kanji') {
      fetchKanjiLessons(activeLevel);
    } else {
      fetchKanaLessons(activeType);
    }
  }, [activeType, activeLevel]);

  // --- HANDLERS ---
  const fetchKanaLessons = async (type) => {
    setLoading(true);
    setError('');
    try {
      const data = await getKanaLessons(type);
      setLessons(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchKanjiLessons = async (level) => {
    setLoading(true);
    setError('');
    try {
      const data = await getKanjiLessons(level);
      setLessons(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // --- RENDER ---
  const accentColor =
    activeType === 'kanji' ? JLPT_COLORS[activeLevel] : TYPE_COLORS[activeType];

  const badgeLabel = (lesson) => {
    if (lesson.lesson_type === 'kanji') return lesson.jlpt_level;
    return lesson.lesson_type === 'hiragana' ? 'ฮ' : 'カ';
  };

  const seedHint =
    activeType === 'kanji'
      ? `node server/scripts/seedReadingLessons.js kanji-${activeLevel.toLowerCase()}`
      : `node server/scripts/seedReadingLessons.js ${activeType}`;

  return (
    <div className="dashboard">
      {/* ---- HEADER ---- */}
      <header className="dashboard-header">
        <h1>Japanese App</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Dashboard
          </button>
          <span>{user?.user_metadata?.display_name || user?.email}</span>
          <button onClick={handleLogout} className="btn-secondary">ออกจากระบบ</button>
        </div>
      </header>

      <main className="dashboard-content">
        <section>
          <h2>การอ่านภาษาญี่ปุ่น</h2>
          <p className="section-subtitle">เรียนอักษรฮิระงะนะ คาตะกะนะ และคันจิ พร้อม quiz ทดสอบ</p>

          {/* ---- TYPE TABS ---- */}
          <div className="grammar-tabs">
            {['hiragana', 'katakana', 'kanji'].map((type) => {
              const color = type === 'kanji' ? JLPT_COLORS[activeLevel] : TYPE_COLORS[type];
              return (
                <button
                  key={type}
                  className={`grammar-tab${activeType === type ? ' active' : ''}`}
                  style={activeType === type ? { borderColor: color, color } : {}}
                  onClick={() => setActiveType(type)}
                >
                  {TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>

          {/* ---- JLPT SUB-TABS (kanji only) ---- */}
          {activeType === 'kanji' && (
            <div className="grammar-tabs" style={{ marginTop: '0.5rem' }}>
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
          )}

          {/* ---- LESSON GRID ---- */}
          {error && <p className="error-msg">{error}</p>}

          {loading ? (
            <p className="loading-text">กำลังโหลด...</p>
          ) : lessons.length === 0 ? (
            <div className="empty-state">
              <p>ยังไม่มีบทเรียนสำหรับ {TYPE_LABELS[activeType]}{activeType === 'kanji' ? ` ${activeLevel}` : ''}</p>
              <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
                รัน <code>{seedHint}</code> เพื่อ seed ข้อมูล
              </p>
            </div>
          ) : (
            <div className="grammar-grid">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className="grammar-lesson-card"
                  style={{ borderLeftColor: accentColor }}
                  onClick={() => navigate(`/reading/${lesson.id}`)}
                >
                  <span
                    className="grammar-lesson-badge"
                    style={{ backgroundColor: accentColor }}
                  >
                    {badgeLabel(lesson)}
                  </span>
                  <h3 className="grammar-lesson-title">{lesson.title}</h3>
                  <span className="grammar-lesson-arrow">→</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
