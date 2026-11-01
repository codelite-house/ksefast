export interface FaqItem {
  q: string;
  a: string;
}

export const faqItems: FaqItem[] = [
  {
    q: "Czy mój token jest bezpieczny?",
    a: "Tak. Token jest szyfrowany na Twoim urządzeniu, zanim zostanie wysłany.",
  },
  {
    q: "Czy moje dane są bezpieczne?",
    a: "Twoje faktury są u nas bezpieczniejsze niż w banku. Używamy tych samych standardów szyfrowania, które chronią przelewy internetowe.",
  },
  {
    q: "Czy muszę ręcznie pobierać każdą fakturę z KSeF?",
    a: "Nie. KSeFast robi to za Ciebie automatycznie i zbiera faktury w jedną paczkę.",
  },
  {
    q: "Dlaczego warto używać KSeFast zamiast oficjalnego portalu Ministerstwa Finansów?",
    a: "Oficjalny portal jest bezpieczny, ale bywa czasochłonny. KSeFast upraszcza to, co trudne: pobierasz zbiorczo cały miesiąc jednym kliknięciem, omijasz skomplikowane menu i wielokrotne logowanie, a na koniec dostajesz jedną uporządkowaną paczkę ZIP, którą wyślesz księgowej w 5 sekund.",
  },
  {
    q: "Czy dostanę powiadomienie o nowej fakturze?",
    a: "To funkcja, którą planujemy wdrożyć wkrótce. Docelowo nowe koszty mają wpadać do Ciebie jako szybkie powiadomienie, bez codziennego sprawdzania KSeF.",
  },
  {
    q: "Jak szybko znajdę konkretną fakturę?",
    a: "Bardzo szybko: np. fakturę od dostawcy X z marca znajdziesz w kilka sekund, bez przeklikiwania rządowych ekranów.",
  },
  {
    q: "Co z przekazaniem dokumentów do księgowej?",
    a: "Po pobraniu masz gotową paczkę ZIP (XML albo PDF), którą możesz od razu przekazać dalej.",
  },
  {
    q: "Jak pobrać faktury z KSeF do PDF?",
    a: "Wybierz format PDF i uruchom pobieranie. KSeFast automatycznie konwertuje XML do czytelnych dokumentów w kilka chwil.",
  },
  {
    q: "Ile to kosztuje?",
    a: "KSeFast jest darmowy. Jeśli oszczędza Ci czas, możesz wesprzeć rozwój projektu kawą w sekcji poniżej.",
  },
  {
    q: "Czy KSeFast pozwala na archiwizację faktur?",
    a: "Tak. Pobierając paczkę ZIP, tworzysz bezpieczną kopię zapasową dokumentów na własnym dysku.",
  },
  {
    q: "Skąd bierze się PDF?",
    a: "KSeF udostępnia faktury jako XML. KSeFast tworzy PDF lokalnie w Twojej przeglądarce.",
  },
  {
    q: "Co to jest kontekst logowania?",
    a: "To informacja, w czyim imieniu logujesz się do KSeF (np. NIP firmy).",
  },
  {
    q: "Ile faktur można pobrać na raz?",
    a: "Maksymalnie 50 faktur w jednej paczce.",
  },
  {
    q: "Czy dane są gdzieś zapisywane?",
    a: "Nie. Każde zapytanie jest izolowane – serwer proxy jest bezstanowy i nie posiada bazy danych.",
  },
];
