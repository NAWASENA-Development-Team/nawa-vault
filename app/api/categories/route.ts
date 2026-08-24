import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { getCategoryTree } from '@/lib/db-utils';
import { getAppSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const tree = await getCategoryTree();
  return NextResponse.json({ data: tree });
}

export async function POST(req: Request) {
  try {
    const session = await getAppSession();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name || !body.code || !body.level) {
      return NextResponse.json({ error: 'name, code, dan level wajib diisi' }, { status: 400 });
    }

    const [newCat] = await db.insert(categories).values({
      name: body.name.trim(),
      code: body.code.toUpperCase().trim(),
      level: body.level,
      parentId: body.parentId ?? null,
      description: body.description ?? null,
    }).returning();

    return NextResponse.json({ data: newCat, message: 'Kategori berhasil ditambahkan' }, { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Kode kategori sudah digunakan' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
