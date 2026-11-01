import type { DownloadedInvoice } from "../types";

const sanitizeFilePart = (value: string): string =>
  value
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, "_")
    .slice(0, 80);

/** Nazwa pliku faktury: `<numer faktury>__<numer KSeF>.<rozszerzenie>`. */
export const buildInvoiceFileName = (
  invoice: Pick<DownloadedInvoice, "metadata">,
  extension: string,
): string => {
  const invoiceNumber = sanitizeFilePart(
    invoice.metadata.invoiceNumber || invoice.metadata.ksefNumber,
  );
  const ksefNumber = sanitizeFilePart(invoice.metadata.ksefNumber);
  return `${invoiceNumber}__${ksefNumber}.${extension}`;
};
