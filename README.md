# KSeFast

[![GitHub](https://img.shields.io/badge/GitHub-codelitehouse%2Fksefast-blue?logo=github)](https://github.com/codelitehouse/ksefast)

Pobierz faktury z KSeF (Krajowy System e-Faktur) jako paczkę ZIP – w formacie XML lub PDF – bez instalowania żadnego oprogramowania poza Dockerem.

## Co robi

- loguje się do KSeF przy użyciu tokena KSeF (token jest szyfrowany lokalnie, nigdy nie jest zapisywany),
- pobiera listę faktur dla wskazanego zakresu dat i miesiąca,
- buduje paczkę ZIP z fakturami w formacie XML albo PDF **lokalnie w przeglądarce** – nic nie trafia na zewnętrzne serwery,
- wszystkie dane są przetwarzane i niszczone natychmiast po pobraniu.

## Uruchomienie lokalne (Docker Compose)

### Wymagania

- [Docker](https://docs.docker.com/get-docker/) z wtyczką Compose (Docker Desktop lub `docker compose` w CLI)

### Uruchomienie

```bash
docker compose up
```

Aplikacja będzie dostępna pod adresem: **http://localhost:8080**

Przy pierwszym uruchomieniu Docker pobierze i zbuduje obrazy – może to chwilę potrwać.

### Zatrzymanie

```bash
docker compose down
```

## Jak to działa – prywatność

1. **Token szyfrowany lokalnie** – RSA-OAEP odbywa się w przeglądarce przy użyciu klucza publicznego KSeF. Token nigdy nie opuszcza Twojego urządzenia w postaci jawnego tekstu.
2. **Serwer proxy** – API KSeF blokuje żądania bezpośrednio z przeglądarki (brak CORS). Lokalny serwer proxy tylko przekazuje zaszyfrowane żądania do KSeF – jest bezstanowy i nie zapisuje żadnych danych.
3. **Faktury do przeglądarki** – XML faktury trafia bezpośrednio ze KSeF przez proxy do Twojej przeglądarki.
4. **PDF generowany lokalnie** – KSeF nie dostarcza faktur w formacie PDF. Konwersja XML → PDF odbywa się w całości w przeglądarce (biblioteka [ksef-pdf-generator](https://github.com/CIRFMF/ksef-pdf-generator) oficjalnego repozytorium MF).
5. **ZIP tworzony lokalnie** – paczka budowana jest w pamięci przeglądarki i pobierana bezpośrednio na Twój komputer.

## Ograniczenia

- Jedna paczka obsługuje maksymalnie **50 faktur**.
- Wymagany jest token KSeF oraz identyfikator kontekstu logowania (np. NIP firmy).

## Stack

- **Frontend**: React + Vite + TypeScript
- **Serwer proxy**: Node.js (Express backend, uruchamiany przez Docker Compose)
- **PDF**: [`CIRFMF/ksef-pdf-generator`](https://github.com/CIRFMF/ksef-pdf-generator) – vendored lokalnie
- **Crypto**: jsrsasign (RSA-OAEP szyfrowanie tokena w przeglądarce)
