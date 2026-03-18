# KSeFast

Prosty MVP do pobierania paczek faktur z KSeF.

## Co robi

- loguje się do KSeF przy użyciu tokena KSeF,
- pobiera listę faktur dla wskazanego zakresu dat,
- buduje paczkę ZIP z fakturami w formacie XML albo PDF,
- opcjonalnie zapisuje e-mail do prostego pliku mailingowego,
- nie zapisuje tokena KSeF poza czasem pojedynczego żądania.

## Stack

- frontend: React + Vite + TypeScript,
- backend: Node.js + Express + TypeScript,
- PDF: `@mdab25/ksef-pdf`.

## Ważne założenia MVP

- KSeF wymaga tokena **i** identyfikatora kontekstu logowania, np. NIP-u.
- Ten MVP pobiera faktury pojedynczo przez API `invoices/ksef/{ksefNumber}` i sam buduje ZIP.
- Zakres dat powinien być wąski. Domyślny limit aplikacji to 50 faktur na paczkę.
- E-maile trafiają lokalnie do pliku `backend/data/leads.jsonl`.

## Uruchomienie

1. Zainstaluj zależności:
   - `npm install`
2. Uruchom development:
   - `npm run dev`
3. Otwórz frontend:
   - `http://localhost:5173`

## Build

- `npm run build`
- `npm run start`

## Docker Compose

- build i start kontenerów:
   - `docker compose up --build`
- frontend będzie dostępny pod:
   - `http://localhost:8080`
- frontend reverse-proxy kieruje `/api` do backendu,
- dane mailingowe są trzymane w wolumenie `backend_data`.

## Konfiguracja

Backend czyta opcjonalne zmienne środowiskowe z `.env`:

- `PORT=3001`
- `MAX_INVOICES_PER_EXPORT=50`
- `LEADS_FILE_PATH=backend/data/leads.jsonl`

Frontend może używać:

- `VITE_API_BASE_URL=http://localhost:3001`

W wariancie Docker Compose nie trzeba ustawiać `VITE_API_BASE_URL`, bo frontend korzysta z lokalnego proxy nginx.

## Główne endpointy backendu

- `GET /api/health`
- `POST /api/download`

## Status

Projekt jest przygotowany jako szybki starter MVP pod dalsze dopracowanie UX, limitów i pełnej obsługi większych eksportów.
