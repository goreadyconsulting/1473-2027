/* 1473–2027 LARP portal | No build tools or external dependencies required. */
(function () {
  "use strict";
  var CONFIG_KEY = "chronos1473_config_v1";
  var SESSION_KEY = "chronos1473_session_v1";
  var DEFAULT_CONFIG = {
    version: 4,
    title: "TEMPORAL CONNECTION",
    durationMinutes: 420,
    autoEliminateEveryMinutes: 60,
    emergencySeconds: 45,
    instabilityAtMinutesRemaining: [],
    failureDestroyCount: 2,
    glitchMinSeconds: 35,
    glitchMaxSeconds: 75,
    adminPin: "1473",
    locations: [
      {id:"emberfall",name:"Emberfall Keep",rune:"ᚠ",description:"A ruined stronghold above a sea of embers, where impossible records lie buried.",colour:"#e5bb83"},
      {id:"glasswind",name:"Glasswind Bazaar",rune:"ᚹ",description:"An abandoned market of crystal mirrors and memories carried on the wind.",colour:"#93d4d4"},
      {id:"verdant",name:"Verdant Hollow",rune:"ᛉ",description:"An ancient living valley where the soil remembers futures yet to bloom.",colour:"#a3d49c"},
      {id:"stormglass",name:"Stormglass Spire",rune:"ᚱ",description:"A tower beneath a permanent storm, lit by lightning and stolen sunlight.",colour:"#b2bdf0"},
      {id:"bleakwater",name:"Bleakwater Crossing",rune:"ᛚ",description:"A silent crossing over black water, guarded by echoes and silver mist.",colour:"#90d6dd"},
      {id:"sanctum",name:"The Quiet Sanctum",rune:"ᛟ",description:"A forgotten hall of healers where forbidden remedies are kept.",colour:"#e4b9d7"},
      {id:"iron",name:"Echoes of Iron",rune:"ᚨ",description:"A cavern of dormant machines whose voices may never sound again.",colour:"#e8c59e"}
    ],
    objects: [
      {id:"smartphone", locationId:"iron", name:"Smartphone", icon:"📱", image:"./assets/objects/smartphone.svg", description:"A small glass-and-metal device, its bright screen holding knowledge that should not exist for another five centuries.", benefit:"Photographs, recordings, maps, calculations, translated words, music and stored books. More information than the people of 1473 can imagine.", limitation:"Only 37% battery remains. No electricity, charger, Wi-Fi or mobile network exists here. Once the battery runs out, it becomes a costly piece of glass.", consequence:"Even a few hours of its knowledge might advance technology, reveal coming disasters, change bloodlines and rewrite the path from 1473 to 2027."},
      {id:"toilet", locationId:"glasswind", name:"A Giant Pack of Toilet Paper", icon:"🧻", image:"./assets/objects/toilet.svg", description:"An enormous and surprisingly luxurious supply of soft white paper, once considered exceptionally valuable in 2020.", benefit:"Soft. Absorbent. Clean. A revolutionary improvement to medieval bathroom life.", limitation:"Nobody in 1473 can manufacture more. Fortunately, this enormous pack might last its owner a lifetime.", consequence:"Probably none whatsoever. Except an unusually comfortable lifetime."},
      {id:"history", locationId:"emberfall", name:"History Book (1300–2027)", icon:"📖", image:"./assets/objects/history.svg", description:"A book describing centuries that have yet to pass, with dates, names and accounts that could shape the fate of kingdoms.", benefit:"Foreknowledge of wars, rulers, discoveries, disasters, diseases and inventions from the medieval period to 2027.", limitation:"The moment anyone changes history, its predictions become increasingly unreliable.", consequence:"A disaster could be prevented — or a completely different catastrophe could be set in motion."},
      {id:"medical", locationId:"sanctum", name:"Modern Doctor's Kit", icon:"🩺", image:"./assets/objects/medical.svg", description:"A collection of medical instruments and supplies from an age far beyond medieval healing.", benefit:"A healer gains equipment centuries ahead of their time, potentially making treatment and surgery safer.", limitation:"The tools do not include the knowledge or training to use them safely. Some supplies will run out.", consequence:"Surgery and medical care could change dramatically, but only if people learn how to use the equipment."},
      {id:"worldmap", locationId:"glasswind", name:"Modern World Map", icon:"🗺️", image:"./assets/objects/worldmap.svg", description:"The world as it appears in 2027 — continents, oceans, countries and distant places revealed in a single sheet.", benefit:"Knowledge of the true geography of the world and the locations of lands beyond the familiar medieval horizon.", limitation:"Political borders, names and countries may be very different from those in 1473.", consequence:"Exploration, trade, and colonisation could unfold along entirely different paths."},
      {id:"firearm", locationId:"emberfall", name:"Modern Firearm", icon:"⚔️", image:"./assets/objects/firearm.svg", description:"A compact mechanical weapon from the future, unlike anything a medieval warrior has handled.", benefit:"A weapon centuries ahead of the arms and armour available in 1473.", limitation:"A strictly limited supply of ammunition, with no realistic ability to make more or repair the mechanism.", consequence:"Its brief advantage could change a confrontation — and spark fear, conflict or a dangerous struggle for power."},
      {id:"led", locationId:"stormglass", name:"Portable LED Lights", icon:"💡", image:"./assets/objects/led.svg", description:"A string of glittering electric lights, bright as little captive stars and entirely without flame.", benefit:"Bright, efficient, safer lighting without smoke or fire. Preeeeeeety. So many sparkles.", limitation:"The batteries or power supply will eventually run out.", consequence:"Probably little lasting historical change — but nights could become considerably more beautiful."},
      {id:"condoms", locationId:"sanctum", name:"Condoms / Contraceptive Supplies", icon:"✧", image:"./assets/objects/condoms.svg", description:"Small sealed modern supplies whose purpose may be unfamiliar to the people of 1473.", benefit:"Contraception that gives people more control over pregnancy and family planning, while also reducing the risk of some infections.", limitation:"They are single-use, limited in number and may not be understood without explanation.", consequence:"If their purpose becomes known, marriage, inheritance, family size and women's lives might change profoundly."},
      {id:"filter", locationId:"bleakwater", name:"Portable Water Purifier", icon:"💧", image:"./assets/objects/filter.svg", description:"A portable device made to remove many contaminants from drinking water.", benefit:"Safer water could reduce disease and deaths, improving the health of an entire settlement.", limitation:"Maintenance, filters and replacement parts cannot readily be found in 1473. It will eventually fail and cannot remove every contaminant.", consequence:"A village could grow around a source of safer drinking water, transforming its health, agriculture and prosperity."},
      {id:"seeds", locationId:"verdant", name:"Agricultural Seed Collection", icon:"🌱", image:"./assets/objects/seeds.svg", description:"An assortment of modern crop seeds, preserved for a world very different from the one they now inhabit.", benefit:"Modern varieties could bring better harvests, new foods and greater resilience.", limitation:"Successful cultivation depends on suitable soil, climate, knowledge, time and care.", consequence:"If the crops thrive, farming, diets and the ability of communities to survive may be transformed for generations."}
    ],
    glitches: [
      {id:"signal01",type:"message",text:"ERROR 0x1473 // FUTURE SIGNAL LEAK DETECTED",source:"",durationSeconds:3},
      {id:"signal02",type:"message",text:"[UNVERIFIED TRANSMISSION] THE SKY IS FULL OF MACHINES",source:"",durationSeconds:3},
      {id:"signal03",type:"message",text:"2034? 2027? CHRONOLOGICAL REFERENCE CORRUPTED",source:"",durationSeconds:3},
      {id:"futurecity",type:"image",text:"FRAGMENT RECOVERED // A CITY FROM TOMORROW",source:"./assets/future-city.svg",durationSeconds:4}
    ]
  };

  var $ = function (id) { return document.getElementById(id); };
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function asText(value) { return String(value == null ? "" : value); }
  function html(value) { return asText(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
  function intRange(value,min,max,fallback) { var n=Number(value); return Number.isFinite(n) ? Math.min(max,Math.max(min,Math.round(n))) : fallback; }
  function mediaUrl(source) {
    var s=asText(source).trim();
    if (!s) return "";
    if (/^https?:\/\/[^ "'<>]+$/i.test(s) || /^(?:\.{1,2}\/|\/|assets\/)[^"'<>]*$/i.test(s) || /^data:image\/(?:png|jpeg|gif|webp|svg\+xml);base64,[a-z0-9+/=]+$/i.test(s)) return s;
    return "";
  }
  function normalizeConfig(raw) {
    if (!raw || typeof raw!=="object") throw new Error("Configuration must be a JSON object.");
    var c=Object.assign({},clone(DEFAULT_CONFIG),raw);
    c.title=asText(c.title).slice(0,90)||DEFAULT_CONFIG.title;
    c.durationMinutes=intRange(c.durationMinutes,2,1440,420);
    c.autoEliminateEveryMinutes=intRange(c.autoEliminateEveryMinutes,1,1440,60);
    c.emergencySeconds=intRange(c.emergencySeconds,10,300,45);
    c.failureDestroyCount=intRange(c.failureDestroyCount,0,10,2);
    c.glitchMinSeconds=intRange(c.glitchMinSeconds,10,3600,35);
    c.glitchMaxSeconds=intRange(c.glitchMaxSeconds,c.glitchMinSeconds,3600,75);
    c.adminPin=asText(c.adminPin).slice(0,20)||"1473";
    c.instabilityAtMinutesRemaining=(Array.isArray(c.instabilityAtMinutesRemaining)?c.instabilityAtMinutesRemaining:[])
      .map(Number).filter(function(n){return Number.isFinite(n)&&n>0&&n<c.durationMinutes;})
      .map(function(n){return Math.round(n*100)/100;})
      .filter(function(n,i,a){return a.indexOf(n)===i;}).sort(function(a,b){return b-a;});
    // Preserve edited relics and locations; existing v3 sites receive the new seven-hour rules.
    if(Number(raw.version)<4){c.durationMinutes=420;c.autoEliminateEveryMinutes=60;c.instabilityAtMinutesRemaining=[];}
    c.version=4;
    if(!Array.isArray(raw.locations)||raw.locations.length!==7) c.locations=clone(DEFAULT_CONFIG.locations);
    else {
      var uniqueLocations=new Set();
      c.locations=raw.locations.map(function(l,i){
        l=(l&&typeof l==="object")?l:{};
        var stableId=DEFAULT_CONFIG.locations[i].id;
        uniqueLocations.add(stableId);
        var colour=/^#[0-9a-fA-F]{6}$/.test(asText(l.colour))?l.colour:DEFAULT_CONFIG.locations[i].colour;
        return {id:stableId,name:asText(l.name).slice(0,55)||DEFAULT_CONFIG.locations[i].name,rune:asText(l.rune).slice(0,5)||DEFAULT_CONFIG.locations[i].rune,description:asText(l.description).slice(0,260),colour:colour};
      });
    }
    if (!Array.isArray(c.objects)) throw new Error("objects must be an array.");
    // A one-time upgrade from the old sample inventory installs Saulė's ten approved relics.
    // Existing custom location descriptions remain intact; older game sessions reset safely.
    var sourceObjects=Number(raw.version)<3?clone(DEFAULT_CONFIG.objects):c.objects;
    if(sourceObjects.length>10) throw new Error("This crossing holds at most ten relics.");
    var used={};
    c.objects=sourceObjects.map(function(o,i){
      o=(o&&typeof o==="object")?o:{};
      var id=asText(o.id)||("object-"+i);
      if(used[id]) id=id+"-"+i;
      used[id]=true;
      return {id:id,locationId:c.locations.some(function(l){return l.id===o.locationId;})?o.locationId:(DEFAULT_CONFIG.objects.find(function(x){return x.id===id;})||DEFAULT_CONFIG.objects[i%DEFAULT_CONFIG.objects.length]).locationId,name:asText(o.name).slice(0,70)||"Unknown Object",icon:asText(o.icon).slice(0,12)||"✦",image:mediaUrl(o.image),description:asText(o.description).slice(0,480),benefit:asText(o.benefit).slice(0,780),limitation:asText(o.limitation).slice(0,780),consequence:asText(o.consequence).slice(0,780)};
    });
    if(c.objects.length===0) throw new Error("At least one object is required.");
    if (!Array.isArray(c.glitches)) c.glitches=[];
    c.glitches=c.glitches.slice(0,100).map(function(g,i){
      g=(g&&typeof g==="object")?g:{};
      return {id:asText(g.id)||("glitch-"+i),type:["message","image","video"].indexOf(g.type)>=0?g.type:"message",text:asText(g.text).slice(0,260),source:mediaUrl(g.source),durationSeconds:intRange(g.durationSeconds,1,15,3)};
    });
    return c;
  }
  function readStored(key) { try {var s=localStorage.getItem(key);return s?JSON.parse(s):null;}catch(e){return null;} }
  var config;
  try {config=normalizeConfig(readStored(CONFIG_KEY)||DEFAULT_CONFIG);} catch(e){config=normalizeConfig(DEFAULT_CONFIG);}
  function freshSession() {return {version:4,phase:"standby",paused:false,endsAt:0,durationMs:0,autoIntervalMs:0,hourlyProcessed:0,lastHourlyLost:null,remainingMs:null,emergency:null,fired:[],lost:[],finalId:null,log:[],scene:"gate",walkProgress:0,selectedLocation:"emberfall",viewAll:false,preEmergencyScene:null,preEmergencyViewAll:false,visited:[]};}
  function loadSession() {
    var s=readStored(SESSION_KEY);
    if(!s||s.version!==4||!["standby","running","closed","completed"].includes(s.phase)) return freshSession();
    var merged=Object.assign(freshSession(),s);
    merged.lost=Array.isArray(merged.lost)?merged.lost.filter(function(l){return l&&typeof l.id==="string";}):[];
    merged.fired=Array.isArray(merged.fired)?merged.fired:[];
    merged.log=Array.isArray(merged.log)?merged.log.slice(0,40):[];
    merged.durationMs=intRange(merged.durationMs,0,1440*60000,0);
    merged.autoIntervalMs=intRange(merged.autoIntervalMs,0,1440*60000,0);
    merged.hourlyProcessed=intRange(merged.hourlyProcessed,0,1440,0);
    merged.scene=["gate","path","dial","archive"].includes(merged.scene)?merged.scene:"gate";
    merged.walkProgress=intRange(merged.walkProgress,0,100,0);
    merged.selectedLocation=config.locations.some(function(l){return l.id===merged.selectedLocation;})?merged.selectedLocation:config.locations[0].id;
    merged.visited=Array.isArray(merged.visited)?merged.visited.filter(function(id){return config.locations.some(function(l){return l.id===id;});}):[];
    merged.viewAll=!!merged.viewAll;
    if(merged.emergency){merged.scene="archive";merged.viewAll=true;}
    return merged;
  }
  var state=loadSession();
  var adminUnlocked=false,selectedId=null,selectedObjEditor=null,selectedLocEditor=null,selectedGlitchEditor=null,pendingConfirm=null,glitchHandle=null,glitchNextAt=0,toastHandle=null,walkHandle=null,lastPointerWalkAt=0,hourlyEventHandle=null;
  function persist() {try{localStorage.setItem(CONFIG_KEY,JSON.stringify(config));localStorage.setItem(SESSION_KEY,JSON.stringify(state));return true;}catch(e){notice("Local storage is full or unavailable. Export your configuration.");return false;}}
  function saveSession() {try{localStorage.setItem(SESSION_KEY,JSON.stringify(state));}catch(e){notice("Session cannot be saved on this device.");}}
  function notice(message) {$("adminNotice").textContent=message; toast(message);}
  function toast(message) {var t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(toastHandle);toastHandle=setTimeout(function(){t.classList.remove("show");},2800);}
  function log(message) {state.log.unshift({text:message,time:new Date().toLocaleTimeString()});state.log=state.log.slice(0,40);}
  function activeObjects() {var removed=new Set(state.lost.map(function(l){return l.id;}));return config.objects.filter(function(o){return !removed.has(o.id);});}
  function remainingMs() {if(state.phase==="standby")return config.durationMinutes*60000;if(state.paused)return Math.max(0,Number(state.remainingMs)||0);return Math.max(0,state.endsAt-Date.now());}
  function emergencyMs() {if(!state.emergency)return 0;return state.paused?Math.max(0,Number(state.emergency.remainingMs)||0):Math.max(0,state.emergency.endsAt-Date.now());}
  function timeText(ms) {var secs=Math.ceil(Math.max(0,ms)/1000),m=Math.floor(secs/60),s=secs%60;return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");}
  function longTimeText(ms) {
    var secs=Math.ceil(Math.max(0,ms)/1000);
    var h=Math.floor(secs/3600),m=Math.floor(secs%3600/60),s=secs%60;
    return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  }
  function hourlyTotal() {
    var span=state.durationMs||config.durationMinutes*60000;
    var interval=state.autoIntervalMs||config.autoEliminateEveryMinutes*60000;
    return Math.floor(span/interval);
  }
  function nextHourlyMs() {
    var span=state.durationMs||config.durationMinutes*60000;
    var interval=state.autoIntervalMs||config.autoEliminateEveryMinutes*60000;
    if(state.hourlyProcessed>=Math.floor(span/interval)||activeObjects().length<=1)return null;
    return Math.max(0,(state.hourlyProcessed+1)*interval-(span-remainingMs()));
  }
  function mediaMarkup(obj) {
    var src=mediaUrl(obj.image);
    var icon='<span class="card-icon" aria-hidden="true">'+html(obj.icon||"✦")+'</span>';
    return icon+(src?'<img src="'+html(src)+'" alt="'+html(obj.name)+'" onerror="this.remove()" loading="lazy" style="position:absolute;inset:0;z-index:1;background:#091d23">':"");
  }
  function layoutGrid(count) {
    var cols=count>12?5:count>6?4:count>4?3:count>1?2:1;
    $("objectGrid").style.setProperty("--columns",String(cols));
    $("objectGrid").style.setProperty("--rows",String(Math.ceil(count/cols)));
    $("objectGrid").style.setProperty("--mobile-columns",String(count>1?2:1));
    $("objectGrid").style.setProperty("--mobile-rows",String(Math.ceil(count/(count>1?2:1))));
    $("objectGrid").classList.toggle("low-count",count<=3);
  }
  function renderGrid() {
    var all=activeObjects(),active=(state.scene==="archive"&&!state.viewAll&&!state.emergency)?all.filter(function(o){return o.locationId===state.selectedLocation;}):all,grid=$("objectGrid");
    layoutGrid(Math.max(1,active.length));
    grid.innerHTML=active.map(function(o,index){
      return '<button class="object-card" type="button" data-object="'+html(o.id)+'" aria-label="View '+html(o.name)+'">'+
        '<div class="card-media">'+mediaMarkup(o)+'<span class="card-corner-label">ARCHIVE // '+String(index+1).padStart(2,"0")+'</span></div>'+
        '<div class="card-foot"><div class="card-text"><div class="card-title">'+html(o.name)+'</div><div class="card-description">'+html(o.description)+'</div></div><span class="card-arrow">↗</span></div></button>';
    }).join("");
    $("archiveEmpty").hidden=active.length>0;
    $("archiveEmpty").textContent=all.length?"No surviving relics here. Return to the runestone and choose another destination.":"No relics remain in the archive.";
    $("remainingCount").textContent=String(all.length);
    $("destroyedCount").textContent=String(state.lost.length);
  }
  function renderTelemetry() {
    $("portalTitle").firstChild.textContent=config.title+" ";
    var rem=remainingMs(),status=state.phase==="standby"?"STANDBY":state.phase==="closed"?"CLOSED":state.phase==="completed"?"SECURED":state.paused?"PAUSED":state.emergency?"UNSTABLE":rem<=180000?"CLOSING":"STABLE";
    var klass=status==="SECURED"?"completed":status.toLowerCase();
    $("statusPill").className="status-pill "+klass;
    $("statusText").textContent=status;
    $("mainTimer").textContent=longTimeText(rem);
    var next=nextHourlyMs();
    $("nextElimination").textContent=state.phase==="closed"||state.phase==="completed"?"—":next==null?"—":longTimeText(next);
    $("hourlyProgress").textContent=state.hourlyProcessed+" / "+hourlyTotal()+" ELIMINATIONS";
    $("mainTimer").classList.toggle("urgent",rem<=180000&&state.phase==="running");
    var emergency=!!state.emergency;
    $("emergencyStrip").hidden=!emergency;
    $("portal").classList.toggle("in-emergency",emergency);
    $("emergencyClock").textContent=timeText(emergencyMs());
    $("footerState").textContent=state.phase==="standby"?"AWAITING THE FIRST TRAVELLER":state.phase==="completed"?"OBJECT RETAINED":state.phase==="closed"?"LINK TERMINATED":state.paused?"TRANSMISSION PAUSED":emergency?"STABILITY CRITICAL":"LINK ESTABLISHED";
    $("logText").textContent=state.log.length?state.log[0].text:"The crossing lies dormant. Touch the ancient gate.";
  }
  function renderEnding() {
    var open=state.phase==="completed"||state.phase==="closed";
    $("endingOverlay").hidden=!open;
    if(!open)return;
    var winner=config.objects.find(function(o){return o.id===state.finalId;});
    if(state.phase==="completed"&&winner) {
      $("endingKicker").textContent="TRANSMISSION COMPLETE // FINAL SELECTION";
      $("endingTitle").textContent="ONE OBJECT SURVIVES";
      $("endingVisual").innerHTML=mediaMarkup(winner);
      $("endingName").textContent=winner.name;
      $("endingText").textContent=winner.description;
    }else{
      $("endingKicker").textContent="CRITICAL ERROR // SIGNAL TERMINATED";
      $("endingTitle").textContent="THE PORTAL HAS CLOSED";
      $("endingVisual").innerHTML='<span class="card-icon" aria-hidden="true">⌛</span>';
      $("endingName").textContent="CONNECTION LOST";
      $("endingText").textContent="The seventh hour is over. The final crossing has closed before a relic was secured."+(state.lastHourlyLost?" Last consumed: "+state.lastHourlyLost.name+".":"");
    }
  }


  var screenWake=null;
  function requestScreenWake() {
    if(!navigator.wakeLock||!navigator.wakeLock.request||state.phase!=="running"||document.hidden||screenWake)return;
    navigator.wakeLock.request("screen").then(function(lock){
      screenWake=lock;
      if(lock.addEventListener)lock.addEventListener("release",function(){screenWake=null;});
    }).catch(function(){screenWake=null;});
  }
  function releaseScreenWake() {
    if(screenWake&&screenWake.release)screenWake.release().catch(function(){});
    screenWake=null;
  }

  function soundCue(kind) {
    if(window.PortalAudio&&typeof window.PortalAudio.cue==="function")window.PortalAudio.cue(kind);
  }
  function ritualFlash(kind) {
    var flash=$("ritualFlash");
    flash.className="ritual-flash";
    // Reading layout replays the effect on consecutive player interactions.
    void flash.offsetWidth;
    flash.classList.add(kind);
  }
  function toggleSound() {
    if(!window.PortalAudio||!window.PortalAudio.supported())return toast("Sound is unavailable in this browser.");
    window.PortalAudio.toggle().then(function(enabled){
      $("soundToggle").setAttribute("aria-pressed",String(enabled));
      $("soundToggle").setAttribute("aria-label",enabled?"Mute ambience":"Enable ambience");
      $("soundToggle").textContent=enabled?"♫":"♪";
      if(!enabled)toast("Sound muted.");
    });
  }

  function getLocation() {
    return config.locations.find(function(l){return l.id===state.selectedLocation;})||config.locations[0];
  }
  function renderWorld() {
    var scene=state.scene||"gate",inArchive=scene==="archive",emergency=!!state.emergency;
    $("worldStage").hidden=inArchive;
    $("archiveSection").hidden=!inArchive;
    $("realmNav").hidden=!inArchive||emergency;
    ["gate","path","dial"].forEach(function(name){
      $("scene"+name.charAt(0).toUpperCase()+name.slice(1)).hidden=scene!==name;
    });
    $("worldStage").dataset.scene=scene;
    $("portal").classList.toggle("in-realm",inArchive);
    var loc=getLocation(),index=config.locations.indexOf(loc),available=activeObjects(),inLoc=available.filter(function(o){return o.locationId===loc.id;});
    $("portal").style.setProperty("--realm-accent",loc.colour);
    $("portal").style.setProperty("--realm-backdrop",'url("./assets/realms/'+loc.id+'.svg")');
    $("worldWalkPct").textContent=state.walkProgress+"%";
    $("worldWalkFill").style.width=state.walkProgress+"%";
    $("voidWalkway").style.setProperty("--altar-scale",String(.38+state.walkProgress/100*.83));
    $("worldLocationNo").textContent=String(index+1).padStart(2,"0")+" / 07";
    $("worldLocationName").textContent=loc.name;
    $("worldLocationDesc").textContent=loc.description;
    $("worldLocationStock").textContent=inLoc.length+" OF "+available.length+" SURVIVING RELICS HERE";
    $("worldSelectedRune").textContent=loc.rune;
    $("worldLocationDial").querySelectorAll(".rune-socket").forEach(function(button){
      var selected=button.dataset.location===loc.id;
      button.classList.toggle("selected",selected);
      button.setAttribute("aria-pressed",String(selected));
    });
    if(inArchive){
      $("realmEyebrow").textContent=state.viewAll?"NEXUS ARCHIVE · ALL LOCATIONS":"DESTINATION "+String(index+1).padStart(2,"0")+" / 07";
      $("realmName").textContent=state.viewAll?"THE TEN FUTURE RELICS":loc.name;
      $("realmDescription").textContent=state.viewAll?"Showing every surviving object across all seven destinations.":loc.description;
      $("worldAll").textContent=state.viewAll?"SHOW THIS LOCATION":"VIEW ALL REMAINING RELICS";
    }
  }
  function renderDial() {
    $("worldLocationDial").querySelectorAll(".rune-socket").forEach(function(node){node.remove();});
    var circle=config.locations.map(function(loc,index){
      var angle=(-90+360*index/7)*Math.PI/180;
      var x=(50+39*Math.cos(angle)).toFixed(2),y=(50+39*Math.sin(angle)).toFixed(2);
      return '<button type="button" class="rune-socket'+(loc.id===state.selectedLocation?" selected":"")+(state.visited.indexOf(loc.id)>=0?" visited":"")+'" data-location="'+html(loc.id)+'" style="--x:'+x+'%;--y:'+y+'%" aria-label="Select '+html(loc.name)+'" aria-pressed="'+String(loc.id===state.selectedLocation)+'" title="'+html(loc.name)+'">'+html(loc.rune)+'</button>';
    }).join("");
    $("worldLocationDial").insertAdjacentHTML("beforeend",circle);
    renderWorld();
  }
  function chooseLocation(id) {
    if(!config.locations.some(function(loc){return loc.id===id;}))return;
    state.selectedLocation=id;
    soundCue("rune");saveSession();renderWorld();
  }
  function enterGateway() {
    if(state.scene!=="gate"||["closed","completed"].includes(state.phase)||state.paused)return;
    if(state.phase==="standby"){
      state.phase="running";state.durationMs=config.durationMinutes*60000;state.autoIntervalMs=config.autoEliminateEveryMinutes*60000;state.endsAt=Date.now()+state.durationMs;
      log("The temporal pact has begun. The countdown is sealed.");
      nextGlitch();
    }
    state.scene="path";state.walkProgress=0;
    requestScreenWake();soundCue("enter");ritualFlash("travel");
    log("The ancient gateway opens to the space between worlds.");
    saveSession();render();
  }
  function walkStep() {
    if(state.scene!=="path"||state.emergency||state.paused)return;
    state.walkProgress=Math.min(100,state.walkProgress+12);
    if(state.walkProgress>=100){state.scene="dial";soundCue("rune");stopWalking();log("An ancient runestone emerges from the void.");}else soundCue("step");
    saveSession();renderWorld();
  }
  function stopWalking() {if(walkHandle){clearInterval(walkHandle);walkHandle=null;}}
  function openDestination() {
    if(state.scene!=="dial"||state.emergency)return;
    var loc=getLocation();
    state.scene="archive";state.viewAll=false;ritualFlash("travel");soundCue("travel");
    if(state.visited.indexOf(loc.id)<0)state.visited.push(loc.id);
    log("The stone reveals "+loc.name+".");
    saveSession();render();toast("Destination opened: "+loc.name);
  }
  function returnToDial() {
    if(state.emergency)return;
    state.scene="dial";state.viewAll=false;
    soundCue("rune");saveSession();render();
  }
  function toggleArchiveView() {
    if(state.scene!=="archive"||state.emergency)return;
    state.viewAll=!state.viewAll;
    saveSession();render();
  }
  function restoreJourneyAfterEmergency() {
    if(!state.preEmergencyScene)return;
    state.scene=state.preEmergencyScene;
    state.viewAll=!!state.preEmergencyViewAll;
    if(activeObjects().length===1){state.scene="archive";state.viewAll=true;}
    state.preEmergencyScene=null;
    state.preEmergencyViewAll=false;
  }

  function render() {renderGrid();renderDial();renderTelemetry();renderEnding();renderSessionAdmin();}
  function closeGameplayDialogs() {if($("confirmDialog").open)$("confirmDialog").close();if($("objectDialog").open)$("objectDialog").close();pendingConfirm=null;}
  function openObject(id) {
    if(state.phase==="closed"||state.phase==="completed")return;
    var obj=activeObjects().find(function(o){return o.id===id;});
    if(!obj)return;
    selectedId=id;
    $("detailCode").textContent="// "+obj.id.toUpperCase().replace(/[^A-Z0-9-]/g,"").slice(0,25);
    $("detailVisual").innerHTML=mediaMarkup(obj);
    $("detailTitle").textContent=obj.name;
    $("detailDescription").textContent=obj.description;
    $("detailBenefit").textContent=obj.benefit||"Unknown";
    $("detailLimitation").textContent=obj.limitation||"Unknown";
    $("detailConsequence").textContent=obj.consequence||"The consequences are not yet known.";
    var canPlay=state.phase==="running"&&!state.paused;
    var last=activeObjects().length===1;
    $("destroyRequest").hidden=last;
    $("destroyRequest").disabled=!canPlay;
    $("finalRequest").hidden=!last;
    $("finalRequest").disabled=!canPlay||!!state.emergency;
    $("detailNote").textContent=!canPlay?"The crossing must be awakened before this relic can be sacrificed.":last?"THE LAST RELIC: its fate must be sealed, not destroyed.":state.emergency?"THE VEIL IS BREAKING — a sacrifice is required before time runs out.":"A destroyed relic cannot return to this timeline.";
    $("objectDialog").showModal();
  }
  function askConfirm(title,body,action,kind) {
    pendingConfirm=action;
    $("confirmTitle").textContent=title;
    $("confirmBody").textContent=body;
    $("confirmAccept").textContent=kind==="final"?"CONFIRM FINAL SELECTION":"DESTROY";
    $("confirmAccept").className="button "+(kind==="final"?"primary":"destroy");
    $("confirmIcon").textContent=kind==="final"?"✦":"⚠";
    if($("objectDialog").open)$("objectDialog").close();
    $("confirmDialog").showModal();
  }
  function destroy(id,reason) {
    if(state.phase!=="running"||state.paused)return toast("Transmission is not active.");
    var current=activeObjects();
    if(current.length<=1)return toast("The final candidate cannot be destroyed.");
    var obj=current.find(function(o){return o.id===id;});
    if(!obj)return toast("That object is no longer available.");
    state.lost.push({id:id,reason:reason||"PLAYER CHOICE",at:Date.now()});
    soundCue("destroy");ritualFlash("destroy");
    log(obj.name+" destroyed // "+(reason||"PLAYER CHOICE"));
    if(state.emergency){state.emergency=null;restoreJourneyAfterEmergency();log("Emergency sacrifice accepted. Portal stabilised.");}
    if(activeObjects().length===1){state.scene="archive";state.viewAll=true;log("The last relic endures. Fate awaits a final choice.");}
    saveSession();render();
    toast(obj.name+" removed from archive.");
  }
  function finalise(id) {
    if(state.phase!=="running"||state.paused||state.emergency)return toast("Cannot finalise during an inactive or unstable connection.");
    var all=activeObjects();
    if(all.length!==1||all[0].id!==id)return toast("Only the last surviving object may be retained.");
    state.phase="completed";state.finalId=id;log(all[0].name+" retained. Transmission complete.");releaseScreenWake();soundCue("final");ritualFlash("success");
    saveSession();closeGameplayDialogs();render();
  }
  function randomised(items) {
    var arr=items.slice();
    for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=arr[i];arr[i]=arr[j];arr[j]=tmp;}
    return arr;
  }
  function failEmergency() {
    if(!state.emergency)return;
    var active=activeObjects(),count=Math.min(config.failureDestroyCount,Math.max(0,active.length-1));
    randomised(active).slice(0,count).forEach(function(o){state.lost.push({id:o.id,reason:"AUTOMATED SYSTEM FAILURE",at:Date.now()});log(o.name+" erased by temporal backlash.");});
    state.emergency=null;restoreJourneyAfterEmergency();
    soundCue("destroy");ritualFlash("warning");
    log(count?("FAILURE: "+count+" random object"+(count===1?"":"s")+" erased. Portal temporarily stable."):"FAILURE: no additional object erased.");
    saveSession();closeGameplayDialogs();render();toast("Emergency timer expired: "+count+" object(s) lost.");
  }
  function startEmergency(manual) {
    if(state.phase!=="running"||state.paused||state.emergency||activeObjects().length<=1)return;
    stopGlitch();
    state.preEmergencyScene=state.scene;
    state.preEmergencyViewAll=state.viewAll;
    state.scene="archive";state.viewAll=true;
    state.emergency={endsAt:Date.now()+config.emergencySeconds*1000,remainingMs:null};
    soundCue("warning");ritualFlash("warning");
    log(manual?"Organiser triggered a critical instability.":"CRITICAL INSTABILITY — sacrifice required.");
    saveSession();closeGameplayDialogs();render();
    $("portal").classList.add("vibrating");setTimeout(function(){$("portal").classList.remove("vibrating");},1000);
  }
  function resolveEmergency() {
    if(!state.emergency)return;
    state.emergency=null;restoreJourneyAfterEmergency();soundCue("stabilise");ritualFlash("travel");log("Organiser override: portal stabilised.");saveSession();closeGameplayDialogs();render();
  }
  function checkTriggers(rem) {
    if(state.emergency||state.phase!=="running"||state.paused)return;
    var due=config.instabilityAtMinutesRemaining.filter(function(t){return rem<=t*60000&&state.fired.indexOf(t)<0;});
    if(!due.length)return;
    due.forEach(function(t){state.fired.push(t);});
    saveSession();
    if(activeObjects().length>1)startEmergency(false);
  }
  function closePortal() {
    if(state.phase!=="running")return;
    state.phase="closed";state.emergency=null;state.endsAt=Date.now();state.paused=false;
    releaseScreenWake();soundCue("close");ritualFlash("warning");
    log("Connection terminated. Temporal window sealed.");
    saveSession();closeGameplayDialogs();render();
  }
  function nextGlitch() {
    var min=config.glitchMinSeconds,max=config.glitchMaxSeconds;
    glitchNextAt=Date.now()+(min+Math.random()*(max-min))*1000;
  }
  function stopGlitch() {
    if(glitchHandle)clearTimeout(glitchHandle);
    glitchHandle=null;
    var node=$("glitchContent").querySelector("video");
    if(node)node.pause();
    $("glitchOverlay").classList.remove("show");
    $("glitchContent").innerHTML="";
  }
  function showGlitch(entry) {
    if(!entry)return;
    stopGlitch();
    var content="";
    var src=mediaUrl(entry.source);
    if(entry.type==="image"&&src)content='<img src="'+html(src)+'" alt="Temporal signal fragment">';
    if(entry.type==="video"&&src)content='<video src="'+html(src)+'" autoplay muted playsinline loop></video>';
    content+='<div class="glitch-text">'+html(entry.text||"UNKNOWN TEMPORAL SIGNAL")+'</div><div class="glitch-caption">SIGNAL INTERFERENCE // 2027</div>';
    $("glitchContent").innerHTML=content;
    $("glitchOverlay").classList.add("show");soundCue("glitch");
    if(entry.type==="video"){var v=$("glitchContent").querySelector("video");if(v){var p=v.play();if(p&&p.catch)p.catch(function(){});}}
    glitchHandle=setTimeout(stopGlitch,(entry.durationSeconds||3)*1000);
  }

  function showHourlyEvent(obj,hour) {
    $("hourlyEventName").textContent=obj.name.toUpperCase();
    $("hourlyEventHour").textContent="THE "+String(hour).padStart(2,"0")+" HOUR MARK";
    $("hourlyOverlay").hidden=false;
    if(hourlyEventHandle)clearTimeout(hourlyEventHandle);
    hourlyEventHandle=setTimeout(function(){$("hourlyOverlay").hidden=true;},4800);
  }
  function processHourlyEliminations() {
    if(state.phase!=="running"||state.paused)return false;
    var span=state.durationMs||config.durationMinutes*60000;
    var interval=state.autoIntervalMs||config.autoEliminateEveryMinutes*60000;
    if(!interval||!span)return false;
    var elapsed=Math.min(span,Math.max(0,span-remainingMs()));
    var due=Math.min(Math.floor(span/interval),Math.floor(elapsed/interval));
    if(state.hourlyProcessed>=due)return false;
    var lastVictim=null,lastHour=0;
    // Process each crossed hour exactly once; this also handles Safari suspending timers.
    while(state.hourlyProcessed<due){
      state.hourlyProcessed++;
      var choices=activeObjects();
      if(choices.length>1) {
        var victim=choices[Math.floor(Math.random()*choices.length)];
        state.lost.push({id:victim.id,reason:"THE HOURLY TOLL",hour:state.hourlyProcessed,at:Date.now()});
        state.lastHourlyLost={id:victim.id,name:victim.name,hour:state.hourlyProcessed};
        log("HOUR "+state.hourlyProcessed+" // "+victim.name+" consumed by the crossing.");
        lastVictim=victim;lastHour=state.hourlyProcessed;
      } else {
        log("HOUR "+state.hourlyProcessed+" // The last relic is protected.");
      }
    }
    if(lastVictim){
      stopGlitch();
      soundCue("destroy");ritualFlash("destroy");
      closeGameplayDialogs();
      if(state.emergency&&activeObjects().length<=1){state.emergency=null;restoreJourneyAfterEmergency();}
      if(activeObjects().length===1){state.scene="archive";state.viewAll=true;}
      showHourlyEvent(lastVictim,lastHour);
    }
    saveSession();render();
    return !!lastVictim;
  }

  function tick() {
    if(state.phase==="running"&&!state.paused){
      var rem=remainingMs();
      processHourlyEliminations();
      if(rem<=0){closePortal();return;}
      if(state.emergency&&emergencyMs()<=0){failEmergency();return;}
      if(!state.emergency)checkTriggers(rem);
      if(Date.now()>=glitchNextAt){
        if(!state.emergency&&!$("adminDialog").open&&!$("glitchOverlay").classList.contains("show")&&config.glitches.length){
          showGlitch(config.glitches[Math.floor(Math.random()*config.glitches.length)]);
        }
        nextGlitch();
      }
    }
    renderTelemetry();
    if($("adminDialog").open&&adminUnlocked)renderSessionAdmin();
  }
  function startSession() {
    if(state.phase==="running"&&!window.confirm("Restart the running session? This restores all objects and resets the timer."))return;
    $("hourlyOverlay").hidden=true;
    state=freshSession();state.phase="running";state.durationMs=config.durationMinutes*60000;state.autoIntervalMs=config.autoEliminateEveryMinutes*60000;state.endsAt=Date.now()+state.durationMs;
    requestScreenWake();
    log("Temporal connection established. Archive unlocked.");
    nextGlitch();persist();closeGameplayDialogs();render();notice("Session started.");
  }
  function pauseSession() {
    if(state.phase!=="running")return notice("Start a session first.");
    if(state.paused){state.endsAt=Date.now()+state.remainingMs;requestScreenWake();if(state.emergency)state.emergency.endsAt=Date.now()+state.emergency.remainingMs;state.paused=false;log("Transmission resumed.");}
    else{state.remainingMs=remainingMs();if(state.emergency)state.emergency.remainingMs=emergencyMs();state.paused=true;releaseScreenWake();stopGlitch();log("Transmission paused by organiser.");}
    saveSession();render();
  }
  function resetSession() {
    if(!window.confirm("Reset this game? All destroyed objects will return and the current countdown will be cleared."))return;
    state=freshSession();releaseScreenWake();stopGlitch();$("hourlyOverlay").hidden=true;saveSession();closeGameplayDialogs();render();notice("Session reset. Ready for a new performance.");
  }
  function renderSessionAdmin() {
    if(!$("adminContent")||!adminUnlocked)return;
    var items=activeObjects().length;
    $("sessionSummary").textContent="SCENE: "+state.scene.toUpperCase()+"  •  PHASE: "+state.phase.toUpperCase()+(state.paused?" (PAUSED)":"")+"  •  TIME LEFT: "+longTimeText(remainingMs())+"  •  HOURLY: "+state.hourlyProcessed+" / "+hourlyTotal()+"  •  ACTIVE: "+items+"  •  LOST: "+state.lost.length+(state.emergency?"  •  EMERGENCY: "+timeText(emergencyMs()):"");
    $("adminHistory").innerHTML=state.log.length?state.log.map(function(entry){return "<p>"+html(entry.time)+" — "+html(entry.text)+"</p>";}).join(""):"<p>No events recorded yet.</p>";
    $("sessionPause").disabled=state.phase!=="running";
    $("sessionInstability").disabled=state.phase!=="running"||state.paused||!!state.emergency||items<=1;
    $("sessionStabilise").disabled=!state.emergency;
  }
  function showAdmin() {
    $("adminDialog").showModal();
    $("adminLock").hidden=adminUnlocked;
    $("adminContent").hidden=!adminUnlocked;
    $("adminPin").value="";$("pinError").textContent="";
    if(adminUnlocked){renderEditors();renderSessionAdmin();}
  }
  function unlockAdmin() {
    if($("adminPin").value!==config.adminPin){$("pinError").textContent="INVALID ACCESS CODE";return;}
    adminUnlocked=true;$("adminLock").hidden=true;$("adminContent").hidden=false;
    $("pinError").textContent="";renderEditors();renderSessionAdmin();setTab("session");
  }
  function setTab(tab) {
    document.querySelectorAll(".admin-tab").forEach(function(b){b.classList.toggle("active",b.dataset.tab===tab);});
    document.querySelectorAll(".admin-panel").forEach(function(p){p.hidden=p.dataset.panel!==tab;});
  }
  function renderEditors() {renderLocationEditor();renderObjectEditor();renderGlitchEditor();renderSettingsEditor();}

  function renderLocationEditor() {
    var selector=$("locationSelect");
    if(!config.locations.some(function(l){return l.id===selectedLocEditor;}))selectedLocEditor=config.locations[0].id;
    selector.innerHTML=config.locations.map(function(l,i){return '<option value="'+html(l.id)+'">'+String(i+1).padStart(2,"0")+' — '+html(l.name)+'</option>';}).join("");
    selector.value=selectedLocEditor;
    var l=config.locations.find(function(x){return x.id===selectedLocEditor;});
    $("locName").value=l.name;$("locRune").value=l.rune;$("locDescription").value=l.description;$("locColour").value=l.colour;
  }
  function saveLocation() {
    var l=config.locations.find(function(x){return x.id===selectedLocEditor;});
    if(!l)return;
    l.name=$("locName").value.trim().slice(0,55)||l.name;
    l.rune=$("locRune").value.trim().slice(0,5)||l.rune;
    l.description=$("locDescription").value.trim().slice(0,260);
    l.colour=/^#[0-9a-fA-F]{6}$/.test($("locColour").value)?$("locColour").value:l.colour;
    persist();render();renderLocationEditor();renderObjectEditor();
    notice("Destination saved. All seven runes remain available.");
  }

  function renderObjectEditor() {
    var select=$("objectSelect");
    if(!config.objects.some(function(o){return o.id===selectedObjEditor;}))selectedObjEditor=config.objects[0].id;
    select.innerHTML=config.objects.map(function(o){return '<option value="'+html(o.id)+'">'+html(o.name)+'</option>';}).join("");
    select.value=selectedObjEditor;
    var obj=config.objects.find(function(o){return o.id===selectedObjEditor;});
    if(!obj)return;
    $("objName").value=obj.name;$("objIcon").value=obj.icon;$("objDescription").value=obj.description;$("objBenefit").value=obj.benefit;$("objLimitation").value=obj.limitation;$("objConsequence").value=obj.consequence||"";$("objImage").value=obj.image;
    $("objLocation").innerHTML=config.locations.map(function(loc){return '<option value="'+html(loc.id)+'">'+html(loc.name)+'</option>';}).join("");
    $("objLocation").value=obj.locationId;
  }
  function saveObject() {
    var obj=config.objects.find(function(o){return o.id===selectedObjEditor;});if(!obj)return;
    obj.name=$("objName").value.trim().slice(0,70)||"Unknown Object";obj.icon=$("objIcon").value.trim().slice(0,12)||"✦";
    obj.description=$("objDescription").value.trim().slice(0,480);obj.benefit=$("objBenefit").value.trim().slice(0,780);obj.limitation=$("objLimitation").value.trim().slice(0,780);obj.consequence=$("objConsequence").value.trim().slice(0,780);
    var img=$("objImage").value.trim();
    if(img&&!mediaUrl(img))return notice("Invalid image URL. Use HTTPS or a relative asset path.");
    obj.image=img;
    obj.locationId=config.locations.some(function(l){return l.id===$("objLocation").value;})?$("objLocation").value:config.locations[0].id;
    persist();render();renderObjectEditor();notice("Object saved locally. Export your configuration for backup.");
  }
  function addObject() {
    if(config.objects.length>=10)return notice("The crossing already holds ten relics.");
    var id="item-"+Date.now();
    config.objects.push({id:id,locationId:config.locations[0].id,name:"Unidentified Relic",icon:"✦",description:"",benefit:"",limitation:"",consequence:"",image:""});
    selectedObjEditor=id;persist();render();renderObjectEditor();notice("New object added.");
  }
  function deleteObject() {
    if(config.objects.length<=1)return notice("At least one object must remain in the library.");
    var obj=config.objects.find(function(o){return o.id===selectedObjEditor;});if(!obj)return;
    if(!window.confirm("Remove "+obj.name+" from the entire object library?"))return;
    config.objects=config.objects.filter(function(o){return o.id!==obj.id;});
    state.lost=state.lost.filter(function(l){return l.id!==obj.id;});
    if(state.finalId===obj.id){state.finalId=null;state.phase="standby";}
    selectedObjEditor=null;persist();render();renderObjectEditor();notice("Object removed from library.");
  }
  function renderGlitchEditor() {
    var sel=$("glitchSelect");
    if(!config.glitches.some(function(g){return g.id===selectedGlitchEditor;}))selectedGlitchEditor=config.glitches.length?config.glitches[0].id:null;
    sel.innerHTML=config.glitches.map(function(g,i){return '<option value="'+html(g.id)+'">'+html(g.type.toUpperCase()+" — "+(g.text.slice(0,40)||"Glitch "+(i+1)))+'</option>';}).join("");
    if(selectedGlitchEditor)sel.value=selectedGlitchEditor;
    var g=config.glitches.find(function(o){return o.id===selectedGlitchEditor;});
    $("glitchType").value=g?g.type:"message";$("glitchDuration").value=g?g.durationSeconds:3;$("glitchText").value=g?g.text:"";$("glitchSource").value=g?g.source:"";
  }
  function saveGlitch() {
    var g=config.glitches.find(function(o){return o.id===selectedGlitchEditor;});if(!g)return notice("Add a glitch first.");
    var src=$("glitchSource").value.trim();if(src&&!mediaUrl(src))return notice("Invalid media URL. Use HTTPS or a relative asset path.");
    g.type=$("glitchType").value;g.durationSeconds=intRange($("glitchDuration").value,1,15,3);
    g.text=$("glitchText").value.trim().slice(0,260);g.source=src;
    if(g.type!=="message"&&!src)return notice("Image and video glitches require a media path.");
    persist();renderGlitchEditor();notice("Glitch content saved locally.");
  }
  function addGlitch() {
    if(config.glitches.length>=100)return notice("Glitch limit reached.");
    var g={id:"glitch-"+Date.now(),type:"message",text:"UNKNOWN SIGNAL DETECTED",source:"",durationSeconds:3};
    config.glitches.push(g);selectedGlitchEditor=g.id;persist();renderGlitchEditor();notice("Glitch added.");
  }
  function deleteGlitch() {
    if(!selectedGlitchEditor)return;
    config.glitches=config.glitches.filter(function(g){return g.id!==selectedGlitchEditor;});
    selectedGlitchEditor=null;persist();renderGlitchEditor();notice("Glitch deleted.");
  }
  function renderSettingsEditor() {
    $("setTitle").value=config.title;$("setDuration").value=config.durationMinutes;$("setAutoInterval").value=config.autoEliminateEveryMinutes;$("setEmergency").value=config.emergencySeconds;
    $("setThresholds").value=config.instabilityAtMinutesRemaining.join(", ");
    $("setFailureCount").value=config.failureDestroyCount;$("setGlitchMin").value=config.glitchMinSeconds;$("setGlitchMax").value=config.glitchMaxSeconds;$("setPin").value=config.adminPin;
  }
  function saveSettings() {
    var proposed=clone(config);
    proposed.title=$("setTitle").value.trim();proposed.durationMinutes=$("setDuration").value;proposed.autoEliminateEveryMinutes=$("setAutoInterval").value;
    proposed.emergencySeconds=$("setEmergency").value;proposed.failureDestroyCount=$("setFailureCount").value;
    proposed.glitchMinSeconds=$("setGlitchMin").value;proposed.glitchMaxSeconds=$("setGlitchMax").value;
    proposed.instabilityAtMinutesRemaining=$("setThresholds").value.split(",").map(function(x){return Number(x.trim());});
    proposed.adminPin=$("setPin").value.trim();
    try{config=normalizeConfig(proposed);}catch(e){return notice(e.message);}
    persist();render();renderSettingsEditor();notice("Settings saved. Duration changes apply from the next session.");
  }
  function downloadConfig() {
    var blob=new Blob([JSON.stringify({version:1,config:config},null,2)],{type:"application/json"});
    var url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="1473-2027-portal-config.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},2000);
    notice("Configuration file exported.");
  }
  function importConfig(file) {
    if(!file)return;
    if(!window.confirm("Import configuration? The current session will be reset. Export first if you need to keep your changes."))return;
    var reader=new FileReader();
    reader.onload=function(){
      try{var parsed=JSON.parse(reader.result);var imported=normalizeConfig(parsed.config||parsed);config=imported;state=freshSession();adminUnlocked=false;persist();stopGlitch();render();$("adminDialog").close();notice("Configuration imported. Reopen organiser controls with its configured PIN.");}
      catch(e){notice("Import failed: "+e.message);}
    };
    reader.onerror=function(){notice("Unable to read the selected configuration file.");};
    reader.readAsText(file);$("configImport").value="";
  }
  function wireEvents() {
    $("worldEnter").addEventListener("click",enterGateway);
    $("soundToggle").addEventListener("click",toggleSound);
    $("worldWalk").addEventListener("pointerdown",function(e){
      if(e.pointerType==="mouse"&&e.button!==0)return;
      e.preventDefault();
      lastPointerWalkAt=Date.now();
      walkStep();stopWalking();
      if(state.scene==="path")walkHandle=setInterval(walkStep,260);
    });
    ["pointerup","pointercancel","pointerleave","lostpointercapture"].forEach(function(evt){
      $("worldWalk").addEventListener(evt,stopWalking);
    });
    $("worldWalk").addEventListener("click",function(){if(Date.now()-lastPointerWalkAt>430)walkStep();});
    document.addEventListener("keydown",function(e){
      if(state.scene!=="path"||$("adminDialog").open||$("objectDialog").open||$("confirmDialog").open)return;
      if(e.target&&["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName))return;
      if(e.key==="ArrowUp"||e.key.toLowerCase()==="w"){e.preventDefault();walkStep();}
    });

    var touchOrigin=null;
    $("worldStage").addEventListener("touchstart",function(e){
      if(!e.changedTouches||!e.changedTouches[0])return;
      touchOrigin={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};
    },{passive:true});
    $("worldStage").addEventListener("touchend",function(e){
      if(!touchOrigin||!e.changedTouches||!e.changedTouches[0])return;
      var dx=e.changedTouches[0].clientX-touchOrigin.x,dy=e.changedTouches[0].clientY-touchOrigin.y;
      touchOrigin=null;
      if(state.scene==="path"&&dy< -55&&Math.abs(dy)>Math.abs(dx)*1.25){walkStep();walkStep();}
      if(state.scene==="dial"&&Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5){
        var index=config.locations.findIndex(function(l){return l.id===state.selectedLocation;});
        chooseLocation(config.locations[(index+(dx<0?1:6))%7].id);
      }
    },{passive:true});
    $("worldLocationDial").addEventListener("click",function(e){
      var rune=e.target.closest("[data-location]");
      if(rune)chooseLocation(rune.dataset.location);
    });
    $("worldTravel").addEventListener("click",openDestination);
    $("worldBackPath").addEventListener("click",function(){if(!state.emergency){state.scene="path";state.walkProgress=70;saveSession();render();}});
    $("worldReturn").addEventListener("click",returnToDial);
    $("worldAll").addEventListener("click",toggleArchiveView);
    $("objectGrid").addEventListener("click",function(e){var card=e.target.closest("[data-object]");if(card)openObject(card.dataset.object);});
    $("detailClose").addEventListener("click",function(){$("objectDialog").close();});
    $("detailBack").addEventListener("click",function(){$("objectDialog").close();});
    $("destroyRequest").addEventListener("click",function(){
      var obj=activeObjects().find(function(o){return o.id===selectedId;});if(!obj)return;
      askConfirm("CONFIRM DESTRUCTION","Destroy "+obj.name+"? This removes it from the active archive for the rest of the session.",function(){destroy(obj.id,"PLAYER CHOICE");},"destroy");
    });
    $("finalRequest").addEventListener("click",function(){
      var obj=activeObjects().find(function(o){return o.id===selectedId;});if(!obj)return;
      askConfirm("RETAIN FINAL OBJECT","Secure "+obj.name+" as the single object carried back to 1473? This concludes the transmission.",function(){finalise(obj.id);},"final");
    });
    $("confirmCancel").addEventListener("click",function(){$("confirmDialog").close();pendingConfirm=null;});
    $("confirmAccept").addEventListener("click",function(){var fn=pendingConfirm;$("confirmDialog").close();pendingConfirm=null;if(fn)fn();});
    $("adminOpen").addEventListener("click",showAdmin);
    $("endingAdmin").addEventListener("click",showAdmin);
    $("adminClose").addEventListener("click",function(){$("adminDialog").close();});
    $("adminUnlock").addEventListener("click",unlockAdmin);
    $("adminPin").addEventListener("keydown",function(e){if(e.key==="Enter")unlockAdmin();});
    document.querySelectorAll(".admin-tab").forEach(function(b){b.addEventListener("click",function(){setTab(b.dataset.tab);});});
    $("sessionStart").addEventListener("click",startSession);
    $("sessionPause").addEventListener("click",pauseSession);
    $("sessionInstability").addEventListener("click",function(){startEmergency(true);});
    $("sessionStabilise").addEventListener("click",resolveEmergency);
    $("sessionGlitch").addEventListener("click",function() {
      if(!config.glitches.length)return notice("Add a glitch first.");
      var g=config.glitches[Math.floor(Math.random()*config.glitches.length)];
      $("adminDialog").close();showGlitch(g);
    });
    $("sessionAdvance").addEventListener("click",function() {
      if(state.phase!=="running"||state.paused)return notice("Run the session before advancing time.");
      state.endsAt-=60000;saveSession();tick();render();
    });
    $("sessionReset").addEventListener("click",resetSession);
    $("objectSelect").addEventListener("change",function(e){selectedObjEditor=e.target.value;renderObjectEditor();});
    $("locationSelect").addEventListener("change",function(e){selectedLocEditor=e.target.value;renderLocationEditor();});
    $("locationSave").addEventListener("click",saveLocation);
    $("objectAdd").addEventListener("click",addObject);
    $("objectSave").addEventListener("click",saveObject);
    $("objectDelete").addEventListener("click",deleteObject);
    $("glitchSelect").addEventListener("change",function(e){selectedGlitchEditor=e.target.value;renderGlitchEditor();});
    $("glitchAdd").addEventListener("click",addGlitch);
    $("glitchSave").addEventListener("click",saveGlitch);
    $("glitchDelete").addEventListener("click",deleteGlitch);
    $("glitchPreview").addEventListener("click",function(){
      var g=config.glitches.find(function(x){return x.id===selectedGlitchEditor;});if(!g)return notice("Select a glitch.");
      $("adminDialog").close();showGlitch(g);
    });
    $("settingsSave").addEventListener("click",saveSettings);
    $("configExport").addEventListener("click",downloadConfig);
    $("configImport").addEventListener("change",function(e){importConfig(e.target.files[0]);});
    $("confirmDialog").addEventListener("close",function(){pendingConfirm=null;});
    window.addEventListener("storage",function(event){
      if(event.key===SESSION_KEY){state=loadSession();closeGameplayDialogs();render();}
      if(event.key===CONFIG_KEY){try{config=normalizeConfig(readStored(CONFIG_KEY));render();}catch(e){}}
    });
    document.addEventListener("visibilitychange",function(){if(!document.hidden){tick();requestScreenWake();}});
  }
  wireEvents();
  nextGlitch();
  persist();
  render();
  tick();
  setInterval(tick,250);
  if("serviceWorker" in navigator && location.protocol==="https:") {
    window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(){});});
  }
})();
