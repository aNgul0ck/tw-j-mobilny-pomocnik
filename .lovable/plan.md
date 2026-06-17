# Plan: Aplikacja "Lokalizator" (iOS / Android)

Aplikacja mobilna, która powiadamia (pinguje) wybranych znajomych, gdy pojawisz się w określonej lokalizacji.

## Jak powstanie aplikacja natywna

Budujemy aplikację jako web (React) w Lovable, a następnie pakujemy ją przez **Capacitor** do natywnych projektów iOS i Android. Capacitor daje dostęp do GPS w tle i powiadomień push. Na końcu, żeby zbudować plik instalacyjny i opublikować w App Store / Google Play, potrzebny będzie Mac z Xcode (iOS) i/lub Android Studio (Android) — sam kod tworzymy tutaj.

## Etapy

### Etap 1 — Backend i konta (Lovable Cloud)
- Włączenie Lovable Cloud (baza, logowanie, funkcje serwerowe).
- Logowanie e-mail/hasło + Google.
- Tabele: `profiles`, `friendships` (zaproszenia/znajomi), `places` (zapisane lokalizacje), `pings` (historia powiadomień).
- Zabezpieczenia RLS: każdy widzi tylko swoje dane i dane znajomych.

### Etap 2 — Rdzeń aplikacji webowej (mobile-first UI)
- Ekran logowania / rejestracji.
- Lista znajomych + zapraszanie po e-mailu/loginie.
- Mapa z bieżącą pozycją i zapisanymi miejscami.
- Tworzenie "miejsc" (np. dom, biuro) z promieniem geofence.
- Ekran ustawień: kto ma dostawać ping i kiedy.

### Etap 3 — Lokalizacja i wykrywanie wejścia
- Pobieranie pozycji GPS (Capacitor Geolocation).
- Wykrywanie wejścia w obszar miejsca (geofence) — wysyłka pinga do wybranych znajomych.
- Zapis historii pingów.

### Etap 4 — Powiadomienia push
- Konfiguracja push (Capacitor Push Notifications / Firebase Cloud Messaging dla Androida, APNs dla iOS).
- Funkcja serwerowa wysyłająca push do znajomych po wykryciu wejścia.

### Etap 5 — Capacitor / pakowanie natywne
- Dodanie Capacitora i konfiguracja iOS/Android.
- Instrukcja: jak na swoim komputerze zbudować i przetestować apkę oraz wysłać do sklepów.

## Szczegóły techniczne
- **Frontend:** React + TanStack Start, Tailwind, mobile-first.
- **Mapa:** Mapbox lub Leaflet (do ustalenia — Mapbox wymaga klucza API).
- **Push w tle / geofencing w tle:** na iOS/Android działa w pełni dopiero w wersji natywnej (Capacitor), nie w podglądzie webowym.
- **GPS w tle** wymaga osobnych uprawnień systemowych — uwzględnimy konfigurację.

## Co potrzebuję od Ciebie po akceptacji
1. Czy przenosimy konkretny kod z GitHuba (wklejasz pliki) czy budujemy od zera wg tego planu?
2. Mapa: Mapbox (ładniejsza, wymaga darmowego klucza API) czy Leaflet/OpenStreetMap (bez klucza)?

Po akceptacji zaczynam od Etapu 1 (Lovable Cloud + logowanie).
