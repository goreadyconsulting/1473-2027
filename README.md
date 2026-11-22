# The Crossing — 1473 ⇄ 2027

An immersive, wordless, two-screen portal for Saulė's LARP. **The iPad is a magical object held by the player. A phone is the keeper's private admin terminal.**

## Open the experiences

**Player iPad:** https://goreadyconsulting.github.io/1473-2027/

**Organiser mobile:** https://goreadyconsulting.github.io/1473-2027/admin/

The two devices connect to one server-owned session; unlike the earlier single-browser prototype, they do not need to mirror the same screen. **The iPad display contains no instructions, titles, timers, buttons with words, controls, or organiser access.**

## Player journey

1. **Continuous vortex.** The screen is entirely occupied by an original blue-violet spiral portal, inspired by the reference clip. The player taps anywhere to cross.
2. **The space between worlds.** First-person stone walkway floating outside space. Tap **anywhere** to take each step. The camera shakes/bobs and faint footsteps play through iPad audio after the player's gesture. Twelve steps bring a monumental rock dial near enough to enter.
3. **Huge rune slab.** Seven rune sockets carved into stone, each opening a destination.
4. **Destination reel.** A series of **three original illustrated images** for the selected location. The film-reel sequence includes gentle panning/zooming, cut flashes, film grain and vignette. The player can tap to skip.
5. **Location and relics.** The world appears behind any active relic images assigned to it. Tapping a relic brings it forward for closer viewing. Tapping the small rune orb returns to the stone slab. Text is deliberately absent.
6. **Relic dissolution.** When a server-side elimination happens, the object appears as a ghostly image and disintegrates. At the secret double hour, two separate dissolutions play.
7. **Final scene.** After the seventh hour, the last surviving relic fills the screen, with an illuminated magic rune and no words.

All illustrations, animations and layout files are shipped with the website. The initial entry is an animated Canvas reconstruction of the supplied colour palette and motion, **not an enlarged copy** of the 220×220 reference video.

## Keeper phone

Use the separate `/admin/` URL and the confidential, high-entropy keeper code delivered during setup.

- Start the **seven-hour server clock** (the timer is not started by tapping the iPad).
- Pause or resume the timer; hours and next loss remain synchronized across devices.
- See the exact time remaining, next elimination, count of surviving relics and which randomly selected hour is the **double elimination**.
- See nine relics, their status and the event history.
- **RESTORE** a removed object directly. It immediately returns to the player and may be eliminated at a later hour.
- Optionally eliminate a specific relic manually.
- **RETURN iPAD TO PORTAL** resets only the player's visual journey, not the game clock.
- **RESET ENTIRE SESSION** restores all nine objects and resets the seven-hour clock for a fresh performance.

The keeper code is verified only on the Supabase server against its salted hash. It is **never** placed in public HTML, JavaScript, API URL or source-control settings. The phone remembers it only for the current browser tab via `sessionStorage`.

## Game rules

- **Seven hours (25,200 seconds).**
- **Nine starting relics** — the first nine entries in Saulė's detailed item list, excluding the later-added agricultural seed collection.
- At the completion of each of the **seven** elapsed hours, the server chooses one currently surviving item randomly and removes it.
- At **one secretly randomized hour from 1 to 7**, a **second distinct surviving item** is also removed.
- Seven regular losses + one extra loss = eight, leaving **one surviving relic** after seven hours if no keeper overrides occur.
- Eliminated items are selected without replacement. The last surviving object is protected against automatic and manual loss.
- Pause freezes elapsed time and the hourly boundary.
- If iPad Safari sleeps or the network drops, the next successful server request reconciles any missed hour boundaries **once**, transactionally.
- Restoring a lost item makes it available for future elimination, but does not undo past hour numbers or restart the clock.
- The server—not a JavaScript timer on the iPad—owns the game outcome.

## Locations

Seven adjustable backend records, currently paired with original location reels and assigned relics:

| Location | Active starter relic(s) |
| --- | --- |
| Emberfall Keep | History book, modern firearm |
| The Forgotten Grocery | Giant toilet paper pack |
| Verdant Hollow | Modern world map |
| Stormglass Spire | Portable LED lights |
| Bleakwater Crossing | Water purifier |
| The Quiet Sanctum | Medical kit, contraceptive supplies |
| Echoes of Iron | Smartphone |

The grocery-store example contains **three distinct indoor/store-front images**. Other destinations also have three original illustrated scenes. These names and illustrations are present story placeholders; replace them with Saulė's actual seven venues when available.

## Backend isolation & security

Existing Supabase project `mmheljndcdhzzuobjaxz` hosts the backend in a **dedicated private database schema** `larp_portal` and one Edge Function named `larp-portal`. It does not use or overwrite any existing personal-project tables.

`supabase/larp_portal/migration.sql` creates the session, place, relic, event and hashed admin credential tables plus two privileged SQL functions. All five tables have RLS enabled and **no anonymous grants/policies**. The SQL functions are executable only by the internal service role, reached through the Edge Function; browsers never receive service-role keys.

The public GET operation provides only game data. Admin POST commands are checked against the strong keeper code on the server. The Edge Function accepts browser origins from this GitHub Pages domain and local development origins only.

### Reset, credentials and migration

The legacy local-only game data does not transfer into the new backend and is not silently overwritten at the database level. This is a distinct multiplayer-capable session. The older `app.js` and CSS remain in the repository for rollback reference; the new `index.html` loads `player.js` and `player.css`.

The organiser code is created once with the backend. To rotate it, update `larp_portal.admin_auth` with a new salted hash using the Supabase console. Do **not** store the cleartext code in GitHub.

## iPad/phone deployment checklist

- [ ] Open the player URL on the target iPad in Safari and optionally Add to Home Screen.
- [ ] Open the admin URL on a separate phone; enter the keeper code.
- [ ] Verify iPad portal animation is fully edge-to-edge with **no visible text or timer**.
- [ ] Tap portal and walk by tapping any part of the screen; check camera shake and audible, quiet footfalls.
- [ ] Touch all seven runes, watch all 3-image location reels, and inspect their surviving objects.
- [ ] Start the clock on the phone; check the seven-hour timer and next-loss countdown.
- [ ] Pause, resume, restore and manually eliminate a relic; confirm the iPad reflects changes within a few seconds.
- [ ] Use a controlled test session or short interval test in a **development copy** to rehearse double-hour losses, then restore/reset for the show.
- [ ] Test if the iPad sleeps and reconnects: server catches up automatically.
- [ ] Test with Airplane Mode after first online installation. Visual assets are cached, and the player retains the last online snapshot; **game changes require connectivity**.
- [ ] Reset the session before players arrive, verify the phone remains online, and use a powered iPad for the entire seven-hour show.

## Implementation

- `index.html`, `player.css`, `player.js`: wordless iPad player
- `admin/index.html`, `admin/admin.css`, `admin/admin.js`: phone keeper interface
- `assets/reels/`: 21 original story stills (three per destination)
- `assets/objects/`: illustrated relics
- `supabase/larp_portal/migration.sql`: isolated data, timing and restore rules
- `supabase/functions/larp-portal/index.ts`: authenticated API gateway
- `sw.js`: offline shell
- `IMPLEMENTATION_PLAN.md`: initial design and implementation contract
- `tests/`: static, JavaScript and live read-only backend smoke checks

Run local preview with `python -m http.server 8080`; use `npm test` for source checks. CI also checks the deployed Supabase endpoint without modifying session data.

### Event-day limitation

This is a stylized, cinematic **2.5D browser experience**, not a navigable 3D world. The realm images are original illustrations rather than photographic footage. The final show still requires hands-on iPad touch, audio and Wi-Fi rehearsal; automated tests do not guarantee physical-device performance.
