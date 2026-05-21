"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Sparkles, Loader2, ArrowLeft, UserCircle, Hash, Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Logo } from "@/components/shared/Logo";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 data
  const [email, setEmail] = useState("");
  
  // Step 2 data
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email })
      });
      
      const data = await res.json();
      
      if (res.ok && data.userId) {
        setUserId(data.userId);
        setStep(2);
        toast.success("Verifikasi Berhasil", { description: "Silakan masukkan password baru Anda." });
      } else {
        toast.error("Email Tidak Ditemukan", { description: data.error || "Pastikan Email/NIS sesuai dengan data pendaftaran." });
      }
    } catch (error) {
      toast.error("Terjadi Kesalahan", { description: "Gagal memverifikasi data. Coba lagi nanti." });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Password Berbeda", { description: "Konfirmasi password tidak sama." });
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password Lemah", { description: "Password minimal 6 karakter." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', userId, newPassword })
      });
      
      if (res.ok) {
        toast.success("Password Berhasil Diubah", { description: "Anda akan dialihkan ke halaman login." });
        setTimeout(() => router.push('/'), 2500);
      } else {
        const data = await res.json();
        toast.error("Gagal Mengubah Password", { description: data.error || "Terjadi kesalahan." });
      }
    } catch (error) {
      toast.error("Terjadi Kesalahan", { description: "Gagal mereset password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden text-slate-800">
      <Toaster position="top-center" richColors />
      {/* Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-400/20 blur-3xl animate-float mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-400/20 blur-3xl animate-float-delayed mix-blend-multiply pointer-events-none"></div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/60 shadow-sm">
            <div className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-xl p-2 shadow-lg shadow-violet-500/30 text-white flex items-center justify-center">
              <Logo className="h-7 w-7" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-800">
              NAWA<span className="text-violet-600">VAULT</span>
            </span>
          </div>
        </div>

        <div className="glass-panel p-8 px-10 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 animate-pop-in">
          <div className="mb-8 text-center relative">
            <Link href="/" className="absolute left-0 top-1 text-slate-400 hover:text-violet-600 transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Lupa Password</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {step === 1 ? "Verifikasi identitas Anda terlebih dahulu" : "Buat password baru Anda"}
            </p>
          </div>

          {step === 1 ? (
            <form className="space-y-5" onSubmit={handleVerify}>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email / NIS</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Masukkan Email/NIS saat daftar"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-violet-500/25 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 hover:shadow-violet-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all disabled:opacity-70 mt-6"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verifikasi Identitas"}
              </button>
            </form>
          ) : (
            <form className="space-y-5 animate-fade-in-up" onSubmit={handleReset}>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Password Baru</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Konfirmasi Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Ketik ulang password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/25 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 mt-6"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Simpan Password Baru"}
              </button>
            </form>
          )}
          
        </div>
      </div>
    </div>
  );
}
