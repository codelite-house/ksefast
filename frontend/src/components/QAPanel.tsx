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
  "Czy mój token jest bezpieczny? Tak – szyfrowanie RSA-OAEP odbywa się lokalnie, token nigdy nie jest wysyłany w postaci jawnego tekstu.",
  "Dlaczego potrzebny jest serwer proxy? API KSeF blokuje żądania bezpośrednio z przeglądarki (brak nagłówka CORS). Proxy tylko przekazuje żądania, nic nie zapisuje.",
  "Skąd bierze się PDF? KSeF nie dostarcza faktur w PDF. Plik generowany jest lokalnie na podstawie XML faktury.",
  "Co to jest kontekst logowania? KSeF wymaga podania nie tylko tokena, ale też identyfikatora firmy (np. NIP), w imieniu której się logujesz.",
  "Ile faktur można pobrać na raz? Maksymalnie 50 faktur w jednej paczce.",
  "Czy dane są gdzieś zapisywane? Nie. Każde zapytanie jest izolowane – serwer proxy jest bezstanowy i nie posiada bazy danych.",
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

      <ListPanel title="FAQ" items={faqItems} />
    </Stack>
  );
}
