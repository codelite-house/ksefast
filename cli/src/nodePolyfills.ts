/**
 * Generator PDF (@akmf/ksef-fe-invoice-converter) czyta XML przez `FileReader`, którego Node nie ma.
 * Minimalny zamiennik wystarcza dla `readAsText` (z obsługą kodowania, np. utf-16 z faktur KSeF).
 */
export const installFileReaderPolyfill = (): void => {
  const globals = globalThis as { FileReader?: unknown };
  if (globals.FileReader) return;

  globals.FileReader = class {
    onload: ((event: { target: { result: string } }) => void) | null = null;
    onerror: ((error: unknown) => void) | null = null;

    readAsText(file: Blob, encoding = "utf-8"): void {
      file
        .arrayBuffer()
        .then((buffer) => new TextDecoder(encoding).decode(buffer))
        .then(
          (text) => this.onload?.({ target: { result: text } }),
          (error) => this.onerror?.(error),
        );
    }
  };
};
