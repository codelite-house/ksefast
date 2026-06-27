import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { createArchiveBuilder } from "../archiveService";
import { fetchAllInvoiceMetadata } from "../lib/fetchAllInvoiceMetadata";
import { encryptTokenWithChallenge } from "../lib/crypto";
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

const AUTH_POLL_MAX_ATTEMPTS = 20;
const AUTH_POLL_INTERVAL_MS = 1000;
const DOWNLOAD_CHUNK_SIZE = 25;

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

      const certificates = await getPublicCertificates(environment);
      const encryptionCert = certificates.find((c) =>
        (c.usage ?? []).some((u) => u.toLowerCase() === "kseftokenencryption"),
      );
      if (!encryptionCert) {
        throw new Error("KSeF token encryption certificate not found.");
      }

      const challenge = await getChallenge(environment);

      const encryptedToken = await encryptTokenWithChallenge(
        normalizedToken,
        challenge.timestampMs,
        encryptionCert.certificate,
      );

      const initResponse = await initTokenAuth(environment, {
        challenge: challenge.challenge,
        contextIdentifier: {
          type: request.contextType,
          value: request.contextValue,
        },
        encryptedToken,
        authorizationPolicy: null,
      });

      await pollUntilAuthorized(
        environment,
        initResponse.referenceNumber,
        initResponse.authenticationToken.token,
      );

      const tokens = await redeemToken(
        environment,
        initResponse.authenticationToken.token,
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
