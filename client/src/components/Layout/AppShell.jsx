// ============================================================
// IMPORTS
// ============================================================
import TopAppBar from './TopAppBar';
import BottomNavBar from './BottomNavBar';

// ============================================================
// APP SHELL — wraps pages with TopAppBar + content + BottomNavBar
// Props:
//   title        (string)    — page title shown in TopAppBar
//   onBack       (fn|null)   — if set, shows back-arrow; hides BottomNavBar
//   onMenu       (fn|null)   — if set, shows hamburger in TopAppBar left slot
//   showBottomNav (bool)     — override to hide BottomNavBar
//   rightContent  (ReactNode) — passed to TopAppBar right slot
//   children      (ReactNode) — page content
// ============================================================
export default function AppShell({
  children,
  title,
  onBack = null,
  onMenu = null,
  showBottomNav = true,
  rightContent = null,
}) {
  // Sub-pages (onBack set) never show the bottom nav
  const showNav = showBottomNav && !onBack;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={`app-shell${!showNav ? ' app-shell--sub' : ''}`}>
      <TopAppBar
        title={title}
        onBack={onBack}
        onMenu={onMenu}
        showBell={showNav}
        rightContent={rightContent}
      />
      <main className="app-shell__content">{children}</main>
      {showNav && <BottomNavBar />}
    </div>
  );
}
