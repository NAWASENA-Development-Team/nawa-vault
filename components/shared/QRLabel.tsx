"use client";

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QRLabelProps {
  assetId: string;
  assetName?: string;
}

export function QRLabel({ assetId, assetName }: QRLabelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const borrowUrl = `https://vault.nawasena.site/borrow/${encodeURIComponent(assetId)}`;

  // Update preview dengan ukuran wajar (250px) agar tidak raksasa di UI
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        borrowUrl,
        {
          width: 250, 
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
        },
        (error) => {
          if (error) console.error("Error generating QR:", error);
        }
      );
    }
  }, [borrowUrl]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1181;
      canvas.height = 1181;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      
      if (!ctx) throw new Error("Canvas context failed");

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = "/TEMPLATE.jpg";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Gagal meload TEMPLATE.jpg"));
      });

      // Draw original template
      ctx.drawImage(img, 0, 0, 1181, 1181);

      // --- LOGIKA GANTI WARNA FRAME ---
      const typeCode = assetId.charAt(0).toUpperCase();
      let targetR = 34, targetG = 197, targetB = 94; // Default Hijau (Lapangan/Outdoor)
      
      if (typeCode === 'E') {
        // Elektronik -> Merah
        targetR = 239; targetG = 68; targetB = 68; 
      } else if (typeCode === 'F') {
        // Furniture -> Biru
        targetR = 59; targetG = 130; targetB = 246;
      }

      // Kita hanya memanipulasi piksel tepi (margin 80px) agar motif tengah aman
      const imgData = ctx.getImageData(0, 0, 1181, 1181);
      const data = imgData.data;
      const margin = 80;

      for (let y = 0; y < 1181; y++) {
        for (let x = 0; x < 1181; x++) {
          if (x < margin || y < margin || x > 1181 - margin || y > 1181 - margin) {
            const i = (y * 1181 + x) * 4;
            const r = data[i], g = data[i+1], b = data[i+2];
            
            // Deteksi piksel berwarna hijau dominan (frame bawaan)
            if (g > 100 && g > r + 30 && g > b + 30) {
              // Ganti ke warna target sambil mempertahankan sedikit gradasi/shading
              const intensity = g / 255;
              data[i] = targetR * intensity;
              data[i+1] = targetG * intensity;
              data[i+2] = targetB * intensity;
            }
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
      // --------------------------------

      // Koordinat Kotak Merah
      const RED_BOX_SIZE = 679;
      const RED_BOX_X = (1181 - RED_BOX_SIZE) / 2; 
      const RED_BOX_Y = 193;

      // Generate QR Code untuk download (Ukuran penuh)
      const qrCanvas = document.createElement("canvas");
      await QRCode.toCanvas(qrCanvas, borrowUrl, {
        width: RED_BOX_SIZE,
        margin: 0, 
        color: { dark: '#000000', light: '#ffffff' }
      });

      // Tempelkan QR di atas kotak merah
      ctx.drawImage(qrCanvas, RED_BOX_X, RED_BOX_Y, RED_BOX_SIZE, RED_BOX_SIZE);

      // Teks UID & Nama
      const TEXT_Y = RED_BOX_Y + RED_BOX_SIZE + 105;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      ctx.fillStyle = "#1e293b"; 
      ctx.font = "bold 90px 'JetBrains Mono', monospace, Arial, sans-serif";
      ctx.fillText(assetId, 1181 / 2, TEXT_Y);
      
      if (assetName) {
        ctx.font = "bold 45px Arial, sans-serif";
        ctx.fillStyle = "#64748b"; 
        ctx.fillText(assetName.toUpperCase(), 1181 / 2, TEXT_Y + 90);
      }

      // Download Eksekusi
      const finalImage = canvas.toDataURL("image/jpeg", 0.98);
      const link = document.createElement("a");
      link.href = finalImage;
      link.download = `LABEL-${assetId.replace('/', '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Label berhasil di-generate!");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Gagal memproses template");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    handleDownload();
    toast.info("Mendownload desain final untuk dicetak...");
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative bg-white p-4 rounded-xl border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-[200px] h-[200px]"></canvas>
        </div>
      </div>

      
      <div className="mt-5 text-center space-y-1">
        <h3 className="font-extrabold text-2xl tracking-tight text-slate-800 font-mono">
          {assetId}
        </h3>
        <p className="text-slate-500 font-medium text-sm max-w-[250px] truncate">
          {assetName || "Tidak ada nama"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-[280px]">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex flex-col items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 text-slate-700 hover:text-violet-700 rounded-2xl transition-all disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          <span className="text-xs font-bold">Download</span>
        </button>
        <button
          onClick={handlePrint}
          disabled={isGenerating}
          className="flex flex-col items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 text-slate-700 hover:text-violet-700 rounded-2xl transition-all disabled:opacity-50"
        >
          <Printer className="w-5 h-5" />
          <span className="text-xs font-bold">Print</span>
        </button>
      </div>
    </div>
  );
}
