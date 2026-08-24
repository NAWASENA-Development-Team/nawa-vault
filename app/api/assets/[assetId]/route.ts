import { NextResponse } from 'next/server';
import { db } from '@/db';
import { assets, ownerInstances } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAppSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Prevent stale caching of asset status

export async function GET(
  req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    { headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=120' } }
  );
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'admin' && role !== 'operator') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { assetId } = await params;
  const decoded = decodeURIComponent(assetId);
  const body = await req.json();

  const existing = await db.query.assets.findFirst({
    where: eq(assets.assetId, decoded),
  });
  if (!existing) {
    return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 });
  }

  const [updatedAsset] = await db
    .update(assets)
    .set({
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      condition: body.condition ?? existing.condition,
      location: body.location ?? existing.location,
      status: body.status ?? existing.status,
      quantity: body.quantity ?? existing.quantity,
      updatedAt: new Date(),
    })
    .where(eq(assets.assetId, decoded))
    .returning();

  return NextResponse.json({ data: updatedAsset, message: 'Aset berhasil diperbarui' });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { assetId } = await params;
  const decoded = decodeURIComponent(assetId);

  const existing = await db.query.assets.findFirst({
    where: eq(assets.assetId, decoded),
  });
  if (!existing) {
    return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 });
  }

  await db.delete(assets).where(eq(assets.assetId, decoded));

  return NextResponse.json({ message: 'Aset berhasil dihapus' });
}
