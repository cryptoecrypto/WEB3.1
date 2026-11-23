/* BABY I.A. — pesquisa externa controlada.
 * Este módulo é carregado somente por chatboot-baby-ia.html.
 * Google: abre a página oficial de resultados no navegador (sem scraping/API key).
 * Wikipedia: consulta a API pública MediaWiki em português e devolve trechos citáveis.
 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.BabyResearch = api;
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  function parseIntent(input) {
    var value = String(input || "").trim();
    if (!value) return null;
    var match = value.match(/^(google|wiki|wikipedia|wikip[eé]dia)\s*[:\-]\s*(.+)$/i);
    if (match) {
      var provider = /^google$/i.test(match[1]) ? "google" : "wikipedia";
      return { provider: provider, query: match[2].trim() };
    }
    match = value.match(/^(?:pesquise|pesquisar|pesquisa|busque|buscar|procure)\s+(?:sobre\s+)?(.+)$/i);
    if (match) {
      var query = match[1].trim().replace(/^(?:no\s+)?google\s+(?:e\s+)?(?:na\s+)?wikip[eé]dia\s+/i, "");
      return { provider: "both", query: query.trim() };
    }
    return null;
  }

  function googleUrl(query) {
    return "https://www.google.com/search?q=" + encodeURIComponent(String(query || "").trim());
  }

  function openGoogle(query, openWindow) {
    var opener = typeof openWindow === "function"
      ? openWindow
      : (typeof window !== "undefined" && window.open ? window.open.bind(window) : null);
    if (!opener) return { url: googleUrl(query), opened: false };
    var child = opener(googleUrl(query), "_blank");
    if (child) {
      try { child.opener = null; } catch (_) {}
    }
    return { url: googleUrl(query), opened: !!child };
  }

  function stripMarkup(value) {
    return String(value || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
  }

  async function searchWikipedia(query, fetcher) {
    var term = String(query || "").trim();
    if (!term) return [];
    var request = typeof fetcher === "function"
      ? fetcher
      : (typeof fetch === "function" ? fetch : null);
    if (!request) throw new Error("Fetch não está disponível neste navegador.");
    var params = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: term,
      srlimit: "5",
      srprop: "snippet",
      format: "json",
      utf8: "1",
      origin: "*"
    });
    var response = await request("https://pt.wikipedia.org/w/api.php?" + params.toString(), {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    if (!response || !response.ok) throw new Error("Wikipedia respondeu com erro de rede.");
    var data = await response.json();
    var items = data && data.query && Array.isArray(data.query.search) ? data.query.search : [];
    return items.map(function (item) {
      return {
        title: String(item.title || ""),
        snippet: stripMarkup(item.snippet || ""),
        pageId: Number(item.pageid || 0),
        url: "https://pt.wikipedia.org/?curid=" + encodeURIComponent(String(item.pageid || ""))
      };
    }).filter(function (item) { return item.title && item.pageId > 0; });
  }

  return {
    parseIntent: parseIntent,
    googleUrl: googleUrl,
    openGoogle: openGoogle,
    searchWikipedia: searchWikipedia
  };
});