import assert from "node:assert/strict";
import { test } from "node:test";
import { downloadInvoiceBatch } from "../../frontend/src/lib/downloadInvoiceBatch";
import {
  RateLimitedError,
  createPacer,
  fetchWithKsefRetry,
  type Sleep,
} from "../../frontend/src/lib/ksefRateLimit";
import type { DownloadedInvoice, InvoiceMetadata } from "../../frontend/src/types";

// Wspólne moduły limitów KSeF (web + CLI) – czas jest udawany, testy nie czekają naprawdę.
const fakeClock = () => {
  let now = 0;
  const sleeps: number[] = [];
  const sleep: Sleep = async (ms, signal) => {
    signal?.throwIfAborted();
    sleeps.push(ms);
    now += ms;
  };
  return { sleeps, sleep, now: () => now, advance: (ms: number) => (now += ms) };
};

const tooMany = (retryAfter?: string) =>
  new Response("{}", { status: 429, headers: retryAfter ? { "Retry-After": retryAfter } : {} });

const meta = (n: number): InvoiceMetadata =>
  ({ ksefNumber: `KSEF-${n}`, invoiceNumber: `FV/${n}`, issueDate: "2026-10-01" }) as InvoiceMetadata;

test("fetchWithKsefRetry: 429 z Retry-After: 10 → czeka 11 s i ponawia", async () => {
  const clock = fakeClock();
  const responses = [tooMany("10"), new Response("ok")];
  const waits: number[] = [];

  const res = await fetchWithKsefRetry(async () => responses.shift()!, {
    sleep: clock.sleep,
    onWait: (sec) => waits.push(sec),
  });

  assert.equal(await res.text(), "ok");
  assert.deepEqual(clock.sleeps, [11_000]);
  assert.deepEqual(waits, [11]);
});

test("fetchWithKsefRetry: Retry-After ponad próg (limit godzinowy) → RateLimitedError bez czekania", async () => {
  const clock = fakeClock();

  await assert.rejects(
    fetchWithKsefRetry(async () => tooMany("1800"), { sleep: clock.sleep, maxRetryAfterSec: 120 }),
    (error: unknown) => error instanceof RateLimitedError && error.retryAfterSec === 1800,
  );
  assert.deepEqual(clock.sleeps, []);
});

test("fetchWithKsefRetry: 5xx → backoff 1 s, 2 s, potem oddaje odpowiedź z błędem", async () => {
  const clock = fakeClock();
  let calls = 0;

  const res = await fetchWithKsefRetry(
    async () => {
      calls++;
      return new Response("boom", { status: 503 });
    },
    { sleep: clock.sleep, maxRetries: 2 },
  );

  assert.equal(res.status, 503);
  assert.equal(calls, 3);
  assert.deepEqual(clock.sleeps, [1000, 2000]);
});

test("fetchWithKsefRetry: brak Retry-After → domyślnie 30 s", async () => {
  const clock = fakeClock();
  const responses = [tooMany(), new Response("ok")];

  await fetchWithKsefRetry(async () => responses.shift()!, { sleep: clock.sleep });

  assert.deepEqual(clock.sleeps, [31_000]);
});

test("createPacer: zachowuje odstęp od końca poprzedniego wywołania", async () => {
  const clock = fakeClock();
  const pacer = createPacer(4500, { now: clock.now, sleep: clock.sleep });

  await pacer.run(async () => clock.advance(1000));
  await pacer.run(async () => clock.advance(1000));
  clock.advance(10_000);
  await pacer.run(async () => undefined);

  assert.deepEqual(clock.sleeps, [4500]);
});

test("downloadInvoiceBatch: limit godzinowy → częściowy wynik, nic pobranego nie przepada", async () => {
  const clock = fakeClock();
  const invoices = Array.from({ length: 5 }, (_, i) => meta(i + 1));
  const chunks: DownloadedInvoice[][] = [];

  const result = await downloadInvoiceBatch({
    invoices,
    download: async (m) => {
      if (m.ksefNumber === "KSEF-4") throw new RateLimitedError(3000);
      return `<xml>${m.ksefNumber}</xml>`;
    },
    onChunk: async (chunk) => {
      chunks.push(chunk);
    },
    pacer: createPacer(4500, { now: clock.now, sleep: clock.sleep }),
    chunkSize: 2,
  });

  assert.equal(result.downloadedCount, 3);
  assert.deepEqual(result.stopReason, { kind: "rateLimited", retryAfterSec: 3000 });
  assert.deepEqual(
    chunks.map((c) => c.map((i) => i.metadata.ksefNumber)),
    [["KSEF-1", "KSEF-2"], ["KSEF-3"]],
  );
  assert.deepEqual(result.missing.map((m) => m.ksefNumber), ["KSEF-4", "KSEF-5"]);
  // Odstęp między pobraniami: 3 udane + próba czwartej.
  assert.deepEqual(clock.sleeps, [4500, 4500, 4500]);
});

test("downloadInvoiceBatch: błąd 400 jednej faktury → pomija ją i pobiera resztę", async () => {
  const clock = fakeClock();
  const invoices = [meta(1), meta(2), meta(3)];

  const result = await downloadInvoiceBatch({
    invoices,
    download: async (m) => {
      if (m.ksefNumber === "KSEF-2") throw Object.assign(new Error("21165"), { status: 400 });
      return "<xml/>";
    },
    onChunk: async () => undefined,
    pacer: createPacer(0, { now: clock.now, sleep: clock.sleep }),
    chunkSize: 25,
  });

  assert.equal(result.downloadedCount, 2);
  assert.equal(result.stopReason, undefined);
  assert.deepEqual(result.missing.map((m) => m.ksefNumber), ["KSEF-2"]);
});

test("downloadInvoiceBatch: anulowanie → oddaje pobrane i resztę jako brakujące", async () => {
  const clock = fakeClock();
  const abort = new AbortController();
  const invoices = [meta(1), meta(2), meta(3)];
  const saved: string[] = [];

  const result = await downloadInvoiceBatch({
    invoices,
    download: async (m) => {
      if (m.ksefNumber === "KSEF-2") abort.abort();
      return "<xml/>";
    },
    onChunk: async (chunk) => {
      saved.push(...chunk.map((i) => i.metadata.ksefNumber));
    },
    pacer: createPacer(0, { now: clock.now, sleep: clock.sleep }),
    chunkSize: 25,
    signal: abort.signal,
  });

  assert.deepEqual(result.stopReason, { kind: "cancelled" });
  assert.deepEqual(saved, ["KSEF-1", "KSEF-2"]);
  assert.deepEqual(result.missing.map((m) => m.ksefNumber), ["KSEF-3"]);
});
