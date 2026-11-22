const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const html=read("index.html"),player=read("player.js"),admin=read("admin/admin.js");
const edge=read("supabase/functions/larp-portal/index.ts"),sql=read("supabase/larp_portal/migration.sql");
const worker=read("sw.js"),adminHtml=read("admin/index.html");
test("entry is a continuous textless full-screen iPad portal",()=>{
  assert.match(html,/<canvas id="portalCanvas"/);
  assert.match(html,/<section id="portalStage"/);
  assert.doesNotMatch(html,/<h[1-6]\b|<p(?:\s|>)/i);
  assert.doesNotMatch(html,/\b(?:LOGIN|PAUSE|TIME LEFT|CONTROL)\b/i);
  assert.match(read("player.css"),/\.vortex-stage canvas/);
  assert.match(player,/requestAnimationFrame\(animateVortex\)/);
});
test("walking is screen-wide and includes camera shake plus faint generated footsteps",()=>{
  assert.match(player,/\$\("walkStage"\)\.addEventListener\("pointerdown",walk\)/);
  assert.match(player,/function footstep/);
  assert.match(player,/\.065/);
  assert.match(read("player.css"),/@keyframes walkShake/);
  assert.match(player,/stepCount>=12/);
});
test("the seven-rune slab opens an actual location film reel",()=>{
  assert.match(html,/id="runeWheel"/);
  assert.match(player,/snapshot\.places\.forEach/);
  assert.match(player,/function startReel/);
  assert.match(player,/shots\.slice\(1,3\)/);
  assert.match(read("player.css"),/@keyframes reelZoom/);
});
test("all seven locations have three bundled reel illustrations each",()=>{
  const realms=["emberfall","glasswind","verdant","stormglass","bleakwater","sanctum","iron"];
  for(const name of realms)for(let i=1;i<=3;i++){
    const file="./assets/reels/"+name+"-"+i+".svg";
    assert.ok(fs.existsSync(path.join(root,file)),file);
    assert.ok(worker.includes(file),file+" must be cached");
  }
  assert.match(read("assets/reels/glasswind-2.svg"),/rect|ellipse/);
});
test("nine approved relics have their bundled artwork but the later seeds sample is excluded",()=>{
  const ids=["smartphone","toilet","history","medical","worldmap","firearm","led","condoms","filter"];
  for(const id of ids){
    assert.ok(fs.existsSync(path.join(root,"assets/objects/"+id+".svg")));
    assert.match(sql,new RegExp("\\('"+id+"',"));
  }
  assert.doesNotMatch(sql,/\('seeds','/);
  assert.match(sql,/seven.hour|25200/i);
});
test("server owns the seven-hour clock, one randomized double-hour and unique victims",()=>{
  assert.match(sql,/duration_seconds integer not null default 25200/);
  assert.match(sql,/interval_seconds integer not null default 3600/);
  assert.match(sql,/double_hour=1\+floor\(random\(\)\*7\)/);
  assert.match(sql,/order by random\(\) limit 1/);
  assert.match(sql,/exit when v_alive<=1/);
  assert.match(sql,/where active/);
  assert.match(sql,/for update/);
});
test("mobile admin has isolated controls for start pause resume restore and scene reset",()=>{
  for(const id of ["sessionTimer","nextLoss","doubleHour","relicList","resetViewBtn","pauseBtn","resumeBtn","startBtn"])assert.ok(adminHtml.includes('id="'+id+'"'));
  for(const command of ["login","start","pause","resume","restore","eliminate","reset_scene","reset"])assert.ok(admin.includes('"'+command+'"'));
  assert.match(admin,/sessionStorage\.setItem/);
  assert.match(admin,/function countdown/);
});
test("security: isolated tables, RLS, restricted server RPCs and no browser service secrets",()=>{
  assert.match(sql,/create schema if not exists larp_portal/);
  assert.match(sql,/enable row level security/g);
  assert.match(sql,/revoke all on function public\.larp_portal_state/);
  assert.match(sql,/grant execute on function public\.larp_portal_control.*service_role/);
  assert.match(edge,/TRUSTED_ORIGINS/);
  assert.match(edge,/SUPABASE_SECRET_KEYS/);
  assert.ok(edge.includes("Deno.serve("));
  assert.doesNotMatch(player,/SERVICE_ROLE_KEY|sb_secret_/);
  assert.doesNotMatch(admin,/SERVICE_ROLE_KEY|sb_secret_/);
});
test("both browsers rely on a single Edge Function URL",()=>{
  const uri="https://mmheljndcdhzzuobjaxz.supabase.co/functions/v1/larp-portal";
  assert.ok(player.includes(uri)&&admin.includes(uri));
  assert.match(edge,/larp_portal_control/);
  assert.match(edge,/larp_portal_state/);
});
test("offline cache contains both new screens and room for every existing image",()=>{
  for(const f of ["./player.js","./player.css","./admin/index.html","./admin/admin.js","./admin/admin.css"])assert.ok(worker.includes(f),f);
  assert.match(worker,/larp-crossing-v9-grounded-3d/);
  assert.match(player,/larp_last_online_snapshot/);
});
test("new javascript modules parse successfully",()=>{
  for(const file of ["player.js","admin/admin.js","sw.js"]){assert.doesNotThrow(()=>new Function(read(file)),file);}
});

test("seven original realistic cinematic assets are locally bundled and not temporary external URLs",()=>{
  const names=["portal-gate","void-walk","runestone","grocery-1","grocery-2","grocery-3","portal-grocery"];
  const css=read("cinematic.css"),sw=read("sw.js");
  for(const name of names){
    const asset="assets/cinematics/"+name+".webp";
    const full=path.join(root,asset);
    assert.ok(fs.existsSync(full),"Missing "+asset);
    assert.ok(fs.statSync(full).size>90000,asset+" is a placeholder rather than the original image");
    assert.ok(sw.includes("./"+asset),asset+" must be cached for iPad");
  }
  assert.ok(css.includes("portal-gate.webp"));
  assert.ok(css.includes("void-walk.webp"));
  assert.ok(css.includes("runestone.webp"));
  assert.match(read("index.html"),/cinematic\.css/);
});
test("photo-real transitions preserve seven touch zones and interactive walk",()=>{
  const css=read("cinematic.css");
  assert.match(css,/\.rune-socket/);
  assert.ok(player.includes("positions=[[50.0,13.7]"));
  assert.ok(player.includes("--photo-walk-zoom"));
  assert.ok(player.includes("svg|webp"));
  assert.match(css,/walk-camera\.stepping/);
});

test("the world after the approved portal entrance is one continuous 3D scene",()=>{
  const source=read("world3d.js"),style=read("grounded-world.css");
  assert.match(html,/type="module" src="\.\/world3d\.js"/);
  assert.match(html,/grounded-world\.css/);
  assert.match(source,/from "\.\/vendor\/three\.module\.js"/);
  assert.match(source,/new THREE\.PerspectiveCamera/);
  assert.match(source,/new THREE\.WebGLRenderer/);
  assert.match(source,/new THREE\.ExtrudeGeometry/);
  assert.match(source,/THREE\.Raycaster/);
  assert.match(source,/setPhase\(next\)/);
  assert.match(source,/selectRune\(hits\[0\]\.object\.userData\.placeId\)/);
  assert.match(player,/portal3dready/);
  assert.match(player,/window\.portal3d\.step\(progress\)/);
  assert.match(style,/\.world3d-ready \.walk-stage \.walk-camera\{visibility:hidden/);
  assert.ok(fs.statSync(path.join(root,"vendor/three.module.js")).size>700000);
  assert.doesNotMatch(source,/assets\/cinematics\/runestone\.webp|assets\/cinematics\/void-walk\.webp/);
});

test("the seven locations use twenty-one actual photographs, never unrelated AI scene illustrations",()=>{
  const places=["emberfall","glasswind","verdant","stormglass","bleakwater","sanctum","iron"];
  const credits=read("PHOTOGRAPHY_CREDITS.md");
  const manifest=JSON.parse(read("assets/photography/sources.json"));
  assert.equal(Object.keys(manifest).length,7);
  for(const place of places){
    assert.ok(manifest[place],place);
    assert.equal(manifest[place].frames.length,3);
    assert.ok(credits.toLowerCase().includes(place==="glasswind"?"grocery":place==="sanctum"?"sanctum":place==="iron"?"iron":place==="bleakwater"?"bleakwater":place));
    for(let shot=1;shot<=3;shot++){
      const asset="assets/photography/"+place+"-"+shot+".webp";
      assert.ok(fs.existsSync(path.join(root,asset)),asset);
      assert.ok(fs.statSync(path.join(root,asset)).size>20000,asset);
      assert.ok(worker.includes("./"+asset),"iPad cache: "+asset);
    }
  }
  assert.match(player,/photography/);
  assert.match(worker,/vendor\/three\.module\.js/);
});
