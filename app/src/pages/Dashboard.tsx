import { useAuthStore } from '@/stores/authStore';
import { TechnicienDashboard } from '@/components/dashboard/TechnicienDashboard';
import { ResponsableDashboard } from '@/components/dashboard/ResponsableDashboard';

export default function Dashboard() {
  const { user } = useAuthStore();

  if (user?.role === 'technicien') {
    return <TechnicienDashboard />;
  }

  return <ResponsableDashboard />;
}
