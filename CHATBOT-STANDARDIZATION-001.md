# CRYPY — CHATBOT STANDARDIZATION 001
Date: 2026-11-23
Status: INVENTORY STARTED / MIGRATION NOT YET APPLIED
Branch: chore/chatbot-unification-2026-11-23

## Objective
Make every page in WEB3.1 expose the same official CRYPY/BABY conversational entry point, while preserving page-specific content, visual identity, routes, HD mirrors, and historical copies that are intentionally maintained.

The user clarified that the many chatbot appearances are not intended to become separate competing assistants. They are entry points to the same shared Colmeia/BABY chatbot. The 13 official Colmeia members remain unchanged; this work standardizes access and integration, not membership or agent identities.

## Verified baseline from main
- Recursive Git tree SHA: 33ef3852bed704c3343041ceb9bc09088a4287a7 (truncated=false).
- 75 HTML files have chatbot/chatboot/chat-bot/chat_bot naming patterns.
- 42 JavaScript files have related chatbot/bridge/orchestration naming patterns.
- 90 total related HTML/JS paths were returned by the broader path filter (includes shared widget and bridge/orchestration code).
- Shared widget exists at assets/js/baby-global-chat.js, blob SHA d37e680b465acb676b13ac01a144f5b8cf769c9d.
- Widget's documented design is a floating iframe entry point to the official chat, avoiding copying the full chat implementation into every page.
- Two principal full-chat HTML files are not byte-identical:
  - baby-ia/chatboot-baby-ia.html (SHA 606f76584cde2f7a364dfd88a1f511238752ea55)
  - CRYPY-13-CHATBOOTS/chatboot-baby-ia.html (SHA 4931f107d9cf2d08dfec015e3a9143dd54f53e40)
  They must be compared and assigned explicit roles before either is changed or retired.
- Existing prior audit found inconsistent inclusion of the global widget among sampled pages. Presence of a file named chatbot does not prove that page loads the shared widget or reaches the live BABY backend.

## Standardization contract
1. One canonical conversational service/engine and one canonical integration contract.
2. Every eligible public page loads the shared widget through a stable, correctly resolved script path; no page embeds a private copy of a divergent chatbot engine.
3. Page-specific layouts, menus, content, accessibility, and intentional HD mirror copies are preserved.
4. The official 13-member Colmeia registry is not rewritten by this UI standardization.
5. The shared widget reports truthful connection state: offline/local fallback, backend reachable, authenticated/unauthenticated, and model available/unavailable must not be conflated.
6. No API keys, admin tokens, or private credentials in public HTML/JS.
7. Relative paths must be tested from each directory depth; no blind use of one relative iframe URL across all pages.
8. Keep a manifest of each page, its intended chatbot role, current loader, target loader, dependencies, SHA, test result, and migration status.
9. Preserve intentional copies and mirrors. Do not delete duplicates merely because their bytes match.
10. No bulk rewrite on main. Apply changes on this branch in reviewable batches; run link, script-load, mobile, iframe, and backend health checks before a pull request.

## Work sequence
A. Inventory all 75 matching HTML pages and 42 related JS files; record SHA and exact script/iframe references.
B. Identify canonical full-chat page and distinguish it from specialized panels, bridges, demos, and historical mirrors.
C. Define a single path-safe loader strategy (prefer a root-relative URL on the published site, with a documented local-development fallback).
D. Update eligible original HTML pages in controlled batches on this branch, preserving page content and mirror relationships.
E. Validate all pages and report passed/failed/not-tested separately.
F. Only after review and validation, propose merging to main.

## Current limitations
This commit records the verified inventory baseline and the migration contract only. It does not claim that all pages have been standardized, that all 13 agents are connected, or that generative inference is active.
