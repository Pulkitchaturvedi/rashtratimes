import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error('Usage: pnpm --filter apps/api ts-node seeders/set-password.ts <email> <password>');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }
  const passwordHash = await argon2.hash(password);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  console.info(`Password updated for ${email}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
