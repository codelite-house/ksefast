# Change log

## 2026-03-19

### Initial MVP scaffold
- utworzono strukturę workspace z pakietami `frontend` i `backend`,
- dodano konfigurację root `package.json`, `.gitignore`, `.editorconfig` i pliki środowiskowe przykładowe,
- skonfigurowano frontend w React + Vite + TypeScript,
- skonfigurowano backend w Express + TypeScript.

### Backend
- dodano endpoint `GET /api/health`,
- dodano endpoint `POST /api/download`,
- wdrożono walidację wejścia dla tokena, kontekstu, zakresu dat i formatu,
- wdrożono logowanie do KSeF przez challenge + token KSeF,
- wdrożono pobieranie metadanych faktur i pobieranie XML po numerze KSeF,
- dodano budowanie archiwum ZIP dla XML i PDF,
- dodano generowanie PDF przez `@mdab25/ksef-pdf`,
- dodano lokalny zapis opcjonalnych e-maili do `backend/data/leads.jsonl`.

### Frontend
- dodano prosty landing page i formularz pobierania,
- dodano wybór środowiska, typu kontekstu, typu daty i formatu eksportu,
- dodano obsługę pobierania ZIP z backendu,
- dodano komunikaty sukcesu i błędów,
- dodano sekcje „Kim jesteśmy” i „Kup nam kawę”.

### Dokumentacja i weryfikacja
- dodano `README.md` z instrukcją uruchomienia i konfiguracji,
- zainstalowano zależności projektu,
- potwierdzono poprawny build aplikacji,
- potwierdzono działanie endpointu health backendu.

### Docker
- dodano `docker-compose.yml`,
- dodano `backend/Dockerfile` do budowy i uruchamiania API,
- dodano `frontend/Dockerfile` oraz `frontend/nginx.conf` do serwowania frontendu i proxy `/api`,
- dodano `.dockerignore`,
- zaktualizowano frontend tak, żeby działał bez jawnego `VITE_API_BASE_URL` w Docker Compose.

### Repo hygiene
- rozszerzono `.gitignore` o wygenerowane artefakty TypeScript,
- usunięto wygenerowane pliki pomocnicze z frontendu przed pierwszym commitem.

---

## Zasada aktualizacji
Dopisuj w tym pliku każdą istotną zmianę:
- datę,
- zakres zmian,
- backend / frontend / dokumentacja,
- krótką informację co zostało dodane, poprawione albo usunięte.
