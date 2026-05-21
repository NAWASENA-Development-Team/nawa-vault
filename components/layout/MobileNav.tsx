"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Box, ArrowLeftRight, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Aset", href: "/assets", icon: Box },
  { label: "Pinjam", href: "/loans", icon: ArrowLeftRight },
  { label: "Scan", href: "/scan", icon: QrCode },
];

export function MobileNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="glass-panel bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl shadow-slate-200/50 flex justify-between items-center px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300 relative",
                active ? "text-violet-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {active && (
                <div className="absolute inset-0 bg-violet-50 rounded-xl -z-10 animate-pop-in"></div>
              )}
              <item.icon className={cn("h-5 w-5 mb-1 transition-transform", active ? "scale-110" : "")} />
              <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
