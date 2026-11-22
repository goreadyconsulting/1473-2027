/* Offline app shell for iPad use after a successful first online visit. */
const CACHE = "larp-crossing-v9-grounded-3d";
const SHELL = ["./assets/textures/stone-masonry.webp","./assets/textures/stone-height.webp","./grounded-world.css","./world3d.js","./vendor/three.module.js","./assets/photography/emberfall-1.webp","./assets/photography/emberfall-2.webp","./assets/photography/emberfall-3.webp","./assets/photography/glasswind-1.webp","./assets/photography/glasswind-2.webp","./assets/photography/glasswind-3.webp","./assets/photography/verdant-1.webp","./assets/photography/verdant-2.webp","./assets/photography/verdant-3.webp","./assets/photography/stormglass-1.webp","./assets/photography/stormglass-2.webp","./assets/photography/stormglass-3.webp","./assets/photography/bleakwater-1.webp","./assets/photography/bleakwater-2.webp","./assets/photography/bleakwater-3.webp","./assets/photography/sanctum-1.webp","./assets/photography/sanctum-2.webp","./assets/photography/sanctum-3.webp","./assets/photography/iron-1.webp","./assets/photography/iron-2.webp","./assets/photography/iron-3.webp","./cinematic.css","./assets/cinematics/portal-gate.webp","./assets/cinematics/void-walk.webp","./assets/cinematics/runestone.webp","./assets/cinematics/grocery-1.webp","./assets/cinematics/grocery-2.webp","./assets/cinematics/grocery-3.webp","./assets/cinematics/portal-grocery.webp","./assets/reels/emberfall-1.svg","./assets/reels/emberfall-2.svg","./assets/reels/emberfall-3.svg","./assets/reels/glasswind-1.svg","./assets/reels/glasswind-2.svg","./assets/reels/glasswind-3.svg","./assets/reels/verdant-1.svg","./assets/reels/verdant-2.svg","./assets/reels/verdant-3.svg","./assets/reels/stormglass-1.svg","./assets/reels/stormglass-2.svg","./assets/reels/stormglass-3.svg","./assets/reels/bleakwater-1.svg","./assets/reels/bleakwater-2.svg","./assets/reels/bleakwater-3.svg","./assets/reels/sanctum-1.svg","./assets/reels/sanctum-2.svg","./assets/reels/sanctum-3.svg","./assets/reels/iron-1.svg","./assets/reels/iron-2.svg","./assets/reels/iron-3.svg","./","./index.html","./player.css","./player.js","./admin/","./admin/index.html","./admin/admin.css","./admin/admin.js","./world.css","./experience.css","./sound.js","./app.js","./icon.svg","./manifest.webmanifest","./assets/future-city.svg","./assets/world/gate-landscape.svg","./assets/world/void-landscape.svg","./assets/realms/emberfall.svg","./assets/realms/glasswind.svg","./assets/realms/verdant.svg","./assets/realms/stormglass.svg","./assets/realms/bleakwater.svg","./assets/realms/sanctum.svg","./assets/realms/iron.svg","./assets/objects/smartphone.svg","./assets/objects/history.svg","./assets/objects/seeds.svg","./assets/objects/filter.svg","./assets/objects/toilet.svg","./assets/objects/medical.svg","./assets/objects/worldmap.svg","./assets/objects/firearm.svg","./assets/objects/led.svg","./assets/objects/condoms.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if(request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(request).then(response => {
      if(response.ok && !request.headers.has("range")) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request,copy)).catch(() => {});
      }
      return response;
    }).catch(() => caches.match(request).then(cached => cached || (request.mode === "navigate" ? caches.match("./index.html") : Response.error())))
  );
});