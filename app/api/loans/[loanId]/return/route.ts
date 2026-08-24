import { NextResponse } from 'next/server';
import { db } from '@/db';
import { loans, assets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAppSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ loanId: string }> }) {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { loanId: loanIdStr } = await params;
  const loanId = parseInt(loanIdStr);

  const [updatedLoan] = await db.update(loans).set({
    status: 'returned',
    returnDate: new Date(),
    returnCondition: body.returnCondition || 'good',
    notes: body.notes
  }).where(eq(loans.id, loanId)).returning();

  if (!updatedLoan) {
    return NextResponse.json({ error: 'Loan not found or already returned' }, { status: 404 });
  }

  const newAssetStatus = body.returnCondition === 'damaged' ? 'maintenance' : 'available';
  
  const asset = await db.query.assets.findFirst({ where: eq(assets.id, updatedLoan.assetId!) });

  await db.update(assets).set({ 
    status: newAssetStatus, 
    condition: body.returnCondition || asset?.condition || 'good',
    location: asset?.baseLocation || 'Sekretariat'
  })
    .where(eq(assets.id, updatedLoan.assetId!));

  return NextResponse.json({ data: updatedLoan, message: 'Asset returned successfully' });
}