"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Sparkles, Loader2, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

function RegisterForm() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Gagal membuat akun");
      } else {
        // After registration, go to login with callbackUrl so user returns to borrow page
        const loginUrl = callbackUrl !== '/dashboard'
          ? `/?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`
          : '/?registered=true';
        router.push(loginUrl);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden text-slate-800">
      <div className="absolute top-[-10%] left-[50%] w-[45vw] h-[45vw] rounded-full bg-fuchsia-400/20 blur-3xl animate-float mix-blend-multiply pointer-events-none -translate-x-1/2"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-violet-400/20 blur-3xl animate-float-delayed mix-blend-multiply pointer-events-none"></div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="flex justify-center mb-6 animate-fade-in-up">
          <Link href="/">
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/60 shadow-sm cursor-pointer hover:bg-white/80 transition-colors">
              <div className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-xl p-2 shadow-lg shadow-violet-500/30 text-white flex items-center justify-center">
                <Logo className="h-7 w-7" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-800">
                NAWA<span className="text-violet-600">VAULT</span>
              </span>
            </div>
          </Link>
        </div>

        <div className="glass-panel p-8 px-10 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 animate-pop-in">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Buat Akun Baru</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Daftar untuk mengelola sistem aset</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Nama Lengkap</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="block w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400 font-medium"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="block w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400 font-medium"
                  placeholder="admin@nawa.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="block w-full pl-11 pr-12 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-slate-400 font-medium"
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-violet-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-violet-500/25 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 hover:shadow-violet-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all disabled:opacity-70 mt-6"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buat Akun"}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500 font-medium">Sudah punya akun? </span>
            <Link href={callbackUrl !== '/dashboard' ? `/?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/'} className="font-bold text-violet-600 hover:text-violet-500 transition-colors">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
