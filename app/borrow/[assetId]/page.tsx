"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Tag,
  Loader2,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { toast, Toaster } from "sonner";

type Asset = {
  id: number;
  assetId: string;
  name: string;
  description: string | null;
  status: string;
  condition: string;
  quantity: number;
  location: string | null;
  baseLocation: string | null;
  imageUrl: string | null;
  categoryName: string | null;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "available") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Tersedia
      </span>
    );
  }
  if (status === "borrowed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        Sedang Dipinjam
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <span className="w-2 h-2 rounded-full bg-slate-400" />
      {status}
    </span>
  );
}

export default function BorrowPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const assetId = params.assetId as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [borrowed, setBorrowed] = useState(false);

  useEffect(() => {
    async function fetchAsset() {
      try {
        const res = await fetch(`/api/public/assets/${assetId}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const json = await res.json();
        setAsset(json.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (assetId) fetchAsset();
  }, [assetId]);

  const handleBorrow = async () => {
    if (!asset || borrowing) return;
    setBorrowing(true);

    try {
      if (!navigator.geolocation) {
        toast.error("Browser tidak mendukung GPS", {
          description: "Lokasi dibutuhkan untuk mencatat pergerakan aset.",
        });
        setBorrowing(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const gpsLocation = `Maps: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          const loanRes = await fetch("/api/loans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              assetId: asset.id,
              borrowerName: session?.user?.name || "Peminjam",
              purpose: "Peminjaman via QR (eksternal)",
              dueDate: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
              gpsLocation,
            }),
          });

          if (loanRes.ok) {
            setBorrowed(true);
            toast.success("Berhasil dipinjam!", {
              description: "Lokasi GPS berhasil tercatat.",
            });
            setTimeout(() => router.push(`/assets/${asset.assetId}`), 2500);
          } else {
            const err = await loanRes.json();
            toast.error("Gagal meminjam", {
              description: err.error || "Terjadi kesalahan.",
            });
          }
          setBorrowing(false);
        },
        () => {
          toast.error("Akses Lokasi Ditolak", {
            description:
              "Izinkan akses lokasi untuk meminjam aset. Lokasi digunakan untuk memonitoring pergerakan aset.",
            duration: 8000,
          });
          setBorrowing(false);
        },
        { enableHighAccuracy: true }
      );
    } catch {
      toast.error("Terjadi kesalahan sistem");
      setBorrowing(false);
    }
  };

  // ─── Loading skeleton ─────────────────────────────────────────────────────
  if (loading || authStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-violet-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-500 font-medium">Memuat informasi aset…</p>
        </div>
      </div>
    );
  }

  // ─── Not found ────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-100">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">
          Aset Tidak Ditemukan
        </h1>
        <p className="text-slate-500 mb-8 max-w-xs">
          QR Code ini tidak terhubung dengan aset manapun di sistem NawaVault.
        </p>
        <Link
          href="/"
          className="bg-violet-600 text-white font-bold px-8 py-3 rounded-full hover:bg-violet-700 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  if (!asset) return null;

  const conditionLabel: Record<string, string> = {
    good: "Baik",
    fair: "Cukup Baik",
    poor: "Perlu Perhatian",
    damaged: "Rusak",
  };

  // ─── Main page ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-orange-50/20 relative overflow-hidden">
      <Toaster richColors position="top-center" />

      {/* Decorative orbs */}
      <div className="absolute top-[-15%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-violet-400/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        {/* Logo header */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/60 shadow-sm hover:bg-white/90 transition-colors">
              <div className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-xl p-2 shadow-md shadow-violet-500/30 text-white flex items-center justify-center">
                <Logo className="h-7 w-7" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-800">
                NAWA<span className="text-violet-600">VAULT</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Asset card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/60 overflow-hidden mb-6">
          {/* Card header accent */}
          <div className="h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500" />

          <div className="p-6">
            {/* Category + status */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              {asset.categoryName && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
                  <Tag className="w-3 h-3" />
                  {asset.categoryName}
                </span>
              )}
              <StatusBadge status={asset.status} />
            </div>

            {/* Asset name */}
            <h1 className="text-2xl font-black text-slate-800 mb-1 leading-tight">
              {asset.name}
            </h1>
            <p className="text-xs font-mono text-slate-400 mb-4">
              #{asset.assetId}
            </p>

            {asset.description && (
              <p className="text-sm text-slate-500 leading-relaxed mb-5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                {asset.description}
              </p>
            )}

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3">
              {asset.location && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Lokasi</p>
                    <p className="text-slate-700 font-semibold">
                      {asset.location}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm">
                <Package className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Kondisi</p>
                  <p className="text-slate-700 font-semibold">
                    {conditionLabel[asset.condition] ?? asset.condition}
                  </p>
                </div>
              </div>
              {asset.quantity > 1 && (
                <div className="flex items-start gap-2 text-sm">
                  <Clock className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Tersedia
                    </p>
                    <p className="text-slate-700 font-semibold">
                      {asset.quantity} unit
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Action section ─────────────────────────────────────────────── */}

        {/* SUCCESS STATE */}
        {borrowed && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center shadow-lg shadow-emerald-100/50">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-200/50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-1">
              Peminjaman Berhasil!
            </h2>
            <p className="text-slate-500 text-sm">
              Mengarahkan ke detail aset…
            </p>
          </div>
        )}

        {/* LOGGED IN — show borrow button */}
        {!borrowed && session && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Masuk sebagai</p>
                <p className="font-bold text-slate-800">{session.user?.name}</p>
              </div>
            </div>

            {asset.status === "available" ? (
              <>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                  Kamu akan meminjam{" "}
                  <span className="font-semibold text-slate-700">
                    {asset.name}
                  </span>
                  . Durasi peminjaman default adalah{" "}
                  <span className="font-semibold">7 hari</span>. Lokasi GPS
                  akan dicatat secara otomatis.
                </p>
                <button
                  onClick={handleBorrow}
                  disabled={borrowing}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2"
                >
                  {borrowing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memproses…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Pinjam Sekarang
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                <p className="text-amber-700 font-semibold text-sm">
                  Aset ini sedang dipinjam dan tidak tersedia saat ini.
                </p>
                <Link
                  href={`/assets/${asset.assetId}`}
                  className="inline-flex items-center gap-1.5 mt-3 text-violet-600 font-semibold text-sm hover:underline"
                >
                  Lihat detail aset <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* NOT LOGGED IN — show login/register options */}
        {!borrowed && !session && authStatus === "unauthenticated" && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-slate-200/60 p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <LogIn className="w-7 h-7 text-violet-600" />
              </div>
              <h2 className="text-lg font-black text-slate-800 mb-1">
                Masuk untuk Meminjam
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Kamu perlu masuk atau daftar terlebih dahulu untuk dapat
                meminjam{" "}
                <span className="font-semibold text-slate-700">
                  {asset.name}
                </span>
                .
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={`/?callbackUrl=/borrow/${assetId}`}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <LogIn className="w-4 h-4" />
                Masuk ke NawaVault
              </Link>
              <Link
                href={`/register?callbackUrl=/borrow/${assetId}`}
                className="w-full bg-white border-2 border-violet-200 text-violet-700 font-bold py-3.5 rounded-2xl hover:bg-violet-50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Buat Akun Baru
              </Link>
            </div>

            <p className="text-xs text-slate-400 text-center mt-4 leading-relaxed">
              Setelah masuk, kamu akan langsung diarahkan kembali ke halaman ini
              untuk melanjutkan peminjaman.
            </p>
          </div>
        )}

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Sistem Manajemen Aset &copy; 2026 NawaVault
        </p>
      </div>
    </div>
  );
}
