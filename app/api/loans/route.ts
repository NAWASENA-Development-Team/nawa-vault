import { NextResponse } from 'next/server';
import { db } from '@/db';
import { loans, assets } from '@/db/schema';
import { getLoanCode } from '@/lib/db-utils';
import { getAppSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allLoans = await db.select().from(loans).orderBy(desc(loans.createdAt)).limit(50);
  return NextResponse.json({ data: allLoans });
}


export async function POST(req: Request) {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const loanCode = getLoanCode();
  
  const [newLoan] = await db.insert(loans).values({
    loanCode,
    assetId: body.assetId,
    borrowerName: body.borrowerName,
    borrowerClass: body.borrowerClass,
    borrowerContact: body.borrowerContact,
    operatorId: parseInt((session.user as any).id),
    purpose: body.purpose,
    dueDate: new Date(body.dueDate)
  }).returning();

  await db.update(assets).set({ 
    status: 'borrowed',
    location: body.gpsLocation || 'Lokasi Peminjam' 
  }).where(eq(assets.id, body.assetId));

  return NextResponse.json({ data: newLoan, message: 'Loan processed' }, { status: 201 });
}