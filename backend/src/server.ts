import cors from 'cors';
import express from 'express';

import { config } from './config.js';
import { buildArchive } from './services/archiveService.js';
import { getErrorMessage, fetchInvoicesForDownload } from './services/ksefClient.js';
import { saveLead } from './services/leadService.js';
import type { ContextIdentifierType, DateType, DownloadFormat, DownloadInvoicesRequest, EnvironmentName, SubjectType } from './types.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const allowedContextTypes = new Set<ContextIdentifierType>(['Nip', 'InternalId', 'NipVatUe', 'PeppolId']);
const allowedSubjectTypes = new Set<SubjectType>(['Subject1', 'Subject2', 'Subject3', 'SubjectAuthorized']);
const allowedDateTypes = new Set<DateType>(['Issue', 'Invoicing', 'PermanentStorage']);
const allowedFormats = new Set<DownloadFormat>(['xml', 'pdf']);
const allowedEnvironments = new Set<EnvironmentName>(['demo', 'prod']);

function isIsoDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function validateRequest(body: unknown): DownloadInvoicesRequest {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Invalid request body.');
  }

  const candidate = body as Partial<DownloadInvoicesRequest>;

  if (!candidate.token?.trim()) {
    throw new Error('Token KSeF is required.');
  }

  if (!candidate.contextValue?.trim()) {
    throw new Error('Context value is required.');
  }

  if (!candidate.contextType || !allowedContextTypes.has(candidate.contextType)) {
    throw new Error('Invalid context type.');
  }

  if (!candidate.subjectType || !allowedSubjectTypes.has(candidate.subjectType)) {
    throw new Error('Invalid subject type.');
  }

  if (!candidate.dateType || !allowedDateTypes.has(candidate.dateType)) {
    throw new Error('Invalid date type.');
  }

  if (!candidate.format || !allowedFormats.has(candidate.format)) {
    throw new Error('Invalid download format.');
  }

  if (!candidate.environment || !allowedEnvironments.has(candidate.environment)) {
    throw new Error('Invalid KSeF environment.');
  }

  if (!candidate.dateFrom || !candidate.dateTo || !isIsoDate(candidate.dateFrom) || !isIsoDate(candidate.dateTo)) {
    throw new Error('Provide a valid date range.');
  }

  const from = Date.parse(candidate.dateFrom);
  const to = Date.parse(candidate.dateTo);

  if (from > to) {
    throw new Error('The start date must be earlier than the end date.');
  }

  const maxRangeMs = 1000 * 60 * 60 * 24 * 95;
  if (to - from > maxRangeMs) {
    throw new Error('KSeF allows up to about 3 months per query. Narrow the date range.');
  }

  const email = candidate.email?.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Optional email address is invalid.');
  }

  return {
    environment: candidate.environment,
    token: candidate.token.trim(),
    contextType: candidate.contextType,
    contextValue: candidate.contextValue.trim(),
    subjectType: candidate.subjectType,
    dateType: candidate.dateType,
    dateFrom: new Date(from).toISOString(),
    dateTo: new Date(to).toISOString(),
    format: candidate.format,
    email,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/download', async (req, res) => {
  try {
    const request = validateRequest(req.body);

    if (request.email) {
      await saveLead({
        email: request.email,
        environment: request.environment,
        subjectType: request.subjectType,
        dateType: request.dateType,
        dateFrom: request.dateFrom,
        dateTo: request.dateTo,
        createdAt: new Date().toISOString(),
      });
    }

    const invoices = await fetchInvoicesForDownload(request);
    const archive = await buildArchive(invoices, request.format);
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `ksefast-${request.format}-${today}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(archive);
  } catch (error) {
    const failure = getErrorMessage(error);
    res.status(failure.status).json(failure);
  }
});

app.listen(config.port, () => {
  console.log(`KSeFast backend listening on http://localhost:${config.port}`);
});
