/* Browser-level QA of the real iPad interaction. Playwright is only a test dependency. */
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const fs = require("node:fs");

const ids = ["emberfall","glasswind","verdant","stormglass","bleakwater","sanctum","iron"];
const runes = ["ᚠ","ᚹ","ᛉ","ᚱ","ᛚ","ᛟ","ᚨ"];
const places = ids.map((id,i)=>({
  id,name:id,rune:runes[i],
  background:"./assets/photography/"+id+"-3.webp",
  stills:[1,2,3].map(n=>"./assets/photography/"+id+"-"+n+".webp")
}));
const relics = [
  {id:"smartphone",place_id:"iron"},
  {id:"toilet",place_id:"glasswind"},
  {id:"history",place_id:"emberfall"},
  {id:"medical",place_id:"sanctum"},
  {id:"worldmap",place_id:"verdant"},
  {id:"firearm",place_id:"emberfall"},
  {id:"led",place_id:"stormglass"},
  {id:"condoms",place_id:"sanctum"},
  {id:"filter",place_id:"bleakwater"}
].map(x=>({...x,active:true,name:x.id,image:"./assets/objects/"+x.id+".svg"}));
(async()=>{
 const browser=await chromium.launch({
   headless:true,channel:"chrome",
   args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader",
     "--enable-webgl","--disable-dev-shm-usage","--no-sandbox"]
 });
 try{
   const page=await browser.newPage({viewport:{width:1024,height:768},deviceScaleFactor:1,isMobile:true,hasTouch:true});
   const errors=[];
   page.on("pageerror",e=>errors.push(String(e)));
   await page.route("https://mmheljndcdhzzuobjaxz.supabase.co/**",async route=>{
     await route.fulfill({status:200,contentType:"application/json",
       headers:{"access-control-allow-origin":"*"},
       body:JSON.stringify({ok:true,session:{
         run_id:"test-run",status:"ready",journey_version:1,elapsed_seconds:0,
         duration_seconds:25200,remaining_seconds:25200,processed_hours:0
       },places,relics,events:[]})});
   });
   await page.goto("http://127.0.0.1:8080/",{waitUntil:"networkidle",timeout:30000});
   await page.waitForFunction(()=>Boolean(window.portal3d),{timeout:15000});
   await page.waitForFunction(()=>document.querySelector("#portalStage.active"),{timeout:8000});
   assert.equal(await page.locator("h1,main p").count(),0);
   await page.screenshot({path:"browser-artifacts/01-approved-entrance.png"});
   await page.touchscreen.tap(500,345);
   await page.waitForFunction(()=>document.querySelector("#walkStage.active"),{timeout:9000});
   await page.waitForSelector("#continuousWorld3D",{state:"visible",timeout:10000});
   assert.equal(await page.evaluate(()=>document.querySelector("#continuousWorld3D").parentElement.id),"walkStage");
   await page.waitForTimeout(850);
   await page.screenshot({path:"browser-artifacts/02-actual-3d-bridge.png"});
   for(let i=0;i<12;i++){
     await page.touchscreen.tap(500,420);
     await page.waitForTimeout(120);
   }
   await page.waitForFunction(()=>document.querySelector("#slabStage.active"),{timeout:12000});
   await page.waitForTimeout(1700);
   assert.equal(await page.evaluate(()=>document.querySelector("#continuousWorld3D").parentElement.id),"slabStage");
   assert.equal(await page.locator("#runeWheel button").count(),7);
   await page.screenshot({path:"browser-artifacts/03-same-3d-rune-slab.png"});
   const positions=await page.evaluate(()=>window.portal3d.getRuneCenters());
   assert.equal(positions.length,7);
   const usable=positions.filter(p=>p.x>30&&p.x<994&&p.y>30&&p.y<738);
   assert.ok(usable.length>=5,"At least five runes must be physically tappable in 1024x768");
   const where=usable[0];
   await page.touchscreen.tap(where.x,where.y);
   await page.waitForFunction(()=>document.querySelector("#reelStage.active"),{timeout:9000});
   await page.waitForTimeout(450);
   await page.screenshot({path:"browser-artifacts/04-real-location-photo-reel.png"});
   const pic=await page.locator("#reelImage").getAttribute("src");
   assert.ok(pic.includes("assets/photography/"),"Photo reel must use real licensed imagery");
   await page.touchscreen.tap(500,380);
   await page.waitForFunction(()=>document.querySelector("#placeStage.active"),{timeout:9000});
   await page.screenshot({path:"browser-artifacts/05-real-location-with-relic.png"});
   assert.equal(errors.length,0,"Browser page errors: "+errors.join(" / "));
   console.log("Browser QA passed: portal → real 3D walk → same 3D rune altar → real photo location → relic.");
 }finally{
   await browser.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
