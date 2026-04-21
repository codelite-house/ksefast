# KSeFast

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/codelitehouse/ksefast)](https://github.com/codelitehouse/ksefast/releases)
[![Docker](https://img.shields.io/badge/docker-compose-blue?logo=docker)](https://docs.docker.com/compose/)

Pobierz faktury z KSeF (Krajowy System e-Faktur) jako paczkę ZIP – w formacie XML lub PDF – bez instalowania żadnego oprogramowania poza Dockerem.

> **Prywatność przede wszystkim.** Token KSeF jest szyfrowany lokalnie w przeglądarce. Faktura nigdy nie dotyka zewnętrznego serwera – archiwum ZIP powstaje bezpośrednio u Ciebie.

## Co robi

- loguje się do KSeF przy użyciu tokena KSeF (token jest szyfrowany lokalnie w przeglądarce, nigdy nie jest zapisywany),
- pobiera listę faktur dla wskazanego miesiąca,
- buduje paczkę ZIP z fakturami w formacie XML albo PDF **lokalnie w przeglądarce** – nic nie trafia na zewnętrzne serwery,
- wszystkie dane są przetwarzane i niszczone natychmiast po pobraniu.
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
Przeglądarka                             KSeF API (MF)
──────────────────────────────────────   ────────────
1. Pobiera certyfikat publiczny RSA   ←→  /security/public-key-certificates
2. Szyfruje token RSA-OAEP lokalnie
3. Wysyła zaszyfrowany token          →   (przez lokalny proxy)
4. Odbiera metadane i XML faktur      ←   (przez lokalny proxy)
5. Generuje PDF i ZIP w pamięci
6. Pobiera plik – dane są niszczone
```

- **Token szyfrowany lokalnie** – RSA-OAEP w przeglądarce. Serwer proxy widzi tylko zaszyfrowany blob.
- **Serwer proxy bezstanowy** – nie loguje, nie zapisuje, nie przechowuje żadnych danych. Istnieje wyłącznie dlatego, że KSeF API blokuje CORS.
- **PDF generowany lokalnie** – przez oficjalną bibliotekę [`CIRFMF/ksef-pdf-generator`](https://github.com/CIRFMF/ksef-pdf-generator) MF.
- **ZIP tworzony lokalnie** – w pamięci przeglądarki, pobierany bezpośrednio na komputer.

## Ograniczenia

- Jedna paczka obsługuje maksymalnie **50 faktur**.
- Wymagany jest token KSeF oraz identyfikator kontekstu logowania (NIP firmy lub inny typ kontekstu).

## Stack

- **Frontend**: React + Vite + TypeScript + Material UI
- **Serwer proxy**: Node.js Express (uruchamiany przez Docker Compose)
- **PDF**: [`CIRFMF/ksef-pdf-generator`](https://github.com/CIRFMF/ksef-pdf-generator) – vendored lokalnie
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

## Struktura projektu

```
ksefast/
├── frontend/src/
│   ├── services/         ← komunikacja z KSeF przez proxy
│   ├── hooks/            ← logika pobierania (TanStack Query)
│   ├── lib/              ← crypto, QR, utils
│   └── components/       ← UI (App, DownloadForm, QAPanel, ...)
├── server/server.ts      ← proxy Express (bezstanowy, bez logowania)
├── docs/openapi/         ← specyfikacje OpenAPI KSeF v2 (źródło prawdy)
└── docker-compose.yml
```

## Contributing

Masz pomysł lub znalazłeś błąd? Sprawdź [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Jeśli odkryłeś lukę bezpieczeństwa, zapoznaj się z [SECURITY.md](SECURITY.md) — prosimy nie otwierać publicznych issues dla podatności.

## Licencja

[MIT](LICENSE) © 2026 Codelite House

Vendored dependency: [`CIRFMF/ksef-pdf-generator`](https://github.com/CIRFMF/ksef-pdf-generator) (pakiet `@akmf/ksef-fe-invoice-converter`) – [MIT](frontend/vendor/ksef-pdf-generator/LICENSE) © 2025 CIRF
