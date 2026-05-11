import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wrench, ClipboardList, Package,
  ScanLine, Ticket, Search, Bell, LogOut, Menu,
  X, Calendar as CalendarIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '@/stores/authStore';
import { useSync } from '@/hooks/useSync';
import { OfflineIndicator } from './OfflineIndicator';
import { SyncStatusIndicator } from './feedback/SyncStatus';
import { NotificationCenter } from './notifications/NotificationCenter';
import { HelpButton } from './HelpModal';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['responsable', 'technicien', 'hse'] as const },
  { path: '/espace-magasinier', label: 'Espace Magasinier', icon: Package, roles: ['magasinier'] as const },
  { path: '/portail-operateur', label: 'Portail Opérateur', icon: ScanLine, roles: ['operateur'] as const },
  { path: '/equipements', label: 'Équipements', icon: Wrench, roles: ['responsable', 'technicien', 'magasinier', 'hse'] as const },
  { path: '/bons-de-travail', label: 'Bons de Travail', icon: ClipboardList, roles: ['responsable', 'magasinier', 'hse'] as const },
  { path: '/planification', label: 'Planification', icon: CalendarIcon, roles: ['responsable'] as const },
  { path: '/stocks', label: 'Stocks', icon: Package, roles: ['responsable', 'technicien', 'magasinier', 'hse'] as const },
  { path: '/tickets', label: 'Tickets', icon: Ticket, roles: ['responsable'] as const },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuthStore();

  const { status, pendingCount, syncNow } = useSync();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const visibleLinks = NAV_LINKS.filter((link) =>
    link.roles.some((r) => hasRole(r))
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Logo + mobile hamburger */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-SimplyGMAO.png" alt="Simply GMAO" className="h-10 w-auto logo-red" />
          </Link>
        </div>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {visibleLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'text-primary font-semibold bg-primary/10 border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Notifications, Sync, Theme, User, Offline */}
        <div className="flex items-center gap-1">
          <OfflineIndicator />

          <SyncStatusIndicator
            status={status}
            pendingCount={pendingCount}
            onSync={syncNow}
          />

          <button
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground relative"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Rechercher"
          >
            <Search className="w-5 h-5" />
          </button>

          <NotificationCenter />

          <HelpButton />

          <div className="relative">
            <button
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label="Utilisateur"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {user?.name?.split(' ').map((n) => n[0]).join('') ?? 'U'}
              </div>
              <span className="hidden md:block text-sm text-foreground font-medium">{user?.name}</span>
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-lg z-[200] overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary border border-primary/20">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border overflow-hidden"
          >
            <nav className="flex flex-col p-2">
              {visibleLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'text-primary font-semibold bg-primary/10 border-l-[3px] border-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
