# KSeFast

[![GitHub](https://img.shields.io/badge/GitHub-codelitehouse%2Fksefast-blue?logo=github)](https://github.com/codelitehouse/ksefast)

Prosty MVP do pobierania paczek faktur z KSeF **bez przechowywania danych**.

## Co robi

- loguje się do KSeF przy użyciu tokena KSeF (token nigdy nie jest zapisywany),
- pobiera listę faktur dla wskazanego zakresu dat,
- buduje paczkę ZIP z fakturami w formacie XML albo PDF **lokalnie w przeglądarce użytkownika**,
- opcjonalnie zapisuje e-mail do prostego pliku mailingowego,
- wszystkie dane są przetwarzane i niszczone natychmiast po pobraniu.

## Stack

- **Frontend**: React + Vite + TypeScript (przetwarzanie szyfrowania RSA i budowanie PDF)
- **Edge Functions**: Vercel Edge (pass-through proxy do KSeF, bez przechowywania danych)
- **PDF**: [`CIRFMF/ksef-pdf-generator`](https://github.com/CIRFMF/ksef-pdf-generator) – generowanie wizualizacji PDF faktur lokalnie w przeglądarce (vendored lokalnie z oficjalnego repozytorium MF)
- **Crypto**: jsrsasign (RSA-OAEP szyfrowanie tokena w przeglądarce)

## Architektura Privacy-First

1. **Wszystko co się da, dzieje się w przeglądarce użytkownika** - szyfrowanie RSA, budowanie PDF, obsługa ZIP
2. **Edge Functions to inny wymiar bezpieczeństwa** - kod jest bezstanowy, nie posiada bazy danych, nie może zapisać danych
3. **Co przechodzi przez Edge Functions**:
   - Challenge do szyfrowania (pobieranie certyfikatu publicznego KSeF)
   - Inicjalizacja autoryzacji na KSeF
   - Zapytania o metadane faktur
   - Pobieranie XML faktur

**Nie przechodzi przez Edge Functions (robi się lokalnie)**:

- Szyfrowanie tokena RSA-OAEP
- Budowanie plików PDF
- Tworzenie archiwów ZIP
- Parsowanie XML

## Ważne założenia MVP

- KSeF wymaga tokena **i** identyfikatora kontekstu logowania, np. NIP-u.
- Zakres dat powinien być wąski. Limit aplikacji to 50 faktur na paczkę.
- Każdy miesiąc jest automatycznie generowany w dropdownie.

## Uruchomienie lokalnie (dev mode)

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Uruchom development:

   ```bash
   npm run dev
   ```

3. Otwórz frontend:
   - Frontend: `http://localhost:5173`
   - Backend/Edge proxy: `http://localhost:3001`

## Build i Deploy na Vercel

1. Build

   ```bash
   npm run build
   ```

2. Deploy
   ```bash
   vercel
   ```

Vercel automatycznie:

- Buduje frontend do `frontend/dist`
- Domontuje Edge Functions z folderu `api/`
- Ustawia CORS headers na wszystkie odpowiedzi

## Konfiguracja

### Frontend

- `VITE_API_BASE_URL` - opcjonalnie, domyślnie `/api` (Vercel) lub `http://localhost:3001` (dev)

### Backend (lokalnie)

- `PORT=3001`

## Endpointy Edge Functions

- `POST /api/security/certificates?environment=demo|prod` - pobierz certyfikaty publiczne KSeF
- `POST /api/auth/challenge?environment=demo|prod` - pobierz challenge do szyfrowania
- `POST /api/auth/token?environment=demo|prod` - zainicjuj autoryzację
- `GET /api/auth/status?environment=demo|prod&referenceNumber=...` - sprawdzaj status autoryzacji
- `POST /api/auth/redeem?environment=demo|prod` - wymień authToken na accessToken
- `POST /api/invoices/metadata?environment=demo|prod&pageOffset=0&pageSize=50` - zapytaj o metadane faktur
- `GET /api/invoices/download?environment=demo|prod&ksefNumber=...` - pobierz XML faktury
