import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getAppSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { assetId: string } }) {
  const session = await getAppSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const qrDataUrl = await QRCode.toDataURL(params.assetId, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
    return NextResponse.json({ data: qrDataUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}