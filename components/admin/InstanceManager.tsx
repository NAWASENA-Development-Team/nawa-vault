"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Building, X } from "lucide-react";
import { toast } from "sonner";

type Instance = {
  id: number;
  code: string;
  name: string;
  description: string | null;
};

export function InstanceManager() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ code: "", name: "", description: "" });

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/owner-instances", { cache: "no-store" });
      const json = await res.json();
      if (json.data) setInstances(json.data);
    } catch (error) {
      toast.error("Gagal memuat daftar instansi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const openModal = (instance?: Instance) => {
    if (instance) {
      setEditingId(instance.id);
      setFormData({ 
        code: instance.code, 
        name: instance.name, 
        description: instance.description || "" 
      });
    } else {
      setEditingId(null);
      setFormData({ code: "", name: "", description: "" });
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingId ? `/api/owner-instances/${editingId}` : "/api/owner-instances";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Terjadi kesalahan");

      toast.success(editingId ? "Instansi diperbarui!" : "Instansi ditambahkan!");
      closeModal();
      fetchInstances();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus instansi ini? Aset yang terkait mungkin akan kehilangan data kepemilikan.")) return;

    try {
      const res = await fetch(`/api/owner-instances/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus");

      toast.success("Instansi dihapus!");
      fetchInstances();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="glass-panel rounded-3xl border border-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full">
        <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Building className="h-5 w-5 text-violet-600" />
              Daftar Instansi
            </h2>
            <p className="text-slate-500 text-sm font-medium">Pengelola (Owner) dari aset</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-violet-50 border border-violet-200 text-violet-700 hover:text-white hover:bg-violet-600 p-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto max-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : instances.length === 0 ? (
            <div className="p-12 text-center">
              <Building className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Belum ada instansi terdaftar</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-semibold sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="text-left px-6 py-3">Instansi</th>
                  <th className="text-center px-6 py-3">Kode</th>
                  <th className="text-right px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/30">
                {instances.map((inst) => (
                  <tr key={inst.id} className="hover:bg-white transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{inst.name}</div>
                      {inst.description && <div className="text-xs text-slate-400 mt-1">{inst.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-violet-100 text-violet-700 px-2.5 py-1 rounded-md font-medium font-mono text-xs">
                        {inst.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(inst)} className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors bg-slate-50 hover:bg-amber-50 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(inst.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Edit/Add */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 transform transition-all">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">
                {editingId ? "Edit Instansi" : "Tambah Instansi"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Kode Instansi <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all font-mono uppercase"
                  placeholder="Contoh: TU, OSIS"
                  maxLength={10}
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Instansi <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                  placeholder="Contoh: Tata Usaha"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all resize-none"
                  placeholder="Opsional"
                  rows={3}
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-violet-600 text-white hover:bg-violet-700 font-bold rounded-xl transition-colors shadow-lg shadow-violet-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
