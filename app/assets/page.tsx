"use client";
import { useState, useEffect } from "react";
import { AssetCard } from "@/components/shared/AssetCard";
import Link from "next/link";
import { Search, Plus, Loader2, Box, Sparkles, Filter } from "lucide-react";
import { useSession } from "next-auth/react";
import { FadeIn } from "@/components/shared/FadeIn";

export default function AssetsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user && (session.user as any).role === 'admin';
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch("/api/assets", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const text = await res.text();
        if (!text) return; // Prevent empty JSON error
        
        const json = JSON.parse(text);
        if (json.data) setAssets(json.data);
      } catch (error) {
        console.error("Failed to fetch assets", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, []);

  const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl -mt-10" />

      <div className="flex flex-col gap-4 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-violet-500/30 shrink-0">
              <Box className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-violet-900 tracking-tight">
              Koleksi Aset
            </h1>
          </div>

          {/* Admin buttons — icons only on mobile, full label on sm+ */}
          {isAdmin && (
            <div className="flex gap-2 shrink-0">
              <Link href="/assets/print" className="bg-white border border-slate-200 rounded-xl p-2.5 sm:px-4 sm:py-2.5 font-bold text-sm transition-all shadow-sm hover:border-violet-200 hover:text-violet-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-violet-600 shrink-0"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                <span className="hidden sm:inline">Cetak QR</span>
              </Link>
              <Link href="/assets/new" className="bg-slate-900 text-white rounded-xl p-2.5 sm:px-5 sm:py-2.5 font-bold text-sm transition-all hover:bg-violet-700 flex items-center gap-2">
                <Plus className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Tambah</span>
              </Link>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl opacity-0 group-focus-within:opacity-20 blur transition duration-500" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
            <input
              type="text"
              placeholder="Cari nama atau ID aset..."
              className="w-full bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl py-3.5 pl-11 pr-4 text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none transition-all font-semibold placeholder:font-medium placeholder:text-slate-400 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 relative z-10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-violet-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-violet-400 animate-pulse" />
          </div>
          <p className="text-slate-500 font-bold mt-5 tracking-wide uppercase text-xs">Menyiapkan Koleksi...</p>
        </div>
      ) : filteredAssets.length > 0 ? (
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            {filteredAssets.map((asset, index) => (
              <div key={asset.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 40}ms` }}>
                <AssetCard asset={asset} />
              </div>
            ))}
          </div>
        </FadeIn>
      ) : (
        <div className="text-center p-12 glass-panel rounded-3xl border border-white relative overflow-hidden z-10">
          <div className="bg-white/80 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Box className="h-9 w-9 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Koleksi Kosong</h3>
          <p className="text-slate-500 font-medium text-sm">Tidak ada aset yang cocok dengan pencarian Anda.</p>
        </div>
      )}
    </div>
  );
}
