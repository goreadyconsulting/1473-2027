const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const CONFIG_KEY = "chronos1473_config_v1";
const SESSION_KEY = "chronos1473_session_v1";

function harness(storage = new Map()) {
  const elements = new Map();
  let now = 1_000_000;
  let intervalTick;
  const browserDate = class extends Date { static now() { return now; } };
  class Element {
    constructor(id) {
      this.id = id;
      this.listeners = new Map();
      this.hidden = false;
      this.disabled = false;
      this.open = false;
      this.value = "";
      this.dataset = {};
      this.style = { setProperty() {} };
      this.firstChild = { textContent: "" };
      this.classNames = new Set();
      this.classList = {
        add: (name) => this.classNames.add(name),
        remove: (name) => this.classNames.delete(name),
        toggle: (name, force) => {
          const on = force === undefined ? !this.classNames.has(name) : force;
          if (on) this.classNames.add(name);
          else this.classNames.delete(name);
          return on;
        },
        contains: (name) => this.classNames.has(name)
      };
    }
    addEventListener(name, fn) {
      const callbacks = this.listeners.get(name) || [];
      callbacks.push(fn);
      this.listeners.set(name, callbacks);
    }
    emit(name, props = {}) {
      for (const fn of this.listeners.get(name) || []) fn({ target: this, ...props });
    }
    showModal() { this.open = true; }
    close() { this.open = false; this.emit("close"); }
    querySelector() { return null; }
    querySelectorAll() { return []; }
    insertAdjacentHTML(_position, markup) { this.insertedMarkup = markup; }
    setAttribute(name, value) { this[name] = value; }
    remove() {}
  }
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, new Element(id));
    return elements.get(id);
  };
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); }
  };
  const document = {
    getElementById: get,
    querySelectorAll() { return []; },
    addEventListener() {},
    body: { appendChild() {} }
  };
  const window = { addEventListener() {}, confirm() { return true; } };
  const context = {
    document, window, localStorage,
    navigator: { serviceWorker: undefined },
    location: { protocol: "http:" },
    Date: browserDate, Math, Set, JSON, console, URL,
    setInterval(fn) { intervalTick = fn; return 1; },
    setTimeout() { return 1; },
    clearTimeout() {}
  };
  vm.runInNewContext(source, context, { filename: "app.js", timeout: 1000 });
  return {
    get, storage,
    state() { return JSON.parse(storage.get(SESSION_KEY)); },
    config() { return JSON.parse(storage.get(CONFIG_KEY)); },
    tick() { intervalTick(); },
    moveClock(ms) { now += ms; },
    click(id) { get(id).emit("click"); },
    enterCode(code = "1473") {
      this.click("adminOpen");
      get("adminPin").value = code;
      this.click("adminUnlock");
    },
    start() { this.enterCode(); this.click("sessionStart"); },
    openObject(id) {
      get("objectGrid").emit("click", { target: { closest() { return { dataset: { object: id } }; } } });
    },
    destroy(id, accept = true) {
      this.openObject(id);
      this.click("destroyRequest");
      this.click(accept ? "confirmAccept" : "confirmCancel");
    }
  };
}

test("archive displays all objects and prevents destruction before activation", () => {
  const app = harness();
  assert.equal(app.get("remainingCount").textContent, "10");
  assert.equal(app.get("worldStage").hidden, false);
  assert.equal(app.get("archiveSection").hidden, true);
  assert.equal(app.get("statusText").textContent, "STANDBY");
  assert.equal(app.get("mainTimer").textContent, "20:00");
  app.openObject("smartphone");
  assert.equal(app.get("destroyRequest").disabled, true);
});

test("destruction requires a second confirmation", () => {
  const app = harness();
  app.start();
  assert.equal(app.state().phase, "running");
  app.destroy("smartphone", false);
  assert.equal(app.state().lost.length, 0);
  app.destroy("smartphone", true);
  assert.equal(app.state().lost.length, 1);
  assert.equal(app.state().lost[0].id, "smartphone");
  assert.equal(app.get("remainingCount").textContent, "9");
});

test("successful emergency sacrifice stabilises the portal", () => {
  const app = harness();
  app.start();
  app.click("sessionInstability");
  assert.ok(app.state().emergency);
  assert.equal(app.get("statusText").textContent, "UNSTABLE");
  app.destroy("toilet");
  assert.equal(app.state().emergency, null);
  assert.equal(app.state().lost.length, 1);
});

test("failed emergency removes configured random objects", () => {
  const app = harness();
  app.start();
  app.click("sessionInstability");
  app.moveClock(46_000);
  app.tick();
  assert.equal(app.state().emergency, null);
  assert.equal(app.state().lost.length, 2);
  const lostIds = app.state().lost.map(x => x.id);
  assert.equal(new Set(lostIds).size, 2);
  assert.ok(app.state().log.some(x => x.text.includes("FAILURE")));
});

test("scheduled instability triggers at the threshold", () => {
  const app = harness();
  app.start();
  app.moveClock(5 * 60_000 + 500);
  app.tick();
  assert.ok(app.state().emergency);
  assert.ok(app.state().fired.includes(15));
});

test("pause freezes main clock and emergency; resume restores both", () => {
  const app = harness();
  app.start();
  app.click("sessionInstability");
  app.click("sessionPause");
  assert.equal(app.state().paused, true);
  app.moveClock(10 * 60_000);
  app.tick();
  assert.equal(app.get("mainTimer").textContent, "20:00");
  assert.equal(app.get("emergencyClock").textContent, "00:45");
  app.click("sessionPause");
  app.moveClock(2000);
  app.tick();
  assert.equal(app.get("mainTimer").textContent, "19:58");
  assert.equal(app.get("emergencyClock").textContent, "00:43");
});

test("last candidate is protected; final retention concludes the game", () => {
  const app = harness();
  app.start();
  const all = app.config().objects.map(o => o.id);
  for (const id of all.slice(0, -1)) app.destroy(id);
  assert.equal(app.state().lost.length, all.length - 1);
  app.openObject(all[all.length - 1]);
  assert.equal(app.get("destroyRequest").hidden, true);
  assert.equal(app.get("finalRequest").hidden, false);
  app.click("finalRequest");
  app.click("confirmAccept");
  assert.equal(app.state().phase, "completed");
  assert.equal(app.state().finalId, all[all.length - 1]);
  assert.equal(app.get("endingOverlay").hidden, false);
});

test("portal closes at zero if no final choice is retained", () => {
  const app = harness();
  app.start();
  app.moveClock(20 * 60_000 + 100);
  app.tick();
  assert.equal(app.state().phase, "closed");
  assert.equal(app.state().finalId, null);
  assert.equal(app.get("endingOverlay").hidden, false);
});

test("game state survives reopening in the same browser", () => {
  const storage = new Map();
  const first = harness(storage);
  first.start();
  first.destroy("smartphone");
  const restored = harness(storage);
  assert.equal(restored.state().phase, "running");
  assert.equal(restored.get("remainingCount").textContent, "9");
  assert.equal(restored.get("statusText").textContent, "STABLE");
});

test("edited object content persists for organiser export", () => {
  const app = harness();
  app.enterCode();
  app.get("objName").value = "Future compass";
  app.get("objDescription").value = "A device that finds its way.";
  app.click("objectSave");
  assert.equal(app.config().objects[0].name, "Future compass");
  assert.equal(app.config().objects[0].description, "A device that finds its way.");
});


test("seven distinct destination runes and exactly ten objects have a valid assignment", () => {
  const app = harness();
  app.enterCode();
  const expected = app.config();
  assert.equal(expected.locations.length, 7);
  assert.equal(expected.objects.length, 10);
  const names = new Set(expected.locations.map(x => x.name));
  assert.equal(names.size, 7);
  const ids = new Set(expected.locations.map(x => x.id));
  assert.ok(expected.objects.every(x => ids.has(x.locationId)));
  assert.ok(expected.objects.every(x => x.image.startsWith("./assets/objects/")));
});

test("touchscreen journey goes through gateway, walks to slab and opens a selected realm", () => {
  const app = harness();
  assert.equal(app.state().scene, "gate");
  app.click("worldEnter");
  assert.equal(app.state().scene, "path");
  for(let i = 0; i < 9; i++) app.click("worldWalk");
  assert.equal(app.state().scene, "dial");
  app.get("worldLocationDial").emit("click", {
    target: { closest() { return { dataset: { location: "verdant" } }; } }
  });
  assert.equal(app.state().selectedLocation, "verdant");
  app.click("worldTravel");
  assert.equal(app.state().scene, "archive");
  assert.equal(app.state().viewAll, false);
  assert.ok(app.state().visited.includes("verdant"));
  assert.equal(app.get("realmName").textContent, "Verdant Hollow");
  assert.equal((app.get("objectGrid").innerHTML.match(/class="object-card"/g)||[]).length, 1);
  app.click("worldAll");
  assert.equal(app.state().viewAll, true);
  assert.equal((app.get("objectGrid").innerHTML.match(/class="object-card"/g)||[]).length, 10);
  app.click("worldReturn");
  assert.equal(app.state().scene, "dial");
});

test("emergency can interrupt travel then restores the correct previous scene", () => {
  const app = harness();
  app.start();
  app.click("worldEnter");
  app.click("worldWalk");
  assert.equal(app.state().scene, "path");
  app.click("sessionInstability");
  assert.equal(app.state().scene, "archive");
  assert.equal(app.state().viewAll, true);
  assert.equal(app.get("worldStage").hidden, true);
  assert.ok(app.state().emergency);
  app.destroy("led");
  assert.equal(app.state().scene, "path");
  assert.equal(app.state().emergency, null);
  assert.equal(app.get("worldStage").hidden, false);
  assert.equal(app.state().lost.length, 1);
});

test("organiser can rename destinations and reassign an object without editing source", () => {
  const app = harness();
  app.enterCode();
  app.get("locName").value = "The Frost Archive";
  app.get("locRune").value = "ᛝ";
  app.get("locDescription").value = "A silent tower of frost.";
  app.get("locColour").value = "#aabbcc";
  app.click("locationSave");
  assert.equal(app.config().locations[0].name, "The Frost Archive");
  assert.equal(app.config().locations[0].rune, "ᛝ");
  app.get("objLocation").value = "sanctum";
  app.click("objectSave");
  assert.equal(app.config().objects[0].locationId, "sanctum");
});

test("organiser cannot add an eleventh object while ten slots are filled", () => {
  const app = harness();
  app.enterCode();
  app.click("objectAdd");
  assert.equal(app.config().objects.length, 10);
});

test("reopening in the same browser keeps exploration progress and dial choice", () => {
  const storage = new Map();
  const first = harness(storage);
  first.click("worldEnter");
  first.click("worldWalk");
  const restored = harness(storage);
  assert.equal(restored.state().scene, "path");
  assert.equal(restored.state().walkProgress, 12);
});


test("player enters the gate and starts the clock without organiser access", () => {
  const app = harness();
  assert.equal(app.state().phase,"standby");
  app.click("worldEnter");
  assert.equal(app.state().phase,"running");
  assert.equal(app.state().scene,"path");
  app.moveClock(3000);
  app.tick();
  assert.equal(app.get("mainTimer").textContent,"19:57");
});

test("all ten relics have complete stories and locally packaged illustrations", () => {
  const app=harness();
  app.enterCode();
  const items=app.config().objects;
  assert.equal(items.length,10);
  assert.equal(new Set(items.map(i=>i.id)).size,10);
  for(const item of items) {
    assert.ok(item.benefit.length>20,"Missing power for "+item.id);
    assert.ok(item.limitation.length>20,"Missing catch for "+item.id);
    assert.ok(item.consequence.length>20,"Missing consequence for "+item.id);
    assert.ok(fs.existsSync(path.join(__dirname,"..",item.image.replace(/^\.\//,""))),"Missing illustration for "+item.id);
  }
  app.openObject("history");
  assert.match(app.get("detailConsequence").textContent,/catastrophe/i);
});

test("previous sessions upgrade to the ten-relic edition without carrying old deletions", () => {
  const storage=new Map();
  storage.set(CONFIG_KEY,JSON.stringify({version:2,objects:[{id:"smartphone",name:"Old sample"}]}));
  storage.set(SESSION_KEY,JSON.stringify({phase:"running",scene:"archive",lost:[{id:"camera"}],endsAt:99999999}));
  const app=harness(storage);
  assert.equal(app.config().version,3);
  assert.equal(app.config().objects.length,10);
  assert.equal(app.config().objects[0].name,"Smartphone");
  assert.equal(app.state().phase,"standby");
  assert.equal(app.state().scene,"gate");
});

test("offline shell includes new interface, audio engine and ten illustrated objects", () => {
  const root=path.join(__dirname,"..");
  const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
  for(const file of ["./experience.css","./sound.js",
    ...["smartphone","toilet","history","medical","worldmap","firearm","led","condoms","filter","seeds"].map(id=>"./assets/objects/"+id+".svg")])
    assert.ok(sw.includes(file),"Not in offline cache: "+file);
});
