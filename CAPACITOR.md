# Pinly — budowanie aplikacji natywnej (iOS / Android)

Pinly to aplikacja webowa (React) pakowana przez **Capacitor** do natywnych
aplikacji iOS i Android. Poniżej kroki, by uruchomić ją na telefonie i
przygotować do publikacji w App Store / Google Play.

## Wymagania
- **iOS:** komputer Mac z zainstalowanym Xcode.
- **Android:** Android Studio (działa na Windows/Mac/Linux).
- Node.js + git.

## 1. Pobierz projekt na swój komputer
Połącz projekt z GitHubem (przycisk GitHub w Lovable), potem:

```bash
git clone <adres-twojego-repo>
cd <folder-projektu>
npm install   # albo: bun install
```

## 2. Dodaj platformy natywne
```bash
npx cap add ios
npx cap add android
```

## 3. Zbuduj web i zsynchronizuj z natywnym
```bash
npm run build
npx cap sync
```

> Podczas developmentu `capacitor.config.ts` wskazuje na podgląd Lovable
> (`server.url`), więc zmiany w Lovable widać od razu na telefonie po `npx cap sync`.
> Przed wydaniem do sklepu **usuń pole `server.url`**, ponownie `npm run build`
> i `npx cap sync`, aby kod był wbudowany w aplikację.

## 4. Uruchom na urządzeniu / emulatorze
```bash
npx cap open ios       # otwiera Xcode
npx cap open android   # otwiera Android Studio
```
Następnie uruchom z poziomu Xcode / Android Studio.

## 5. Uprawnienia (już wymagane przez Pinly)

### iOS — `ios/App/App/Info.plist`
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Pinly używa lokalizacji, by powiadomić znajomych, gdy dotrzesz na miejsce.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Pinly potrzebuje lokalizacji w tle, aby wykrywać przyjścia do zapisanych miejsc.</string>
```

### Android — `android/app/src/main/AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

## 6. Powiadomienia push (FCM / APNs)
- **Android:** załóż projekt Firebase, dodaj `google-services.json` do `android/app/`.
- **iOS:** w Apple Developer włącz Push Notifications dla App ID i skonfiguruj APNs w Firebase.
- Rejestracja tokenu odbywa się przez `@capacitor/push-notifications` w aplikacji.

Wysyłka push wymaga klucza serwerowego (FCM) — można ją podłączyć do Lovable Cloud
(funkcja serwerowa wysyłająca powiadomienie do znajomych przy zapisie pinga).
Daj znać, gdy chcesz to skonfigurować — przygotuję bezpieczne przechowanie klucza.
