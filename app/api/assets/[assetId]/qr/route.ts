import QRCode from 'qrcode';

export const runtime = 'nodejs';

/**
 * GET /api/assets/[assetId]/qr
 *
 * Returns a PNG QR code encoding the full borrow URL for the asset.
 * The URL format: https://vault.nawasena.site/borrow/[assetId]
 *
 * Auth is NOT required — the QR is printed on physical labels and
 * must be scannable by anyone with a phone camera. The borrow page
 * will enforce authentication after the redirect.
 *
 * Cache: 7 days (immutable) — the QR content never changes.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params;

  // Support both encoded (EAS0001%2FTU) and raw form (EAS0001/TU)
  const rawId = decodeURIComponent(assetId);

  // Use production domain — env override for local dev
  const baseUrl =
    process.env.NEXTAUTH_URL?.replace(/\/$/, '') ?? 'https://vault.nawasena.site';

  const targetUrl = `${baseUrl}/borrow/${encodeURIComponent(rawId)}`;

  const buffer = await QRCode.toBuffer(targetUrl, {
    errorCorrectionLevel: 'M',
    width: 400,        // high-res for print quality
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      // QR is static per assetId — cache aggressively
      'Cache-Control': 'public, max-age=604800, immutable',
      'Content-Disposition': `inline; filename="qr-${rawId.replace('/', '-')}.png"`,
    },
  });
}
