# Changelog

Wszystkie istotne zmiany w projekcie są dokumentowane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/).

---

## [Nieudostępnione]

### Dodano

- Licencja MIT (`LICENSE`) dla projektu
- `CONTRIBUTING.md` – wytyczne dla kontrybutorów po polsku
- `SECURITY.md` – polityka bezpieczeństwa i zgłaszania luk po polsku
- Szablony zgłoszeń GitHub Issues po polsku (błędy, propozycje funkcji)

### Zmieniono

- `README.md` – przebudowany pod open source: badge licencja/release, diagram architektury, sekcje Contributing / Security / Licencja, instrukcja dev bez Dockera
- Atrybucja vendora `@akmf/ksef-fe-invoice-converter` w README – dodano nazwę pakietu npm i rok copyright
- Komunikat w panelu kontaktowym uproszczono do jasnego zaproszenia do wypelnienia formularza

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
