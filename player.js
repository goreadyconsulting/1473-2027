/* The Crossing — iPad player experience. No visible UI copy or admin controls. */
(() => {
  "use strict";
  const API = "https://mmheljndcdhzzuobjaxz.supabase.co/functions/v1/larp-portal";
  const $ = id => document.getElementById(id);
  const stages = ["portal","walk","slab","reel","place","relic"];
  let scene="portal",snapshot=null,runId=null,journeyVersion=null,seenEventId=null,placeId=null,focusId=null;
  let stepCount=0,reelTimeouts=[],lossQueue=[],lossBusy=false,reelInFlight=false,updating=false;
  let audio=null,wakeLock=null,frameRequest=0,lastFrame=0,portalDrawWidth=0,portalDrawHeight=0;
  const canvas=$("portalCanvas"),ctx=canvas.getContext("2d",{alpha:false});
  const deviceCap=()=>Math.min(window.devicePixelRatio||1,1.5);
  function localImage(src){return typeof src==="string"&&/^\.\/assets\/[a-z0-9_\/.-]+\.svg$/i.test(src)?src:"";}
  function stage(next){
    if(!stages.includes(next))return;
    if(scene==="reel"&&next!=="reel")cancelReel();
    scene=next;
    stages.forEach(x=>$(x+"Stage").classList.toggle("active",x===next));
    if(next==="place")renderPlace();
    if(next==="slab")renderSlab();
    if(next==="portal"){$("finalOverlay").hidden=true;}
    try{sessionStorage.setItem("larp_scene",next);}catch{}
    if(next==="portal")resizeCanvas();
  }
  function initAudio(){
    if(audio)return;
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    try{audio=new Audio();if(audio.state==="suspended")audio.resume().catch(()=>{});}catch{audio=null;}
  }
  function footstep(){
    initAudio();if(!audio)return;
    try{
      const t=audio.currentTime,duration=.16,sz=Math.floor(audio.sampleRate*duration);
      const buffer=audio.createBuffer(1,sz,audio.sampleRate),arr=buffer.getChannelData(0);
      for(let i=0;i<sz;i++){const env=Math.pow(1-i/sz,2.5);arr[i]=(Math.random()*2-1)*env;}
      const src=audio.createBufferSource();src.buffer=buffer;
      const lowpass=audio.createBiquadFilter();lowpass.type="lowpass";lowpass.frequency.value=290;
      const env=audio.createGain();env.gain.setValueAtTime(.001,t);env.gain.linearRampToValueAtTime(.065,t+.018);env.gain.exponentialRampToValueAtTime(.0001,t+duration);
      src.connect(lowpass);lowpass.connect(env);env.connect(audio.destination);
      src.start(t);src.stop(t+duration);
      src.onended=()=>{try{src.disconnect();lowpass.disconnect();env.disconnect();}catch{}};
    }catch{}
  }
  function chord(tones=[138.6,207.65,277.18],vol=.04,long=.9){
    initAudio();if(!audio)return;
    const now=audio.currentTime;
    tones.forEach((hz,i)=>{try{
      const o=audio.createOscillator(),g=audio.createGain();
      o.type=i%2?"triangle":"sine";o.frequency.value=hz;
      g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(vol/(i+1),now+.07);
      g.gain.exponentialRampToValueAtTime(.0001,now+long);
      o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+long+.02);
      o.onended=()=>{o.disconnect();g.disconnect();};
    }catch{}});
  }
  async function keepAwake(){
    if(!("wakeLock" in navigator)||document.hidden||wakeLock)return;
    try{wakeLock=await navigator.wakeLock.request("screen");wakeLock.addEventListener("release",()=>{wakeLock=null;});}catch{}
  }
  function releaseWake(){if(wakeLock){wakeLock.release().catch(()=>{});wakeLock=null;}}
  function enter(){
    if(scene!=="portal")return;
    chord([110,164.8,220],.037,1.8);
    keepAwake();stepCount=0;updateWalk();
    stage("walk");
  }
  function updateWalk(){
    const progress=Math.min(1,stepCount/12);
    $("walkPath").style.setProperty("--walk-scale",String(1+.62*progress));
    $("walkPath").style.setProperty("--step-shift",String(-8*progress)+"px");
    $("walkMonolith").style.setProperty("--monolith-scale",String(.31+2.3*progress));
  }
  function walk(){
    if(scene!=="walk")return;
    stepCount=Math.min(12,stepCount+1);
    footstep();updateWalk();
    const camera=$("walkCamera");camera.classList.remove("stepping");void camera.offsetWidth;camera.classList.add("stepping");
    if(stepCount>=12){setTimeout(()=>{if(scene==="walk"){chord([155.6,233.1,311.1],.05,1.3);stage("slab");}},330);}
  }
  function renderSlab(){
    const wheel=$("runeWheel");
    if(!snapshot||!Array.isArray(snapshot.places))return;
    wheel.replaceChildren();
    snapshot.places.forEach((loc,i)=>{
      const rad=(-90+i*360/7)*Math.PI/180;
      const b=document.createElement("button");b.type="button";b.className="rune-socket";
      b.style.setProperty("--x",(50+32*Math.cos(rad)).toFixed(2)+"%");
      b.style.setProperty("--y",(50+32*Math.sin(rad)).toFixed(2)+"%");
      b.setAttribute("aria-label",loc.name);b.textContent=loc.rune||"ᛟ";
      b.addEventListener("click",e=>{e.stopPropagation();choose(loc.id);});
      wheel.appendChild(b);
    });
  }
  function cancelReel(){for(const t of reelTimeouts)clearTimeout(t);reelTimeouts=[];reelInFlight=false;}
  function choose(id){
    if(!snapshot||!snapshot.places.some(x=>x.id===id))return;
    placeId=id;chord([196,293.66,392],.037,.95);
    stage("reel");startReel();
  }
  function startReel(){
    cancelReel();reelInFlight=true;
    const loc=snapshot&&snapshot.places.find(x=>x.id===placeId);
    if(!loc){stage("slab");return;}
    const shots=Array.isArray(loc.stills)&&loc.stills.length?loc.stills:[loc.background];
    const image=$("reelImage");
    const show=(index)=>{
      if(scene!=="reel")return;
      image.classList.remove("changing");void image.offsetWidth;
      image.src=localImage(shots[index%shots.length])||"./assets/realms/iron.svg";
      image.classList.add("changing");
    };
    show(0);
    shots.slice(1,3).forEach((_,i)=>reelTimeouts.push(setTimeout(()=>show(i+1),(i+1)*1550)));
    reelTimeouts.push(setTimeout(()=>{if(scene==="reel"){reelInFlight=false;stage("place");}},Math.min(3,shots.length)*1550+400));
  }
  function renderPlace(){
    const loc=snapshot&&snapshot.places.find(p=>p.id===placeId);
    if(!loc){stage("slab");return;}
    $("placeBackground").style.backgroundImage='url("'+(localImage(loc.background)||"./assets/realms/iron.svg")+'")';
    const gallery=$("relicGallery");gallery.replaceChildren();
    const relics=(snapshot.relics||[]).filter(o=>o.active&&o.place_id===placeId);
    relics.forEach(item=>{
      const b=document.createElement("button");b.type="button";b.className="relic-card";
      b.setAttribute("aria-label",item.name);
      const img=document.createElement("img");img.alt="";img.src=localImage(item.image)||"";img.loading="eager";
      b.appendChild(img);b.addEventListener("click",()=>openRelic(item.id));
      gallery.appendChild(b);
    });
  }
  function openRelic(id){
    const item=snapshot&&snapshot.relics.find(r=>r.id===id&&r.active);
    if(!item)return;
    focusId=id;chord([220,330,440],.02,.55);
    $("relicHero").src=localImage(item.image)||"";stage("relic");
  }
  function closeRelic(){if(scene==="relic"){focusId=null;stage("place");}}
  function queueLosses(events){
    const ids=new Set(lossQueue.map(e=>e.id));
    events.forEach(e=>{if(!ids.has(e.id))lossQueue.push(e);});
    if(!lossBusy)playLoss();
  }
  function playLoss(){
    if(lossBusy||!lossQueue.length)return;
    const e=lossQueue.shift(),item=snapshot&&snapshot.relics.find(r=>r.id===e.item_id);
    if(!item){playLoss();return;}
    lossBusy=true;
    const overlay=$("lossOverlay");
    $("lossRelic").src=localImage(item.image)||"";
    overlay.hidden=false;overlay.classList.remove("active");void overlay.offsetWidth;overlay.classList.add("active");
    chord([74,92.5,110],.067,2.1);
    setTimeout(()=>{
      overlay.hidden=true;overlay.classList.remove("active");
      lossBusy=false;
      if(scene==="place")renderPlace();
      if(scene==="relic"&&item.id===focusId){focusId=null;stage("place");}
      if(lossQueue.length)setTimeout(playLoss,250);
    },3300);
  }
  function finalizeIfNeeded(){
    if(!snapshot||!snapshot.session||snapshot.session.status!=="ended"){$("finalOverlay").hidden=true;return;}
    const alive=snapshot.relics.filter(x=>x.active);
    if(alive.length!==1)return;
    if(!lossBusy&&!lossQueue.length){
      $("finalRelic").src=localImage(alive[0].image)||"";
      $("finalOverlay").hidden=false;releaseWake();
    } else setTimeout(finalizeIfNeeded,4200);
  }
  function onSnapshot(s){
    if(!s||!s.session||!Array.isArray(s.relics)||!Array.isArray(s.places))return;
    const newRun=runId!==null&&runId!==s.session.run_id;
    const sceneReset=journeyVersion!==null&&journeyVersion!==s.session.journey_version;
    snapshot=s;
    if(newRun||sceneReset){
      cancelReel();lossQueue=[];lossBusy=false;$("lossOverlay").hidden=true;$("finalOverlay").hidden=true;
      focusId=null;placeId=null;stepCount=0;seenEventId=null;stage("portal");
    }
    runId=s.session.run_id;journeyVersion=s.session.journey_version;
    const sorted=(s.events||[]).slice().sort((a,b)=>Number(a.id)-Number(b.id));
    if(seenEventId===null){
      seenEventId=sorted.length?Number(sorted[sorted.length-1].id):0;
    } else {
      const fresh=sorted.filter(e=>Number(e.id)>seenEventId);
      if(fresh.length)seenEventId=Number(fresh[fresh.length-1].id);
      const losses=fresh.filter(e=>["hourly","bonus","manual"].includes(e.kind));
      if(losses.length)queueLosses(losses);
    }
    if(scene==="place")renderPlace();
    if(scene==="slab")renderSlab();
    if(scene==="relic"&&!s.relics.some(x=>x.id===focusId&&x.active)){focusId=null;stage("place");}
    if(s.session.status==="ended")finalizeIfNeeded();
    else $("finalOverlay").hidden=true;
  }
  async function sync(){
    if(updating)return;
    updating=true;
    try{
      const res=await fetch(API,{method:"GET",cache:"no-store",signal:AbortSignal.timeout(8000)});
      if(!res.ok)throw Error("offline");
      const json=await res.json();if(json.ok)onSnapshot(json);
    }catch{ /* the visual scene stays usable without visible network notices */ }
    finally{updating=false;}
  }
  function resizeCanvas(){
    if(!ctx)return;
    const r=canvas.getBoundingClientRect(),dpr=deviceCap();
    const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;portalDrawWidth=w;portalDrawHeight=h;}
  }
  const stars=Array.from({length:220},(_,i)=>({a:(i*2.399963)%6.283,r:Math.sqrt(((i*87)%223)/223),b:((i*197)%97)/97}));
  function animateVortex(time){
    frameRequest=requestAnimationFrame(animateVortex);
    if(scene!=="portal"||!ctx||time-lastFrame<31)return;
    lastFrame=time;
    resizeCanvas();
    const w=portalDrawWidth||canvas.width,h=portalDrawHeight||canvas.height;
    const cx=w/2,cy=h/2,radius=Math.max(w,h)*.77,phase=time*.00042;
    ctx.globalCompositeOperation="source-over";
    ctx.fillStyle="#020515";ctx.fillRect(0,0,w,h);
    ctx.save();ctx.translate(cx,cy);
    let outer=ctx.createRadialGradient(0,0,8,0,0,radius);
    outer.addColorStop(0,"#f4c6ff");outer.addColorStop(.035,"#d084e9");
    outer.addColorStop(.12,"#452579");outer.addColorStop(.29,"#174394");
    outer.addColorStop(.49,"#0a246b");outer.addColorStop(.81,"#030b30");outer.addColorStop(1,"#01040e");
    ctx.fillStyle=outer;ctx.fillRect(-w/2,-h/2,w,h);
    ctx.globalCompositeOperation="screen";
    for(let arm=0;arm<20;arm++){
      const angle=arm*Math.PI*2/20+phase*.32;
      for(let layer=0;layer<3;layer++){
        ctx.beginPath();
        const twist=arm%2===0?4.8:5.8;
        for(let j=0;j<=42;j++){
          const t=j/42,r=radius*(.07+.95*t);
          const theta=angle+twist*(1-t)+Math.sin(t*10+phase*2+arm)*.15+(layer-1)*.11;
          const x=Math.cos(theta)*r,y=Math.sin(theta)*r*.86;
          if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        const light=arm%5===0?290:arm%2?209:229;
        ctx.strokeStyle='hsla('+light+',100%,'+(layer===1?66:53)+'%,'+(layer===1?.37:.12)+')';
        ctx.lineWidth=(layer===1?16:37)*(w/1300)*(1+(arm%3)*.26);
        ctx.shadowBlur=layer===1?30:12;ctx.shadowColor=arm%5===0?"#df77f8":"#398bff";
        ctx.stroke();
      }
    }
    ctx.shadowBlur=0;
    for(const star of stars){
      const rr=(.12+star.r*.85)*radius;
      const th=star.a+phase*(1.05-star.r)+5*(1-star.r);
      ctx.fillStyle=star.b>.83?"rgba(255,174,242,.6)":"rgba(105,180,255,.48)";
      const size=(star.b>.89?2.5:1.2)*w/1400;
      ctx.fillRect(rr*Math.cos(th),rr*.86*Math.sin(th),size,size);
    }
    const core=ctx.createRadialGradient(0,0,0,0,0,radius*.24);
    core.addColorStop(0,"rgba(255,252,255,.99)");core.addColorStop(.12,"rgba(249,199,255,.98)");
    core.addColorStop(.37,"rgba(218,99,240,.63)");core.addColorStop(1,"rgba(141,48,221,0)");
    ctx.fillStyle=core;ctx.beginPath();ctx.arc(0,0,radius*.24,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  $("portalStage").addEventListener("pointerdown",enter);
  $("portalStage").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();enter();}});
  $("walkStage").addEventListener("pointerdown",walk);
  $("walkStage").addEventListener("keydown",e=>{if(e.key==="ArrowUp"||e.key===" "||e.key==="Enter"){e.preventDefault();walk();}});
  $("reelStage").addEventListener("pointerdown",()=>{if(scene==="reel"){cancelReel();stage("place");}});
  $("backToStone").addEventListener("click",e=>{e.stopPropagation();chord([196,294],.025,.7);stage("slab");});
  $("relicStage").addEventListener("pointerdown",closeRelic);
  window.addEventListener("resize",resizeCanvas);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden){sync();if(scene!=="portal")keepAwake();}});
  window.addEventListener("pagehide",releaseWake);
  if("serviceWorker" in navigator&&location.protocol==="https:"){
    window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{});});
  }
  resizeCanvas();animateVortex(0);sync();setInterval(sync,2600);
})();
