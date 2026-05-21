"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Box,
  ArrowLeftRight,
  QrCode,
  Shield,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Aset", href: "/assets", icon: Box },
  { label: "Peminjaman", href: "/loans", icon: ArrowLeftRight },
  { label: "Scan QR", href: "/scan", icon: QrCode },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user && (session.user as any).role === 'admin';
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside
      className={cn(
        "fixed left-4 top-4 bottom-4 z-40 flex w-64 flex-col rounded-2xl glass-panel transition-transform duration-300 ease-in-out shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
        isOpen ? "translate-x-0" : "-translate-x-[120%]",
        "lg:translate-x-0"
      )}
    >
      <div className="px-6 py-6 border-b border-white/40">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-xl p-2 shadow-lg shadow-violet-500/30 text-white flex items-center justify-center">
            <Logo className="h-7 w-7" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            NAWA<span className="text-violet-600">VAULT</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {visibleNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                active
                  ? "bg-white text-violet-600 shadow-sm border border-white/50"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-r-full" />
              )}
              <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-br from-violet-50 to-orange-50 rounded-xl p-4 border border-white">
          <p className="text-xs font-medium text-slate-500">Sistem Manajemen Aset</p>
          <p className="text-xs text-slate-400 mt-1">&copy; {new Date().getFullYear()} NawaVault</p>
        </div>
      </div>
    </aside>
  );
}
