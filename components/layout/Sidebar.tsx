"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Tag, LogOut, TrendingUp, Menu, X, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transações" },
  { href: "/categories", icon: Tag, label: "Categorias" },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 flex-1">
      {navItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          onClick={onClick}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname === href
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {isDark ? "Modo claro" : "Modo escuro"}
    </Button>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 min-h-screen flex-col bg-card border-r border-border p-4">
      <div className="flex items-center gap-2 mb-8 px-1">
        <TrendingUp className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">Finanças</span>
      </div>
      <NavLinks />
      <div className="mt-2 flex flex-col gap-1">
        <ThemeToggle />
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </form>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-bold">Finanças</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-card border-r border-border p-4 flex flex-col">
            <div className="flex items-center justify-between mb-8 px-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Finanças</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <NavLinks onClick={() => setOpen(false)} />
            <div className="mt-2 flex flex-col gap-1">
              <ThemeToggle />
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
