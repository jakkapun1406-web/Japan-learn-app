// ============================================================
// IMPORTS
// ============================================================
import { useAuth } from '../../hooks/useAuth';

// ============================================================
// TOP APP BAR — sticky header, back-arrow or avatar + bell
// Props:
//   title       (string)   — center label
//   onBack      (fn|null)  — if set, shows back-arrow instead of avatar
//   showBell    (bool)     — shows bell icon on root pages
//   rightContent (ReactNode) — optional right-side slot (e.g. review counter)
// ============================================================
export default function TopAppBar({
  title = 'Japanese Learning',
  onBack = null,
  showBell = true,
  rightContent = null,
}) {
  const { user } = useAuth();

  // ============================================================
  // HELPERS
  // ============================================================
  const displayName = user?.user_metadata?.display_name || user?.email || '';
  const initials = displayName.slice(0, 2).toUpperCase() || 'JA';

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <header className="top-app-bar">
      {/* LEFT — back button or avatar */}
      <div className="top-app-bar__left">
        {onBack ? (
          <button
            className="top-app-bar__back-btn"
            onClick={onBack}
            aria-label="กลับ"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <div className="top-app-bar__avatar" aria-hidden="true">
            {initials}
          </div>
        )}
      </div>

      {/* CENTER — title */}
      <span className="top-app-bar__title">{title}</span>

      {/* RIGHT — bell icon or custom right content */}
      <div className="top-app-bar__right">
        {rightContent ? (
          <span className="top-app-bar__right-content">{rightContent}</span>
        ) : (
          showBell &&
          !onBack && (
            <button
              className="top-app-bar__icon-btn"
              aria-label="การแจ้งเตือน"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )
        )}
      </div>
    </header>
  );
}
