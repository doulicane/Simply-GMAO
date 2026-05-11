/**
 * =============================================================================
 * Socket.IO — Notifications en temps reel
 * =============================================================================
 * Namespace /notifications pour les evenements temps reel :
 *   - notification:new   — nouveau BT assigne, changement de statut
 *   - workorder:updated  — mise a jour d'un BT suivi
 *   - stock:alert        — stock sous seuil critique
 *
 * Auth via token JWT dans le handshake (socket.handshake.auth.token).
 * Rooms par userId et par role pour un routage cible.
 * =============================================================================
 */

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from './middleware/auth';
import { env } from './config/env';
import { logger } from './utils/logger';

let io: SocketIOServer | null = null;

// ---------------------------------------------------------------------------
// Initialisation Socket.IO
// ---------------------------------------------------------------------------
export function initSocket(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    path: '/socket.io',
    cors: {
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    },
  });

  // Namespace notifications
  const notifications = io.of('/notifications');

  // Middleware d'authentification JWT
  notifications.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token as string | undefined;
      if (!token) {
        return next(new Error('Token d\'authentification manquant'));
      }

      const decoded = verifyToken(token);
      if (decoded.type !== 'access') {
        return next(new Error('Type de token invalide'));
      }

      // Attacher les infos utilisateur au socket
      (socket as any).userId = decoded.userId;
      (socket as any).userRole = decoded.role;

      next();
    } catch (err: any) {
      next(new Error('Token invalide'));
    }
  });

  // Connexion
  notifications.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    const userRole = (socket as any).userRole as string;

    logger.info(`[Socket] Client connecte : ${userId} (${userRole}) — ${socket.id}`);

    // Rejoindre la room personnelle (userId)
    socket.join(`user:${userId}`);

    // Rejoindre la room de role
    socket.join(`role:${userRole}`);

    // Deconnexion
    socket.on('disconnect', () => {
      logger.info(`[Socket] Client deconnecte : ${userId} — ${socket.id}`);
    });
  });

  return io;
}

// ---------------------------------------------------------------------------
// Helpers d'emission
// ---------------------------------------------------------------------------
function getNamespace() {
  if (!io) {
    throw new Error('Socket.IO n\'est pas initialise');
  }
  return io.of('/notifications');
}

/**
 * Emettre un evenement a un utilisateur specifique
 */
export function emitToUser(userId: string, event: string, data: any): void {
  try {
    getNamespace().to(`user:${userId}`).emit(event, data);
  } catch {
    // Silencieux — le WebSocket ne doit pas bloquer les operations
  }
}

/**
 * Emettre un evenement a tous les utilisateurs d'un role
 */
export function emitToRole(role: string, event: string, data: any): void {
  try {
    getNamespace().to(`role:${role}`).emit(event, data);
  } catch {
    // Silencieux
  }
}

/**
 * Emettre un evenement a tous les clients connectes
 */
export function broadcastEvent(event: string, data: any): void {
  try {
    getNamespace().emit(event, data);
  } catch {
    // Silencieux
  }
}

/**
 * Notification : nouveau BT assigne ou changement de statut
 */
export function notifyNewWorkOrder(userId: string, workOrder: any): void {
  emitToUser(userId, 'notification:new', {
    type: 'workorder',
    title: 'Nouveau bon de travail',
    message: `BT ${workOrder.numero} — ${workOrder.title}`,
    data: workOrder,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notification : mise a jour d'un BT
 */
export function notifyWorkOrderUpdated(workOrder: any): void {
  broadcastEvent('workorder:updated', {
    id: workOrder.id,
    numero: workOrder.numero,
    status: workOrder.status,
    title: workOrder.title,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notification : alerte stock critique
 */
export function notifyStockAlert(stockItem: any): void {
  broadcastEvent('stock:alert', {
    type: 'stock_critical',
    title: 'Alerte stock critique',
    message: `${stockItem.name} (${stockItem.code}) est sous le seuil minimum`,
    data: stockItem,
    timestamp: new Date().toISOString(),
  });
}
