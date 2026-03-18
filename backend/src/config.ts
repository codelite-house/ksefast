import dotenv from 'dotenv';

dotenv.config();

const PORT = Number.parseInt(process.env.PORT ?? '3001', 10);
const MAX_INVOICES_PER_EXPORT = Number.parseInt(process.env.MAX_INVOICES_PER_EXPORT ?? '50', 10);

if (Number.isNaN(PORT)) {
  throw new Error('Invalid PORT value.');
}

if (Number.isNaN(MAX_INVOICES_PER_EXPORT) || MAX_INVOICES_PER_EXPORT < 1) {
  throw new Error('Invalid MAX_INVOICES_PER_EXPORT value.');
}

export const config = {
  port: PORT,
  maxInvoicesPerExport: MAX_INVOICES_PER_EXPORT,
  leadsFilePath: process.env.LEADS_FILE_PATH ?? 'backend/data/leads.jsonl',
};

export const ksefApiBaseUrls = {
  demo: 'https://api-demo.ksef.mf.gov.pl/v2',
  prod: 'https://api.ksef.mf.gov.pl/v2',
} as const;
