// ============================================================
// IMPORTS
// ============================================================
import { useNavigate, useLocation } from 'react-router-dom';

// ============================================================
// CONSTANTS — nav tab definitions with inline SVG icons
// ============================================================
const NAV_TABS = [
  {
    id: 'home',
    label: 'หน้าหลัก',
    path: '/dashboard',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="9 22 9 12 15 12 15 22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'vocab',
    label: 'คำศัพท์',
    path: '/decks',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'quiz',
    label: 'ทดสอบ',
    path: '/daily-quiz',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="12" y1="17" x2="12.01" y2="17"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'daily',
    label: 'วันนี้',
    path: '/progress',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="8"  y1="2" x2="8"  y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="3"  y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'โปรไฟล์',
    path: '/profile',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="7"
          r="4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

// ============================================================
// BOTTOM NAV BAR — fixed 5-tab nav
// ============================================================
export default function BottomNavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // ============================================================
  // HELPERS
  // ============================================================
  const isActive = (tab) => {
    if (tab.id === 'home') {
      return pathname === '/dashboard' || pathname === '/';
    }
    if (tab.id === 'vocab') {
      return pathname.startsWith('/decks');
    }
    if (tab.id === 'quiz') {
      return pathname === '/daily-quiz';
    }
    if (tab.id === 'daily') {
      return pathname === '/progress';
    }
    return pathname.startsWith(tab.path);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <nav className="bottom-nav-bar" aria-label="การนำทางหลัก">
      {NAV_TABS.map((tab) => (
        <button
          key={tab.id}
          className={`bottom-nav-bar__tab${isActive(tab) ? ' is-active' : ''}`}
          onClick={() => navigate(tab.path)}
          aria-label={tab.label}
          aria-current={isActive(tab) ? 'page' : undefined}
        >
          <span className="bottom-nav-bar__icon">{tab.icon}</span>
          <span className="bottom-nav-bar__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
