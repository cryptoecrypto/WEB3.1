/* CRYPY / BABY — Shared Graphics Runtime
 * Babylon.js 9.37.0, lazy-loaded on user interaction.
 * WebGPU preferred; WebGL fallback. Independent from memory/AI/sync modules.
 */
(() => {
  "use strict";
  if (window.__BABY_GRAPHICS_RUNTIME__) return;
  window.__BABY_GRAPHICS_RUNTIME__ = { version: "1.0.0", engine: "Babylon.js 9.37.0", status: "ready" };
  const CDN = "https://cdn.jsdelivr.net/npm/babylonjs@9.37.0/babylon.js";
  const css = [
    "#baby-gfx-launch{position:fixed;right:16px;bottom:96px;z-index:9996;border:1px solid #00ff88;border-radius:999px;background:#03150c;color:#00ff88;padding:10px 14px;font:800 12px system-ui;letter-spacing:.06em;box-shadow:0 0 18px #00ff8844;cursor:pointer}",
    "#baby-gfx-launch:focus-visible,#baby-gfx-close:focus-visible{outline:3px solid #fff;outline-offset:3px}",
    "#baby-gfx-modal{position:fixed;inset:0;z-index:9997;background:#010604ed;display:none;align-items:center;justify-content:center;padding:14px}",
    "#baby-gfx-modal.open{display:flex}",
    "#baby-gfx-panel{width:min(920px,100%);height:min(680px,92dvh);min-height:340px;border:1px solid #00ff88;border-radius:18px;overflow:hidden;background:radial-gradient(ellipse at 50% 35%,#103b27,#020806 72%);display:flex;flex-direction:column;box-shadow:0 0 45px #00ff8833}",
    "#baby-gfx-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;color:#dffff0;font:700 12px system-ui;border-bottom:1px solid #175538}",
    "#baby-gfx-toolbar strong{color:#00ff88;letter-spacing:.1em}",
    "#baby-gfx-close{border:1px solid #00ff88;border-radius:9px;background:#06150d;color:#00ff88;padding:7px 11px;font-weight:800}",
    "#baby-gfx-stage{position:relative;flex:1;min-height:0}",
    "#baby-gfx-canvas{width:100%;height:100%;display:block;touch-action:pan-y;outline:none}",
    "#baby-gfx-status{position:absolute;left:12px;bottom:10px;padding:6px 9px;border:1px solid #175538;border-radius:8px;background:#020806cc;color:#b9e8ce;font:11px system-ui;pointer-events:none}",
    "@media(max-width:600px){#baby-gfx-launch{right:12px;bottom:88px}#baby-gfx-modal{padding:7px}#baby-gfx-panel{height:88dvh;min-height:300px}}",
    "@media(prefers-reduced-motion:reduce){#baby-gfx-launch{box-shadow:none}}"
  ].join("");
  const style = document.createElement("style");
  style.id = "baby-gfx-style"; style.textContent = css; document.head.appendChild(style);
  const launch = document.createElement("button");
  launch.id = "baby-gfx-launch"; launch.type = "button"; launch.textContent = "✦ BABY 3D";
  launch.setAttribute("aria-haspopup", "dialog"); launch.setAttribute("aria-controls", "baby-gfx-modal");
  const modal = document.createElement("div");
  modal.id = "baby-gfx-modal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Núcleo gráfico 3D do BABY");
  modal.innerHTML = '<section id="baby-gfx-panel"><div id="baby-gfx-toolbar"><span><strong>BABY GRAPHICS CORE</strong> · CRYPY</span><button id="baby-gfx-close" type="button">FECHAR ×</button></div><div id="baby-gfx-stage"><canvas id="baby-gfx-canvas" aria-label="Núcleo tridimensional CRYPY"></canvas><div id="baby-gfx-status">Aguardando inicialização…</div></div></section>';
  document.body.append(launch, modal);
  let loadPromise = null, engine = null, scene = null, resizeObserver = null;
  const status = s => { const el = document.getElementById("baby-gfx-status"); if (el) el.textContent = s; };
  function loadBabylon() {
    if (window.BABYLON) return Promise.resolve(window.BABYLON);
    if (loadPromise) return loadPromise;
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script"); script.src = CDN; script.async = true;
      script.onload = () => window.BABYLON ? resolve(window.BABYLON) : reject(new Error("Biblioteca carregada sem namespace BABYLON."));
      script.onerror = () => reject(new Error("Não foi possível carregar Babylon.js. Verifique a conexão."));
      document.head.appendChild(script);
    });
    return loadPromise;
  }
  async function createScene() {
    const B = await loadBabylon(), canvas = document.getElementById("baby-gfx-canvas");
    status("Preparando WebGPU…");
    if (B.WebGPUEngine && navigator.gpu) {
      try {
        const supported = await B.WebGPUEngine.IsSupportedAsync;
        if (supported) {
          const candidate = new B.WebGPUEngine(canvas, { antialias: true, adaptToDeviceRatio: true });
          await candidate.initAsync(); engine = candidate;
          window.__BABY_GRAPHICS_RUNTIME__.backend = "WebGPU";
        }
      } catch (e) { engine = null; }
    }
    if (!engine) {
      if (!B.Engine.IsSupported) throw new Error("Este navegador não oferece suporte gráfico WebGL.");
      engine = new B.Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, powerPreference: "high-performance" }, true);
      window.__BABY_GRAPHICS_RUNTIME__.backend = "WebGL";
    }
    scene = new B.Scene(engine); scene.clearColor = new B.Color4(0.005, 0.025, 0.014, 1);
    const camera = new B.ArcRotateCamera("baby-camera", -Math.PI / 2, Math.PI / 2.25, 6.5, B.Vector3.Zero(), scene);
    camera.attachControl(canvas, true); camera.lowerRadiusLimit = 4.2; camera.upperRadiusLimit = 9;
    camera.wheelPrecision = 65; camera.panningSensibility = 0;
    new B.HemisphericLight("baby-ambient", new B.Vector3(0, 1, 0), scene).intensity = 0.65;
    const key = new B.PointLight("baby-green-light", new B.Vector3(0, 2, -2), scene);
    key.diffuse = new B.Color3(0, 1, 0.48); key.intensity = 2.1;
    const rim = new B.PointLight("baby-blue-light", new B.Vector3(2, -1, 2), scene);
    rim.diffuse = new B.Color3(0.08, 0.35, 1); rim.intensity = 0.8;
    const core = B.MeshBuilder.CreatePolyhedron("crypy-crystal", { type: 1, size: 1.42 }, scene);
    core.rotation.z = Math.PI / 4;
    const crystal = new B.PBRMetallicRoughnessMaterial("crypy-crystal-material", scene);
    crystal.baseColor = new B.Color3(0.015, 0.45, 0.20); crystal.metallic = 0.72; crystal.roughness = 0.2;
    crystal.emissiveColor = new B.Color3(0, 0.34, 0.12); core.material = crystal;
    const visor = B.MeshBuilder.CreateBox("baby-neon-visor", { width: 1.42, height: 0.15, depth: 0.12 }, scene);
    visor.position.set(0, 0.18, -0.76);
    const visorMat = new B.StandardMaterial("baby-visor-material", scene);
    visorMat.emissiveColor = new B.Color3(0.05, 1, 0.4); visorMat.diffuseColor = new B.Color3(0.01, 0.25, 0.1);
    visor.material = visorMat;
    const ring = B.MeshBuilder.CreateTorus("crypy-rainbow-ring", { diameter: 3.7, thickness: 0.055, tessellation: 96 }, scene);
    ring.rotation.x = Math.PI / 2.35;
    const ringMat = new B.StandardMaterial("crypy-ring-material", scene);
    ringMat.emissiveColor = new B.Color3(0.05, 0.85, 0.35); ring.material = ringMat;
    const colors = [new B.Color3(1, 0.12, 0.08), new B.Color3(0.05, 1, 0.25), new B.Color3(0.08, 0.35, 1)];
    const orbs = colors.map((color, i) => {
      const orb = B.MeshBuilder.CreateSphere("crypy-orb-" + i, { diameter: 0.25, segments: 24 }, scene);
      const mat = new B.StandardMaterial("crypy-orb-mat-" + i, scene);
      mat.emissiveColor = color; mat.diffuseColor = color; orb.material = mat; return orb;
    });
    try { const glow = new B.GlowLayer("baby-glow", scene, { blurKernelSize: 32 }); glow.intensity = 0.7; } catch (e) { /* Glow is optional; keep the core renderer alive. */ }
    const floor = B.MeshBuilder.CreateGround("baby-grid", { width: 12, height: 12, subdivisions: 24 }, scene);
    floor.position.y = -1.75;
    const floorMat = new B.StandardMaterial("baby-grid-material", scene);
    floorMat.wireframe = true; floorMat.alpha = 0.13; floorMat.emissiveColor = new B.Color3(0, 0.4, 0.18); floor.material = floorMat;
    let t = 0;
    engine.runRenderLoop(() => {
      if (!scene || !modal.classList.contains("open")) return;
      t += engine.getDeltaTime() * 0.00045; core.rotation.y += 0.004; core.rotation.x = Math.sin(t) * 0.12;
      ring.rotation.y += 0.003; ring.rotation.z += 0.0015;
      orbs.forEach((orb, i) => { const a = t * 1.7 + i * (Math.PI * 2 / 3); orb.position.set(Math.cos(a) * 1.85, Math.sin(a * 1.3) * 0.42, Math.sin(a) * 1.85); });
      scene.render();
    });
    if (window.ResizeObserver) { resizeObserver = new ResizeObserver(() => engine && engine.resize()); resizeObserver.observe(document.getElementById("baby-gfx-stage")); }
    window.__BABY_GRAPHICS_RUNTIME__.status = "running";
    status("Render: " + window.__BABY_GRAPHICS_RUNTIME__.backend + " · toque e arraste para girar");
  }
  async function open() {
    modal.classList.add("open"); launch.setAttribute("aria-expanded", "true");
    document.getElementById("baby-gfx-close").focus();
    if (engine) { engine.resize(); return; }
    try { await createScene(); }
    catch (error) { status("Motor indisponível: " + error.message); window.__BABY_GRAPHICS_RUNTIME__.status = "error"; }
  }
  function close() {
    modal.classList.remove("open"); launch.setAttribute("aria-expanded", "false"); launch.focus();
    if (engine) {
      engine.stopRenderLoop(); if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
      scene.dispose(); engine.dispose(); scene = null; engine = null;
      window.__BABY_GRAPHICS_RUNTIME__.status = "ready";
    }
  }
  launch.addEventListener("click", open);
  document.getElementById("baby-gfx-close").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) close(); });
})();