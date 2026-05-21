import { NextResponse } from 'next/server';
import { db } from '@/db';
import { assets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAppSession } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { assetId } = await params;

  const [asset] = await db.select().from(assets).where(eq(assets.assetId, assetId));

  if (!asset) {
    return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ data: asset });
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
  const body = await req.json();

  const [existing] = await db.select().from(assets).where(eq(assets.assetId, assetId));
  if (!existing) {
    return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 });
  }

  const [updatedAsset] = await db
    .update(assets)
    .set({
      name: body.name,
      description: body.description,
      condition: body.condition,
      location: body.location,
      status: body.status,
      updatedAt: new Date(),
    })
    .where(eq(assets.assetId, assetId))
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

  const [existing] = await db.select().from(assets).where(eq(assets.assetId, assetId));
  if (!existing) {
    return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 });
  }

  await db.delete(assets).where(eq(assets.assetId, assetId));

  return NextResponse.json({ message: 'Aset berhasil dihapus' });
}
