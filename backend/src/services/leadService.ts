import { mkdir, appendFile } from 'node:fs/promises';
import path from 'node:path';

import { config } from '../config.js';
import type { LeadEntry } from '../types.js';

export async function saveLead(entry: LeadEntry): Promise<void> {
  const absolutePath = path.resolve(config.leadsFilePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await appendFile(absolutePath, `${JSON.stringify(entry)}\n`, 'utf8');
}
