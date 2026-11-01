import { FormEvent, useState } from "react";

import { CONTEXT_META, hasValidNipChecksum } from "../lib/contextMeta";
import { defaultMonth, monthLabels } from "../lib/monthLabels";
import type {
  ContextIdentifierType,
  DateType,
  DownloadFormat,
  DownloadInvoicesRequest,
  EnvironmentName,
  SubjectType,
} from "../types";
import { useDownloadInvoices } from "./useDownloadInvoices";

export type InvalidField = "token" | "contextValue";

/** Stan, walidacja i wysyłka formularza pobierania faktur (widok: DownloadForm). */
export const useDownloadForm = () => {
  const [environment, setEnvironment] = useState<EnvironmentName>("prod");
  const [token, setToken] = useState("");
  const [contextType, setContextTypeState] = useState<ContextIdentifierType>("Nip");
  const [contextValue, setContextValueState] = useState("");
  const [subjectType, setSubjectType] = useState<SubjectType>("Subject1");
  const [dateType, setDateType] = useState<DateType>("Invoicing");
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth.label);
  const [format, setFormat] = useState<DownloadFormat>("xml");
  const [tokenTouched, setTokenTouched] = useState(false);
  const [contextValueTouched, setContextValueTouched] = useState(false);

  const download = useDownloadInvoices();
  const { mutate, reset: resetDownload } = download;

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

    mutate(request, {
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
  };

  return {
    fields: {
      environment,
      token,
      contextType,
      contextValue,
      subjectType,
      dateType,
      selectedMonth,
      format,
    },
    setters: {
      setEnvironment,
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
    isPending: download.isPending,
    isSuccess: download.isSuccess,
    isError: download.isError,
    error: download.error,
    result: download.data,
    progress: download.progress,
  };
};
