# KSeFast Quick Start Guide

Witaj w **KSeFast** - aplikacji do pobierania faktur z KSeF z architekturą **Privacy-First** 🔒

## Co się zmieniło?


Tradycyjny backend został zastąpiony **bezstanowym backendem Express** (uruchamianym przez Docker Compose). Token nigdy nie jest zapisywany, nie ma bazy danych, a całe przetwarzanie (szyfrowanie, PDF, ZIP) odbywa się lokalnie w przeglądarce użytkownika.

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
│   │   ├── archiveService.ts # Budowanie ZIP/PDF
│   │   └── ...           # Pozostałe pliki frontendu
│   └── .env.local        # VITE_API_BASE_URL=/api
├── server/                # Express backend (proxy do KSeF)
│   └── server.ts         # Główny serwer proxy
├── docker-compose.yml     # Stack: frontend + backend
└── README.md              # Dokumentacja
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


## Deploy produkcyjny

Wersja produkcyjna uruchamiana jest przez Docker Compose (frontend + backend Express). Nie jest już wspierany deploy na Vercel/Edge Functions.

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

Powodzenia!!
