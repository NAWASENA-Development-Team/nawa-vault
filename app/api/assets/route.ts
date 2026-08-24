import { NextResponse } from 'next/server';
import { db } from '@/db';
import { assets, categories, ownerInstances } from '@/db/schema';
import { generateAssetId } from '@/lib/db-utils';
import { getAppSession } from '@/lib/auth';
import { eq, desc, ilike, and, or } from 'drizzle-orm';

export const runtime = 'nodejs'; // ensures Neon HTTP is used (not Edge)
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q');
  const status = searchParams.get('status');
  const categoryCode = searchParams.get('category');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0');

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(assets.name, `%${search}%`),
        ilike(assets.assetId, `%${search}%`)
      )
    );
  }
  if (status) conditions.push(eq(assets.status, status));
  if (categoryCode) {
    // Resolve category id from code
    const cat = await db.query.categories.findFirst({ where: eq(categories.code, categoryCode) });
    if (cat) conditions.push(eq(assets.categoryId, cat.id));
  }

  const allAssets = await db
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
      categoryId: assets.categoryId,
      ownerInstanceId: assets.ownerInstanceId,
      createdAt: assets.createdAt,
      updatedAt: assets.updatedAt,
    })
    .from(assets)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(assets.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ data: allAssets, meta: { limit, offset, count: allAssets.length } });
}

export async function POST(req: Request) {
  const session = await getAppSession();
  if (!session || (session.user as any).role === 'member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();

  // Validate required fields
  if (!body.subcategoryCode || !body.ownerCode || !body.name) {
    return NextResponse.json(
      { error: 'Wajib isi: subcategoryCode, ownerCode, name' },
      { status: 400 }
    );
  }

  // Verify subcategory exists (level 3)
  const subcat = await db.query.categories.findFirst({
    where: and(eq(categories.code, body.subcategoryCode.toUpperCase()), eq(categories.level, 3)),
  });
  if (!subcat) {
    return NextResponse.json({ error: 'Subkategori tidak ditemukan' }, { status: 400 });
  }

  // Verify owner instance
  const owner = await db.query.ownerInstances.findFirst({
    where: eq(ownerInstances.code, body.ownerCode.toUpperCase()),
  });
  if (!owner) {
    return NextResponse.json({ error: 'Instance/divisi kepemilikan tidak ditemukan' }, { status: 400 });
  }

  const assetId = await generateAssetId(body.subcategoryCode, body.ownerCode);

  const [newAsset] = await db
    .insert(assets)
    .values({
      assetId,
      name: body.name,
      description: body.description ?? null,
      categoryId: subcat.id,
      ownerInstanceId: owner.id,
      condition: body.condition ?? 'good',
      quantity: body.quantity ?? 1,
      location: body.location ?? null,
      baseLocation: body.location ?? null,
    })
    .returning();

  return NextResponse.json({ data: newAsset, message: 'Aset berhasil ditambahkan' }, { status: 201 });
}