// ============================================================
// IMPORTS
// ============================================================
import { useNavigate, useLocation } from 'react-router-dom';

// ============================================================
// CONSTANTS — drawer nav items
// ============================================================
const DRAWER_ITEMS = [
  {
    id: 'dashboard',
    label: 'หน้าหลัก',
    path: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'vocab',
    label: 'คำศัพท์',
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
    label: 'ความก้าวหน้า',
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
// SIDE DRAWER — slide-in navigation panel
// Props:
//   open      (bool)   — whether drawer is visible
//   onClose   (fn)     — called when overlay or × is clicked
//   user      (object) — Supabase user object for display
//   streak    (number) — current streak days
// ============================================================
export default function SideDrawer({ open, onClose, user, streak = 0 }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // ============================================================
  // HELPERS
  // ============================================================
  const displayName = user?.user_metadata?.display_name || user?.email || 'ผู้เรียน';
  const email       = user?.email || '';
  const initials    = displayName.slice(0, 2).toUpperCase() || 'JA';

  const isActive = (item) => {
    if (item.path === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(item.path);
  };

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="side-drawer-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        className={`side-drawer ${open ? 'side-drawer--open' : 'side-drawer--closed'}`}
        role="dialog"
        aria-modal="true"
        aria-label="เมนูนำทาง"
      >
        {/* Header */}
        <div className="side-drawer__header">
          <button
            className="side-drawer__close-btn"
            onClick={onClose}
            aria-label="ปิดเมนู"
          >
            ✕
          </button>
          <div className="side-drawer__avatar">{initials}</div>
          <div className="side-drawer__name">{displayName}</div>
          <div className="side-drawer__email">{email}</div>
          {streak > 0 && (
            <div className="side-drawer__streak">
              <span>🔥</span>
              <span>{streak} วันติดต่อกัน</span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="side-drawer__nav">
          {DRAWER_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`side-drawer__nav-item${isActive(item) ? ' side-drawer__nav-item--active' : ''}`}
              onClick={() => handleNav(item.path)}
              style={{ color: isActive(item) ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}
            >
              {item.icon}
              <span className="side-drawer__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="side-drawer__footer">Japanese Learning App v1.0</div>
      </div>
    </>
  );
}
