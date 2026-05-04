// ============================================================
// IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getDecks, initJlptDecks } from '../services/deckService';
import { getProgressStats } from '../services/progressService';
import AppShell from '../components/Layout/AppShell';
import SideDrawer from '../components/Layout/SideDrawer';
import { JLPT_COLORS, JLPT_LEVELS } from '../constants/jlptLevels';

// ============================================================
// CONSTANTS — quick access grid tiles
// ============================================================
const GRID_TILES = [
  {
    id: 'vocab',
    label: 'คำศัพท์',
    color: '#2d6482',
    path: '/decks/N5',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'grammar',
    label: 'ไวยากรณ์',
    color: '#2d9e6e',
    path: '/grammar',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'quiz',
    label: 'ทดสอบ',
    color: '#c07825',
    path: '/daily-quiz',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'speaking',
    label: 'ฝึกพูด',
    color: '#6b4fa0',
    path: '/speaking',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'reading',
    label: 'ฝึกอ่าน',
    color: '#32675f',
    path: '/reading',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: 'listening',
    label: 'ฟังเสียง',
    color: '#c0392b',
    path: '/listening',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M18 9a6 6 0 1 0-12 0c0 3 2 5 2 8h8c0-3 2-5 2-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 17v1a4 4 0 0 0 8 0v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'daily',
    label: 'ทบทวนวันนี้',
    color: '#1f4a62',
    path: '/daily-quiz',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="8"  y1="2" x2="8"  y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="3"  y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'โปรไฟล์',
    color: '#745a2e',
    path: '/profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="20" x2="12" y2="4"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="6"  y1="20" x2="6"  y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

// ============================================================
// DASHBOARD PAGE
// ============================================================
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats]           = useState(null);
  const [jlptDecks, setJlptDecks]   = useState([]);

  // ============================================================
  // HOOKS
  // ============================================================
  useEffect(() => {
    bootstrapDecks();
    loadStats();
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================

  // Init JLPT decks and load their IDs for navigation
  const bootstrapDecks = async () => {
    try {
      const all  = await getDecks();
      const jlpt = all.filter((d) => d.deck_type === 'jlpt');
      if (jlpt.length === 0) {
        await initJlptDecks();
      } else {
        setJlptDecks(jlpt);
      }
    } catch {
      // non-blocking — navigation falls back to /decks/N5
    }
  };

  // Load progress stats (streak, mastered, due today, by level)
  const loadStats = async () => {
    try {
      const data = await getProgressStats();
      setStats(data);
    } catch {
      // non-blocking — show zeroes
    }
  };

  // ============================================================
  // DERIVED VALUES
  // ============================================================
  const displayName = user?.user_metadata?.display_name || user?.email || 'ผู้เรียน';
  const initials    = displayName.slice(0, 2).toUpperCase() || 'JA';
  const streak      = stats?.reviewStreak ?? 0;
  const mastered    = stats?.cardsMastered ?? 0;
  const dueToday    = stats?.cardsDueToday ?? 0;

  // Navigate to vocab tile — use first available JLPT deck or fallback
  const getVocabPath = () => {
    if (jlptDecks.length > 0) return `/decks/N5`;
    return '/decks/N5';
  };

  const getTilePath = (tile) => {
    if (tile.id === 'vocab') return getVocabPath();
    return tile.path;
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <AppShell
      title="Japanese Learning"
      onMenu={() => setDrawerOpen(true)}
    >
      {/* Side Drawer */}
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={user}
        streak={streak}
      />

      <div className="dashboard-page">

        {/* ---- GREETING ROW ---- */}
        <div className="dash-greeting">
          <div>
            <p className="dash-greeting__eyebrow">おはようございます 👋</p>
            <h1 className="dash-greeting__title">สวัสดี, {displayName}</h1>
          </div>
          <div className="dash-greeting__avatar" aria-hidden="true">{initials}</div>
        </div>

        {/* ---- STATS ROW ---- */}
        <div className="dash-stats">
          <div className="dash-stat-tile">
            <div className="dash-stat-tile__icon">🔥</div>
            <div className="dash-stat-tile__value" style={{ color: '#c0392b' }}>{streak}</div>
            <div className="dash-stat-tile__label">วันติดต่อกัน</div>
          </div>
          <div className="dash-stat-tile">
            <div className="dash-stat-tile__icon">✅</div>
            <div className="dash-stat-tile__value" style={{ color: '#32675f' }}>{mastered}</div>
            <div className="dash-stat-tile__label">เชี่ยวชาญ</div>
          </div>
          <div className="dash-stat-tile">
            <div className="dash-stat-tile__icon">📅</div>
            <div className="dash-stat-tile__value" style={{ color: '#c07825' }}>{dueToday}</div>
            <div className="dash-stat-tile__label">ครบวันนี้</div>
          </div>
        </div>

        {/* ---- QUOTE CARD ---- */}
        <div className="dash-quote">
          <div className="dash-quote__circle" aria-hidden="true" />
          <div className="dash-quote__deco" aria-hidden="true">"</div>
          <p className="dash-quote__text">七転び八起き</p>
          <p className="dash-quote__sub">ล้มเจ็ดครั้ง ลุกแปดครั้ง</p>
        </div>

        {/* ---- QUICK ACCESS GRID ---- */}
        <div>
          <p className="dash-section-label">เมนูหลัก</p>
          <div className="dash-grid">
            {GRID_TILES.map((tile, i) => (
              <button
                key={tile.id}
                className="dash-grid-tile fade-up"
                style={{ animationDelay: `${i * 45}ms` }}
                onClick={() => navigate(getTilePath(tile))}
              >
                <div
                  className="dash-grid-tile__icon-wrap"
                  style={{ background: tile.color + '18', color: tile.color }}
                >
                  {tile.icon}
                </div>
                <span className="dash-grid-tile__label">{tile.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ---- JLPT PROGRESS ---- */}
        <div className="dash-jlpt">
          <div className="dash-jlpt__header">
            <span className="dash-jlpt__title">ความก้าวหน้า JLPT</span>
            <button
              className="dash-jlpt__link"
              onClick={() => navigate('/profile')}
            >
              ดูทั้งหมด →
            </button>
          </div>
          {JLPT_LEVELS.map((lv) => {
            const lvData = stats?.byLevel?.[lv];
            const total    = lvData?.total    ?? 0;
            const mastered = lvData?.mastered ?? 0;
            const pct      = total > 0 ? Math.round((mastered / total) * 100) : 0;
            const color    = JLPT_COLORS[lv];
            return (
              <div key={lv} className="dash-jlpt__row">
                <span
                  className="dash-jlpt__badge"
                  style={{ background: color }}
                >
                  {lv}
                </span>
                <div className="dash-jlpt__bar">
                  <div
                    className="dash-jlpt__fill"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                <span className="dash-jlpt__pct">{pct}%</span>
              </div>
            );
          })}
        </div>

        {/* ---- CTA BUTTON ---- */}
        <button
          className="dash-cta"
          onClick={() => navigate('/daily-quiz')}
        >
          <div className="dash-cta__text">
            <div className="dash-cta__title">ทบทวนวันนี้</div>
            <div className="dash-cta__sub">
              {dueToday > 0 ? `${dueToday} การ์ดรอการทบทวน` : 'เริ่มทบทวนวันนี้เลย'}
            </div>
          </div>
          <div className="dash-cta__arrow">→</div>
        </button>

      </div>
    </AppShell>
  );
}
