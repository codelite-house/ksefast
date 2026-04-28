import { useMutation } from "@tanstack/react-query";
import { getPublicCertificates } from "../services/securityService";
import {
  getChallenge,
  initTokenAuth,
  getAuthStatus,
  redeemToken,
} from "../services/authService";
import {
  queryInvoiceMetadata,
  downloadInvoiceXml,
} from "../services/invoicesService";
import { encryptTokenWithChallenge } from "../lib/crypto";
import { buildArchive } from "../archiveService";
import type { DownloadInvoicesRequest, DownloadedInvoice } from "../types";

const MAX_INVOICES_PER_EXPORT = 50;
const AUTH_POLL_MAX_ATTEMPTS = 20;
const AUTH_POLL_INTERVAL_MS = 1000;

const pollUntilAuthorized = async (
  environment: DownloadInvoicesRequest["environment"],
  referenceNumber: string,
  authToken: string,
): Promise<void> => {
  for (let attempt = 0; attempt < AUTH_POLL_MAX_ATTEMPTS; attempt++) {
    const result = await getAuthStatus(environment, referenceNumber, authToken);

    if (result.status.code === 200) return;

    if (result.status.code !== 100) {
      const details = result.status.details?.length
        ? ` (${result.status.details.join(", ")})`
        : "";
      const detailsText = result.status.details?.join(" ").toLowerCase() ?? "";
      const tokenHint =
        detailsText.includes("token") &&
        detailsText.includes("nie został znaleziony")
          ? " Sprawdź, czy używasz tokena z właściwego środowiska (demo/prod) i czy token jest nadal aktywny."
          : "";
      throw new Error(
        `KSeF authentication failed: ${result.status.description}${details}${tokenHint}`,
      );
    }

    await new Promise<void>((resolve) =>
      setTimeout(resolve, AUTH_POLL_INTERVAL_MS),
    );
  }

  throw new Error("KSeF authentication timed out after 20 attempts.");
};

export interface DownloadResult {
  blob: Blob;
  fileName: string;
  invoiceCount: number;
}

/**
 * Hook do pobrania paczki faktur z KSeF.
 * Sekwencja: certyfikaty → challenge → RSA encrypt → init auth → polling →
 *            redeem → metadane → pobieranie XMLi → ZIP/PDF archive.
 */
export const useDownloadInvoices = () =>
  useMutation<DownloadResult, Error, DownloadInvoicesRequest>({
    mutationFn: async (request) => {
      const { environment, token } = request;
      const normalizedToken = token.trim();

      if (!normalizedToken) {
        throw new Error("KSeF token is required.");
      }

      // 1. Certyfikaty klucza publicznego
      const certificates = await getPublicCertificates(environment);
      const encryptionCert = certificates.find((c) =>
        (c.usage ?? []).some((u) => u.toLowerCase() === "kseftokenencryption"),
      );
      if (!encryptionCert) {
        throw new Error("KSeF token encryption certificate not found.");
      }

      // 2. Challenge
      const challenge = await getChallenge(environment);

      // 3. Szyfrowanie tokena w przeglądarce (RSA-OAEP, token nie opuszcza przeglądarki)
      const encryptedToken = await encryptTokenWithChallenge(
        normalizedToken,
        challenge.timestampMs,
        encryptionCert.certificate,
      );

      // 4. Inicjalizacja autoryzacji
      const initResponse = await initTokenAuth(environment, {
        challenge: challenge.challenge,
        contextIdentifier: {
          type: request.contextType,
          value: request.contextValue,
        },
        encryptedToken,
        authorizationPolicy: null,
      });

      // 5. Polling statusu autoryzacji
      await pollUntilAuthorized(
        environment,
        initResponse.referenceNumber,
        initResponse.authenticationToken.token,
      );

      // 6. Wymiana authToken → accessToken
      const tokens = await redeemToken(
        environment,
        initResponse.authenticationToken.token,
      );

      // 7. Pobieranie metadanych (z paginacją)
      const allInvoices = [];
      let pageOffset = 0;

      while (true) {
        const page = await queryInvoiceMetadata(
          environment,
          tokens.accessToken.token,
          {
            subjectType: request.subjectType,
            dateRange: {
              dateType: request.dateType,
              from: request.dateFrom,
              to: request.dateTo,
            },
          },
          pageOffset,
        );

        allInvoices.push(...page.invoices);

        if (page.isTruncated) {
          throw new Error(
            "Too many invoices in the selected range. Narrow the date range and try again.",
          );
        }

        if (allInvoices.length > MAX_INVOICES_PER_EXPORT) {
          throw new Error(
            `Max ${MAX_INVOICES_PER_EXPORT} invoices per export. Narrow the date range and try again.`,
          );
        }

        if (!page.hasMore) break;
        pageOffset++;
      }

      if (allInvoices.length === 0) {
        throw new Error("No invoices found for the selected filters.");
      }

      // 8. Pobieranie XMLi (sekwencyjnie — nie zalewamy KSeF równoległymi requestami)
      const downloaded: DownloadedInvoice[] = [];
      for (const metadata of allInvoices) {
        const xml = await downloadInvoiceXml(
          environment,
          tokens.accessToken.token,
          metadata.ksefNumber,
        );
        downloaded.push({ metadata, xml });
      }

      // 9. Budowanie archiwum ZIP
      const blob = await buildArchive(downloaded, request.format);
      const today = new Date().toISOString().slice(0, 10);

      return {
        blob,
        fileName: `ksefast-${request.format}-${today}.zip`,
        invoiceCount: allInvoices.length,
      };
    },
  });
