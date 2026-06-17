import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MapPin, Bell, Users, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pinly — powiadom znajomych, gdy dotrzesz na miejsce" },
      {
        name: "description",
        content:
          "Pinly automatycznie pinguje wybranych znajomych, gdy pojawisz się w zapisanej lokalizacji. Mapa, miejsca i powiadomienia w jednej aplikacji.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/map" });
  }, [user, loading, navigate]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background">
      <div className="mx-auto flex max-w-md flex-col px-6 pb-16 pt-16">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Pinly</span>
        </div>

        <h1 className="mt-12 text-4xl font-bold leading-tight tracking-tight">
          Daj znać znajomym, że już jesteś na miejscu.
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Zapisz ważne lokalizacje, a Pinly automatycznie powiadomi wybranych
          znajomych, gdy się tam pojawisz — bez pisania wiadomości.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button asChild size="lg">
            <Link to="/auth">Zacznij za darmo</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/auth">Mam już konto</Link>
          </Button>
        </div>

        <div className="mt-14 grid gap-4">
          <Feature
            icon={<MapPin className="h-5 w-5" />}
            title="Zapisz miejsca"
            desc="Dom, biuro, siłownia — ustaw promień powiadomień dla każdej lokalizacji."
          />
          <Feature
            icon={<Bell className="h-5 w-5" />}
            title="Automatyczne pingi"
            desc="Wejdziesz w obszar miejsca, a znajomi dostaną powiadomienie."
          />
          <Feature
            icon={<Users className="h-5 w-5" />}
            title="Tylko znajomi"
            desc="Sam decydujesz, kto widzi Twoje przyjścia. Pełna kontrola."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Prywatność"
            desc="Twoja lokalizacja na żywo nigdy nie jest udostępniana — tylko fakt przyjścia."
          />
        </div>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
