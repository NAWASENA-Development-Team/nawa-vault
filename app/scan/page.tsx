"use client";
import { useState, useCallback } from "react";
import { ScannerView } from "@/components/shared/ScannerView";
import { useRouter } from "next/navigation";
import {
  QrCode, Eye, ArrowDownToLine, ArrowUpFromLine,
  AlertTriangle, CheckCircle2, RotateCcw, Loader2,
  Clock
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type ScanPhase = "scanning" | "action-pick" | "borrow-form" | "processing" | "success" | "error";

interface AssetInfo {
  id: number;
  assetId: string;
  name: string;
  status: string;
  baseLocation?: string | null;
  category?: { name: string } | null;
  ownerInstance?: { code: string; name: string } | null;
}

export default function ScanPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [phase, setPhase] = useState<ScanPhase>("scanning");
  const [asset, setAsset] = useState<AssetInfo | null>(null);
  const [message, setMessage] = useState<string>("");
  const [scannerActive, setScannerActive] = useState(true);

  // Form states
  const [purpose, setPurpose] = useState("");
  const [durationDays, setDurationDays] = useState(7);

  // ── Extract asset ID from raw QR text ────────────────────────────────────
  const extractAssetId = (raw: string): string => {
    const trimmed = raw.trim();
    try {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const url = new URL(trimmed);
        const segments = url.pathname.split("/").filter(Boolean);
        // URL: /borrow/EAS0001%2FTU → last segment decoded
        const last = segments[segments.length - 1];
        return decodeURIComponent(last);
      }
    } catch {}
    return trimmed;
  };

  // ── Step 1: Scan callback ─────────────────────────────────────────────────
  const handleScan = useCallback(async (rawText: string) => {
    setScannerActive(false); // pause scanner
    const assetId = extractAssetId(rawText);

    try {
      // FIX: Added cache: 'no-store' to always get fresh live status
      const res = await fetch(`/api/assets/${encodeURIComponent(assetId)}`, { cache: 'no-store' });
      if (!res.ok) {
        setMessage("Aset tidak ditemukan di sistem. Pastikan QR code terbaca dengan benar.");
        setPhase("error");
        return;
      }
      const json = await res.json();
      setAsset(json.data);
      setPhase("action-pick");
    } catch {
      setMessage("Gagal terhubung ke server. Periksa koneksi internet Anda.");
      setPhase("error");
    }
  }, []);

  // ── Step 2a: View detail ─────────────────────────────────────────────────
  const handleViewDetail = () => {
    if (!asset) return;
    router.push(`/assets/${encodeURIComponent(asset.assetId)}`);
  };

  // ── Step 2b: Borrow ──────────────────────────────────────────────────────
  const handleBorrowSubmit = async () => {
    if (!asset) return;
    
    if (!session) {
      toast.error("Silakan login terlebih dahulu untuk meminjam aset.");
      router.push(`/?callbackUrl=/scan`);
      return;
    }

    if (!purpose.trim()) {
      toast.error("Alasan peminjaman wajib diisi");
      return;
    }

    setPhase("processing");
    setMessage("Memproses peminjaman...");

    try {
      // GPS location (best-effort)
      const gpsLocation = await getGpsLocation();

      const loanRes = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: asset.id,
          borrowerName: session?.user?.name ?? "Peminjam",
          purpose: purpose.trim(),
          dueDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
          gpsLocation,
        }),
      });

      if (loanRes.ok) {
        setMessage(`Berhasil dipinjam! Kembalikan sebelum ${durationDays} hari.`);
        setPhase("success");
        setTimeout(() => router.push(`/assets/${encodeURIComponent(asset.assetId)}`), 2500);
      } else {
        const err = await loanRes.json();
        setMessage(err?.error ?? "Gagal memproses peminjaman.");
        setPhase("error");
      }
    } catch {
      setMessage("Terjadi kesalahan. Coba lagi.");
      setPhase("error");
    }
  };

  // ── Step 2c: Return ──────────────────────────────────────────────────────
  const handleReturn = async () => {
    if (!asset) return;
    setPhase("processing");
    setMessage("Memproses pengembalian...");

    try {
      const retRes = await fetch("/api/loans/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: asset.id }),
      });

      if (retRes.ok) {
        setMessage(`Dikembalikan ke ${asset.baseLocation ?? "lokasi asal"}!`);
        setPhase("success");
        setTimeout(() => router.push(`/assets/${encodeURIComponent(asset.assetId)}`), 2500);
      } else {
        const err = await retRes.json();
        setMessage(err?.error ?? "Gagal mengembalikan aset.");
        setPhase("error");
      }
    } catch {
      setMessage("Terjadi kesalahan. Coba lagi.");
      setPhase("error");
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setAsset(null);
    setMessage("");
    setPhase("scanning");
    setScannerActive(true);
    setPurpose("");
    setDurationDays(7);
  };

  // ── GPS helper ────────────────────────────────────────────────────────────
  async function getGpsLocation(): Promise<string> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve("Tidak tersedia"); return; }
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`),
        () => {
          toast.warning("GPS tidak tersedia", {
            description: "Peminjaman tetap diproses tanpa data lokasi.",
          });
          resolve("Tidak tersedia");
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    });
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      available: "bg-emerald-100 text-emerald-700 border-emerald-200",
      borrowed: "bg-amber-100 text-amber-700 border-amber-200",
      maintenance: "bg-blue-100 text-blue-700 border-blue-200",
      lost: "bg-red-100 text-red-700 border-red-200",
      overdue: "bg-rose-100 text-rose-700 border-rose-200",
    };
    const label: Record<string, string> = {
      available: "Tersedia",
      borrowed: "Dipinjam",
      maintenance: "Maintenance",
      lost: "Hilang",
      overdue: "Terlambat",
    };
    return (
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
        {label[status] ?? status}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 relative max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center pt-6">
        <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white shadow-sm mb-4">
          <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-xl p-1.5 shadow-md text-white">
            <QrCode className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-800">Scan QR Aset</h1>
        </div>
        <p className="text-slate-500 text-sm font-medium">
          {phase === "scanning"
            ? "Arahkan kamera ke QR code pada fisik aset."
            : ["action-pick", "borrow-form"].includes(phase)
            ? "Pilih tindakan untuk aset ini."
            : ""}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-lg overflow-hidden">

        {/* ─ PHASE: Scanning ─ */}
        {phase === "scanning" && (
          <div className="p-4">
            <ScannerView onScan={handleScan} active={scannerActive} />
          </div>
        )}

        {/* ─ PHASE: Action Picker ─ */}
        {(phase === "action-pick" || phase === "borrow-form") && asset && (
          <div className="p-6 space-y-5">
            {/* Asset Info Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-start gap-4">
              <div className="bg-violet-100 rounded-xl p-2.5 flex-shrink-0">
                <QrCode className="h-5 w-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-slate-800 text-base leading-tight">{asset.name}</p>
                  {statusBadge(asset.status)}
                </div>
                <p className="font-mono text-xs text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md inline-block mt-1.5">
                  {asset.assetId}
                </p>
                {asset.category && (
                  <p className="text-xs text-slate-500 mt-1">{asset.category.name}</p>
                )}
              </div>
            </div>

            {/* Action Buttons (Hidden when in borrow form) */}
            {phase === "action-pick" && (
              <div className="grid grid-cols-1 gap-3">
                {/* View Detail — always available */}
                <button
                  onClick={handleViewDetail}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50 transition-all text-left group"
                >
                  <div className="bg-slate-100 group-hover:bg-violet-100 rounded-xl p-2.5 transition-colors">
                    <Eye className="h-5 w-5 text-slate-600 group-hover:text-violet-600 transition-colors" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Lihat Detail</p>
                    <p className="text-xs text-slate-500">Buka halaman lengkap aset ini</p>
                  </div>
                </button>

                {/* Borrow — only if available */}
                {asset.status === "available" ? (
                  <button
                    onClick={() => {
                      if (!session) {
                        toast.error("Login diperlukan", { description: "Harap login untuk meminjam aset." });
                        return;
                      }
                      setPhase("borrow-form");
                    }}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all text-left group"
                  >
                    <div className="bg-emerald-100 group-hover:bg-emerald-200 rounded-xl p-2.5 transition-colors">
                      <ArrowDownToLine className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-800 text-sm">Pinjam Aset</p>
                      <p className="text-xs text-emerald-600">Mulai proses peminjaman</p>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed">
                    <div className="bg-slate-100 rounded-xl p-2.5">
                      <ArrowDownToLine className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-500 text-sm">Pinjam Aset</p>
                      <p className="text-xs text-slate-400">Tidak tersedia saat ini</p>
                    </div>
                  </div>
                )}

                {/* Return — only if borrowed OR overdue */}
                {["borrowed", "overdue"].includes(asset.status) ? (
                  <button
                    onClick={handleReturn}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-all text-left group"
                  >
                    <div className="bg-amber-100 group-hover:bg-amber-200 rounded-xl p-2.5 transition-colors">
                      <ArrowUpFromLine className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-800 text-sm">Kembalikan Aset</p>
                      <p className="text-xs text-amber-600">
                        Kembalikan ke {asset.baseLocation ?? "lokasi asal"}
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed">
                    <div className="bg-slate-100 rounded-xl p-2.5">
                      <ArrowUpFromLine className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-500 text-sm">Kembalikan Aset</p>
                      <p className="text-xs text-slate-400">Aset belum dipinjam</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Borrow Form Phase */}
            {phase === "borrow-form" && (
              <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Form Peminjaman</h3>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-0.5">Alasan Peminjaman <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Contoh: Kegiatan UKM, Praktikum, Pameran..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-sm resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-0.5">Durasi Peminjaman</label>
                  <div className="relative">
                    <select
                      value={durationDays}
                      onChange={(e) => setDurationDays(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value={1}>1 Hari</option>
                      <option value={3}>3 Hari</option>
                      <option value={7}>1 Minggu (7 Hari)</option>
                      <option value={14}>2 Minggu (14 Hari)</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setPhase("action-pick")}
                    className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleBorrowSubmit}
                    disabled={!purpose.trim()}
                    className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
            )}

            {/* Scan again */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mt-4"
            >
              <RotateCcw className="h-4 w-4" />
              Scan Aset Lain
            </button>
          </div>
        )}

        {/* ─ PHASE: Processing ─ */}
        {phase === "processing" && (
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-violet-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="font-bold text-slate-800">{message}</p>
            <p className="font-mono text-xs text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full">
              {asset?.assetId}
            </p>
          </div>
        )}

        {/* ─ PHASE: Success ─ */}
        {phase === "success" && (
          <div className="p-12 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200/50">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-slate-800">{message}</p>
            <p className="text-sm text-slate-500">Mengarahkan ke halaman aset...</p>
          </div>
        )}

        {/* ─ PHASE: Error ─ */}
        {phase === "error" && (
          <div className="p-10 flex flex-col items-center gap-5 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-lg shadow-red-200/50">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-800 mb-1">Gagal Memproses</p>
              <p className="text-red-600 text-sm font-medium bg-red-50 px-4 py-3 rounded-xl border border-red-100 max-w-xs">
                {message}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:-translate-y-0.5 transition-transform text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              Coba Scan Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}