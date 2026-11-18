import fs from "fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

import { guides, type Guide } from "./src/content/guides";

const SITE_URL = "https://ksefast.pl";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const renderGuideBody = (guide: Guide) => {
  const list = (tag: "ol" | "ul", items: string[]) =>
    `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;

  const sections = guide.sections
    .map(
      (section) =>
        `<section><h2>${escapeHtml(section.heading)}</h2>` +
        (section.paragraphs ?? []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("") +
        (section.steps ? list("ol", section.steps) : "") +
        (section.bullets ? list("ul", section.bullets) : "") +
        "</section>",
    )
    .join("");

  const related = guides
    .filter((other) => other.slug !== guide.slug)
    .map((other) => `<li><a href="/${other.slug}">${escapeHtml(other.linkLabel)}</a></li>`)
    .join("");

  return (
    `<main><p><a href="/">← Wróć do pobierania faktur</a></p>` +
    `<article><h1>${escapeHtml(guide.title)}</h1><p>${escapeHtml(guide.lead)}</p>${sections}</article>` +
    `<p><a href="/#pobierz">Pobierz faktury z KSeF teraz – za darmo, bez rejestracji</a></p>` +
    `<nav aria-label="Inne poradniki"><h2>Inne poradniki</h2><ul>${related}</ul></nav></main>`
  );
};

/**
 * Przy buildzie zapisuje <slug>.html dla każdego poradnika: własny title, description, canonical,
 * Open Graph i treść artykułu w #root (React ją potem zastępuje). Dzięki temu wyszukiwarki
 * i podglądy linków widzą treść bez uruchamiania JS. nginx serwuje je przez try_files $uri.html.
 */
const guidePages = (): Plugin => ({
  name: "ksefast-guide-pages",
  apply: "build",
  // writeBundle, nie generateBundle: index.html z wstrzykniętymi assetami powstaje dopiero w hooku
  // generateBundle wbudowanego pluginu HTML, który działa po pluginach użytkownika.
  writeBundle(options) {
    const outDir = options.dir ?? path.resolve(__dirname, "dist");
    const template = fs.readFileSync(path.join(outDir, "index.html"), "utf8");

    for (const guide of guides) {
      const url = `${SITE_URL}/${guide.slug}`;
      const title = escapeHtml(guide.metaTitle);
      const description = escapeHtml(guide.description);
      const html = template
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
        .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${description}$2`)
        .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
        .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
        .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
        .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
        .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1article$2`)
        .replace('<div id="root"></div>', `<div id="root">${renderGuideBody(guide)}</div>`);

      fs.writeFileSync(path.join(outDir, `${guide.slug}.html`), html);
    }

    // Sitemapa z listy poradników – nowy poradnik trafia do niej automatycznie.
    const urls = [
      { loc: `${SITE_URL}/`, changefreq: "weekly", priority: "1.0" },
      ...guides.map((guide) => ({ loc: `${SITE_URL}/${guide.slug}`, changefreq: "monthly", priority: "0.8" })),
      { loc: `${SITE_URL}/polityka-prywatnosci`, changefreq: "yearly", priority: "0.3" },
    ];
    const sitemap =
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls
        .map(
          ({ loc, changefreq, priority }) =>
            `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
        )
        .join("\n") +
      "\n</urlset>\n";
    fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
  },
});

export default defineConfig({
  plugins: [react(), guidePages()],
  resolve: {
    alias: {
      // Generator MF nie ma zbudowanej paczki w npm – używamy jego źródeł (src/) z node_modules.
      "@akmf/ksef-fe-invoice-converter": path.resolve(
        __dirname,
        "node_modules/@akmf/ksef-fe-invoice-converter/src/index.ts",
      ),
      // Generator importuje własne moduły przez ten alias (jak w jego vite.config.ts).
      "@shared": path.resolve(
        __dirname,
        "node_modules/@akmf/ksef-fe-invoice-converter/src/shared",
      ),
    },
  },
  server: {
    port: 5173,
  },
});
