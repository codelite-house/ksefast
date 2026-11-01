// Hook rozwiązywania modułów Node (rejestrowany przez `register` w download.ts).
//
// Generator PDF MF importuje własne moduły przez alias `@shared/...` (zdefiniowany w jego vite.config.ts).
// Vite w frontendzie ma ten alias, a tsx stosuje `paths` z tsconfig tylko do plików spoza node_modules –
// więc dla generatora zainstalowanego jako zależność mapujemy go tutaj.
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let sharedDir = "";

export function initialize(data) {
  sharedDir = data.sharedDir;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@shared/")) {
    const target = pathToFileURL(join(sharedDir, specifier.slice("@shared/".length))).href;
    return nextResolve(target, context);
  }
  return nextResolve(specifier, context);
}
