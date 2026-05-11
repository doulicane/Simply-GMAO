/**
 * =============================================================================
 * Helper de pagination universelle Prisma
 * =============================================================================
 * Fournit une fonction `paginate` qui encapsule la logique de pagination
 * pour toutes les requetes Prisma listantes.
 *
 * Usage :
 *   const result = await paginate({
 *     page: 1,
 *     limit: 20,
 *     model: prisma.equipment,
 *     where: { deletedAt: null },
 *     orderBy: { createdAt: 'desc' },
 *     include: { ligne: true },
 *   });
 *
 * Retour :
 *   {
 *     data: [...],
 *     pagination: { page: 1, limit: 20, total: 150, totalPages: 8, hasNext: true, hasPrev: false }
 *   }
 * =============================================================================
 */



export interface PaginateOptions<T, U> {
  page?: number;
  limit?: number;
  model: { findMany: (args: T) => Promise<U[]>; count: (args: { where?: any }) => Promise<number> };
  where?: any;
  orderBy?: any;
  include?: any;
  select?: any;
}

export interface PaginatedResult<U> {
  data: U[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function paginate<T, U>({
  page = 1,
  limit = 20,
  model,
  where,
  orderBy,
  include,
  select,
}: PaginateOptions<T, U>): Promise<PaginatedResult<U>> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      include,
      select,
      skip,
      take: safeLimit,
    } as T),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(total / safeLimit);

  return {
    data,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
  };
}
