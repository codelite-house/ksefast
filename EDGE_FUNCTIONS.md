# Edge Functions - Dokumentacja Architektur

## Wstęp

Aplikacja KSeFast wykorzystuje **Vercel Edge Functions** do implementacji pass-through proxy do API KSeF. Funkcje Edge są **bezstanowe** i **nie przechowują danych**.

## Czym różnią się od tradycyjnego backendu?

| Cecha | Backend tradycyjny | Edge Functions |
|-------|-------------------|-----------------|
| **Przechowywanie danych** | Baza danych, pliki | Brak - bezstanowe |
| **Czas życia procesu** | Ciągły | Per-request |
| **Lokalizacja** | 1 data center | Rozłożone globalne |
| **Latencja** | 200-500ms (z drugiego kraju) | 50-100ms (nearest edge) |
| **Scaling** | Ręczny | Automatyczny |
| **Segment użytkowników** | Wszyscy trafiają w jedno miejsce | Każdy trafia na nearest edge |

## Struktura folderów Edge Functions

```
api/
├── _helpers.ts               # Fonkcje wspólne (CORS, error handling)
├── security/
│   └── certificates.ts       # Pobierz certyfikaty KSeF
├── auth/
│   ├── challenge.ts          # Pobierz challenge
│   ├── token.ts              # Zainicjuj autoryzację
│   ├── status.ts             # Sprawdź status
│   └── redeem.ts             # Wymień na accessToken
└── invoices/
    ├── metadata.ts           # Metadane faktur
    └── download.ts           # Pobierz XML faktury
```

## Jak działa routing?

Vercel automatycznie mapuje strukturę folderów `/api` na route'y:

- `api/security/certificates.ts` → `POST /api/security/certificates`
- `api/auth/challenge.ts` → `POST /api/auth/challenge`
- `api/invoices/metadata.ts` → `POST /api/invoices/metadata`
- etc.

## Przepływ danych - Architektura

### Tradycyjnie (niebezpieczna):

```
User Browser
    ↓ token
Backend Server (przechowuje token)
    ↓ token
  KSeF API
```

### KSeFast (bezpieczna):

```
User Browser (szyfruje token + buduje PDF)
    ↓ encrypted token + żądanie
  Edge Function (pass-through, bez storage)
    ↓ żądanie
  KSeF API
    ↓ dane
  Edge Function
    ↓ dane
User Browser (deszyfruje + wyświetla)
```

## Klucze bezpieczeństwa

1. **Token nigdy nie opuszcza przeglądarki w clear-text** - wysyłany zaszyfrowany RSA-OAEP
2. **Edge Functions nie przechowują danych** - każde zapytanie jest izolowane
3. **Brak bazy danych** - fizycznie niemożliwe zapisanie tokena
4. **CORS headers** - ustalone na `*` bo nie przechowujemy danych użytkownika

## Environment variables

Na Vercel ustaw:
- `VERCEL_ENV=production` (automatycznie)

Frontend automatycznie kieruje na `https://yourdomain.vercel.app/api`

## Limitacje

- Edge Functions mają timeout **10 sekund** - wystarczający dla szybkiej komunikacji z KSeF
- Brak dostępu do pliku systemowego (logs trafiają do Vercel logs)
- Maksymalny rozmiar response **4.5MB** (Edge Functions standard limit)

## Deploy

```bash
npm run deploy
```

lub

```bash
vercel
```

Vercel CI/CD automatycznie:
1. Builduje frontend (`npm run build --workspace frontend`)
2. Buduje Edge Functions
3. Deployuje wszystko na Edge Network
4. Ustala CORS headers
5. Konfiguruje domain

## Testing lokalnie

Edge Functions działają normalnie w dev mode:

```bash
npm run dev
```

Frontend na `localhost:5173` robi requesty do `http://localhost:3001/api` (backend Express server).

Vercel CLI symuluje Edge Functions zachowanie w dev mode.
