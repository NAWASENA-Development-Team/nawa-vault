import { getAppSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { assets, loans } from "@/db/schema";
import { eq, sql, desc, and, lt } from "drizzle-orm";
import { Box, ArrowLeftRight, AlertTriangle, CheckCircle, ScanLine, Plus, Sparkles, TrendingUp, History } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { FadeIn } from "@/components/shared/FadeIn";

export default async function DashboardPage() {
  const session = await getAppSession();
  if (!session) redirect("/");
  
  const isAdmin = (session.user as any)?.role === 'admin';

  if (isAdmin) {
    return <AdminDashboard session={session} />;
  } else {
    return <MemberDashboard session={session} />;
  }
}

async function AdminDashboard({ session }: { session: any }) {
  const [totalAssets, borrowedAssets, overdueLoans, availableAssets] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(assets),
    db.select({ count: sql<number>`count(*)` }).from(assets).where(eq(assets.status, 'borrowed')),
    db.select({ count: sql<number>`count(*)` }).from(loans).where(eq(loans.status, 'overdue')),
    db.select({ count: sql<number>`count(*)` }).from(assets).where(eq(assets.status, 'available'))
  ]);

  const stats = {
    total: totalAssets[0].count,
    borrowed: borrowedAssets[0].count,
    overdue: overdueLoans[0].count,
    available: availableAssets[0].count
  };

  return (
    <div className="space-y-10 pb-12 relative">
      <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl -mt-10 z-0"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm mb-4">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">Executive Dashboard</span>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-violet-900 tracking-tight">
            Ringkasan Sistem
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">
            Selamat datang kembali, <span className="font-bold text-violet-600 border-b-2 border-violet-200">{session.user?.name}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/scan" className="group relative overflow-hidden bg-white/80 backdrop-blur-md text-slate-800 border border-slate-200 hover:border-violet-300 rounded-full px-7 py-3.5 font-bold text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-violet-600" /> Scan QR
          </Link>
          <Link href="/assets/new" className="group relative overflow-hidden bg-slate-900 text-white rounded-full px-7 py-3.5 font-bold text-sm transition-all shadow-lg shadow-slate-900/20 hover:shadow-violet-600/30 hover:-translate-y-1 flex items-center gap-2">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-[150%] group-hover:animate-[shine_1.5s_ease-out]"></div>
            <span className="relative z-10 flex items-center gap-2"><Plus className="h-4 w-4" /> Tambah Aset</span>
          </Link>
        </div>
      </div>

      <FadeIn delay={0.2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <StatCard 
          icon={<Box className="h-6 w-6 text-white" />} 
          title="Total Koleksi" 
          value={stats.total} 
          bgClass="bg-gradient-to-br from-violet-500 to-indigo-600" 
          shadowClass="shadow-violet-500/20"
          trend="+12% bulan ini" 
        />
        <StatCard 
          icon={<CheckCircle className="h-6 w-6 text-white" />} 
          title="Siap Digunakan" 
          value={stats.available} 
          bgClass="bg-gradient-to-br from-emerald-400 to-teal-500" 
          shadowClass="shadow-emerald-500/20"
          trend="Kondisi prima" 
        />
        <StatCard 
          icon={<ArrowLeftRight className="h-6 w-6 text-white" />} 
          title="Sedang Dipinjam" 
          value={stats.borrowed} 
          bgClass="bg-gradient-to-br from-amber-400 to-orange-500" 
          shadowClass="shadow-amber-500/20" 
          trend="Aktivitas tinggi"
        />
        <StatCard 
          icon={<AlertTriangle className="h-6 w-6 text-white" />} 
          title="Terlambat" 
          value={stats.overdue} 
          bgClass="bg-gradient-to-br from-rose-400 to-red-500" 
          shadowClass="shadow-rose-500/20" 
          trend="Perlu perhatian"
        />
      </div>
      </FadeIn>
      
      {/* Glamorous Decorative Section */}
      <FadeIn delay={0.4}>
      <div className="relative z-10 mt-10">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-200 to-fuchsia-200 rounded-[2.5rem] blur opacity-50"></div>
        <div className="relative bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-10 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl"></div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-800 mb-3 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-violet-600" /> Analisis Aktivitas
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-2xl">
              Pantau siklus peminjaman dan kesehatan aset Anda dalam satu tampilan yang elegan. Visualisasi data tingkat lanjut akan segera hadir untuk memberikan Anda insight yang lebih dalam.
            </p>
            
            <div className="flex items-center gap-4">
              <a 
                href="/api/export" 
                download
                className="bg-slate-900 text-white rounded-full px-6 py-2.5 text-sm font-bold shadow-md hover:-translate-y-0.5 transition-transform text-center inline-block"
              >
                Unduh Laporan (CSV)
              </a>
              <Link 
                href="/loans"
                className="bg-white text-slate-700 border border-slate-200 rounded-full px-6 py-2.5 text-sm font-bold shadow-sm hover:border-violet-300 hover:text-violet-600 transition-colors text-center inline-block"
              >
                Detail Metrik
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/3 aspect-video bg-gradient-to-tr from-slate-100 to-white rounded-2xl border border-white shadow-inner flex items-center justify-center">
            <div className="flex items-end gap-3 h-24">
              <div className="w-8 bg-violet-200 rounded-t-md h-12"></div>
              <div className="w-8 bg-violet-300 rounded-t-md h-16"></div>
              <div className="w-8 bg-violet-400 rounded-t-md h-10"></div>
              <div className="w-8 bg-violet-500 rounded-t-md h-20"></div>
              <div className="w-8 bg-fuchsia-500 rounded-t-md h-24"></div>
            </div>
          </div>
        </div>
      </div>
      </FadeIn>
    </div>
  );
}

async function MemberDashboard({ session }: { session: any }) {
  // Fetch recent loans for this user
  const userLoans = await db
    .select({
      id: loans.id,
      loanCode: loans.loanCode,
      status: loans.status,
      dueDate: loans.dueDate,
      returnDate: loans.returnDate,
      assetName: assets.name,
      assetId: assets.assetId,
    })
    .from(loans)
    .leftJoin(assets, eq(loans.assetId, assets.id))
    .where(eq(loans.borrowerName, session.user.name))
    .orderBy(desc(loans.createdAt))
    .limit(5);

  const activeCount = userLoans.filter(l => l.status === 'active').length;

  return (
    <div className="space-y-10 pb-12 relative">
      <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-3xl -mt-10 z-0"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 backdrop-blur-md border border-emerald-100 shadow-sm mb-4">
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Portal Peminjam</span>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-emerald-900 tracking-tight">
            Dashboard Anda
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">
            Halo, <span className="font-bold text-emerald-600 border-b-2 border-emerald-200">{session.user?.name}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/scan" className="group relative overflow-hidden bg-emerald-600 text-white rounded-full px-8 py-3.5 font-bold text-sm transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-600/40 hover:-translate-y-1 flex items-center gap-2">
            <ScanLine className="h-4 w-4" /> Scan QR untuk Pinjam
          </Link>
        </div>
      </div>

      <FadeIn delay={0.2}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="md:col-span-1 space-y-6">
          <div className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Box className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">Sedang Dipinjam</p>
                <p className="text-3xl font-black text-slate-800">{activeCount} <span className="text-lg text-slate-500 font-medium">Barang</span></p>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium border-t border-slate-100 pt-4">
              Pastikan mengembalikan barang tepat waktu untuk menghindari denda.
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-500" /> Riwayat Peminjaman Anda
            </h2>
            
            {userLoans.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">Anda belum memiliki riwayat peminjaman.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userLoans.map(loan => (
                  <div key={loan.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-bold text-slate-800">{loan.assetName || 'Aset Tidak Diketahui'}</p>
                      <p className="text-xs font-medium text-slate-400 mt-1">Kode Pinjam: {loan.loanCode}</p>
                    </div>
                    <div className="mt-3 sm:mt-0 flex flex-col sm:items-end">
                      <StatusBadge status={loan.status ?? 'active'} />
                      <p className="text-xs font-medium text-slate-500 mt-2">
                        {loan.status === 'active' ? `Tenggat: ${formatDate(loan.dueDate)}` : `Dikembalikan: ${formatDate(loan.returnDate)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </FadeIn>
    </div>
  );
}

function StatCard({ icon, title, value, bgClass, shadowClass, trend }: any) {
  return (
    <div className={`relative bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-lg ${shadowClass} transition-all duration-500 hover:-translate-y-2 hover:shadow-xl group overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgClass} opacity-10 rounded-bl-[100px] -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-110`}></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
          <p className="text-5xl font-black text-slate-800 tracking-tighter">{value}</p>
        </div>
        <div className={`${bgClass} p-3 rounded-2xl shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 relative z-10">
        <p className="text-sm font-semibold text-slate-500">{trend}</p>
      </div>
    </div>
  );
}
