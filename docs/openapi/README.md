# KSeF OpenAPI – specyfikacje referencyjne

Tutaj trzymamy oficjalne specyfikacje OpenAPI KSeF API v2.
Traktuj je jako **źródło prawdy** przy każdej zmianie w `api/`.

## Pliki

| Plik                 | Środowisko                                  | Wersja |
| -------------------- | ------------------------------------------- | ------ |
| `ksef-api-prod.json` | Produkcja – `https://api.ksef.mf.gov.pl/v2` | 2.2.0  |
| `ksef-api-test.json` | Test – URL ze specyfikacji testowej         | 2.2.x  |

## Jak zaktualizować pliki

Pobierz aktualne specyfikacje z Swagger UI KSeF lub z repozytorium:

- https://github.com/CIRFMF/ksef-docs

Skopiuj pliki do tego folderu:

```powershell
copy "$env:USERPROFILE\Downloads\ksef-api-prod.json" docs\openapi\
copy "$env:USERPROFILE\Downloads\ksef-api-test.json" docs\openapi\
```

## Kluczowe endpointy KSeF API v2

### Autoryzacja tokenem KSeF

| Krok                               | Metoda | Endpoint                  |
| ---------------------------------- | ------ | ------------------------- |
| 1. Pobierz challenge               | POST   | `/auth/challenge`         |
| 2. Zainicjuj autoryzację tokenem   | POST   | `/auth/ksef-token`        |
| 3. Sprawdź status (polling)        | GET    | `/auth/{referenceNumber}` |
| 4. Wymień authToken na accessToken | POST   | `/auth/token/redeem`      |
| (opcja) Odśwież accessToken        | POST   | `/auth/token/refresh`     |

### Faktury

| Akcja                          | Metoda | Endpoint                              |
| ------------------------------ | ------ | ------------------------------------- |
| Certyfikaty klucza publicznego | GET    | `/security/public-key-certificates`   |
| Metadane faktur (query)        | POST   | `/invoices/query/metadata`            |
| Pobierz XML faktury            | GET    | `/invoices/ksef/{ksefNumber}`         |
| Export paczki faktur (async)   | POST   | `/invoices/exports`                   |
| Status eksportu                | GET    | `/invoices/exports/{referenceNumber}` |

### Uwagi implementacyjne

- accessToken to JWT, przekazywany jako `Authorization: Bearer {token}`
- authToken (tymczasowy) z `/auth/ksef-token` → polling `/auth/{referenceNumber}` → `code 200` gdy gotowy
- Szyfrowanie tokena KSeF: RSA-OAEP SHA-256, klucz publiczny z `/security/public-key-certificates` (usage: `KsefTokenEncryption`)
- KSeF v2 nie ma endpointu `/auth/status` – jest `/auth/{referenceNumber}` (GET)
- KSeF v2 nie ma `/auth/token` – jest `/auth/ksef-token` (POST)
- KSeF v2 nie ma `/auth/redeem` – jest `/auth/token/redeem` (POST)
- Odpowiedź statusu autoryzacji: pole `status.stateCode` (nie `status.code` jak w v1/v3)

## CORS – **ZABLOKOWANE** (zweryfikowane 2026-03-22)

KSeF API **nie ustawia** nagłówka `Access-Control-Allow-Origin`.
Bezpośrednie wywołania `fetch()` z przeglądarki są blokowane:

```
Access to fetch at 'https://api-test.ksef.mf.gov.pl/v2/security/public-key-certificates'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**Proxy w `api/` jest konieczne** – nie usuwaj go.
