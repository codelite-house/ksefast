import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const KSEF_BASE_URLS: Record<string, string> = {
  demo: "https://api-test.ksef.mf.gov.pl/v2",
  prod: "https://api.ksef.mf.gov.pl/v2",
};

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function setCors(res: Response): void {
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    res.setHeader(k, v);
  }
}

function resolveBase(req: Request): string {
  const env = req.query.environment as string;
  return KSEF_BASE_URLS[env] ?? KSEF_BASE_URLS.demo;
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
      `${resolveBase(req)}/security/public-key-certificates`,
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
    await proxy(`${resolveBase(req)}/auth/challenge`, { method: "POST" }, res);
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
});

// POST /api/auth/token  →  POST /auth/ksef-token
app.post("/api/auth/token", async (req, res) => {
  setCors(res);
  try {
    await proxy(
      `${resolveBase(req)}/auth/ksef-token`,
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
      `${resolveBase(req)}/auth/${encodeURIComponent(referenceNumber as string)}`,
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
      `${resolveBase(req)}/auth/token/redeem`,
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
      `${resolveBase(req)}/invoices/query/metadata?sortOrder=Asc&pageOffset=${pageOffset}&pageSize=${pageSize}`,
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
      `${resolveBase(req)}/invoices/ksef/${encodeURIComponent(ksefNumber as string)}`,
      { headers: { Authorization: auth } },
      res,
    );
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`KSeFast proxy listening on http://0.0.0.0:${PORT}`);
});
