import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, CloudOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  username: z.string().min(1, 'Champ requis'),
  password: z.string().min(1, 'Champ requis'),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

const DEMO_ROLES: { role: UserRole; label: string; color: string }[] = [
  { role: 'operateur', label: 'Opérateur', color: 'border-status-ok text-status-ok hover:bg-status-ok/15' },
  { role: 'technicien', label: 'Technicien', color: 'border-ramondin-gold-light text-ramondin-gold-light hover:bg-ramondin-gold/15' },
  { role: 'magasinier', label: 'Magasinier', color: 'border-status-info text-status-info hover:bg-status-info/15' },
  { role: 'responsable', label: 'Responsable Maintenance', color: 'border-ramondin-gold text-ramondin-gold hover:bg-ramondin-gold/15' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsRole } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', remember: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    const ok = await login(data.username, data.password);
    if (ok) {
      const user = useAuthStore.getState().user;
      navigate(user?.role === 'operateur' ? '/portail-operateur' : '/');
    } else {
      setError('Identifiant ou mot de passe incorrect');
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    loginAsRole(role);
    navigate(role === 'operateur' ? '/portail-operateur' : '/');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-ramondin-cream relative overflow-hidden">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #1D3C34 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Warm glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ramondin-gold/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-ramondin-green-light/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Offline banner */}
      {isOffline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-0 left-0 right-0 h-10 flex items-center justify-center gap-2 bg-status-warning/15 border-b border-status-warning text-status-warning text-[13px] z-50"
        >
          <CloudOff className="w-4 h-4" />
          <span>Serveur inaccessible — Vérifiez votre connexion</span>
          <button
            onClick={() => setIsOffline(!navigator.onLine)}
            className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-transparent border border-status-warning/40 hover:bg-status-warning/10 transition-colors"
          >
            Réessayer
          </button>
        </motion.div>
      )}

      {/* Logo area */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src="/logo-ramondin.svg" alt="Ramondin" className="h-10 w-auto" />
        </div>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
          className="text-sm text-ramondin-text-light mt-1"
        >
          GMAO — Gestion de Maintenance Assistée par Ordinateur
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
          className="text-xs text-ramondin-warm-gray mt-0.5"
        >
          Usine de capsules aluminium — Saint-Gaudens
        </motion.p>
      </motion.div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
        className={cn(
          'w-full max-w-[400px] mx-6 bg-ramondin-green-dark border border-[#1D3C34]/50 rounded-2xl p-8 sm:p-10',
          'shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(224,180,139,0.08)]',
          shake && 'animate-shake'
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-ramondin-text font-raleway">IDENTIFICATION</h2>
          <p className="text-[13px] text-ramondin-text-light mt-1">
            Connectez-vous pour accéder à l'application
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Username */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <label className="block text-xs font-medium text-ramondin-text-light mb-1.5">
              Nom d'utilisateur
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ramondin-warm-gray" />
              <input
                {...register('username')}
                placeholder="Votre identifiant"
                autoComplete="username"
                className={cn(
                  'w-full h-11 pl-10 pr-4 bg-ramondin-cream border rounded-lg text-sm text-ramondin-text',
                  'focus:outline-none focus:border-ramondin-gold focus:shadow-glow transition-all',
                  'placeholder:text-ramondin-warm-gray',
                  errors.username || error ? 'border-status-critical' : 'border-[#1D3C34]/60'
                )}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-status-critical">{errors.username.message}</p>
            )}
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            <label className="block text-xs font-medium text-ramondin-text-light mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ramondin-warm-gray" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                className={cn(
                  'w-full h-11 pl-10 pr-10 bg-white border rounded-lg text-sm text-ramondin-text',
                  'focus:outline-none focus:border-ramondin-gold focus:shadow-glow transition-all',
                  'placeholder:text-ramondin-warm-gray',
                  errors.password || error ? 'border-status-critical' : 'border-[#DDD7CE]'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ramondin-warm-gray hover:text-ramondin-text transition-colors"
              >
                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-status-critical">{errors.password.message}</p>
            )}
          </motion.div>

          {/* Remember me */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <input
              {...register('remember')}
              type="checkbox"
              id="remember"
              className="w-[18px] h-[18px] rounded border border-ramondin-warm-gray bg-ramondin-cream text-ramondin-gold focus:ring-ramondin-gold focus:ring-2"
            />
            <label htmlFor="remember" className="text-[13px] text-ramondin-text-light select-none cursor-pointer">
              Rester connecté sur cet appareil
            </label>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.3 }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-ramondin-gold text-ramondin-cream font-semibold text-sm uppercase tracking-wide rounded-lg hover:bg-ramondin-gold-light hover:shadow-glow-lg active:scale-[0.98] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[13px] text-status-critical"
            >
              {error}
            </motion.p>
          )}
        </form>

        <p className="mt-4 text-center">
          <a href="#" className="text-[13px] text-ramondin-gold hover:text-ramondin-gold-light hover:underline transition-colors">
            Mot de passe oublié ?
          </a>
        </p>
      </motion.div>

      {/* Demo role shortcuts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.2 }}
        className="mt-6 flex items-center gap-2 flex-wrap justify-center"
      >
        {DEMO_ROLES.map((demo) => (
          <button
            key={demo.role}
            onClick={() => handleDemoLogin(demo.role)}
            className={cn(
              'h-9 px-3 bg-ramondin-green-dark border rounded-md text-[11px] font-medium transition-colors shadow-sm whitespace-nowrap',
              demo.color
            )}
          >
            {demo.label}
          </button>
        ))}
      </motion.div>
      <p className="mt-2 text-[11px] text-ramondin-warm-gray">Accès rapide démo</p>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-between px-6 text-xs text-ramondin-warm-gray">
        <span>© 2025 Ramondin</span>
        <span>v1.0.0</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-status-ok" />
          Système opérationnel
        </span>
      </footer>
    </div>
  );
}
