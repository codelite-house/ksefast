import { VercelRequest, VercelResponse } from '@vercel/node';

export const ksefApiBaseUrls: Record<'demo' | 'prod', string> = {
  demo: 'https://demo.ksef.mf.gov.pl/api/v3',
  prod: 'https://ksef.mf.gov.pl/api/v3',
};

// CORS headers - allow all origins since data is not stored
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    res.status(200).setHeader('Content-Type', 'application/json').end(JSON.stringify({}));
    return true;
  }

  // Set CORS headers on all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  return false;
}

export async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export async function assertOk(response: Response, fallbackMessage: string): Promise<void> {
  if (response.ok) {
    return;
  }

  const payload = await readResponseBody(response);
  if (typeof payload === 'object' && payload !== null) {
    const maybeException = payload as { exceptionDescription?: string; message?: string; details?: string[] };
    throw new Error(maybeException.exceptionDescription ?? maybeException.message ?? fallbackMessage);
  }

  throw new Error(String(payload || fallbackMessage));
}

export function handleError(error: unknown, res: VercelResponse): void {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status = 400;

  res.status(status).json({
    status: status,
    message: message,
  });
}
