import { queryInvoiceMetadata } from "../services/invoicesService";
import type {
  DateType,
  EnvironmentName,
  InvoiceMetadata,
  InvoiceQueryFilters,
} from "../types";

export const MAX_INVOICES_PER_EXPORT = 2000;
export const METADATA_PAGE_SIZE = 50;

const getMetadataDate = (
  metadata: InvoiceMetadata,
  dateType: DateType,
): string => {
  switch (dateType) {
    case "Issue":
      return metadata.issueDate;
    case "Invoicing":
      return metadata.invoicingDate;
    case "PermanentStorage":
      return metadata.permanentStorageDate;
  }
};

export interface FetchAllInvoiceMetadataOptions {
  maxInvoices?: number;
  pageSize?: number;
  onFoundCount?: (count: number) => void;
}

/**
 * Pobiera wszystkie metadane faktur z KSeF z pełną paginacją (pageOffset + isTruncated).
 * Zgodnie z dokumentacją KSeF v2 przy sortowaniu Asc.
 */
export const fetchAllInvoiceMetadata = async (
  environment: EnvironmentName,
  accessToken: string,
  filters: InvoiceQueryFilters,
  options: FetchAllInvoiceMetadataOptions = {},
): Promise<InvoiceMetadata[]> => {
  const maxInvoices = options.maxInvoices ?? MAX_INVOICES_PER_EXPORT;
  const pageSize = options.pageSize ?? METADATA_PAGE_SIZE;

  const allInvoices: InvoiceMetadata[] = [];
  const seenKsefNumbers = new Set<string>();

  let dateFrom = filters.dateRange.from;
  const dateTo = filters.dateRange.to;
  let pageOffset = 0;

  while (true) {
    const page = await queryInvoiceMetadata(
      environment,
      accessToken,
      {
        ...filters,
        dateRange: {
          ...filters.dateRange,
          from: dateFrom,
          to: dateTo,
        },
      },
      pageOffset,
      pageSize,
    );

    for (const invoice of page.invoices) {
      if (seenKsefNumbers.has(invoice.ksefNumber)) continue;
      seenKsefNumbers.add(invoice.ksefNumber);
      allInvoices.push(invoice);
    }

    options.onFoundCount?.(allInvoices.length);

    if (allInvoices.length > maxInvoices) {
      throw new Error(
        `Wybrany okres zawiera ponad ${maxInvoices} faktur. Wybierz krótszy zakres (np. jeden miesiąc) i spróbuj ponownie.`,
      );
    }

    if (!page.hasMore) break;

    if (page.isTruncated) {
      const last = page.invoices[page.invoices.length - 1];
      if (!last) break;

      dateFrom = getMetadataDate(last, filters.dateRange.dateType);
      pageOffset = 0;
      continue;
    }

    pageOffset++;
  }

  return allInvoices;
};
