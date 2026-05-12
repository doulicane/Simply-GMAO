/**
 * =============================================================================
 * Point d'entree — Application Express GMAO Simply GMAO
 * =============================================================================
 * Configuration :
 *   - Validation des variables d'environnement (env.ts — erreur fatale si invalide)
 *   - Express avec middlewares de securite (Helmet, CORS strict, Rate Limiting)
 *   - Parsing JSON
 *   - Routes API
 *   - Gestion des erreurs globale
 *   - Healthcheck approfondi (DB, Redis, disque)
 *   - Graceful shutdown
 * =============================================================================
 */

import 'dotenv/config';
import express, { Request, Response, Application } from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';

// DOIT etre importe en premier pour valider l'environnement
import { env } from './config/env';
import { prisma, disconnectDatabase } from './config/database';
import { redisClient, disconnectRedis } from './config/redis';
import { logger } from './utils/logger';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import { swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import { initSocket } from './socket';

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
import planningRoutes from './routes/planning';
import checklistRoutes from './routes/checklistTemplates';
import atexRoutes from './routes/atex';
import sousEnsembleRoutes from './routes/sousEnsembles';
import compteurReleveRoutes from './routes/compteurReleves';
import importRoutes from './routes/import';
import scadaRoutes from './routes/scada';
import preferencesRoutes from './routes/preferences';
import userRoutes from './routes/users';
import lignesRoutes from './routes/lignes';

// Jobs
import { schedulePreventiveJob } from './jobs/preventiveGenerator';
import { scheduleStockAlertJob } from './jobs/stockAlert';
import { schedulePreventiveAlertJob } from './jobs/preventiveAlert';
import { scheduleBackupJob } from './jobs/backup';
import { scheduleMonthlyReportJob } from './jobs/monthlyReport';
import { schedulePreventiveReminderJob } from './jobs/preventiveReminder';
import { scheduleReservationCleanupJob } from './jobs/reservationCleanup';

// ---------------------------------------------------------------------------
// Configuration Express
// ---------------------------------------------------------------------------
const app: Application = express();
const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

// ---------------------------------------------------------------------------
// Middlewares de securite
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Servir le frontend buildé (production)
// ---------------------------------------------------------------------------
const FRONTEND_BUILD_PATH = path.resolve(__dirname, '../../dist');
if (fs.existsSync(FRONTEND_BUILD_PATH)) {
  app.use(express.static(FRONTEND_BUILD_PATH));
  // Fallback SPA — toutes les routes non-API renvoient index.html
  app.get(/^\/(?!api\/|uploads\/).*/, (_req: Request, res: Response) => {
    res.sendFile(path.join(FRONTEND_BUILD_PATH, 'index.html'));
  });
}

// Helmet — headers de securite
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS strict — jamais '*' meme en dev
const corsOrigin = env.CORS_ORIGIN;
const allowedOrigins = corsOrigin.split(',').map((o) => o.trim());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate Limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Trop de requetes, veuillez reessayer plus tard.', code: 'RATE_LIMIT' },
});
app.use(limiter);

// Stricte limit pour login + refresh
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Trop de tentatives de connexion.', code: 'AUTH_RATE_LIMIT' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/refresh', authLimiter);

// Rate limiter specifique upload (10 par heure par IP)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10,
  message: { success: false, error: 'Quota d\'upload atteint (10 fichiers/heure).', code: 'UPLOAD_RATE_LIMIT' },
});
app.use('/api/upload', uploadLimiter);

// Rate limiter specifique export PDF (5 par heure par IP)
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,
  message: { success: false, error: 'Quota d\'export atteint (5 exports/heure).', code: 'EXPORT_RATE_LIMIT' },
});
app.use('/api/reports', exportLimiter);

// ---------------------------------------------------------------------------
// Parsing JSON
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.JWT_SECRET));

// ---------------------------------------------------------------------------
// Servir les fichiers uploads — protege par authentification
// ---------------------------------------------------------------------------
app.get('/uploads/:filename', authenticate, async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(env.UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Fichier introuvable' });
      return;
    }
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(env.UPLOAD_DIR);
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      res.status(403).json({ error: 'Acces refuse' });
      return;
    }
    res.sendFile(resolvedPath);
    return;
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Swagger UI — Documentation API
// ---------------------------------------------------------------------------
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'GMAO Simply GMAO API Docs',
}));

// ---------------------------------------------------------------------------
// Healthcheck public (minimal) + Healthcheck detaille (authentifie)
// ---------------------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.get('/api/health/detailed', authenticate, async (_req: Request, res: Response): Promise<void> => {
  const timestamp = new Date().toISOString();
  const checks: Record<string, { status: 'UP' | 'DOWN'; responseTimeMs?: number; freeSpaceGb?: number; error?: string }> = {};
  let overallStatus: 'UP' | 'DOWN' = 'UP';

  // Check PostgreSQL
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'UP', responseTimeMs: Date.now() - dbStart };
  } catch (err: any) {
    checks.database = { status: 'DOWN', error: err.message };
    overallStatus = 'DOWN';
  }

  // Check Redis
  try {
    const redisStart = Date.now();
    await redisClient.ping();
    checks.redis = { status: 'UP', responseTimeMs: Date.now() - redisStart };
  } catch (err: any) {
    checks.redis = { status: 'DOWN', error: err.message };
    overallStatus = 'DOWN';
  }

  // Check disque uploads
  try {
    const stats = fs.statfsSync(env.UPLOAD_DIR);
    const freeGb = (stats.bavail * stats.bsize) / (1024 ** 3);
    checks.storage = { status: 'UP', freeSpaceGb: Math.round(freeGb) };
  } catch (err: any) {
    checks.storage = { status: 'DOWN', error: err.message };
    overallStatus = 'DOWN';
  }

  res.status(overallStatus === 'DOWN' ? 503 : 200).json({
    status: overallStatus,
    timestamp,
    version: '1.0.0',
    services: checks,
    uptime: Math.floor(process.uptime()),
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
app.use('/api/planning', planningRoutes);
app.use('/api/checklist-templates', checklistRoutes);
app.use('/api/atex', atexRoutes);
app.use('/api/sous-ensembles', sousEnsembleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lignes', lignesRoutes);
app.use('/api/compteur-releves', compteurReleveRoutes);
app.use('/api/import', importRoutes);
app.use('/api/v1', scadaRoutes);
app.use('/api/preferences', preferencesRoutes);

// ---------------------------------------------------------------------------
// Route racine
// ---------------------------------------------------------------------------
app.get('/', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'GMAO Simply GMAO API v1.0.0',
    documentation: '/api/health',
  });
});

// ---------------------------------------------------------------------------
// Routes non trouvees + Erreurs globales
// ---------------------------------------------------------------------------
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ---------------------------------------------------------------------------
// Demarrage du serveur HTTPS ou HTTP + WebSocket
// ---------------------------------------------------------------------------
const HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH || path.resolve(__dirname, '../../192.168.1.22-key.pem');
const HTTPS_CERT_PATH = process.env.HTTPS_CERT_PATH || path.resolve(__dirname, '../../192.168.1.22.pem');

let server: ReturnType<typeof createHttpServer> | ReturnType<typeof createHttpsServer>;
let protocol: string;

if (fs.existsSync(HTTPS_KEY_PATH) && fs.existsSync(HTTPS_CERT_PATH)) {
  const key = fs.readFileSync(HTTPS_KEY_PATH);
  const cert = fs.readFileSync(HTTPS_CERT_PATH);
  server = createHttpsServer({ key, cert }, app);
  protocol = 'https';
} else {
  server = createHttpServer(app);
  protocol = 'http';
}

initSocket(server as any);

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`
=============================================================
  GMAO Simply GMAO API
=============================================================
  Environnement : ${NODE_ENV}
  Protocole     : ${protocol.toUpperCase()}
  Port          : ${PORT}
  URL           : ${protocol}://<IP>:${PORT}
  Healthcheck   : ${protocol}://localhost:${PORT}/api/health
=============================================================
  `);

  // Lancer les schedulers de jobs (sauf en test)
  if (NODE_ENV !== 'test') {
    try {
      await schedulePreventiveJob();
    } catch (err: any) {
      logger.error('Erreur demarrage scheduler preventif :', err.message);
    }
    try {
      await scheduleStockAlertJob();
    } catch (err: any) {
      logger.error('Erreur demarrage scheduler alertes stock :', err.message);
    }
    try {
      await schedulePreventiveAlertJob();
    } catch (err: any) {
      logger.error('Erreur demarrage scheduler alertes preventives :', err.message);
    }
    try {
      await scheduleBackupJob();
    await scheduleMonthlyReportJob();
    await schedulePreventiveReminderJob();
    } catch (err: any) {
      logger.error('Erreur demarrage scheduler backup :', err.message);
    }
    try {
      await scheduleReservationCleanupJob();
    } catch (err: any) {
      logger.error('Erreur demarrage scheduler reservation cleanup :', err.message);
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
