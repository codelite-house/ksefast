import type { TokenAuthApi } from "../../frontend/src/lib/authenticateWithToken";
import {
  INVOICE_DOWNLOAD_PAUSE_MS,
  RateLimitedError,
  createPacer,
  fetchWithKsefRetry,
} from "../../frontend/src/lib/ksefRateLimit";
import type {
  EnvironmentName,
  InitTokenAuthRequest,
  InvoiceQueryFilters,
  KsefAuthStatusResponse,
  KsefChallengeResponse,
  KsefInitAuthResponse,
  KsefTokensResponse,
  PublicCertificateInfo,
  QueryInvoicesResponse,
} from "../../frontend/src/types";

// Te same adresy co w server/server.ts (demo = środowisko testowe MF).
export const KSEF_BASE_URLS: Record<EnvironmentName, string> = {
  demo: "https://api-test.ksef.mf.gov.pl/v2",
  prod: "https://api.ksef.mf.gov.pl/v2",
};

export class KsefHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "KsefHttpError";
  }
}

export { RateLimitedError };

export interface DirectClientOptions {
  baseUrl: string;
  fetchFn?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  /** Minimalny odstęp między pobraniami faktur. Limit KSeF: 16/min i 64/h. */
  downloadPauseMs?: number;
  /** Dłuższe `Retry-After` kończy się RateLimitedError zamiast czekania. */
  maxRetryAfterSec?: number;
  maxRetries?: number;
  timeoutMs?: number;
}

export interface DownloadedXml {
  bytes: Uint8Array;
  /** Nagłówek `x-ms-meta-hash`: SHA-256 faktury w Base64. */
  hash: string | null;
}

export interface DirectClient extends TokenAuthApi {
  queryInvoiceMetadata: (
    accessToken: string,
    filters: InvoiceQueryFilters,
    pageOffset: number,
    pageSize: number,
  ) => Promise<QueryInvoicesResponse>;
  downloadInvoiceXml: (accessToken: string, ksefNumber: string) => Promise<DownloadedXml>;
  logout: (accessToken: string) => Promise<void>;
}

const describeError = async (res: Response, method: string, path: string): Promise<string> => {
  const text = await res.text();
  let detail = text.slice(0, 400);
  try {
    const body = JSON.parse(text) as Record<string, unknown>;
    const nested = (body.exception as { exceptionDetailList?: { exceptionDescription?: string }[] } | undefined)
      ?.exceptionDetailList?.map((d) => d.exceptionDescription).filter(Boolean).join("; ");
    detail = String(nested || body.exceptionDescription || body.message || body.detail || body.title || detail);
  } catch {
    // odpowiedź nie jest JSON-em – zostaje początek treści
  }
  return `KSeF HTTP ${res.status} (${method} ${path.split("?")[0]}): ${detail}`;
};

/**
 * Klient KSeF API v2 wołany wprost z Node (bez proxy – CORS dotyczy tylko przeglądarki).
 * Obsługuje limity KSeF: ponawia po 429 (zgodnie z Retry-After) i zachowuje odstęp między pobraniami.
 */
export const createDirectClient = (options: DirectClientOptions): DirectClient => {
  const {
    baseUrl,
    fetchFn = fetch,
    sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)),
    now = Date.now,
    downloadPauseMs = INVOICE_DOWNLOAD_PAUSE_MS,
    maxRetryAfterSec = 90,
    maxRetries = 3,
    timeoutMs = 30_000,
  } = options;

  const downloads = createPacer(downloadPauseMs, { now, sleep });

  const send = async (
    method: string,
    path: string,
    request: { token?: string; body?: unknown } = {},
  ): Promise<Response> => {
    const headers: Record<string, string> = { Accept: "application/json, application/xml" };
    if (request.token) headers.Authorization = `Bearer ${request.token}`;
    if (request.body !== undefined) headers["Content-Type"] = "application/json";

    const res = await fetchWithKsefRetry(
      () =>
        fetchFn(`${baseUrl}${path}`, {
          method,
          headers,
          body: request.body === undefined ? undefined : JSON.stringify(request.body),
          signal: AbortSignal.timeout(timeoutMs),
        }),
      { sleep, maxRetryAfterSec, maxRetries },
    );
    if (!res.ok) {
      throw new KsefHttpError(await describeError(res, method, path), res.status);
    }
    return res;
  };

  const json = async <T>(res: Response): Promise<T> => (await res.json()) as T;

  return {
    getPublicCertificates: async () =>
      json<PublicCertificateInfo[]>(await send("GET", "/security/public-key-certificates")),

    getChallenge: async () =>
      json<KsefChallengeResponse>(await send("POST", "/auth/challenge")),

    initTokenAuth: async (body: InitTokenAuthRequest) =>
      json<KsefInitAuthResponse>(await send("POST", "/auth/ksef-token", { body })),

    getAuthStatus: async (referenceNumber: string, authToken: string) =>
      json<KsefAuthStatusResponse>(
        await send("GET", `/auth/${encodeURIComponent(referenceNumber)}`, { token: authToken }),
      ),

    redeemToken: async (authToken: string) =>
      json<KsefTokensResponse>(await send("POST", "/auth/token/redeem", { token: authToken })),

    queryInvoiceMetadata: async (accessToken, filters, pageOffset, pageSize) =>
      json<QueryInvoicesResponse>(
        await send(
          "POST",
          `/invoices/query/metadata?sortOrder=Asc&pageOffset=${pageOffset}&pageSize=${pageSize}`,
          { token: accessToken, body: filters },
        ),
      ),

    downloadInvoiceXml: (accessToken, ksefNumber) =>
      downloads.run(async () => {
        const res = await send("GET", `/invoices/ksef/${encodeURIComponent(ksefNumber)}`, {
          token: accessToken,
        });
        const bytes = new Uint8Array(await res.arrayBuffer());
        return { bytes, hash: res.headers.get("x-ms-meta-hash") };
      }),

    logout: async (accessToken) => {
      await send("DELETE", "/auth/sessions/current", { token: accessToken });
    },
  };
};
