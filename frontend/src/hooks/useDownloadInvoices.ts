import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createArchiveBuilder } from "../archiveService";
import { downloadInvoiceBatch, type BatchStopReason } from "../lib/downloadInvoiceBatch";
import { fetchAllInvoiceMetadata } from "../lib/fetchAllInvoiceMetadata";
import { authenticateWithToken } from "../lib/authenticateWithToken";
import { INVOICE_DOWNLOAD_PAUSE_MS, createPacer } from "../lib/ksefRateLimit";
import type { KsefRequestControl } from "../services/apiClient";
import {
  getChallenge,
  getAuthStatus,
  initTokenAuth,
  redeemToken,
} from "../services/authService";
import {
  downloadInvoiceXml,
  queryInvoiceMetadata,
} from "../services/invoicesService";
import { getPublicCertificates } from "../services/securityService";
import type {
  DownloadInvoicesRequest,
  DownloadProgress,
  InvoiceMetadata,
} from "../types";

const DOWNLOAD_CHUNK_SIZE = 25;

// Dłuższe `Retry-After` (limit godzinowy KSeF) kończy pobieranie częściowym ZIP-em zamiast czekania.
const MAX_RATE_LIMIT_WAIT_SEC = 120;

export class DownloadCancelledError extends Error {
  constructor() {
    super("Pobieranie przerwane.");
    this.name = "DownloadCancelledError";
  }
}

export interface DownloadResult {
  blob: Blob;
  fileName: string;
  invoiceCount: number;
  /** Ile faktur pasowało do filtrów (przy dociąganiu: ile brakowało). */
  totalCount: number;
  /** Niepobrane faktury – ich numery są też w BRAKUJACE.txt w paczce. */
  missing: InvoiceMetadata[];
  stopReason?: BatchStopReason;
  /** Kiedy KSeF pozwoli pobierać dalej (limit godzinowy). */
  resumeAt?: number;
}

/**
 * Hook do pobrania paczki faktur z KSeF.
 * Sekwencja: certyfikaty → challenge → RSA encrypt → init auth → polling →
 *            redeem → metadane (pełna paginacja) → pobieranie XML z odstępami → ZIP/PDF.
 * Przy limicie KSeF, błędzie lub anulowaniu oddaje paczkę z tym, co już pobrano.
 */
export const useDownloadInvoices = () => {
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const mutation = useMutation<DownloadResult, Error, DownloadInvoicesRequest>({
    mutationFn: async (request) => {
      const abort = new AbortController();
      abortRef.current = abort;
      const { signal } = abort;

      let current: DownloadProgress = { phase: "auth", message: "Logowanie do KSeF…" };
      const report = (update: DownloadProgress) => {
        current = update;
        setProgress(update);
      };
      const control: KsefRequestControl = {
        signal,
        maxRetryAfterSec: MAX_RATE_LIMIT_WAIT_SEC,
        onWait: (waitSec) => report({ ...current, resumeAt: Date.now() + waitSec * 1000 }),
      };
      const clearWait = () => {
        if (current.resumeAt) report({ ...current, resumeAt: undefined });
      };

      const { environment, token } = request;
      const normalizedToken = token.trim();

      if (!normalizedToken) {
        throw new Error("KSeF token is required.");
      }

      try {
        report(current);

        const tokens = await authenticateWithToken(
          {
            getPublicCertificates: () => getPublicCertificates(environment),
            getChallenge: () => getChallenge(environment),
            initTokenAuth: (body) => initTokenAuth(environment, body),
            getAuthStatus: (referenceNumber, authToken) =>
              getAuthStatus(environment, referenceNumber, authToken),
            redeemToken: (authToken) => redeemToken(environment, authToken),
          },
          {
            token: normalizedToken,
            contextType: request.contextType,
            contextValue: request.contextValue,
          },
        );
        signal.throwIfAborted();
        const accessToken = tokens.accessToken.token;

        report({ phase: "metadata", message: "Wyszukiwanie faktur…", current: 0 });

        const foundInvoices = await fetchAllInvoiceMetadata(
          environment,
          accessToken,
          {
            subjectType: request.subjectType,
            dateRange: {
              dateType: request.dateType,
              from: request.dateFrom,
              to: request.dateTo,
            },
          },
          {
            onFoundCount: (count) =>
              report({
                phase: "metadata",
                message: `Wyszukiwanie faktur… (znaleziono ${count})`,
                current: count,
              }),
            query: (filters, pageOffset, pageSize) =>
              queryInvoiceMetadata(environment, accessToken, filters, pageOffset, pageSize, control),
          },
        );

        const wanted = request.onlyKsefNumbers && new Set(request.onlyKsefNumbers);
        const allInvoices = wanted
          ? foundInvoices.filter((invoice) => wanted.has(invoice.ksefNumber))
          : foundInvoices;

        if (allInvoices.length === 0) {
          throw new Error("Brak faktur dla wybranych filtrów.");
        }

        const total = allInvoices.length;
        const archive = createArchiveBuilder(request.format);
        const downloadMessage = (count: number) => `Pobieranie faktur… (${count}/${total})`;

        report({ phase: "download", message: downloadMessage(0), current: 0, total });

        const batch = await downloadInvoiceBatch({
          invoices: allInvoices,
          download: (metadata) =>
            downloadInvoiceXml(environment, accessToken, metadata.ksefNumber, control),
          onDownloaded: (count) =>
            report({ phase: "download", message: downloadMessage(count), current: count, total }),
          onChunk: async (invoices) => {
            if (request.format === "pdf") {
              const count = current.current ?? 0;
              report({ phase: "archive", message: `Konwersja do PDF… (${count}/${total})`, current: count, total });
            }
            await archive.addInvoices(invoices);
          },
          pacer: createPacer(INVOICE_DOWNLOAD_PAUSE_MS),
          chunkSize: DOWNLOAD_CHUNK_SIZE,
          signal,
        });
        clearWait();

        if (batch.downloadedCount === 0) {
          const reason = batch.stopReason;
          if (reason?.kind === "cancelled") throw new DownloadCancelledError();
          if (reason?.kind === "error") throw reason.error;
          if (reason?.kind === "rateLimited") {
            throw new Error(
              `KSeF chwilowo blokuje pobieranie faktur (limit pobrań). Spróbuj ponownie za ok. ${Math.max(1, Math.ceil(reason.retryAfterSec / 60))} min.`,
            );
          }
          throw new Error("Nie udało się pobrać żadnej faktury.");
        }

        report({
          phase: "archive",
          message: "Tworzenie paczki ZIP…",
          current: batch.downloadedCount,
          total,
        });

        archive.setMissing(batch.missing);
        const blob = await archive.finalize();
        const today = new Date().toISOString().slice(0, 10);
        const suffix = request.onlyKsefNumbers ? "-uzupelnienie" : batch.missing.length > 0 ? "-czesciowa" : "";

        return {
          blob,
          fileName: `ksefast-${request.format}-${today}${suffix}.zip`,
          invoiceCount: batch.downloadedCount,
          totalCount: total,
          missing: batch.missing,
          stopReason: batch.stopReason,
          resumeAt:
            batch.stopReason?.kind === "rateLimited"
              ? Date.now() + batch.stopReason.retryAfterSec * 1000
              : undefined,
        };
      } catch (error) {
        if (signal.aborted) throw new DownloadCancelledError();
        throw error;
      }
    },
    onSettled: () => {
      abortRef.current = null;
      setProgress(null);
    },
  });

  // Ostrzeżenie przed zamknięciem karty w trakcie pobierania – pobrane faktury są tylko w pamięci.
  useEffect(() => {
    if (!mutation.isPending) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [mutation.isPending]);

  /** Zatrzymuje pobieranie; już pobrane faktury trafią do paczki. */
  const cancel = () => abortRef.current?.abort();

  return { ...mutation, progress, cancel };
};
