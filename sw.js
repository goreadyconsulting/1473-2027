/* Offline app shell for iPad use after a successful first online visit. */
const CACHE = "chronos1473-shell-v5";
const SHELL = ["./","./index.html","./styles.css","./world.css","./experience.css","./sound.js","./app.js","./icon.svg","./manifest.webmanifest","./assets/future-city.svg","./assets/world/gate-landscape.svg","./assets/world/void-landscape.svg","./assets/realms/emberfall.svg","./assets/realms/glasswind.svg","./assets/realms/verdant.svg","./assets/realms/stormglass.svg","./assets/realms/bleakwater.svg","./assets/realms/sanctum.svg","./assets/realms/iron.svg","./assets/objects/smartphone.svg","./assets/objects/history.svg","./assets/objects/seeds.svg","./assets/objects/filter.svg","./assets/objects/toilet.svg","./assets/objects/medical.svg","./assets/objects/worldmap.svg","./assets/objects/firearm.svg","./assets/objects/led.svg","./assets/objects/condoms.svg"];
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