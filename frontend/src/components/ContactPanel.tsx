import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { OPERATOR, PRIVACY_POLICY_PATH } from "../content/privacyPolicy";
import { useContactForm } from "../hooks/useContactForm";
import { brand } from "../theme";
import GlowCard from "./ui/GlowCard";
import { MailIcon } from "./ui/icons";

const MESSAGE_TYPES = [
  { value: "ProblemReport", label: "Zgłoś problem" },
  { value: "ContactForm", label: "Kontakt z deweloperami" },
] as const;

const ContactPanel = () => {
  const { fields, handlers, onSubmit, isPending, isSuccess, isError, error } = useContactForm();

  return (
    <GlowCard sx={{ p: { xs: 2.5, sm: 3.5 }, height: "100%" }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            color: brand.sky,
            bgcolor: "rgba(56,189,248,.1)",
            border: "1px solid rgba(56,189,248,.3)",
          }}
        >
          <MailIcon />
        </Box>
        <Box>
          <Typography component="h3" sx={{ fontWeight: 800, fontSize: "1.25rem" }}>
            Masz uwagi albo pytania?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zapraszamy do wypełnienia formularza.
          </Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
        <TextField
          select
          label="Typ wiadomości"
          value={fields.messageType}
          onChange={handlers.onChangeMessageType}
          fullWidth
        >
          {MESSAGE_TYPES.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: 2 }}>
          <TextField label="Imię i nazwisko" value={fields.name} onChange={handlers.onChangeName} required fullWidth />
          <TextField
            label="Adres e-mail"
            type="email"
            value={fields.email}
            onChange={handlers.onChangeEmail}
            required
            fullWidth
          />
        </Box>

        <TextField
          label="Wiadomość"
          value={fields.message}
          onChange={handlers.onChangeMessage}
          required
          multiline
          minRows={4}
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isPending}
          sx={{ py: 1.3, color: "#04210f", background: brand.gradientCta }}
        >
          {isPending ? "Wysyłanie…" : "Wyślij wiadomość"}
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          Administratorem Twoich danych jest {OPERATOR.name}. Używamy ich tylko do odpowiedzi na wiadomość
          (art. 6 ust. 1 lit. f RODO) i przechowujemy nie dłużej niż 24 miesiące od zamknięcia sprawy. Masz prawo
          dostępu do danych, ich poprawienia i usunięcia oraz sprzeciwu. Szczegóły:{" "}
          <Link href={PRIVACY_POLICY_PATH}>polityka prywatności</Link>.
        </Typography>
      </Box>

      {isSuccess && (
        <Alert severity="success" variant="outlined" sx={{ mt: 2 }}>
          Twoja wiadomość została wysłana. Dziękujemy!
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Nie udało się wysłać wiadomości</AlertTitle>
          {error instanceof Error ? error.message : "Spróbuj ponownie za chwilę."}
        </Alert>
      )}
    </GlowCard>
  );
};

export default ContactPanel;
