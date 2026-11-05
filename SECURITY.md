# Polityka bezpieczeństwa

## Wspierane wersje

Aktywnie utrzymujemy wyłącznie najnowszą wersję z gałęzi `main`.

## Zgłaszanie luk bezpieczeństwa

**Nie otwieraj publicznego issue na GitHubie jeśli chodzi o lukę bezpieczeństwa.**

Prześlij zgłoszenie na adres: security@codelitehouse.com

Co powinno zawierać zgłoszenie:

- Opis luki
- Kroki reprodukcji
- Potencjalny wpływ

Odpowiemy w ciągu 5 dni roboczych. Dla potwierdzonych krytycznych luk dążymy do wydania poprawki w ciągu 30 dni.

## Architektura bezpieczeństwa

KSeFast ma minimalną powierzchnię ataku z założenia:

- **Brak przechowywania danych** — serwer jest bezstanowy. Przekazuje żądania do KSeF API i nie zapisuje tokenów ani faktur (na dysku, w bazie ani w logach).
- **Długoterminowy token KSeF nigdy nie opuszcza przeglądarki w postaci jawnej** — szyfrowanie RSA-OAEP odbywa się w przeglądarce kluczem publicznym MF, zanim zostanie wysłany. Odszyfrować go może wyłącznie KSeF.
- **Brak bazy danych, sesji, kont użytkowników.**
- **ZIP i PDF generowane lokalnie** — w przeglądarce.

### Co widzi serwer proxy

Proxy (`server/server.ts`) przekazuje żądania HTTP między przeglądarką a KSeF, bo KSeF API blokuje CORS. W tranzycie (TLS) widzi:

- szyfrogram tokena KSeF — bez możliwości odszyfrowania,
- tymczasowy `authenticationToken` i `accessToken` sesji KSeF (nagłówek `Authorization`) — działający token sesji pozwala odczytać faktury podmiotu do czasu jego wygaśnięcia,
- identyfikator kontekstu (np. NIP), metadane i treść XML pobieranych faktur.

`refreshToken` zwracany przez `/auth/token/redeem` nie jest przekazywany do przeglądarki. Kto nie chce ufać operatorowi wersji hostowanej, może uruchomić proxy u siebie (`docker compose up`) albo użyć CLI (`pnpm cli download`), które łączy się z KSeF bezpośrednio.

Operator wersji hostowanej ksefast.pl: IT Solutions Grzegorz Krzesiński (Codelite House), contact@codelitehouse.com. Polityka prywatności: https://ksefast.pl/polityka-prywatnosci.

## Zakres

W zakresie:

- Serwer proxy (`server/`)
- Frontend (`frontend/src/`)
- Konfiguracja Docker (`Dockerfile.*`, `docker-compose.yml`)

Poza zakresem:

- Samo API KSeF — zgłoś do Ministerstwa Finansów
- Generator PDF MF (zależność `@akmf/ksef-fe-invoice-converter`) — zgłoś upstream do [CIRFMF/ksef-pdf-generator](https://github.com/CIRFMF/ksef-pdf-generator)
