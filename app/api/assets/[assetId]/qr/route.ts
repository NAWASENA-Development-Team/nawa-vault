import QRCode from 'qrcode';
import { getAppSession } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getAppSession();
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { assetId } = await params;

  // Encode the full borrow URL so external QR scanners (Google Lens, phone camera)
  // redirect the user directly to the borrow page.
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const borrowUrl = `${baseUrl}/borrow/${assetId}`;

  const buffer = await QRCode.toBuffer(borrowUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
  });

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

