/**
 * The Crossing — one continuous 3D location from the first step to the rune altar.
 * Original geometry, textures, effects and level composition; Three.js r160 MIT.
 * No AI-generated scenery. Gameplay state remains in player.js / Supabase.
 */
import * as THREE from "./vendor/three.module.js";

(() => {
  "use strict";
  const el = id => document.getElementById(id);
  const clock = new THREE.Clock();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050a12);
  scene.fog = new THREE.FogExp2(0x09131e, 0.0085);
  const camera = new THREE.PerspectiveCamera(63, 1, 0.07, 650);
  camera.position.set(0, 1.85, 18);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x050a12, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.36;
  renderer.shadowMap.enabled = false; // strong mobile performance
  const canvas = renderer.domElement;
  canvas.id = "continuousWorld3D";
  canvas.className = "continuous-world-3d";
  canvas.setAttribute("aria-label", "Ancient bridge and seven rune stones");
  canvas.style.touchAction = "manipulation";

  // Deterministic surface noise — no repeating AI-art textures.
  let seed = 0x73adf091;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  const range = (min, max) => min + (max - min) * rand();
  function stoneTexture(base = 90, dimension = 256) {
    const c = document.createElement("canvas");
    c.width = c.height = dimension;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const im = ctx.createImageData(dimension, dimension);
    const grid = Array.from({ length: 17 * 17 }, () => range(-30, 30));
    function gridVal(x, y) {
      const xi = Math.max(0, Math.min(15, Math.floor(x)));
      const yi = Math.max(0, Math.min(15, Math.floor(y)));
      const dx = x - xi;
      const dy = y - yi;
      const a = grid[yi * 17 + xi], b = grid[yi * 17 + xi + 1];
      const cc = grid[(yi + 1) * 17 + xi], d = grid[(yi + 1) * 17 + xi + 1];
      return a * (1 - dx) * (1 - dy) + b * dx * (1 - dy) +
        cc * (1 - dx) * dy + d * dx * dy;
    }
    for (let y = 0; y < dimension; y++) {
      for (let x = 0; x < dimension; x++) {
        const n = gridVal(x / dimension * 15, y / dimension * 15);
        const grain = range(-19, 19);
        const vein = Math.sin(x * .075 + y * .039) * 5.5;
        const v = Math.max(19, Math.min(180, base + n + grain + vein));
        const i = (y * dimension + x) * 4;
        im.data[i] = Math.round(v * .86);
        im.data[i + 1] = Math.round(v * .94);
        im.data[i + 2] = Math.round(v);
        im.data[i + 3] = 255;
      }
    }
    ctx.putImageData(im, 0, 0);
    for (let line = 0; line < 11; line++) {
      ctx.beginPath();
      let x = range(0, dimension);
      let y = range(0, dimension);
      ctx.moveTo(x, y);
      for (let j = 0; j < 9; j++) {
        x += range(-14, 16); y += range(3, 18);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(19,25,32,.11)";
      ctx.lineWidth = range(.5, 2);
      ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return t;
  }
  const cobbleMap = stoneTexture(111);
  const wallMap = stoneTexture(87);
  const slabMap = stoneTexture(92);
  const groundMat = new THREE.MeshStandardMaterial({
    map: cobbleMap, color: 0xa4afb2, roughness: .94, metalness: .025
  });
  const sideMat = new THREE.MeshStandardMaterial({
    map: wallMap, color: 0x76818a, roughness: .98, metalness: .03, flatShading: true
  });
  const darkStone = new THREE.MeshStandardMaterial({
    map: slabMap, color: 0x8a9999, roughness: .87, metalness: .07,
    side: THREE.DoubleSide, flatShading: true
  });
  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x344957, roughness: .97, metalness: .02
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xc9b18b, metalness: .58, roughness: .49,
    emissive: 0x2a1906, emissiveIntensity: .22
  });
  const runeMat = new THREE.MeshBasicMaterial({
    color: 0xb0e5db, transparent: true, opacity: .88,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });

  const key = new THREE.DirectionalLight(0x8ebbd3, 2.65);
  key.position.set(-18, 26, 11);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd5a68b, .72);
  fill.position.set(14, 4, -60);
  scene.add(fill);
  scene.add(new THREE.HemisphereLight(0x5f839c, 0x11161b, 1.6));
  const altarLight = new THREE.PointLight(0x8bded2, 25, 19, 2);
  altarLight.position.set(0, 6.8, -53.2);
  scene.add(altarLight);

  // The same bridge stays under the camera for all twelve steps.
  const tileGeo = new THREE.BoxGeometry(5.05, .62, 1.58);
  const edgeGeo = new THREE.BoxGeometry(.65, 1.05, 2.1);
  for (let i = 0; i < 50; i++) {
    const z = 19 - i * 1.45;
    const tile = new THREE.Mesh(tileGeo, groundMat);
    tile.position.set(range(-.12, .12), -.44 + range(-.04, .04), z);
    tile.rotation.set(range(-.02, .02), range(-.016, .016), range(-.015, .015));
    tile.scale.x = range(.965, 1.025);
    scene.add(tile);
    if (i % 2 === 0) {
      for (const side of [-1, 1]) {
        if (i % 9 === 4 || (i % 7 === 3 && side === -1)) continue; // broken parapet
        const edge = new THREE.Mesh(edgeGeo, sideMat);
        edge.position.set(side * 2.75, .35 + range(-.2, .16), z);
        edge.rotation.y = range(-.03, .03);
        edge.scale.y = range(.72, 1.35);
        scene.add(edge);
      }
    }
    if (i % 5 === 1) {
      const joint = new THREE.Mesh(new THREE.BoxGeometry(4.8, .025, .09), edgeMat);
      joint.position.set(0, -.09, z - .71);
      scene.add(joint);
    }
  }
  // A few independent heavy monoliths anchor the world and sell its scale.
  const rockGeo = new THREE.DodecahedronGeometry(1, 1);
  const distantRocks = [];
  for (let i = 0; i < 38; i++) {
    const radius = range(1.1, 8.0);
    const r = new THREE.Mesh(rockGeo, sideMat);
    const side = i % 2 ? -1 : 1;
    r.position.set(side * range(12, 54), range(-18, 26), range(-115, 14));
    r.scale.set(radius * range(.6, 1.5), radius * range(.4, 1.8), radius * range(.5, 1.4));
    r.rotation.set(range(-3, 3), range(-3, 3), range(-3, 3));
    r.userData.speed = range(-.00045, .00045);
    distantRocks.push(r);
    scene.add(r);
  }

  // Real depth in a cosmic sky, not another disconnected 2D illustration.
  const skyPositions = new Float32Array(2200 * 3);
  const skyColors = new Float32Array(2200 * 3);
  for (let i = 0; i < 2200; i++) {
    let x = range(-340, 340), y = range(-185, 240), z = range(-360, -100);
    skyPositions[i * 3] = x;
    skyPositions[i * 3 + 1] = y;
    skyPositions[i * 3 + 2] = z;
    const c = new THREE.Color().setHSL(range(.53, .66), range(.06, .25), range(.58, 1.0));
    skyColors[i * 3] = c.r;
    skyColors[i * 3 + 1] = c.g;
    skyColors[i * 3 + 2] = c.b;
  }
  const skyGeo = new THREE.BufferGeometry();
  skyGeo.setAttribute("position", new THREE.BufferAttribute(skyPositions, 3));
  skyGeo.setAttribute("color", new THREE.BufferAttribute(skyColors, 3));
  scene.add(new THREE.Points(skyGeo,
    new THREE.PointsMaterial({ size: .8, vertexColors: true,
      transparent: true, opacity: .83, sizeAttenuation: true })));

  // Distance haze is a procedural aurora-like scatter (restrained, atmospheric).
  function mistPlane() {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 256;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(280, 116, 16, 256, 128, 230);
    g.addColorStop(0, "rgba(77,119,133,.29)");
    g.addColorStop(.44, "rgba(41,70,94,.11)");
    g.addColorStop(1, "rgba(8,18,30,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 256);
    const t = new THREE.CanvasTexture(c);
    const m = new THREE.MeshBasicMaterial({
      map: t, transparent: true, opacity: .55, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(250, 135), m);
    mesh.position.set(0, 18, -130);
    scene.add(mesh);
  }
  mistPlane();

  // A heavy, irregular carved standing stone with REAL 3D depth (not an AI image).
  const stoneOutline = new THREE.Shape();
  stoneOutline.moveTo(-4.0, .0);
  stoneOutline.lineTo(-4.8, 2.0);
  stoneOutline.lineTo(-4.55, 7.85);
  stoneOutline.lineTo(-3.72, 10.2);
  stoneOutline.lineTo(-2.18, 11.15);
  stoneOutline.lineTo(.7, 11.34);
  stoneOutline.lineTo(3.35, 10.72);
  stoneOutline.lineTo(4.38, 8.05);
  stoneOutline.lineTo(4.55, 3.12);
  stoneOutline.lineTo(3.9, 0);
  stoneOutline.closePath();
  const standingStone = new THREE.Mesh(new THREE.ExtrudeGeometry(stoneOutline, {
    depth: 1.95,
    bevelEnabled: true,
    bevelThickness: .27,
    bevelSize: .31,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 1
  }), darkStone);
  standingStone.position.z = -56.8;
  standingStone.rotation.y = .015;
  scene.add(standingStone);
  // Stone feet embedded in the bridge.
  for (const side of [-1, 1]) {
    const stoneFoot = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.15, 2.8), sideMat);
    stoneFoot.position.set(side * 3.85, -.05, -55.3);
    stoneFoot.rotation.y = side * .17;
    scene.add(stoneFoot);
  }
  const slabZ = -54.52;
  const centerY = 5.8;
  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(3.43, .12, 8, 80), goldMat);
  bezel.position.set(0, centerY, slabZ + .09);
  scene.add(bezel);
  const carvedGroove = new THREE.Mesh(
    new THREE.TorusGeometry(3.88, .023, 8, 80), edgeMat);
  carvedGroove.position.set(0, centerY, slabZ + .1);
  scene.add(carvedGroove);
  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.0, .055, 8, 80), goldMat);
  innerRing.position.set(0, centerY, slabZ + .13);
  scene.add(innerRing);
  const centre = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, .2, 48),
    new THREE.MeshStandardMaterial({
      color: 0x203a42, metalness: .36, roughness: .62,
      emissive: 0x142a2d, emissiveIntensity: .22
    })
  );
  centre.rotation.x = Math.PI / 2;
  centre.position.set(0, centerY, slabZ + .13);
  scene.add(centre);
  // Fine stone fissures are geometric (in 3D), not painted fake runes.
  for (let i = 0; i < 27; i++) {
    const a = range(0, Math.PI * 2);
    const rad = range(3.9, 4.65);
    const x = Math.cos(a) * rad, y = centerY + Math.sin(a) * rad;
    const points = [
      new THREE.Vector3(x, y, slabZ + .02),
      new THREE.Vector3(x + range(-.15, .15), y + range(-.3, .3), slabZ + .03),
      new THREE.Vector3(x + range(-.22, .22), y + range(-.55, .55), slabZ + .05)
    ];
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: 0x192b2f, opacity: .8, transparent: true })
    );
    scene.add(line);
  }

  function runeTexture(symbol) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 256, 256);
    const halo = ctx.createRadialGradient(128, 128, 12, 128, 128, 116);
    halo.addColorStop(0, "rgba(148,235,218,.22)");
    halo.addColorStop(.48, "rgba(95,200,195,.09)");
    halo.addColorStop(1, "rgba(45,105,143,0)");
    ctx.fillStyle = halo; ctx.fillRect(0,0,256,256);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "normal 162px Georgia,serif";
    ctx.shadowColor = "#6de2d2"; ctx.shadowBlur = 19;
    ctx.fillStyle = "#b8f0d5";
    ctx.fillText(symbol || "ᛟ", 128, 130);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  const runeMeshes = [];
  const runeGroup = new THREE.Group();
  scene.add(runeGroup);
  let selectedLocations = [];
  let selectedSignature = "";
  let selectRune = () => {};
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function makeRunes(locations) {
    for (const node of runeGroup.children.slice()) {
      node.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material?.map) obj.material.map.dispose(); if (obj.material && obj.material !== goldMat) obj.material.dispose(); });
      runeGroup.remove(node);
    }
    runeMeshes.length = 0;
    const list = locations.slice(0, 7);
    list.forEach((place, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI / 7);
      const rad = 3.06;
      const x = Math.cos(angle) * rad;
      const y = centerY + Math.sin(angle) * rad;
      const node = new THREE.Group();
      node.position.set(x, y, slabZ + .21);
      node.userData.placeId = place.id;
      const recess = new THREE.Mesh(
        new THREE.CircleGeometry(.68, 40),
        new THREE.MeshStandardMaterial({
          color: 0x15272d, metalness: .2, roughness: .84,
          emissive: 0x0a2023, emissiveIntensity: .55
        })
      );
      recess.position.z = 0.0;
      node.add(recess);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(.72, .08, 10, 40),
        goldMat
      );
      ring.position.z = .035;
      node.add(ring);
      const rune = new THREE.Mesh(
        new THREE.PlaneGeometry(1.07, 1.07),
        new THREE.MeshBasicMaterial({
          map: runeTexture(place.rune || "ᛟ"), transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false, side: THREE.DoubleSide
        })
      );
      rune.position.z = .082;
      node.add(rune);
      const hit = new THREE.Mesh(
        new THREE.CircleGeometry(.92, 32),
        new THREE.MeshBasicMaterial({
          visible: false, side: THREE.DoubleSide, depthWrite: false
        })
      );
      hit.position.z = .19;
      hit.userData.placeId = place.id;
      node.add(hit);
      runeMeshes.push(hit);
      runeGroup.add(node);
    });
  }
  const endSigil = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 2.0),
    new THREE.MeshBasicMaterial({
      map: runeTexture("ᛟ"), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false
    })
  );
  endSigil.position.set(0, centerY, slabZ + .3);
  scene.add(endSigil);

  let phase = "off";
  let progress = 0;
  let goal = 0;
  let lastTick = 0;
  let frameId = null;
  let bobImpulse = 0;
  let stepSerial = 0;

  function resize() {
    const parent = canvas.parentElement;
    if (!parent || phase === "off") return;
    const w = Math.max(1, parent.clientWidth);
    const h = Math.max(1, parent.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  function animate(t) {
    frameId = requestAnimationFrame(animate);
    if (phase === "off" || document.hidden) return;
    const delta = Math.min(.08, Math.max(.001, (t - lastTick) / 1000 || .016));
    lastTick = t;
    progress += (goal - progress) * Math.min(1, delta * 5.4);
    bobImpulse *= Math.pow(.06, delta);
    const baseZ = 17.5 - progress * 60;
    const bob = Math.sin(progress * 95) * .026 + bobImpulse * .13;
    camera.position.set(
      Math.sin(progress * 18) * .043 + bobImpulse * .045,
      1.87 + bob + .1 * progress,
      baseZ
    );
    const lookY = THREE.MathUtils.lerp(1.88, centerY - .18, THREE.MathUtils.smoothstep(progress, .63, 1));
    camera.lookAt(0, lookY, -55);
    for (const rock of distantRocks) rock.rotation.y += rock.userData.speed * delta * 50;
    endSigil.material.opacity = .85 + Math.sin(t * .001) * .12;
    for (const node of runeGroup.children) node.rotation.z = Math.sin(t * .0008 + node.position.x) * .009;
    renderer.render(scene, camera);
  }
  function ensureLoop() {
    if (!frameId) frameId = requestAnimationFrame(animate);
  }
  function setPhase(next) {
    phase = next === "walk" || next === "slab" ? next : "off";
    canvas.hidden = phase === "off";
    if (phase === "off") return;
    const mount = el(phase + "Stage");
    if (mount && canvas.parentElement !== mount) mount.appendChild(canvas);
    canvas.style.pointerEvents = phase === "slab" ? "auto" : "none";
    if (phase === "slab") goal = 1;
    else if (goal > .98) goal = 0;
    resize();
    ensureLoop();
  }
  function step(p) {
    const next = Math.max(0, Math.min(1, p));
    if (next < goal) progress = next;
    goal = next;
    bobImpulse = stepSerial++ % 2 ? -.7 : .7;
  }
  function setLocations(places, handler) {
    if (Array.isArray(places) && places.length > 0) {
      selectRune = typeof handler === "function" ? handler : () => {};
      const sig = places.slice(0, 7).map(p => p.id + ":" + p.rune).join("|");
      if (sig !== selectedSignature) {
        selectedLocations = places;
        selectedSignature = sig;
        makeRunes(selectedLocations);
      }
    }
  }
  function onPointer(event) {
    if (phase !== "slab" || !runeMeshes.length) return;
    const box = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - box.left) / box.width) * 2 - 1;
    pointer.y = -((event.clientY - box.top) / box.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(runeMeshes, false);
    if (hits.length) {
      event.preventDefault();
      selectRune(hits[0].object.userData.placeId);
    }
  }
  canvas.addEventListener("pointerdown", onPointer);
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { lastTick = performance.now(); resize(); } });
  const api = { setPhase, step, setLocations, resize, get active() { return phase !== "off"; } };
  document.body.classList.add("world3d-ready");
  window.portal3d = api;
  window.dispatchEvent(new Event("portal3dready"));
})();
