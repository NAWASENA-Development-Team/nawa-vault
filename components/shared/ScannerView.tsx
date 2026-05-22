"use client";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export function ScannerView({ onScan }: { onScan: (text: string) => void }) {
  const [error, setError] = useState<string>("");
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: "environment" }, // Prefer back camera (kamera belakang)
      {
        fps: 10,
        qrbox: (width, height) => {
          const size = Math.min(width, height) * 0.65;
          return { width: size, height: size };
        }
      },
      (decodedText) => {
        // Stop scanning and trigger success callback
        html5QrCode.stop().then(() => {
          onScan(decodedText);
        }).catch((err) => {
          console.error("Stop failed", err);
          onScan(decodedText);
        });
      },
      (errorMessage) => {
        // Quietly handle frame failures
      }
    ).then(() => {
      setCameraActive(true);
    }).catch((err) => {
      console.error("Camera start failed", err);
      setError("Gagal mengakses kamera belakang. Pastikan izin kamera telah diberikan.");
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch((err) => console.error("Cleanup stop failed", err));
      }
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
      <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center">
        {/* Scanner Viewport */}
        <div id="reader" className="w-full h-full overflow-hidden" />

        {/* Overlay Scanner Scanner Target Frame */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Animated Laser Scanning Bar */}
            <div className="absolute left-[17.5%] right-[17.5%] h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_0_10px_#8b5cf6] animate-scan z-10" />
            
            {/* Camera Frame Corners */}
            <div className="w-[65%] h-[65%] border-2 border-white/20 rounded-2xl relative flex items-center justify-center">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-violet-500 rounded-tl-xl -mt-0.5 -ml-0.5" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-violet-500 rounded-tr-xl -mt-0.5 -mr-0.5" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-violet-500 rounded-bl-xl -mb-0.5 -ml-0.5" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-violet-500 rounded-br-xl -mb-0.5 -mr-0.5" />
            </div>
          </div>
        )}

        {!cameraActive && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white bg-slate-950/80 z-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
            <p className="text-sm font-medium text-slate-400">Menghubungkan kamera belakang...</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-6 text-center bg-rose-500/10 border-t border-rose-500/20 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}
    </div>
  );
}