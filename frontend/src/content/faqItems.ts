export interface FaqItem {
  q: string;
  a: string;
}

export const faqItems: FaqItem[] = [
  {
    q: "Czy mój token jest bezpieczny?",
    a: "Token jest szyfrowany w Twojej przeglądarce (RSA-OAEP, kluczem publicznym Ministerstwa Finansów), zanim opuści Twój komputer. Serwer pośredniczący dostaje tylko zaszyfrowaną wartość, której nie odczyta – odszyfrować ją może wyłącznie KSeF. KSeFast nie zapisuje tokena ani na serwerze, ani w przeglądarce. Przez serwer przechodzi natomiast tymczasowy token sesji KSeF, potrzebny do pobrania faktur – serwer go nie zapisuje.",
  },
  {
    q: "Czy dane są gdzieś zapisywane?",
    a: "Nie. Serwer pośredniczący jest bezstanowy i nie ma bazy danych. Istnieje tylko dlatego, że API KSeF nie pozwala na zapytania wprost z przeglądarki, więc faktury przechodzą przez niego w drodze do Ciebie (szyfrowane TLS). Paczka ZIP (i PDF) powstaje w Twojej przeglądarce i trafia od razu na Twój dysk. Jeśli wolisz, żeby faktury nie przechodziły przez żaden cudzy serwer, uruchom KSeFast u siebie albo użyj lokalnego CLI.",
  },
  {
    q: "Dlaczego warto używać KSeFast zamiast oficjalnego portalu Ministerstwa Finansów?",
    a: "Oficjalny portal jest bezpieczny, ale pobieranie wielu faktur wymaga klikania po jednej. KSeFast pobiera cały wybrany miesiąc jednym kliknięciem i oddaje jedną paczkę ZIP, którą możesz od razu wysłać księgowej.",
  },
  {
    q: "Skąd wziąć token KSeF?",
    a: "Token generujesz samodzielnie w oficjalnym portalu KSeF po zalogowaniu na konto firmy. Powinien mieć uprawnienie do odczytu faktur. Krok po kroku opisuje to instrukcja Ministerstwa Finansów na podatki.gov.pl/ksef.",
  },
  {
    q: "Jak pobrać faktury z KSeF do PDF?",
    a: "Wybierz format PDF i uruchom pobieranie. KSeF udostępnia faktury wyłącznie jako XML, więc KSeFast zamienia je na PDF lokalnie w Twojej przeglądarce, za pomocą oficjalnej biblioteki Ministerstwa Finansów.",
  },
  {
    q: "Co to jest kontekst logowania?",
    a: "To informacja, w czyim imieniu logujesz się do KSeF – zwykle NIP firmy. W formularzu wpisujesz po prostu NIP, a inne rodzaje identyfikatorów znajdziesz w opcjach zaawansowanych.",
  },
  {
    q: "Ile faktur można pobrać na raz?",
    a: "Pobierasz cały wybrany miesiąc naraz. KSeF ogranicza jednak liczbę pobrań faktur (obecnie 16 na minutę i 64 na godzinę), więc przy dużej liczbie dokumentów pobieranie trwa dłużej. Po wyczerpaniu limitu godzinowego dostajesz paczkę z tym, co już pobrano, a brakujące faktury dociągniesz jednym przyciskiem, gdy KSeF znów pozwoli.",
  },
  {
    q: "Co z przekazaniem dokumentów do księgowej?",
    a: "Po pobraniu masz gotową paczkę ZIP (XML albo PDF), którą możesz od razu przekazać dalej.",
  },
  {
    q: "Ile to kosztuje?",
    a: "KSeFast jest darmowy. Jeśli oszczędza Ci czas, możesz wesprzeć rozwój projektu kawą w sekcji poniżej.",
  },
];
