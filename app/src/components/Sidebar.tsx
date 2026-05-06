import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Wrench, ClipboardList, CalendarClock, Package,
  ScanLine, Ticket, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const SIDEBAR_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['responsable', 'technicien', 'hse'] as const },
  { path: '/espace-magasinier', label: 'Espace Magasinier', icon: Package, roles: ['magasinier'] as const },
  { path: '/equipements', label: 'Équipements', icon: Wrench, roles: ['responsable', 'technicien', 'magasinier', 'hse'] as const },
  { path: '/bons-de-travail', label: 'Bons de Travail', icon: ClipboardList, roles: ['responsable', 'magasinier', 'hse'] as const },
  { path: '/planification', label: 'Planification', icon: CalendarIcon, roles: ['responsable'] as const },
  { path: '/stocks', label: 'Stocks', icon: Package, roles: ['responsable', 'technicien', 'magasinier', 'hse'] as const },
  { path: '/portail-operateur', label: 'Portail Opérateur', icon: ScanLine, roles: ['operateur'] as const },
  { path: '/tickets', label: 'Tickets', icon: Ticket, roles: ['responsable'] as const },
];

export function Sidebar() {
  const location = useLocation();
  const { user, hasRole } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = SIDEBAR_ITEMS.filter((item) =>
    item.roles.some((r) => hasRole(r))
  );

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-[calc(100dvh-3.5rem)] sticky top-14 bg-ramondin-green border-r border-ramondin-green-dark/30 transition-all duration-300 z-40',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Logo area */}
      {!collapsed && (
        <div className="px-5 py-4 border-b border-ramondin-green-dark/30">
          <div className="flex items-center gap-2">
            <img src="/logo-ramondin.svg" alt="Ramondin" className="h-5 w-auto" />
          </div>
        </div>
      )}

      {/* Toggle button */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-ramondin-green-light text-ramondin-gold/60 hover:text-ramondin-gold transition-colors"
          aria-label={collapsed ? 'Développer' : 'Réduire'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'text-ramondin-gold bg-ramondin-gold/10 border-l-[3px] border-ramondin-gold'
                  : 'text-white/70 hover:text-white hover:bg-ramondin-green-light',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user mini-card */}
      {!collapsed && (
        <div className="p-3 mx-2 mb-3 rounded-lg bg-ramondin-green-light/50 border border-ramondin-gold/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-ramondin-gold/20 text-ramondin-gold flex items-center justify-center text-[10px] font-bold">
              {user?.name?.split(' ').map((n) => n[0]).join('') ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-ramondin-gold/60 uppercase">{user?.role}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-ok" />
            <span className="text-[10px] text-white/50">v1.0.0</span>
          </div>
        </div>
      )}
    </aside>
  );
}
