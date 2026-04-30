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
    id: 'lessons',
    label: 'บทเรียน',
    path: '/grammar',
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
    label: 'ฝึกพูด',
    path: '/speaking',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'daily-quiz',
    label: 'ทดสอบ',
    path: '/daily-quiz',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="4" y="3" width="16" height="18" rx="2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="8" y1="8"  x2="16" y2="8"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
// BOTTOM NAV BAR — fixed 4-tab nav
// ============================================================
export default function BottomNavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // ============================================================
  // HELPERS
  // ============================================================
  const isActive = (tab) => {
    if (tab.path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
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
