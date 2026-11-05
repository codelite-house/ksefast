import { ksefFetch, type KsefRequestControl } from "./apiClient";
import type {
  EnvironmentName,
  InvoiceQueryFilters,
  QueryInvoicesResponse,
} from "../types";

/**
 * POST /invoices/metadata  (proxy → POST /invoices/query/metadata w KSeF v2)
 * Zapytanie o metadane faktur z paginacją.
 */
export const queryInvoiceMetadata = (
  environment: EnvironmentName,
  accessToken: string,
  filters: InvoiceQueryFilters,
  pageOffset = 0,
  pageSize = 50,
  control?: KsefRequestControl,
): Promise<QueryInvoicesResponse> =>
  ksefFetch<QueryInvoicesResponse>(
    `/invoices/metadata?environment=${environment}&pageOffset=${pageOffset}&pageSize=${pageSize}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    },
    control,
  );

/**
 * POST /invoices/download  (proxy → GET /invoices/ksef/{ksefNumber} w KSeF v2)
 * Pobierz XML faktury po numerze KSeF. Numer idzie w treści, nie w adresie – nie trafia do logów dostępowych.
 */
export const downloadInvoiceXml = (
  environment: EnvironmentName,
  accessToken: string,
  ksefNumber: string,
  control?: KsefRequestControl,
): Promise<string> =>
  ksefFetch<string>(
    `/invoices/download?environment=${environment}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ksefNumber }),
    },
    control,
  );
