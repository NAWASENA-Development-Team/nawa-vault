"use client";

import { useState } from "react";
import { CATEGORY_TREE, type SubCategory } from "@/lib/category-config";
import { ChevronDown, FolderTree } from "lucide-react";

interface CategoryPickerProps {
  value: string;       // selected subcategory code (e.g. "EAS")
  onChange: (code: string, name: string) => void;
  disabled?: boolean;
}

export function CategoryPicker({ value, onChange, disabled }: CategoryPickerProps) {
  const [typeCode, setTypeCode] = useState<string>("");
  const [catCode, setCatCode] = useState<string>("");

  const selectedType = CATEGORY_TREE.find((t) => t.code === typeCode);
  const selectedCat = selectedType?.categories.find((c) => c.code === catCode);

  const handleTypeChange = (code: string) => {
    setTypeCode(code);
    setCatCode("");
    onChange("", ""); // reset
  };

  const handleCatChange = (code: string) => {
    setCatCode(code);
    onChange("", ""); // reset subcat
  };

  const handleSubcatChange = (sub: SubCategory) => {
    onChange(sub.code, sub.name);
  };

  const selectClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed appearance-none";

  return (
    <div className="space-y-3">
      {/* Level 1: Type */}
      <div className="relative">
        <select
          value={typeCode}
          onChange={(e) => handleTypeChange(e.target.value)}
          disabled={disabled}
          className={selectClass}
        >
          <option value="">— Pilih Tipe —</option>
          {CATEGORY_TREE.map((t) => (
            <option key={t.code} value={t.code}>
              [{t.code}] {t.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>

      {/* Level 2: Kategori */}
      <div className="relative">
        <select
          value={catCode}
          onChange={(e) => handleCatChange(e.target.value)}
          disabled={disabled || !selectedType}
          className={selectClass}
        >
          <option value="">— Pilih Kategori —</option>
          {selectedType?.categories.map((c) => (
            <option key={c.code} value={c.code}>
              [{c.code}] {c.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>

      {/* Level 3: Subkategori */}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => {
            const sub = selectedCat?.subcategories.find((s) => s.code === e.target.value);
            if (sub) handleSubcatChange(sub);
          }}
          disabled={disabled || !selectedCat}
          className={selectClass}
        >
          <option value="">— Pilih Subkategori —</option>
          {selectedCat?.subcategories.map((s) => (
            <option key={s.code} value={s.code}>
              [{s.code}] {s.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>

      {/* Preview badge */}
      {value && (
        <div className="flex items-center gap-2 text-xs text-violet-700 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
          <FolderTree className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="font-mono font-bold">{value}</span>
          <span className="text-slate-400">·</span>
          <span className="truncate">{selectedCat?.subcategories.find(s => s.code === value)?.name}</span>
        </div>
      )}
    </div>
  );
}
