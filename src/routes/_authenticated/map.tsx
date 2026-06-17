import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Plus,
  Crosshair,
  Trash2,
  Loader2,
  Send,
  Navigation,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { distanceMeters, type Place, type Friend } from "@/lib/geo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/map")({
  head: () => ({ meta: [{ title: "Mapa — Pinly" }] }),
  component: MapPage,
});

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function Recenter({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 15);
  }, [center, map]);
  return null;
}

function MapPage() {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const watchId = useRef<number | null>(null);

  const loadPlaces = async () => {
    const { data } = await supabase
      .from("places")
      .select("*")
      .order("created_at", { ascending: false });
    setPlaces((data as Place[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    watchId.current = navigator.geolocation.watchPosition(
      (p) => setPos([p.coords.latitude, p.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 },
    );
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  const center = pos ?? (places[0] ? [places[0].latitude, places[0].longitude] : [52.2297, 21.0122]) as [number, number];

  const nearby = useMemo(() => {
    if (!pos) return [];
    return places.filter(
      (pl) => distanceMeters(pos[0], pos[1], pl.latitude, pl.longitude) <= pl.radius_m,
    );
  }, [pos, places]);

  return (
    <div className="relative">
      <div className="h-[55vh] w-full">
        {typeof window !== "undefined" && (
          <MapContainer
            center={center}
            zoom={14}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Recenter center={pos} />
            {pos && <Marker position={pos} icon={markerIcon} />}
            {places.map((pl) => (
              <Circle
                key={pl.id}
                center={[pl.latitude, pl.longitude]}
                radius={pl.radius_m}
                pathOptions={{ color: "#0f3460", fillColor: "#0f3460", fillOpacity: 0.15 }}
              />
            ))}
          </MapContainer>
        )}
      </div>

      <div className="mx-auto max-w-md space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Twoje miejsca</h1>
          <Sheet open={addOpen} onOpenChange={setAddOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" /> Dodaj
              </Button>
            </SheetTrigger>
            <AddPlaceSheet
              currentPos={pos}
              onAdded={() => {
                setAddOpen(false);
                loadPlaces();
              }}
            />
          </Sheet>
        </div>

        {nearby.length > 0 && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
            <p className="mb-2 text-sm font-medium text-primary">
              <Navigation className="mr-1 inline h-4 w-4" />
              Jesteś w: {nearby.map((n) => n.name).join(", ")}
            </p>
            {nearby.map((pl) => (
              <PingButton key={pl.id} place={pl} userId={user!.id} />
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : places.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            <MapPin className="mx-auto mb-2 h-8 w-8 opacity-50" />
            Brak zapisanych miejsc. Dodaj pierwsze, np. dom albo biuro.
          </div>
        ) : (
          <ul className="space-y-2">
            {places.map((pl) => (
              <PlaceRow
                key={pl.id}
                place={pl}
                pos={pos}
                onDeleted={loadPlaces}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PlaceRow({
  place,
  pos,
  onDeleted,
}: {
  place: Place;
  pos: [number, number] | null;
  onDeleted: () => void;
}) {
  const dist = pos
    ? Math.round(distanceMeters(pos[0], pos[1], place.latitude, place.longitude))
    : null;
  const remove = async () => {
    const { error } = await supabase.from("places").delete().eq("id", place.id);
    if (error) return toast.error("Nie udało się usunąć");
    toast.success("Miejsce usunięte");
    onDeleted();
  };
  return (
    <li className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <MapPin className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{place.name}</p>
        <p className="text-xs text-muted-foreground">
          Promień {place.radius_m} m
          {dist !== null && ` · ${dist >= 1000 ? (dist / 1000).toFixed(1) + " km" : dist + " m"} stąd`}
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={remove}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </li>
  );
}

function AddPlaceSheet({
  currentPos,
  onAdded,
}: {
  currentPos: [number, number] | null;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [radius, setRadius] = useState(150);
  const [coords, setCoords] = useState<[number, number] | null>(currentPos);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (currentPos && !coords) setCoords(currentPos);
  }, [currentPos, coords]);

  const useCurrent = () => {
    if (!("geolocation" in navigator)) return toast.error("Brak dostępu do GPS");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords([p.coords.latitude, p.coords.longitude]);
        toast.success("Pobrano bieżącą lokalizację");
      },
      () => toast.error("Nie udało się pobrać lokalizacji"),
      { enableHighAccuracy: true },
    );
  };

  const save = async () => {
    if (!name.trim()) return toast.error("Podaj nazwę miejsca");
    if (!coords) return toast.error("Ustaw lokalizację");
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("places").insert({
      user_id: u.user!.id,
      name: name.trim(),
      latitude: coords[0],
      longitude: coords[1],
      radius_m: radius,
    });
    setBusy(false);
    if (error) return toast.error("Nie udało się zapisać");
    toast.success("Miejsce dodane");
    onAdded();
  };

  return (
    <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-2xl">
      <SheetHeader>
        <SheetTitle>Nowe miejsce</SheetTitle>
      </SheetHeader>
      <div className="space-y-4 p-4">
        <div className="space-y-1.5">
          <Label htmlFor="pname">Nazwa</Label>
          <Input
            id="pname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dom, Biuro, Siłownia…"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Promień powiadomień: {radius} m</Label>
          <Slider
            min={50}
            max={1000}
            step={50}
            value={[radius]}
            onValueChange={(v) => setRadius(v[0])}
          />
        </div>
        <Button variant="outline" className="w-full" onClick={useCurrent}>
          <Crosshair className="mr-2 h-4 w-4" />
          {coords ? "Lokalizacja ustawiona ✓ (odśwież)" : "Użyj bieżącej lokalizacji"}
        </Button>
        <Button className="w-full" onClick={save} disabled={busy}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Zapisz miejsce
        </Button>
      </div>
    </SheetContent>
  );
}

function PingButton({ place, userId }: { place: Place; userId: string }) {
  const [busy, setBusy] = useState(false);
  const ping = async () => {
    setBusy(true);
    // find accepted friends
    const { data: fr } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .eq("status", "accepted");
    const friendIds = (fr ?? []).map((f) =>
      f.requester_id === userId ? f.addressee_id : f.requester_id,
    );
    if (friendIds.length === 0) {
      setBusy(false);
      return toast.info("Nie masz jeszcze znajomych do powiadomienia");
    }
    const rows = friendIds.map((rid) => ({
      sender_id: userId,
      recipient_id: rid,
      place_name: place.name,
      latitude: place.latitude,
      longitude: place.longitude,
    }));
    const { error } = await supabase.from("pings").insert(rows);
    setBusy(false);
    if (error) return toast.error("Nie udało się wysłać pinga");
    toast.success(`Powiadomiono znajomych (${friendIds.length}) o przyjściu do: ${place.name}`);
  };
  return (
    <Button size="sm" className="mt-1 w-full" onClick={ping} disabled={busy}>
      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      Pinguj znajomych — {place.name}
    </Button>
  );
}
