import { FormEvent, useEffect, useState } from "react";
import { useDownloadInvoices } from "../hooks/useDownloadInvoices";
import type { DownloadInvoicesRequest } from "../types";
import { monthLabels, defaultMonth } from "../lib/monthLabels";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

export default function DownloadForm() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [contextType, setContextType] = useState<
    "Nip" | "InternalId" | "NipVatUe" | "PeppolId"
  >("Nip");
  const [contextValue, setContextValue] = useState("");
  const [environment, setEnvironment] = useState<"demo" | "prod">("demo");
  const [subjectType, setSubjectType] = useState<
    "Subject1" | "Subject2" | "Subject3" | "SubjectAuthorized"
  >("Subject1");
  const [dateType, setDateType] = useState<
    "Issue" | "Invoicing" | "PermanentStorage"
  >("Invoicing");
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth.label);
  const [format, setFormat] = useState<"xml" | "pdf">("xml");

  const {
    mutate: downloadInvoices,
    isPending,
    isSuccess,
    isError,
    error: downloadError,
    reset: resetDownload,
  } = useDownloadInvoices();

  const selectedMonthData =
    monthLabels.find((m) => m.label === selectedMonth) || defaultMonth;

  useEffect(() => {
    if (isSuccess) {
      const id = setTimeout(() => resetDownload(), 8000);
      return () => clearTimeout(id);
    }
  }, [isSuccess, resetDownload]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const request: DownloadInvoicesRequest = {
      environment,
      token,
      contextType,
      contextValue,
      subjectType,
      dateType,
      dateFrom: selectedMonthData.dateFrom,
      dateTo: selectedMonthData.dateTo,
      format,
      email: email.trim() || undefined,
    };

    downloadInvoices(request, {
      onSuccess: (result) => {
        const objectUrl = URL.createObjectURL(result.blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
    });
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <TextField
          select
          label="Środowisko"
          value={environment}
          onChange={(e) => setEnvironment(e.target.value as "demo" | "prod")}
          fullWidth
        >
          <MenuItem value="demo">Demo</MenuItem>
          <MenuItem value="prod">Produkcja</MenuItem>
        </TextField>

        <TextField
          label="Token KSeF"
          multiline
          rows={4}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Wklej token KSeF"
          required
          fullWidth
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            select
            label="Typ kontekstu"
            value={contextType}
            onChange={(e) =>
              setContextType(
                e.target.value as
                  | "Nip"
                  | "InternalId"
                  | "NipVatUe"
                  | "PeppolId",
              )
            }
            fullWidth
          >
            <MenuItem value="Nip">NIP</MenuItem>
            <MenuItem value="InternalId">InternalId</MenuItem>
            <MenuItem value="NipVatUe">NIP VAT UE</MenuItem>
            <MenuItem value="PeppolId">Peppol ID</MenuItem>
          </TextField>
          <TextField
            label="Wartość kontekstu"
            value={contextValue}
            onChange={(e) => setContextValue(e.target.value)}
            placeholder="np. 1234567890"
            required
            fullWidth
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            select
            label="Rola w wyszukiwaniu"
            value={subjectType}
            onChange={(e) =>
              setSubjectType(
                e.target.value as
                  | "Subject1"
                  | "Subject2"
                  | "Subject3"
                  | "SubjectAuthorized",
              )
            }
            fullWidth
          >
            <MenuItem value="Subject1">Podmiot 1 / sprzedawca</MenuItem>
            <MenuItem value="Subject2">Podmiot 2 / nabywca</MenuItem>
            <MenuItem value="Subject3">Podmiot 3</MenuItem>
            <MenuItem value="SubjectAuthorized">Podmiot upoważniony</MenuItem>
          </TextField>
          <TextField
            select
            label="Typ daty"
            value={dateType}
            onChange={(e) =>
              setDateType(
                e.target.value as "Issue" | "Invoicing" | "PermanentStorage",
              )
            }
            fullWidth
          >
            <MenuItem value="Invoicing">Przyjęcie w KSeF</MenuItem>
            <MenuItem value="Issue">Data wystawienia</MenuItem>
            <MenuItem value="PermanentStorage">Trwały zapis</MenuItem>
          </TextField>
        </Box>

        <TextField
          select
          label="Okres (miesiąc)"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          fullWidth
        >
          {monthLabels.map((m) => (
            <MenuItem key={m.label} value={m.label}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>

        <Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Format eksportu
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={format}
            onChange={(_, v: "xml" | "pdf" | null) => {
              if (v) setFormat(v);
            }}
            aria-label="Format eksportu"
          >
            <ToggleButton value="xml">XML ZIP</ToggleButton>
            <ToggleButton value="pdf">PDF ZIP</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <TextField
          label="E-mail opcjonalny"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.pl"
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          size="large"
          disabled={isPending}
          fullWidth
          sx={{ py: 1.5 }}
        >
          {isPending ? "Pobieranie…" : "Pobierz paczkę"}
        </Button>

        {isSuccess && (
          <Alert severity="success">
            ✓ Paczka została pobrana. Dane nigdy nie opuszczają Twojej
            przeglądarki.
          </Alert>
        )}
        {isError && (
          <Alert severity="error">
            {downloadError?.message ?? "Wystąpił nieznany błąd."}
          </Alert>
        )}
      </Box>
    </Paper>
  );
}
