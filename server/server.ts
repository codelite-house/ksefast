import express, { Request, Response } from "express";
import { pathToFileURL } from "url";
import log from "./logger.js";

const KSEF_BASE_URLS: Record<string, string> = {
  demo: "https://api-test.ksef.mf.gov.pl/v2",
  prod: "https://api.ksef.mf.gov.pl/v2",
};

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

type ContactMessageType = "ContactForm" | "ProblemReport";

interface M2MTokenCache {
  token: string;
  expiresAt: number;
}

let m2mTokenCache: M2MTokenCache | null = null;

async function getM2MToken(): Promise<string> {
  if (m2mTokenCache && Date.now() < m2mTokenCache.expiresAt - 30_000) {
    return m2mTokenCache.token;
  }

  const authority         = process.env.ZITADEL_AUTHORITY?.trim();
  const internalAuthority = process.env.ZITADEL_INTERNAL_AUTHORITY?.trim();
  const clientId          = process.env.ZITADEL_CLIENT_ID?.trim();
  const clientSecret      = process.env.ZITADEL_CLIENT_SECRET?.trim();
  const projectId         = process.env.CONTACT_SERVICE_PROJECT_ID?.trim();

  log.info('M2M token request', {
    authority: authority ?? null,
    internalAuthority: internalAuthority ?? null,
    clientId: clientId ?? null,
    secretSet: !!clientSecret,
  });

  if (!authority || !clientId || !clientSecret) {
    throw new Error("Missing ZITADEL_AUTHORITY, ZITADEL_CLIENT_ID or ZITADEL_CLIENT_SECRET");
  }
  if (!projectId) {
    throw new Error("Missing CONTACT_SERVICE_PROJECT_ID");
  }

  // Use internal cluster URL to avoid hairpin NAT (K3s/Flannel doesn't route
  // external IPs back to cluster services). Host header must stay as the external
  // hostname so Zitadel's virtual-host routing recognises the request.
  const tokenBase = internalAuthority ?? authority;
  const extraHeaders: Record<string, string> = internalAuthority
    ? { Host: new URL(authority).hostname }
    : {};

  const response = await fetch(`${tokenBase}/oauth/v2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`).toString("base64")}`,
      ...extraHeaders,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: `openid urn:zitadel:iam:org:project:id:${projectId}:aud`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    log.error('M2M token fetch failed', { status: response.status });
    throw new Error(`Zitadel token fetch failed (${response.status}): ${body}`);
  }

  const data = await response.json() as { access_token: string; expires_in: number };
  m2mTokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return m2mTokenCache.token;
}

interface ContactMessageBody {
  name?: string;
  email?: string;
  message?: string;
  source?: string;
  messageType?: ContactMessageType;
  additionalProperties?: Record<string, unknown>;
}

function setCors(res: Response): void {
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    res.setHeader(k, v);
  }
}

function resolveBase(): string {
  const env = process.env.KSEF_ENV?.trim() ?? "demo";
  return KSEF_BASE_URLS[env] ?? KSEF_BASE_URLS.demo;
}

function resolveContactServiceUrl(): string {
  const fromEnv = process.env.CONTACT_SERVICE_URL?.trim();
  return fromEnv || "http://contact-service.devowiec.pl/api/v1/messages";
}

async function buildContactServiceHeaders(): Promise<Record<string, string>> {
  const bearer = process.env.CONTACT_SERVICE_BEARER_TOKEN?.trim();
  if (bearer) {
    return {
      Authorization: bearer.startsWith("Bearer ") ? bearer : `Bearer ${bearer}`,
      "Content-Type": "application/json",
    };
  }

  const token = await getM2MToken();
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function proxy(
  ksefUrl: string,
  init: RequestInit,
  res: Response,
): Promise<void> {
  const upstream = await fetch(ksefUrl, init);
  const ct = upstream.headers.get("content-type") ?? "";

  if (!upstream.ok) {
    const body = ct.includes("application/json")
      ? await upstream.json()
      : await upstream.text();
    const msg =
      typeof body === "object" && body !== null
        ? ((body as Record<string, string>).exceptionDescription ??
          (body as Record<string, string>).message ??
          "KSeF upstream error")
        : String(body);
    res.status(400).json({ status: 400, message: msg });
    return;
  }

  if (ct.includes("application/json")) {
    res.status(200).json(await upstream.json());
    return;
  }

  res
    .status(200)
    .setHeader("Content-Type", ct || "text/plain")
    .send(await upstream.text());
}

export function createApp() {
  const app = express();
  app.use(express.json());

  // CORS preflight
  app.options("*", (req, res) => {
    setCors(res);
    res.status(200).end();
  });

  // GET /api/security/certificates  →  GET /security/public-key-certificates
  app.get("/api/security/certificates", async (req, res) => {
    setCors(res);
    try {
      await proxy(
        `${resolveBase()}/security/public-key-certificates`,
        {},
        res,
      );
    } catch (e) {
      res.status(500).json({ message: (e as Error).message });
    }
  });

  // POST /api/auth/challenge  →  POST /auth/challenge
  app.post("/api/auth/challenge", async (req, res) => {
    setCors(res);
    try {
      await proxy(`${resolveBase()}/auth/challenge`, { method: "POST" }, res);
    } catch (e) {
      res.status(500).json({ message: (e as Error).message });
    }
  });

  // POST /api/auth/token  →  POST /auth/ksef-token
  app.post("/api/auth/token", async (req, res) => {
    setCors(res);
    try {
      await proxy(
        `${resolveBase()}/auth/ksef-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body),
        },
        res,
      );
    } catch (e) {
      res.status(500).json({ message: (e as Error).message });
    }
  });

  // GET /api/auth/status  →  GET /auth/{referenceNumber}
  app.get("/api/auth/status", async (req, res) => {
    setCors(res);
    const { referenceNumber } = req.query;
    if (!referenceNumber) {
      res.status(400).json({ message: "referenceNumber is required" });
      return;
    }
    const auth = req.headers.authorization ?? "";
    if (!auth) {
      res.status(401).json({ message: "Authorization is required" });
      return;
    }
    try {
      await proxy(
        `${resolveBase()}/auth/${encodeURIComponent(referenceNumber as string)}`,
        { headers: { Authorization: auth } },
        res,
      );
    } catch (e) {
      res.status(500).json({ message: (e as Error).message });
    }
  });

  // POST /api/auth/redeem  →  POST /auth/token/redeem
  app.post("/api/auth/redeem", async (req, res) => {
    setCors(res);
    const auth = req.headers.authorization ?? "";
    if (!auth) {
      res.status(401).json({ message: "Authorization is required" });
      return;
    }
    try {
      await proxy(
        `${resolveBase()}/auth/token/redeem`,
        { method: "POST", headers: { Authorization: auth } },
        res,
      );
    } catch (e) {
      res.status(500).json({ message: (e as Error).message });
    }
  });

  // POST /api/invoices/metadata  →  POST /invoices/query/metadata
  app.post("/api/invoices/metadata", async (req, res) => {
    setCors(res);
    const auth = req.headers.authorization ?? "";
    if (!auth) {
      res.status(401).json({ message: "Authorization is required" });
      return;
    }
    const { pageOffset = "0", pageSize = "50" } = req.query;
    try {
      await proxy(
        `${resolveBase()}/invoices/query/metadata?sortOrder=Asc&pageOffset=${pageOffset}&pageSize=${pageSize}`,
        {
          method: "POST",
          headers: { Authorization: auth, "Content-Type": "application/json" },
          body: JSON.stringify(req.body),
        },
        res,
      );
    } catch (e) {
      res.status(500).json({ message: (e as Error).message });
    }
  });

  // GET /api/invoices/download  →  GET /invoices/ksef/{ksefNumber}
  app.get("/api/invoices/download", async (req, res) => {
    setCors(res);
    const { ksefNumber } = req.query;
    if (!ksefNumber) {
      res.status(400).json({ message: "ksefNumber is required" });
      return;
    }
    const auth = req.headers.authorization ?? "";
    if (!auth) {
      res.status(401).json({ message: "Authorization is required" });
      return;
    }
    try {
      await proxy(
        `${resolveBase()}/invoices/ksef/${encodeURIComponent(ksefNumber as string)}`,
        { headers: { Authorization: auth } },
        res,
      );
    } catch (e) {
      res.status(500).json({ message: (e as Error).message });
    }
  });

  // POST /api/contact/messages  -> POST Contact Service /api/v1/messages
  app.post("/api/contact/messages", async (req, res) => {
    setCors(res);

    const body = (req.body ?? {}) as ContactMessageBody;
    if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
      res.status(400).json({
        message: "name, email and message are required",
      });
      return;
    }

    if (body.messageType !== "ContactForm" && body.messageType !== "ProblemReport") {
      res.status(400).json({
        message: "messageType must be ContactForm or ProblemReport",
      });
      return;
    }

    try {
      const headers = await buildContactServiceHeaders();
      const upstream = await fetch(resolveContactServiceUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: body.name.trim(),
          email: body.email.trim(),
          message: body.message.trim(),
          source: body.source?.trim() || "ksefast",
          messageType: body.messageType,
          additionalProperties: body.additionalProperties ?? {},
        }),
      });

      const ct = upstream.headers.get("content-type") ?? "";
      const payload = ct.includes("application/json")
        ? await upstream.json()
        : await upstream.text();

      if (!upstream.ok) {
        res.status(upstream.status).json(
          typeof payload === "object" && payload !== null
            ? payload
            : { message: String(payload || "Contact service error") },
        );
        return;
      }

      res.status(201).json(payload);
    } catch (e) {
      log.error('Contact form proxy error', { error: (e as Error).message });
      res.status(500).json({
        message: "Contact form is temporarily unavailable. Please try again later.",
      });
    }
  });

  return app;
}

export const app = createApp();

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const PORT = Number(process.env.PORT ?? 3001);
  log.info('KSeFast proxy starting', {
    port: PORT,
    zitadelAuthority: process.env.ZITADEL_AUTHORITY ?? null,
    zitadelClientId: process.env.ZITADEL_CLIENT_ID?.trim() ?? null,
    contactServiceUrl: process.env.CONTACT_SERVICE_URL ?? '(default)',
  });
  app.listen(PORT, "0.0.0.0", () => {
    log.info('KSeFast proxy listening', { port: PORT });
  });
}
