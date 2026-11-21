import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile("cf-web-baby/protection/protected-files.json", "utf8"));
if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
  throw new Error("Protected-file baseline is empty; refusing to pass.");
}
const failures = [];
for (const entry of manifest.files) {
  const bytes = await readFile(entry.path);
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual !== entry.sha256) failures.push({ path: entry.path, expected: entry.sha256, actual });
}
if (failures.length) {
  console.error(JSON.stringify({ status: "FAIL", failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ status: "PASS", checked: manifest.files.length, source: manifest.baselineSource }, null, 2));
