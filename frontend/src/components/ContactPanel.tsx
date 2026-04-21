import { ChangeEvent, FormEvent, useState } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { submitContactMessage } from "../services/contactService";
import type { ContactMessageType } from "../types";

type SubmitState = "idle" | "sending" | "success" | "error";

const MESSAGE_TYPES: Array<{ value: ContactMessageType; label: string }> = [
  { value: "ProblemReport", label: "Zgłoś problem" },
  { value: "ContactForm", label: "kontakt z developerami" },
];

export default function ContactPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<ContactMessageType>("ProblemReport");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function onChangeMessageType(event: ChangeEvent<HTMLInputElement>) {
    setMessageType(event.target.value as ContactMessageType);
  }

  function onChangeName(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  function onChangeEmail(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function onChangeMessage(event: ChangeEvent<HTMLInputElement>) {
    setMessage(event.target.value);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setErrorMessage(null);

    try {
      await submitContactMessage({
        name,
        email,
        message,
        messageType,
        source: "ksefast-web",
        additionalProperties: {
          page: window.location.pathname,
          userAgent: navigator.userAgent,
        },
      });

      setState("success");
      setMessage("");
    } catch (error) {
      setState("error");
      setErrorMessage(error instanceof Error ? error.message : "Nie udalo sie wyslac wiadomosci.");
    }
  }

  return (
    <Paper sx={{ p: 3.5 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" color="primary" fontWeight={700}>
            Masz uwagi albo pytania?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zapraszamy do wypelnienia formularza.
          </Typography>
        </Box>

        <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            select
            label="Typ wiadomosci"
            value={messageType}
            onChange={onChangeMessageType}
            fullWidth
          >
            {MESSAGE_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Imie i nazwisko"
            value={name}
            onChange={onChangeName}
            required
            fullWidth
          />

          <TextField
            label="Adres e-mail"
            type="email"
            value={email}
            onChange={onChangeEmail}
            required
            fullWidth
          />

          <TextField
            label="Wiadomosc"
            value={message}
            onChange={onChangeMessage}
            required
            multiline
            minRows={4}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={state === "sending"}
            sx={{ py: 1.2 }}
          >
            {state === "sending" ? "Wysylanie..." : "Wyslij wiadomosc"}
          </Button>
        </Box>

        {state === "success" && (
          <Alert severity="success" variant="outlined">
            Twoja wiadomosc zostala wyslana.
          </Alert>
        )}

        {state === "error" && (
          <Alert severity="error">
            <AlertTitle>Nie udalo sie wyslac wiadomosci</AlertTitle>
            {errorMessage ?? "Sprobuj ponownie za chwile."}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
