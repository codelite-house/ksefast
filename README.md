# KSeFast

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/codelitehouse/ksefast)](https://github.com/codelitehouse/ksefast/releases)
[![Docker](https://img.shields.io/badge/docker-compose-blue?logo=docker)](https://docs.docker.com/compose/)

Pobierz faktury z KSeF (Krajowy System e-Faktur) jako paczkę ZIP – w formacie XML lub PDF – bez instalowania żadnego oprogramowania poza Dockerem.

> **Prywatność przede wszystkim.** Token KSeF jest szyfrowany w przeglądarce kluczem publicznym MF, więc serwer go nie pozna. Faktury przechodzą przez serwer proxy tylko w tranzycie (KSeF blokuje CORS), a archiwum ZIP powstaje u Ciebie. Chcesz zero pośredników? Uruchom KSeFast u siebie (`docker compose up`) albo użyj [CLI](#cli--pobieranie-faktur-z-linii-poleceń), które łączy się z KSeF bezpośrednio.

## Co robi

- loguje się do KSeF przy użyciu tokena KSeF (token jest szyfrowany w przeglądarce i nigdzie nie jest zapisywany),
- pobiera listę faktur dla wskazanego miesiąca,
- buduje paczkę ZIP z fakturami w formacie XML albo PDF **w przeglądarce**; serwer proxy tylko przekazuje faktury z KSeF i ich nie zapisuje,
- przestrzega limitów KSeF (pauzy, ponawianie po `429`); po wyczerpaniu limitu godzinowego oddaje paczkę częściową z listą brakujących (`BRAKUJACE.txt`) i pozwala je dociągnąć,
- udostępnia formularz kontaktowy z dwoma typami wiadomości: "Zgłoś problem" i "kontakt z developerami".

## Wymagania

- [Docker](https://docs.docker.com/get-docker/) z wtyczką Compose (Docker Desktop lub `docker compose` w CLI)
- Token KSeF i NIP firmy (konto w KSeF Ministerstwa Finansów)

## Uruchomienie

```bash
docker compose up
```

Aplikacja dostępna pod adresem: **http://localhost:8080**

Przy pierwszym uruchomieniu Docker zbuduje obrazy – może to chwilę potrwać.

```bash
docker compose down   # zatrzymanie
```

## Jak to działa – prywatność

```
Przeglądarka                                 Proxy (server.ts)         KSeF API (MF)
──────────────────────────────────────────   ───────────────────────   ─────────────
1. Pobiera certyfikat publiczny RSA       ←→ przekazuje             ←→ /security/public-key-certificates
2. Szyfruje token KSeF RSA-OAEP lokalnie
3. Wysyła zaszyfrowany token              →  widzi tylko szyfrogram  → /auth/ksef-token
4. Dostaje access token sesji             ←  bez refresh tokena     ← /auth/token/redeem
5. Odbiera metadane i XML faktur          ←  jawnie (w TLS)         ← /invoices/...
6. Generuje PDF i ZIP w pamięci, zapisuje plik na dysk
```

- **Token KSeF szyfrowany lokalnie** – RSA-OAEP w przeglądarce, kluczem publicznym MF. Proxy dostaje tylko szyfrogram i nie może go odszyfrować.
- **Przez proxy przechodzą jawnie (w tranzycie, szyfrowane TLS)**: tymczasowy `authenticationToken`, `accessToken` sesji (w nagłówku `Authorization`), identyfikator kontekstu (np. NIP) oraz metadane i XML faktur. Proxy istnieje wyłącznie dlatego, że KSeF API blokuje CORS. `refreshToken` z `/auth/token/redeem` nie jest przekazywany do przeglądarki.
- **Proxy bezstanowy** – bez bazy, sesji i zapisu plików; nie zapisuje tokenów ani treści faktur w logach (loguje tylko błędy formularza kontaktowego i uwierzytelnienia M2M). Numer KSeF faktury idzie w treści żądania (`POST /api/invoices/download`), więc nie trafia do logów dostępowych nginx/ingress.
- **Wersja hostowana (ksefast.pl)** – operator: IT Solutions Grzegorz Krzesiński (Codelite House), kontakt: contact@codelitehouse.com. Zasady przetwarzania: [ksefast.pl/polityka-prywatnosci](https://ksefast.pl/polityka-prywatnosci).
- **Zero pośredników** – uruchom proxy u siebie (`docker compose up`) albo użyj CLI, które łączy się z KSeF bezpośrednio.
- **PDF generowany lokalnie** – przez oficjalną bibliotekę [`CIRFMF/ksef-pdf-generator`](https://github.com/CIRFMF/ksef-pdf-generator) MF.
- **ZIP tworzony lokalnie** – w pamięci przeglądarki, pobierany bezpośrednio na komputer.

## Ograniczenia

- KSeF pozwala pobrać **16 faktur na minutę i 64 na godzinę**. Aplikacja webowa robi pauzy (~4,5 s między fakturami) i ponawia po `429`; gdy limit godzinowy się wyczerpie, oddaje paczkę częściową z plikiem `BRAKUJACE.txt` i przyciskiem "Dociągnij brakujące".
- Jedno pobranie obejmuje maksymalnie **2000 faktur** (wybierz krótszy okres, jeśli jest ich więcej).
- Wymagany jest token KSeF oraz identyfikator kontekstu logowania (NIP firmy lub inny typ kontekstu).

## Stack

- **Frontend**: React + Vite + TypeScript + Material UI
- **Serwer proxy**: Node.js Express (uruchamiany przez Docker Compose)
- **PDF**: [`CIRFMF/ksef-pdf-generator`](https://github.com/CIRFMF/ksef-pdf-generator) – oficjalny generator MF, zależność przypięta do commita (patrz niżej)
- **Crypto**: jsrsasign (RSA-OAEP szyfrowanie tokena w przeglądarce)

## Lokalny development (bez Dockera)

```bash
pnpm install
pnpm dev
```

Frontend: http://localhost:5173 · Proxy: http://localhost:3001

### Integracja z Contact Service

Frontend wysyła formularz wyłącznie przez backend (`server/server.ts`), który przekazuje żądanie do Contact Service.

Wymagane zmienne środowiskowe backendu:

- `CONTACT_SERVICE_URL` (domyślnie `http://contact-service.devowiec.pl/api/v1/messages`)
- `CONTACT_SERVICE_BEARER_TOKEN` (preferowane, JWT serwisowe)
- `CONTACT_SERVICE_API_KEY` (fallback, gdy JWT nie jest dostępne)

Backend wymaga co najmniej jednej formy autoryzacji (`CONTACT_SERVICE_BEARER_TOKEN` lub `CONTACT_SERVICE_API_KEY`).

## CLI – pobieranie faktur z linii poleceń

Do automatyzacji (np. comiesięczne pobranie faktur kosztowych do folderu księgowego) jest lokalne CLI.
Loguje się do KSeF wprost (CORS dotyczy tylko przeglądarki, więc proxy nie jest potrzebne),
a przez ten sam kod co aplikacja webowa szyfruje token, stronicuje metadane i generuje PDF oficjalnym generatorem MF.

```bash
pnpm install
export KSEF_TOKEN=...   # w PowerShell: $env:KSEF_TOKEN = "..."
pnpm cli download --nip 1234567890 --month 2026-10 --out ./faktury/2026-10
```

- Token KSeF jest czytany **wyłącznie** ze zmiennej `KSEF_TOKEN` (nie z argumentów, żeby nie trafiał do historii poleceń).
- `--month` oznacza miesiąc przyjęcia faktury w KSeF (data z numeru KSeF); domyślnie pobierane są faktury zakupowe (`--subject Subject2`).
- Do `--out` trafiają PDF-y, a oryginalne XML-e do `--out/XML` (`--format`, `--xml-dir`).
- Faktury, których numer KSeF występuje już w nazwie pliku w folderze docelowym, są pomijane – można uruchamiać wielokrotnie.
- KSeF limituje pobieranie faktur (16/min, 64/h): CLI robi pauzy między pobraniami i ponawia po `429`.
  Gdy limit godzinowy zostanie wyczerpany, kończy z kodem `2` – kolejne uruchomienie dociąga brakujące.
- `--dry-run` pokazuje, co zostałoby pobrane. Pełna lista opcji: `pnpm cli --help`. Testy: `pnpm test:cli`.

## Struktura projektu

```
ksefast/
├── frontend/src/
│   ├── services/         ← komunikacja z KSeF przez proxy
│   ├── hooks/            ← logika pobierania (TanStack Query)
│   ├── lib/              ← crypto, QR, logowanie tokenem, utils (współdzielone z CLI)
│   └── components/       ← UI (HeroCopy, DownloadForm, sekcje strony, ui/ – wspólne klocki)
├── cli/src/              ← CLI: klient KSeF wprost, pobieranie do folderu (Node, uruchamiane przez tsx)
├── server/server.ts      ← proxy Express (bezstanowy, bez zapisu danych)
├── docs/openapi/         ← specyfikacje OpenAPI KSeF v2 (źródło prawdy)
└── docker-compose.yml
```

## Contributing

Masz pomysł lub znalazłeś błąd? Sprawdź [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Jeśli odkryłeś lukę bezpieczeństwa, zapoznaj się z [SECURITY.md](SECURITY.md) — prosimy nie otwierać publicznych issues dla podatności.

## Licencja

[MIT](LICENSE) © 2026 Codelite House

Generator PDF: [`CIRFMF/ksef-pdf-generator`](https://github.com/CIRFMF/ksef-pdf-generator) (pakiet `@akmf/ksef-fe-invoice-converter`) © CIRF.
MF nie publikuje go w npm ani jako zbudowanej paczki, więc `frontend/package.json` wskazuje na archiwum źródeł konkretnego commita
(wersja 1.1.46 – ta sama, której używa portal MF); sumy kontrolne są w `pnpm-lock.yaml` i `package-lock.json`.
Aktualizacja: podmień hash commita w `frontend/package.json` i uruchom `pnpm install` oraz `npm install --package-lock-only`.
Vite i CLI mapują alias `@akmf/ksef-fe-invoice-converter` na `src/index.ts` tej paczki w `node_modules`.
