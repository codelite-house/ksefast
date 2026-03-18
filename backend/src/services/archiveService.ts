import JSZip from 'jszip';
import { renderPdfFromXml } from '@mdab25/ksef-pdf';

import type { DownloadFormat, DownloadedInvoice } from '../types.js';

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
): Promise<Buffer> {
  const zip = new JSZip();

  for (const invoice of invoices) {
    if (format === 'xml') {
      zip.file(buildInvoiceFileName(invoice, 'xml'), invoice.xml);
      continue;
    }

    const pdf = await renderPdfFromXml(invoice.xml);
    zip.file(buildInvoiceFileName(invoice, 'pdf'), Buffer.from(pdf));
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

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
