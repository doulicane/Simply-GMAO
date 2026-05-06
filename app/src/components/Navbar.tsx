import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wrench, ClipboardList, CalendarClock, Package,
  ScanLine, Ticket, Search, Bell, LogOut, Menu,
  X, Calendar as CalendarIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { OfflineIndicator } from './OfflineIndicator';
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
  const { notifications } = useDataStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const visibleLinks = NAV_LINKS.filter((link) =>
    link.roles.some((r) => hasRole(r))
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-ramondin-green-dark/95 backdrop-blur-md border-b border-[#1D3C34]/50">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Logo + mobile hamburger */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-ramondin-green-light/30 text-ramondin-text"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-ramondin.svg" alt="Ramondin" className="h-6 w-auto" />
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
                    ? 'text-ramondin-gold font-semibold bg-ramondin-green-light/40 border-b-2 border-ramondin-gold shadow-[0_2px_12px_rgba(224,180,139,0.15)]'
                    : 'text-ramondin-text-light hover:text-ramondin-text hover:bg-ramondin-green-light/20'
                )}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Notifications, User, Offline */}
        <div className="flex items-center gap-1">
          <OfflineIndicator />

          <button
            className="p-2 rounded-md hover:bg-ramondin-green-light/30 text-ramondin-text-light hover:text-ramondin-text relative"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Rechercher"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            className="p-2 rounded-md hover:bg-ramondin-green-light/30 text-ramondin-text-light hover:text-ramondin-text relative"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-status-critical rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-ramondin-green-light/30"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-label="Utilisateur"
            >
              <div className="w-7 h-7 rounded-full bg-ramondin-green/10 text-ramondin-green flex items-center justify-center text-xs font-bold">
                {user?.name?.split(' ').map((n) => n[0]).join('') ?? 'U'}
              </div>
              <span className="hidden md:block text-sm text-ramondin-text font-medium">{user?.name}</span>
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-ramondin-green-dark border border-[#1D3C34]/50 rounded-xl shadow-card-hover z-[200] overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-[#1D3C34]/50">
                    <p className="text-sm font-semibold text-ramondin-text">{user?.name}</p>
                    <p className="text-xs text-ramondin-warm-gray">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-ramondin-gold/10 text-ramondin-gold border border-ramondin-gold/20">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-status-critical hover:bg-status-critical/10 transition-colors"
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
            className="lg:hidden bg-ramondin-green-dark border-b border-[#1D3C34]/50 overflow-hidden"
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
                        ? 'text-ramondin-gold font-semibold bg-ramondin-green-light/40 border-l-[3px] border-ramondin-gold shadow-[2px_0_12px_rgba(224,180,139,0.15)]'
                        : 'text-ramondin-text-light hover:text-ramondin-text hover:bg-ramondin-green-light/20'
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
