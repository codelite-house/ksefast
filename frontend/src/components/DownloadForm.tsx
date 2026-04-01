import { FormEvent, useEffect, useState } from "react";
import { useDownloadInvoices } from "../hooks/useDownloadInvoices";
import type { DownloadInvoicesRequest, ContextIdentifierType } from "../types";
import { KsefApiError } from "../services/apiClient";
import { monthLabels, defaultMonth } from "../lib/monthLabels";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

const CONTEXT_META: Record<
  ContextIdentifierType,
  {
    label: string;
    placeholder: string;
    helperText: string;
    validate: (value: string) => string | null;
  }
> = {
  Nip: {
    label: "Numer NIP firmy",
    placeholder: "Wpisz NIP swojej firmy",
    helperText: "10-cyfrowy NIP podatnika",
    validate: (v) =>
      /^\d{10}$/.test(v.trim())
        ? null
        : "NIP musi składać się z dokładnie 10 cyfr",
  },
  NipVatUe: {
    label: "Numer VAT UE",
    placeholder: "np. PL1234567890",
    helperText: "Kod kraju UE (2 litery) + numer VAT UE",
    validate: (v) =>
      /^[A-Za-z]{2}[A-Za-z0-9]{2,12}$/.test(v.trim())
        ? null
        : "Nieprawidłowy format (np. PL1234567890)",
  },
  InternalId: {
    label: "Identyfikator wewnętrzny",
    placeholder: "np. 12345678",
    helperText: "Wewnętrzny identyfikator podatnika w KSeF",
    validate: (v) => (v.trim() ? null : "Wymagane"),
  },
  PeppolId: {
    label: "Peppol ID",
    placeholder: "np. iso6523-actorid-upis::0106:1234567890",
    helperText: "Identyfikator Peppol (schemat::wartość)",
    validate: (v) =>
      v.includes("::")
        ? null
        : 'Peppol ID musi zawierać separator "::" (np. iso6523-actorid-upis::0106:1234567890)',
  },
};

export default function DownloadForm() {
  const [token, setToken] = useState("");
  const [contextType, setContextType] = useState<
    "Nip" | "InternalId" | "NipVatUe" | "PeppolId"
  >("Nip");
  const [contextValue, setContextValue] = useState("");
  const [environment, setEnvironment] = useState<"demo" | "prod">("prod");
  const [subjectType, setSubjectType] = useState<
    "Subject1" | "Subject2" | "Subject3" | "SubjectAuthorized"
  >("Subject1");
  const [dateType, setDateType] = useState<
    "Issue" | "Invoicing" | "PermanentStorage"
  >("Invoicing");
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth.label);
  const [format, setFormat] = useState<"xml" | "pdf">("xml");
  const [contextValueTouched, setContextValueTouched] = useState(false);
  const [lastInvoiceCount, setLastInvoiceCount] = useState<number | null>(null);

  const contextMeta = CONTEXT_META[contextType];
  const contextValueError = contextValueTouched
    ? contextMeta.validate(contextValue)
    : null;

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
    setLastInvoiceCount(null);
    setContextValueTouched(true);
    if (contextMeta.validate(contextValue)) return;

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
    };

    downloadInvoices(request, {
      onSuccess: (result) => {
        setLastInvoiceCount(result.invoiceCount);
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
          placeholder="Wklej token KSeF z portalu Ministerstwa Finansów"
          helperText={
            <>
              Token jest szyfrowany lokalnie, zanim opuści Twoją przeglądarkę.
              <br />
              <Link
                href="https://www.podatki.gov.pl/ksef/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Jak wygenerować token? (Instrukcja)
              </Link>
            </>
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                <span role="img" aria-label="Bezpieczne pole tokenu">
                  🔒
                </span>
              </InputAdornment>
            ),
          }}
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
            onChange={(e) => {
              setContextType(
                e.target.value as
                  | "Nip"
                  | "InternalId"
                  | "NipVatUe"
                  | "PeppolId",
              );
              setContextValue("");
              setContextValueTouched(false);
            }}
            fullWidth
          >
            <MenuItem value="Nip">NIP</MenuItem>
            <MenuItem value="InternalId">InternalId</MenuItem>
            <MenuItem value="NipVatUe">NIP VAT UE</MenuItem>
            <MenuItem value="PeppolId">Peppol ID</MenuItem>
          </TextField>
          <TextField
            label={contextMeta.label}
            value={contextValue}
            onChange={(e) => {
              setContextValue(e.target.value);
              setContextValueTouched(true);
            }}
            onBlur={() => setContextValueTouched(true)}
            placeholder={contextMeta.placeholder}
            helperText={contextValueError ?? contextMeta.helperText}
            error={!!contextValueError}
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
          {format === "pdf" && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              KSeF nie dostarcza faktur w formacie PDF. Faktury XML są pobierane
              z KSeF, a następnie konwertowane do PDF lokalnie w Twojej
              przeglądarce.
            </Typography>
          )}
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          size="large"
          disabled={isPending}
          fullWidth
          sx={{ py: 1.5 }}
        >
          {isPending ? "Pobieranie…" : "Przestań ręcznie pobierać faktury"}
        </Button>

        <Alert severity="info" variant="outlined">
          Oszczędź średnio 15 minut przy każdym rozliczeniu miesięcznym.
        </Alert>

        {isPending && (
          <Alert
            severity="info"
            icon={<CircularProgress size={18} color="inherit" />}
          >
            Łączenie z KSeF i pobieranie faktur. To może potrwać do kilkudziesięciu sekund.
          </Alert>
        )}

        {isSuccess && (
          <Stack spacing={1.5}>
            <Alert severity="success">
              ✓ Pomyślnie pobrano {lastInvoiceCount ?? "wybraną liczbę"} faktur.
              Dane nigdy nie opuszczają Twojej przeglądarki.
            </Alert>
            <Alert severity="info" variant="outlined">
              <AlertTitle>Udało się!</AlertTitle>
              Zaoszczędziłeś właśnie sporo czasu. Jeśli chcesz, możesz nam za to
              podziękować kawą. ☕{" "}
              <Link
                href="https://buycoffee.to/codelitehouse"
                target="_blank"
                rel="noopener noreferrer"
              >
                Postaw kawę
              </Link>
            </Alert>
          </Stack>
        )}
        {isError && (
          <Alert severity="error">
            <AlertTitle>Błąd</AlertTitle>
            {downloadError?.message ?? "Wystąpił nieznany błąd."}
            {downloadError instanceof KsefApiError &&
              downloadError.details != null &&
              typeof downloadError.details === "object" && (
                <Box component="details" sx={{ mt: 1.5 }}>
                  <Box
                    component="summary"
                    sx={{ cursor: "pointer", fontSize: "0.8em", opacity: 0.75 }}
                  >
                    Szczegóły odpowiedzi KSeF
                  </Box>
                  <Box
                    component="pre"
                    sx={{
                      mt: 0.5,
                      fontSize: "0.75em",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                      opacity: 0.8,
                    }}
                  >
                    {JSON.stringify(downloadError.details, null, 2)}
                  </Box>
                </Box>
              )}
          </Alert>
        )}
      </Box>
    </Paper>
  );
}
