"use client";

import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = (s: string) => {
    switch (s.toLowerCase()) {
      case 'available':
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case 'borrowed':
      case 'active':
        return "bg-amber-100 text-amber-700 border-amber-200";
      case 'maintenance':
        return "bg-violet-100 text-violet-700 border-violet-200";
      case 'lost':
      case 'overdue':
        return "bg-rose-100 text-rose-700 border-rose-200";
      case 'returned':
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s.toLowerCase()) {
      case 'available': return "Tersedia";
      case 'borrowed': return "Dipinjam";
      case 'maintenance': return "Perbaikan";
      case 'lost': return "Hilang";
      case 'active': return "Aktif";
      case 'returned': return "Dikembalikan";
      case 'overdue': return "Terlambat";
      default: return s;
    }
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm", getStatusStyles(status))}>
      {getStatusLabel(status)}
    </span>
  );
}