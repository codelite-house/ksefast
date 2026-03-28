import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const howItWorksItems = [
  "Przeglądarka szyfruje token RSA-OAEP lokalnie przy użyciu klucza publicznego KSeF – token nigdy nie opuszcza Twojego urządzenia w postaci jawnego tekstu.",
  "Zaszyfrowane dane trafiają do KSeF przez serwer proxy (API KSeF blokuje bezpośrednie żądania z przeglądarki ze względu na CORS).",
  "Faktury XML pobierane są z KSeF przez proxy i przekazywane bezpośrednio do przeglądarki – serwer ich nie zapisuje.",
  "Jeśli wybrano PDF: każda faktura XML jest konwertowana do PDF lokalnie w przeglądarce – KSeF nie dostarcza faktur w formacie PDF.",
  "Paczka ZIP jest tworzona lokalnie i pobierana bezpośrednio na Twój komputer.",
];

const faqItems = [
  {
    q: "Czy mój token jest bezpieczny?",
    a: "Tak – szyfrowanie RSA-OAEP odbywa się lokalnie, token nigdy nie jest wysyłany w postaci jawnego tekstu.",
  },
  {
    q: "Dlaczego potrzebny jest serwer proxy?",
    a: "API KSeF blokuje żądania bezpośrednio z przeglądarki (brak nagłówka CORS). Proxy tylko przekazuje żądania, nic nie zapisuje.",
  },
  {
    q: "Skąd bierze się PDF?",
    a: "KSeF nie dostarcza faktur w PDF. Plik generowany jest lokalnie na podstawie XML faktury.",
  },
  {
    q: "Co to jest kontekst logowania?",
    a: "KSeF wymaga podania nie tylko tokena, ale też identyfikatora firmy (np. NIP), w imieniu której się logujesz.",
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

function ListPanel({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
}) {
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
}

export default function QAPanel() {
  return (
    <Stack component="aside" spacing={2}>
      <Typography variant="h6" color="primary" fontWeight={600}>
        Q&A / Instrukcje
      </Typography>

      <ListPanel title="Jak to działa?" items={howItWorksItems} ordered />

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="secondary" gutterBottom>
          Prywatność przede wszystkim
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Serwer proxy jest bezstanowy – nie posiada bazy danych i nie ma gdzie
          zapisać Twojego tokena ani faktur. Kod jest publicznie dostępny na
          GitHubie.
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          <strong>
            Każde zapytanie jest izolowane i niszczone natychmiast po
            przekazaniu odpowiedzi do przeglądarki.
          </strong>
        </Typography>
      </Paper>
      <Paper sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", bgcolor: "background.paper" }}>
        <Typography variant="subtitle2" color="secondary" gutterBottom>
          Wesprzyj projekt
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
    </Stack>
  );
}
