import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const howItWorksItems = [
  "Wklej Token KSeF: my bezpiecznie zaszyfrujemy go na Twoim komputerze.",
  "Wybierz filtry: wskaż NIP i zakres dat (np. marzec 2026).",
  "Pobierz ZIP: system błyskawicznie zbierze faktury i wygeneruje gotową paczkę XML lub PDF.",
];

const keyUxPoints = [
  "Szybkie szukanie: zapomnij o przeklikiwaniu rządowych portali. Znajdź fakturę w kilka sekund.",
  "Paczki ZIP: dostajesz od razu gotowy zbiór wszystkich dokumentów (XML lub PDF).",
  "Konwersja XML do PDF: automatycznie zamieniamy nieczytelne pliki w przyjazne dokumenty PDF.",
];

const comparisonRows = [
  {
    feature: "Pobieranie wielu faktur",
    government: "Ręcznie (po jednej)",
    ksefast: "Automatycznie (ZIP)",
  },
  {
    feature: "Podgląd faktury (PDF)",
    government: "Często wymaga klikania",
    ksefast: "Generowany od razu",
  },
  {
    feature: "Czas operacji",
    government: "Kilka-kilkanaście minut",
    ksefast: "30 sekund",
  },
  {
    feature: "Cena",
    government: "Darmowy",
    ksefast: "Darmowy (kawa opcjonalnie)",
  },
  {
    feature: "Otwartość na pomysły",
    government: "Nie",
    ksefast: "Tak, czytamy każdy mail",
  },
];

const faqItems = [
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

const ListPanel = ({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="subtitle2" color="secondary" gutterBottom>
        {title}
      </Typography>
      <Box
        component={ordered ? "ol" : "ul"}
        sx={{
          pl: 2.5,
          m: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {items.map((item) => (
          <Typography
            key={item}
            component="li"
            variant="body2"
            color="text.secondary"
          >
            {item}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
};

const QAPanel = () => {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };

  return (
    <Stack component="aside" spacing={2}>
      <Typography variant="h6" color="primary" fontWeight={600}>
        Pytania i odpowiedzi
      </Typography>

      <ListPanel title="Jak pobrać faktury w 3 krokach?" items={howItWorksItems} ordered />
      <ListPanel title="Dlaczego KSeFast ułatwi Ci życie?" items={keyUxPoints} />

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="secondary" gutterBottom>
          Tabela porównawcza
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1.5}>
          Rzuć okiem i porównaj, ile czasu oszczędzasz z KSeFast.
        </Typography>
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
            <Box component="thead">
              <Box component="tr">
                <Box
                  component="th"
                  sx={{ textAlign: "left", py: 0.9, pr: 0.8, borderBottom: "1px solid", borderColor: "divider" }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Funkcja
                  </Typography>
                </Box>
                <Box
                  component="th"
                  sx={{ textAlign: "left", py: 0.9, pr: 0.8, borderBottom: "1px solid", borderColor: "divider" }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Portal MF
                  </Typography>
                </Box>
                <Box
                  component="th"
                  sx={{ textAlign: "left", py: 0.9, borderBottom: "1px solid", borderColor: "divider" }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    KSeFast
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box component="tbody">
              {comparisonRows.map((row) => (
                <Box component="tr" key={row.feature}>
                  <Box
                    component="td"
                    sx={{ py: 1, pr: 0.8, borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.primary"
                      sx={{ lineHeight: 1.35, overflowWrap: "anywhere" }}
                    >
                      {row.feature}
                    </Typography>
                  </Box>
                  <Box
                    component="td"
                    sx={{ py: 1, pr: 0.8, borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.35, overflowWrap: "anywhere" }}
                    >
                      {row.government}
                    </Typography>
                  </Box>
                  <Box
                    component="td"
                    sx={{ py: 1, borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.primary"
                      fontWeight={700}
                      sx={{ lineHeight: 1.35, overflowWrap: "anywhere" }}
                    >
                      {row.ksefast}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Masz pomysl jak mozemy dzialac lepiej? Napisz na{" "}
          <Link href="mailto:contact@codelitehouse.com">contact@codelitehouse.com</Link>
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="secondary" gutterBottom>
          Bezpieczeństwo i Anonimowość
        </Typography>
        <Typography variant="body2" color="text.secondary">
          To proste: nie mamy dostępu do Twoich faktur. Nie przechowujemy ich
          na naszym serwerze. Wszystko odbywa się anonimowo i kończy na Twoim
          urządzeniu.
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Kod aplikacji jest publiczny i możesz go sprawdzić na{" "}
          <Link
            href="https://github.com/codelitehouse/ksefast"
            target="_blank"
            rel="noreferrer"
            sx={{ fontWeight: 700 }}
          >
            GitHub (Project verified ★★★★★)
          </Link>
          .
        </Typography>
      </Paper>
      <Paper sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", bgcolor: "background.paper" }}>
        <Typography variant="subtitle2" color="secondary" gutterBottom>
          Wesprzyj projekt
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Jeśli KSeFast zaoszczędził Twój czas, pomóż nam rozwijać projekt.
          Dziękujemy za każdą kawę!
        </Typography>
        <a
          href="https://buycoffee.to/codelitehouse"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 2px 8px 0 rgba(56,189,248,0.10)",
            transition: "box-shadow 0.2s",
            marginTop: 8,
          }}
        >
          <img
            src="https://buycoffee.to/static/img/share/share-button-dark.png"
            alt="Postaw mi kawę na buycoffee.to"
            style={{
              width: 136,
              height: 35,
              display: "block",
              filter: "brightness(0.95) saturate(1.1)",
            }}
          />
        </a>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="secondary" gutterBottom>
          FAQ
        </Typography>
        <Stack spacing={1.5}>
          {faqItems.map(({ q, a }) => (
            <Box key={q}>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {q}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {a}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
      {/* Safe: faqStructuredData is a static, hardcoded JS object serialized via
          JSON.stringify — no user input or external data ever reaches this value.
          dangerouslySetInnerHTML is the only correct way to inject JSON-LD structured
          data (SEO) into a <script> tag in React. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </Stack>
  );
};

export default QAPanel;
