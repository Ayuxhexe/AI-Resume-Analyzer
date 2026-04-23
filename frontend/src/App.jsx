import { Suspense, lazy } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

const AnalysisResultPage = lazy(() => import('./pages/AnalysisResultPage.jsx'));
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const UploadResumePage = lazy(() => import('./pages/UploadResumePage.jsx'));

const ProtectedLayout = () => (
  <ProtectedRoute>
    <AppShell>
      <Outlet />
    </AppShell>
  </ProtectedRoute>
);

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner label="Loading workspace..." />}>
      <Routes>
        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
        />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadResumePage />} />
          <Route path="/analysis/result/:resumeId" element={<AnalysisResultPage />} />
        </Route>
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/' : '/auth'} replace />}
        />
      </Routes>
    </Suspense>
  );
}

export default App;
