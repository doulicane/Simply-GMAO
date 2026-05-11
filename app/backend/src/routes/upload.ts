/**
 * =============================================================================
 * Routes Upload de fichiers
 * =============================================================================
 * Endpoints :
 *   POST /api/upload      — Upload d'un document (PDF, images)
 *   POST /api/upload/photo — Upload d'une photo (images uniquement, 5 Mo max)
 *
 * Stockage local avec organisation /uploads/YYYY/MM/UUID.ext.
 * Multer configure avec whitelist MIME types strict, renommage UUID v4,
 * et limite de taille par type.
 * =============================================================================
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { env } from '../config/env';

const router = Router();

// ---------------------------------------------------------------------------
// Configuration du repertoire d'upload
// ---------------------------------------------------------------------------
const UPLOAD_DIR = env.UPLOAD_DIR;
const MAX_DOC_SIZE = 50 * 1024 * 1024; // 50 Mo pour documents techniques
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 Mo

// Sous-repertoires par type
const SUBDIRS = {
  documents: path.join(UPLOAD_DIR, 'documents'),
  photos: path.join(UPLOAD_DIR, 'photos'),
  checklists: path.join(UPLOAD_DIR, 'checklists'),
  qrcodes: path.join(UPLOAD_DIR, 'qrcodes'),
};

// Creation des repertoires si inexistants
Object.values(SUBDIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ---------------------------------------------------------------------------
// Helpers de validation de type MIME
// ---------------------------------------------------------------------------
const ALLOWED_DOCUMENT_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const ALLOWED_PHOTO_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function isAllowedMime(mimetype: string, allowed: Set<string>): boolean {
  return allowed.has(mimetype);
}

function getExtensionFromMime(mimetype: string): string {
  const map: Record<string, string> = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  return map[mimetype] || '';
}

// ---------------------------------------------------------------------------
// Configuration Multer (stockage disque)
// ---------------------------------------------------------------------------
function createStorage(subdir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
      const dest = path.join(subdir, yearMonth);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      // Renommage avec UUID v4 + extension derivee du MIME type
      const ext = getExtensionFromMime(file.mimetype);
      if (!ext) {
        return cb(new AppError('Type de fichier non supporte', 400) as any, '');
      }
      cb(null, `${randomUUID()}${ext}`);
    },
  });
}

// ---------------------------------------------------------------------------
// Filtre de type de fichier strict (whitelist MIME types)
// ---------------------------------------------------------------------------
function createFileFilter(allowedMimes: Set<string>) {
  return (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (isAllowedMime(file.mimetype, allowedMimes)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          `Type de fichier non autorise : ${file.mimetype}. Types acceptes : ${[...allowedMimes].join(', ')}`,
          400
        ) as any
      );
    }
  };
}

// ---------------------------------------------------------------------------
// Middlewares Multer pre-configures
// ---------------------------------------------------------------------------
const uploadDocument = multer({
  storage: createStorage(SUBDIRS.documents),
  limits: { fileSize: MAX_DOC_SIZE },
  fileFilter: createFileFilter(ALLOWED_DOCUMENT_MIMES),
});

const uploadPhoto = multer({
  storage: createStorage(SUBDIRS.photos),
  limits: { fileSize: MAX_PHOTO_SIZE },
  fileFilter: createFileFilter(ALLOWED_PHOTO_MIMES),
});

// ---------------------------------------------------------------------------
// POST /api/upload — Upload generique (determine le type par le champ)
// ---------------------------------------------------------------------------
const uploadSchema = z.object({
  type: z.enum(['document', 'photo', 'checklist']),
  equipmentId: z.string().uuid().optional(),
});

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.TECHNICIEN, Role.HSE),
  uploadDocument.single('file'),
  validate(uploadSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('Aucun fichier fourni', 400);
      }

      const { type, equipmentId } = req.body;
      const file = req.file;

      // Construire l'URL relative
      const relativePath = path.relative(UPLOAD_DIR, file.path).replace(/\\/g, '/');

      // Si equipmentId fourni, creer l'entree Document en base
      let document = null;
      if (equipmentId) {
        document = await prisma.document.create({
          data: {
            equipmentId,
            filename: file.filename,
            originalName: file.originalname,
            type,
            path: relativePath,
            uploadedBy: req.user!.id,
          },
        });
      }

      logger.info(`Fichier upload : ${file.filename} (${type}) par ${req.user!.email}`);

      res.status(201).json({
        success: true,
        data: {
          filename: file.filename,
          originalName: file.originalname,
          type,
          path: relativePath,
          size: file.size,
          mimetype: file.mimetype,
          documentId: document?.id,
        },
        message: 'Fichier upload avec succes',
      });
    } catch (err) {
      next(err);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/upload/photo — Upload photo (5 Mo max)
// ---------------------------------------------------------------------------
router.post(
  '/photo',
  authenticate,
  authorize(Role.ADMIN, Role.RESPONSABLE, Role.TECHNICIEN, Role.OPERATEUR, Role.HSE),
  uploadPhoto.single('photo'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('Aucune photo fournie', 400);
      }

      const file = req.file;
      const relativePath = path.relative(UPLOAD_DIR, file.path).replace(/\\/g, '/');

      logger.info(`Photo upload : ${file.filename} par ${req.user!.email}`);

      res.status(201).json({
        success: true,
        data: {
          filename: file.filename,
          originalName: file.originalname,
          path: relativePath,
          size: file.size,
        },
        message: 'Photo upload avec succes',
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
