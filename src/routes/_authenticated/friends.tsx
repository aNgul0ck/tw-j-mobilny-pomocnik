import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  UserPlus,
  Check,
  X,
  Loader2,
  Users,
  Clock,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Friend } from "@/lib/geo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/friends")({
  head: () => ({ meta: [{ title: "Znajomi — Pinly" }] }),
  component: FriendsPage,
});

function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const { data: rows } = await supabase
      .from("friendships")
      .select("*");
    if (!rows) {
      setLoading(false);
      return;
    }
    const otherIds = rows.map((r) =>
      r.requester_id === user!.id ? r.addressee_id : r.requester_id,
    );
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, email, avatar_url")
      .in("id", otherIds.length ? otherIds : ["00000000-0000-0000-0000-000000000000"]);
    const map = new Map((profiles ?? []).map((p) => [p.id, p]));
    const list: Friend[] = rows.map((r) => {
      const otherId = r.requester_id === user!.id ? r.addressee_id : r.requester_id;
      return {
        id: r.id,
        status: r.status,
        direction: r.requester_id === user!.id ? "outgoing" : "incoming",
        profile: map.get(otherId) ?? {
          id: otherId,
          display_name: "Użytkownik",
          email: null,
          avatar_url: null,
        },
      };
    });
    setFriends(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const sendRequest = async () => {
    const target = email.trim().toLowerCase();
    if (!target) return;
    setAdding(true);
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, email")
        .ilike("email", target)
        .maybeSingle();
      if (!prof) throw new Error("Nie znaleziono użytkownika o tym e-mailu");
      if (prof.id === user!.id) throw new Error("Nie możesz dodać siebie");
      const { error } = await supabase.from("friendships").insert({
        requester_id: user!.id,
        addressee_id: prof.id,
      });
      if (error) {
        if (error.code === "23505") throw new Error("Zaproszenie już istnieje");
        throw error;
      }
      toast.success("Zaproszenie wysłane");
      setEmail("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd");
    } finally {
      setAdding(false);
    }
  };

  const respond = async (id: string, accept: boolean) => {
    if (accept) {
      await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
      toast.success("Dodano do znajomych");
    } else {
      await supabase.from("friendships").delete().eq("id", id);
      toast.success("Odrzucono");
    }
    load();
  };

  const removeFriend = async (id: string) => {
    await supabase.from("friendships").delete().eq("id", id);
    toast.success("Usunięto");
    load();
  };

  const accepted = friends.filter((f) => f.status === "accepted");
  const incoming = friends.filter((f) => f.status === "pending" && f.direction === "incoming");
  const outgoing = friends.filter((f) => f.status === "pending" && f.direction === "outgoing");

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <h1 className="text-xl font-bold">Znajomi</h1>

      <div className="rounded-xl border bg-card p-4">
        <Label>Dodaj znajomego po e-mailu</Label>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              type="email"
              placeholder="znajomy@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendRequest()}
            />
          </div>
          <Button onClick={sendRequest} disabled={adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {incoming.length > 0 && (
            <Section title="Zaproszenia do Ciebie">
              {incoming.map((f) => (
                <FriendRow key={f.id} friend={f}>
                  <Button size="icon" variant="ghost" onClick={() => respond(f.id, true)}>
                    <Check className="h-4 w-4 text-primary" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => respond(f.id, false)}>
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </FriendRow>
              ))}
            </Section>
          )}

          <Section title={`Znajomi (${accepted.length})`}>
            {accepted.length === 0 ? (
              <Empty text="Brak znajomych. Wyślij pierwsze zaproszenie powyżej." />
            ) : (
              accepted.map((f) => (
                <FriendRow key={f.id} friend={f}>
                  <Button size="icon" variant="ghost" onClick={() => removeFriend(f.id)}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </FriendRow>
              ))
            )}
          </Section>

          {outgoing.length > 0 && (
            <Section title="Wysłane zaproszenia">
              {outgoing.map((f) => (
                <FriendRow key={f.id} friend={f}>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> oczekuje
                  </span>
                </FriendRow>
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium">{children}</p>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Users className="h-4 w-4" /> {title}
      </h2>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <li className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
      {text}
    </li>
  );
}

function FriendRow({ friend, children }: { friend: Friend; children: React.ReactNode }) {
  const name = friend.profile.display_name || friend.profile.email || "Użytkownik";
  return (
    <li className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={friend.profile.avatar_url ?? undefined} />
        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        {friend.profile.email && (
          <p className="truncate text-xs text-muted-foreground">{friend.profile.email}</p>
        )}
      </div>
      <div className="flex items-center">{children}</div>
    </li>
  );
}
