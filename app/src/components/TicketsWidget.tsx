import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { useTicketStore } from '@/stores/ticketStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export function TicketsWidget() {
  const { user } = useAuthStore();
  const { tickets, fetchTickets } = useTicketStore();
  const [loading, setLoading] = useState(true);

  const isManager = user?.role === 'responsable';

  useEffect(() => {
    if (isManager) {
      fetchTickets({ status: 'CREE' }).then(() => setLoading(false));
    }
  }, [isManager, fetchTickets]);

  if (!isManager) return null;

  const pendingTickets = tickets.filter((t) => t.status === 'CREE' || t.status === 'EN_ATTENTE');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="bg-bg-elevated rounded-xl border border-[rgba(90,94,117,0.2)] p-5"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-accent-teal" />
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
            Tickets en attente
          </h2>
          {pendingTickets.length > 0 && (
            <span className="h-5 px-1.5 rounded-full bg-status-warning text-white text-[11px] font-bold flex items-center justify-center">
              {pendingTickets.length}
            </span>
          )}
        </div>
        <Link
          to="/tickets"
          className="text-xs font-medium text-accent-teal hover:underline flex items-center gap-1"
        >
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <p className="text-xs text-text-secondary mb-3">
        Demandes d'intervention à traiter
      </p>

      {loading ? (
        <div className="py-8 text-center text-text-muted text-sm">Chargement...</div>
      ) : pendingTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-text-muted">
          <Clock className="w-8 h-8 mb-2" />
          <p className="text-sm">Aucun ticket en attente</p>
          <p className="text-xs text-text-secondary">Tout est à jour !</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {pendingTickets.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary border border-[rgba(90,94,117,0.1)] hover:bg-bg-hover transition-colors"
            >
              <AlertTriangle
                className={cn(
                  'w-4 h-4 mt-0.5 flex-shrink-0',
                  t.priority === 'URGENTE' ? 'text-status-critical' : t.priority === 'HAUTE' ? 'text-status-warning' : 'text-accent-teal'
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{t.title}</p>
                <p className="text-[11px] text-text-secondary truncate">
                  {t.equipmentName ?? 'Sans équipement'} · par {t.operateurName ?? t.operateurId}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
                      t.priority === 'URGENTE' && 'bg-status-critical/15 text-status-critical',
                      t.priority === 'HAUTE' && 'bg-status-warning/15 text-status-warning',
                      t.priority === 'MOYENNE' && 'bg-accent-teal/15 text-accent-teal',
                      t.priority === 'BASSE' && 'bg-status-neutral/15 text-status-neutral'
                    )}
                  >
                    {t.priority}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {pendingTickets.length > 5 && (
            <p className="text-xs text-accent-teal text-center pt-1">
              +{pendingTickets.length - 5} autres tickets
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
