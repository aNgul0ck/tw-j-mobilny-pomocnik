import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Loader2, User as UserIcon, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Ustawienia — Pinly" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user!.id)
      .maybeSingle()
      .then(({ data }) => {
        setDisplayName(data?.display_name ?? "");
        setAvatarUrl(data?.avatar_url ?? null);
      });
  }, [user]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", user!.id);
    setSaving(false);
    if (error) return toast.error("Nie udało się zapisać");
    toast.success("Zapisano");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <h1 className="text-xl font-bold">Ustawienia</h1>

      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback>
            {(displayName || user?.email || "U").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <UserIcon className="h-4 w-4" /> Profil
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dn">Nazwa wyświetlana</Label>
          <Input
            id="dn"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={save} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Zapisz
        </Button>
      </div>

      <div className="space-y-2 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Smartphone className="h-4 w-4" /> Aplikacja mobilna
        </div>
        <p className="text-sm text-muted-foreground">
          Powiadomienia push i wykrywanie lokalizacji w tle działają w pełni po
          zbudowaniu aplikacji natywnej (Capacitor) na iOS/Android. W przeglądarce
          dostępne jest ręczne pingowanie i wykrywanie wejścia, gdy aplikacja jest
          otwarta.
        </p>
      </div>

      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" /> Wyloguj się
      </Button>
    </div>
  );
}
