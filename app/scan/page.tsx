"use client";
import { useState } from "react";
import { ScannerView } from "@/components/shared/ScannerView";
import { useRouter } from "next/navigation";
import { QrCode, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function ScanPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'loading' | 'success' | 'error', text: string } | null>(null);

  const processAsset = async (assetId: string) => {
    try {
      setStatusMessage({ type: 'loading', text: 'Memeriksa status aset...' });
      const res = await fetch(`/api/assets/${assetId}`);
      if (!res.ok) {
        setStatusMessage({ type: 'error', text: 'Aset tidak ditemukan di sistem.' });
        return;
      }
      const json = await res.json();
      const asset = json.data;

      if (asset.status === 'available') {
        setStatusMessage({ type: 'loading', text: 'Mengambil titik koordinat GPS Anda...' });
        
        if (!navigator.geolocation) {
          setStatusMessage({ type: 'error', text: 'Browser Anda tidak mendukung fitur lokasi GPS.' });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const gpsLocation = `Maps: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            setStatusMessage({ type: 'loading', text: 'Memproses peminjaman...' });
            const loanRes = await fetch('/api/loans', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                assetId: asset.id,
                borrowerName: session?.user?.name || 'Peminjam',
                purpose: 'Peminjaman via QR',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                gpsLocation
              })
            });

            if (loanRes.ok) {
              setStatusMessage({ type: 'success', text: `Aset berhasil dipinjam! Lokasi tercatat.` });
              setTimeout(() => router.push(`/assets/${asset.assetId}`), 2500);
            } else {
              setStatusMessage({ type: 'error', text: 'Gagal memproses peminjaman.' });
            }
          },
          (error) => {
            toast.error(
              "Akses Lokasi Ditolak", 
              { description: "Mohon izinkan akses lokasi. Fitur ini bukan untuk kejahatan, tapi murni untuk memonitoring pergerakan aset. Tanpa lokasi, sistem tidak dapat meminjamkan barang.", duration: 8000 }
            );
            setStatusMessage({ type: 'error', text: 'Izin lokasi ditolak pengguna.' });
          },
          { enableHighAccuracy: true }
        );

      } else if (asset.status === 'borrowed') {
        setStatusMessage({ type: 'loading', text: 'Memproses pengembalian aset...' });
        const retRes = await fetch(`/api/loans/return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId: asset.id })
        });

        if (retRes.ok) {
          setStatusMessage({ type: 'success', text: `Aset dikembalikan ke ${asset.baseLocation || 'lokasi asal'}!` });
          setTimeout(() => router.push(`/assets/${asset.assetId}`), 2500);
        } else {
          setStatusMessage({ type: 'error', text: 'Gagal mengembalikan aset.' });
        }
      } else {
        setStatusMessage({ type: 'error', text: `Aset tidak dapat dipinjam (Status: ${asset.status})` });
      }

    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan pada sistem.' });
    }
  };

  const handleScan = (decodedText: string) => {
    if (scannedId) return; // Prevent double scan
    setScannedId(decodedText);
    processAsset(decodedText);
  };

  return (
    <div className="space-y-8 pb-12 relative max-w-2xl mx-auto">
      <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl -mt-10 z-0"></div>

      <div className="relative z-10 text-center pt-8">
        <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border border-white shadow-sm mb-6 mx-auto">
          <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-xl p-2 shadow-lg shadow-violet-500/30 text-white">
            <QrCode className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Scan QR Aset
          </h1>
        </div>
        <p className="text-slate-500 font-medium">Arahkan kamera ke QR Code yang tertempel pada fisik aset.</p>
      </div>

      <div className="relative z-10 glass-panel rounded-3xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl pointer-events-none"></div>
        
        {!scannedId ? (
          <div className="relative bg-white/50 rounded-2xl p-4 border border-slate-100 shadow-inner">
            <ScannerView onScan={handleScan} />
          </div>
        ) : (
          <div className="text-center py-12 px-4 flex flex-col items-center">
            {statusMessage?.type === 'loading' && (
              <>
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-violet-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-violet-400 animate-pulse" />
                </div>
                <p className="text-xl font-bold text-slate-800 mb-2">{statusMessage.text}</p>
                <p className="text-slate-500 font-medium bg-slate-100 inline-block px-4 py-1.5 rounded-full font-mono text-sm border border-slate-200">
                  {scannedId}
                </p>
              </>
            )}
            
            {statusMessage?.type === 'success' && (
              <div className="animate-fade-in-up flex flex-col items-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-200/50">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <p className="text-2xl font-black text-slate-800 mb-2">{statusMessage.text}</p>
                <p className="text-slate-500 font-medium mb-6">Mengarahkan ke detail aset...</p>
              </div>
            )}

            {statusMessage?.type === 'error' && (
              <div className="animate-fade-in-up flex flex-col items-center">
                <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-200/50">
                  <AlertTriangle className="w-12 h-12" />
                </div>
                <p className="text-2xl font-black text-slate-800 mb-2">Gagal Memproses</p>
                <p className="text-red-600 font-medium bg-red-50 px-4 py-3 rounded-xl border border-red-100 max-w-sm mb-6">
                  {statusMessage.text}
                </p>
                <button 
                  onClick={() => {
                    setScannedId(null);
                    setStatusMessage(null);
                  }}
                  className="bg-slate-900 text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-slate-900/20 hover:-translate-y-1 transition-all"
                >
                  Coba Scan Lagi
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}