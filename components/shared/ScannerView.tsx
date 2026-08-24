"use client";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface ScannerViewProps {
  onScan: (text: string) => void;
  active?: boolean; // allow parent to pause scanner
}

export function ScannerView({ onScan, active = true }: ScannerViewProps) {
  const [error, setError] = useState<string>("");
  const [ready, setReady] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const scannedRef = useRef(false); // prevent double fire

  useEffect(() => {
    if (!active) return;

    const id = "qr-reader-" + Math.random().toString(36).slice(2);
    const el = document.getElementById("qr-reader");
    if (!el) return;
    el.id = id; // use unique id to avoid conflicts

    const qrScanner = new Html5Qrcode(id);
    scannerRef.current = qrScanner;
    startedRef.current = false;
    scannedRef.current = false;

    qrScanner
      .start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (w: number, h: number) => {
            const s = Math.min(w, h) * 0.65;
            return { width: s, height: s };
          },
          aspectRatio: 1,
        },
        (decodedText) => {
          if (scannedRef.current) return;
          scannedRef.current = true;
          qrScanner.stop().catch(() => {}).finally(() => onScan(decodedText));
        },
        () => {} // suppress per-frame errors
      )
      .then(() => {
        startedRef.current = true;
        setReady(true);
      })
      .catch((err: Error) => {
        console.error("Camera start failed:", err);
        setError(
          err?.message?.includes("NotAllowed")
            ? "Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser."
            : "Gagal mengakses kamera. Pastikan tidak ada aplikasi lain yang menggunakan kamera."
        );
      });

    return () => {
      if (startedRef.current && qrScanner.isScanning) {
        qrScanner.stop().catch(() => {});
      }
    };
  }, [active, onScan]);

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950 relative">
      <div className="relative aspect-square w-full">
        {/* Scanner mount point */}
        <div id="qr-reader" className="absolute inset-0 overflow-hidden [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>#qr-shaded-region]:hidden" />

        {/* Overlay — shown when ready */}
        {ready && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Scan animation bar */}
            <div className="absolute left-[17.5%] right-[17.5%] h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_12px_#8b5cf6] animate-scan z-10" />

            {/* Corner brackets */}
            <div className="w-[65%] h-[65%] border border-white/10 rounded-xl relative">
              <span className="absolute top-0 left-0 w-5 h-5 border-t-[3px] border-l-[3px] border-violet-400 rounded-tl-lg -mt-px -ml-px" />
              <span className="absolute top-0 right-0 w-5 h-5 border-t-[3px] border-r-[3px] border-violet-400 rounded-tr-lg -mt-px -mr-px" />
              <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[3px] border-l-[3px] border-violet-400 rounded-bl-lg -mb-px -ml-px" />
              <span className="absolute bottom-0 right-0 w-5 h-5 border-b-[3px] border-r-[3px] border-violet-400 rounded-br-lg -mb-px -mr-px" />
            </div>
          </div>
        )}

        {/* Loading state */}
        {!ready && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 z-20">
            <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            <p className="text-xs font-medium text-slate-400">Menghubungkan kamera...</p>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-5 text-center bg-rose-950/40 border-t border-rose-500/20">
          <p className="text-rose-400 text-sm font-semibold leading-snug">{error}</p>
        </div>
      )}
    </div>
  );
}