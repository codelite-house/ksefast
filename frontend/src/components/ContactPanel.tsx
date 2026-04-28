import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useContactForm } from "../hooks/useContactForm";

const MESSAGE_TYPES = [
  { value: "ProblemReport", label: "Zgłoś problem" },
  { value: "ContactForm", label: "Kontakt z deweloperami" },
] as const;

const ContactPanel = () => {
  const { fields, handlers, onSubmit, isPending, isSuccess, isError, error } = useContactForm();

  return (
    <Paper sx={{ p: 3.5 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" color="primary" fontWeight={700}>
            Masz uwagi albo pytania?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zapraszamy do wypełnienia formularza.
          </Typography>
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

          <TextField
            label="Imię i nazwisko"
            value={fields.name}
            onChange={handlers.onChangeName}
            required
            fullWidth
          />

          <TextField
            label="Adres e-mail"
            type="email"
            value={fields.email}
            onChange={handlers.onChangeEmail}
            required
            fullWidth
          />

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
            color="secondary"
            disabled={isPending}
            sx={{ py: 1.2 }}
          >
            {isPending ? "Wysyłanie..." : "Wyślij wiadomość"}
          </Button>
        </Box>

        {isSuccess && (
          <Alert severity="success" variant="outlined">
            Twoja wiadomość została wysłana.
          </Alert>
        )}

        {isError && (
          <Alert severity="error">
            <AlertTitle>Nie udało się wysłać wiadomości</AlertTitle>
            {error instanceof Error ? error.message : "Spróbuj ponownie za chwilę."}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};

export default ContactPanel;
