import { constants, publicEncrypt, X509Certificate } from 'node:crypto';

import { config, ksefApiBaseUrls } from '../config.js';
import type {
  DownloadInvoicesRequest,
  DownloadedInvoice,
  KsefAuthStatusResponse,
  KsefChallengeResponse,
  KsefInitAuthResponse,
  KsefOperationStatus,
  KsefTokensResponse,
  PublicCertificateInfo,
  QueryInvoicesResponse,
} from '../types.js';

class KsefError extends Error {
  constructor(message: string, readonly status?: number, readonly details?: unknown) {
    super(message);
    this.name = 'KsefError';
  }
}

function getBaseUrl(environment: DownloadInvoicesRequest['environment']): string {
  return ksefApiBaseUrls[environment];
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
  const response = await fetch(`${baseUrl}/security/public-key-certificates`);
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

function encryptTokenWithChallenge(token: string, timestampMs: number, certificateBase64: string): string {
  const certificateBuffer = Buffer.from(certificateBase64, 'base64');
  const certificate = new X509Certificate(certificateBuffer);
  const payload = Buffer.from(`${token}|${timestampMs}`, 'utf8');
  const encrypted = publicEncrypt(
    {
      key: certificate.publicKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    payload,
  );

  return encrypted.toString('base64');
}

async function getAuthChallenge(baseUrl: string): Promise<KsefChallengeResponse> {
  const response = await fetch(`${baseUrl}/auth/challenge`, {
    method: 'POST',
  });

  await assertOk(response, 'Failed to get KSeF auth challenge.');
  return (await response.json()) as KsefChallengeResponse;
}

async function initAuth(baseUrl: string, request: DownloadInvoicesRequest, encryptedToken: string, challenge: string): Promise<KsefInitAuthResponse> {
  const response = await fetch(`${baseUrl}/auth/ksef-token`, {
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

function describeStatus(status: KsefOperationStatus): string {
  const details = status.details?.length ? ` (${status.details.join(', ')})` : '';
  return `${status.description}${details}`;
}

async function waitForSuccessfulAuth(baseUrl: string, referenceNumber: string, authToken: string): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(`${baseUrl}/auth/${encodeURIComponent(referenceNumber)}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

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
  const response = await fetch(`${baseUrl}/auth/token/redeem`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  await assertOk(response, 'Failed to redeem the KSeF access token.');
  return (await response.json()) as KsefTokensResponse;
}

async function queryInvoiceMetadata(baseUrl: string, accessToken: string, request: DownloadInvoicesRequest): Promise<QueryInvoicesResponse> {
  const invoices: QueryInvoicesResponse['invoices'] = [];
  let pageOffset = 0;
  let truncated = false;

  while (true) {
    const response = await fetch(
      `${baseUrl}/invoices/query/metadata?sortOrder=Asc&pageOffset=${pageOffset}&pageSize=50`,
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

    if (invoices.length > config.maxInvoicesPerExport) {
      throw new KsefError(
        `This MVP downloads up to ${config.maxInvoicesPerExport} invoices per package. Narrow the date range and try again.`,
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

async function downloadInvoiceXml(baseUrl: string, accessToken: string, ksefNumber: string): Promise<string> {
  const response = await fetch(`${baseUrl}/invoices/ksef/${encodeURIComponent(ksefNumber)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  await assertOk(response, `Failed to download invoice ${ksefNumber}.`);
  return response.text();
}

export async function fetchInvoicesForDownload(request: DownloadInvoicesRequest): Promise<DownloadedInvoice[]> {
  const baseUrl = getBaseUrl(request.environment);
  const certificates = await getPublicCertificates(baseUrl);
  const tokenCertificate = pickTokenEncryptionCertificate(certificates);
  const challenge = await getAuthChallenge(baseUrl);
  const encryptedToken = encryptTokenWithChallenge(request.token, challenge.timestampMs, tokenCertificate.certificate);
  const initResponse = await initAuth(baseUrl, request, encryptedToken, challenge.challenge);

  await waitForSuccessfulAuth(baseUrl, initResponse.referenceNumber, initResponse.authenticationToken.token);

  const tokenPair = await redeemAccessToken(baseUrl, initResponse.authenticationToken.token);
  const metadataResponse = await queryInvoiceMetadata(baseUrl, tokenPair.accessToken.token, request);

  if (metadataResponse.invoices.length === 0) {
    throw new KsefError('No invoices were found for the selected filters.', 404);
  }

  const downloadedInvoices: DownloadedInvoice[] = [];
  for (const metadata of metadataResponse.invoices) {
    const xml = await downloadInvoiceXml(baseUrl, tokenPair.accessToken.token, metadata.ksefNumber);
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
    message: 'Unknown server error.',
  };
}
