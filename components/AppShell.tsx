"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  History,
  Plus,
  CalendarClock,
  User,
  ShieldCheck,
  LogOut,
  Gem,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/pledges", label: "Pledges", icon: CalendarClock },
  { href: "/redeem", label: "Redeem", icon: Gem },
  { href: "/leader-dashboard", label: "Leadership", icon: ShieldCheck },
  { href: "/profile", label: "Profile", icon: User },
];

// Mobile bottom bar: 5 slots with a center FAB for giving.
const mobileNav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/pledges", label: "Pledges", icon: CalendarClock },
  { href: "/profile", label: "Profile", icon: User },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") localStorage.removeItem("onboardingCompleted");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ---------- Desktop sidebar ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-background md:flex">
        <nav className="flex-1 space-y-1 p-3 pt-6">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/admin"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <ShieldCheck className="size-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="space-y-2 border-t border-border p-3">
          <Button render={<Link href="/give" />} className="w-full justify-start gap-2">
            <Plus className="size-4" /> Log giving
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <LogOut className="size-4" /> Log out
          </Button>
        </div>
      </aside>

      {/* ---------- Main column ---------- */}
      <div className="md:pl-64">
        <main className="mx-auto max-w-6xl px-5 pb-28 pt-[max(2rem,env(safe-area-inset-top))] md:pb-12">
          {children}
        </main>
      </div>

      {/* ---------- Mobile bottom nav ---------- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5 items-center px-2">
          {mobileNav.slice(0, 2).map((item) => (
            <BottomItem key={item.href} {...item} active={pathname === item.href} />
          ))}
          <Link
            href="/give"
            className="mx-auto -mt-6 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
            aria-label="Log giving"
          >
            <Plus className="size-6" />
          </Link>
          {mobileNav.slice(2).map((item) => (
            <BottomItem key={item.href} {...item} active={pathname === item.href} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function BottomItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
