import { AppShell } from "@/components/layout/AppShell";

export const unstable_instant = false;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

