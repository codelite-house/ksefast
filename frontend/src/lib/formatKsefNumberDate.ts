import type { InvoiceMetadata } from "../types";

/**
 * Data nadania numeru KSeF w formacie DD.MM.RRRR – tak jak drukuje ją portal MF w nagłówku PDF.
 * Źródłem jest data zapisana w samym numerze KSeF (RRRRMMDD); gdy numer ma nietypowy format,
 * używamy daty przyjęcia faktury z metadanych.
 */
export const formatKsefNumberDate = (
  metadata: Pick<InvoiceMetadata, "ksefNumber" | "invoicingDate">,
): string | undefined => {
  const fromNumber = /^[^-]+-(\d{4})(\d{2})(\d{2})-/.exec(metadata.ksefNumber);
  if (fromNumber) {
    const [, year, month, day] = fromNumber;
    return `${day}.${month}.${year}`;
  }

  const fromInvoicing = /^(\d{4})-(\d{2})-(\d{2})/.exec(metadata.invoicingDate ?? "");
  if (fromInvoicing) {
    const [, year, month, day] = fromInvoicing;
    return `${day}.${month}.${year}`;
  }

  return undefined;
};
