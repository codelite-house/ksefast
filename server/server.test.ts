import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { AddressInfo } from "node:net";
import { createApp } from "./server";

const originalFetch = globalThis.fetch;
const originalBearer = process.env.CONTACT_SERVICE_BEARER_TOKEN;
const originalContactServiceUrl = process.env.CONTACT_SERVICE_URL;

beforeEach(() => {
  delete process.env.CONTACT_SERVICE_BEARER_TOKEN;
  delete process.env.ZITADEL_AUTHORITY;
  delete process.env.ZITADEL_CLIENT_ID;
  delete process.env.ZITADEL_CLIENT_SECRET;
  process.env.CONTACT_SERVICE_URL = "http://contact-service.example/api/v1/messages";
});

after(() => {
  globalThis.fetch = originalFetch;

  if (originalBearer === undefined) {
    delete process.env.CONTACT_SERVICE_BEARER_TOKEN;
  } else {
    process.env.CONTACT_SERVICE_BEARER_TOKEN = originalBearer;
  }

  if (originalContactServiceUrl === undefined) {
    delete process.env.CONTACT_SERVICE_URL;
  } else {
    process.env.CONTACT_SERVICE_URL = originalContactServiceUrl;
  }
});

test("POST /api/contact/messages forwards payload to contact service", async () => {
  process.env.CONTACT_SERVICE_BEARER_TOKEN = "test-bearer-token";

  const app = createApp();
  let capturedRequest: Request | undefined;

  globalThis.fetch = (async (input: URL | RequestInfo, init?: RequestInit) => {
    const request = new Request(input, init);

    if (request.url.includes("127.0.0.1") || request.url.includes("localhost")) {
      return originalFetch(input as RequestInfo, init);
    }

    capturedRequest = request;
    return new Response(JSON.stringify({ submissionId: "abc-123" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  const server = app.listen(0);

  try {
    const port = (server.address() as AddressInfo).port;
    const response = await fetch(`http://127.0.0.1:${port}/api/contact/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane@example.com",
        message: "Need help with KSeF sync",
        messageType: "ProblemReport",
        source: "ksefast-web",
        additionalProperties: {
          tenantId: "tenant-1",
          invoiceNumber: "FV/123",
        },
      }),
    });

    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { submissionId: "abc-123" });

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.url, "http://contact-service.example/api/v1/messages");
    assert.equal(capturedRequest.method, "POST");
    assert.equal(capturedRequest.headers.get("authorization"), "Bearer test-bearer-token");

    const forwardedBody = await capturedRequest.json();
    assert.deepEqual(forwardedBody, {
      name: "Jane Doe",
      email: "jane@example.com",
      message: "Need help with KSeF sync",
      source: "ksefast-web",
      messageType: "ProblemReport",
      additionalProperties: {
        tenantId: "tenant-1",
        invoiceNumber: "FV/123",
      },
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

test("POST /api/contact/messages uses bearer token when configured", async () => {
  process.env.CONTACT_SERVICE_BEARER_TOKEN = "jwt-token-123";

  const app = createApp();
  let capturedRequest: Request | undefined;

  globalThis.fetch = (async (input: URL | RequestInfo, init?: RequestInit) => {
    const request = new Request(input, init);

    if (request.url.includes("127.0.0.1") || request.url.includes("localhost")) {
      return originalFetch(input as RequestInfo, init);
    }

    capturedRequest = request;
    return new Response(JSON.stringify({ submissionId: "jwt-abc-123" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  const server = app.listen(0);

  try {
    const port = (server.address() as AddressInfo).port;
    const response = await fetch(`http://127.0.0.1:${port}/api/contact/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        message: "Need support",
        messageType: "ContactForm",
        source: "ksefast-web",
        additionalProperties: {
          plan: "pro",
        },
      }),
    });

    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { submissionId: "jwt-abc-123" });

    assert.ok(capturedRequest);
    assert.equal(capturedRequest.headers.get("authorization"), "Bearer jwt-token-123");

    const forwardedBody = await capturedRequest.json();
    assert.deepEqual(forwardedBody, {
      name: "John Doe",
      email: "john@example.com",
      message: "Need support",
      source: "ksefast-web",
      messageType: "ContactForm",
      additionalProperties: {
        plan: "pro",
      },
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

test("POST /api/contact/messages returns 500 when credentials are missing", async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = (server.address() as AddressInfo).port;
    const response = await fetch(`http://127.0.0.1:${port}/api/contact/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alice",
        email: "alice@example.com",
        message: "Hello",
        messageType: "ContactForm",
        source: "ksefast-web",
        additionalProperties: {
          tenantId: "tenant-2",
        },
      }),
    });

    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      message: "Contact form is temporarily unavailable. Please try again later.",
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

test("POST /api/contact/messages returns 400 when required fields are missing", async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = (server.address() as AddressInfo).port;

    const missingName = await fetch(`http://127.0.0.1:${port}/api/contact/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", message: "Hi", messageType: "ContactForm" }),
    });
    assert.equal(missingName.status, 400);
    assert.deepEqual(await missingName.json(), { message: "name, email and message are required" });

    const missingEmail = await fetch(`http://127.0.0.1:${port}/api/contact/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bob", message: "Hi", messageType: "ContactForm" }),
    });
    assert.equal(missingEmail.status, 400);
    assert.deepEqual(await missingEmail.json(), { message: "name, email and message are required" });

    const missingMessage = await fetch(`http://127.0.0.1:${port}/api/contact/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bob", email: "b@c.com", messageType: "ContactForm" }),
    });
    assert.equal(missingMessage.status, 400);
    assert.deepEqual(await missingMessage.json(), { message: "name, email and message are required" });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

test("POST /api/contact/messages returns 400 for invalid messageType", async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = (server.address() as AddressInfo).port;
    const response = await fetch(`http://127.0.0.1:${port}/api/contact/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Eve",
        email: "eve@example.com",
        message: "Hack attempt",
        messageType: "InvalidType",
      }),
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      message: "messageType must be ContactForm or ProblemReport",
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});
