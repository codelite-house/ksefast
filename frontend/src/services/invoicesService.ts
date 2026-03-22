import { apiFetch } from "./apiClient";
import type {
  EnvironmentName,
  InvoiceQueryFilters,
  QueryInvoicesResponse,
} from "../types";

/**
 * POST /invoices/metadata  (proxy → POST /invoices/query/metadata w KSeF v2)
 * Zapytanie o metadane faktur z paginacją.
 */
export function queryInvoiceMetadata(
  environment: EnvironmentName,
  accessToken: string,
  filters: InvoiceQueryFilters,
  pageOffset = 0,
  pageSize = 50,
): Promise<QueryInvoicesResponse> {
  return apiFetch<QueryInvoicesResponse>(
    `/invoices/metadata?environment=${environment}&pageOffset=${pageOffset}&pageSize=${pageSize}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    },
  );
}

/**
 * GET /invoices/download  (proxy → GET /invoices/ksef/{ksefNumber} w KSeF v2)
 * Pobierz XML faktury po numerze KSeF.
 */
export function downloadInvoiceXml(
  environment: EnvironmentName,
  accessToken: string,
  ksefNumber: string,
): Promise<string> {
  return apiFetch<string>(
    `/invoices/download?environment=${environment}&ksefNumber=${encodeURIComponent(ksefNumber)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
}
