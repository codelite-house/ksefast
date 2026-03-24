import JSZip from "jszip";
import { generateInvoice } from "@akmf/ksef-fe-invoice-converter";

import type {
  DownloadFormat,
  DownloadedInvoice,
  EnvironmentName,
} from "./types";

function sanitizeFilePart(value: string): string {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

function buildInvoiceFileName(
  invoice: DownloadedInvoice,
  extension: string,
): string {
  const invoiceNumber = sanitizeFilePart(
    invoice.metadata.invoiceNumber || invoice.metadata.ksefNumber,
  );
  const ksefNumber = sanitizeFilePart(invoice.metadata.ksefNumber);
  return `${invoiceNumber}__${ksefNumber}.${extension}`;
}

const KSEF_BASE_URLS: Record<EnvironmentName, string> = {
  demo: "https://ksef-test.mf.gov.pl/invoice",
  prod: "https://ksef.mf.gov.pl/invoice",
};

export async function buildArchive(
  invoices: DownloadedInvoice[],
  format: DownloadFormat,
  environment: EnvironmentName,
): Promise<Blob> {
  const zip = new JSZip();

  for (const invoice of invoices) {
    if (format === "xml") {
      zip.file(buildInvoiceFileName(invoice, "xml"), invoice.xml);
      continue;
    }

    const xmlFile = new File(
      [invoice.xml],
      `${invoice.metadata.ksefNumber}.xml`,
      { type: "text/xml" },
    );
    const qrCode = `${KSEF_BASE_URLS[environment]}/${invoice.metadata.ksefNumber}`;
    const pdf = await generateInvoice(
      xmlFile,
      { nrKSeF: invoice.metadata.ksefNumber, qrCode },
      "blob",
    );
    zip.file(buildInvoiceFileName(invoice, "pdf"), await pdf.arrayBuffer());
  }

  zip.file(
    "manifest.json",
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

  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}
