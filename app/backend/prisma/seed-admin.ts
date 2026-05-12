import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const rawPassword = process.env.ADMIN_INITIAL_PASSWORD || crypto.randomBytes(16).toString('hex');
  const passwordHash = await bcrypt.hash(rawPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@simply-gmao.fr' },
    update: {},
    create: {
      email: 'admin@simply-gmao.fr',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'System',
      role: 'ADMIN',
      active: true,
    },
  });

  console.log(`🔐 Mot de passe genere : ${rawPassword}`);
  console.log(`✅ Admin cree : ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
