"use client";
import React, { useState, useEffect } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { QRLabel } from "@/components/shared/QRLabel";
import Link from "next/link";
import { ArrowLeft, MapPin, Hash, Edit3, Save, X, Navigation, RefreshCcw, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AssetDetailPage({ params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = React.use(params);
  const { data: session } = useSession();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({ condition: '', status: '' });

  useEffect(() => {
    fetchAsset();
  }, [assetId]);

  async function fetchAsset() {
    setLoading(true);
    try {
      const res = await fetch(`/api/assets/${assetId}`);
      const json = await res.json();
      if (json.data) {
        setAsset(json.data);
        setFormData({ condition: json.data.condition, status: json.data.status });
      }
    } catch (error) {
      console.error("Failed to fetch asset", error);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...asset,
          condition: formData.condition,
          status: formData.status
        })
      });
      if (res.ok) {
        const json = await res.json();
        setAsset(json.data);
        setEditing(false);
      }
    } catch (error) {
      console.error("Failed to update asset", error);
    }
  };

  const isAdminOrOperator = session?.user && (session.user as any).role !== 'member';

  if (loading && !asset) return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
      <p className="text-slate-500 font-medium">Memuat data aset...</p>
    </div>
  );
  
  if (!asset) return (
    <div className="p-16 text-center glass-panel rounded-3xl mt-10">
      <p className="text-xl font-bold text-slate-800">Aset tidak ditemukan</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <Link href="/assets" className="inline-flex items-center text-slate-500 hover:text-violet-600 font-semibold mb-2 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Inventaris
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 relative z-10">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{asset.name}</h1>
                <div className="mt-2 flex items-center gap-3">
                  <span className="font-mono bg-violet-100 text-violet-700 px-3 py-1 rounded-md text-sm font-bold border border-violet-200">
                    {asset.assetId}
                  </span>
                  <StatusBadge status={asset.status} />
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-6 relative z-10">
              <div className="bg-white/60 p-5 rounded-2xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Deskripsi Aset</p>
                <p className="text-slate-700 font-medium leading-relaxed">{asset.description || 'Tidak ada deskripsi yang tersedia untuk aset ini.'}</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white/60 p-4 rounded-2xl border border-slate-100">
                  <p className="text-sm font-semibold text-slate-400 mb-1">Kondisi</p>
                  <p className="text-slate-800 font-bold capitalize text-lg">
                    {asset.condition === 'good' ? 'Baik' : asset.condition === 'fair' ? 'Cukup' : 'Rusak'}
                  </p>
                </div>
                <div className="bg-white/60 p-4 rounded-2xl border border-slate-100">
                  <p className="text-sm font-semibold text-slate-400 mb-1 flex items-center"><MapPin className="mr-1 h-3.5 w-3.5"/> Lokasi Saat Ini</p>
                  <p className="text-slate-800 font-bold text-lg max-w-[150px] truncate" title={asset.location || '-'}>{asset.location || '-'}</p>
                </div>
                <div className="bg-white/60 p-4 rounded-2xl border border-slate-100">
                  <p className="text-sm font-semibold text-slate-400 mb-1 flex items-center"><Hash className="mr-1 h-3.5 w-3.5"/> Kuantitas</p>
                  <p className="text-slate-800 font-bold text-lg">{asset.quantity}</p>
                </div>
              </div>

              {asset.baseLocation && asset.location !== asset.baseLocation && (
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <p className="text-sm text-orange-600 font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Lokasi asli barang ini adalah di <strong>{asset.baseLocation}</strong>.
                  </p>
                </div>
              )}
            </div>

            {isAdminOrOperator && (
              <div className="mt-8 pt-8 border-t border-slate-200 relative z-10">
                {editing ? (
                  <div className="bg-violet-50/50 p-6 rounded-2xl border border-violet-100 space-y-5 animate-fade-in-up">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Edit3 className="h-5 w-5 text-violet-500" /> Perbarui Status Aset
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1.5">Status Aktif</label>
                        <select 
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-medium shadow-sm"
                          value={formData.status}
                          onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                          <option value="available">Tersedia</option>
                          <option value="borrowed">Dipinjam</option>
                          <option value="maintenance">Perbaikan</option>
                          <option value="lost">Hilang</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1.5">Kondisi Fisik</label>
                        <select 
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-medium shadow-sm"
                          value={formData.condition}
                          onChange={e => setFormData({...formData, condition: e.target.value})}
                        >
                          <option value="good">Baik</option>
                          <option value="fair">Cukup</option>
                          <option value="damaged">Rusak</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleUpdate} className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 py-2.5 text-sm font-bold shadow-md shadow-violet-500/20 transition-all flex items-center gap-2">
                        <Save className="h-4 w-4" /> Simpan Perubahan
                      </button>
                      <button onClick={() => setEditing(false)} className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full px-6 py-2.5 text-sm font-bold transition-all flex items-center gap-2">
                        <X className="h-4 w-4" /> Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)} className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full px-6 py-2.5 text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
                    <Edit3 className="h-4 w-4 text-violet-500" /> Edit Status / Kondisi
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="sticky top-24">
            <QRLabel assetId={asset.assetId} assetName={asset.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
