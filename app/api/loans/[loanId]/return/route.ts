import { NextResponse } from 'next/server';
import { db } from '@/db';
import { loans, assets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAppSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { loanId: string } }) {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const loanId = parseInt(params.loanId);

  const [updatedLoan] = await db.update(loans).set({
    status: 'returned',
    returnDate: new Date(),
    returnCondition: body.returnCondition,
    notes: body.notes
  }).where(eq(loans.id, loanId)).returning();

  const newAssetStatus = body.returnCondition === 'damaged' ? 'maintenance' : 'available';
  await db.update(assets).set({ status: newAssetStatus, condition: body.returnCondition })
    .where(eq(assets.id, updatedLoan.assetId!));

  return NextResponse.json({ data: updatedLoan, message: 'Asset returned successfully' });
}