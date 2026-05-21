"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Printer, Loader2 } from "lucide-react";

interface QRLabelProps {
  assetId: string;
  assetName: string;
}

export function QRLabel({ assetId, assetName }: QRLabelProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(assetId, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal membuat QR code");
      });

    return () => {
      cancelled = true;
    };
  }, [assetId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Printable label */}
      <div className="print-area flex w-64 flex-col items-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`QR Code untuk ${assetId}`}
            className="h-48 w-48"
          />
        ) : (
          <div className="flex h-48 w-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        <p className="mt-3 font-mono text-sm font-bold tracking-wide text-gray-900">
          {assetId}
        </p>
        <p className="mt-1 text-center text-xs text-gray-600">{assetName}</p>

        <div className="mt-3 w-full border-t border-dashed border-gray-300 pt-2">
          <p className="text-center text-[10px] font-medium uppercase tracking-widest text-gray-400">
            NAWA-VAULT
          </p>
        </div>
      </div>

      {/* Print button — hidden in print media */}
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 print:hidden"
      >
        <Printer className="h-4 w-4" />
        Cetak Label
      </button>
    </div>
  );
}
