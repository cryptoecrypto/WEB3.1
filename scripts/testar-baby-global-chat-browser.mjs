import { chromium } from "playwright";

const base = "http://127.0.0.1:4173/";
const pages = [
  "crypy-infinyt/portal.html",
  "crypy-academy/academia.html",
  "esquadrao-das-cores/esquadrao.html",
  "nft-collection/galeria.html",
  "biografia/historia.html",
  "crypy-news/index.html",
  "crypy-news/museu.html",
  "art-figure-marketplace/marketplace.html",
  "crypy-games-desafios/crypy-games-desafios.html",
  "social-crypykut/comunidade.html",
  "baby-ia/centro.html",
  "crypy-coin/white-paper.html",
  "contato/contato-oficial.html"
];

const browser = await chromium.launch({ headless: true });
const failures = [];
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  page.setDefaultTimeout(12000);
  for (const path of pages) {
    try {
      const response = await page.goto(base + path, { waitUntil: "domcontentloaded" });
      if (!response || !response.ok()) throw new Error("HTTP " + (response && response.status()));
      await page.waitForSelector("#crypy-global-navigation", { state: "attached" });
      await page.waitForSelector("#crypy-baby-global-root", { state: "attached" });

      const menuButton = page.locator("#crypy-global-nav-toggle");
      await menuButton.click();
      if (await menuButton.getAttribute("aria-expanded") !== "true") throw new Error("menu global não abriu");
      await menuButton.click();

      const babyButton = page.locator("#crypy-baby-global-toggle");
      await babyButton.click();
      const panel = page.locator("#crypy-baby-global-panel");
      if (await panel.getAttribute("data-open") !== "true") throw new Error("painel BABY não abriu");

      await page.waitForFunction(() => {
        const frame = document.querySelector("#crypy-baby-global-frame");
        if (!frame) return false;
        try {
          return frame.contentWindow.location.pathname.endsWith("/chatboot-baby-ia.html");
        } catch (_) { return false; }
      });
      const frameUrl = await page.locator("#crypy-baby-global-frame").getAttribute("src");
      if (!frameUrl || !new URL(frameUrl).pathname.endsWith("/chatboot-baby-ia.html")) {
        throw new Error("iframe não aponta para a página canônica do BABY");
      }
      console.log("OK — " + path + " | menu e chatbot global | " + frameUrl);
    } catch (error) {
      failures.push(path + " — " + (error?.message || String(error)));
      console.error("FALHA — " + path + " — " + (error?.message || String(error)));
    }
  }
} finally {
  await browser.close();
}
if (failures.length) process.exitCode = 1;
else console.log("OK — teste real em Chromium concluído nas 13 páginas oficiais.");
