import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { getAppSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// PUT: Edit category name/description (code and level are immutable)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAppSession();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Nama kategori tidak boleh kosong' }, { status: 400 });
    }

    const [updated] = await db
      .update(categories)
      .set({
        name: body.name.trim(),
        description: body.description ?? null,
      })
      .where(eq(categories.id, parseInt(id)))
      .returning();

    return NextResponse.json({ data: updated, message: 'Kategori berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a category (only if no assets use it and no children)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAppSession();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    await db.delete(categories).where(eq(categories.id, parseInt(id)));

    return NextResponse.json({ message: 'Kategori berhasil dihapus' });
  } catch (error: any) {
    if (error.code === '23503') {
      return NextResponse.json({ error: 'Tidak dapat menghapus kategori ini karena masih ada aset atau sub-kategori yang terhubung.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
