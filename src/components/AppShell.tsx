import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Bookmark, LayoutDashboard, LogOut, MessagesSquare, PenLine, Palette, Settings } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/workspace", label: "AI Workspace", icon: MessagesSquare },
  { to: "/copywriter", label: "AI Copywriter", icon: PenLine },
  { to: "/design-studio", label: "AI Design Studio", icon: Palette },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" replace />;

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="border-b border-sidebar-border px-5 py-5"><Logo light /></div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "bg-sidebar-accent text-white" : "hover:bg-white/5"}`}>
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="truncate px-3 pb-2 text-xs opacity-70">{profile.business_name ?? user.email}</div>
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-white/5"
            onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <nav className="flex gap-1 overflow-x-auto border-b bg-sidebar p-2 md:hidden">
          {nav.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-white ${isActive ? "bg-sidebar-accent" : "opacity-70"}`}>{label}</NavLink>
          ))}
        </nav>
        <main className="mx-auto max-w-6xl p-5 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl font-semibold">{title}</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{sub}</p></div>
      {actions}
    </div>
  );
}
