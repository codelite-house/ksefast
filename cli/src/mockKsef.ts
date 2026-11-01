/**
 * Atrapa serwera KSeF API v2 na potrzeby testów CLI.
 * Para kluczy RSA powstaje w trakcie testu (nic nie jest wersjonowane); certyfikat to minimalna
 * struktura DER, z której `encryptTokenWithChallenge` wyciąga SubjectPublicKeyInfo.
 */
import { constants, createHash, generateKeyPairSync, privateDecrypt } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import type { InvoiceMetadata } from "../../frontend/src/types";

const derLength = (n: number): Buffer =>
  n < 0x80 ? Buffer.from([n]) : n < 0x100 ? Buffer.from([0x81, n]) : Buffer.from([0x82, n >> 8, n & 0xff]);
const tlv = (tag: number, ...parts: Buffer[]): Buffer => {
  const body = Buffer.concat(parts);
  return Buffer.concat([Buffer.from([tag]), derLength(body.length), body]);
};
const seq = (...parts: Buffer[]): Buffer => tlv(0x30, ...parts);

const fakeCertificateDer = (spki: Buffer): Buffer =>
  seq(
    seq(tlv(0xa0, tlv(0x02, Buffer.from([2]))), tlv(0x02, Buffer.from([1])), seq(), seq(), seq(), seq(), spki),
    seq(),
    tlv(0x03, Buffer.from([0])),
  );

export const MOCK_TIMESTAMP_MS = 1_790_000_000_123;
export const MOCK_ACCESS_TOKEN = "ACCESS-TOKEN";

export interface MockInvoice {
  meta: InvoiceMetadata;
  xml: Buffer;
  /** Podmienia nagłówek x-ms-meta-hash, by zasymulować uszkodzoną fakturę. */
  hashOverride?: string;
}

export interface MockOptions {
  invoices: MockInvoice[];
  /** Pierwsze pobranie faktury kończy się 429 z takim Retry-After (sekundy). */
  firstDownloadRetryAfter?: number;
  /** Każde pobranie faktury kończy się 429 z takim Retry-After (sekundy). */
  alwaysRetryAfter?: number;
  pageSizeCap?: number;
}

export interface MockKsef {
  baseUrl: string;
  calls: string[];
  decryptedTokens: string[];
  authContexts: unknown[];
  bearerByPath: Map<string, string>;
  close: () => Promise<void>;
}

export const sha256Base64 = (data: Buffer): string => createHash("sha256").update(data).digest("base64");

export const startMockKsef = async (options: MockOptions): Promise<MockKsef> => {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const certificate = fakeCertificateDer(publicKey.export({ type: "spki", format: "der" }) as Buffer);

  const state: MockKsef = {
    baseUrl: "",
    calls: [],
    decryptedTokens: [],
    authContexts: [],
    bearerByPath: new Map(),
    close: async () => undefined,
  };
  let statusCalls = 0;
  let rateLimited = false;

  const readBody = async (req: IncomingMessage): Promise<unknown> => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const text = Buffer.concat(chunks).toString("utf8");
    return text ? JSON.parse(text) : {};
  };
  const sendJson = (res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) => {
    res.writeHead(status, { "Content-Type": "application/json", ...headers });
    res.end(JSON.stringify(body));
  };

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const path = url.pathname.replace(/^\/v2/, "");
    state.calls.push(`${req.method} ${path}`);
    if (req.headers.authorization) state.bearerByPath.set(path, req.headers.authorization);

    if (req.method === "GET" && path === "/security/public-key-certificates") {
      sendJson(res, 200, [
        {
          certificate: certificate.toString("base64"),
          certificateId: "c1",
          publicKeyId: "pk1",
          validFrom: "2026-01-01T00:00:00+00:00",
          validTo: "2126-01-01T00:00:00+00:00",
          usage: ["KsefTokenEncryption"],
        },
      ]);
    } else if (req.method === "POST" && path === "/auth/challenge") {
      sendJson(res, 200, {
        challenge: "CHALLENGE-1",
        timestamp: "2026-11-01T12:00:00.1234567+00:00",
        timestampMs: MOCK_TIMESTAMP_MS,
        clientIp: "127.0.0.1",
      });
    } else if (req.method === "POST" && path === "/auth/ksef-token") {
      const body = (await readBody(req)) as { encryptedToken: string; contextIdentifier: unknown };
      state.authContexts.push(body.contextIdentifier);
      const plain = privateDecrypt(
        { key: privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
        Buffer.from(body.encryptedToken, "base64"),
      );
      state.decryptedTokens.push(plain.toString("utf8"));
      sendJson(res, 202, {
        referenceNumber: "REF-1",
        authenticationToken: { token: "AUTH-TOKEN", validUntil: "2026-11-01T12:10:00+00:00" },
      });
    } else if (req.method === "GET" && path === "/auth/REF-1") {
      statusCalls++;
      sendJson(res, 200, { status: { code: statusCalls === 1 ? 100 : 200, description: "ok" } });
    } else if (req.method === "POST" && path === "/auth/token/redeem") {
      sendJson(res, 200, {
        accessToken: { token: MOCK_ACCESS_TOKEN, validUntil: "2026-11-01T12:15:00+00:00" },
        refreshToken: { token: "REFRESH-TOKEN", validUntil: "2026-11-08T12:00:00+00:00" },
      });
    } else if (req.method === "POST" && path === "/invoices/query/metadata") {
      await readBody(req);
      const offset = Number(url.searchParams.get("pageOffset") ?? 0);
      const size = Math.min(Number(url.searchParams.get("pageSize") ?? 10), options.pageSizeCap ?? 1000);
      const slice = options.invoices.slice(offset * size, (offset + 1) * size);
      sendJson(res, 200, {
        hasMore: (offset + 1) * size < options.invoices.length,
        isTruncated: false,
        invoices: slice.map((i) => i.meta),
      });
    } else if (req.method === "GET" && path.startsWith("/invoices/ksef/")) {
      const number = decodeURIComponent(path.slice("/invoices/ksef/".length));
      const retryAfter = options.alwaysRetryAfter ?? (!rateLimited ? options.firstDownloadRetryAfter : undefined);
      if (retryAfter !== undefined) {
        rateLimited = true;
        sendJson(res, 429, { status: 429 }, { "Retry-After": String(retryAfter) });
        return;
      }
      const invoice = options.invoices.find((i) => i.meta.ksefNumber === number);
      if (!invoice) {
        sendJson(res, 400, { exception: { exceptionDetailList: [{ exceptionDescription: "Nie znaleziono faktury" }] } });
        return;
      }
      res.writeHead(200, {
        "Content-Type": "application/xml",
        "x-ms-meta-hash": invoice.hashOverride ?? sha256Base64(invoice.xml),
      });
      res.end(invoice.xml);
    } else if (req.method === "DELETE" && path === "/auth/sessions/current") {
      res.writeHead(204);
      res.end();
    } else {
      sendJson(res, 404, { message: `nieobsługiwane: ${req.method} ${path}` });
    }
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  state.baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v2`;
  state.close = () => new Promise<void>((resolve) => server.close(() => resolve()));
  return state;
};

export const buildMeta = (ksefNumber: string, xml: Buffer, overrides: Partial<InvoiceMetadata> = {}): InvoiceMetadata => {
  const date = ksefNumber.split("-")[1];
  const iso = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  return {
    ksefNumber,
    invoiceNumber: `FV/${ksefNumber.slice(-5)}`,
    issueDate: iso,
    invoicingDate: `${iso}T10:00:00.1234567+00:00`,
    permanentStorageDate: `${iso}T10:00:05+00:00`,
    acquisitionDate: `${iso}T10:00:03+00:00`,
    formCode: "FA (3)",
    invoiceType: "Vat",
    currency: "PLN",
    grossAmount: 123.45,
    netAmount: 100,
    vatAmount: 23.45,
    hasAttachment: false,
    invoicingMode: "Online",
    isSelfInvoicing: false,
    invoiceHash: sha256Base64(xml),
    seller: { name: `Sprzedawca ${ksefNumber.slice(0, 4)}`, nip: ksefNumber.slice(0, 10) },
    buyer: { name: "Nabywca Testowy", nip: "5265877635" },
    ...overrides,
  };
};
