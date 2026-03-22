# KSeFast – instrukcje dla GitHub Copilot

## Projekt

KSeFast: aplikacja do pobierania faktur z KSeF (Krajowy System e-Faktur, Ministerstwo Finansów PL).
Architektura: React frontend + Vercel Edge Functions jako proxy do KSeF API.

---

## KSeF API – źródło prawdy

**Specyfikacje OpenAPI** są w `docs/openapi/`. Są to pliki 1:1 z oficjalnym API KSeF.
Zawsze sprawdzaj je przed zmianą czegokolwiek w `api/`.

### Adresy bazowe (KSeF API v2)

```
Produkcja: https://api.ksef.mf.gov.pl/v2
Test:       https://api-test.ksef.mf.gov.pl/v2   ← zweryfikuj z docs/openapi/ksef-api-test.json
```

> **Uwaga**: Stare adresy (`demo.ksef.mf.gov.pl/api/v3`, `ksef.mf.gov.pl/api/v3`) są z **KSeF v1/v3** i nie działają.

### Kluczowe endpointy v2

| Akcja                             | Metoda | Ścieżka                               |
| --------------------------------- | ------ | ------------------------------------- |
| Certyfikaty klucza publicznego    | GET    | `/security/public-key-certificates`   |
| Challenge                         | POST   | `/auth/challenge`                     |
| Inicjalizacja autoryzacji tokenem | POST   | `/auth/ksef-token`                    |
| Status autoryzacji (polling)      | GET    | `/auth/{referenceNumber}`             |
| Wymiana authToken → accessToken   | POST   | `/auth/token/redeem`                  |
| Odświeżenie accessToken           | POST   | `/auth/token/refresh`                 |
| Metadane faktur                   | POST   | `/invoices/query/metadata`            |
| Pobranie XML faktury              | GET    | `/invoices/ksef/{ksefNumber}`         |
| Export paczki faktur (async)      | POST   | `/invoices/exports`                   |
| Status eksportu                   | GET    | `/invoices/exports/{referenceNumber}` |

### Pułapki nazewnicze v2 vs stary kod

- `/auth/status` → **nie istnieje w v2**, prawidłowy: `GET /auth/{referenceNumber}`
- `/auth/token` → **to jest zarządzanie tokenami** (CRUD), NIE inicjalizacja sesji; inicjalizacja: `POST /auth/ksef-token`
- `/auth/redeem` → **nie istnieje w v2**, prawidłowy: `POST /auth/token/redeem`
- `/invoices/metadata` → **nie istnieje w v2**, prawidłowy: `POST /invoices/query/metadata`
- `/invoices/download` → **nie istnieje w v2**, prawidłowy: `GET /invoices/ksef/{ksefNumber}`
- `/security/certificates` → **nie istnieje w v2**, prawidłowy: `GET /security/public-key-certificates`

### Autoryzacja – schemat

```
1. GET  /security/public-key-certificates     → certyfikat RSA (usage: KsefTokenEncryption)
2. POST /auth/challenge                        → challenge + timestampMs
3. [przeglądarka] szyfruje: RSA-OAEP SHA-256(token + "|" + timestampMs, certPubKey)
4. POST /auth/ksef-token                       → { referenceNumber, authenticationToken }
5. GET  /auth/{referenceNumber}  [polling]     → czekaj aż authStatus.stateCode = 200
6. POST /auth/token/redeem                     → { accessToken, refreshToken }
7. [faktury] POST /invoices/query/metadata Authorization: Bearer {accessToken}
8. [faktury] GET  /invoices/ksef/{ksefNumber}  Authorization: Bearer {accessToken}
```

### accessToken

- Format: JWT
- Przekazywany: `Authorization: Bearer {accessToken}`
- Odświeżanie: `POST /auth/token/refresh` (zamiast ponownego logowania)

### CORS – **ZABLOKOWANE** (potwierdzone)

KSeF API **nie ustawia** nagłówka `Access-Control-Allow-Origin`.
Bezpośrednie wywołania `fetch()` z przeglądarki kończą się błędem:

```
Access to fetch at 'https://api-test.ksef.mf.gov.pl/v2/...' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Wniosek: proxy w `api/` jest konieczne.** Nie usuwaj go ani nie próbuj wywoływać KSeF bezpośrednio z frontendu.

---

## Struktura projektu

```
ksefast/
├── frontend/src/
│   ├── ksefClient.ts     ← cała logika KSeF (auth, szyfrowanie RSA, pobieranie faktur)
│   ├── archiveService.ts ← budowanie ZIP (XML lub PDF przez @mdab25/ksef-pdf)
│   ├── api.ts            ← cienki wrapper: ksefClient + archiveService → Blob
│   └── App.tsx           ← UI (formularz, stany)
├── api/                  ← Vercel Edge Functions (proxy do KSeF)
│   ├── _helpers.ts       ← base URLs, CORS, error handling
│   ├── auth/             ← challenge, token (init), status, redeem
│   ├── invoices/         ← metadata, download
│   └── security/         ← certificates
├── docs/openapi/         ← specyfikacje OpenAPI KSeF (źródło prawdy)
├── docker-compose.yml    ← lokalny stack: frontend (:8080) + backend (:3001, vercel dev)
└── vercel.json           ← konfiguracja Vercel
```

## Limit faktur

Aktualny limit aplikacji: **50 faktur na eksport** (stała `MAX_INVOICES_PER_EXPORT` w `ksefClient.ts`).

## Szyfrowanie tokena

Odbywa się **wyłącznie w przeglądarce** (nie przez proxy). Biblioteka: `jsrsasign`.
Token nigdy nie jest wysyłany w plaintext.

## Modele DTO i typy TypeScript

Przy implementacji lub modyfikacji modeli DTO (typy żądań/odpowiedzi) **zawsze korzystaj ze specyfikacji OpenAPI**:

- `docs/openapi/ksef-api-prod.json` – produkcja
- `docs/openapi/ksef-api-test.json` – środowisko testowe

Nazwy pól, typy, wartości enum – bierz 1:1 ze specyfikacji, nie zgaduj.
Typy frontendowe są w `frontend/src/types.ts`, typy backendu są inline w plikach `api/`.

## Reguła changelog

**Każda zmiana w kodzie dokonana przez agenta AI musi być odnotowana w `change_log.md`** (plik w root projektu).
Format wpisu:

```markdown
## YYYY-MM-DD

### Tytuł zmiany

- co zmieniono i dlaczego
```

Dodawaj wpis na górze pliku (najnowsze zmiany pierwsze).
