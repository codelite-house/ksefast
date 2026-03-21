import JSZip from 'jszip';
import { renderPdfFromXml } from '@mdab25/ksef-pdf';

import type { DownloadFormat, DownloadedInvoice } from './types';

function sanitizeFilePart(value: string): string {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 80);
}

function buildInvoiceFileName(invoice: DownloadedInvoice, extension: string): string {
  const invoiceNumber = sanitizeFilePart(invoice.metadata.invoiceNumber || invoice.metadata.ksefNumber);
  const ksefNumber = sanitizeFilePart(invoice.metadata.ksefNumber);
  return `${invoiceNumber}__${ksefNumber}.${extension}`;
}

export async function buildArchive(
  invoices: DownloadedInvoice[],
  format: DownloadFormat,
): Promise<Blob> {
  const zip = new JSZip();

  for (const invoice of invoices) {
    if (format === 'xml') {
      zip.file(buildInvoiceFileName(invoice, 'xml'), invoice.xml);
      continue;
    }

    const pdf = await renderPdfFromXml(invoice.xml);
    const pdfData = pdf instanceof Uint8Array ? pdf : new Uint8Array(pdf);
    zip.file(buildInvoiceFileName(invoice, 'pdf'), pdfData);
  }

  zip.file(
    'manifest.json',
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        format,
        invoiceCount: invoices.length,
        invoices: invoices.map(({ metadata }) => ({
          ksefNumber: metadata.ksefNumber,
          invoiceNumber: metadata.invoiceNumber,
          issueDate: metadata.issueDate,
          invoicingDate: metadata.invoicingDate,
          permanentStorageDate: metadata.permanentStorageDate,
          grossAmount: metadata.grossAmount,
          currency: metadata.currency,
        })),
      },
      null,
      2,
    ),
  );

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
