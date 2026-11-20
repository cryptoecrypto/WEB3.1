import fs from "node:fs";

const patchPath = process.argv[2];
if (!patchPath || !fs.existsSync(patchPath)) {
  console.error("Patch ausente.");
  process.exit(2);
}
const patch = fs.readFileSync(patchPath, "utf8");
const paths = [...patch.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)].map(m => m[2]);
if (patch.trim() && paths.length === 0) {
  console.error("Não foi possível identificar caminhos no patch.");
  process.exit(3);
}

function allowed(file) {
  if (!file || file.startsWith("/") || file.split("/").includes("..")) return false;
  if (file === "index.html") return false;
  if (/^(nft-collection|crypy-news\/hd-matriz|crypy-server-bridge|\.github|scripts)\//i.test(file)) return false;
  if (/^baby-ia\//i.test(file) && file !== "baby-ia/centro.html") return false;
  if (/^(Memorias\.json|Manifest\.json)$/i.test(file) || /(^|\/)(Memorias|Manifest)\.json$/i.test(file)) return false;
  if (/\.(env|pem|key|p12|pfx)$/i.test(file) || /(^|\/)(secrets?|credentials?)\//i.test(file)) return false;
  if (/\.html?$/i.test(file)) return true;
  if (file === "assets/css/crypy-world.css") return true;
  if (file === "assets/js/crypy-global-nav.js" || file === "assets/js/crypy-world.js") return true;
  return false;
}

const denied = [...new Set(paths.filter(p => !allowed(p)))];
if (denied.length) {
  console.error("PATCH BLOQUEADO — caminhos fora do escopo:", denied.join(", "));
  process.exit(4);
}
console.log("PATCH_SCOPE_OK");
console.log("Arquivos alterados:", paths.length);
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, "has_changes=" + (paths.length ? "true" : "false") + "\n");
}