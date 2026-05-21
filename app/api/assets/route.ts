import { NextResponse } from 'next/server';
import { db } from '@/db';
import { assets } from '@/db/schema';
import { generateAssetId } from '@/lib/db-utils';
import { getAppSession } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const allAssets = await db.query.assets.findMany({
    limit: 20
  });
  return NextResponse.json({ data: allAssets });
}

export async function POST(req: Request) {
  const session = await getAppSession();
  if (!session || (session.user as any).role === 'member') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
  const body = await req.json();
  const assetId = await generateAssetId(body.categoryPrefix, body.name);
  
  // Find or create category
  let categoryId = body.categoryId;
  if (body.categoryPrefix) {
    const { categories } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');
    const existingCat = await db.query.categories.findFirst({
      where: eq(categories.prefix, body.categoryPrefix)
    });
    
    if (existingCat) {
      categoryId = existingCat.id;
    } else {
      const [newCat] = await db.insert(categories).values({
        name: body.categoryPrefix,
        prefix: body.categoryPrefix,
      }).returning();
      categoryId = newCat.id;
    }
  }
  
  const [newAsset] = await db.insert(assets).values({
    assetId,
    name: body.name,
    description: body.description,
    categoryId: categoryId,
    condition: body.condition,
    quantity: body.quantity,
    location: body.location,
    baseLocation: body.location
  }).returning();
  
  return NextResponse.json({ data: newAsset, message: 'Asset created' }, { status: 201 });
}