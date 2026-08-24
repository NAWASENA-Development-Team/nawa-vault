import { NextResponse } from 'next/server';
import { db } from '@/db';
import { ownerInstances } from '@/db/schema';
import { getAppSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// PUT: Edit Instansi
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAppSession();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!body.code || !body.name) {
      return NextResponse.json({ error: 'Kode dan Nama tidak boleh kosong' }, { status: 400 });
    }

    const [updated] = await db
      .update(ownerInstances)
      .set({
        code: body.code.toUpperCase().trim(),
        name: body.name.trim(),
        description: body.description ?? null,
      })
      .where(eq(ownerInstances.id, parseInt(id)))
      .returning();

    return NextResponse.json({ data: updated, message: 'Instansi berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus Instansi
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAppSession();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    await db.delete(ownerInstances).where(eq(ownerInstances.id, parseInt(id)));

    return NextResponse.json({ message: 'Instansi berhasil dihapus' });
  } catch (error: any) {
    if (error.code === '23503') { // Postgres Foreign Key Violation
      return NextResponse.json({ error: 'Tidak dapat menghapus Instansi ini karena masih ada barang/aset yang menggunakan instansi ini. Hapus atau ubah instansi barang tersebut terlebih dahulu.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
