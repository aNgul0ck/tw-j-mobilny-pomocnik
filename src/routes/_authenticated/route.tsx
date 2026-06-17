import { createFileRoute, Outlet, redirect, Link, useLocation } from "@tanstack/react-router";
import { Map, Users, Bell, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppShell,
});

const NAV = [
  { to: "/map", label: "Mapa", icon: Map },
  { to: "/friends", label: "Znajomi", icon: Users },
  { to: "/activity", label: "Aktywność", icon: Bell },
  { to: "/settings", label: "Ustawienia", icon: Settings },
] as const;

function AppShell() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 pb-20">
        <Outlet />
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
