import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const howItWorksItems = [
  "Wszystkie operacje odbywają się w Twojej przeglądarce.",
  "Token nigdy nie jest wysyłany na zewnętrzne serwery.",
  "XML pobierany jest bezpośrednio z API KSeF.",
  "Paczka jest tworzona lokalnie i pobierana na Twój komputer.",
];

const faqItems = [
  "Token trzymany wyłącznie w Twojej przeglądarce podczas sesji.",
  "Prosty eksport XML lub PDF.",
  "Bez przesyłania danych na zewnętrzne serwery.",
  "Bezpośrednia komunikacja z API KSeF.",
  "Jedna paczka obsługuje maksymalnie 50 faktur.",
  "KSeF wymaga nie tylko tokena, ale też identyfikatora kontekstu logowania, np. NIP-u firmy.",
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
          Narzędzie działa z technologią Edge Computing. Kod przesyłający Twoje
          dane jest publiczny, nie posiada połączenia z bazą danych i fizycznie
          nie ma miejsca, w którym mógłby zapisać Twój token.
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          <strong>
            Każde zapytanie jest izolowane i niszczone natychmiast po wysłaniu
            faktury do Twojej przeglądarki.
          </strong>
        </Typography>
      </Paper>

      <ListPanel title="FAQ" items={faqItems} />
    </Stack>
  );
}
