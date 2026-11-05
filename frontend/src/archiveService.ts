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

/** Folder faktury w paczce (np. `zakupy`) – brak = katalog główny. */
export type InvoiceFolderResolver = (metadata: InvoiceMetadata) => string | undefined;

const withFolder = (folder: string | undefined, name: string): string =>
  folder ? `${folder}/${name}` : name;

const manifestEntry = (metadata: InvoiceMetadata, folder?: string) => ({
  ...(folder && { folder }),
  ksefNumber: metadata.ksefNumber,
  invoiceNumber: metadata.invoiceNumber,
  issueDate: metadata.issueDate,
  invoicingDate: metadata.invoicingDate,
  permanentStorageDate: metadata.permanentStorageDate,
  grossAmount: metadata.grossAmount,
  currency: metadata.currency,
});

const addXmlInvoices = (
  zip: JSZip,
  invoices: DownloadedInvoice[],
  folderFor: InvoiceFolderResolver,
): void => {
  for (const invoice of invoices) {
    zip.file(withFolder(folderFor(invoice.metadata), buildInvoiceFileName(invoice, "xml")), invoice.xml);
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
  folderFor: InvoiceFolderResolver,
): Promise<void> => {
  const pdfEntries = await mapWithConcurrency(
    invoices,
    PDF_CONCURRENCY,
    async (invoice) => ({
      name: withFolder(folderFor(invoice.metadata), buildInvoiceFileName(invoice, "pdf")),
      buffer: await generateInvoicePdf(invoice),
    }),
  );

  for (const { name, buffer } of pdfEntries) {
    zip.file(name, buffer);
  }
};

export interface ArchiveBuilder {
  addInvoices: (invoices: DownloadedInvoice[]) => Promise<void>;
  /** Faktury, których nie udało się pobrać – trafiają do manifest.json i BRAKUJACE.txt. */
  setMissing: (invoices: InvoiceMetadata[]) => void;
  finalize: () => Promise<Blob>;
}

export const MISSING_FILE_NAME = "BRAKUJACE.txt";

const missingFileContent = (invoices: InvoiceMetadata[]): string =>
  [
    `Tych ${invoices.length} faktur nie udało się pobrać z KSeF (najczęściej z powodu limitu pobrań).`,
    "Dociągniesz je na ksefast.pl przyciskiem \"Dociągnij brakujące\" albo lokalnym CLI.",
    "",
    "Numer KSeF\tNumer faktury\tData wystawienia",
    ...invoices.map((m) => `${m.ksefNumber}\t${m.invoiceNumber}\t${m.issueDate}`),
    "",
  ].join("\r\n");

export const createArchiveBuilder = (
  format: DownloadFormat,
  folderFor: InvoiceFolderResolver = () => undefined,
): ArchiveBuilder => {
  const zip = new JSZip();
  const manifestInvoices: ReturnType<typeof manifestEntry>[] = [];
  let missing: InvoiceMetadata[] = [];

  return {
    addInvoices: async (invoices: DownloadedInvoice[]) => {
      if (invoices.length === 0) return;

      if (format === "xml") {
        addXmlInvoices(zip, invoices, folderFor);
      } else {
        await addPdfInvoices(zip, invoices, folderFor);
      }

      for (const { metadata } of invoices) {
        manifestInvoices.push(manifestEntry(metadata, folderFor(metadata)));
      }
    },
    setMissing: (invoices) => {
      missing = invoices;
    },
    finalize: async () => {
      if (missing.length > 0) {
        zip.file(MISSING_FILE_NAME, missingFileContent(missing));
      }
      zip.file(
        "manifest.json",
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            format,
            invoiceCount: manifestInvoices.length,
            invoices: manifestInvoices,
            ...(missing.length > 0 && {
              missingInvoices: missing.map((metadata) => manifestEntry(metadata, folderFor(metadata))),
            }),
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
