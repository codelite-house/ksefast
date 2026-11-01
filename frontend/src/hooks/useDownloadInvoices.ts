import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { createArchiveBuilder } from "../archiveService";
import { fetchAllInvoiceMetadata } from "../lib/fetchAllInvoiceMetadata";
import { authenticateWithToken } from "../lib/authenticateWithToken";
import {
  getChallenge,
  getAuthStatus,
  initTokenAuth,
  redeemToken,
} from "../services/authService";
import {
  downloadInvoiceXml,
} from "../services/invoicesService";
import { getPublicCertificates } from "../services/securityService";
import type {
  DownloadInvoicesRequest,
  DownloadedInvoice,
  DownloadProgress,
  InvoiceMetadata,
} from "../types";

const DOWNLOAD_CHUNK_SIZE = 25;

const downloadInvoiceChunk = async (
  environment: DownloadInvoicesRequest["environment"],
  accessToken: string,
  metadataChunk: InvoiceMetadata[],
): Promise<DownloadedInvoice[]> => {
  const downloaded: DownloadedInvoice[] = [];

  for (const metadata of metadataChunk) {
    const xml = await downloadInvoiceXml(
      environment,
      accessToken,
      metadata.ksefNumber,
    );
    downloaded.push({ metadata, xml });
  }

  return downloaded;
};

export interface DownloadResult {
  blob: Blob;
  fileName: string;
  invoiceCount: number;
}

/**
 * Hook do pobrania paczki faktur z KSeF.
 * Sekwencja: certyfikaty → challenge → RSA encrypt → init auth → polling →
 *            redeem → metadane (pełna paginacja) → pobieranie XML partiami → ZIP/PDF.
 */
export const useDownloadInvoices = () => {
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const mutation = useMutation<DownloadResult, Error, DownloadInvoicesRequest>({
    mutationFn: async (request) => {
      const report = (update: DownloadProgress) => setProgress(update);

      const { environment, token } = request;
      const normalizedToken = token.trim();

      if (!normalizedToken) {
        throw new Error("KSeF token is required.");
      }

      report({ phase: "auth", message: "Logowanie do KSeF…" });

      const tokens = await authenticateWithToken(
        {
          getPublicCertificates: () => getPublicCertificates(environment),
          getChallenge: () => getChallenge(environment),
          initTokenAuth: (body) => initTokenAuth(environment, body),
          getAuthStatus: (referenceNumber, authToken) =>
            getAuthStatus(environment, referenceNumber, authToken),
          redeemToken: (authToken) => redeemToken(environment, authToken),
        },
        {
          token: normalizedToken,
          contextType: request.contextType,
          contextValue: request.contextValue,
        },
      );

      report({ phase: "metadata", message: "Wyszukiwanie faktur…", current: 0 });

      const allInvoices = await fetchAllInvoiceMetadata(
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
        {
          onFoundCount: (count) =>
            report({
              phase: "metadata",
              message: `Wyszukiwanie faktur… (znaleziono ${count})`,
              current: count,
            }),
        },
      );

      if (allInvoices.length === 0) {
        throw new Error("Brak faktur dla wybranych filtrów.");
      }

      const total = allInvoices.length;
      const archive = createArchiveBuilder(request.format);
      let downloadedCount = 0;

      for (let offset = 0; offset < total; offset += DOWNLOAD_CHUNK_SIZE) {
        const chunk = allInvoices.slice(offset, offset + DOWNLOAD_CHUNK_SIZE);

        report({
          phase: "download",
          message: `Pobieranie faktur… (${downloadedCount}/${total})`,
          current: downloadedCount,
          total,
        });

        const downloadedChunk = await downloadInvoiceChunk(
          environment,
          tokens.accessToken.token,
          chunk,
        );

        downloadedCount += downloadedChunk.length;

        report({
          phase: "download",
          message: `Pobieranie faktur… (${downloadedCount}/${total})`,
          current: downloadedCount,
          total,
        });

        if (request.format === "pdf") {
          report({
            phase: "archive",
            message: `Konwersja do PDF… (${downloadedCount}/${total})`,
            current: downloadedCount,
            total,
          });
        }

        await archive.addInvoices(downloadedChunk);
      }

      report({
        phase: "archive",
        message: "Tworzenie paczki ZIP…",
        current: total,
        total,
      });

      const blob = await archive.finalize();
      const today = new Date().toISOString().slice(0, 10);

      return {
        blob,
        fileName: `ksefast-${request.format}-${today}.zip`,
        invoiceCount: total,
      };
    },
    onSettled: () => setProgress(null),
  });

  return { ...mutation, progress };
};
