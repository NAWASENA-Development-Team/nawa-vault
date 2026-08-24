"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, FolderTree, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: number;
  name: string;
  code: string;
  level: number;
  parentId: number | null;
  description: string | null;
};

type Tree = {
  types: Array<{
    id: number; code: string; name: string;
    categories: Array<{
      id: number; code: string; name: string;
      subcategories: Array<{ id: number; code: string; name: string }>;
    }>;
  }>;
};

const LEVEL_LABELS = ["", "Tipe (Level 1)", "Kategori (Level 2)", "Subkategori (Level 3)"];

export function CategoryManager() {
  const [tree, setTree] = useState<Tree | null>(null);
  const [flatList, setFlatList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form
  const [formData, setFormData] = useState({
    name: "", code: "", level: 1, parentId: null as number | null, description: ""
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const json = await res.json();
      if (json.data) {
        // json.data is actually the array of Level 1 categories
        setTree({ types: json.data });
        // Flatten for parent picker
        const flat: Category[] = [];
        json.data.forEach((t: any) => {
          flat.push({ id: t.id, name: t.name, code: t.code, level: 1, parentId: null, description: null });
          t.categories?.forEach((c: any) => {
            flat.push({ id: c.id, name: c.name, code: c.code, level: 2, parentId: t.id, description: null });
            c.subcategories?.forEach((s: any) => {
              flat.push({ id: s.id, name: s.name, code: s.code, level: 3, parentId: c.id, description: null });
            });
          });
        });
        setFlatList(flat);
      }
    } catch {
      toast.error("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = (level: number, parentId: number | null) => {
    setEditingId(null);
    setFormData({ name: "", code: "", level, parentId, description: "" });
    setIsOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, code: cat.code, level: cat.level, parentId: cat.parentId, description: cat.description || "" });
    setIsOpen(true);
  };

  const closeModal = () => { setIsOpen(false); setEditingId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(editingId ? "Kategori diperbarui!" : "Kategori ditambahkan!");
      closeModal();
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus kategori ini? Pastikan tidak ada aset atau sub-kategori yang terhubung.")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Kategori dihapus!");
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Color coding per level
  const levelColors: Record<number, string> = {
    1: "bg-violet-100 text-violet-700 border-violet-200",
    2: "bg-blue-100 text-blue-700 border-blue-200",
    3: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <>
      <div className="glass-panel rounded-3xl border border-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-violet-600" />
              Daftar Kategori
            </h2>
            <p className="text-slate-500 text-xs font-medium mt-0.5">3 level hierarki: Tipe → Kategori → Subkategori</p>
          </div>
          <button
            onClick={() => openAdd(1, null)}
            className="bg-violet-50 border border-violet-200 text-violet-700 hover:text-white hover:bg-violet-600 p-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto max-h-[500px] p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : !tree || !tree.types?.length ? (
            <div className="p-8 text-center">
              <FolderTree className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-medium text-sm">Belum ada kategori</p>
            </div>
          ) : (
            tree.types.map((type) => (
              <div key={type.id} className="rounded-2xl border border-slate-100 overflow-hidden">
                {/* Level 1 — Tipe */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border font-mono ${levelColors[1]}`}>{type.code}</span>
                    <span className="font-bold text-slate-800 text-sm">{type.name}</span>
                    <span className="text-xs text-slate-400 font-medium">Tipe</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openAdd(2, type.id)} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Tambah Kategori">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openEdit({ id: type.id, name: type.name, code: type.code, level: 1, parentId: null, description: null })} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(type.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Level 2 — Kategori */}
                {type.categories?.map((cat) => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-slate-100 pl-8">
                      <div className="flex items-center gap-3">
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border font-mono ${levelColors[2]}`}>{cat.code}</span>
                        <span className="font-semibold text-slate-700 text-sm">{cat.name}</span>
                        <span className="text-xs text-slate-400">Kategori</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openAdd(3, cat.id)} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Tambah Subkategori">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openEdit({ id: cat.id, name: cat.name, code: cat.code, level: 2, parentId: type.id, description: null })} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Level 3 — Subkategori */}
                    {cat.subcategories?.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between px-4 py-2 bg-white border-t border-slate-50 pl-14">
                        <div className="flex items-center gap-3">
                          <ChevronRight className="w-3 h-3 text-slate-200" />
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border font-mono ${levelColors[3]}`}>{sub.code}</span>
                          <span className="text-slate-600 text-sm font-medium">{sub.name}</span>
                          <span className="text-xs text-slate-300">Sub</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit({ id: sub.id, name: sub.name, code: sub.code, level: 3, parentId: cat.id, description: null })} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  {editingId ? "Edit Kategori" : `Tambah ${LEVEL_LABELS[formData.level]}`}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{LEVEL_LABELS[formData.level]}</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Kode — hanya saat tambah baru */}
              {!editingId && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Kode <span className="text-rose-500">*</span>
                    <span className="text-slate-400 font-normal ml-2 text-xs">
                      {formData.level === 1 && "(1 huruf, contoh: E)"}
                      {formData.level === 2 && "(2 huruf, contoh: EA)"}
                      {formData.level === 3 && "(3 huruf, contoh: EAS)"}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-mono uppercase"
                    maxLength={formData.level === 1 ? 1 : formData.level === 2 ? 2 : 3}
                    required
                  />
                </div>
              )}

              {editingId && (
                <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Kode (tidak dapat diubah):</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border font-mono ${levelColors[formData.level]}`}>{formData.code}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
                  rows={2}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-violet-600 text-white hover:bg-violet-700 font-bold rounded-xl transition-colors shadow-lg shadow-violet-200 flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
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
