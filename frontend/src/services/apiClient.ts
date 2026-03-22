const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

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

async function parseResponse(response: Response): Promise<unknown> {
  const ct = response.headers.get("content-type") ?? "";
  return ct.includes("application/json") ? response.json() : response.text();
}

async function assertOk(response: Response, fallback: string): Promise<void> {
  if (response.ok) return;

  const payload = await parseResponse(response);
  if (typeof payload === "object" && payload !== null) {
    const p = payload as { exceptionDescription?: string; message?: string };
    throw new KsefApiError(
      p.exceptionDescription ?? p.message ?? fallback,
      response.status,
      payload,
    );
  }

  throw new KsefApiError(String(payload || fallback), response.status, payload);
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  await assertOk(response, `Request failed: ${path}`);

  const ct = response.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return response.text() as unknown as Promise<T>;
}
