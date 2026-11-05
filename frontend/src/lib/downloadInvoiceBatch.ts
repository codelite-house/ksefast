import { RateLimitedError, type Pacer } from "./ksefRateLimit";
import type { DownloadedInvoice, InvoiceMetadata } from "../types";

export type BatchStopReason =
  | { kind: "rateLimited"; retryAfterSec: number }
  | { kind: "cancelled" }
  | { kind: "error"; error: unknown };

export interface BatchDownloadResult {
  downloadedCount: number;
  /** Faktury, których nie pobrano: pominięte z błędem albo niepobrane po przerwaniu. */
  missing: InvoiceMetadata[];
  /** Ustawione, gdy pobieranie przerwano przed końcem listy. */
  stopReason?: BatchStopReason;
}

export interface BatchDownloadOptions {
  invoices: InvoiceMetadata[];
  download: (metadata: InvoiceMetadata) => Promise<string>;
  /** Pobrane faktury trafiają tu partiami (np. do ZIP-a) – także te sprzed przerwania. */
  onChunk: (invoices: DownloadedInvoice[]) => Promise<void>;
  onDownloaded?: (downloadedCount: number) => void;
  pacer: Pacer;
  chunkSize: number;
  signal?: AbortSignal;
}

const httpStatus = (error: unknown): number | undefined =>
  typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status: unknown }).status)
    : undefined;

// Błąd dotyczący jednej faktury (np. 21165 „nie jest jeszcze dostępna") – pozostałe da się pobrać.
const isPerInvoiceError = (error: unknown): boolean => {
  const status = httpStatus(error);
  return status === 400 || status === 404;
};

/**
 * Pobiera XML-e faktur z zachowaniem odstępu między żądaniami (limity KSeF).
 * Nigdy nie gubi już pobranych faktur: przy limicie godzinowym, anulowaniu lub błędzie
 * oddaje je w `onChunk` i zwraca listę brakujących zamiast rzucać wyjątek.
 */
export const downloadInvoiceBatch = async (
  options: BatchDownloadOptions,
): Promise<BatchDownloadResult> => {
  const { invoices, download, onChunk, onDownloaded, pacer, chunkSize, signal } = options;

  const missing: InvoiceMetadata[] = [];
  let buffer: DownloadedInvoice[] = [];
  let downloadedCount = 0;
  let stopReason: BatchStopReason | undefined;

  const flush = async () => {
    if (buffer.length === 0) return;
    const chunk = buffer;
    buffer = [];
    await onChunk(chunk);
  };

  let index = 0;
  for (; index < invoices.length; index++) {
    const metadata = invoices[index];

    if (signal?.aborted) {
      stopReason = { kind: "cancelled" };
      break;
    }

    try {
      const xml = await pacer.run(() => download(metadata), signal);
      buffer.push({ metadata, xml });
      downloadedCount++;
      onDownloaded?.(downloadedCount);
    } catch (error) {
      if (signal?.aborted) {
        stopReason = { kind: "cancelled" };
        break;
      }
      if (error instanceof RateLimitedError) {
        stopReason = { kind: "rateLimited", retryAfterSec: error.retryAfterSec };
        break;
      }
      if (isPerInvoiceError(error)) {
        missing.push(metadata);
        continue;
      }
      stopReason = { kind: "error", error };
      break;
    }

    if (buffer.length >= chunkSize) await flush();
  }

  await flush();
  missing.push(...invoices.slice(index));

  return { downloadedCount, missing, stopReason };
};
