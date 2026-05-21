import { db } from './index';
import { categories, users, assets } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  // Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  await db.insert(users).values({
    name: 'Admin OSIS',
    email: 'admin@sman2jonggol.sch.id',
    passwordHash,
    role: 'admin'
  }).onConflictDoNothing();

  // Categories
  const cats = await db.insert(categories).values([
    { name: 'OSIS Pusat', prefix: 'OSIS', description: 'Inventaris utama OSIS' },
    { name: 'Pramuka', prefix: 'PRM', description: 'Peralatan Ekstrakurikuler Pramuka' },
    { name: 'Lab Komputer TKJ', prefix: 'TKJ', description: 'Alat dan Komponen Jaringan' }
  ]).returning();

  // Sample Assets
  await db.insert(assets).values([
    { assetId: 'OSIS-MIC-001', name: 'Mikrofon Wireless', categoryId: cats[0].id, condition: 'good' },
    { assetId: 'PRM-TEN-001', name: 'Tenda Regu', categoryId: cats[1].id, condition: 'good' },
    { assetId: 'TKJ-CRV-001', name: 'Crimping Tool', categoryId: cats[2].id, condition: 'fair' }
  ]).onConflictDoNothing();

  console.log('Seed completed successfully.');
  process.exit(0);
}
seed().catch(console.error);