import { useState, useEffect } from 'react';
import { CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md',
        'bg-status-neutral/10 border border-dashed border-status-neutral/30'
      )}
    >
      <CloudOff className="w-4 h-4 text-status-neutral" />
      <span className="text-xs font-medium text-status-neutral hidden sm:inline">Hors ligne</span>
    </div>
  );
}
