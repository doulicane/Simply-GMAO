import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { Role, EquipmentCriticality, EquipmentStatus } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads');
const IMPORT_DIR = path.join(UPLOAD_DIR, 'imports');
if (!fs.existsSync(IMPORT_DIR)) fs.mkdirSync(IMPORT_DIR, { recursive: true });

const ALLOWED_IMPORT_MIMES = new Set([
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

function getExtensionFromMime(mimetype: string): string {
  const map: Record<string, string> = {
    'text/csv': '.csv',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  };
  return map[mimetype] || '';
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMPORT_DIR),
  filename: (_req, file, cb) => {
    const ext = getExtensionFromMime(file.mimetype) || path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max pour imports
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMPORT_MIMES.has(file.mimetype)) cb(null, true);
    else cb(new AppError('Type de fichier non autorise. CSV ou Excel uniquement.', 400) as any);
  },
});

const importSchema = z.object({
  type: z.enum(['equipments', 'stock-items']),
  dryRun: z.enum(['true', 'false']).optional().default('false'),
});

// ---------------------------------------------------------------------------
// POST /api/import — Upload + import CSV/Excel
// ---------------------------------------------------------------------------
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE),
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) throw new AppError('Aucun fichier fourni', 400);

      const parseResult = importSchema.safeParse(req.body);
      if (!parseResult.success) throw new AppError('Type d\'import invalide', 400);
      const { type, dryRun } = parseResult.data;
      const isDryRun = dryRun === 'true';

      const XLSX = await import('xlsx');
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rows.length === 0) {
        fs.unlinkSync(req.file.path);
        throw new AppError('Fichier vide ou sans donnees', 400);
      }

      const result = type === 'equipments'
        ? await importEquipments(rows, isDryRun, req.user!.id)
        : await importStockItems(rows, isDryRun, req.user!.id);

      fs.unlinkSync(req.file.path);

      logger.info(`Import ${type} — ${result.imported} lignes importees, ${result.errors} erreurs (dryRun=${isDryRun}) par ${req.user!.email}`);

      res.status(200).json({
        success: true,
        data: {
          type,
          dryRun: isDryRun,
          totalRows: rows.length,
          ...result,
        },
      });
    } catch (err) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// Helpers d'import
// ---------------------------------------------------------------------------

interface ImportResult {
  imported: number;
  errors: number;
  details: { row: number; message: string }[];
}

async function importEquipments(rows: any[], dryRun: boolean, _userId: string): Promise<ImportResult> {
  const details: { row: number; message: string }[] = [];
  let imported = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 pour header

    try {
      const code = String(row.code || row.Code || row.CODE || '').trim();
      const name = String(row.name || row.Name || row.Nom || row.nom || '').trim();
      const typeEq = String(row.type || row.Type || row.TYPE || '').trim();
      const criticality = String(row.criticality || row.Criticality || row.criticite || row.Criticite || 'MOYENNE').trim().toUpperCase();
      const localisation = String(row.localisation || row.Localisation || row.localisation || '').trim() || null;
      const ligneCode = String(row.ligne || row.Ligne || row.ligneCode || '').trim() || null;

      if (!code || !name || !typeEq) {
        details.push({ row: rowNum, message: 'code, name et type sont requis' });
        continue;
      }

      const crit = criticality as EquipmentCriticality;
      if (!Object.values(EquipmentCriticality).includes(crit)) {
        details.push({ row: rowNum, message: `Criticite invalide : ${crit}` });
        continue;
      }

      let ligneId: string | undefined;
      if (ligneCode) {
        const ligne = await prisma.ligne.findFirst({ where: { code: ligneCode } });
        if (!ligne) {
          details.push({ row: rowNum, message: `Ligne introuvable : ${ligneCode}` });
          continue;
        }
        ligneId = ligne.id;
      }

      if (!dryRun) {
        await prisma.equipment.upsert({
          where: { code },
          update: {
            name,
            type: typeEq,
            criticality: crit,
            localisation: localisation || undefined,
            ligneId: ligneId || undefined,
          },
          create: {
            code,
            name,
            type: typeEq,
            criticality: crit,
            localisation: localisation || undefined,
            ligneId: ligneId || undefined,
            statut: EquipmentStatus.EN_SERVICE,
          },
        });
      }
      imported++;
    } catch (err: any) {
      details.push({ row: rowNum, message: err.message || 'Erreur inconnue' });
    }
  }

  return { imported, errors: details.length, details };
}

async function importStockItems(rows: any[], dryRun: boolean, _userId: string): Promise<ImportResult> {
  const details: { row: number; message: string }[] = [];
  let imported = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    try {
      const code = String(row.code || row.Code || row.CODE || '').trim();
      const name = String(row.name || row.Name || row.Nom || row.nom || '').trim();
      const famille = String(row.famille || row.Famille || row.famille || '').trim();
      const quantite = Number(row.quantite || row.Quantite || row.quantite || 0);
      const stockMinimum = Number(row.stockMinimum || row.StockMinimum || row.stock_minimum || 0);
      const localisation = String(row.localisation || row.Localisation || '').trim() || null;
      const unite = String(row.unite || row.Unite || row.unite || '').trim() || null;
      const prixUnitaire = row.prixUnitaire || row.PrixUnitaire || row.prix_unitaire || undefined;

      if (!code || !name || !famille) {
        details.push({ row: rowNum, message: 'code, name et famille sont requis' });
        continue;
      }

      if (Number.isNaN(quantite) || Number.isNaN(stockMinimum)) {
        details.push({ row: rowNum, message: 'quantite et stockMinimum doivent etre des nombres' });
        continue;
      }

      if (!dryRun) {
        await prisma.stockItem.upsert({
          where: { code },
          update: {
            name,
            famille,
            quantite,
            stockMinimum,
            localisation: localisation || undefined,
            unite: unite || undefined,
            prixUnitaire: prixUnitaire !== undefined ? Number(prixUnitaire) : undefined,
          },
          create: {
            code,
            name,
            famille,
            quantite,
            stockMinimum,
            localisation: localisation || undefined,
            unite: unite || undefined,
            prixUnitaire: prixUnitaire !== undefined ? Number(prixUnitaire) : undefined,
          },
        });
      }
      imported++;
    } catch (err: any) {
      details.push({ row: rowNum, message: err.message || 'Erreur inconnue' });
    }
  }

  return { imported, errors: details.length, details };
}

export default router;
