import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, ArrowLeft, AlertTriangle, CheckCircle, XCircle, RefreshCw, Filter, ClipboardList } from 'lucide-react';
import { useTicketStore } from '@/stores/ticketStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import type { Ticket as TicketType } from '@/stores/ticketStore';

export default function TicketsPage() {
  const { user } = useAuthStore();
  const { tickets, fetchTickets, updateTicketStatus, convertTicketToBT, loading } = useTicketStore();
  const [filter, setFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  const isManager = user?.role === 'responsable' || user?.role === 'hse';

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleConvert = async (ticket: TicketType) => {
    await convertTicketToBT(ticket.id, {
      title: ticket.title,
      description: ticket.description ?? undefined,
      priority: ticket.priority,
    });
    setSelectedTicket(null);
  };

  const handleReject = async (ticket: TicketType) => {
    await updateTicketStatus(ticket.id, 'REJETE', 'Rejeté par le manager');
    setSelectedTicket(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary">TICKETS</h1>
            <p className="text-xs text-text-secondary mt-0.5">Demandes d'intervention</p>
          </div>
        </div>
        <button
          onClick={() => fetchTickets()}
          className="p-2 rounded-md hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors"
          disabled={loading}
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-text-secondary" />
        {[
          { key: 'all', label: 'Tous' },
          { key: 'CREE', label: 'Créés' },
          { key: 'EN_ATTENTE', label: 'En attente' },
          { key: 'EN_COURS', label: 'En cours' },
          { key: 'CONVERTI_EN_BT', label: 'Convertis' },
          { key: 'RESOLU', label: 'Résolus' },
          { key: 'REJETE', label: 'Rejetés' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filter === f.key
                ? 'bg-accent-teal text-white'
                : 'bg-bg-elevated text-text-secondary hover:text-text-primary border border-[rgba(90,94,117,0.2)]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <Ticket className="w-12 h-12 mb-3" />
            <p className="text-sm">Aucun ticket trouvé</p>
          </div>
        )}

        {filteredTickets.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'bg-bg-elevated rounded-xl border p-5 transition-colors',
              selectedTicket?.id === t.id
                ? 'border-accent-teal/50'
                : 'border-[rgba(90,94,117,0.2)] hover:border-[rgba(90,94,117,0.4)]'
            )}
            onClick={() => setSelectedTicket(selectedTicket?.id === t.id ? null : t)}
          >
            <div className="flex items-start gap-4">
              {/* Priority icon */}
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  t.priority === 'URGENTE' && 'bg-status-critical/15',
                  t.priority === 'HAUTE' && 'bg-status-warning/15',
                  t.priority === 'MOYENNE' && 'bg-accent-teal/15',
                  t.priority === 'BASSE' && 'bg-status-neutral/15'
                )}
              >
                <AlertTriangle
                  className={cn(
                    'w-5 h-5',
                    t.priority === 'URGENTE' && 'text-status-critical',
                    t.priority === 'HAUTE' && 'text-status-warning',
                    t.priority === 'MOYENNE' && 'text-accent-teal',
                    t.priority === 'BASSE' && 'text-status-neutral'
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-text-primary truncate">{t.title}</h3>
                  <span className="text-xs font-mono text-text-muted whitespace-nowrap">{t.numero}</span>
                </div>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{t.description || 'Pas de description'}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                      t.status === 'CREE' && 'bg-accent-teal/15 text-accent-teal',
                      t.status === 'EN_ATTENTE' && 'bg-status-warning/15 text-status-warning',
                      t.status === 'EN_COURS' && 'bg-accent-teal/15 text-accent-teal',
                      t.status === 'RESOLU' && 'bg-status-ok/15 text-status-ok',
                      t.status === 'REJETE' && 'bg-status-critical/15 text-status-critical',
                      t.status === 'CONVERTI_EN_BT' && 'bg-accent-teal/15 text-accent-teal'
                    )}
                  >
                    {t.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {t.equipmentName ?? 'Sans équipement'}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    par {t.operateurName ?? t.operateurId}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                  {t.workOrderNumero && (
                    <Link
                      to={`/bons-de-travail`}
                      className="text-[10px] text-accent-teal hover:underline flex items-center gap-0.5"
                    >
                      <ClipboardList className="w-3 h-3" />
                      {t.workOrderNumero}
                    </Link>
                  )}
                </div>
              </div>

              {/* Actions */}
              {isManager && t.status === 'CREE' && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleConvert(t); }}
                    className="h-8 px-3 bg-accent-teal text-white rounded-lg text-xs font-medium hover:brightness-110 transition-all flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Convertir en BT
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReject(t); }}
                    className="h-8 px-3 bg-bg-hover text-status-critical rounded-lg text-xs font-medium hover:bg-status-critical/10 transition-all flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
