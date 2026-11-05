import { useRef } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { shine } from "../animations";
import { useDownloadForm, type InvalidField } from "../hooks/useDownloadForm";
import { KsefApiError } from "../services/apiClient";
import { brand } from "../theme";
import type { DownloadFormat, SubjectType } from "../types";
import AdvancedOptions from "./download/AdvancedOptions";
import ChoiceCards, { type Choice } from "./download/ChoiceCards";
import DownloadStatus from "./download/DownloadStatus";
import DownloadSuccess from "./download/DownloadSuccess";
import MonthPicker from "./download/MonthPicker";
import SectionTitle from "./download/SectionTitle";
import TokenField from "./download/TokenField";
import GlowCard from "./ui/GlowCard";
import { CheckIcon, CodeIcon, DownloadIcon, FileTextIcon } from "./ui/icons";

const SUBJECT_CHOICES: readonly Choice<"Subject1" | "Subject2">[] = [
  {
    value: "Subject2",
    title: "Faktury zakupu",
    description: "Koszty – wystawione na Ciebie (jesteś nabywcą)",
    icon: <DownloadIcon sx={{ fontSize: 20 }} />,
  },
  {
    value: "Subject1",
    title: "Faktury sprzedaży",
    description: "Wystawione przez Ciebie (jesteś sprzedawcą)",
    icon: <FileTextIcon sx={{ fontSize: 20 }} />,
  },
];

const FORMAT_CHOICES: readonly Choice<DownloadFormat>[] = [
  {
    value: "xml",
    title: "XML ZIP",
    description: "Oryginały z KSeF – do programu księgowego",
    icon: <CodeIcon sx={{ fontSize: 20 }} />,
  },
  {
    value: "pdf",
    title: "PDF ZIP",
    description: "Czytelne wizualizacje, tworzone w Twojej przeglądarce",
    icon: <FileTextIcon sx={{ fontSize: 20 }} />,
  },
];

const DownloadForm = () => {
  const form = useDownloadForm();
  const { fields, setters, validation } = form;
  const tokenInputRef = useRef<HTMLInputElement>(null);
  const contextInputRef = useRef<HTMLInputElement>(null);

  const focusInvalid = (field: InvalidField) =>
    (field === "token" ? tokenInputRef : contextInputRef).current?.focus();

  const accessDone = validation.tokenReady && validation.contextReady;
  const missing = [
    !validation.tokenReady && "token",
    !validation.contextReady && "identyfikator firmy",
  ].filter(Boolean);

  const contextHelper = validation.contextError ? (
    validation.contextError
  ) : validation.contextWarning ? (
    <Box component="span" sx={{ color: brand.amber }}>
      {validation.contextWarning}
    </Box>
  ) : (
    validation.contextMeta.helperText
  );

  const renderBody = () => {
    if (form.isPending) return <DownloadStatus progress={form.progress} onCancel={form.cancelDownload} />;

    if (form.isSuccess && form.result) {
      const result = form.result;
      return (
        <DownloadSuccess
          result={result}
          onReset={form.resetDownload}
          onDownloadMissing={() => form.downloadMissing(result)}
        />
      );
    }

    return (
      <Box
        component="form"
        noValidate
        onSubmit={(event) => form.handleSubmit(event, focusInvalid)}
        sx={{ display: "grid", gap: 3 }}
      >
        <Box sx={{ display: "grid", gap: 2 }}>
          <SectionTitle index={1} title="Dostęp do KSeF" done={accessDone} />
          <TokenField
            value={fields.token}
            error={validation.tokenError}
            onChange={setters.setToken}
            onBlur={setters.touchToken}
            inputRef={tokenInputRef}
          />
          <TextField
            label={validation.contextMeta.label}
            value={fields.contextValue}
            onChange={(event) => setters.setContextValue(event.target.value)}
            onBlur={setters.touchContextValue}
            placeholder={validation.contextMeta.placeholder}
            helperText={contextHelper}
            error={!!validation.contextError}
            required
            fullWidth
            inputRef={contextInputRef}
            slotProps={{
              htmlInput: {
                inputMode: fields.contextType === "Nip" ? "numeric" : "text",
                autoComplete: "off",
              },
              input: {
                endAdornment:
                  validation.contextReady && !validation.contextWarning ? (
                    <InputAdornment position="end">
                      <CheckIcon sx={{ fontSize: 20, color: brand.green }} />
                    </InputAdornment>
                  ) : undefined,
              },
            }}
          />
        </Box>

        <Box>
          <SectionTitle index={2} title="Co pobrać?" done hint={fields.selectedMonth} />
          <Box sx={{ display: "grid", gap: 2 }}>
            <MonthPicker value={fields.selectedMonth} onChange={setters.setSelectedMonth} />
            <ChoiceCards
              label="Rodzaj faktur"
              value={fields.subjectType as "Subject1" | "Subject2"}
              options={SUBJECT_CHOICES}
              onChange={(value: SubjectType) => setters.setSubjectType(value)}
            />
            <ChoiceCards
              label="Format paczki"
              value={fields.format}
              options={FORMAT_CHOICES}
              onChange={setters.setFormat}
            />
          </Box>
        </Box>

        <AdvancedOptions
          contextType={fields.contextType}
          subjectType={fields.subjectType}
          dateType={fields.dateType}
          onContextTypeChange={setters.setContextType}
          onSubjectTypeChange={setters.setSubjectType}
          onDateTypeChange={setters.setDateType}
        />

        {form.isError && (
          <Alert severity="error" onClose={form.resetDownload}>
            <AlertTitle>Nie udało się pobrać faktur</AlertTitle>
            {form.error?.message ?? "Wystąpił nieznany błąd."}
            {form.error instanceof KsefApiError &&
              form.error.details != null &&
              typeof form.error.details === "object" && (
                <Box component="details" sx={{ mt: 1.5 }}>
                  <Box component="summary" sx={{ cursor: "pointer", fontSize: "0.8em", opacity: 0.75 }}>
                    Szczegóły odpowiedzi KSeF
                  </Box>
                  <Box
                    component="pre"
                    sx={{ mt: 0.5, fontSize: "0.75em", whiteSpace: "pre-wrap", wordBreak: "break-all", opacity: 0.8 }}
                  >
                    {JSON.stringify(form.error.details, null, 2)}
                  </Box>
                </Box>
              )}
          </Alert>
        )}

        <Box>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            startIcon={<DownloadIcon />}
            sx={{
              position: "relative",
              overflow: "hidden",
              py: 1.6,
              fontSize: "1.05rem",
              color: "#04210f",
              background: brand.gradientCta,
              backgroundSize: "140% 100%",
              boxShadow: "0 14px 34px -14px rgba(34,197,94,.8)",
              transition: "transform .2s, box-shadow .2s, background-position .4s",
              "&:hover": {
                transform: "translateY(-2px)",
                backgroundPosition: "100% 0",
                boxShadow: "0 18px 40px -14px rgba(56,189,248,.85)",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                width: "35%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent)",
                animation: `${shine} 3.6s ease-in-out infinite`,
              },
            }}
          >
            Pobierz paczkę ZIP z fakturami
          </Button>
          <Typography
            variant="caption"
            color={missing.length ? "text.secondary" : "text.primary"}
            sx={{ display: "block", textAlign: "center", mt: 1.25 }}
          >
            {missing.length
              ? `Do pobrania brakuje: ${missing.join(", ")}.`
              : `${fields.selectedMonth} · ${fields.format === "xml" ? "XML" : "PDF"} · token zaszyfrujemy lokalnie`}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <GlowCard
      id="pobierz"
      sx={{
        p: { xs: 2.5, sm: 4 },
        scrollMarginTop: "88px",
        boxShadow: "0 0 0 1px rgba(56,189,248,.08), 0 40px 90px -40px rgba(56,189,248,.45)",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography component="h2" sx={{ fontWeight: 800, fontSize: "1.45rem", letterSpacing: "-0.02em" }}>
          Pobierz faktury
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Token, NIP, miesiąc – i gotowe.
        </Typography>
      </Box>
      {renderBody()}
    </GlowCard>
  );
};

export default DownloadForm;
