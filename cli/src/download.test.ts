import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createDirectClient } from "./directClient";
import { runDownload, type DownloadCommand, type OutputFormat } from "./download";
import { MOCK_ACCESS_TOKEN, MOCK_TIMESTAMP_MS, buildMeta, startMockKsef, type MockInvoice, type MockKsef } from "./mockKsef";

const here = dirname(fileURLToPath(import.meta.url));
// Przykładowa faktura FA(3) dołączona do generatora PDF MF (frontend/node_modules/@akmf/...).
const SAMPLE_XML = await readFile(
  join(here, "..", "..", "frontend", "node_modules", "@akmf", "ksef-fe-invoice-converter", "assets", "invoice.xml"),
);

const A = "5252800978-20261015-AAAAAAAAAAAA-01";
const B = "7740001454-20261031-BBBBBBBBBBBB-02";
const C = "9512120077-20261008-CCCCCCCCCCCC-03";
const D = "8992520556-20261001-DDDDDDDDDDDD-04";
const OTHER_MONTH = "1080022032-20250930-EEEEEEEEEEEE-05";

const invoice = (ksefNumber: string, extra: Partial<MockInvoice> = {}): MockInvoice => ({
  meta: buildMeta(ksefNumber, SAMPLE_XML),
  xml: SAMPLE_XML,
  ...extra,
});

const fakePdf = async (): Promise<ArrayBuffer> => new TextEncoder().encode("%PDF-fake").buffer as ArrayBuffer;

describe("runDownload", () => {
  let work: string;
  let mock: MockKsef | undefined;
  const logs: string[] = [];

  beforeEach(async () => {
    work = await mkdtemp(join(tmpdir(), "ksefast-cli-"));
    logs.length = 0;
  });

  afterEach(async () => {
    await mock?.close();
    mock = undefined;
    await rm(work, { recursive: true, force: true });
  });

  const command = (overrides: Partial<DownloadCommand> = {}): DownloadCommand => ({
    environment: "prod",
    nip: "5265877635",
    token: "SECRET-TOKEN",
    month: { year: 2026, month: 10 },
    subject: "Subject2",
    outDir: join(work, "Koszty"),
    xmlDir: join(work, "Koszty", "XML"),
    formats: new Set<OutputFormat>(["pdf", "xml"]),
    dryRun: false,
    maxDownloads: 60,
    ...overrides,
  });

  const run = async (
    cmd: DownloadCommand,
    clientOptions: { sleeps?: number[]; renderPdf?: (() => Promise<ArrayBuffer>) | null } = {},
  ) => {
    assert.ok(mock);
    const client = createDirectClient({
      baseUrl: mock.baseUrl,
      downloadPauseMs: 0,
      sleep: async (ms) => void clientOptions.sleeps?.push(ms),
    });
    return runDownload(cmd, {
      client,
      log: (line) => logs.push(line),
      authOptions: { pollIntervalMs: 0 },
      ...(clientOptions.renderPdf === null ? {} : { renderPdf: clientOptions.renderPdf ?? fakePdf }),
    });
  };

  const names = async (dir: string): Promise<string[]> =>
    (await readdir(dir, { recursive: true })).map(String).sort();

  test("loguje się tokenem, pobiera tylko brakujące faktury z wybranego miesiąca i zapisuje PDF + XML", async () => {
    mock = await startMockKsef({ invoices: [invoice(A), invoice(B), invoice(C), invoice(D), invoice(OTHER_MONTH)], pageSizeCap: 2 });
    await mkdir(join(work, "Koszty"), { recursive: true });
    await writeFile(join(work, "Koszty", `FV-000418-10-26__${D}.pdf`), "stary plik");

    const summary = await run(command());

    assert.deepEqual(mock.decryptedTokens, [`SECRET-TOKEN|${MOCK_TIMESTAMP_MS}`]);
    assert.deepEqual(mock.authContexts, [{ type: "Nip", value: "5265877635" }]);
    assert.equal(mock.bearerByPath.get("/invoices/query/metadata"), `Bearer ${MOCK_ACCESS_TOKEN}`);
    assert.equal(mock.bearerByPath.get(`/invoices/ksef/${C}`), `Bearer ${MOCK_ACCESS_TOKEN}`);
    assert.deepEqual(
      { found: summary.found, existing: summary.existing, downloaded: summary.downloaded, rateLimited: summary.rateLimited },
      { found: 4, existing: 1, downloaded: 3, rateLimited: false },
    );
    assert.ok(mock.calls.includes("DELETE /auth/sessions/current"), "brak wylogowania");

    const files = await names(join(work, "Koszty"));
    for (const n of [A, B, C]) {
      assert.ok(files.some((f) => f.endsWith(`__${n}.pdf`)), `brak PDF dla ${n}`);
      assert.ok(files.some((f) => f.endsWith(`__${n}.xml`)), `brak XML dla ${n}`);
    }
    assert.ok(!files.some((f) => f.includes(OTHER_MONTH)), "faktura z innego miesiąca nie powinna być pobrana");
    assert.ok(!files.some((f) => f.includes(D) && f.endsWith(".xml")), "istniejąca faktura nie powinna być pobrana ponownie");
    const savedXml = await readFile(join(work, "Koszty", "XML", `FV-${A.slice(-5)}__${A}.xml`));
    assert.deepEqual(savedXml, SAMPLE_XML);
  });

  test("drugie uruchomienie niczego nie pobiera", async () => {
    mock = await startMockKsef({ invoices: [invoice(A), invoice(B)] });
    await run(command());
    const downloadsBefore = mock.calls.filter((c) => c.startsWith("GET /invoices/ksef/")).length;

    const summary = await run(command());

    assert.equal(summary.downloaded, 0);
    assert.equal(summary.existing, 2);
    assert.equal(mock.calls.filter((c) => c.startsWith("GET /invoices/ksef/")).length, downloadsBefore);
  });

  test("dry-run niczego nie zapisuje ani nie pobiera", async () => {
    mock = await startMockKsef({ invoices: [invoice(A), invoice(B)] });

    const summary = await run(command({ dryRun: true }));

    assert.equal(summary.downloaded, 0);
    assert.equal(summary.found, 2);
    assert.equal(mock.calls.filter((c) => c.startsWith("GET /invoices/ksef/")).length, 0);
    assert.deepEqual(await names(work), []);
    assert.ok(logs.some((l) => l.includes(A) && l.includes("[dry-run]")));
  });

  test("po 429 z krótkim Retry-After czeka i ponawia", async () => {
    mock = await startMockKsef({ invoices: [invoice(A)], firstDownloadRetryAfter: 2 });
    const sleeps: number[] = [];

    const summary = await run(command(), { sleeps });

    assert.equal(summary.downloaded, 1);
    assert.ok(sleeps.includes(3000), `oczekiwano czekania 3000 ms, było: ${sleeps.join(",")}`);
    assert.equal(mock.calls.filter((c) => c.startsWith("GET /invoices/ksef/")).length, 2);
  });

  test("429 z długim Retry-After przerywa z wynikiem częściowym i mimo to się wylogowuje", async () => {
    mock = await startMockKsef({ invoices: [invoice(A), invoice(B)], alwaysRetryAfter: 3600 });

    const summary = await run(command());

    assert.equal(summary.rateLimited, true);
    assert.equal(summary.downloaded, 0);
    assert.ok(mock.calls.includes("DELETE /auth/sessions/current"));
    assert.deepEqual(await names(work), []);
  });

  test("limit pobrań na uruchomienie zatrzymuje pobieranie", async () => {
    mock = await startMockKsef({ invoices: [invoice(A), invoice(B), invoice(C)] });

    const summary = await run(command({ maxDownloads: 1 }));

    assert.equal(summary.downloaded, 1);
    assert.equal(summary.rateLimited, true);
  });

  test("niezgodna suma kontrolna: faktura nie jest zapisywana, reszta tak", async () => {
    mock = await startMockKsef({
      invoices: [invoice(A), invoice(B, { hashOverride: "AAAA" }), invoice(C)],
    });

    const summary = await run(command());

    assert.deepEqual(summary.failed, [B]);
    assert.equal(summary.downloaded, 2);
    assert.ok(!(await names(work)).some((f) => f.includes(B)));
  });

  test("błąd generowania PDF nie gubi faktury – zapisuje XML", async () => {
    mock = await startMockKsef({ invoices: [invoice(A)] });

    const summary = await run(command({ formats: new Set<OutputFormat>(["pdf"]) }), {
      renderPdf: async () => {
        throw new Error("nieobsługiwany schemat");
      },
    });

    assert.deepEqual(summary.pdfFailed, [A]);
    assert.equal(summary.downloaded, 1);
    const files = await names(work);
    assert.ok(files.some((f) => f.endsWith(`__${A}.xml`)));
    assert.ok(!files.some((f) => f.endsWith(".pdf")));
  });

  test("podejrzany numer KSeF jest odrzucany i nie trafia do nazw plików", async () => {
    const evil = "1234567890-20261015-AAAA/../x-00";
    mock = await startMockKsef({ invoices: [invoice(evil)] });

    const summary = await run(command());

    assert.deepEqual(summary.failed, [evil]);
    assert.equal(mock.calls.filter((c) => c.startsWith("GET /invoices/ksef/")).length, 0);
    assert.deepEqual(await names(work), []);
  });

  test("prawdziwy generator PDF (oficjalny generator MF z node_modules) tworzy poprawny plik", async () => {
    mock = await startMockKsef({ invoices: [invoice(A)] });

    const summary = await run(command(), { renderPdf: null });

    assert.deepEqual(summary.pdfFailed, []);
    assert.equal(summary.downloaded, 1);
    const pdfName = (await names(join(work, "Koszty"))).find((f) => f.endsWith(".pdf"));
    assert.ok(pdfName);
    const pdf = await readFile(join(work, "Koszty", pdfName));
    assert.equal(pdf.subarray(0, 5).toString("latin1"), "%PDF-");
    assert.ok(pdf.length > 5000, `PDF podejrzanie mały: ${pdf.length} B`);
  });
});
