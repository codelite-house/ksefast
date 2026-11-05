import { fetchWithKsefRetry, type KsefRetryOptions } from "../lib/ksefRateLimit";

// `import.meta.env` istnieje tylko w Vite; opcjonalny dostęp pozwala importować moduł także w Node (CLI).
const API_BASE = import.meta.env?.VITE_API_BASE_URL || "/api";

export class KsefApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "KsefApiError";
  }
}

const parseResponse = async (response: Response): Promise<unknown> => {
  const ct = response.headers.get("content-type") ?? "";
  return ct.includes("application/json") ? response.json() : response.text();
};

const assertOk = async (response: Response, fallback: string): Promise<void> => {
  if (response.ok) return;

  const payload = await parseResponse(response);
  if (typeof payload === "object" && payload !== null) {
    const p = payload as {
      exceptionDescription?: string;
      message?: string;
      ksefDetails?: unknown;
    };
    throw new KsefApiError(
      p.exceptionDescription ?? p.message ?? fallback,
      response.status,
      p.ksefDetails !== undefined ? p.ksefDetails : payload,
    );
  }

  throw new KsefApiError(String(payload || fallback), response.status, payload);
};

const readBody = async <T>(response: Response, path: string): Promise<T> => {
  await assertOk(response, `Request failed: ${path}`);

  const ct = response.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return response.text() as unknown as Promise<T>;
};

export const apiFetch = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => readBody<T>(await fetch(`${API_BASE}${path}`, init), path);

/** Sterowanie pojedynczym wywołaniem KSeF: anulowanie i informacja o pauzie po 429. */
export type KsefRequestControl = Pick<KsefRetryOptions, "signal" | "onWait" | "maxRetryAfterSec">;

/** Wywołanie KSeF przez proxy z ponawianiem po 429 (`Retry-After`) i 5xx. */
export const ksefFetch = async <T>(
  path: string,
  init: RequestInit = {},
  control: KsefRequestControl = {},
): Promise<T> => {
  const response = await fetchWithKsefRetry(
    () => fetch(`${API_BASE}${path}`, { ...init, signal: control.signal }),
    control,
  );
  return readBody<T>(response, path);
};
