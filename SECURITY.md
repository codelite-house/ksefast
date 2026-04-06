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

- **Brak przechowywania danych** — serwer jest bezstanowy. Przekazuje żądania do KSeF API i nie zapisuje niczego.
- **Token nigdy nie opuszcza przeglądarki w postaci jawnej** — szyfrowanie RSA-OAEP odbywa się w przeglądarce przy użyciu klucza publicznego KSeF, zanim cokolwiek zostanie wysłane.
- **Brak bazy danych, sesji, kont użytkowników.**
- **ZIP i PDF generowane lokalnie** — dane faktur nigdy nie przechodzą przez nasz serwer.

Serwer proxy (`server/server.ts`) jedynie przekazuje żądania HTTP. Nie ma dostępu do zaszyfrowanego tokena, ponieważ nie może odszyfrować RSA-OAEP bez klucza prywatnego użytkownika (który nie istnieje — KSeF wykorzystuje schemat asymetryczny, gdzie klucz prywatny posiada wyłącznie KSeF).

## Zakres

W zakresie:

- Serwer proxy (`server/`)
- Frontend (`frontend/src/`)
- Konfiguracja Docker (`Dockerfile.*`, `docker-compose.yml`)

Poza zakresem:

- Samo API KSeF — zgłoś do Ministerstwa Finansów
- Vendored generator PDF (`frontend/vendor/ksef-pdf-generator`) — zgłoś upstream do [CIRFMF/ksef-pdf-generator](https://github.com/CIRFMF/ksef-pdf-generator)
