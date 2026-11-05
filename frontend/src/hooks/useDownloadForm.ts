import { FormEvent, useRef, useState } from "react";

import { CONTEXT_META, hasValidNipChecksum } from "../lib/contextMeta";
import { defaultMonth, monthLabels } from "../lib/monthLabels";
import type {
  ContextIdentifierType,
  DateType,
  DownloadFormat,
  DownloadInvoicesRequest,
  EnvironmentName,
  SubjectChoice,
} from "../types";
import { BOTH_SUBJECT_TYPES } from "../types";
import { DownloadCancelledError, useDownloadInvoices, type DownloadResult } from "./useDownloadInvoices";

export type InvalidField = "token" | "contextValue";

// Środowisko KSeF wybiera serwer (zmienna KSEF_ENV) – od 88d5816 parametr ?environment= jest przez
// niego ignorowany, więc formularz go nie wystawia. Wartość jest tu tylko dlatego, że wymaga jej typ
// żądania i współdzielone moduły (m.in. CLI, gdzie środowisko ma realne znaczenie).
const REQUEST_ENVIRONMENT: EnvironmentName = "prod";

const saveArchive = (result: DownloadResult) => {
  const objectUrl = URL.createObjectURL(result.blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = result.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};

/** Stan, walidacja i wysyłka formularza pobierania faktur (widok: DownloadForm). */
export const useDownloadForm = () => {
  const [token, setToken] = useState("");
  const [contextType, setContextTypeState] = useState<ContextIdentifierType>("Nip");
  const [contextValue, setContextValueState] = useState("");
  const [subjectType, setSubjectType] = useState<SubjectChoice>("Subject1");
  const [dateType, setDateType] = useState<DateType>("Invoicing");
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth.label);
  const [format, setFormat] = useState<DownloadFormat>("xml");
  const [tokenTouched, setTokenTouched] = useState(false);
  const [contextValueTouched, setContextValueTouched] = useState(false);

  const download = useDownloadInvoices();
  const { mutate, reset: resetDownload } = download;
  // Ostatnie żądanie – do dociągnięcia brakujących faktur tymi samymi filtrami.
  const lastRequestRef = useRef<DownloadInvoicesRequest | null>(null);

  const contextMeta = CONTEXT_META[contextType];
  const contextValidationError = contextMeta.validate(contextValue);
  const contextError = contextValueTouched ? contextValidationError : null;
  const contextWarning =
    contextType === "Nip" && !contextValidationError && !hasValidNipChecksum(contextValue)
      ? "Suma kontrolna NIP się nie zgadza – sprawdź, czy nie ma literówki."
      : null;
  const tokenError = tokenTouched && !token.trim() ? "Wklej token KSeF z portalu MF" : null;

  const tokenReady = token.trim().length > 0;
  const contextReady = !contextValidationError;

  const selectedMonthData =
    monthLabels.find((month) => month.label === selectedMonth) ?? defaultMonth;

  const setContextType = (value: ContextIdentifierType) => {
    setContextTypeState(value);
    setContextValueState("");
    setContextValueTouched(false);
  };

  const setContextValue = (value: string) => {
    // Dla NIP przyjmujemy też wklejone "123-456-32-18" – zostają same cyfry.
    setContextValueState(contextType === "Nip" ? value.replace(/\D/g, "").slice(0, 10) : value);
    setContextValueTouched(true);
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
    focusInvalid?: (field: InvalidField) => void,
  ) => {
    event.preventDefault();
    setTokenTouched(true);
    setContextValueTouched(true);

    if (!tokenReady) return focusInvalid?.("token");
    if (!contextReady) return focusInvalid?.("contextValue");

    const request: DownloadInvoicesRequest = {
      environment: REQUEST_ENVIRONMENT,
      token,
      contextType,
      contextValue,
      subjectTypes: subjectType === "Both" ? [...BOTH_SUBJECT_TYPES] : [subjectType],
      dateType,
      dateFrom: selectedMonthData.dateFrom,
      dateTo: selectedMonthData.dateTo,
      format,
    };

    startDownload(request);
  };

  const startDownload = (request: DownloadInvoicesRequest) => {
    lastRequestRef.current = request;
    mutate(request, {
      onSuccess: saveArchive,
      onError: (error) => {
        // Anulowanie przed pobraniem pierwszej faktury: wracamy do formularza bez komunikatu o błędzie.
        if (error instanceof DownloadCancelledError) resetDownload();
      },
    });
  };

  /** Pobiera ponownie tylko faktury z listy brakujących (np. po upływie limitu godzinowego KSeF). */
  const downloadMissing = (result: DownloadResult) => {
    const previous = lastRequestRef.current;
    if (!previous || result.missing.length === 0) return;
    startDownload({
      ...previous,
      token,
      onlyKsefNumbers: result.missing.map((invoice) => invoice.ksefNumber),
    });
  };

  return {
    fields: {
      token,
      contextType,
      contextValue,
      subjectType,
      dateType,
      selectedMonth,
      format,
    },
    setters: {
      setToken,
      setContextType,
      setContextValue,
      setSubjectType,
      setDateType,
      setSelectedMonth,
      setFormat,
      touchToken: () => setTokenTouched(true),
      touchContextValue: () => setContextValueTouched(true),
    },
    validation: {
      contextMeta,
      contextError,
      contextWarning,
      tokenError,
      tokenReady,
      contextReady,
    },
    handleSubmit,
    resetDownload,
    cancelDownload: download.cancel,
    downloadMissing,
    isPending: download.isPending,
    isSuccess: download.isSuccess,
    isError: download.isError,
    error: download.error,
    result: download.data,
    progress: download.progress,
  };
};
