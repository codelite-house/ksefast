import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { register } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  authenticateWithToken,
  type TokenAuthOptions,
} from "../../frontend/src/lib/authenticateWithToken";
import { fetchAllInvoiceMetadata } from "../../frontend/src/lib/fetchAllInvoiceMetadata";
import { buildInvoiceFileName } from "../../frontend/src/lib/invoiceFileName";
import type {
  DownloadedInvoice,
  EnvironmentName,
  SubjectType,
} from "../../frontend/src/types";
import { RateLimitedError, type DirectClient } from "./directClient";
import {
  KSEF_NUMBER_RE,
  collectExistingNames,
  ksefNumberMonth,
  monthSearchRange,
  type YearMonth,
} from "./files";

export type OutputFormat = "pdf" | "xml";

export interface DownloadCommand {
  environment: EnvironmentName;
  nip: string;
  token: string;
  month: YearMonth;
  subject: SubjectType;
  /** Tu trafiają PDF-y (a XML-e, gdy `xmlDir` jest tym samym folderem). */
  outDir: string;
  xmlDir: string;
  formats: ReadonlySet<OutputFormat>;
  dryRun: boolean;
  /** Bezpiecznik pod limit KSeF (64 pobrania faktur na godzinę). */
  maxDownloads: number;
}

export interface DownloadDeps {
  client: DirectClient;
  log?: (line: string) => void;
  renderPdf?: (invoice: DownloadedInvoice) => Promise<ArrayBuffer>;
  authOptions?: TokenAuthOptions;
}

export interface DownloadSummary {
  /** Faktury w KSeF przyjęte w wybranym miesiącu. */
  found: number;
  /** Z nich już leżące w folderze (pomijane). */
  existing: number;
  downloaded: number;
  failed: string[];
  pdfFailed: string[];
  /** Przerwano z powodu limitów KSeF – kolejne uruchomienie dociągnie resztę. */
  rateLimited: boolean;
}

const GENERATOR_DIR = fileURLToPath(
  new URL("../../frontend/node_modules/@akmf/ksef-fe-invoice-converter/", import.meta.url),
);

const loadPdfRenderer = async (): Promise<(invoice: DownloadedInvoice) => Promise<ArrayBuffer>> => {
  // Ładowane dopiero, gdy potrzebne – generator PDF (pdfmake + czcionki) jest ciężki.
  const { installFileReaderPolyfill } = await import("./nodePolyfills");
  installFileReaderPolyfill();
  // Alias `@shared` używany wewnątrz generatora (patrz aliasHook.mjs).
  register("./aliasHook.mjs", import.meta.url, {
    data: { sharedDir: join(GENERATOR_DIR, "src", "shared") },
  });
  const { generateInvoicePdf } = await import("../../frontend/src/archiveService");
  return generateInvoicePdf;
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const runDownload = async (
  cmd: DownloadCommand,
  deps: DownloadDeps,
): Promise<DownloadSummary> => {
  const { client } = deps;
  const log = deps.log ?? console.log;
  const summary: DownloadSummary = {
    found: 0,
    existing: 0,
    downloaded: 0,
    failed: [],
    pdfFailed: [],
    rateLimited: false,
  };

  const tokens = await authenticateWithToken(
    client,
    { token: cmd.token, contextType: "Nip", contextValue: cmd.nip },
    deps.authOptions,
  );
  const accessToken = tokens.accessToken.token;

  try {
    const invoices = await fetchAllInvoiceMetadata(
      cmd.environment,
      accessToken,
      {
        subjectType: cmd.subject,
        dateRange: { dateType: "Invoicing", ...monthSearchRange(cmd.month) },
      },
      {
        query: (filters, pageOffset, pageSize) =>
          client.queryInvoiceMetadata(accessToken, filters, pageOffset, pageSize),
      },
    );

    const inMonth = invoices.filter((meta) => {
      const received = ksefNumberMonth(meta.ksefNumber);
      return received?.year === cmd.month.year && received.month === cmd.month.month;
    });
    const existingNames = await collectExistingNames([cmd.outDir, cmd.xmlDir]);
    const todo = inMonth.filter((meta) => !existingNames.includes(meta.ksefNumber));

    summary.found = inMonth.length;
    summary.existing = inMonth.length - todo.length;
    const label = `${cmd.month.year}-${String(cmd.month.month).padStart(2, "0")}`;
    log(
      `${label}: w KSeF ${summary.found}, już w folderze ${summary.existing}, do pobrania ${todo.length}`,
    );

    let renderPdf = deps.renderPdf;

    for (const meta of todo) {
      const seller = meta.seller.name || meta.seller.nip || "?";
      const line = `  + ${meta.ksefNumber} | ${seller} | ${meta.invoiceNumber} | ${meta.grossAmount.toFixed(2)} ${meta.currency}`;

      if (!KSEF_NUMBER_RE.test(meta.ksefNumber)) {
        log(`  ! pomijam podejrzany numer KSeF: ${JSON.stringify(meta.ksefNumber)}`);
        summary.failed.push(meta.ksefNumber);
        continue;
      }
      if (cmd.dryRun) {
        log(`${line}  [dry-run]`);
        continue;
      }
      if (summary.downloaded >= cmd.maxDownloads) {
        summary.rateLimited = true;
        log(`Osiągnięto limit ${cmd.maxDownloads} pobrań na uruchomienie – reszta przy kolejnym.`);
        break;
      }

      try {
        const { bytes, hash } = await client.downloadInvoiceXml(accessToken, meta.ksefNumber);
        const expectedHash = hash ?? meta.invoiceHash;
        if (expectedHash && createHash("sha256").update(bytes).digest("base64") !== expectedHash) {
          throw new Error("niezgodna suma kontrolna faktury");
        }

        const invoice: DownloadedInvoice = { metadata: meta, xml: new TextDecoder().decode(bytes) };
        const notes: string[] = [];
        let xmlSaved = false;

        const saveXml = async (): Promise<void> => {
          await mkdir(cmd.xmlDir, { recursive: true });
          await writeFile(join(cmd.xmlDir, buildInvoiceFileName(invoice, "xml")), bytes);
          xmlSaved = true;
        };

        if (cmd.formats.has("xml")) await saveXml();

        if (cmd.formats.has("pdf")) {
          try {
            renderPdf ??= await loadPdfRenderer();
            const pdf = await renderPdf(invoice);
            await mkdir(cmd.outDir, { recursive: true });
            await writeFile(join(cmd.outDir, buildInvoiceFileName(invoice, "pdf")), new Uint8Array(pdf));
            notes.push("PDF");
          } catch (error) {
            summary.pdfFailed.push(meta.ksefNumber);
            notes.push(`PDF nie powstał: ${errorMessage(error)}`);
            // Nie tracimy faktury – oryginalny XML zapisujemy zawsze.
            if (!xmlSaved) await saveXml();
          }
        }

        summary.downloaded++;
        log(`${line}  [${notes.join("; ") || "XML"}]`);
      } catch (error) {
        if (error instanceof RateLimitedError) {
          summary.rateLimited = true;
          log(error.message);
          break;
        }
        summary.failed.push(meta.ksefNumber);
        log(`  ! ${meta.ksefNumber}: ${errorMessage(error)}`);
      }
    }
  } finally {
    // Sesja i tak wygaśnie sama, więc błąd wylogowania nie jest istotny.
    await client.logout(accessToken).catch(() => undefined);
  }

  return summary;
};
