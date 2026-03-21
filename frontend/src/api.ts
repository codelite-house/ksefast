import { fetchInvoicesForDownload, getErrorMessage } from './ksefClient';
import { buildArchive } from './archiveService';
import type { DownloadInvoicesRequest } from './types';

interface DownloadResult {
  blob: Blob;
  fileName: string;
}

export async function downloadArchive(payload: DownloadInvoicesRequest): Promise<DownloadResult> {
  try {
    const invoices = await fetchInvoicesForDownload(payload);
    const blob = await buildArchive(invoices, payload.format);
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `ksefast-${payload.format}-${today}.zip`;

    return {
      blob,
      fileName,
    };
  } catch (error) {
    const failure = getErrorMessage(error);
    throw new Error(failure.message);
  }
}

