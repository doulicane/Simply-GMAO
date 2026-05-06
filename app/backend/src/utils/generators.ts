import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const MAX_RETRIES = 10;

function randomSuffix(length = 5): string {
  return Math.floor(Math.random() * 10 ** length).toString().padStart(length, '0');
}

export async function generateUniqueBTNumber(
  prisma: PrismaClient,
  prefix = ''
): Promise<string> {
  const year = new Date().getFullYear();
  const middle = prefix ? `-${prefix}-` : '-';

  for (let i = 0; i < MAX_RETRIES; i++) {
    const numero = `BT-${year}${middle}${randomSuffix()}`;
    const existing = await prisma.workOrder.findUnique({ where: { numero } });
    if (!existing) return numero;
  }

  throw new AppError(`Impossible de generer un numero de BT unique apres ${MAX_RETRIES} tentatives`, 500);
}

export async function generateUniqueTicketNumber(
  prisma: PrismaClient
): Promise<string> {
  const year = new Date().getFullYear();

  for (let i = 0; i < MAX_RETRIES; i++) {
    const numero = `TK-${year}-${randomSuffix()}`;
    const existing = await prisma.ticket.findUnique({ where: { numero } });
    if (!existing) return numero;
  }

  throw new AppError(`Impossible de generer un numero de ticket unique apres ${MAX_RETRIES} tentatives`, 500);
}
