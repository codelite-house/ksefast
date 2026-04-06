# Wkład w projekt KSeFast

Dziękujemy za zainteresowanie! KSeFast to proste narzędzie skierowane wyłącznie na rynek polski — chcemy, żeby pozostało proste.

## Jak wesprzeć projekt

### Zgłaszanie błędów

Otwórz [issue](https://github.com/codelitehouse/ksefast/issues) używając szablonu **„Zgłoszenie błędu"** i podaj:

- Co robiłeś/robiłaś
- Czego się spodziewałeś/spodziewałaś
- Co się zamiast tego wydarzyło
- Środowisko KSeF (demo / produkcja) i przeglądarka

### Propozycje usprawnień

Zanim zaczniesz pisać kod, otwórz issue z etykietą `enhancement` i opisz swój pomysł.

### Tworzenie pull requesta

1. Zrób fork repozytorium
2. Utwórz branch: `git checkout -b fix/opis-poprawki`
3. Wprowadź zmiany
4. Przetestuj lokalnie przez Docker Compose (patrz README)
5. Commituj ze zrozumiałym komunikatem
6. Otwórz pull request z opisem co i dlaczego

## Uruchomienie lokalne

```bash
docker compose up
```

Aplikacja dostępna pod http://localhost:8080. Zero kont, zero kluczy API — tylko Docker.

Rozwój frontendu bez Dockera:

```bash
pnpm install
pnpm dev
```

Frontend: `http://localhost:5173` · Proxy: `http://localhost:3001`

## Konwencje kodu

- TypeScript wszędzie — `any` tylko w ostateczności
- Typy bierz ze specyfikacji OpenAPI w `docs/openapi/` — nie zgaduj nazw pól
- Szyfrowanie tokena KSeF odbywa się **wyłącznie w przeglądarce**, nigdy na serwerze
- Serwer proxy (`server/server.ts`) musi pozostać bezstanowy — bez sesji, bez bazy, bez zapisu plików
- Każda istotna zmiana musi być odnotowana w `change_log.md`

## Czego nie akceptujemy

- Funkcji wymagających przechowywania danych użytkownika lub tokenów po stronie serwera
- Zależności zwiększających powierzchnię ataku bez wyraźnego uzasadnienia
- Zmian psujących uruchomienie przez `docker compose up`

## Pytania

Otwórz issue lub dyskusję na GitHubie. Komunikacja po polsku jest jak najbardziej OK.
