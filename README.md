# TEMPORAL CONNECTION — 1473 / 2027

A cinematic, touchscreen-friendly portal for Saule's medieval fantasy LARP. Players choose **one object from 2027** to carry back to 1473 by sacrificing the others while the temporal connection deteriorates.

This is a **static web app**: no accounts, build system, database, analytics, or external JavaScript libraries are required.

## Status

- **Prototype / rehearsal build.** The 12 objects and their descriptions are editable sample content, not an approved final LARP inventory.
- The starter archive includes 12 original futuristic SVG illustrations. Organisers can replace these with their chosen event photographs or artwork.
- The same iPad should run the session and be **mirrored to the TV** through AirPlay or a wired adapter. Opening the page on two separate devices does **not** synchronise game state.

## Features

- Full-screen responsive sci-fi archive with all surviving objects in a compact grid.
- Tap objects for large image, description, advantage and limitation.
- Two-stage **DESTROY** confirmation; destroyed objects disappear and survivors reflow.
- Final object is protected from destruction and must be separately **retained**.
- Main portal countdown; portal closes if it reaches zero before a final selection.
- Configurable timed instability events (e.g. at 15, 10 and 5 minutes remaining).
- Emergency countdown forces a sacrifice; failure randomly erases a configurable number of objects, but **never the final remaining object**.
- Non-interactive, random short glitch messages, images or muted videos; they never modify object state.
- Organiser console for starting, pausing, resetting, overriding events, inspecting history, editing objects/glitches/settings, and exporting/importing content JSON.
- Session and organiser content persist in the **same browser** via localStorage. An offline-capable app shell is cached with a service worker after a successful HTTPS visit.

## Launch / hosting

After the feature branch is reviewed and merged into **main**, open repository **Settings → Pages → Build and deployment** and select **GitHub Actions** as the Pages source. The committed deployment workflow runs automatically for every update to **main**. The site will normally become available at:

https://goreadyconsulting.github.io/1473-2027/

GitHub Pages must be enabled by a repository administrator using the **GitHub Actions** source. Follow the **Deploy portal to GitHub Pages** workflow in the Actions tab. Do not treat the URL as live until deployment succeeds.

To preview locally, serve the repository directory with a static web server, for example:

    python -m http.server 8080

Then visit http://localhost:8080/. The service worker and offline caching require HTTPS; localhost is also a secure context in supporting browsers.

## Organiser use

1. Open the deployed site on the **event iPad** in landscape mode.
2. Tap the small **⚙** at the top right. Default organiser code: **1473**. Change this in **Settings** before the event. This code only prevents accidental taps; it is not security against determined access.
3. Open **Objects** and replace the sample names, descriptions, advantages, limitations and image URLs. Save each object.
4. Open **Glitch content** to add or edit a random text, image or video interruption. Preview it to check dimensions and compatibility.
5. Open **Settings** to select the overall time, emergency countdown length, trigger points in **minutes remaining**, failure loss count, and random glitch frequency.
6. Use **EXPORT CONFIG.JSON** as a backup. Organiser edits are saved locally on this browser, **not to the GitHub repository**. For a different iPad, load the exported JSON through **IMPORT CONFIG.JSON**.
7. Under **Session**, choose **START NEW SESSION** when the performance begins.
8. Mirror the iPad display to the TV. Keep it in landscape and prevent sleep/auto-lock during play. Rehearse all interactions on the actual hardware.

The organiser can pause/resume the countdown, trigger or stabilise an emergency, preview glitches, skip 60 seconds of the main timer, and reset the whole session. Pausing freezes both main and active emergency timers. Without pausing, closing/reopening the browser does **not** stop the countdown.

To start another performance after the final reveal, use **ORGANISER CONSOLE** on the ending screen, then **RESET SESSION** or **START NEW SESSION**.

## Adding photographs and videos without modifying code

An organiser can enter or change media URLs in the on-screen editor, without editing JavaScript or HTML. The easiest **portable/offline-friendly** method is:

1. Upload the media file into the repository's \`assets/\` directory using GitHub's **Add file → Upload files** interface.
2. Enter its path in the organiser console, such as \`./assets/smartphone.jpg\` or \`./assets/future-glitch.mp4\`.
3. Save it, preview it, and export the resulting configuration JSON.
4. Load the final config JSON on the performance iPad.

For remote media, HTTPS URLs are supported, but internet access will be required. Video is best supplied as a short, muted, iPad-compatible MP4. Huge files may take too long to load.

**Important offline limitation:** the app shell, all 12 included future-object SVGs and the demonstration glitch SVG are cached after the first online visit, but newly added media, particularly videos, are **not guaranteed to be available offline** just because they appear in the editor. Test airplane-mode playback with the final assets on the actual iPad well before the event. For a mission-critical fully offline show, host and precache every final media asset, and run a complete offline test.

## Configuration example

The export file has an outer \`config\` object with these important fields:

| Field | Meaning |
| --- | --- |
| \`durationMinutes\` | Overall time before the portal closes |
| \`instabilityAtMinutesRemaining\` | Trigger points, e.g. \`[15,10,5]\` |
| \`emergencySeconds\` | Time players have to destroy one object |
| \`failureDestroyCount\` | Random objects lost if an emergency expires (final item protected) |
| \`glitchMinSeconds\` / \`glitchMaxSeconds\` | Random gap between purely visual interruptions |
| \`objects\` | Object text, image path, icon, benefit and limitation |
| \`glitches\` | Glitch type (\`message\`, \`image\`, \`video\`), caption, media path and duration |

The editable content format can also be shared between organisers as a plain JSON file.

## Game rules and safeguards

- Players may inspect objects before activation but cannot destroy them until the organiser starts the timer.
- Destroy requires a separate confirmation. During emergencies, **the same two-step destruction counts as the required sacrifice**.
- If the emergency clock runs out, the organiser-configured number of random objects is lost, up to **one less than the number remaining**. This protects the final candidate.
- When only one object remains, destruction is disabled. The player must explicitly confirm **RETAIN AS FINAL OBJECT**.
- If the overall portal timer ends first, the connection closes without a successful final selection.
- Glitch overlays use **pointer-events: none** and have no object-deletion logic. They may overlap normal interaction visually but cannot click or destroy anything.
- If an iPad was asleep through multiple scheduled trigger points, the app consolidates overdue events rather than firing several emergencies in immediate succession.

## Event-day rehearsal checklist

- [ ] Verify all 12 bundled object illustrations, any replacement images and every glitch video on the actual iPad.
- [ ] Import and back up the final configuration JSON.
- [ ] Confirm the iPad/TV display route and sound needs; no sound is required by this build.
- [ ] Disable auto-lock, notifications and unexpected app switching as appropriate for the event setup.
- [ ] Start a test session, inspect an object, cancel destruction, then confirm a different destruction.
- [ ] Trigger an emergency and successfully sacrifice an object before its timer reaches zero.
- [ ] Trigger another emergency with a short deadline and verify the automatic consequence.
- [ ] Reduce the archive to one object; confirm that **DESTROY** is absent and **RETAIN** works.
- [ ] Test pause/resume, reloading the page, and recovering from a mistaken organiser action.
- [ ] Test connection loss, offline availability and custom-media playback on the event iPad.
- [ ] Reset the session before players arrive.

## Scope / next improvements

This is designed for **one active iPad with a mirrored TV**. If the organiser needs the iPad as a separate controller while another laptop/TV browser shows the game, the next version should add a shared session service (WebSocket/Supabase/Firebase or a local-network equivalent), role-based player/display views, and explicit reconnect logic.

Other desirable improvements after rehearsal: a true in-app media upload library (rather than asset paths), optional sound effects, a guided rehearsal mode, fully offline bundled videos, and organiser-configurable non-destruction consequences.

## Project structure

- \`index.html\` — app screens, player details, confirmation, organiser console.
- \`styles.css\` — atmospheric visuals, responsive layout, touch sizes.
- \`app.js\` — gameplay, persistence, object editor and glitch engine.
- \`assets/\` — packaged image/video files.
- \`sw.js\` and \`manifest.webmanifest\` — installable/offline-friendly app shell.

No player data or identifying information is collected by this prototype.
