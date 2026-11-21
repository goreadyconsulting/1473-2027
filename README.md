# The Veil Between Ages — 1473 ⇄ 2027

An immersive, player-controlled, **iPad-first** temporal portal for Saulė's live-action role-playing experience. Players pass through a carved gateway, traverse the void, discover a seven-rune stone slab, choose destinations, and decide which single object from 2027 can survive the journey back to 1473.

**Live site:** https://goreadyconsulting.github.io/1473-2027/

The experience uses original Norse-inspired scenery and generated sound rather than third-party game assets. It is a responsive **2.5D cinematic web experience**, not an open-world 3D game.

## The player journey

1. **Awaken the gate** — tap **STEP THROUGH THE PORTAL**. This *automatically starts* the 20-minute countdown; no organiser PIN is required for play.
2. **Cross the void** — tap/hold **HOLD TO WALK FORWARD**, swipe upward, or press ↑ / W to reach the runestone. Nine taps are enough.
3. **Choose a destination** — touch one of seven rune sockets on the carved stone dial, or swipe horizontally between destinations. Each rune reveals its location, lore, and surviving relic count.
4. **Explore the selected realm** — the destination reveals its distinct illustrated landscape and available objects. Tap a relic for its illustration, background, **Power**, **Catch** and **Echo Through Time (Consequence)**.
5. **Choose what is lost** — tap **DESTROY OBJECT**, then explicitly confirm. The object is removed across *all* destinations and cannot be selected again.
6. **Return to the runestone**, choose other destinations, or tap **VIEW ALL REMAINING RELICS** to compare the surviving objects together.
7. **Seal the final fate** — the final relic cannot be destroyed. Tap **RETAIN AS FINAL OBJECT** and confirm to end the story.

A live timer, intermittent signal glitches and scheduled instability events add urgency. During critical instability, the entire surviving archive is revealed, so players can sacrifice one relic in time. If they do not, the portal randomly destroys a configured number of relics but never the final survivor. Normal navigation resumes after the instability is resolved.

The countdown continues across journey scenes, page refreshes, and app backgrounding unless the organiser explicitly pauses the session.

## Ten relics from Saulė's item list

| Relic | Destination | Dossier includes |
|---|---|---|
| Smartphone — 37% battery | Echoes of Iron | Power, finite battery, potential historical consequences |
| Giant pack of toilet paper | Glasswind Bazaar | Comfort, non-replenishable supply, humorous consequences |
| History book (1300–2027) | Emberfall Keep | Foreknowledge, branching historical uncertainty |
| Modern doctor's kit | The Quiet Sanctum | Medical potential, training and supply constraints |
| Modern world map | Glasswind Bazaar | Geography, different medieval borders, altered exploration |
| Modern firearm | Emberfall Keep | Advanced weapon, limited ammunition, potential power shifts |
| Portable LED lights | Stormglass Spire | Fireless lighting, battery limits, sparkles |
| Condoms / contraceptive supplies | The Quiet Sanctum | Family planning, single-use limits, social implications |
| Portable water purifier | Bleakwater Crossing | Water safety, eventual filter failure, community impact |
| Agricultural seed collection | Verdant Hollow | Food resilience, local growing constraints, long-term impact |

All ten objects include **illustrated local assets and three complete story fields**. The seven destination names are currently thematic placeholders that the organiser can change before the LARP.

## Using the iPad during the event

- Open the live site on the **same iPad throughout the game**. Landscape is recommended; portrait is supported.
- In Safari, **Share → Add to Home Screen** provides the most immersive display. Test the installed web app on the actual device.
- Mirror the iPad display to the TV through a tested AirPlay or wired connection. The iPad is the controller and the mirrored TV is the display. **Two separate browsers do not synchronise.**
- Tap **♪** to enable or mute the original generated ambience and interactive tones. Sound is off by default until a real user gesture because iPadOS blocks autoplay.
- The app requests a screen wake lock while playing if the browser supports it. Also disable Auto-Lock on the event iPad when permitted; wake-lock support is not universal on iPadOS.
- Avoid Private Browsing and clearing Safari website data mid-game: the session is saved on that device in browser local storage.

### Organiser console

Tap **⚙** and enter the default PIN **1473** (change it under Settings). The PIN prevents accidental settings changes; it is **not strong authentication**.

**Session:** start a fresh performance, pause/resume, manually trigger or resolve instability, preview a random glitch, advance the timer, reset the game, and read the event log.

**Objects:** edit all ten relics (name, illustration path, description, Power, Catch, Consequence, and destination assignment). The maximum is ten; deleting an item frees a slot for a new one.

**Locations:** edit the names, lore, rune symbols and accent colours of exactly seven destinations.

**Glitches:** add/change short warning messages, images or muted MP4 videos without editing application code.

**Settings:** change total session time, emergency window, failure count, instability trigger points, random glitch timing and organiser PIN.

**Export/Import JSON:** backup/transfer organiser content. Changes in the console are stored locally and are *not* automatically written to GitHub.

### Offline play

A service worker precaches the site, styles, original ambience engine, all ten illustrated objects, the seven destination panoramas and journey scenery after the first **successful HTTPS visit**.

For a reliably offline LARP, load the site online once on the actual event iPad, wait for caching to finish, then test it in Airplane Mode. Custom HTTPS media and new video files are **not guaranteed offline** unless included in the deployed offline package. The supplied illustrations require no remote image host.

## Game reliability and limitations

- One active browser/device is the source of truth. The app is not multiplayer networking software.
- A destructive choice requires a second explicit tap, while the final object has its own separate retention confirmation.
- The organiser can pause and override an instability. A failed instability erases random relics but cannot erase the final one.
- Glitch overlays are visual and never directly remove game items.
- Session, inventory state, countdown end time, rune dial selection, walk progress and visited locations survive a reload on the same browser.
- **Content migration:** upgrading an older nine-item prototype replaces its fictional starter object library with these ten supplied relics and safely resets the old game state. It preserves customised destination information where compatible. Export any important previous configuration before installing the upgrade.
- The in-browser default PIN is a convenience rather than account-level security; use the same trusted event iPad.
- Original artwork is an illustrated interpretation, not licensed *God of War* material.

## Event-day checks

- [ ] Open the installed website on the target iPad; verify portrait, landscape, touch controls and TV mirroring.
- [ ] Test the portal entry, hold-to-walk and vertical swipe; verify all seven rune sockets and horizontal dial swipe.
- [ ] Visit every location; verify all ten relics and their Power, Catch and Consequence descriptions.
- [ ] Cancel a destruction, confirm a different destruction, and ensure the item disappears everywhere.
- [ ] Trigger an emergency in the middle of the void; confirm that the game offers a sacrifice and restores the scene.
- [ ] Let a test emergency expire to confirm the automatic consequence.
- [ ] Reduce to a single relic, verify destruction is impossible, and confirm final retention.
- [ ] Reload halfway through play; ensure countdown and journey progress persist.
- [ ] Test audio on/off, local asset loads, screen sleep behaviour, and Airplane Mode.
- [ ] Export the final configuration, change the organiser PIN, and reset to the starting screen for players.

## Technical

Static HTML, CSS and JavaScript. No external runtime libraries, build process, tracking, account or backend required.

- \`index.html\` — player scene, rune dial, object dossier, organiser console
- \`world.css\`, \`styles.css\`, \`experience.css\` — adaptive world and iPad styling
- \`app.js\` — gameplay rules, timer, events, state persistence, editing
- \`sound.js\` — locally generated, user-initiated ambient/signal sounds
- \`assets/world/\`, \`assets/realms/\`, \`assets/objects/\` — original offline illustrations
- \`sw.js\` and \`manifest.webmanifest\` — offline app shell and installable web app
- \`tests/portal.test.cjs\` — automated gameplay checks
- \`.github/workflows/\` — CI verification and GitHub Pages deployment

Run checks with \`npm test\` (Node 20+). To test locally, run \`python -m http.server 8080\` in the project folder and open \`http://localhost:8080\`.

GitHub Pages deployment is handled by the repository's existing workflow when changes reach \`main\`.
