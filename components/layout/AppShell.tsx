'use client';

import { useState, Suspense } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Toaster } from 'sonner';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden text-slate-800">
      <Toaster position="top-center" richColors />
      {/* Animated Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-violet-400/20 blur-3xl animate-float mix-blend-multiply pointer-events-none z-0"></div>
      <div className="fixed top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-orange-400/20 blur-3xl animate-float-delayed mix-blend-multiply pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-indigo-400/20 blur-3xl animate-float-slow mix-blend-multiply pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar isSidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Added pb-24 on mobile to accommodate MobileNav */}
        <main className="lg:ml-[280px] pt-24 pb-28 lg:pb-12 flex-1">
          <div className="px-4 md:px-8 max-w-7xl mx-auto animate-fade-in-up">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
              </div>
            }>
              {children}
            </Suspense>
          </div>
        </main>
        
        <MobileNav />
        
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
