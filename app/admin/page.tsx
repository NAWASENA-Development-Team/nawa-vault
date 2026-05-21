import { redirect } from 'next/navigation';
import { getAppSession } from '@/lib/auth';
import { db } from '@/db';
import { users, categories, auditLogs } from '@/db/schema';
import { desc, count } from 'drizzle-orm';
import { Users, FolderTree, Shield, Clock, Plus } from 'lucide-react';

export default async function AdminPage() {
  const session = await getAppSession();
  if (!session) redirect('/');
  if ((session.user as any).role !== 'admin') redirect('/dashboard');

  const [userCountResult] = await db.select({ value: count() }).from(users);
  const allCategories = await db.select().from(categories);
  const recentLogs = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(10);

  const userCount = userCountResult?.value ?? 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-rose-100 text-rose-600 p-2 rounded-xl">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Panel Admin</h1>
          </div>
          <p className="text-slate-500 font-medium">
            Kelola pengguna, kategori, dan pantau aktivitas sistem
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="glass-panel glass-panel-hover rounded-3xl border border-white p-6 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Total Pengguna</span>
          </div>
          <p className="text-4xl font-black text-slate-800">{userCount}</p>
        </div>

        <div className="glass-panel glass-panel-hover rounded-3xl border border-white p-6 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <FolderTree className="h-6 w-6" />
            </div>
            <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Total Kategori</span>
          </div>
          <p className="text-4xl font-black text-slate-800">{allCategories.length}</p>
        </div>

        <div className="glass-panel glass-panel-hover rounded-3xl border border-white p-6 relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6" />
            </div>
            <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Log Aktivitas</span>
          </div>
          <p className="text-4xl font-black text-slate-800">{recentLogs.length}</p>
          <p className="text-slate-400 font-medium text-sm mt-1">10 terbaru</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="glass-panel rounded-3xl border border-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full">
          <div className="px-6 py-5 border-b border-slate-100 bg-white/50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Daftar Kategori</h2>
              <p className="text-slate-500 text-sm font-medium">Kategori aset yang terdaftar dalam sistem</p>
            </div>
            <button className="bg-white border border-slate-200 text-slate-700 hover:text-violet-600 hover:border-violet-300 p-2 rounded-xl transition-all shadow-sm">
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {allCategories.length === 0 ? (
              <div className="p-12 text-center">
                <FolderTree className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Belum ada kategori terdaftar</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 text-slate-500 font-semibold sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="text-left px-6 py-3">Nama Kategori</th>
                    <th className="text-left px-6 py-3">Prefix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{cat.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-violet-100 text-violet-700 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-violet-200">
                          {cat.prefix}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Audit Logs Section */}
        <div className="glass-panel rounded-3xl border border-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full">
          <div className="px-6 py-5 border-b border-slate-100 bg-white/50">
            <h2 className="text-xl font-extrabold text-slate-800">Log Aktivitas Terbaru</h2>
            <p className="text-slate-500 text-sm font-medium">10 aktivitas terakhir di sistem</p>
          </div>

          <div className="flex-1 overflow-auto">
            {recentLogs.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Belum ada log aktivitas</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 p-2">
                {recentLogs.map((log) => (
                  <div key={log.id} className="px-4 py-3.5 flex items-start gap-4 hover:bg-slate-50 rounded-xl transition-colors m-1">
                    <div className="bg-slate-100 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <Clock className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-800 font-bold text-sm">{log.action}</span>
                        {log.entityType && (
                          <span className="bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">
                            {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 font-medium text-xs mt-1.5 flex items-center gap-2">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        }) : '-'}
                        {log.actorId && (
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span> User #{log.actorId}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
