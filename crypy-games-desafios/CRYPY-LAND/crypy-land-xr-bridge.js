/* CRYPY LAND XR Bridge — fase inicial WebXR
 * Integração opcional sobre a cena Three.js existente.
 * Não envia dados, não autentica contas e não ativa pagamentos.
 */
(function () {
  "use strict";
  const button = document.getElementById("crypyEnterVR");
  const status = document.getElementById("crypyXRStatus");
  if (!button || !status) return;

  const say = (message) => { status.textContent = message; };
  const runtime = () => window.CRYPY_LAND_XR_RUNTIME;

  async function inspectSupport() {
    if (!window.isSecureContext) {
      say("XR indisponível: abra esta página por HTTPS ou localhost seguro.");
      button.disabled = true;
      return;
    }
    if (!navigator.xr) {
      say("Este navegador não expõe WebXR. A cidade continua disponível em modo 3D de tela.");
      button.disabled = true;
      return;
    }
    try {
      const vr = await navigator.xr.isSessionSupported("immersive-vr");
      let ar = false;
      try { ar = await navigator.xr.isSessionSupported("immersive-ar"); } catch (_) {}
      button.disabled = !vr;
      say("WebXR detectado • VR: " + (vr ? "suportado" : "não disponível") +
          " • AR: " + (ar ? "detectado (modo passthrough ainda não ativado)" : "não disponível") +
          ". A disponibilidade final depende do navegador, headset e runtime.");
    } catch (error) {
      button.disabled = true;
      say("Não foi possível consultar WebXR neste dispositivo. Modo 3D de tela preservado.");
    }
  }

  async function enterVR() {
    const r = runtime();
    if (!r || !r.renderer || !r.scene || !r.camera) {
      say("A cena 3D ainda não está pronta. Recarregue a página e tente novamente.");
      return;
    }
    if (!navigator.xr) return;
    button.disabled = true;
    try {
      const session = await navigator.xr.requestSession("immersive-vr", {
        optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"]
      });
      r.renderer.xr.enabled = true;
      try { r.renderer.xr.setReferenceSpaceType("local-floor"); } catch (_) {}
      addControllerPointers(r);
      await r.renderer.xr.setSession(session);
      button.textContent = "⏹ Sair do VR";
      say("Sessão VR iniciada. Use o botão de seleção do controle para selecionar um terreno.");
      session.addEventListener("end", () => {
        button.textContent = "🥽 Entrar em VR";
        button.disabled = false;
        say("Sessão VR encerrada. A cidade voltou ao modo 3D de tela.");
      }, { once: true });
      button.onclick = async () => {
        button.disabled = true;
        try { await session.end(); } catch (_) { button.disabled = false; }
      };
    } catch (error) {
      button.disabled = false;
      say("Não foi possível iniciar VR: " + (error && error.message ? error.message : "sessão recusada") +
          ". Verifique HTTPS, permissões e suporte do headset.");
    }
  }

  function addControllerPointers(r) {
    if (r.__crypyControllersAdded) return;
    r.__crypyControllersAdded = true;
    const tempMatrix = new THREE.Matrix4();
    for (let i = 0; i < 2; i++) {
      const controller = r.renderer.xr.getController(i);
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -4)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x00ff88 }));
      controller.add(line);
      controller.addEventListener("select", () => {
        r.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        r.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        const hits = r.raycaster.intersectObjects(r.lotMeshes, false);
        if (hits.length) r.selectLot(hits[0].object.userData.index);
      });
      r.scene.add(controller);
    }
  }

  button.addEventListener("click", () => {
    if (button.textContent.indexOf("Sair") >= 0) return;
    enterVR();
  });
  inspectSupport();
})();
