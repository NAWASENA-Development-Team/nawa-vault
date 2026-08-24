"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Box, Sparkles, Loader2, Save, Building2, AlertCircle, CheckCircle2 } from "lucide-react";
import { CategoryPicker } from "@/components/shared/CategoryPicker";
import { getCategoryBreadcrumb } from "@/lib/category-config";

interface OwnerInstance {
  id: number;
  code: string;
  name: string;
}

const CONDITIONS = [
  { value: "good",    label: "Baik" },
  { value: "fair",    label: "Cukup" },
  { value: "damaged", label: "Rusak" },
];

const inputClass =
  "w-full bg-white/80 backdrop-blur border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 font-semibold shadow-sm transition-all placeholder:font-medium placeholder:text-slate-400 outline-none";
const labelClass = "block text-sm font-bold text-slate-700 mb-1.5 ml-0.5";

export default function NewAssetPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subcategoryCode, setSubcategoryCode] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [ownerCode, setOwnerCode] = useState("");
  const [condition, setCondition] = useState("good");
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");

  const [owners, setOwners] = useState<OwnerInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch owner instances for dropdown
  useEffect(() => {
    fetch("/api/owner-instances", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => { if (j.data) setOwners(j.data); })
      .catch(() => {});
  }, []);

  // Live asset ID preview
  const idPreview =
    subcategoryCode && ownerCode
      ? `${subcategoryCode}XXXX/${ownerCode}`
      : subcategoryCode
      ? `${subcategoryCode}XXXX/—`
      : "——————";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!subcategoryCode) { setError("Pilih subkategori terlebih dahulu."); return; }
    if (!ownerCode)       { setError("Pilih unit kepemilikan terlebih dahulu."); return; }
    if (!name.trim())     { setError("Nama barang wajib diisi."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subcategoryCode,
          ownerCode,
          name: name.trim(),
          description: description.trim() || undefined,
          condition,
          quantity,
          location: location.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "Gagal menyimpan aset.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/assets/${encodeURIComponent(json.data.assetId)}`);
        }, 1200);
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto pt-20 flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200/50">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <p className="text-xl font-black text-slate-800">Aset Berhasil Disimpan!</p>
        <p className="text-slate-500 text-sm">Mengalihkan ke halaman detail aset...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 relative max-w-2xl mx-auto">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl -mt-10 z-0" />

      {/* Header */}
      <div className="relative z-10 pt-4">
        <Link href="/assets" className="inline-flex items-center text-slate-500 hover:text-violet-600 font-semibold mb-5 transition-colors text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Koleksi
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-2.5 rounded-xl shadow-lg shadow-violet-500/30">
            <Box className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-violet-900 tracking-tight">
            Registrasi Aset
          </h1>
        </div>
        <p className="text-slate-500 font-medium text-sm">Tambahkan barang baru ke sistem inventaris.</p>
      </div>

      <div className="relative z-10 bg-white/70 backdrop-blur-xl rounded-3xl p-7 border border-white shadow-lg overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-violet-200/30 to-fuchsia-200/30 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-5 relative">

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-sm font-semibold">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── Category (3-level) ── */}
          <div>
            <label className={labelClass}>Kategori Barang</label>
            <CategoryPicker
              value={subcategoryCode}
              onChange={(code, name) => { setSubcategoryCode(code); setSubcategoryName(name); }}
              disabled={loading}
            />
            {subcategoryCode && (
              <p className="mt-1.5 text-xs text-slate-500 ml-0.5">
                {getCategoryBreadcrumb(subcategoryCode)}
              </p>
            )}
          </div>

          {/* ── Owner Instance ── */}
          <div>
            <label className={labelClass}>Unit Kepemilikan (Divisi)</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={ownerCode}
                onChange={(e) => setOwnerCode(e.target.value)}
                disabled={loading}
                className={`${inputClass} pl-10 appearance-none`}
              >
                <option value="">— Pilih Divisi Pemilik —</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.code}>
                    [{o.code}] {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Asset ID Preview ── */}
          <div className="p-4 bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl relative overflow-hidden">
            <div className="absolute top-1 right-2 opacity-10">
              <Sparkles className="w-10 h-10 text-violet-500" />
            </div>
            <p className="text-[10px] font-bold text-violet-700 uppercase tracking-widest mb-1">Preview Kode Aset</p>
            <p className="text-2xl font-black font-mono text-violet-600 tracking-tight">{idPreview}</p>
            <p className="text-[10px] font-medium text-violet-400 mt-1">
              Nomor urut akan di-generate otomatis saat disimpan.
            </p>
          </div>

          {/* ── Nama Barang ── */}
          <div>
            <label className={labelClass}>Nama Barang <span className="text-red-500">*</span></label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              placeholder="Contoh: Speaker JBL EON610, Kabel XLR 5m, ..."
              className={inputClass}
            />
          </div>

          {/* ── Deskripsi ── */}
          <div>
            <label className={labelClass}>Deskripsi (opsional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={2}
              placeholder="Spesifikasi, merek, catatan kondisi, dll..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* ── Kondisi + Jumlah ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Kondisi</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                disabled={loading}
                className={`${inputClass} appearance-none`}
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Jumlah</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                disabled={loading}
                className={inputClass}
              />
            </div>
          </div>

          {/* ── Base Location ── */}
          <div>
            <label className={labelClass}>Lokasi Awal</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              placeholder="Contoh: Ruang Sekretariat, Gudang Lantai 2, ..."
              className={inputClass}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !subcategoryCode || !ownerCode || !name.trim()}
            className="w-full mt-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white rounded-xl px-4 py-4 font-bold shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center gap-2 text-base"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Simpan & Generate QR</>}
          </button>
        </form>
      </div>
    </div>
  );
}