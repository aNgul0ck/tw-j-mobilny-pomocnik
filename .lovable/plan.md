## Cel

Przenieść filozofię i minimalizm BeReal do aplikacji Runda, **nie zmieniając obecnych założeń** (mapa lokalizacji jako tło, wysuwany bottom sheet, 4 zakładki: Osoby / Aktywności / Znajomi / Ja, udostępnianie położenia przez numer telefonu i kontakty).

## Czym kieruje się BeReal (analiza zrzutów)

1. **Surowa monochromia** — czerń, biel, szarości. Brak gradientów i kolorowych akcentów. Kolor pojawia się wyłącznie w treści użytkownika (zdjęcia/awatary).
2. **Mocna typografia jako element marki** — gruby, ciasny wordmark zakończony kropką („BeReal."). Duże, bold nagłówki, mało tekstu pomocniczego.
3. **Maksymalna redukcja chrome** — cienkie, proste ikony liniowe (nie ozdobne glify), minimum obramowań, dużo oddechu (whitespace).
4. **Treść jest bohaterem** — interfejs schodzi na drugi plan, brak „wodotrysków", brak liczb próżności.
5. **Autentyczność i prostota** — płaskie powierzchnie, ostre lub lekko zaokrąglone krawędzie, brak mocnego glassmorphism z saturacją.

## Co zmieniamy (tylko warstwa wizualna / prezentacja)

### 1. Paleta — `src/runda/theme.ts`
- Tło: czysta czerń `#000000` (zamiast `#0E1512`).
- Powierzchnie: ciemne grafity `rgba(20,20,20,…)` zamiast zielonkawego glassu z saturacją 180%.
- Tekst: biel + szarości (zostają, lekko zwiększony kontrast).
- **Akcent neutralny:** zamiast zieleni `#30D158` → biel/jasna szarość dla aktywnych stanów. Zieleń statusu „online" zostaje jako mała kropka (jedyny dopuszczony mikro-kolor, jak awatary w BeReal). Kolory typów aktywności i pinów wyciszamy do szarości (kolor zostaje tylko jako drobny wskaźnik).
- Zmniejszenie `blur/saturate` w `GLASS` → bardziej płaskie, matowe powierzchnie.

### 2. Typografia — `src/runda/RundaApp.tsx`
- Wordmark „Runda." z kropką w stylu BeReal jako tytuł sheetu (mocniejszy, ciaśniejszy `letterSpacing`).
- Nagłówki bardziej bold; uproszczenie tekstów pomocniczych.

### 3. Ikony i przyciski
- Zamiana ozdobnych glifów w `TABS` (`◈ ◉ ◎ ◇`) i nagłówku map na **proste ikony liniowe** (cienkie SVG: pin/mapa, lista, ludzie, profil) — spójne, minimalistyczne.
- Przyciski (`SmallButton`, główny CTA): płaskie, czarno-białe. CTA „Zaplanuj spotkanie" → biały przycisk z czarnym tekstem (odpowiednik czarno-białych przycisków BeReal) zamiast zielonego.
- `Toggle`: stan włączony na biały zamiast zielonego.

### 4. Powierzchnie i krawędzie
- Karty/sheet: bardziej płaskie, subtelniejsze obramowania, łagodniejsze cienie. Zachowujemy zaokrąglenia sheetu i tab bara (układ bez zmian).
- Tło mapy: wyciszenie zieleni do ciemnej, neutralnej szarości z delikatnymi drogami — żeby treść (piny, osoby) była bohaterem.

### Co zostaje bez zmian
- Cała logika i interakcje: wysuwany sheet (drag), nawigacja, fokus pinów, dołączanie do aktywności, udostępnianie z kontaktów, kopiowanie numeru.
- Struktura zakładek i layout elementów (użytkownikowi podoba się rozmieszczenie).

## Szczegóły techniczne
- Zmiany wyłącznie w `src/runda/theme.ts` (tokeny kolorów) i `src/runda/RundaApp.tsx` (typografia, ikony SVG, warianty przycisków/toggle, tło mapy).
- Bez zmian w danych (`mock.ts`), routingu i logice stanu.
- Weryfikacja w podglądzie mobilnym (402×717) po wdrożeniu.

## Pytanie otwarte
Zieleń jako kolor „online"/akcent — usuwamy całkowicie na rzecz czerni/bieli (czyściej, bliżej BeReal), czy zostawiamy zieloną kropkę statusu jako jedyny mikro-akcent? Domyślnie planuję to drugie (maksymalna monochromia z jednym subtelnym sygnałem).
