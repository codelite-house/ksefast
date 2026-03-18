export interface DownloadPayload {
  environment: 'demo' | 'prod';
  token: string;
  contextType: 'Nip' | 'InternalId' | 'NipVatUe' | 'PeppolId';
  contextValue: string;
  subjectType: 'Subject1' | 'Subject2' | 'Subject3' | 'SubjectAuthorized';
  dateType: 'Issue' | 'Invoicing' | 'PermanentStorage';
  dateFrom: string;
  dateTo: string;
  format: 'xml' | 'pdf';
  email?: string;
}

interface DownloadResult {
  blob: Blob;
  fileName: string;
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, '');

export async function downloadArchive(payload: DownloadPayload): Promise<DownloadResult> {
  const response = await fetch(`${apiBaseUrl}/api/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    const errorPayload = contentType.includes('application/json') ? await response.json() : await response.text();
    const message = typeof errorPayload === 'object' && errorPayload !== null && 'message' in errorPayload
      ? String(errorPayload.message)
      : 'Nie udało się pobrać paczki.';
    throw new Error(message);
  }

  const disposition = response.headers.get('content-disposition') ?? '';
  const fileNameMatch = disposition.match(/filename="([^"]+)"/i);

  return {
    blob: await response.blob(),
    fileName: fileNameMatch?.[1] ?? 'ksefast.zip',
  };
}
