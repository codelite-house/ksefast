// @ts-ignore - jsrsasign has no type declarations
import * as jsrsasign from 'jsrsasign';

// @ts-ignore
const KJUR = jsrsasign.KJUR;

import type {
  DownloadInvoicesRequest,
  DownloadedInvoice,
  KsefAuthStatusResponse,
  KsefChallengeResponse,
  KsefInitAuthResponse,
  QueryInvoicesResponse,
  KsefTokensResponse,
  PublicCertificateInfo,
} from './types';

// API base URL - points to Vercel Edge Functions
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const MAX_INVOICES_PER_EXPORT = 50;

class KsefError extends Error {
  constructor(message: string, readonly status?: number, readonly details?: unknown) {
    super(message);
    this.name = 'KsefError';
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

async function assertOk(response: Response, fallbackMessage: string): Promise<void> {
  if (response.ok) {
    return;
  }

  const payload = await readResponseBody(response);
  if (typeof payload === 'object' && payload !== null) {
    const maybeException = payload as { exceptionDescription?: string; message?: string; details?: string[] };
    throw new KsefError(
      maybeException.exceptionDescription ?? maybeException.message ?? fallbackMessage,
      response.status,
      payload,
    );
  }

  throw new KsefError(String(payload || fallbackMessage), response.status, payload);
}

async function getPublicCertificates(baseUrl: string): Promise<PublicCertificateInfo[]> {
  const response = await fetch(`${apiBaseUrl}/security/certificates?environment=${baseUrl === 'prod' ? 'prod' : 'demo'}`);
  await assertOk(response, 'Failed to fetch KSeF public certificates.');
  return (await response.json()) as PublicCertificateInfo[];
}

function pickTokenEncryptionCertificate(certificates: PublicCertificateInfo[]): PublicCertificateInfo {
  const candidate = certificates.find((item) =>
    (item.usage ?? []).some((usage) => usage.toLowerCase() === 'kseftokenencryption'),
  );

  if (!candidate) {
    throw new KsefError('KSeF token encryption certificate was not found.');
  }

  return candidate;
}

async function encryptTokenWithChallenge(
  token: string,
  timestampMs: number,
  certificateBase64: string,
): Promise<string> {
  // Convert base64 DER certificate to hex for jsrsasign
  const certHex = KJUR.rstrtohex(atob(certificateBase64));
  
  // Parse X.509 certificate
  const x509 = new KJUR.asn1.x509.X509();
  x509.readCertHex(certHex);
  
  // Extract public key from certificate
  const publicKey = x509.getPublicKey();
  
  // Create payload
  const payload = `${token}|${timestampMs}`;
  
  // Encrypt using RSA-OAEP with SHA-256
  // jsrsasign RSA object requires the key in specific format
  const rsa = new KJUR.crypto.RSA();
  
  // Extract modulus and exponent from public key
  const n = publicKey.n;
  const e = publicKey.e;
  
  // Convert to hex strings for RSA encryption
  const nHex = KJUR.rstrtohex(n.toString());
  const eHex = KJUR.rstrtohex(e.toString());
  
  // Set public key
  rsa.setPublicKeyHex(nHex, eHex);
  
  // Encrypt with OAEP padding using SHA-256
  const encrypted = rsa.encrypt_RSAOAEP(payload, 'sha256', '');
  
  return encrypted;
}

async function getAuthChallenge(baseUrl: string): Promise<KsefChallengeResponse> {
  const response = await fetch(`${apiBaseUrl}/auth/challenge?environment=${baseUrl === 'prod' ? 'prod' : 'demo'}`, {
    method: 'POST',
  });

  await assertOk(response, 'Failed to get KSeF auth challenge.');
  return (await response.json()) as KsefChallengeResponse;
}

async function initAuth(
  request: DownloadInvoicesRequest,
  encryptedToken: string,
  challenge: string,
): Promise<KsefInitAuthResponse> {
  const response = await fetch(`${apiBaseUrl}/auth/token?environment=${request.environment === 'prod' ? 'prod' : 'demo'}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      challenge,
      contextIdentifier: {
        type: request.contextType,
        value: request.contextValue,
      },
      encryptedToken,
      authorizationPolicy: null,
    }),
  });

  await assertOk(response, 'Failed to initialize KSeF token authentication.');
  return (await response.json()) as KsefInitAuthResponse;
}

function describeStatus(status: { code: number; description: string; details?: string[] }): string {
  const details = status.details?.length ? ` (${status.details.join(', ')})` : '';
  return `${status.description}${details}`;
}

async function waitForSuccessfulAuth(referenceNumber: string, authToken: string): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(
      `${apiBaseUrl}/auth/status?environment=demo&referenceNumber=${encodeURIComponent(referenceNumber)}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    await assertOk(response, 'Failed to read KSeF authentication status.');
    const payload = (await response.json()) as KsefAuthStatusResponse;

    if (payload.status.code === 200) {
      return;
    }

    if (payload.status.code !== 100) {
      throw new KsefError(`KSeF authentication failed: ${describeStatus(payload.status)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new KsefError('KSeF authentication timed out.');
}

async function redeemAccessToken(baseUrl: string, authToken: string): Promise<KsefTokensResponse> {
  const response = await fetch(`${apiBaseUrl}/auth/redeem?environment=${baseUrl === 'prod' ? 'prod' : 'demo'}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  await assertOk(response, 'Failed to redeem the KSeF access token.');
  return (await response.json()) as KsefTokensResponse;
}

async function queryInvoiceMetadata(
  accessToken: string,
  request: DownloadInvoicesRequest,
): Promise<QueryInvoicesResponse> {
  const invoices: QueryInvoicesResponse['invoices'] = [];
  let pageOffset = 0;
  let truncated = false;

  while (true) {
    const response = await fetch(
      `${apiBaseUrl}/invoices/metadata?environment=${request.environment === 'prod' ? 'prod' : 'demo'}&pageOffset=${pageOffset}&pageSize=50`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectType: request.subjectType,
          dateRange: {
            dateType: request.dateType,
            from: request.dateFrom,
            to: request.dateTo,
          },
        }),
      },
    );

    await assertOk(response, 'Failed to query KSeF invoice metadata.');
    const payload = (await response.json()) as QueryInvoicesResponse;

    invoices.push(...payload.invoices);
    truncated = truncated || payload.isTruncated;

    if (payload.isTruncated) {
      throw new KsefError('The selected date range returns too many invoices. Narrow the range and try again.');
    }

    if (invoices.length > MAX_INVOICES_PER_EXPORT) {
      throw new KsefError(
        `This MVP downloads up to ${MAX_INVOICES_PER_EXPORT} invoices per package. Narrow the date range and try again.`,
      );
    }

    if (!payload.hasMore) {
      return {
        hasMore: false,
        isTruncated: truncated,
        invoices,
        permanentStorageHwmDate: payload.permanentStorageHwmDate,
      };
    }

    pageOffset += 1;
  }
}

async function downloadInvoiceXml(accessToken: string, ksefNumber: string): Promise<string> {
  const response = await fetch(
    `${apiBaseUrl}/invoices/download?environment=demo&ksefNumber=${encodeURIComponent(ksefNumber)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  await assertOk(response, `Failed to download invoice ${ksefNumber}.`);
  return response.text();
}

export async function fetchInvoicesForDownload(request: DownloadInvoicesRequest): Promise<DownloadedInvoice[]> {
  const baseUrl = request.environment; // Now just used as string 'demo' or 'prod'
  const certificates = await getPublicCertificates(baseUrl);
  const tokenCertificate = pickTokenEncryptionCertificate(certificates);
  const challenge = await getAuthChallenge(baseUrl);
  const encryptedToken = await encryptTokenWithChallenge(
    request.token,
    challenge.timestampMs,
    tokenCertificate.certificate,
  );
  const initResponse = await initAuth(request, encryptedToken, challenge.challenge);

  await waitForSuccessfulAuth(initResponse.referenceNumber, initResponse.authenticationToken.token);

  const tokenPair = await redeemAccessToken(baseUrl, initResponse.authenticationToken.token);
  const metadataResponse = await queryInvoiceMetadata(tokenPair.accessToken.token, request);

  if (metadataResponse.invoices.length === 0) {
    throw new KsefError('No invoices were found for the selected filters.', 404);
  }

  const downloadedInvoices: DownloadedInvoice[] = [];
  for (const metadata of metadataResponse.invoices) {
    const xml = await downloadInvoiceXml(tokenPair.accessToken.token, metadata.ksefNumber);
    downloadedInvoices.push({ metadata, xml });
  }

  return downloadedInvoices;
}

export function getErrorMessage(error: unknown): { status: number; message: string; details?: unknown } {
  if (error instanceof KsefError) {
    return {
      status: error.status ?? 400,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message,
    };
  }

  return {
    status: 500,
    message: 'Unknown error.',
  };
}
