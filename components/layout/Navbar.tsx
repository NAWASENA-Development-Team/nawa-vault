"use client";

import { useSession, signOut } from "next-auth/react";
import { Menu, X, LogOut, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Navbar({ isSidebarOpen, onToggleSidebar }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <header className="fixed top-4 left-4 right-4 lg:left-[296px] z-50 flex h-16 items-center justify-between rounded-2xl bg-white/90 backdrop-blur-xl shadow-md border border-white/50 px-4 lg:px-6 transition-all duration-300">
      {/* Left: hamburger + brand (mobile only) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        <span className="text-lg font-bold tracking-wide text-slate-800 lg:hidden">
          NAWA<span className="text-violet-600">-VAULT</span>
        </span>
        
        <div className="hidden lg:flex relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari sesuatu..." 
            className="w-full bg-white/50 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>
      </div>

      {/* Right: user info + logout */}
      {session?.user && (
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-sm font-medium text-slate-600">
              {session.user.name}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-violet-500 to-orange-400 text-sm font-bold text-white shadow-md shadow-violet-500/20">
              {session.user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
              "text-red-500 hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all"
            )}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      )}
    </header>
  );
}
