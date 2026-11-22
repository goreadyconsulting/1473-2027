# LARP Time Portal — production implementation plan

## Goal
Transform the current one-device app into a connected seven-hour installation: a **wordless iPad player viewport** and **authenticated phone organiser controls** at a separate URL. The portal animation references the supplied 1.6-second blue-violet spiral clip; make an original, seamless, GPU-aware Canvas rendering rather than depending on low-resolution video upscale.

## Screens & interactions
1. **Idle portal:** entire iPad viewport filled by a continuously moving blue/cobalt/purple spiral. No text, menus, countdown, buttons or icons. Touch anywhere to cross.
2. **The void:** first-person stone walkway into star-filled outside-space; tap anywhere repeatedly to walk. Each step includes slight camera shake/bob and a subtle, gesture-triggered synthesized footstep. Progressive perspective moves toward a monumental rune slab.
3. **Runestone:** large slab with seven equally spaced touchable runes. Selecting a rune opens its destination. No explanatory overlay.
4. **Location reel:** 3 successive animated framed images per place, film grain, cinematic push/zoom, dissolves; original illustrated images bundled offline. One scene includes a grocery-store aisle/reveal to demonstrate this requirement.
5. **Object reveal:** local illustrated background, tappable surviving relic images. Tapping an item opens a photographic/illustrated focus view; no player-facing labels or text.
6. **Automatic fate:** 9 starting relics; first loss after each elapsed hour; in one randomly chosen hour two die, giving 8 scheduled eliminations and 1 remaining survivor after 7 hours. The player sees only visual erasure and an atmospheric flash, never admin controls or timer.

## Phone organiser
`/admin/` mobile-first dashboard with a strong passcode (only hash stored in DB), a server-authoritative seven-hour clock, next scheduled loss, past events, alive/eliminated relics, individual **restore** controls, optional manual eliminate, pause/resume, start, reset, and remote reset of iPad scene. Admin events update the iPad within a few seconds.

## Backend & security
Reuse existing Supabase project **mmheljndcdhzzuobjaxz**. Isolate everything under private schema `larp_portal` and one distinct Edge Function `larp-portal`. No table/secret exposed to anonymous clients. Server-only Postgres RPCs run all clock, randomization, elimination and restore operations transactionally. A public read endpoint returns only necessary game state. Admin write actions require a high-entropy passcode, verified server-side against a salted hash. Service keys stay in Edge Function secrets; no key in frontend. Edge Function uses CORS allow-list and JSON only. Existing project tables/functions remain untouched.

## Clock and reconciliation
Server elapsed time derives from database timestamp, not iPad clock. Every read catches up overdue hour boundaries in one row-locked transaction; no duplicate victims. A single random double-loss hour (1–7) is assigned when a session starts. All losses choose uniformly from active relics without replacement. Pause suspends the clock, restore reactivates specific relics, and end-of-session protects the last survivor. A scene-reset version supports mobile admin overriding iPad local exploration.

## Delivery & verification
Replace the root site with the player; add independent `/admin/`; keep old sources for rollback where possible. Add local original film stills, responsive styles and separate JavaScript modules, update service worker offline cache, wire backend and publish to GitHub Pages. Validate SQL/RPC + live Edge Function, Node static/game tests, and browser/iPad viewport screenshots where possible. Explicitly identify any device-level tests that require a physical iPad.
