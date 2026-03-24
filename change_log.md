# 2026-03-24

### QR KSeF 2.0 – oficjalny format linku

- buildKsefQrUrl generuje link QR zgodny z oficjalnym formatem KSeF 2.0: https://qr.ksef.mf.gov.pl/invoice/{NIP}/{DD-MM-YYYY}/{hash}.
- W archiveService.ts przekazywany jest NIP sprzedawcy oraz data wystawienia z metadanych faktury.
- Usunięto stare formaty linków QR, niezgodne z aktualną specyfikacją.
- QR w PDF jest teraz w pełni akceptowany przez KSeF.
# Change log

## 2026-03-24

### Migracja @akmf/ksef-fe-invoice-converter na git submodule

- dodano git submodule `frontend/vendor/ksef-pdf-generator` (https://github.com/CIRFMF/ksef-pdf-generator, licencja MIT)
- zmieniono `frontend/package.json`: zależność z `github:CIRFMF/ksef-pdf-generator` na `file:./vendor/ksef-pdf-generator`
- naprawiono `frontend/vendor/ksef-pdf-generator/package.json`: pola `main`/`module`/`types`/`exports` wskazywały na pliki w root, podczas gdy `vite build` generuje je do `dist/` — poprawiono na `./dist/...`
- naprawiono `frontend/src/archiveService.ts`: import z nieistniejącego `@mdab25/ksef-pdf` → `@akmf/ksef-fe-invoice-converter`; nieistniejąca funkcja `renderPdfFromXml` → `generateInvoice(File, { nrKSeF }, 'blob')` z prawidłową sygnaturą
- zaktualizowano `frontend/Dockerfile`: usunięto `apk add git`; dodano etap budowania vendora (`npm ci --include=dev && npm run build`) przed budowaniem głównej aplikacji

### Naprawa Docker build frontendu: brak `git` w alpine

- dodano `RUN apk add --no-cache git` w `frontend/Dockerfile` przed `npm install`
- zależność `@akmf/ksef-fe-invoice-converter` jest instalowana z GitHuba (`github:CIRFMF/ksef-pdf-generator`), co wymaga obecności `git` w obrazie budującym

## 2026-03-22

### Usprawnienie diagnostyki błędów tokena KSeF

- zaktualizowano `frontend/src/hooks/useDownloadInvoices.ts`: token wejściowy jest normalizowany przez `trim()` przed szyfrowaniem, aby uniknąć błędów przez przypadkowe białe znaki przy wklejaniu
- dodano czytelniejszy komunikat dla błędu autoryzacji z KSeF, gdy status zwraca informację, że token „nie został znaleziony” (hint: sprawdź zgodność środowiska demo/prod i aktywność tokena)

### Naprawa backendu Docker: zastąpienie vercel dev serwerem Express

- usunięto `vercel dev` z `Dockerfile.backend` — wymagało interaktywnego logowania do Vercel CLI, kontener padał przy starcie z błędem 502
- dodano `server/server.ts` — standalone Express proxy serwujący identyczne endpointy co `api/` (Vercel Edge Functions), bez żadnych zewnętrznych zależności cloud
- dodano `server/package.json` — zależności: `express`, `tsx`, `typescript`
- zaktualizowano `Dockerfile.backend` — buduje z `server/`, uruchamia przez `tsx server.ts`

### Audyt architektoniczny + refactoring: TanStack Query, serwisy, hooki

**Nowa struktura `frontend/src/`:**

```
services/
  apiClient.ts       ← bazowy fetch wrapper z KsefApiError
  securityService.ts ← getPublicCertificates()
  authService.ts     ← getChallenge(), initTokenAuth(), getAuthStatus(), redeemToken()
  invoicesService.ts ← queryInvoiceMetadata(), downloadInvoiceXml()
lib/
  crypto.ts          ← encryptTokenWithChallenge() (RSA-OAEP)
hooks/
  useCertificates.ts    ← useQuery (cache 5 min)
  useDownloadInvoices.ts ← useMutation (pełna sekwencja pobierania)
```

**Usunięto:**

- `ksefClient.ts` — zastąpiony przez serwisy + hooki + `lib/crypto.ts`
- `api.ts` — zastąpiony przez `useDownloadInvoices`

**Zaktualizowano:**

- `types.ts` — dodano `InitTokenAuthRequest`, `InvoiceQueryFilters`; każdy interfejs opisuje odpowiadający schemat z OpenAPI spec KSeF v2
- `main.tsx` — dodano `QueryClientProvider` z `@tanstack/react-query`
- `App.tsx` — refactor z `async handleSubmit` + ręczny state na `useMutation` hook (`isPending`, `isSuccess`, `isError`)
- `frontend/package.json` — dodano `@tanstack/react-query ^5.94.5`

**Błędy naprawione:**

- `downloadInvoiceXml` i `waitForSuccessfulAuth` miały hardcoded `environment=demo` — teraz parametryczne
- Dodano `clientIp` usunięte z `KsefChallengeResponse` (nie było w OpenAPI spec)

### Naprawa base URLs, dokumentacja OpenAPI, instrukcje Copilota

- naprawiono krytyczny bug w `api/_helpers.ts`: stare URLe KSeF v3 (`demo.ksef.mf.gov.pl/api/v3`, `ksef.mf.gov.pl/api/v3`) zastąpione poprawnymi v2 (`api-test.ksef.mf.gov.pl/v2`, `api.ksef.mf.gov.pl/v2`)
- dodano `docs/openapi/README.md` – dokumentacja endpointów KSeF v2, schemat autoryzacji, uwagi implementacyjne
- dodano `docs/openapi/` jako miejsce na specyfikacje OpenAPI KSeF (pliki `ksef-api-prod.json`, `ksef-api-test.json` dostarczane ręcznie)
- potwierdzono że KSeF API blokuje CORS – proxy w `api/` jest konieczne
- dodano `.github/copilot-instructions.md` – instrukcje dla GitHub Copilot: poprawne URLe v2, pułapki nazewnicze, schemat autoryzacji, reguła DTO ze specyfikacji, reguła changelog
- dodano `Dockerfile.backend` i poprawiono `docker-compose.yml` (usunięto nieistniejący `./backend` context)

---

## 2026-03-21

### Privacy-First Architecture Redesign

**Zmiana z tradycyjnego backendu Express na Edge Functions (Vercel) + Client-Side Processing**

#### Frontend

- dodano `ksefClient.ts` - pełna logika komunikacji z KSeF w przeglądarce
- dodano `archiveService.ts` - budowanie ZIP i PDF lokalnie w przeglądarce
- dodano `types.ts` - typy TypeScriptu dla KSeF API
- szyfrowanie RSA-OAEP tokena w przeglądarce (biblioteka jsrsasign)
- autogenerowanie etykiet miesięcy zamiast date picker'ów
- privacy banner na górze aplikacji
- session indicator (pokazuje się gdy token jest wpisany)
- przycisk "Wyczyść wszystko" (czyści token, cache, sessionStorage, localStorage)
- zaktualizowano wiadomości o bezpieczeństwie i prywatności
- zaktualizowano sekcję "O nas" z opisem Edge Computing
- zainstalowano zależności: `jszip`, `jsrsasign`, `@mdab25/ksef-pdf`

#### Edge Functions (nowy folder `api/`)

- dodano `_helpers.ts` - wspólne funkcje (CORS, error handling)
- `api/security/certificates.ts` - pass-through do KSeF certyfikatów publicznych
- `api/auth/challenge.ts` - pass-through do challenge KSeF
- `api/auth/token.ts` - pass-through do inicjalizacji autoryzacji
- `api/auth/status.ts` - pass-through do sprawdzania statusu autoryzacji
- `api/auth/redeem.ts` - pass-through do redempcji accessToken
- `api/invoices/metadata.ts` - pass-through do zapytań o metadane faktur
- `api/invoices/download.ts` - pass-through do pobierania XML faktur
- wszystkie funkcje mają CORS headers na `*` (brak storage = brak ryzyka)
- wszystkie funkcje są bezstanowe (no database, no files, no storage)

#### Konfiguracja Vercel

- dodano `vercel.json` - konfiguracja buildowania i deployowania
- dodano `tsconfig.edge.json` - konfiguracja TypeScriptu dla Edge Functions
- dodano `.env.local` z `VITE_API_BASE_URL=/api`
- zaktualizowano `package.json` - dodano skrypt `deploy`

#### Dokumentacja

- zaktualizowano `README.md` z nową architekturą
- dodano `EDGE_FUNCTIONS.md` - dokumentacja Edge Functions
- dodano `DEPLOY_VERCEL.md` - instrukcja deployowania na Vercel
- zaktualizowano `.gitignore` - dodano `.vercel` folder

#### Backend (Express)

**Zachowany dla backward-compatibility i lokalnego developmentu, ale nie jest używany w produkcji na Vercel.**

---

## 2026-03-19

### Initial MVP scaffold

- utworzono strukturę workspace z pakietami `frontend` i `backend`,
- dodano konfigurację root `package.json`, `.gitignore`, `.editorconfig` i pliki środowiskowe przykładowe,
- skonfigurowano frontend w React + Vite + TypeScript,
- skonfigurowano backend w Express + TypeScript.

### Backend

- dodano endpoint `GET /api/health`,
- dodano endpoint `POST /api/download`,
- wdrożono walidację wejścia dla tokena, kontekstu, zakresu dat i formatu,
- wdrożono logowanie do KSeF przez challenge + token KSeF,
- wdrożono pobieranie metadanych faktur i pobieranie XML po numerze KSeF,
- dodano budowanie archiwum ZIP dla XML i PDF,
- dodano generowanie PDF przez `@mdab25/ksef-pdf`,
- dodano lokalny zapis opcjonalnych e-maili do `backend/data/leads.jsonl`.

### Frontend

- dodano prosty landing page i formularz pobierania,
- dodano wybór środowiska, typu kontekstu, typu daty i formatu eksportu,
- dodano obsługę pobierania ZIP z backendu,
- dodano komunikaty sukcesu i błędów,
- dodano sekcje „Kim jesteśmy” i „Kup nam kawę”.

### Dokumentacja i weryfikacja

- dodano `README.md` z instrukcją uruchomienia i konfiguracji,
- zainstalowano zależności projektu,
- potwierdzono poprawny build aplikacji,
- potwierdzono działanie endpointu health backendu.

### Docker

- dodano `docker-compose.yml`,
- dodano `backend/Dockerfile` do budowy i uruchamiania API,
- dodano `frontend/Dockerfile` oraz `frontend/nginx.conf` do serwowania frontendu i proxy `/api`,
- dodano `.dockerignore`,
- zaktualizowano frontend tak, żeby działał bez jawnego `VITE_API_BASE_URL` w Docker Compose.

### Repo hygiene

- rozszerzono `.gitignore` o wygenerowane artefakty TypeScript,
- usunięto wygenerowane pliki pomocnicze z frontendu przed pierwszym commitem.

---

## Zasada aktualizacji

Dopisuj w tym pliku każdą istotną zmianę:

- datę,
- zakres zmian,
- backend / frontend / dokumentacja,
- krótką informację co zostało dodane, poprawione albo usunięte.
