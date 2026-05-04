// ============================================================
// IMPORTS
// ============================================================
import { Component } from 'react';

// ============================================================
// ERROR BOUNDARY
// Catches render errors in any child tree and shows a friendly
// Thai fallback instead of a blank white screen.
// Must be a class component — hooks cannot implement this lifecycle.
// ============================================================
export default class ErrorBoundary extends Component {
  // ============================================================
  // STATE
  // ============================================================
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // ============================================================
  // LIFECYCLE
  // ============================================================
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  // ============================================================
  // RENDER
  // ============================================================
  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'var(--color-surface)',
      }}>
        <div className="lesson-card" style={{ textAlign: 'center', maxWidth: 340 }}>
          <p style={{ fontSize: '3rem', margin: '0 0 0.5rem' }}>😵</p>
          <p style={{
            fontWeight: 700,
            color: 'var(--color-on-surface)',
            marginBottom: '0.25rem',
          }}>
            เกิดข้อผิดพลาด
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--color-on-surface-variant)',
            marginBottom: '1.25rem',
          }}>
            บางอย่างผิดพลาด กรุณาโหลดหน้าใหม่
          </p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            โหลดใหม่
          </button>
        </div>
      </div>
    );
  }
}
