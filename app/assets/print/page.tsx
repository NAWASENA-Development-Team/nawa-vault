"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { ArrowLeft, CheckSquare, Square, Printer, Loader2, FileDown } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function BatchPrintPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [paperSize, setPaperSize] = useState<"a4" | "a3">("a4");
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch("/api/assets");
        if (!res.ok) throw new Error("Gagal mengambil data");
        const json = await res.json();
        if (json.data) setAssets(json.data);
      } catch (error) {
        toast.error("Gagal memuat daftar aset");
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, []);

  const toggleAll = () => {
    if (selected.size === assets.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(assets.map(a => a.id)));
    }
  };

  const toggleItem = (id: number) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  const generateSingleLabel = async (assetId: string, assetName: string): Promise<string> => {
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

    ctx.drawImage(img, 0, 0, 1181, 1181);

    const typeCode = assetId.charAt(0).toUpperCase();
    let targetR = 34, targetG = 197, targetB = 94; // Hijau
    
    if (typeCode === 'E') { targetR = 239; targetG = 68; targetB = 68; } // Merah
    else if (typeCode === 'F') { targetR = 59; targetG = 130; targetB = 246; } // Biru

    const imgData = ctx.getImageData(0, 0, 1181, 1181);
    const data = imgData.data;
    const margin = 80;

    for (let y = 0; y < 1181; y++) {
      for (let x = 0; x < 1181; x++) {
        if (x < margin || y < margin || x > 1181 - margin || y > 1181 - margin) {
          const i = (y * 1181 + x) * 4;
          const r = data[i], g = data[i+1], b = data[i+2];
          if (g > 100 && g > r + 30 && g > b + 30) {
            const intensity = g / 255;
            data[i] = targetR * intensity;
            data[i+1] = targetG * intensity;
            data[i+2] = targetB * intensity;
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const RED_BOX_SIZE = 679;
    const RED_BOX_X = (1181 - RED_BOX_SIZE) / 2; 
    const RED_BOX_Y = 193;
    const borrowUrl = `https://vault.nawasena.site/borrow/${encodeURIComponent(assetId)}`;

    const qrCanvas = document.createElement("canvas");
    await QRCode.toCanvas(qrCanvas, borrowUrl, {
      width: RED_BOX_SIZE,
      margin: 0, 
      color: { dark: '#000000', light: '#ffffff' }
    });

    ctx.drawImage(qrCanvas, RED_BOX_X, RED_BOX_Y, RED_BOX_SIZE, RED_BOX_SIZE);

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

    return canvas.toDataURL("image/jpeg", 0.9);
  };

  const handlePrint = async () => {
    if (selected.size === 0) {
      toast.error("Pilih minimal 1 aset untuk dicetak!");
      return;
    }

    setGenerating(true);
    setProgress({ current: 0, total: selected.size });

    try {
      const selectedAssets = assets.filter(a => selected.has(a.id));
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: paperSize
      });

      // Konfigurasi ukuran Layout PDF
      // A4: 210 x 297 mm
      // A3: 297 x 420 mm
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
      const spacing = 5;
      const labelSize = 45; // 4.5 cm persegi
      
      const cols = Math.floor((pageWidth - (margin * 2)) / (labelSize + spacing));
      const rows = Math.floor((pageHeight - (margin * 2)) / (labelSize + spacing));
      const itemsPerPage = cols * rows;

      // Menghitung Offset agar grid berada persis di tengah kertas
      const totalGridWidth = (cols * labelSize) + ((cols - 1) * spacing);
      const startX = (pageWidth - totalGridWidth) / 2;
      const totalGridHeight = (rows * labelSize) + ((rows - 1) * spacing);
      const startY = (pageHeight - totalGridHeight) / 2;

      let currentItem = 0;
      
      for (const asset of selectedAssets) {
        // Generate gambar label
        const imageData = await generateSingleLabel(asset.assetId, asset.name);
        
        // Cek apakah butuh halaman baru
        if (currentItem > 0 && currentItem % itemsPerPage === 0) {
          pdf.addPage();
        }

        const indexOnPage = currentItem % itemsPerPage;
        const col = indexOnPage % cols;
        const row = Math.floor(indexOnPage / cols);

        const x = startX + (col * (labelSize + spacing));
        const y = startY + (row * (labelSize + spacing));

        pdf.addImage(imageData, "JPEG", x, y, labelSize, labelSize);

        currentItem++;
        setProgress({ current: currentItem, total: selected.size });
      }

      pdf.save(`NawaVault-QR-${paperSize.toUpperCase()}.pdf`);
      toast.success("PDF berhasil di-generate!");
      
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat memproses gambar.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/assets" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Cetak QR Batch</h1>
            <p className="text-slate-500 font-medium">Pilih barang untuk dicetak masal ke dalam format PDF</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kanan: Settings & Summary — shown first on mobile */}
        <div className="space-y-4 lg:order-last lg:col-span-1">
          <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-base text-slate-800 mb-4">Pengaturan Kertas</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
              <label
                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${paperSize === 'a4' ? 'border-violet-500 bg-violet-50' : 'border-slate-100 hover:border-slate-200'}`}
                onClick={() => setPaperSize('a4')}
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Kertas A4</h4>
                  <p className="text-xs text-slate-500 font-medium">210 × 297 mm</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paperSize === 'a4' ? 'border-violet-600' : 'border-slate-300'}`}>
                  {paperSize === 'a4' && <div className="w-2 h-2 bg-violet-600 rounded-full" />}
                </div>
              </label>
              <label
                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${paperSize === 'a3' ? 'border-violet-500 bg-violet-50' : 'border-slate-100 hover:border-slate-200'}`}
                onClick={() => setPaperSize('a3')}
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Kertas A3</h4>
                  <p className="text-xs text-slate-500 font-medium">297 × 420 mm</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paperSize === 'a3' ? 'border-violet-600' : 'border-slate-300'}`}>
                  {paperSize === 'a3' && <div className="w-2 h-2 bg-violet-600 rounded-full" />}
                </div>
              </label>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-5 text-white shadow-xl">
            <h3 className="font-bold text-base mb-1">Ringkasan</h3>
            <p className="text-slate-400 text-xs mb-4">Barang terpilih akan dikumpulkan dalam satu PDF.</p>
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/10">
              <span className="font-medium text-slate-300 text-sm">Total Terpilih:</span>
              <span className="font-extrabold text-2xl">{selected.size} <span className="text-xs font-medium text-slate-500">QR</span></span>
            </div>
            <button
              onClick={handlePrint}
              disabled={selected.size === 0 || generating}
              className="w-full bg-white text-slate-900 rounded-2xl px-4 py-3.5 font-bold text-sm transition-all hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                  Memproses ({progress.current}/{progress.total})...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  Generate PDF Sekarang
                </>
              )}
            </button>
          </div>
        </div>

        {/* Kolom Kiri: Daftar Barang */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-5 sm:p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-base sm:text-lg text-slate-800">Daftar Barang ({assets.length})</h2>
            <button onClick={toggleAll} className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-violet-600 hover:text-violet-700 bg-violet-50 px-3 py-2 rounded-xl">
              {selected.size === assets.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              {selected.size === assets.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="max-h-[50vh] lg:max-h-[600px] overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>
            ) : (
              assets.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => toggleItem(asset.id)}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all ${selected.has(asset.id) ? 'border-violet-500 bg-violet-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    {selected.has(asset.id) ? (
                      <CheckSquare className="w-5 h-5 text-violet-600 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{asset.name}</h4>
                      <p className="text-xs font-mono font-medium text-slate-500">{asset.assetId}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                    {asset.status === 'available' ? 'Tersedia' : 'Dipinjam'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
