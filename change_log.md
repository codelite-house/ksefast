# Change log

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
