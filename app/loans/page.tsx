'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, FileText, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLoans() {
      try {
        const res = await fetch('/api/loans');
        const json = await res.json();
        setLoans(json.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLoans();
  }, []);

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const matchesSearch =
        loan.loanCode.toLowerCase().includes(search.toLowerCase()) ||
        loan.borrowerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [loans, search, statusFilter]);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Daftar Peminjaman</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm">Pantau aktivitas peminjaman dan pengembalian aset</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
          <input
            type="text"
            placeholder="Cari kode pinjam atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 cursor-pointer text-sm"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="returned">Dikembalikan</option>
          <option value="overdue">Terlambat</option>
        </select>
      </div>

      <div className="glass-panel rounded-3xl border border-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse text-sm">Memuat data peminjaman...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="text-center p-12">
            <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">Tidak Ditemukan</h3>
            <p className="text-slate-500 text-sm">Data tidak ada atau tidak cocok dengan filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Kode Pinjam</th>
                    <th className="px-6 py-4">Peminjam</th>
                    <th className="px-6 py-4">Kelas</th>
                    <th className="px-6 py-4">Tgl Pinjam</th>
                    <th className="px-6 py-4">Jatuh Tempo</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-violet-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-violet-600">{loan.loanCode}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{loan.borrowerName}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{loan.borrowerClass ?? '-'}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{formatDate(loan.loanDate)}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{formatDate(loan.dueDate)}</td>
                      <td className="px-6 py-4"><StatusBadge status={loan.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredLoans.map((loan) => (
                <div key={loan.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-violet-600 text-sm">{loan.loanCode}</span>
                        <StatusBadge status={loan.status} />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">{loan.borrowerName}</p>
                      {loan.borrowerClass && (
                        <p className="text-xs text-slate-500 mt-0.5">{loan.borrowerClass}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400 font-medium">
                    <span>Pinjam: {formatDate(loan.loanDate)}</span>
                    <span>Tempo: {formatDate(loan.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
