/**
 * =============================================================================
 * NotificationCenter — Centre de notifications temps reel
 * =============================================================================
 * Dropdown affichant les notifications WebSocket. Marquage lu/non-lu,
 * suppression, badge avec compteur. Design system Simply GMAO.
 * =============================================================================
 */

import { useState } from 'react';
import { Bell, Check, Trash2, WifiOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  const typeStyles = {
    info: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
    success: 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20',
    warning: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
    error: 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {!isConnected && (
          <WifiOff className="absolute -bottom-1 -right-1 w-3 h-3 text-amber-500" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 max-h-[500px] bg-card border rounded-xl shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <Check className="w-4 h-4 mr-1" />
                    Tout lire
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'relative p-3 rounded-lg border-l-4 text-sm cursor-pointer transition-colors',
                      typeStyles[n.type],
                      !n.read && 'bg-muted/50'
                    )}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-medium truncate', !n.read && 'text-foreground')}>
                          {n.title}
                        </p>
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {new Date(n.createdAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(n.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive"
                        style={{ opacity: undefined }}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {!n.read && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
