/**
 * Obsługa limitów KSeF wspólna dla aplikacji webowej i CLI.
 * Pobieranie faktur (grupa `invoiceDownload`): 8/s, 16/min, 64/h; KSeF odpowiada 429 z `Retry-After` w sekundach.
 */

/** KSeF kazał czekać dłużej, niż jesteśmy gotowi (limit godzinowy) – wynik częściowy. */
export class RateLimitedError extends Error {
  constructor(readonly retryAfterSec: number) {
    super(`Limit zapytań KSeF – spróbuj ponownie za ok. ${Math.max(1, Math.ceil(retryAfterSec / 60))} min`);
    this.name = "RateLimitedError";
  }
}

/** Odstęp między pobraniami XML, który mieści się w 16/min. */
export const INVOICE_DOWNLOAD_PAUSE_MS = 4500;

const DEFAULT_RETRY_AFTER_SEC = 30;

export type Sleep = (ms: number, signal?: AbortSignal) => Promise<void>;

export const abortableSleep: Sleep = (ms, signal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });

export const parseRetryAfter = (value: string | null): number => {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_RETRY_AFTER_SEC;
};

export interface KsefRetryOptions {
  sleep?: Sleep;
  /** Dłuższe `Retry-After` kończy się RateLimitedError zamiast czekania. */
  maxRetryAfterSec?: number;
  maxRetries?: number;
  signal?: AbortSignal;
  /** Wywoływane przed każdą pauzą po 429 – np. do odliczania w UI. */
  onWait?: (waitSec: number) => void;
}

/**
 * Wykonuje żądanie i ponawia je po 429 (zgodnie z `Retry-After` + 1 s) oraz po 5xx (backoff 2^attempt s).
 * `send` jest wołane przy każdej próbie od nowa.
 */
export const fetchWithKsefRetry = async (
  send: () => Promise<Response>,
  options: KsefRetryOptions = {},
): Promise<Response> => {
  const { sleep = abortableSleep, maxRetryAfterSec = 90, maxRetries = 3, signal, onWait } = options;

  for (let attempt = 0; ; attempt++) {
    const res = await send();

    if (res.status === 429) {
      await res.arrayBuffer();
      const waitSec = parseRetryAfter(res.headers.get("retry-after"));
      if (waitSec > maxRetryAfterSec || attempt >= maxRetries) {
        throw new RateLimitedError(waitSec);
      }
      onWait?.(waitSec + 1);
      await sleep((waitSec + 1) * 1000, signal);
      continue;
    }
    if (res.status >= 500 && attempt < maxRetries) {
      await res.arrayBuffer();
      await sleep(1000 * 2 ** attempt, signal);
      continue;
    }
    return res;
  }
};

export interface Pacer {
  /** Czeka, aż minie `minIntervalMs` od końca poprzedniego wywołania, i wykonuje `fn`. */
  run: <T>(fn: () => Promise<T>, signal?: AbortSignal) => Promise<T>;
}

export const createPacer = (
  minIntervalMs: number,
  { now = Date.now, sleep = abortableSleep }: { now?: () => number; sleep?: Sleep } = {},
): Pacer => {
  let lastDoneAt: number | null = null;

  return {
    run: async (fn, signal) => {
      if (lastDoneAt !== null) {
        const wait = lastDoneAt + minIntervalMs - now();
        if (wait > 0) await sleep(wait, signal);
      }
      try {
        return await fn();
      } finally {
        lastDoneAt = now();
      }
    },
  };
};
