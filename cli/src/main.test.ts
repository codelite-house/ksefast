import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, test } from "node:test";
import { KSEF_BASE_URLS } from "./directClient";
import { collectExistingNames, ksefNumberMonth, monthSearchRange, parseMonthArg } from "./files";
import { parseCli, type ParsedCli } from "./main";

const ENV = { KSEF_TOKEN: "  tajny-token  " };
const base = ["download", "--nip", "5265877635", "--month", "2026-10", "--out", "C:/tmp/koszty"];

const parsed = (argv: string[], env: NodeJS.ProcessEnv = ENV): ParsedCli => {
  const result = parseCli(argv, env);
  assert.notEqual(result, "help");
  return result as ParsedCli;
};

describe("parseCli", () => {
  test("domyślne wartości: faktury zakupowe, prod, PDF + XML w podfolderze XML", () => {
    const { command, baseUrl, pauseMs } = parsed(base);

    assert.equal(command.subject, "Subject2");
    assert.equal(command.environment, "prod");
    assert.equal(command.token, "tajny-token");
    assert.deepEqual([...command.formats].sort(), ["pdf", "xml"]);
    assert.equal(command.outDir, resolve("C:/tmp/koszty"));
    assert.equal(command.xmlDir, resolve("C:/tmp/koszty", "XML"));
    assert.deepEqual(command.month, { year: 2026, month: 10 });
    assert.equal(baseUrl, KSEF_BASE_URLS.prod);
    assert.equal(pauseMs, 4500);
  });

  test("tylko XML trafia bezpośrednio do folderu docelowego", () => {
    const { command } = parsed([...base, "--format", "xml"]);
    assert.equal(command.xmlDir, command.outDir);
  });

  test("token jest wymagany i nigdy nie pochodzi z argumentów", () => {
    assert.throws(() => parseCli(base, {}), /KSEF_TOKEN/);
    assert.throws(() => parseCli([...base, "--token", "x"], ENV));
  });

  test("walidacja argumentów", () => {
    assert.throws(() => parseCli(["download", "--nip", "123", "--month", "2026-10", "--out", "x"], ENV), /10 cyfr/);
    assert.throws(() => parseCli(["download", "--nip", "5265877635", "--month", "2026-13", "--out", "x"], ENV), /RRRR-MM/);
    assert.throws(() => parseCli([...base, "--subject", "Subject9"], ENV), /--subject/);
    assert.throws(() => parseCli([...base, "--format", "docx"], ENV), /format/);
    assert.throws(() => parseCli(["upload"], ENV), /Nieznane polecenie/);
  });

  test("pomoc", () => {
    assert.equal(parseCli(["--help"], ENV), "help");
    assert.equal(parseCli([], ENV), "help");
  });
});

describe("files", () => {
  test("miesiąc z numeru KSeF i z argumentu", () => {
    assert.deepEqual(ksefNumberMonth("5252800978-20260930-76B8EAC00027-13"), { year: 2026, month: 9 });
    assert.equal(ksefNumberMonth("bez-daty"), null);
    assert.deepEqual(parseMonthArg("2026-01"), { year: 2026, month: 1 });
  });

  test("zakres zapytania obejmuje cały miesiąc z zapasem po 2 dni", () => {
    const { from, to } = monthSearchRange({ year: 2026, month: 12 });
    assert.equal(from, "2026-11-29T00:00:00.000Z");
    assert.equal(to, "2027-01-02T23:59:59.000Z");
  });

  test("istniejące pliki: rekurencyjnie, brakujący folder jest pomijany", async () => {
    const dir = await mkdtemp(join(tmpdir(), "ksefast-files-"));
    try {
      const { mkdir, writeFile } = await import("node:fs/promises");
      await mkdir(join(dir, "XML"));
      await writeFile(join(dir, "XML", "FV-1__X-1.xml"), "");
      await writeFile(join(dir, "a.pdf"), "");
      const names = await collectExistingNames([dir, join(dir, "nie-ma")]);
      assert.match(names, /FV-1__X-1\.xml/);
      assert.match(names, /a\.pdf/);
      assert.deepEqual((await readdir(dir)).sort(), ["XML", "a.pdf"]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
