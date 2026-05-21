"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Box, Sparkles, Loader2, Save } from "lucide-react";

export default function NewAssetPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', categoryPrefix: 'ELK', location: '' });
  const [loading, setLoading] = useState(false);

  // Auto-generate the preview string based on the category prefix and name
  const previewCode = form.name 
    ? `${form.categoryPrefix}-${form.name.replace(/[^a-zA-Z]/g, '').substring(0,3).toUpperCase()}-XXX` 
    : 'Preview ID...';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        body: JSON.stringify({ ...form, categoryId: 1, quantity: 1, condition: 'good' }), 
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        router.push('/assets');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 relative max-w-3xl mx-auto">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl -mt-10 z-0"></div>

      <div className="relative z-10 pt-4">
        <Link href="/assets" className="inline-flex items-center text-slate-500 hover:text-violet-600 font-semibold mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Batal & Kembali
        </Link>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-2.5 rounded-xl shadow-lg shadow-violet-500/30">
            <Box className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-violet-900 tracking-tight">
            Registrasi Aset
          </h1>
        </div>
        <p className="text-slate-500 font-medium">Tambahkan barang baru ke dalam sistem inventaris.</p>
      </div>

      <div className="relative z-10 glass-panel rounded-[2rem] p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-bold ml-1">Kategori Barang</label>
            <select 
              className="w-full bg-white/80 backdrop-blur border border-slate-200 rounded-xl px-4 py-3.5 text-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-semibold shadow-sm transition-all" 
              value={form.categoryPrefix} 
              onChange={e => setForm({...form, categoryPrefix: e.target.value})}
            >
              <option value="ELK">Elektronik (ELK)</option>
              <option value="SND">Sound System (SND)</option>
              <option value="DKR">Dekorasi (DKR)</option>
              <option value="TND">Tenda & Perlengkapan (TND)</option>
              <option value="MSK">Alat Musik (MSK)</option>
              <option value="PRP">Properti Panggung (PRP)</option>
              <option value="ETC">Lainnya (ETC)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-700 font-bold ml-1">Nama Barang</label>
            <input 
              required 
              type="text" 
              className="w-full bg-white/80 backdrop-blur border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-bold shadow-sm transition-all placeholder:font-medium placeholder:text-slate-400" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              placeholder="Contoh: Kamera DSLR Canon"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-700 font-bold ml-1">Lokasi Awal (Base Location)</label>
            <input 
              required 
              type="text" 
              className="w-full bg-white/80 backdrop-blur border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-bold shadow-sm transition-all placeholder:font-medium placeholder:text-slate-400" 
              value={form.location} 
              onChange={e => setForm({...form, location: e.target.value})} 
              placeholder="Contoh: Sekretariat, Ruang Guru, dll"
            />
          </div>

          <div className="mt-8 p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20">
              <Sparkles className="w-16 h-16 text-violet-500" />
            </div>
            <p className="text-sm font-bold text-violet-800 uppercase tracking-wider mb-2">Preview Auto-Generated ID</p>
            <p className="text-2xl font-black font-mono text-violet-600 tracking-tight">{previewCode}</p>
            <p className="text-xs font-medium text-violet-500 mt-2">ID ini akan di-generate otomatis saat aset disimpan dan QR Code siap dicetak.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading || !form.name}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white rounded-xl px-4 py-4 font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center gap-2 mt-8 text-lg"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> Simpan & Generate QR</>}
          </button>
        </form>
      </div>
    </div>
  );
}