"use client";

import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { MapPin, Box, ChevronRight } from "lucide-react";

export function AssetCard({ asset }: { asset: any }) {
  return (
    <Link href={`/assets/${asset.assetId}`} className="block group h-full">
      <div className="relative h-full bg-white/70 backdrop-blur-xl rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(124,58,237,0.15)] border border-white/60 flex flex-col overflow-hidden">
        
        {/* Glamorous ambient highlight */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex justify-between items-start mb-6">
          <div className="bg-gradient-to-br from-slate-100 to-white shadow-inner p-3 rounded-2xl border border-slate-100 text-slate-400 group-hover:text-violet-600 transition-colors duration-300 relative overflow-hidden">
            <Box className="h-6 w-6 relative z-10" />
            <div className="absolute inset-0 bg-violet-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <StatusBadge status={asset.status} />
        </div>
        
        <div className="relative z-10 flex-1">
          <h3 className="text-xl font-black text-slate-800 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-fuchsia-600 transition-all">{asset.name}</h3>
          
          <div className="mt-3 flex items-center">
            <span className="font-mono text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-md shadow-sm">
              {asset.assetId}
            </span>
          </div>
        </div>
        
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-100/80 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="bg-slate-100 p-1.5 rounded-lg">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <span className="font-semibold truncate max-w-[100px]">{asset.location || 'N/A'}</span>
          </div>
          
          <div className="flex items-center gap-2 group-hover:text-violet-600 transition-colors font-bold text-slate-400">
            <span className="text-xs uppercase tracking-wider">{asset.condition === 'good' ? 'Baik' : asset.condition === 'fair' ? 'Cukup' : 'Rusak'}</span>
            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
