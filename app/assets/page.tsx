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
        const res = await fetch("/api/assets");
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
    <div className="space-y-10 pb-12 relative">
      {/* Glamorous decorative header blob */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl -mt-10"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-violet-500/30">
              <Box className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-violet-900 tracking-tight">
              Koleksi Aset
            </h1>
          </div>
          <p className="text-slate-500 mt-2 font-medium max-w-lg">
            Kelola dan temukan seluruh aset berharga organisasi dengan mudah dan elegan.
          </p>
        </div>
        
        {isAdmin && (
          <Link href="/assets/new" className="group relative overflow-hidden bg-slate-900 text-white rounded-full px-8 py-3.5 font-bold text-sm transition-all shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_60px_-15px_rgba(139,92,246,0.5)] hover:-translate-y-1 flex items-center gap-2">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-[150%] group-hover:animate-[shine_1.5s_ease-out]"></div>
            <span className="relative z-10 flex items-center gap-2"><Plus className="h-4 w-4" /> Tambah Aset</span>
          </Link>
        )}
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full opacity-0 group-focus-within:opacity-30 blur transition duration-500"></div>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Cari perhiasan, properti, atau ID aset..." 
              className="w-full bg-white/80 backdrop-blur-md border border-white/50 rounded-full py-4 pl-14 pr-6 text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-0 transition-all font-semibold placeholder:font-medium placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <button className="bg-white/80 backdrop-blur-md border border-white/50 rounded-full px-6 py-4 text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md hover:text-violet-600 transition-all font-bold flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 relative z-10">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-violet-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-violet-400 animate-pulse" />
          </div>
          <p className="text-slate-500 font-bold mt-6 tracking-wide uppercase text-sm">Menyiapkan Koleksi...</p>
        </div>
      ) : filteredAssets.length > 0 ? (
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
            {filteredAssets.map((asset, index) => (
              <div key={asset.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <AssetCard asset={asset} />
              </div>
            ))}
          </div>
        </FadeIn>
      ) : (
        <div className="text-center p-20 glass-panel rounded-[2.5rem] border border-white relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5"></div>
          <div className="relative">
            <div className="bg-white/80 backdrop-blur shadow-xl shadow-slate-200/50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Box className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Koleksi Kosong</h3>
            <p className="text-slate-500 font-medium">Tidak ada aset mewah yang cocok dengan kriteria pencarian Anda.</p>
          </div>
        </div>
      )}
    </div>
  );
}
