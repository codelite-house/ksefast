import { VercelRequest, VercelResponse } from "@vercel/node";

// Base URLs for KSeF API v2 – see docs/openapi/README.md for reference
// Test environment URL: verify against docs/openapi/ksef-api-test.json
export const ksefApiBaseUrls: Record<"demo" | "prod", string> = {
  demo: "https://api-test.ksef.mf.gov.pl/v2",
  prod: "https://api.ksef.mf.gov.pl/v2",
};

// CORS headers - allow all origins since data is not stored
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === "OPTIONS") {
    res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .end(JSON.stringify({}));
    return true;
  }

  // Set CORS headers on all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  return false;
}

export async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

class KsefUpstreamError extends Error {
  constructor(
    message: string,
    readonly ksefBody: unknown,
  ) {
    super(message);
    this.name = "KsefUpstreamError";
  }
}

export async function assertOk(
  response: Response,
  fallbackMessage: string,
): Promise<void> {
  if (response.ok) {
    return;
  }

  const payload = await readResponseBody(response);
  if (typeof payload === "object" && payload !== null) {
    const maybeException = payload as {
      exceptionDescription?: string;
      message?: string;
    };
    throw new KsefUpstreamError(
      maybeException.exceptionDescription ??
        maybeException.message ??
        fallbackMessage,
      payload,
    );
  }

  throw new KsefUpstreamError(String(payload || fallbackMessage), payload);
}

export function handleError(error: unknown, res: VercelResponse): void {
  const message = error instanceof Error ? error.message : "Unknown error";
  const ksefDetails =
    error instanceof KsefUpstreamError ? error.ksefBody : undefined;

  res.status(400).json({
    status: 400,
    message,
    ...(ksefDetails !== undefined ? { ksefDetails } : {}),
  });
}
