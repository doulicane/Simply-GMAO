import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageSkeleton } from '@/components/feedback/PageSkeleton';
import { useAuthStore } from '@/stores/authStore';

// Lazy loading de toutes les pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/Login'));
const TicketsPage = lazy(() => import('@/pages/Tickets'));
const PortailOperateur = lazy(() => import('@/pages/PortailOperateur'));
const Equipements = lazy(() => import('@/pages/Equipements'));
const BonsDeTravail = lazy(() => import('@/pages/BonsDeTravail'));
const Stocks = lazy(() => import('@/pages/Stocks'));
const EspaceMagasinier = lazy(() => import('@/pages/EspaceMagasinier'));
const Planification = lazy(() => import('@/pages/Planification'));
const MaintenancePreventive = lazy(() => import('@/pages/MaintenancePreventive'));
const ImportData = lazy(() => import('@/pages/ImportData'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
}

function RequireRole({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function RequireOperateur({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'operateur') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'operateur') return <Navigate to="/portail-operateur" replace />;
  if (user?.role === 'magasinier') return <Navigate to="/espace-magasinier" replace />;
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, fetchMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchMe();
    }
  }, [isAuthenticated, user, fetchMe]);

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthBootstrap>
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/equipements"
          element={
            <RequireRole allowedRoles={['responsable', 'technicien', 'magasinier', 'hse']}>
              <Suspense fallback={<PageSkeleton variant="table" />}>
                <Equipements />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/bons-de-travail"
          element={
            <RequireRole allowedRoles={['responsable', 'magasinier', 'hse']}>
              <Suspense fallback={<PageSkeleton variant="table" />}>
                <BonsDeTravail />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/stocks"
          element={
            <RequireRole allowedRoles={['responsable', 'technicien', 'magasinier', 'hse']}>
              <Suspense fallback={<PageSkeleton variant="table" />}>
                <Stocks />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/espace-magasinier"
          element={
            <RequireRole allowedRoles={['magasinier']}>
              <Suspense fallback={<PageSkeleton variant="dashboard" />}>
                <EspaceMagasinier />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/portail-operateur"
          element={
            <RequireOperateur>
              <Suspense fallback={<PageSkeleton variant="form" />}>
                <PortailOperateur />
              </Suspense>
            </RequireOperateur>
          }
        />
        <Route
          path="/tickets"
          element={
            <RequireRole allowedRoles={['responsable']}>
              <Suspense fallback={<PageSkeleton variant="table" />}>
                <TicketsPage />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/planification"
          element={
            <RequireRole allowedRoles={['responsable']}>
              <Suspense fallback={<PageSkeleton variant="dashboard" />}>
                <Planification />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/maintenance-preventive"
          element={
            <RequireRole allowedRoles={['responsable', 'technicien', 'hse']}>
              <Suspense fallback={<PageSkeleton variant="table" />}>
                <MaintenancePreventive />
              </Suspense>
            </RequireRole>
          }
        />
        <Route
          path="/import"
          element={
            <RequireRole allowedRoles={['responsable', 'admin']}>
              <Suspense fallback={<PageSkeleton variant="table" />}>
                <ImportData />
              </Suspense>
            </RequireRole>
          }
        />
      </Routes>
    </ErrorBoundary>
    </AuthBootstrap>
  );
}
