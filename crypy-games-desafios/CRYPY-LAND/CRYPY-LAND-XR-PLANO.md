# CRYPY LAND XR — Fundação técnica v0.1

**Estado:** estrutura inicial em branch; não homologada nem publicada em produção.  
**Base:** versão existente `crypy-land-3d-vivo.html` (Three.js r128).  
**Estratégia aprovada para esta etapa:** WebXR primeiro; OpenXR fica como trilha futura para builds nativos.

## Arquivos

- `crypy-land-3d-vivo-xr.html`: cópia XR de avaliação. A página original permanece intacta.
- `crypy-land-xr-bridge.js`: ponte WebXR opcional que detecta suporte, inicia uma sessão `immersive-vr` e conecta os dois controles XR à seleção de terrenos.
- `CRYPY-LAND-XR-PLANO.md`: este documento.

## O que esta fundação faz

1. Mantém o jogo 3D normal como fallback.
2. Verifica contexto seguro (HTTPS/localhost) e a disponibilidade de `navigator.xr`.
3. Consulta suporte para `immersive-vr` e `immersive-ar`.
4. Permite iniciar VR quando o navegador/runtime declara suporte.
5. Usa `WebXR InputSource`/controladores genéricos, sem SDK por fabricante.
6. Permite apontar e selecionar os terrenos com o botão de seleção do controle.
7. Usa `renderer.setAnimationLoop`, necessário para renderização compatível com XR.

## Limites conhecidos — não declarar como concluído

- AR/passthrough é apenas detectado; não há sessão AR, composição transparente nem colocação de objetos no ambiente real.
- Teleporte e locomoção confortável ainda não foram implementados.
- Mãos rastreadas são solicitadas como recurso opcional, mas gestos não estão mapeados.
- Não há validação de performance/FPS por headset, testes de conforto, nem testes físicos em Quest/Pico/HTC/Valve Index.
- A versão usa Three.js r128 via CDN. A compatibilidade XR deve ser validada no navegador/runtime alvo antes de atualizar dependências.
- WebXR requer HTTPS ou localhost seguro e depende do navegador, sistema operacional, runtime e permissões.
- Não existe sincronização multiplayer, backend, carteira, NFT, CCG real, login ou armazenamento remoto nesta ponte.

## Arquitetura proposta

```text
CRYPY LAND
├── Modo 3D desktop (fallback existente)
├── CRYPY LAND XR Bridge
│   ├── WebXR capability detection
│   ├── VR session manager
│   ├── Generic controller input
│   └── Lot selection ray
├── Próxima fase
│   ├── Teleport locomotion + snap turn
│   ├── World-space HUD / CCG-WALLET (somente UI)
│   ├── Performance profiles por classe de dispositivo
│   └── AR session + hit-test/anchors (após protótipo VR)
└── Trilha futura
    └── OpenXR para build nativo PC/headset (Unity/Unreal ou runtime nativo)
```

## Critérios de homologação antes de produção

- HTTPS válido e deteção de capacidades em cada navegador alvo.
- Entrada/saída de VR sem travar ou perder o modo desktop.
- Seleção de terreno com controle esquerdo/direito.
- Testes de pausa, perda de foco, encerramento inesperado e reconexão.
- Medição sustentada de FPS e frame time por dispositivo.
- Teleporte, snap turn, opção de movimento contínuo e conforto visual.
- Auditoria de dependências/CDN e política de permissões.
- Testes reais em pelo menos um dispositivo de cada família pretendida; não inferir compatibilidade por marca.

## MODO REAL

**Criado nesta branch:** cópia XR e ponte experimental.  
**Não feito:** merge em `main`, publicação Pages, teste em headset, homologação, AR funcional ou OpenXR nativo.
