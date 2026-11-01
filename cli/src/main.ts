import { parseArgs } from "node:util";
import { resolve } from "node:path";
import type { EnvironmentName, SubjectType } from "../../frontend/src/types";
import { KSEF_BASE_URLS, KsefHttpError, RateLimitedError, createDirectClient } from "./directClient";
import { runDownload, type DownloadCommand, type OutputFormat } from "./download";
import { parseMonthArg } from "./files";

const USAGE = `KSeFast CLI – pobieranie faktur z KSeF do folderu (bez proxy i przeglądarki)

Użycie:
  ksefast-cli download --nip <NIP> --month <RRRR-MM> --out <folder> [opcje]

Token KSeF jest czytany wyłącznie ze zmiennej środowiskowej KSEF_TOKEN
(nigdy z argumentów wiersza poleceń).

Opcje:
  --nip <NIP>            NIP kontekstu logowania (10 cyfr)
  --month <RRRR-MM>      miesiąc przyjęcia faktur w KSeF (data z numeru KSeF)
  --out <folder>         folder docelowy (PDF-y; XML-e trafiają do <folder>/XML)
  --subject <typ>        Subject1 sprzedawca | Subject2 nabywca (domyślnie, faktury zakupowe)
                         | Subject3 | SubjectAuthorized
  --env <prod|demo>      środowisko KSeF (domyślnie prod)
  --format <lista>       pdf,xml (domyślnie pdf,xml)
  --xml-dir <folder>     inny folder na XML-e
  --max-downloads <n>    bezpiecznik pod limit KSeF 64 pobrania/h (domyślnie 60)
  --pause-ms <ms>        odstęp między pobraniami (domyślnie 4500, limit KSeF 16/min)
  --dry-run              tylko pokaż, co zostałoby pobrane
  -h, --help             ta pomoc

Faktury, których numer KSeF występuje już w nazwie pliku w folderze docelowym, są pomijane.
Kody wyjścia: 0 – OK, 1 – błąd, 2 – przerwano przez limity KSeF (uruchom ponownie później).
`;

const SUBJECTS: readonly SubjectType[] = ["Subject1", "Subject2", "Subject3", "SubjectAuthorized"];

export interface ParsedCli {
  command: DownloadCommand;
  baseUrl: string;
  pauseMs: number;
}

export const parseCli = (argv: string[], env: NodeJS.ProcessEnv): ParsedCli | "help" => {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      nip: { type: "string" },
      month: { type: "string" },
      out: { type: "string" },
      subject: { type: "string", default: "Subject2" },
      env: { type: "string", default: "prod" },
      format: { type: "string", default: "pdf,xml" },
      "xml-dir": { type: "string" },
      "max-downloads": { type: "string", default: "60" },
      "pause-ms": { type: "string", default: "4500" },
      "base-url": { type: "string" },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help || positionals.length === 0) return "help";
  if (positionals[0] !== "download") throw new Error(`Nieznane polecenie "${positionals[0]}" (dostępne: download)`);

  const nip = values.nip ?? "";
  if (!/^\d{10}$/.test(nip)) throw new Error("--nip musi składać się z dokładnie 10 cyfr");
  if (!values.month) throw new Error("Brak --month (np. 2026-10)");
  if (!values.out) throw new Error("Brak --out (folder docelowy)");

  const subject = values.subject as SubjectType;
  if (!SUBJECTS.includes(subject)) throw new Error(`--subject musi być jednym z: ${SUBJECTS.join(", ")}`);
  const environment = values.env as EnvironmentName;
  if (!(environment in KSEF_BASE_URLS)) throw new Error("--env musi być równe prod albo demo");

  const formats = new Set(values.format.split(",").map((f) => f.trim()).filter(Boolean));
  for (const format of formats) {
    if (format !== "pdf" && format !== "xml") throw new Error(`Nieznany format "${format}" (pdf, xml)`);
  }
  if (formats.size === 0) throw new Error("--format nie może być pusty");

  const maxDownloads = Number(values["max-downloads"]);
  const pauseMs = Number(values["pause-ms"]);
  if (!Number.isInteger(maxDownloads) || maxDownloads < 1) throw new Error("--max-downloads musi być dodatnią liczbą całkowitą");
  if (!Number.isFinite(pauseMs) || pauseMs < 0) throw new Error("--pause-ms musi być liczbą >= 0");

  const token = env.KSEF_TOKEN?.trim();
  if (!token) throw new Error("Brak tokena: ustaw zmienną środowiskową KSEF_TOKEN");

  // `pnpm cli` uruchamia skrypt w katalogu server/ – ścieżki względne liczymy od miejsca wywołania.
  const cwd = env.INIT_CWD || process.cwd();
  const outDir = resolve(cwd, values.out);
  const typedFormats = formats as Set<OutputFormat>;
  const xmlDir = values["xml-dir"]
    ? resolve(cwd, values["xml-dir"])
    : typedFormats.has("pdf")
      ? resolve(outDir, "XML")
      : outDir;

  return {
    command: {
      environment,
      nip,
      token,
      month: parseMonthArg(values.month),
      subject,
      outDir,
      xmlDir,
      formats: typedFormats,
      dryRun: values["dry-run"],
      maxDownloads,
    },
    baseUrl: values["base-url"] ?? KSEF_BASE_URLS[environment],
    pauseMs,
  };
};

export const main = async (argv: string[], env: NodeJS.ProcessEnv): Promise<number> => {
  let parsed: ParsedCli | "help";
  try {
    parsed = parseCli(argv, env);
  } catch (error) {
    console.error(`Błąd: ${(error as Error).message}\n`);
    console.error(USAGE);
    return 1;
  }
  if (parsed === "help") {
    console.log(USAGE);
    return 0;
  }

  const { command, baseUrl, pauseMs } = parsed;
  console.log(
    `KSeF [${command.environment}], NIP ${command.nip}, ${command.subject}, miesiąc ${command.month.year}-${String(command.month.month).padStart(2, "0")}${command.dryRun ? " [dry-run]" : ""}`,
  );

  try {
    const client = createDirectClient({ baseUrl, downloadPauseMs: pauseMs });
    const summary = await runDownload(command, { client });
    if (summary.pdfFailed.length > 0) {
      console.log(`UWAGA: PDF nie powstał dla ${summary.pdfFailed.length} faktur (XML zapisany).`);
    }
    if (summary.failed.length > 0) {
      console.log(`UWAGA: nie pobrano ${summary.failed.length} faktur.`);
    }
    console.log(`Gotowe. Nowych faktur: ${summary.downloaded}.`);
    if (summary.rateLimited) {
      console.log("Przerwano z powodu limitów KSeF – uruchom ponownie później, pobierze tylko brakujące.");
      return 2;
    }
    return summary.failed.length > 0 ? 1 : 0;
  } catch (error) {
    if (error instanceof RateLimitedError) {
      console.error(`${error.message}. Uruchom ponownie później.`);
      return 2;
    }
    const message = error instanceof KsefHttpError || error instanceof Error ? error.message : String(error);
    console.error(`Błąd: ${message}`);
    return 1;
  }
};
