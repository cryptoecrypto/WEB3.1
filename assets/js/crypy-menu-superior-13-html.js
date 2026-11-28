/* CRYPY WEB3.1 — Menu superior com as 13 pastas e todos os HTMLs públicos catalogados. */
(function () {
  "use strict";
  if (window.__CRYPY_MENU_SUPERIOR_13_HTML__) return;
  window.__CRYPY_MENU_SUPERIOR_13_HTML__ = true;

  var manifestUrl = new URL("assets/data/crypy-menu-superior-13-html.json", document.baseURI);
  var panelId = "crypy-menu-superior-13-html-panel";
  var stylesId = "crypy-menu-superior-13-html-styles";
  var panel = null;
  var trigger = null;
  var searchInput = null;

  function addStyles() {
    if (document.getElementById(stylesId)) return;
    var style = document.createElement("style");
    style.id = stylesId;
    style.textContent = [
      "#" + panelId + "{position:fixed;z-index:2147483000;display:none;box-sizing:border-box;max-height:78vh;overflow:auto;padding:14px;background:#061009;color:#e9fff1;border:1px solid rgba(0,255,136,.48);border-radius:16px;box-shadow:0 18px 60px rgba(0,0,0,.65);font:14px/1.45 system-ui,sans-serif}",
      "#" + panelId + " *{box-sizing:border-box}",
      "#" + panelId + " .crypy-menu-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px}",
      "#" + panelId + " .crypy-menu-title{font-weight:900;letter-spacing:.08em;color:#00ff88}",
      "#" + panelId + " .crypy-menu-count{font-size:12px;color:#b7c9bd}",
      "#" + panelId + " .crypy-menu-search{width:100%;margin:0 0 12px;padding:11px 13px;border-radius:10px;border:1px solid #31513d;background:#0b1b10;color:#fff;outline:none}",
      "#" + panelId + " .crypy-menu-search:focus{border-color:#00ff88}",
      "#" + panelId + " .crypy-menu-close{border:1px solid #45634d;border-radius:9px;padding:7px 11px;background:#102317;color:#dfffea;font-weight:800;cursor:pointer}",
      "#" + panelId + " details{border:1px solid #243d2c;border-radius:11px;margin:7px 0;overflow:hidden;background:#09170d}",
      "#" + panelId + " summary{cursor:pointer;list-style:none;padding:12px 13px;font-weight:850;color:#f1fff5;display:flex;justify-content:space-between;gap:10px;align-items:center}",
      "#" + panelId + " summary::-webkit-details-marker{display:none}",
      "#" + panelId + " summary:after{content:'＋';color:#00ff88}",
      "#" + panelId + " details[open] summary:after{content:'−'}",
      "#" + panelId + " .crypy-menu-pages{padding:0 10px 10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:6px}",
      "#" + panelId + " .crypy-menu-link{display:block;min-width:0;padding:9px 10px;border-radius:8px;background:#102317;color:#eafff0;text-decoration:none;border:1px solid transparent;overflow-wrap:anywhere}",
      "#" + panelId + " .crypy-menu-link:hover{border-color:#00ff88;background:#14301e}",
      "#" + panelId + " .crypy-menu-link small{display:block;color:#91aa99;font-size:11px;margin-top:3px}",
      "#" + panelId + " .crypy-menu-empty{padding:12px;color:#a7b8ad}",
      "@media(max-width:600px){#" + panelId + "{left:8px!important;width:calc(100vw - 16px)!important;max-height:78vh;padding:10px}#" + panelId + " summary{font-size:13px}}"
    ].join("");
    document.head.appendChild(style);
  }

  function placePanel(header) {
    if (!panel || !header) return;
    var rect = header.getBoundingClientRect();
    var margin = window.innerWidth <= 600 ? 8 : Math.max(12, (window.innerWidth - 1152) / 2);
    panel.style.top = Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 100)) + "px";
    panel.style.left = margin + "px";
    panel.style.width = Math.min(window.innerWidth - margin * 2, 1152) + "px";
  }

  function closeMenu() {
    if (!panel || !trigger) return;
    panel.style.display = "none";
    trigger.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    if (!panel || !trigger) return;
    var header = trigger.closest("header") || document.querySelector("header");
    placePanel(header);
    panel.style.display = "block";
    trigger.setAttribute("aria-expanded", "true");
    if (searchInput) searchInput.focus({preventScroll:true});
  }

  function applyFilter(query) {
    if (!panel) return;
    var q = (query || "").trim().toLocaleLowerCase("pt-BR");
    var sections = panel.querySelectorAll("details[data-menu-group]");
    sections.forEach(function (section) {
      var links = section.querySelectorAll(".crypy-menu-link");
      var visible = 0;
      links.forEach(function (link) {
        var match = !q || (link.dataset.search || "").indexOf(q) !== -1;
        link.hidden = !match;
        if (match) visible++;
      });
      section.hidden = visible === 0;
      if (q && visible) section.open = true;
      if (!q) section.open = false;
    });
    var empty = panel.querySelector(".crypy-menu-empty");
    if (empty) empty.hidden = !!panel.querySelector('details[data-menu-group]:not([hidden])');
  }

  function render(manifest) {
    if (!manifest || !Array.isArray(manifest.groups) || manifest.groups.length !== 13) {
      throw new Error("Catálogo do menu não contém as 13 categorias.");
    }
    addStyles();
    panel = document.createElement("section");
    panel.id = panelId;
    panel.setAttribute("aria-label", "Menu superior da Colmeia com 13 pastas e páginas HTML");
    panel.innerHTML = '<div class="crypy-menu-top"><div><div class="crypy-menu-title">MENU DA COLMEIA</div><div class="crypy-menu-count">13 PASTAS · ' + Number(manifest.total || 0) + ' HTMLS</div></div><button type="button" class="crypy-menu-close">FECHAR ✕</button></div><input class="crypy-menu-search" type="search" placeholder="Buscar uma página HTML nas 13 pastas…" aria-label="Buscar página HTML"><div class="crypy-menu-groups"></div><div class="crypy-menu-empty" hidden>Nenhum HTML corresponde à busca.</div>';
    document.body.appendChild(panel);
    searchInput = panel.querySelector(".crypy-menu-search");
    panel.querySelector(".crypy-menu-close").addEventListener("click", closeMenu);
    searchInput.addEventListener("input", function () { applyFilter(searchInput.value); });

    var holder = panel.querySelector(".crypy-menu-groups");
    manifest.groups.forEach(function (group, index) {
      var details = document.createElement("details");
      details.dataset.menuGroup = group.id;
      var summary = document.createElement("summary");
      var title = document.createElement("span");
      title.textContent = String(index + 1).padStart(2, "0") + " · " + group.name;
      var count = document.createElement("span");
      count.textContent = group.pages.length + " HTML";
      count.style.cssText = "font-size:11px;color:#00ff88;white-space:nowrap";
      summary.appendChild(title);
      summary.appendChild(count);
      details.appendChild(summary);

      var list = document.createElement("div");
      list.className = "crypy-menu-pages";
      group.pages.forEach(function (page) {
        var link = document.createElement("a");
        link.className = "crypy-menu-link";
        link.href = page.path.split("/").map(encodeURIComponent).join("/");
        link.textContent = page.label;
        var sub = document.createElement("small");
        sub.textContent = page.section || group.folder;
        link.appendChild(sub);
        link.dataset.search = (group.name + " " + page.label + " " + page.path + " " + (page.section || "")).toLocaleLowerCase("pt-BR");
        list.appendChild(link);
      });
      details.appendChild(list);
      holder.appendChild(details);
    });
    applyFilter("");
  }

  function bindTrigger() {
    if (trigger) return true;
    var header = document.querySelector("header");
    if (!header) return false;
    var buttons = Array.prototype.slice.call(header.querySelectorAll("button"));
    trigger = buttons.find(function (button) {
      return (button.textContent || "").replace(/\s+/g, " ").trim().toUpperCase() === "MENU";
    });
    if (!trigger) return false;
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", panelId);
    return true;
  }

  document.addEventListener("click", function (event) {
    var clicked = event.target && event.target.closest ? event.target.closest("button") : null;
    if (clicked && trigger && clicked === trigger) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
      if (panel && panel.style.display === "block") closeMenu();
      else openMenu();
      return;
    }
    if (panel && panel.style.display === "block" && !panel.contains(event.target)) closeMenu();
  }, true);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", function () {
    if (panel && panel.style.display === "block") placePanel(trigger && trigger.closest("header"));
  });
  window.addEventListener("scroll", function () {
    if (panel && panel.style.display === "block") placePanel(trigger && trigger.closest("header"));
  }, true);

  fetch(manifestUrl.href, {cache:"no-store"})
    .then(function (response) {
      if (!response.ok) throw new Error("Catálogo do menu indisponível: HTTP " + response.status);
      return response.json();
    })
    .then(function (data) {
      render(data);
      bindTrigger();
      if (!trigger) {
        var observer = new MutationObserver(function () {
          if (bindTrigger()) observer.disconnect();
        });
        observer.observe(document.body, {childList:true,subtree:true});
      }
    })
    .catch(function (error) {
      console.error("[CRYPY MENU 13]", error);
    });
})();
