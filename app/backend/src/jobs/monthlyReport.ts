import { Queue, Worker } from 'bullmq';
import { prisma } from '../config/database';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';
import { generateMonthlyReportPDF } from '../services/pdfService';
import fs from 'fs';
import path from 'path';

const REPORT_QUEUE = 'monthly-report';
const REPORT_DIR = process.env.REPORT_DIR || path.resolve(__dirname, '../../reports');

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

export const monthlyReportQueue = new Queue(REPORT_QUEUE, { connection: redisClient });

export async function scheduleMonthlyReportJob() {
  // Vider les anciennes repeatables pour éviter les doublons
  const repeatables = await monthlyReportQueue.getRepeatableJobs();
  for (const job of repeatables) {
    await monthlyReportQueue.removeRepeatableByKey(job.key);
  }

  await monthlyReportQueue.add(
    'generate',
    {},
    {
      repeat: {
        pattern: '0 8 1 * *', // Le 1er de chaque mois à 8h00
      },
    }
  );

  logger.info('Job rapport mensuel planifie (1er du mois 08h00)');
}

const worker = new Worker(
  REPORT_QUEUE,
  async (_job) => {
    const now = new Date();
    const month = now.getMonth(); // 0-based
    const year = now.getFullYear();
    const prevMonth = month === 0 ? 12 : month;
    const prevYear = month === 0 ? year - 1 : year;

    const startDate = new Date(prevYear, prevMonth - 1, 1);
    const endDate = new Date(prevYear, prevMonth, 0, 23, 59, 59);

    const [woCreated, woClosed, stockAlerts] = await Promise.all([
      prisma.workOrder.count({
        where: { dateCreation: { gte: startDate, lte: endDate }, deletedAt: null },
      }),
      prisma.workOrder.count({
        where: { status: 'CLOTURE', validatedAt: { gte: startDate, lte: endDate }, deletedAt: null },
      }),
      prisma.stockItem.count({
        where: { quantite: { lt: prisma.stockItem.fields.stockMinimum }, deletedAt: null },
      }),
    ]);

    // Calculs simples — enrichissables avec les vrais KPIs
    const kpis = {
      workOrdersCreated: woCreated,
      workOrdersClosed: woClosed,
      mttr: '—',
      mtbf: '—',
      availability: '—',
      totalCost: '—',
      preventiveCompliance: '—',
      stockAlerts,
    };

    const pdfBuffer = await generateMonthlyReportPDF({ month: prevMonth, year: prevYear, kpis });

    const filename = `rapport-mensuel-${prevYear}-${String(prevMonth).padStart(2, '0')}.pdf`;
    const filepath = path.join(REPORT_DIR, filename);
    fs.writeFileSync(filepath, pdfBuffer);

    logger.info(`Rapport mensuel genere : ${filename}`);
    return { filename, filepath };
  },
  { connection: redisClient }
);

worker.on('failed', (job, err) => {
  logger.error(`Job rapport mensuel echoue : ${err.message}`, { jobId: job?.id });
});
