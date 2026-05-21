import { NextResponse } from 'next/server';
import { db } from '@/db';
import { assets } from '@/db/schema';
import { getAppSession } from '@/lib/auth';

export async function GET() {
  const session = await getAppSession();
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allAssets = await db.query.assets.findMany();

  // Create CSV header
  let csv = 'ID,Nama Aset,Status,Kondisi,Lokasi Asli,Lokasi Saat Ini\n';
  
  // Add rows
  allAssets.forEach(asset => {
    csv += `"${asset.assetId}","${asset.name}","${asset.status}","${asset.condition}","${asset.baseLocation || '-'}","${asset.location || '-'}"\n`;
  });

  // Return as downloadable file
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="laporan_aset.csv"'
    }
  });
}
