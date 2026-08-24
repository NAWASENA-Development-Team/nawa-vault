import { NextResponse } from 'next/server';
import { db } from '@/db';
import { assets } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

/**
 * Public endpoint — no session required.
 * Used when someone scans a QR code externally (e.g. Google Lens / phone camera)
 * and gets redirected to /borrow/[assetId].
 * Supports URL-encoded assetId (EAS0001%2FTU → EAS0001/TU).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;
  const decoded = decodeURIComponent(assetId);

  const result = await db.query.assets.findFirst({
    where: eq(assets.assetId, decoded),
    with: {
      category: true,
      ownerInstance: true,
    },
  });

  if (!result) {
    return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(
    { data: result },
    { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' } }
  );
}
