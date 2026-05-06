/**
 * =============================================================================
 * Middleware de validation Zod
 * =============================================================================
 * Valide les donnees entrantes (body, query, params) avec des schemas Zod.
 * Renvoie une erreur 400 avec les details de validation si le schema echoue.
 * =============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler';

// ---------------------------------------------------------------------------
// Types de donnees a valider
// ---------------------------------------------------------------------------
type ValidationTarget = 'body' | 'query' | 'params';

// ---------------------------------------------------------------------------
// Factory de middleware de validation
// ---------------------------------------------------------------------------
export function validate<T>(schema: ZodSchema<T>, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = req[target];
    const result = schema.safeParse(data);

    if (result.success) {
      // Remplacer les donnees validees (coercition des types)
      req[target] = result.data as any;
      return next();
    }

    // Formatage des erreurs Zod
    const errors = formatZodErrors(result.error);
    next(
      new AppError(
        `Validation echouee : ${errors.join('; ')}`,
        400
      )
    );
  };
}

// ---------------------------------------------------------------------------
// Validation multiple (body + query + params en une fois)
// ---------------------------------------------------------------------------
interface ValidationSchemas {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const allErrors: string[] = [];

    for (const [target, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      const data = req[target as ValidationTarget];
      const result = schema.safeParse(data);

      if (!result.success) {
        allErrors.push(...formatZodErrors(result.error, target));
      } else {
        req[target as ValidationTarget] = result.data as any;
      }
    }

    if (allErrors.length > 0) {
      return next(new AppError(`Validation echouee : ${allErrors.join('; ')}`, 400));
    }

    next();
  };
}

// ---------------------------------------------------------------------------
// Formatage lisible des erreurs Zod
// ---------------------------------------------------------------------------
function formatZodErrors(error: ZodError, prefix: string = ''): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'global';
    const prefixStr = prefix ? `[${prefix}] ` : '';
    return `${prefixStr}${path} : ${issue.message}`;
  });
}

// ---------------------------------------------------------------------------
// Schemas de validation communs (reutilisables)
// ---------------------------------------------------------------------------
export const commonSchemas = {
  // Identifiant UUID
  uuid: (field: string) => ({
    [field]: z.string().uuid(`Le champ ${field} doit etre un UUID valide`),
  }),
};

import { z } from 'zod';

// Schema pagination (query)
export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

// Schema UUID param
export const uuidParamSchema = z.object({
  id: z.string().uuid('Identifiant invalide'),
});
