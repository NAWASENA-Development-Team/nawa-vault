import { NextResponse } from 'next/server';
import { db } from '@/db';
import { loans, assets } from '@/db/schema';
import { getAppSession } from '@/lib/auth';
import { eq, desc, and } from 'drizzle-orm';

export async function POST(req: Request) {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  
  if (!body.assetId) {
    return NextResponse.json({ error: 'Asset ID required' }, { status: 400 });
  }

  // Find the active loan for this asset
  const activeLoan = await db.query.loans.findFirst({
    where: and(eq(loans.assetId, body.assetId), eq(loans.status, 'active')),
    orderBy: desc(loans.createdAt)
  });

  if (!activeLoan) {
    return NextResponse.json({ error: 'No active loan found for this asset' }, { status: 404 });
  }

  // Mark loan as returned
  await db.update(loans).set({
    status: 'returned',
    returnDate: new Date(),
    returnCondition: body.returnCondition || 'good'
  }).where(eq(loans.id, activeLoan.id));

  // Get asset base location to reset it
  const asset = await db.query.assets.findFirst({ where: eq(assets.id, body.assetId) });
  
  // Reset asset to available and set location back to baseLocation
  await db.update(assets).set({ 
    status: 'available',
    location: asset?.baseLocation || 'Sekretariat' // Fallback
  }).where(eq(assets.id, body.assetId));

  return NextResponse.json({ message: 'Asset returned successfully' });
}
