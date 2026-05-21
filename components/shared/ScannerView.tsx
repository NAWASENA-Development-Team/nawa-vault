"use client";
import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export function ScannerView({ onScan }: { onScan: (text: string) => void }) {
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    
    scanner.render(
      (decodedText) => { scanner.clear(); onScan(decodedText); },
      (err) => { console.warn("QR Error:", err); }
    );

    return () => { scanner.clear().catch(console.error); };
  }, [onScan]);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
      <div id="reader" className="w-full" />
      {error && <p className="p-4 text-red-400 text-sm text-center">{error}</p>}
    </div>
  );
}