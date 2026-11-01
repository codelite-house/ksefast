import { readdir } from "node:fs/promises";

export interface YearMonth {
  year: number;
  month: number;
}

/** Numery KSeF trafiają do nazw plików – dopuszczamy tylko bezpieczne znaki. */
export const KSEF_NUMBER_RE = /^[A-Za-z0-9-]{20,60}$/;

export const parseMonthArg = (value: string): YearMonth => {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
  if (!match) {
    throw new Error(`Nieprawidłowy miesiąc "${value}" – oczekiwany format RRRR-MM, np. 2026-10`);
  }
  return { year: Number(match[1]), month: Number(match[2]) };
};

/** Miesiąc przyjęcia faktury w KSeF – to data zapisana w numerze KSeF (RRRRMMDD). */
export const ksefNumberMonth = (ksefNumber: string): YearMonth | null => {
  const datePart = ksefNumber.split("-")[1];
  if (!datePart || !/^\d{8}$/.test(datePart)) return null;
  return { year: Number(datePart.slice(0, 4)), month: Number(datePart.slice(4, 6)) };
};

/**
 * Zakres zapytania do KSeF z zapasem po 2 dni z obu stron (strefy czasowe na granicy miesięcy);
 * właściwy miesiąc wybieramy potem po dacie z numeru KSeF.
 */
export const monthSearchRange = ({ year, month }: YearMonth): { from: string; to: string } => {
  const day = 86_400_000;
  const from = new Date(Date.UTC(year, month - 1, 1) - 2 * day);
  const to = new Date(Date.UTC(year, month, 1) + 2 * day - 1000);
  return { from: from.toISOString(), to: to.toISOString() };
};

/** Nazwy wszystkich plików (rekurencyjnie) w podanych folderach; brakujące foldery są pomijane. */
export const collectExistingNames = async (dirs: string[]): Promise<string> => {
  const names: string[] = [];
  for (const dir of dirs) {
    try {
      names.push(...(await readdir(dir, { recursive: true })));
    } catch (error) {
      if ((error as { code?: string }).code !== "ENOENT") throw error;
    }
  }
  return names.join("\n");
};
