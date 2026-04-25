// ============================================================
// IMPORTS
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DeckPage from './pages/DeckPage';
import VocabPage from './pages/VocabPage';
import ReviewPage from './pages/ReviewPage';
import GrammarPage from './pages/GrammarPage';
import GrammarLessonPage from './pages/GrammarLessonPage';
import ReadingPage from './pages/ReadingPage';
import ReadingLessonPage from './pages/ReadingLessonPage';
import './App.css';

// ============================================================
// PROTECTED ROUTE — redirect ไป login ถ้ายังไม่ได้ login
// ============================================================
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">กำลังโหลด...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ============================================================
// APP — Router setup
// ============================================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks/:level"
          element={<ProtectedRoute><DeckPage /></ProtectedRoute>}
        />
        <Route
          path="/decks/:deckId/vocab"
          element={<ProtectedRoute><VocabPage /></ProtectedRoute>}
        />
        <Route
          path="/decks/:deckId/review"
          element={<ProtectedRoute><ReviewPage /></ProtectedRoute>}
        />
        <Route
          path="/grammar"
          element={<ProtectedRoute><GrammarPage /></ProtectedRoute>}
        />
        <Route
          path="/grammar/:lessonId"
          element={<ProtectedRoute><GrammarLessonPage /></ProtectedRoute>}
        />
        <Route
          path="/reading"
          element={<ProtectedRoute><ReadingPage /></ProtectedRoute>}
        />
        <Route
          path="/reading/:lessonId"
          element={<ProtectedRoute><ReadingLessonPage /></ProtectedRoute>}
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
