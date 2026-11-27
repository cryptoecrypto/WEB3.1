#!/usr/bin/env node
/**
 * Rebuilds the Museu Digital catalog from every raster image committed
 * anywhere in the WEB3.1 repository. Runs during GitHub Pages deployment.
 * No source images are moved, renamed, deleted, or rewritten.
 */
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "museu-digital", "acervo.json");
const EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);
const SKIP = new Set([".git", "node_modules", "_site", "dist", "build", ".next", ".cache"]);
const LABELS = {
  "assets": "IDENTIDADE VISUAL",
  "baby-ia": "BABY I.A.",
  "crypy-infinyt": "CRYPY INFINYT",
  "crypy-news": "CRYPY NEWS",
  "crypy-market-news": "CRYPY MARKET NEWS",
  "esquadrao-das-cores": "ESQUADRÃO DAS CORES",
  "museu-digital": "MUSEU DIGITAL",
  "nft-collection": "NFT COLLECTION",
  "social-crypykut": "CRYPY SOCIAL"
};

function titleFrom(file) {
  return path.basename(file, path.extname(file))
    .replace(/^[a-f0-9]{12,}-/i, "")
    .replace(/^img-/i, "")
    .replace(/[_-]+/g, " ")
    .trim() || path.basename(file);
}
function collectionFrom(file) {
  const first = file.split("/")[0];
  return LABELS[first] || first.toUpperCase();
}
async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") || SKIP.has(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(absolute, out);
    else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      const relative = path.relative(ROOT, absolute).split(path.sep).join("/");
      const info = await stat(absolute);
      out.push({
        id: relative,
        title: titleFrom(relative),
        collection: collectionFrom(relative),
        path: relative,
        src: path.posix.relative("museu-digital", relative),
        format: path.extname(relative).slice(1).toLowerCase(),
        bytes: info.size
      });
    }
  }
  return out;
}

const images = (await walk(ROOT)).sort((a, b) => a.path.localeCompare(b.path, "pt-BR"));
const manifest = {
  version: "1.1",
  generated_at: new Date().toISOString(),
  source_repository: process.env.GITHUB_REPOSITORY || "cryptoecrypto/WEB3.1",
  source_revision: process.env.GITHUB_SHA || "local",
  scope: "Imagens rasterizadas PNG, JPG, JPEG, WebP, GIF e AVIF presentes no repositório no momento da publicação.",
  total: images.length,
  policy: {
    automatic_discovery: true,
    scan_scope: "repository",
    preserve_source_files: true,
    delete_duplicates: false,
    display_mode: "random_without_repetition_per_cycle",
    fit: "contain"
  },
  images
};
await writeFile(OUTPUT, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("Museu Digital: " + images.length + " imagens catalogadas automaticamente.");
