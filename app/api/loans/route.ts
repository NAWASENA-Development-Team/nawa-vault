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
  
  try {
    const newLoan = await db.transaction(async (tx) => {
      // 1. Cek apakah aset ada dan berstatus 'available'
      const [asset] = await tx.select().from(assets).where(eq(assets.id, body.assetId));
      if (!asset) {
        throw new Error('Aset tidak ditemukan');
      }
      if (asset.status !== 'available') {
        throw new Error(`Aset tidak tersedia (Status: ${asset.status})`);
      }

      // 2. Buat Peminjaman
      const [insertedLoan] = await tx.insert(loans).values({
        loanCode,
        assetId: body.assetId,
        borrowerName: body.borrowerName,
        borrowerClass: body.borrowerClass,
        borrowerContact: body.borrowerContact,
        operatorId: parseInt((session.user as any).id),
        purpose: body.purpose,
        dueDate: new Date(body.dueDate)
      }).returning();

      // 3. Update status aset
      await tx.update(assets).set({ 
        status: 'borrowed',
        location: body.gpsLocation || 'Lokasi Peminjam' 
      }).where(eq(assets.id, body.assetId));

      return insertedLoan;
    });

    return NextResponse.json({ data: newLoan, message: 'Loan processed' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}