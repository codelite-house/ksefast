import { buildKsefQrUrl } from "./lib/buildKsefQrUrl";
import { buildInvoiceFileName } from "./lib/invoiceFileName";
import { formatKsefNumberDate } from "./lib/formatKsefNumberDate";
import { mapWithConcurrency } from "./lib/mapWithConcurrency";
import JSZip from "jszip";
import { generateInvoice } from "@akmf/ksef-fe-invoice-converter";

import type {
  DownloadFormat,
  DownloadedInvoice,
  InvoiceMetadata,
} from "./types";

const PDF_CONCURRENCY = 4;

const manifestEntry = (metadata: InvoiceMetadata) => ({
  ksefNumber: metadata.ksefNumber,
  invoiceNumber: metadata.invoiceNumber,
  issueDate: metadata.issueDate,
  invoicingDate: metadata.invoicingDate,
  permanentStorageDate: metadata.permanentStorageDate,
  grossAmount: metadata.grossAmount,
  currency: metadata.currency,
});

const addXmlInvoices = (zip: JSZip, invoices: DownloadedInvoice[]): void => {
  for (const invoice of invoices) {
    zip.file(buildInvoiceFileName(invoice, "xml"), invoice.xml);
  }
};

/**
 * PDF jednej faktury oficjalnym generatorem MF, z kodem QR weryfikacji w KSeF.
 */
export const generateInvoicePdf = async (
  invoice: DownloadedInvoice,
): Promise<ArrayBuffer> => {
  const xmlFile = new File([invoice.xml], `${invoice.metadata.ksefNumber}.xml`, {
    type: "text/xml",
  });
  const qrCode = await buildKsefQrUrl(
    invoice.xml,
    invoice.metadata.seller.nip || "",
    invoice.metadata.issueDate,
  );
  const pdf = await generateInvoice(
    xmlFile,
    {
      nrKSeF: invoice.metadata.ksefNumber,
      acDate: formatKsefNumberDate(invoice.metadata),
      qrCode,
    },
    "blob",
  );
  return pdf.arrayBuffer();
};

const addPdfInvoices = async (
  zip: JSZip,
  invoices: DownloadedInvoice[],
): Promise<void> => {
  const pdfEntries = await mapWithConcurrency(
    invoices,
    PDF_CONCURRENCY,
    async (invoice) => ({
      name: buildInvoiceFileName(invoice, "pdf"),
      buffer: await generateInvoicePdf(invoice),
    }),
  );

  for (const { name, buffer } of pdfEntries) {
    zip.file(name, buffer);
  }
};

export interface ArchiveBuilder {
  addInvoices: (invoices: DownloadedInvoice[]) => Promise<void>;
  finalize: () => Promise<Blob>;
}

export const createArchiveBuilder = (format: DownloadFormat): ArchiveBuilder => {
  const zip = new JSZip();
  const manifestInvoices: ReturnType<typeof manifestEntry>[] = [];

  return {
    addInvoices: async (invoices: DownloadedInvoice[]) => {
      if (invoices.length === 0) return;

      if (format === "xml") {
        addXmlInvoices(zip, invoices);
      } else {
        await addPdfInvoices(zip, invoices);
      }

      for (const { metadata } of invoices) {
        manifestInvoices.push(manifestEntry(metadata));
      }
    },
    finalize: async () => {
      zip.file(
        "manifest.json",
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            format,
            invoiceCount: manifestInvoices.length,
            invoices: manifestInvoices,
          },
          null,
          2,
        ),
      );

      return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    },
  };
};

export const buildArchive = async (
  invoices: DownloadedInvoice[],
  format: DownloadFormat,
): Promise<Blob> => {
  const builder = createArchiveBuilder(format);
  await builder.addInvoices(invoices);
  return builder.finalize();
};
