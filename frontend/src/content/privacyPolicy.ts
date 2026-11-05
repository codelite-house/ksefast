export const PRIVACY_POLICY_PATH = "/polityka-prywatnosci";

export const PRIVACY_POLICY_UPDATED = "2026-11-04";

/** Operator wersji hostowanej ksefast.pl (te same dane co w polityce Contact Admin). */
export const OPERATOR = {
  name: "IT Solutions Grzegorz Krzesiński",
  brand: "Codelite House",
  address: "ul. Złota 27, Obłotne",
  nip: "9730885518",
  email: "contact@codelitehouse.com",
} as const;

export interface PolicySection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export const privacyPolicySections: PolicySection[] = [
  {
    title: "1. Administrator",
    paragraphs: [
      `Administratorem danych osobowych przetwarzanych w serwisie ksefast.pl jest ${OPERATOR.name} (marka ${OPERATOR.brand}), ${OPERATOR.address}, NIP ${OPERATOR.nip}.`,
      `W sprawach danych osobowych pisz na ${OPERATOR.email}.`,
    ],
  },
  {
    title: "2. Pobieranie faktur z KSeF",
    paragraphs: [
      "API KSeF nie przyjmuje zapytań wprost ze strony internetowej (CORS), dlatego Twoja przeglądarka łączy się z KSeF przez nasz serwer pośredniczący. W trakcie pobierania przechodzą przez niego, w połączeniu szyfrowanym TLS:",
    ],
    bullets: [
      "Twój token KSeF – zaszyfrowany w przeglądarce kluczem publicznym Ministerstwa Finansów, zanim zostanie wysłany. Odszyfrować go może tylko KSeF, nasz serwer nie zna jego treści.",
      "tymczasowe tokeny sesji KSeF (token uwierzytelnienia i token dostępowy), w nagłówkach żądań w postaci jawnej – bez nich serwer nie mógłby przekazać zapytań do KSeF,",
      "identyfikator firmy (np. NIP), a także lista i treść pobieranych faktur (XML). Faktury mogą zawierać dane osobowe, np. imiona, nazwiska i adresy przedsiębiorców lub nabywców.",
    ],
  },
  {
    title: "3. Czego serwer nie robi z danymi faktur",
    paragraphs: [
      "Serwer nie zapisuje tych danych na dysku ani w bazie (nie ma bazy danych), nie zapisuje ich treści w logach i przekazuje je wyłącznie do KSeF oraz z powrotem do Twojej przeglądarki. Długoterminowy token odświeżania sesji KSeF zostaje na serwerze i nie trafia do przeglądarki. Paczka ZIP i pliki PDF powstają w Twojej przeglądarce.",
      "Dane z faktur przetwarzamy wyłącznie na Twoje polecenie i tylko przez czas pobierania. Administratorem danych zawartych w Twoich fakturach pozostajesz Ty, a my działamy w Twoim imieniu jako podmiot przetwarzający (art. 28 RODO). Podstawą jest wykonanie usługi, o którą prosisz (art. 6 ust. 1 lit. b RODO).",
      "Jeśli nie chcesz, żeby dane przechodziły przez nasz serwer, uruchom KSeFast u siebie (docker compose up) albo użyj lokalnego CLI, które łączy się z KSeF bezpośrednio. Instrukcja jest w repozytorium projektu.",
    ],
  },
  {
    title: "4. Formularz kontaktowy",
    paragraphs: [
      "Gdy piszesz do nas przez formularz, przetwarzamy imię i nazwisko, adres e-mail, treść wiadomości, jej typ oraz adres podstrony, z której ją wysłano.",
    ],
    bullets: [
      "cel: odpowiedź na wiadomość i obsługa zgłoszenia,",
      "podstawa: nasz prawnie uzasadniony interes w odpowiadaniu na wiadomości (art. 6 ust. 1 lit. f RODO),",
      "odbiorca: nasz system obsługi zgłoszeń (Contact Service) na serwerach Contabo GmbH w Unii Europejskiej (Francja),",
      "okres: przez czas obsługi sprawy, a potem nie dłużej niż 24 miesiące od jej zamknięcia,",
      "podanie danych jest dobrowolne, ale bez adresu e-mail nie odpowiemy.",
    ],
  },
  {
    title: "5. Logi techniczne",
    paragraphs: [
      "Serwery, na których działa ksefast.pl, zapisują techniczne logi żądań: adres IP, czas, ścieżkę żądania (bez parametrów, czyli bez numerów faktur i NIP-u), kod odpowiedzi oraz informację o przeglądarce. Służą do zapewnienia bezpieczeństwa i diagnozowania awarii (art. 6 ust. 1 lit. f RODO) i są usuwane automatycznie po 7 dniach.",
    ],
  },
  {
    title: "6. Pliki cookies i analityka",
    paragraphs: [
      "Strona nie używa plików cookies, narzędzi analitycznych ani pamięci przeglądarki do zapisywania Twoich danych.",
    ],
  },
  {
    title: "7. Twoje prawa",
    paragraphs: ["Masz prawo do:"],
    bullets: [
      "dostępu do swoich danych i otrzymania ich kopii,",
      "sprostowania danych,",
      "usunięcia danych,",
      "ograniczenia przetwarzania,",
      "sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie,",
      "wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl).",
    ],
  },
];
