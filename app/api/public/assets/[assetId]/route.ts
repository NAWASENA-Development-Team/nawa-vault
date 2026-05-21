import { NextResponse } from 'next/server';
import { db } from '@/db';
import { assets, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Public endpoint — no session required.
 * Used when someone scans a QR code externally (e.g. Google Lens)
 * and gets redirected to /borrow/[assetId].
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;

  const [asset] = await db
    .select({
      id: assets.id,
      assetId: assets.assetId,
      name: assets.name,
      description: assets.description,
      status: assets.status,
      condition: assets.condition,
      quantity: assets.quantity,
      location: assets.location,
      baseLocation: assets.baseLocation,
      imageUrl: assets.imageUrl,
      categoryName: categories.name,
    })
    .from(assets)
    .leftJoin(categories, eq(assets.categoryId, categories.id))
    .where(eq(assets.assetId, assetId));

  if (!asset) {
    return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ data: asset });
}
