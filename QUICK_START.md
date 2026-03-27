# KSeFast Quick Start Guide

Witaj w **KSeFast** - aplikacji do pobierania faktur z KSeF z architekturą **Privacy-First** 🔒

## Co się zmieniło?

Tradycyjny backend został zastąpiony **Vercel Edge Functions**, co oznacza:

✅ Token nigdy nie jest zapisywany  
✅ Brak bazy danych  
✅ Brak centralnego serwera przechowującego dane  
✅ Całe przetwarzanie w przeglądarce użytkownika  
✅ Globalna latencja (Edge Network rozłożony na całym świecie)

## Architektura

```
┌─────────────────────────────────────────────────────────┐
│ USER BROWSER (przeglądarkaużytkownika)                  │
│ - Szyfruje token RSA-OAEP                               │
│ - Buduje PDF z XML                                      │
│ - Tworzy archiwum ZIP                                   │
│ - Ничего не przechowuje po skończeniu                   │
└──────────────┬──────────────────────────────────────────┘
               │ (token encrypted)
               ↓
┌──────────────────────────────────────────────────────────┐
│ VERCEL EDGE FUNCTIONS (pass-through, bezstanowe)        │
│ - Zbiera żądania od użytkowników                         │
│ - Przekazuje do KSeF API                                 │
│ - Ничего не przechowuje, ничего nie zapisuje            │
│ - Nowy proces na każde żądanie                          │
└──────────────┬───────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────┐
│ KSeF API (Ministerstwo Finansów)                         │
│ - Zwraca metadane i XML faktur                          │
└──────────────────────────────────────────────────────────┘
```

## Struktura projektu

```
ksefast/
├── frontend/              # React + Vite + TypeScript
│   ├── src/
│   │   ├── App.tsx       # UI z privacy banner
│   │   ├── ksefClient.ts # Logika KSeF (RSA, autoryzacja)
│   │   ├── archiveService.ts # Budowanie ZIP/PDF
│   │   └── api.ts        # Wrapper do Edge Functions
│   └── .env.local        # VITE_API_BASE_URL=/api
├── api/                   # Edge Functions (Vercel)
│   ├── _helpers.ts
│   ├── security/
│   ├── auth/
│   └── invoices/
├── backend/              # Express (local dev only)
├── vercel.json          # Konfiguracja Vercel
├── EDGE_FUNCTIONS.md    # Dokumentacja architekury
└── DEPLOY_VERCEL.md     # Instrukcja deployowania
```

## Local Development

### 1. Zainstaluj zależności

```bash
npm install
```

### 2. Uruchom dev server

```bash
npm run dev
```

Otwórz:
- Frontend: http://localhost:5173
- Backend (local proxy): http://localhost:3001/api

### 3. Testuj

1. Wybierz **Demo** environment
2. Wpisz token KSeF (jeśli masz)
3. Wpisz NIP
4. Wybierz miesiąc
5. Kliknij "Pobierz paczkę"

Cały proces dzieje się w przeglądarce - token nigdy nie opuszcza Twojego komputera!

## Build

```bash
npm run build
```

Tworzy:
- `frontend/dist/` - zoptymalizowany frontend
- `backend/dist/` - skompilowany backend

## Deploy na Vercel

### Opcja 1: CLI

```bash
npm run deploy
```

### Opcja 2: GitHub integration

1. Push na main branch w GitHub
2. Vercel automatycznie deployuje

Vercel deployuje:
- Frontend do `yourdomain.vercel.app`
- Edge Functions do `yourdomain.vercel.app/api/*`

Każdy branch ma automatyczne preview environment.

## Productioon Flow

```
User Website
    ↓
Frontend (React)
    ├── Wczytujesz token
    ├── Przeglądarkaszy RSA-OAEP
    └── Wysyłasz encrypted
        ↓
    Edge Function (Vercel)
        └── Pass-through do KSeF
            ↓
        KSeF API
            ├── Zwraca certyfikaty
            ├── Zwraca metadane
            └── Zwraca XML
                ↓
    Przeglądarkaszy
        ├── Wyświetla PDF
        ├── Tworzy ZIP
        └── Pobierza plik
            ↓
    TOKEN JEST USUNIĘTY ✅
    DANE SĄ USUNIĘTE ✅
```

## Security Checklist

- ✅ Token nigdy nie jest wysyłany w clear-text
- ✅ Token nigdy nie jest zapisywany na serwerze
- ✅ Edge Functions nie przechowują danych
- ✅ Brak bazy danych
- ✅ CORS headers zabraniają dostępu z nieautoryzowanych źródeł (ale to OK bo nic nie przechowujemy)
- ✅ Każdy request jest izolowany
- ✅ Automatyczne czyszczenie cache "Wyczyść wszystko"

## Key Features

### Privacy Banner
Na górze aplikacji widać jasny komunikat:
> "Twoje dane są bezpieczne, bo ich nie zbieramy."

### Auto-generated Months
Zamiast wybierania daty - prosty dropdown z etykietami:
- Marzec 2026
- Luty 2026
- Styczeń 2026
- ...

### Session Indicator
Gdy wpiszesz token - pojawia się "Sesja aktywna lokalnie" z pulsującym indykatorem.

### Clear All Button
Jeden klik aby wyczyścić token, formę i cache:
```javascript
sessionStorage.clear();
localStorage.clear();
```

## Troubleshooting

### "Nie mogę pobrać faktur"

**Przyczyna 1: Zły token**
- Sprawdź czy token jest ważny w KSeF

**Przyczyna 2: Zły NIP**
- Sprawdź czy NIP odpowiada tokenowi

**Przyczyna 3: Zbyt długi zakres dat**
- KSeF obsługuje maksymalnie ~3 miesiące na zapytanie
- Aplikacja pokazuje co miesiąc - wybierz pojedynczy miesiąc

**Przyczyna 4: Edge Function error**
- Sprawdź Vercel logs: `vercel logs --follow`
- Pewnie timeout (KSeF powoli odpowiada)

### "Token is undefined"

To nie jest błąd, to komunikat że:
1. Nigdy nie przesyłasz tokena na backend
2. Wszystko szyfruje się lokalnie

### Chrome DevTools Network Tab

Jeśli sprawdzisz network requests:
- Widzisz `/api/security/certificates?environment=demo`
- Ale widzisz `Authorization: Bearer encrypted_token_base64`
- Token jest zaszyfrowany RSA-OAEP, Edge Function nie może go odczytać

Perfect! 🔒

## Monitoring na Produkcji

### Logi
```bash
vercel logs
```

### Analytics
Vercel dashboard pokazuje:
- Request count per function
- Error rate
- Response times
- Regional distribution

### Alerts
Ustaw notification w Vercel:
- Edge Functions error rate > 5%
- Response time > 5s

## Kontakt & Support

- GitHub Issues: [Link do issues]
- Email: support@yourdomain.com

## License

MIT

---

**Gotów do startu?** 🚀

```bash
npm install
npm run dev
```

Powodzenia!
