/**
 * Poradniki SEO. Te same dane renderuje React (GuidePage) i plugin w vite.config.ts,
 * który przy buildzie zapisuje statyczny HTML każdego poradnika (dla wyszukiwarek, bez JS).
 * Dlatego plik nie może importować niczego z Reacta ani MUI.
 */

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  steps?: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  /** Nagłówek h1. */
  title: string;
  /** <title> strony. */
  metaTitle: string;
  /** meta description – do ~160 znaków. */
  description: string;
  /** Krótka nazwa do list linków. */
  linkLabel: string;
  lead: string;
  sections: GuideSection[];
}

export const TOKEN_GUIDE_PATH = "/jak-wygenerowac-token-ksef";

export const guides: Guide[] = [
  {
    slug: "jak-wygenerowac-token-ksef",
    title: "Jak wygenerować token KSeF – krok po kroku",
    metaTitle: "Jak wygenerować token KSeF krok po kroku | KSeFast",
    description:
      "Token KSeF wygenerujesz w Aplikacji Podatnika KSeF w kilka minut. Instrukcja: logowanie, uprawnienie do przeglądania faktur, kopiowanie tokena.",
    linkLabel: "Jak wygenerować token KSeF",
    lead:
      "Token KSeF to ciąg znaków, którym program – np. KSeFast – loguje się do KSeF w imieniu Twojej firmy. Generujesz go sam, raz, w oficjalnej aplikacji Ministerstwa Finansów, i możesz go używać wielokrotnie.",
    sections: [
      {
        heading: "Zanim zaczniesz",
        bullets: [
          "Potrzebujesz dostępu do KSeF w kontekście firmy: Profil Zaufany, e-dowód, podpis kwalifikowany albo pieczęć kwalifikowana.",
          "Jeśli nie jesteś właścicielem firmy, właściciel musi najpierw nadać Ci w KSeF uprawnienia do faktur.",
        ],
      },
      {
        heading: "Generowanie tokena w Aplikacji Podatnika KSeF",
        steps: [
          "Wejdź do Aplikacji Podatnika KSeF (ap.ksef.mf.gov.pl) i zaloguj się w kontekście firmy, czyli jej NIP-u.",
          "W menu wybierz „Tokeny” i rozpocznij tworzenie nowego tokena.",
          "Wpisz dowolną nazwę, np. „KSeFast – pobieranie faktur”. Nazwa pomoże Ci później rozpoznać token na liście.",
          "Zaznacz uprawnienie do przeglądania faktur. Do pobierania faktur nic więcej nie trzeba – nie zaznaczaj wystawiania faktur ani zarządzania uprawnieniami.",
          "Kliknij „Generuj token” i od razu skopiuj token. Aplikacja pokazuje go tylko raz.",
          "Wklej token w formularzu KSeFast razem z NIP-em firmy, wybierz miesiąc i pobierz faktury.",
        ],
      },
      {
        heading: "Jak bezpiecznie przechowywać token",
        bullets: [
          "Trzymaj token w menedżerze haseł, nie w mailu ani w notatce na pulpicie.",
          "Token tylko do przeglądania faktur nie pozwala wystawić faktury ani zmienić uprawnień – to najbezpieczniejszy wybór.",
          "Jeśli token wycieknie, unieważnij go w zakładce „Tokeny” i wygeneruj nowy.",
          "KSeFast szyfruje token w Twojej przeglądarce kluczem publicznym Ministerstwa Finansów i nigdzie go nie zapisuje.",
        ],
      },
      {
        heading: "Najczęstsze problemy",
        bullets: [
          "Nie widzę zakładki „Tokeny” – nie masz uprawnień w tym kontekście. Poproś właściciela firmy o ich nadanie.",
          "Stary token nie działa – tokeny z KSeF 1.0 nie są zgodne z KSeF 2.0. Wygeneruj nowy.",
          "Zmieniły się moje uprawnienia – token się nie aktualizuje. Unieważnij go i wygeneruj nowy.",
          "Zgubiłem token – nie da się go wyświetlić ponownie. Unieważnij stary i wygeneruj nowy.",
        ],
      },
      {
        heading: "Czy tokeny będą działać w kolejnych latach?",
        paragraphs: [
          "Ministerstwo Finansów zapowiadało zastąpienie tokenów certyfikatami KSeF, a później zaproponowało ich utrzymanie. Zasady mogą się jeszcze zmienić, więc śledź komunikaty na ksef.podatki.gov.pl.",
        ],
      },
    ],
  },
  {
    slug: "jak-pobrac-faktury-z-ksef",
    title: "Jak pobrać wszystkie faktury z KSeF naraz",
    metaTitle: "Jak pobrać wszystkie faktury z KSeF naraz (ZIP) | KSeFast",
    description:
      "Pobierz wszystkie faktury z KSeF za wybrany miesiąc jedną paczką ZIP – w XML albo PDF. Za darmo, bez rejestracji i bez klikania po jednej fakturze.",
    linkLabel: "Jak pobrać wszystkie faktury z KSeF",
    lead:
      "W oficjalnej aplikacji Ministerstwa Finansów faktury pobierasz pojedynczo. Przy kilkudziesięciu fakturach miesięcznie to długie klikanie. KSeFast pobiera cały miesiąc naraz i oddaje jedną paczkę ZIP.",
    sections: [
      {
        heading: "Pobieranie krok po kroku",
        steps: [
          "Wygeneruj token KSeF z uprawnieniem do przeglądania faktur (instrukcja w poradniku o tokenie).",
          "Na ksefast.pl wklej token i wpisz NIP firmy.",
          "Wybierz miesiąc oraz rodzaj faktur: zakupowe, sprzedażowe albo obie naraz.",
          "Wybierz format: XML (oryginał z KSeF) albo PDF (do czytania i druku).",
          "Kliknij „Pobierz”. Gotowa paczka ZIP trafi do folderu pobranych plików.",
        ],
      },
      {
        heading: "Faktury zakupowe i sprzedażowe w jednej paczce",
        paragraphs: [
          "KSeFast może pobrać faktury otrzymane i wystawione w jednym przebiegu. Dostajesz jeden plik ZIP, który możesz od razu przekazać księgowej albo odłożyć do archiwum.",
        ],
      },
      {
        heading: "Ile to trwa?",
        paragraphs: [
          "Lista faktur pobiera się w kilka sekund. Samo pobieranie faktur ogranicza KSeF – obecnie 16 faktur na minutę i 64 na godzinę. Kilkadziesiąt faktur pobierzesz w kilka minut, a przy większej liczbie KSeFast sam pilnuje limitów i pozwala dociągnąć brakujące później.",
        ],
      },
      {
        heading: "Czy to bezpieczne?",
        bullets: [
          "Token jest szyfrowany w przeglądarce i nigdzie nie jest zapisywany.",
          "Paczka ZIP i pliki PDF powstają na Twoim komputerze, serwer niczego nie przechowuje.",
          "Kod KSeFast jest otwarty – możesz go sprawdzić na GitHubie albo uruchomić u siebie.",
        ],
      },
    ],
  },
  {
    slug: "faktury-ksef-do-pdf",
    title: "Faktury z KSeF do PDF – jak zamienić XML na PDF",
    metaTitle: "Faktury z KSeF do PDF – darmowa zamiana XML na PDF | KSeFast",
    description:
      "KSeF udostępnia faktury tylko w XML. Zamień je hurtem na czytelne PDF – lokalnie w przeglądarce, oficjalnym generatorem Ministerstwa Finansów.",
    linkLabel: "Faktury z KSeF do PDF",
    lead:
      "KSeF przechowuje faktury jako pliki XML. Komputer czyta je bez problemu, człowiek już nie. Jeśli chcesz fakturę wydrukować, przejrzeć albo wysłać komuś spoza KSeF, potrzebujesz PDF-a.",
    sections: [
      {
        heading: "Jak pobrać faktury z KSeF od razu jako PDF",
        steps: [
          "Na ksefast.pl wklej token KSeF i NIP firmy.",
          "Wybierz miesiąc i rodzaj faktur.",
          "Jako format wybierz PDF.",
          "Kliknij „Pobierz” – dostaniesz paczkę ZIP z fakturami w PDF.",
        ],
      },
      {
        heading: "Jak powstaje PDF",
        paragraphs: [
          "KSeFast zamienia XML na PDF w Twojej przeglądarce za pomocą oficjalnego generatora Ministerstwa Finansów (CIRFMF/ksef-pdf-generator). Faktura wygląda tak samo jak wizualizacja w aplikacji MF i zawiera kod QR do weryfikacji w KSeF.",
        ],
      },
      {
        heading: "Czy PDF to oryginał faktury?",
        paragraphs: [
          "Nie. Oryginałem faktury ustrukturyzowanej jest plik XML zapisany w KSeF, a PDF to jego czytelna wizualizacja. Do archiwum najlepiej zachować XML, a PDF wykorzystywać do czytania, druku i wysyłki.",
        ],
      },
    ],
  },
  {
    slug: "limit-pobierania-faktur-ksef",
    title: "Limit pobierania faktur w KSeF i błąd 429",
    metaTitle: "Limit pobierania faktur KSeF i błąd 429 – co zrobić | KSeFast",
    description:
      "KSeF pozwala pobrać 16 faktur na minutę i 64 na godzinę. Co oznacza błąd 429 i jak pobrać więcej faktur bez ręcznego pilnowania limitów.",
    linkLabel: "Limit pobierania faktur KSeF (błąd 429)",
    lead:
      "Jeśli przy pobieraniu faktur z KSeF widzisz błąd 429 albo komunikat o zbyt wielu żądaniach, to nie awaria. KSeF celowo ogranicza liczbę pobrań.",
    sections: [
      {
        heading: "Jakie są limity",
        bullets: [
          "Obecnie 16 pobranych faktur na minutę.",
          "Obecnie 64 pobrane faktury na godzinę.",
          "Limity dotyczą pobierania treści faktur. Sama lista faktur pobiera się szybko.",
        ],
      },
      {
        heading: "Co oznacza błąd 429",
        paragraphs: [
          "Kod 429 (Too Many Requests) oznacza, że w danym oknie czasu wykorzystano limit. KSeF odpowiada wtedy, po jakim czasie można spróbować ponownie.",
        ],
      },
      {
        heading: "Jak KSeFast radzi sobie z limitami",
        bullets: [
          "Robi pauzy między fakturami (ok. 4,5 sekundy), żeby nie przekroczyć limitu minutowego.",
          "Po błędzie 429 czeka i ponawia pobieranie.",
          "Gdy wyczerpie się limit godzinowy, oddaje paczkę z tym, co już pobrano, i listą brakujących faktur w pliku BRAKUJACE.txt.",
          "Przycisk „Dociągnij brakujące” pobiera resztę, gdy KSeF znów na to pozwoli.",
        ],
      },
      {
        heading: "Ile potrwa pobranie dużej liczby faktur",
        paragraphs: [
          "Do 64 faktur zmieścisz się w kilku minutach. 200 faktur to ok. 3 godziny ze względu na limit godzinowy. Jeśli masz dużo dokumentów, pobieraj je co miesiąc zaraz po jego zakończeniu albo wybieraj krótsze okresy.",
        ],
      },
    ],
  },
  {
    slug: "faktury-ksef-dla-ksiegowej",
    title: "Jak przekazać faktury z KSeF księgowej",
    metaTitle: "Jak przekazać faktury z KSeF księgowej | KSeFast",
    description:
      "Najprostszy sposób, żeby co miesiąc przekazać księgowej faktury z KSeF: jedna paczka ZIP z XML albo PDF. Za darmo, bez zakładania kont.",
    linkLabel: "Faktury z KSeF dla księgowej",
    lead:
      "Od wejścia KSeF faktury nie przychodzą już mailem jako PDF. Księgowa może pobierać je sama albo możesz co miesiąc przekazać jej gotową paczkę.",
    sections: [
      {
        heading: "Sposób 1: księgowa pobiera faktury sama",
        paragraphs: [
          "Możesz nadać księgowej lub biuru rachunkowemu uprawnienia do faktur Twojej firmy w KSeF. Wtedy biuro pobiera faktury samo, np. własnym programem albo KSeFast z tokenem wygenerowanym w kontekście Twojego NIP-u.",
        ],
      },
      {
        heading: "Sposób 2: wysyłasz paczkę ZIP",
        steps: [
          "Na ksefast.pl wklej swój token KSeF i NIP.",
          "Wybierz zakończony miesiąc i zaznacz faktury zakupowe i sprzedażowe.",
          "Wybierz format, którego używa Twoja księgowa – zwykle XML do programu księgowego albo PDF do wglądu.",
          "Pobierz paczkę ZIP i prześlij ją księgowej.",
        ],
      },
      {
        heading: "Dla biur rachunkowych",
        paragraphs: [
          "Jeśli prowadzisz wielu klientów, KSeFast pozwala pobrać miesiąc dla każdego NIP-u w kilka kliknięć – bez instalowania programu i bez zakładania konta. Wystarczy token klienta albo token wygenerowany w kontekście klienta na podstawie nadanych biuru uprawnień.",
        ],
      },
    ],
  },
  {
    slug: "faktury-zakupowe-ksef",
    title: "Gdzie znaleźć faktury zakupowe w KSeF",
    metaTitle: "Faktury zakupowe w KSeF – gdzie je znaleźć i jak pobrać | KSeFast",
    description:
      "Faktury od dostawców trafiają do KSeF, a nie na Twoją skrzynkę. Sprawdź, gdzie je znaleźć i jak pobrać wszystkie faktury zakupowe za miesiąc naraz.",
    linkLabel: "Gdzie znaleźć faktury zakupowe w KSeF",
    lead:
      "Gdy dostawca wystawia fakturę w KSeF, ona już tam na Ciebie czeka – nie musi przyjść mailem. Żeby ją zaksięgować, trzeba ją z KSeF pobrać.",
    sections: [
      {
        heading: "Faktura zakupowa w KSeF, czyli Ty jako nabywca",
        paragraphs: [
          "Każda faktura w KSeF ma sprzedawcę (Podmiot 1) i nabywcę (Podmiot 2), a czasem także inne podmioty (Podmiot 3). Faktury zakupowe to te, na których Twoja firma występuje jako nabywca. KSeF udostępnia je Tobie od razu po przyjęciu faktury od sprzedawcy.",
        ],
      },
      {
        heading: "Jak pobrać wszystkie faktury zakupowe za miesiąc",
        steps: [
          "Na ksefast.pl wklej token KSeF i NIP firmy.",
          "W polu „Co pobrać?” wybierz „Faktury zakupu” – albo obie strony naraz, jeśli potrzebujesz też sprzedaży.",
          "Wybierz miesiąc i format (XML albo PDF).",
          "Kliknij „Pobierz” i odbierz paczkę ZIP.",
        ],
      },
      {
        heading: "Których faktur zakupowych nie będzie w KSeF",
        paragraphs: [
          "Część dokumentów zakupowych nadal przyjdzie mailem albo papierowo i trzeba je zbierać osobno. Dotyczy to m.in.:",
        ],
        bullets: [
          "faktur od zagranicznych dostawców bez polskiego obowiązku KSeF,",
          "paragonów i faktur do paragonów wystawianych poza KSeF, tam gdzie przepisy na to pozwalają,",
          "faktur od firm, które jeszcze nie muszą wystawiać faktur w KSeF.",
        ],
      },
    ],
  },
  {
    slug: "archiwizacja-faktur-ksef",
    title: "Archiwizacja faktur z KSeF – czy trzeba i jak to zrobić",
    metaTitle: "Archiwizacja faktur z KSeF – czy trzeba trzymać kopię? | KSeFast",
    description:
      "KSeF przechowuje faktury przez 10 lat, ale własna kopia nadal się przydaje. Jak co miesiąc zarchiwizować faktury z KSeF w XML i PDF jednym kliknięciem.",
    linkLabel: "Archiwizacja faktur z KSeF",
    lead:
      "Faktury wystawione w KSeF są przechowywane w systemie Ministerstwa Finansów przez 10 lat, licząc od końca roku, w którym je wystawiono. Mimo to wiele firm trzyma własną kopię.",
    sections: [
      {
        heading: "Po co własna kopia, skoro KSeF przechowuje faktury",
        bullets: [
          "Dostęp do KSeF wymaga ważnego tokena albo certyfikatu i działającego systemu – własne archiwum masz zawsze pod ręką.",
          "Przy zmianie programu księgowego albo biura rachunkowego łatwo przekazać komplet dokumentów.",
          "Przy kontroli czy sporze z kontrahentem szybko znajdziesz fakturę bez logowania do KSeF.",
          "Faktury spoza KSeF (np. zagraniczne) i tak trzeba przechowywać samodzielnie – dobrze mieć wszystko w jednym miejscu.",
        ],
      },
      {
        heading: "Jak archiwizować faktury co miesiąc",
        steps: [
          "Po zakończeniu miesiąca wejdź na ksefast.pl i wklej token oraz NIP.",
          "Zaznacz faktury zakupowe i sprzedażowe.",
          "Wybierz XML – to oryginał faktury. Jeśli chcesz też wersję do czytania, pobierz drugi raz w PDF.",
          "Zapisz paczkę ZIP w stałym miejscu, np. w folderze „Faktury/2026/10”, i zrób jej kopię zapasową.",
        ],
      },
      {
        heading: "Co jest w paczce",
        paragraphs: [
          "Oprócz faktur paczka zawiera plik manifest.json z listą dokumentów: numer KSeF, numer faktury, daty i kwotę brutto. Ułatwia to późniejsze wyszukiwanie i sprawdzenie, czy archiwum jest kompletne.",
        ],
      },
    ],
  },
  {
    slug: "jak-otworzyc-xml-faktury-ksef",
    title: "Jak otworzyć plik XML faktury z KSeF",
    metaTitle: "Jak otworzyć plik XML faktury z KSeF i zamienić go na PDF | KSeFast",
    description:
      "Plik XML z KSeF otworzysz w przeglądarce, ale trudno go przeczytać. Zobacz, jak wyświetlić fakturę z KSeF czytelnie i zamienić wiele plików XML na PDF.",
    linkLabel: "Jak otworzyć XML faktury z KSeF",
    lead:
      "Faktura z KSeF to plik XML – dane zapisane w strukturze, którą łatwo czyta program księgowy, ale nie człowiek. Oto, jak zobaczyć ją w normalnej postaci.",
    sections: [
      {
        heading: "Dlaczego XML wygląda jak kod",
        paragraphs: [
          "Plik XML da się otworzyć w przeglądarce albo Notatniku, ale zobaczysz w nim znaczniki i pola zamiast układu faktury. To normalne – wygląd faktury powstaje dopiero przy wizualizacji, np. do PDF.",
        ],
      },
      {
        heading: "Trzy sposoby na czytelną fakturę",
        bullets: [
          "Program księgowy lub do fakturowania – większość importuje XML z KSeF i pokazuje fakturę na ekranie.",
          "Aplikacja Podatnika KSeF Ministerstwa Finansów – pokaże wizualizację pojedynczej faktury.",
          "KSeFast – pobierze z KSeF cały miesiąc od razu jako PDF, oficjalnym generatorem MF.",
        ],
      },
      {
        heading: "Wiele faktur naraz",
        steps: [
          "Na ksefast.pl wklej token KSeF i NIP.",
          "Wybierz miesiąc i format PDF.",
          "Pobierz paczkę ZIP – każda faktura będzie osobnym, czytelnym plikiem PDF.",
        ],
      },
    ],
  },
  {
    slug: "kod-qr-numer-ksef-faktury",
    title: "Kod QR i numer KSeF na fakturze – do czego służą",
    metaTitle: "Kod QR i numer KSeF na fakturze – weryfikacja faktury | KSeFast",
    description:
      "Co oznacza numer KSeF i kod QR na wizualizacji faktury, jak sprawdzić, czy faktura naprawdę jest w KSeF, i jak pobrać PDF-y z kodem QR.",
    linkLabel: "Kod QR i numer KSeF na fakturze",
    lead:
      "Na fakturze wydrukowanej albo zapisanej jako PDF z KSeF zobaczysz numer KSeF i kod QR. Dzięki nim każdy może sprawdzić, czy faktura istnieje w systemie Ministerstwa Finansów.",
    sections: [
      {
        heading: "Numer KSeF",
        paragraphs: [
          "To unikalny identyfikator, który KSeF nadaje fakturze w chwili jej przyjęcia. Zawiera m.in. NIP sprzedawcy i datę przyjęcia faktury. Numer KSeF przydaje się przy płatnościach, korektach i kontaktach z księgową.",
        ],
      },
      {
        heading: "Kod QR",
        paragraphs: [
          "Kod QR na wizualizacji faktury prowadzi do usługi weryfikacji Ministerstwa Finansów. Po zeskanowaniu telefonem zobaczysz, czy faktura o takich danych znajduje się w KSeF. To szybki sposób, żeby odróżnić prawdziwą fakturę od podróbki, np. w phishingu.",
        ],
      },
      {
        heading: "PDF-y z kodem QR",
        paragraphs: [
          "KSeFast generuje PDF-y oficjalnym generatorem Ministerstwa Finansów i dodaje do nich numer KSeF oraz kod QR weryfikacji. Możesz je drukować i przekazywać dalej tak jak wizualizacje z aplikacji MF.",
        ],
      },
    ],
  },
];

export const findGuide = (pathname: string): Guide | undefined => {
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  return guides.find((guide) => guide.slug === slug);
};
