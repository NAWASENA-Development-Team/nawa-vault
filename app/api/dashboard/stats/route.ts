import { NextResponse } from 'next/server';
import { db } from '@/db';
import { assets, loans } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getAppSession } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const totalAssets = await db.select({ count: sql<number>`count(*)` }).from(assets);
  const borrowedAssets = await db.select({ count: sql<number>`count(*)` }).from(assets).where(eq(assets.status, 'borrowed'));
  const overdueLoans = await db.select({ count: sql<number>`count(*)` }).from(loans).where(eq(loans.status, 'overdue'));
  const availableAssets = await db.select({ count: sql<number>`count(*)` }).from(assets).where(eq(assets.status, 'available'));

  return NextResponse.json({
    data: {
      total: totalAssets[0].count,
      borrowed: borrowedAssets[0].count,
      overdue: overdueLoans[0].count,
      available: availableAssets[0].count
    }
  });
}