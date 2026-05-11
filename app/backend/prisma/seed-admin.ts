import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin', 12);

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

  console.log(`✅ Admin créé : ${admin.email} / mot de passe : admin`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
