import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Wrench, ClipboardList, CalendarClock, Package,
  ScanLine, Ticket, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Upload,
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const SIDEBAR_ITEMS = [
  { path: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, roles: ['responsable', 'technicien', 'hse'] as const },
  { path: '/espace-magasinier', labelKey: 'nav.magasinierSpace', icon: Package, roles: ['magasinier'] as const },
  { path: '/equipements', labelKey: 'nav.equipments', icon: Wrench, roles: ['responsable', 'technicien', 'magasinier', 'hse'] as const },
  { path: '/bons-de-travail', labelKey: 'nav.workOrders', icon: ClipboardList, roles: ['responsable', 'magasinier', 'hse'] as const },
  { path: '/planification', labelKey: 'nav.planning', icon: CalendarIcon, roles: ['responsable'] as const },
  { path: '/stocks', labelKey: 'nav.stocks', icon: Package, roles: ['responsable', 'technicien', 'magasinier', 'hse'] as const },
  { path: '/portail-operateur', labelKey: 'nav.operatorPortal', icon: ScanLine, roles: ['operateur'] as const },
  { path: '/tickets', labelKey: 'nav.tickets', icon: Ticket, roles: ['responsable'] as const },
  { path: '/import', labelKey: 'nav.import', icon: Upload, roles: ['responsable', 'admin'] as const },
];

export function Sidebar() {
  const location = useLocation();
  const { user, hasRole } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  const visibleItems = SIDEBAR_ITEMS.filter((item) =>
    item.roles.some((r) => hasRole(r))
  );

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-[calc(100dvh-3.5rem)] sticky top-14 bg-simply-gmao-green border-r border-simply-gmao-green-dark/30 transition-all duration-300 z-40',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Logo area */}
      {!collapsed && (
        <div className="px-5 py-4 border-b border-simply-gmao-green-dark/30">
          <div className="flex items-center gap-2">
            <img src="/logo-SimplyGMAO.png" alt="Simply GMAO" className="h-9 w-auto logo-red" />
          </div>
        </div>
      )}

      {/* Toggle button */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-simply-gmao-green-light text-simply-gmao-gold/60 hover:text-simply-gmao-gold transition-colors"
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
                  ? 'text-simply-gmao-gold bg-simply-gmao-gold/10 border-l-[3px] border-simply-gmao-gold'
                  : 'text-white/70 hover:text-white hover:bg-simply-gmao-green-light',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user mini-card */}
      {!collapsed && (
        <div className="p-3 mx-2 mb-3 rounded-lg bg-simply-gmao-green-light/50 border border-simply-gmao-gold/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-simply-gmao-gold/20 text-simply-gmao-gold flex items-center justify-center text-[10px] font-bold">
              {user?.name?.split(' ').map((n) => n[0]).join('') ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-simply-gmao-gold/60 uppercase">{user?.role}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-ok" />
              <span className="text-[10px] text-white/50">v1.0.0</span>
            </div>
            <LanguageSwitcher className="text-white/70" />
          </div>
        </div>
      )}
    </aside>
  );
}
