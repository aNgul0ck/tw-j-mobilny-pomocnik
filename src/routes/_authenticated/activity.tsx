import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Loader2, MapPin, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({ meta: [{ title: "Aktywność — Pinly" }] }),
  component: ActivityPage,
});

interface Ping {
  id: string;
  sender_id: string;
  recipient_id: string;
  place_name: string;
  created_at: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "przed chwilą";
  if (m < 60) return `${m} min temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} godz. temu`;
  return `${Math.floor(h / 24)} dni temu`;
}

function ActivityPage() {
  const { user } = useAuth();
  const [pings, setPings] = useState<Ping[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("pings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    const rows = (data as Ping[]) ?? [];
    setPings(rows);
    const ids = Array.from(new Set(rows.flatMap((p) => [p.sender_id, p.recipient_id])));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", ids);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p) => {
        map[p.id] = p.display_name || p.email || "Użytkownik";
      });
      setNames(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("pings-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pings" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="text-xl font-bold">Aktywność</h1>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : pings.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
          Brak aktywności. Pingi pojawią się tutaj.
        </div>
      ) : (
        <ul className="space-y-2">
          {pings.map((p) => {
            const incoming = p.recipient_id === user!.id;
            return (
              <li key={p.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    incoming ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {incoming ? (
                    <ArrowDownLeft className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    {incoming ? (
                      <>
                        <span className="font-medium">{names[p.sender_id] ?? "Znajomy"}</span> dotarł
                        do <span className="font-medium">{p.place_name}</span>
                      </>
                    ) : (
                      <>
                        Powiadomiono <span className="font-medium">{names[p.recipient_id] ?? "znajomego"}</span> o
                        przyjściu do <span className="font-medium">{p.place_name}</span>
                      </>
                    )}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {timeAgo(p.created_at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
