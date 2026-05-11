import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'fr', label: 'FR' },
  { code: 'es', label: 'ES' },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Globe className="w-3.5 h-3.5 text-text-muted" />
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={cn(
            'text-[11px] font-bold px-1.5 py-0.5 rounded transition-colors',
            i18n.language === lang.code
              ? 'bg-accent-teal/15 text-accent-teal'
              : 'text-text-muted hover:text-text-primary'
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
