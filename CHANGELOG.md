# Changelog

Wszystkie istotne zmiany w projekcie są dokumentowane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/).

---

## [Nieudostępnione]

### Dodano

- Opcja "Zakupy + sprzedaż": faktury zakupu i sprzedaży z wybranego miesiąca w jednej paczce ZIP (XML lub PDF), w folderach `zakupy/` i `sprzedaz/` (folder także w `manifest.json`). Jedno logowanie do KSeF, dwa wyszukiwania; samofaktury występujące w obu rolach trafiają do paczki raz. Dostępna też w "Opcjach zaawansowanych" jako "Podmiot 1 + 2"
- Pobieranie w aplikacji webowej przestrzega limitów KSeF (16 faktur/min, 64/h): pauza ~4,5 s między fakturami, ponawianie po `429` zgodnie z `Retry-After` (proxy przekazuje teraz ten nagłówek) i po błędach 5xx. Podczas pauzy widać odliczanie "Limit KSeF – wznowienie za 0:45". Logika limitów jest wspólna z CLI (`frontend/src/lib/ksefRateLimit.ts`)
- Pobrane faktury nigdy nie przepadają: po wyczerpaniu limitu godzinowego, zerwaniu połączenia albo zatrzymaniu pobierania powstaje paczka częściowa z plikiem `BRAKUJACE.txt` (numery KSeF brakujących faktur), a przycisk "Dociągnij brakujące" pobiera resztę, gdy KSeF znów pozwoli. Pojedyncza faktura niedostępna w KSeF (np. jeszcze przetwarzana) nie przerywa całej paczki
- Przycisk "Zatrzymaj i zapisz pobrane" w trakcie pobierania i ostrzeżenie przed zamknięciem karty
- Polityka prywatności (`/polityka-prywatnosci`, link w stopce, przy formularzu kontaktowym i w sekcji "Prywatność"): administrator, co przechodzi przez serwer pośredniczący przy pobieraniu faktur, formularz kontaktowy, logi techniczne, prawa osób. Pod formularzem kontaktowym skrócona klauzula informacyjna (art. 13 RODO)
- Przebudowa strony "na WOW": przyklejony nagłówek ze wskaźnikiem przewijania, hero z animacją faktur lecących do paczki ZIP, tło z poświatami, sekcje "Jak to działa", "Prywatność" (animowana droga tokena), "Porównanie" (wyścig czasu vs portal MF), FAQ jako akordeon i kontakt. Bez nowych zależności, z obsługą `prefers-reduced-motion`
- Formularz pobierania w trzech krokach logicznych: token (z przyciskiem "Wklej" i podglądem), NIP (auto-formatowanie wklejki, ostrzeżenie o błędnej sumie kontrolnej), wybór miesiąca kafelkami oraz rodzaju faktur i formatu kartami; opcje techniczne (rodzaj identyfikatora, typ daty, rola) schowane w "Opcjach zaawansowanych"
- Widok postępu pobierania (pierścień, etapy i liczniki na żywo) oraz ekran sukcesu z konfetti i przyciskiem "Pobierz kolejny miesiąc"
- Animowane logo KSeFast w SVG (`frontend/src/images/logo/`): animacja wejścia (pierścień się rozkręca i hamuje, trzy paski dolatują z lewej i zatrzymują się przy logo, litery wjeżdżają po kolei, na końcu połysk), loader (pierścień robi półobrót, pauza, drugi półobrót, pauza – paski w tym samym rytmie) oraz wersja statyczna; każda w wariancie na jasne i ciemne tło, plus `preview.html` do podglądu. Animacje wyłączają się przy `prefers-reduced-motion`. Użyte w nagłówku (animacja wejścia, raz po załadowaniu), stopce (statyczne) i w widoku pobierania (loader); nowy `favicon.svg` (pierścień z literą K na ciemnym tle)
- Data nadania numeru KSeF w nagłówku PDF faktury (jak w portalu MF)
- Lokalne CLI (`pnpm cli download`) do pobierania faktur z KSeF do wskazanego folderu – bez przeglądarki i proxy, z pomijaniem faktur już pobranych, pauzami i ponawianiem przy limitach KSeF (16 pobrań/min, 64/h) oraz zapisem PDF (oficjalny generator MF) i XML
- Licencja MIT (`LICENSE`) dla projektu
- `CONTRIBUTING.md` – wytyczne dla kontrybutorów po polsku
- `SECURITY.md` – polityka bezpieczeństwa i zgłaszania luk po polsku
- Szablony zgłoszeń GitHub Issues po polsku (błędy, propozycje funkcji)
- W chartcie Helm backendu dodano obsługę zmiennych środowiskowych przez `valueFrom.secretKeyRef` (bez wpisywania kluczy jawnie w values)

### Naprawiono

- Formularz kontaktowy: błąd "Contact form is temporarily unavailable" – wbudowany `fetch` w Node po cichu ignoruje własny nagłówek `Host`, więc Zitadel (wywoływany po wewnętrznym adresie klastra) nie rozpoznawał instancji i odpowiadał 404 "Instance not found". Serwer podaje teraz zewnętrzną domenę nagłówkami `x-zitadel-instance-host` i `x-forwarded-host`, które `fetch` przepuszcza; dodano test regresji

### Zmieniono

- Opisy prywatności w README, `SECURITY.md`, sekcji "Prywatność" i FAQ zgodne z tym, co robi kod: szyfrowany jest długoterminowy token KSeF, a tymczasowy token sesji oraz faktury przechodzą przez serwer pośredniczący w tranzycie (TLS), bez zapisu. Usunięto zdania "faktura nigdy nie dotyka zewnętrznego serwera", "serwer widzi tylko zaszyfrowany blob" i "serwer nie loguje". Wskazano operatora wersji hostowanej i opcje bez pośrednika (własny `docker compose up`, CLI)
- Proxy nie przekazuje przeglądarce `refreshToken` z `/auth/token/redeem` (aplikacja go nie używa)
- Pobranie faktury idzie przez `POST /api/invoices/download` z numerem KSeF w treści – numer (zawiera NIP sprzedawcy) nie trafia już do logów dostępowych nginx/ingress. `GET ?ksefNumber=` działa dalej dla kart otwartych przed aktualizacją
- Formularz kontaktowy nie wysyła już `userAgent` przeglądarki
- FAQ przepisane na to, co aplikacja faktycznie robi: usunięto pytania o powiadomienia o nowych fakturach i wyszukiwanie faktury (tych funkcji nie ma), o "archiwizację" oraz zapewnienie "bezpieczniejsze niż w banku"; zdublowane pytania scalono, dodano "Skąd wziąć token KSeF?", poprawiono odpowiedź o limitach (zamiast nieaktualnego "maksymalnie 50 faktur"). Kafelek "Szybkie szukanie" zastąpiono "Cały miesiąc jednym kliknięciem"
- Usunięto z formularza przełącznik "Produkcja/Demo" – od 17.08 serwer ignoruje parametr `?environment=` i środowisko KSeF wybiera wyłącznie zmienną `KSEF_ENV` (staging = test, produkcja = prawdziwy KSeF), więc przełącznik nic nie robił i wprowadzał w błąd
- Wdrożenie: jeden chart Helm `ksefast` (komponenty `api` i `app`, jeden release w ArgoCD – tak jak jobsonar) zamiast dwóch osobnych chartów `ksefast-backend` i `ksefast-frontend`; CI publikuje jeden chart na wersję
- Obraz frontendu: adres API w nginx jest teraz szablonem (`BACKEND_HOST`, `BACKEND_PORT`, domyślnie `backend:3001` – `docker compose` działa bez zmian)
- Strona przestała używać ciężkiego `logo.png` (2,2 MB, szare tło) – w nagłówku, stopce i widoku pobierania jest wektorowe, animowane logo SVG (`BrandMark`)
- Komunikat po pobraniu nie znika już sam po 8 sekundach; zamyka go użytkownik (np. przyciskiem "Pobierz kolejny miesiąc")
- Treść FAQ przeniesiona do `src/content/faqItems.ts` (bez zmian w treści; dane strukturalne FAQPage zostają)
- Generator PDF zaktualizowany do wersji 1.1.46 Ministerstwa Finansów – wizualizacje faktur wyglądają tak samo jak PDF-y z portalu MF (m.in. kod waluty, formaty dat, tabela podsumowania stawek podatku, numeracja stron, poprawione zaokrąglanie kwot)
- Generator PDF nie jest już kopiowany do repozytorium (`frontend/vendor`) – to zależność przypięta do commita w oficjalnym repozytorium MF
- Logowanie tokenem i nazewnictwo plików faktur wydzielono do współdzielonych modułów (bez zmian w działaniu aplikacji webowej)
- `README.md` – przebudowany pod open source: badge licencja/release, diagram architektury, sekcje Contributing / Security / Licencja, instrukcja dev bez Dockera
- Atrybucja vendora `@akmf/ksef-fe-invoice-converter` w README – dodano nazwę pakietu npm i rok copyright
- Komunikat w panelu kontaktowym uproszczono do jasnego zaproszenia do wypelnienia formularza
- Komunikaty bledow formularza kontaktowego uproszczono i ukryto techniczne szczegoly konfiguracji backendu
- Przywrócono polskie znaki w komunikatach formularza kontaktowego (etykiety, przycisk, sukces i błędy)

### Usunięto

- `QUICK_START.md` – nieaktualny, opisywał architekturę Vercel Edge Functions
- `DEPLOY_VERCEL.md` – nieaktualny, opisywał deploy na Vercel

---

## [0.0.10] – 2026-03-28

### Dodano

- Informacja pod przełącznikiem PDF/XML wyjaśniająca, że KSeF nie dostarcza faktur w PDF i konwersja odbywa się lokalnie w przeglądarce
- Walidacja pola „Wartość kontekstu" z podpowiedzią dla każdego typu (NIP, NIP VAT UE, Peppol ID, Internal ID) – błąd widoczny przed wysłaniem formularza
- Rozwijany blok ze szczegółami odpowiedzi KSeF przy błędzie autoryzacji

### Zmieniono

- Sekcja „Jak to działa?" w panelu Q&A przepisana na 5 kroków opisujących rzeczywisty przepływ: lokalne szyfrowanie → proxy → XML z KSeF → generowanie PDF → ZIP lokalnie
- FAQ przepisane w formę pytań z odpowiedziami

### Naprawiono

- Przy zmianie typu kontekstu pole wartości jest czyszczone i resetuje stan walidacji

---

## [0.0.8] – 2026-03-27

### Dodano

- Ciemny motyw (dark theme) oparty na Material UI z kolorami nawiązującymi do KSeF
- Stopka z linkiem do GitHub i do biblioteki PDF

### Zmieniono

- Interfejs przepisany z HTML/CSS na Material UI (`TextField`, `Select`, `Button`, `ToggleButtonGroup`, `Alert`, `Paper` i inne)
- Panel Q&A zawsze widoczny (bez przycisku toggle)

---

## [0.0.6] – 2026-03-24

### Dodano

- Kody QR zgodne z oficjalnym formatem KSeF 2.0 (`qr.ksef.mf.gov.pl/invoice/{NIP}/{data}/{hash}`) generowane w PDF

### Zmieniono

- Biblioteka PDF przełączona na oficjalną `@akmf/ksef-fe-invoice-converter` z repozytorium Ministerstwa Finansów ([CIRFMF/ksef-pdf-generator](https://github.com/CIRFMF/ksef-pdf-generator)), vendorowana lokalnie

### Naprawiono

- Kody QR w formacie PDF były niezgodne z aktualną specyfikacją KSeF i nie były akceptowane przez czytniki

---

## [0.0.4] – 2026-03-22

### Dodano

- Serwer proxy Express (`server/server.ts`) jako bezstanowe pośrednictwo między przeglądarką a KSeF API – zastępuje zależność od Vercel CLI przy lokalnym uruchomieniu
- Architektura usług i hooków: `securityService`, `authService`, `invoicesService`, `useCertificates`, `useDownloadInvoices`
- Token KSeF wklejony ze spacją na początku/końcu jest automatycznie przycinany

### Zmieniono

- Pełna sekwencja pobierania faktur zarządzana przez TanStack Query (`useMutation`)
- Środowisko (demo/produkcja) przekazywane parametrycznie w każdym żądaniu – nie ma już hardcoded wartości `demo`

### Naprawiono

- Komunikat błędu gdy token KSeF „nie został znaleziony" zawiera podpowiedź o sprawdzeniu środowiska i aktywności tokena
- Adresy API KSeF zaktualizowane do v2 (`api.ksef.mf.gov.pl/v2`, `api-test.ksef.mf.gov.pl/v2`)

---

## [0.0.1] – 2026-03-19

### Dodano

- Pierwsze działające MVP: formularz pobierania faktur z KSeF
- Obsługa środowisk: demo i produkcja
- Formaty eksportu: XML i PDF
- Szyfrowanie tokena KSeF lokalnie w przeglądarce (RSA-OAEP przez jsrsasign)
- Budowanie archiwum ZIP lokalnie w przeglądarce (jszip)
- Generowanie PDF z XML faktury lokalnie w przeglądarce
- Uruchomienie przez Docker Compose: frontend (nginx) + backend Express jako proxy
- Limit 50 faktur na eksport
