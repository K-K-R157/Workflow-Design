import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, fetchMe } from './stores/authSlice';
import { useSocket } from './hooks/useSocket';

import EditorPage from './pages/EditorPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

/**
 * ProtectedRoute — Redirects to /login if not authenticated.
 */
function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Initialize Socket.IO when authenticated
  useSocket();

  // On mount, verify token validity by fetching user profile
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMe());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />
      <Route path="/editor" element={
        <ProtectedRoute><EditorPage /></ProtectedRoute>
      } />
      <Route path="/editor/:workflowId" element={
        <ProtectedRoute><EditorPage /></ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
