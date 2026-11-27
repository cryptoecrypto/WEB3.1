import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "assets", "data", "crypy-page-index.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const errors = [];
const warnings = [];
const pages = Array.isArray(manifest.pages) ? manifest.pages : [];
const seen = new Set();
const pageFiles = new Map();
const report = { catalogPages: pages.length, uniquePages: 0, pagesRead: 0, localLinks: 0, localAssets: 0, checkedFragments: 0, placeholderLinks: 0, controlsNeedingReview: 0 };

function decode(value) {
  return value.replace(/&amp;/gi, "&").replace(/&#39;|&apos;/gi, "'").replace(/&quot;/gi, '"');
}
function isExternal(value) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value);
}
function resolveLocal(fromFile, raw) {
  const value = decode(String(raw || "").trim());
  if (!value || isExternal(value)) return null;
  const withoutQuery = value.split("?")[0];
  const withoutHash = withoutQuery.split("#")[0];
  const rootRelative = withoutHash.startsWith("/");
  let target = withoutHash
    ? (rootRelative ? path.resolve(root, withoutHash.replace(/^\/+/, "")) : path.resolve(root, path.dirname(fromFile), withoutHash))
    : path.resolve(root, fromFile);
  if (rootRelative) warnings.push(fromFile + ": URL iniciada por / pode ignorar a base /WEB3.1 no GitHub Pages: " + value);
  if (!target.startsWith(root + path.sep) && target !== root) return { unsafe: true, value };
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
  return { absolute: target, relative: path.relative(root, target).split(path.sep).join("/"), value };
}
function attrs(tag) {
  const out = {};
  for (const match of tag.matchAll(/([^\s=<>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    out[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return out;
}
function getIds(content) {
  return new Set([...content.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(m => decode(m[1])));
}
function checkTarget(from, raw, idsByFile, checkFragment = true) {
  const resolved = resolveLocal(from, raw);
  if (!resolved) return;
  if (resolved.unsafe) {
    errors.push(from + ": caminho local sai do repositório: " + raw);
    return;
  }
  const target = resolved.absolute;
  if (!fs.existsSync(target)) {
    errors.push(from + ": destino local ausente: " + raw + " -> " + resolved.relative);
    return;
  }
  if (/\.html?$/i.test(target)) {
    report.localLinks++;
    if (checkFragment) {
      const hash = String(raw).match(/#(.+)$/);
      if (hash) {
        const anchor = decodeURIComponent(hash[1]);
        let ids = idsByFile.get(resolved.relative);
        if (!ids) {
          try { ids = getIds(fs.readFileSync(target, "utf8")); idsByFile.set(resolved.relative, ids); }
          catch { ids = null; }
        }
        if (ids && !ids.has(anchor)) errors.push(from + ": âncora #" + anchor + " não existe em " + resolved.relative);
        report.checkedFragments++;
      }
    }
  } else {
    report.localAssets++;
  }
}

for (const page of pages) {
  if (!page || typeof page.path !== "string" || !page.path.trim()) {
    errors.push("entrada inválida no catálogo");
    continue;
  }
  const rel = page.path.replace(/\\/g, "/");
  if (rel.startsWith("/") || rel.split("/").includes("..")) {
    errors.push("caminho inseguro no catálogo: " + page.path);
    continue;
  }
  if (seen.has(rel.toLowerCase())) {
    errors.push("página duplicada no catálogo: " + rel);
    continue;
  }
  seen.add(rel.toLowerCase());
  const absolute = path.resolve(root, rel);
  if (!absolute.startsWith(root + path.sep)) {
    errors.push("caminho fora do repositório: " + rel);
    continue;
  }
  if (!fs.existsSync(absolute)) {
    errors.push("página catalogada ausente (inclui diferenças de maiúsculas/minúsculas): " + rel);
    continue;
  }
  pageFiles.set(rel, fs.readFileSync(absolute, "utf8"));
}
report.uniquePages = seen.size;
report.pagesRead = pageFiles.size;

const idsByFile = new Map();
for (const [file, content] of pageFiles) idsByFile.set(file, getIds(content));

for (const [file, content] of pageFiles) {
  for (const match of content.matchAll(/<a\b[^>]*>/gi)) {
    const a = attrs(match[0]);
    if (!Object.hasOwn(a, "href")) {
      warnings.push(file + ": link <a> sem href");
      report.controlsNeedingReview++;
      continue;
    }
    const href = a.href.trim();
    if (!href) {
      errors.push(file + ": link <a> com href vazio");
      continue;
    }
    if (href === "#") {
      const hasAction = Object.keys(a).some(k => k.startsWith("data-")) || Boolean(a.onclick) || a.role === "button";
      if (!hasAction) {
        warnings.push(file + ': link placeholder href="#" sem ação declarada');
        report.placeholderLinks++;
      }
      continue;
    }
    checkTarget(file, href, idsByFile);
  }

  for (const match of content.matchAll(/<(?:script|img|iframe|source|video|audio|input|link)\b[^>]*>/gi)) {
    const tag = match[0];
    const a = attrs(tag);
    const raw = a.src || (tag.toLowerCase().startsWith("<link") ? a.href : "") || a.poster;
    if (raw) checkTarget(file, raw, idsByFile, false);
    if ((tag.toLowerCase().startsWith("<script") || tag.toLowerCase().startsWith("<img") || tag.toLowerCase().startsWith("<iframe")) && ("src" in a) && !a.src.trim()) {
      errors.push(file + ": recurso com src vazio");
    }
  }

  for (const match of content.matchAll(/\bsrcset\s*=\s*(["\'])(.*?)\1/gi)) {
    for (const candidate of match[2].split(",")) {
      const raw = candidate.trim().split(/\s+/)[0];
      if (raw) checkTarget(file, raw, idsByFile, false);
    }
  }
  for (const match of content.matchAll(/url\(\s*["\']?([^)"\']+)["\']?\s*\)/gi)) {
    const raw = match[1].trim();
    if (raw && !raw.startsWith("#")) checkTarget(file, raw, idsByFile, false);
  }

  for (const match of content.matchAll(/<form\b[^>]*>/gi)) {
    const a = attrs(match[0]);
    if (a.action) checkTarget(file, a.action, idsByFile, false);
    if (!a.action && !a.onsubmit && !a.id && !a["data-action"]) {
      warnings.push(file + ": formulário sem action, id ou handler declarados");
      report.controlsNeedingReview++;
    }
  }

  for (const match of content.matchAll(/<button\b[^>]*>/gi)) {
    const a = attrs(match[0]);
    if (a["data-href"]) checkTarget(file, a["data-href"], idsByFile);
    if (a["data-url"]) checkTarget(file, a["data-url"], idsByFile);
    const type = (a.type || "submit").toLowerCase();
    if (type === "button" && !a.onclick && !a["data-action"] && !a["aria-controls"] && !a["data-target"] && !a.id) {
      warnings.push(file + ": botão sem ação/identificador declarados");
      report.controlsNeedingReview++;
    }
  }
}

console.log("CRYPY COLMEIA LINK AUDIT");
console.log(JSON.stringify(report, null, 2));
if (errors.length) {
  console.error("\nFALHAS (" + errors.length + "):");
  for (const item of errors) console.error("- " + item);
}
if (warnings.length) {
  console.warn("\nPONTOS PARA REVISÃO (" + warnings.length + "):");
  for (const item of warnings.slice(0, 150)) console.warn("- " + item);
  if (warnings.length > 150) console.warn("... mais " + (warnings.length - 150) + " avisos");
}
if (errors.length) process.exit(1);
console.log("\nPASS: todos os destinos locais e âncoras verificáveis do catálogo existem.");
