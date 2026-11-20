import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root,"assets","data","crypy-page-index.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath,"utf8"));
const errors = [];

if (!Array.isArray(manifest.pages)) errors.push("índice não contém pages[]");
if (manifest.total !== manifest.pages.length) errors.push("total do índice não confere");

const seen = new Set();
for (const page of manifest.pages || []) {
  if (!page || typeof page.path !== "string") {
    errors.push("entrada inválida no índice");
    continue;
  }
  if (seen.has(page.path)) errors.push("caminho duplicado: " + page.path);
  seen.add(page.path);
  const target = path.resolve(root,page.path);
  if (!target.startsWith(root + path.sep)) errors.push("caminho fora do repositório: " + page.path);
  else if (!fs.existsSync(target)) errors.push("página ausente: " + page.path);
}

// HOME e seus componentes são protegidos e ficam fora deste validador de integração.
// Não exigir alterações de menu, scripts ou visualizador em arquivos protegidos.

const serviceEntrypoints = [
  "crypy-server-bridge/public/index.html",
  "crypy-news/hd-matriz/crypy-server-bridge/public/index.html"
];
for (const file of serviceEntrypoints) {
  if (seen.has(file)) errors.push("entrada operacional do servidor não deve aparecer no índice público: " + file);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("PASS: " + manifest.pages.length + " páginas catalogadas e presentes; entradas operacionais excluídas; HOME protegida não modificada nem homologada por este validador.");
