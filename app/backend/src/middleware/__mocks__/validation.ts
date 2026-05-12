import { z } from 'zod';

export const validate = () => (_req: any, _res: any, next: any) => next();
export const validateRequest = () => (_req: any, _res: any, next: any) => next();

const baseSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const paginationQuerySchema = baseSchema;
export const uuidParamSchema = z.object({ id: z.string() });
