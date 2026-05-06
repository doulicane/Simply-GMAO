/**
 * =============================================================================
 * Point d'entree — Application Express GMAO Ramondin
 * =============================================================================
 * Configuration :
 *   - Express avec middlewares de securite (Helmet, CORS, Rate Limiting)
 *   - Parsing JSON
 *   - Routes API
 *   - Gestion des erreurs globale
 *   - Healthcheck
 *   - Graceful shutdown
 * =============================================================================
 */

import 'dotenv/config';
import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { disconnectDatabase } from './config/database';
import { disconnectRedis } from './config/redis';
import { logger } from './utils/logger';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import equipmentRoutes from './routes/equipments';
import workOrderRoutes from './routes/workOrders';
import preventiveRoutes from './routes/preventive';
import stockRoutes from './routes/stock';
import dashboardRoutes from './routes/dashboard';
import uploadRoutes from './routes/upload';
import ticketRoutes from './routes/tickets';
import notificationRoutes from './routes/notifications';
import auditLogRoutes from './routes/auditLogs';
import documentRoutes from './routes/documents';

// Jobs
import { schedulePreventiveJob } from './jobs/preventiveGenerator';

// ---------------------------------------------------------------------------
// Configuration Express
// ---------------------------------------------------------------------------
const app: Application = express();
const PORT = Number(process.env.PORT ?? 3000);
const NODE_ENV = process.env.NODE_ENV ?? 'development';

// ---------------------------------------------------------------------------
// Middlewares de securite
// ---------------------------------------------------------------------------

// Helmet — headers de securite
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
}));

// CORS
const corsOrigin = process.env.CORS_ORIGIN ?? '*';
app.use(cors({
  origin: corsOrigin === '*' ? true : corsOrigin.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-demo-role'],
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 500 : 10000, // 500 requetes par IP en prod
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Trop de requetes, veuillez reessayer plus tard.', code: 'RATE_LIMIT' },
});
app.use(limiter);

// Stricte limit pour login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Trop de tentatives de connexion.', code: 'AUTH_RATE_LIMIT' },
});
app.use('/api/auth/login', authLimiter);

// ---------------------------------------------------------------------------
// Parsing JSON
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------------------------------------------------------------
// Servir les fichiers uploads statiques
// ---------------------------------------------------------------------------
app.use('/uploads', express.static(process.env.UPLOAD_DIR ?? './uploads'));

// ---------------------------------------------------------------------------
// Healthcheck
// ---------------------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: {
      status: 'UP',
      env: NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// ---------------------------------------------------------------------------
// Routes API
// ---------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/preventive-plans', preventiveRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/documents', documentRoutes);

// ---------------------------------------------------------------------------
// Route racine
// ---------------------------------------------------------------------------
app.get('/', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'GMAO Ramondin API v1.0.0',
    documentation: '/api/health',
  });
});

// ---------------------------------------------------------------------------
// Routes non trouvees + Erreurs globales
// ---------------------------------------------------------------------------
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ---------------------------------------------------------------------------
// Demarrage du serveur
// ---------------------------------------------------------------------------
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`
=============================================================
  GMAO Ramondin API
=============================================================
  Environnement : ${NODE_ENV}
  Port          : ${PORT}
  Healthcheck   : http://localhost:${PORT}/api/health
=============================================================
  `);

  // Lancer le scheduler des jobs preventifs (sauf en test)
  if (NODE_ENV !== 'test') {
    try {
      await schedulePreventiveJob();
    } catch (err: any) {
      logger.error('Erreur demarrage scheduler preventif :', err.message);
    }
  }
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} recu. Arret en cours...`);

  server.close(async () => {
    try {
      await disconnectDatabase();
      await disconnectRedis();
      console.log('Arret complet.');
      process.exit(0);
    } catch (err) {
      console.error('Erreur pendant l\'arret :', err);
      process.exit(1);
    }
  });

  // Force shutdown apres 10 secondes
  setTimeout(() => {
    console.error('Force shutdown (timeout)');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestion des erreurs non capturees
process.on('uncaughtException', (err: Error) => {
  logger.error('Exception non capturee :', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('Rejection non gere :', reason);
});

export default app;
