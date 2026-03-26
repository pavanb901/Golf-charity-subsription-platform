"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, LayoutDashboard, LogIn, ShieldCheck, Trophy, UserCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDemo } from "@/components/providers/demo-provider";

const links = [
  { href: "/", label: "Home", icon: Trophy },
  { href: "/charities", label: "Charities", icon: HeartHandshake },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Admin", icon: ShieldCheck }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, logout, isLiveMode } = useDemo();

  return (
    <div className="min-h-screen bg-mist text-ink">
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-mist/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            FairChance Club
          </Link>
          <nav className="hidden gap-2 md:flex">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  pathname === href ? "bg-ink text-mist" : "text-ink/70 hover:bg-white"
                )}
              >
                {label}
              </Link>
            ))}
            <Link
              href={currentUser ? "/profile" : "/login"}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                pathname === "/login" || pathname === "/profile"
                  ? "bg-ink text-mist"
                  : "text-ink/70 hover:bg-white"
              )}
            >
              {currentUser ? "Profile" : "Login"}
            </Link>
            {currentUser ? (
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-white"
              >
                Logout
              </button>
            ) : null}
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href={currentUser ? "/profile" : "/login"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white"
            >
              {currentUser ? <UserCircle2 className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            </Link>
          </div>
        </div>
        <div className="border-t border-ink/6 bg-white/60 px-5 py-2 text-xs text-slate lg:px-8">
          {isLiveMode
            ? "Supabase mode enabled. Auth and platform data use your configured backend."
            : "Demo mode enabled. Add Supabase and Stripe env vars to switch to real services."}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
