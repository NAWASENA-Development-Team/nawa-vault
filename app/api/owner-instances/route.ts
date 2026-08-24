import { NextResponse } from 'next/server';
import { db } from '@/db';
import { ownerInstances } from '@/db/schema';
import { getAppSession } from '@/lib/auth';
import { asc } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/owner-instances
 * Returns all divisi/unit kepemilikan aset.
 * Used for dropdown in asset creation form.
 */
export async function GET() {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const instances = await db
    .select()
    .from(ownerInstances)
    .orderBy(asc(ownerInstances.code));

  return NextResponse.json({ data: instances });
}

/**
 * POST /api/owner-instances
 * Create a new owner instance (admin only).
 */
export async function POST(req: Request) {
  const session = await getAppSession();
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  if (!body.code || !body.name) {
    return NextResponse.json({ error: 'Wajib isi: code dan name' }, { status: 400 });
  }

  const [newInstance] = await db
    .insert(ownerInstances)
    .values({
      code: body.code.toUpperCase().trim(),
      name: body.name.trim(),
      description: body.description ?? null,
    })
    .returning();

  return NextResponse.json({ data: newInstance, message: 'Instance berhasil ditambahkan' }, { status: 201 });
}
