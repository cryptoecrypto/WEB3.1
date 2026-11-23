import fs from "node:fs";
import vm from "node:vm";

const htmlPath = "chatboot-baby-ia.html";
const html = fs.readFileSync(htmlPath, "utf8");
const scripts = Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))
  .filter(match => {
    const attrs = match[1];
    if (/\bsrc\s*=/.test(attrs)) return false;
    const typeMatch = attrs.match(/\btype=["']([^"']+)["']/i);
    const type = typeMatch ? typeMatch[1].toLowerCase() : "";
    return !type || type === "module" || type === "text/javascript" || type === "application/javascript";
  })
  .map(match => match[2])
  .filter(source => source.trim());

if (!scripts.length) {
  console.error("Nenhum script inline encontrado em " + htmlPath);
  process.exit(1);
}

for (let index = 0; index < scripts.length; index++) {
  try {
    new vm.Script(scripts[index], { filename: htmlPath + "#inline-" + (index + 1) });
  } catch (error) {
    console.error("Script inline " + (index + 1) + " inválido: " + error.message);
    process.exit(1);
  }
}
console.log("PASS: " + scripts.length + " scripts inline do BABY compilam sem erro.");
