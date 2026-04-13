import { PrismaClient, UserRole, TransactionType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // 1. Create Family
  const family = await prisma.family.create({
    data: {
      name: 'Keluarga Sakinah',
    },
  });

  // 2. Create Users
  const ayah = await prisma.user.create({
    data: {
      email: 'ayah@yumna.com',
      password,
      name: 'Ayah Ahmad',
      role: UserRole.KEPALA_KELUARGA,
      familyId: family.id,
    },
  });

  const ibu = await prisma.user.create({
    data: {
      email: 'ibu@yumna.com',
      password,
      name: 'Ibu Fatimah',
      role: UserRole.ISTRI,
      familyId: family.id,
    },
  });

  const anak = await prisma.user.create({
    data: {
      email: 'anak@yumna.com',
      password,
      name: 'Anak Sholeh',
      role: UserRole.ANAK,
      familyId: family.id,
    },
  });

  // 3. Create Wallets
  const tabunganUtama = await prisma.wallet.create({
    data: {
      name: 'Tabungan Utama',
      balance: 15000000,
      userId: ayah.id,
      familyId: family.id,
    },
  });

  const dompetHarian = await prisma.wallet.create({
    data: {
      name: 'Dompet Harian',
      balance: 2000000,
      userId: ibu.id,
      familyId: family.id,
    },
  });

  // 4. Create Transactions (Sample)
  await prisma.transaction.create({
    data: {
      amount: 500000,
      type: TransactionType.EXPENSE,
      category: 'Sedekah',
      description: 'Sedekah Jumat ke Masjid',
      userId: ayah.id,
      walletId: tabunganUtama.id,
      familyId: family.id,
      date: new Date(),
      metadata: { isZakat: false, impact: 'High' },
    },
  });

  await prisma.transaction.create({
    data: {
      amount: 100000,
      type: TransactionType.EXPENSE,
      category: 'Kebutuhan Pokok',
      description: 'Beli sayuran',
      userId: ibu.id,
      walletId: dompetHarian.id,
      familyId: family.id,
      date: new Date(),
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
