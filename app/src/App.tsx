import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuthStore } from '@/stores/authStore';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import TicketsPage from '@/pages/Tickets';
import PortailOperateur from '@/pages/PortailOperateur';
import Equipements from '@/pages/Equipements';
import BonsDeTravail from '@/pages/BonsDeTravail';

import Stocks from '@/pages/Stocks';
import EspaceMagasinier from '@/pages/EspaceMagasinier';
import Planification from '@/pages/Planification';
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
  return <Layout><Dashboard /></Layout>;
}

export default function App() {
  return (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/equipements"
          element={
            <RequireRole allowedRoles={['responsable', 'technicien', 'magasinier', 'hse']}>
              <Equipements />
            </RequireRole>
          }
        />
        <Route
          path="/bons-de-travail"
          element={
            <RequireRole allowedRoles={['responsable', 'magasinier', 'hse']}>
              <BonsDeTravail />
            </RequireRole>
          }
        />
        <Route
          path="/stocks"
          element={
            <RequireRole allowedRoles={['responsable', 'technicien', 'magasinier', 'hse']}>
              <Stocks />
            </RequireRole>
          }
        />
        <Route
          path="/espace-magasinier"
          element={
            <RequireRole allowedRoles={['magasinier']}>
              <EspaceMagasinier />
            </RequireRole>
          }
        />
        <Route
          path="/portail-operateur"
          element={
            <RequireOperateur>
              <PortailOperateur />
            </RequireOperateur>
          }
        />
        <Route
          path="/tickets"
          element={
            <RequireRole allowedRoles={['responsable']}>
              <TicketsPage />
            </RequireRole>
          }
        />
        <Route
          path="/planification"
          element={
            <RequireRole allowedRoles={['responsable']}>
              <Planification />
            </RequireRole>
          }
        />
      </Routes>
  );
}
