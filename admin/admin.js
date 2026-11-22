/* Organiser-only mobile control centre. Keeper secret never appears in player code or URLs. */
(() => {
  "use strict";
  const API="https://mmheljndcdhzzuobjaxz.supabase.co/functions/v1/larp-portal";
  const $=id=>document.getElementById(id);
  const STORE="larp_keeper_session";
  let secret="",snapshot=null,updatedAt=0,working=false,refreshing=false;
  const safeImage=src=>typeof src==="string"&&/^\.\/assets\/objects\/[a-z0-9-]+\.svg$/i.test(src)?"../"+src.slice(2):"";
  function message(msg,auth=false){$(auth?"authFeedback":"feedback").textContent=msg;}
  function setConnection(yes){$("connection").classList.toggle("online",yes);$("connection").classList.toggle("offline",!yes);$("connection").title=yes?"Connected to portal":"Connection unavailable";}
  function format(sec){
    const n=Math.max(0,Math.ceil(Number(sec)||0)),h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=n%60;
    return [h,m,s].map(x=>String(x).padStart(2,"0")).join(":");
  }
  function countdown(){
    if(!snapshot||!snapshot.session)return;
    const s=snapshot.session,delta=s.status==="running"?(performance.now()-updatedAt)/1000:0;
    $("sessionTimer").textContent=format(s.remaining_seconds-delta);
    $("nextLoss").textContent=s.next_elimination_seconds==null?"—":format(s.next_elimination_seconds-delta);
  }
  function switchAuth(ok){
    $("loginView").hidden=ok;$("dashboard").hidden=!ok;
    if(!ok){$("accessCode").value="";$("accessCode").focus();}
  }
  function explainEvent(e,items){
    const name=items.get(e.item_id)||"Unknown relic";
    switch(e.kind){
      case "hourly":return "Hour "+e.hour_number+" — "+name+" vanished";
      case "bonus":return "Double hour "+e.hour_number+" — "+name+" vanished";
      case "restore":return name+" restored to play";
      case "manual":return name+" manually eliminated";
      case "start":return "Seven-hour crossing began";
      case "pause":return "The portal clock was paused";
      case "resume":return "The portal clock resumed";
      case "scene":return "iPad recalled to the opening portal";
      case "end":return "Seven-hour window closed";
      default:return e.kind;
    }
  }
  function render(data){
    if(!data||!data.session||!Array.isArray(data.relics))return;
    snapshot=data;updatedAt=performance.now();setConnection(true);
    const s=data.session,admin=data.admin||{},running=s.status==="running";
    $("phaseBadge").textContent=s.status.toUpperCase();
    $("phaseBadge").className="phase "+s.status;
    $("doubleHour").textContent=admin.bonus_hour?"HOUR "+String(admin.bonus_hour).padStart(2,"0"):"SEALED";
    $("startBtn").disabled=s.status!=="ready"||working;
    $("pauseBtn").disabled=s.status!=="running"||working;
    $("resumeBtn").disabled=s.status!=="paused"||working;
    $("resetBtn").disabled=working;
    $("resetViewBtn").disabled=working;
    const marks=$("hourMarks");marks.replaceChildren();
    for(let hour=1;hour<=7;hour++){
      const div=document.createElement("div");
      div.className="hour-mark"+(hour<=s.processed_hours?" done":"")+(admin.bonus_hour===hour?" double":"");
      const icon=document.createElement("span");icon.className="icon";icon.textContent=hour<=s.processed_hours?"◆":"◇";
      div.append(icon,document.createTextNode(String(hour)));
      marks.appendChild(div);
    }
    const alive=data.relics.filter(r=>r.active).length;
    $("relicCounter").textContent=alive+" / 9 SURVIVING";
    const list=$("relicList");list.replaceChildren();
    data.relics.forEach(item=>{
      const row=document.createElement("div");row.className="relic-row"+(item.active?"":" eliminated");
      const img=document.createElement("img");img.src="../assets/objects-photography/"+item.id+".webp";img.alt="";
      const info=document.createElement("div");info.className="relic-info";
      const strong=document.createElement("strong");strong.textContent=item.name;
      const small=document.createElement("small");small.textContent=item.active?"IN THE CROSSING":"ELIMINATED";
      info.append(strong,small);
      const button=document.createElement("button");button.type="button";
      button.className="mini-btn"+(item.active?"":" restore");
      button.textContent=item.active?"ELIMINATE":"RESTORE";button.disabled=working||(item.active&&alive<=1);
      button.addEventListener("click",()=>{
        const action=item.active?"eliminate":"restore";
        if(action==="eliminate"&&!window.confirm("Eliminate "+item.name+" now?"))return;
        send(action,item.id);
      });
      row.append(img,info,button);list.appendChild(row);
    });
    const eventList=$("eventList");eventList.replaceChildren();
    const items=new Map(data.relics.map(i=>[i.id,i.name]));
    const events=data.events||[];
    if(!events.length){const empty=document.createElement("p");empty.className="event-empty";empty.textContent="The crossing has not begun.";eventList.appendChild(empty);}
    events.forEach(e=>{
      const div=document.createElement("div");div.className="event-row"+(["hourly","bonus","manual"].includes(e.kind)?" elimination":e.kind==="restore"?" restore":"");
      const time=document.createElement("time");
      try{time.textContent=new Date(e.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});}catch{time.textContent="—";}
      const label=document.createElement("span");label.textContent=explainEvent(e,items);
      div.append(time,label);eventList.appendChild(div);
    });
    countdown();
  }
  async function request(command,item_id){
    const res=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",
      body:JSON.stringify({action:"admin",command,secret,item_id:item_id||null}),
      signal:AbortSignal.timeout(11000)});
    const json=await res.json().catch(()=>({ok:false,error:"Invalid response"}));
    if(!res.ok||!json.ok){
      const e=new Error(json.error||"Control request failed");
      e.denied=res.status===401;
      throw e;
    }
    return json;
  }
  async function login(code){
    if(working)return;
    secret=code;working=true;
    message("Connecting to the crossing…",true);
    try{
      const data=await request("login");
      sessionStorage.setItem(STORE,secret);
      switchAuth(true);render(data);message("",true);message("");
    }catch(e){
      setConnection(false);secret="";sessionStorage.removeItem(STORE);switchAuth(false);
      message(e.denied?"Access code not recognised.":"Connection unavailable. Check network and retry.",true);
    }finally{working=false;}
  }
  async function send(command,item_id){
    if(working||!secret)return;
    if(command==="reset"&&!window.confirm("Reset the entire seven-hour LARP? All nine relics will return and the timer will restart from READY."))return;
    if(command==="start"&&!window.confirm("Start the seven-hour clock now? The randomly chosen double hour will be locked in."))return;
    if(command==="reset_scene"&&!window.confirm("Return the iPad to its opening portal? This does not reset the clock."))return;
    working=true;message("Applying "+command.replace("_"," ")+"…");
    try{const data=await request(command,item_id);render(data);message("Updated.");}
    catch(e){
      if(e.denied){secret="";sessionStorage.removeItem(STORE);switchAuth(false);message("Access expired. Unlock again.",true);}
      else message("Could not apply change. Check connection, then retry.");
      setConnection(false);
    }finally{working=false;}
  }
  async function poll(){
    if(!secret||refreshing||working)return;
    refreshing=true;
    try{
      const data=await request("login");
      render(data);
    }catch(e){
      setConnection(false);
      if(e.denied){secret="";sessionStorage.removeItem(STORE);switchAuth(false);message("Access expired. Unlock again.",true);}
    }finally{refreshing=false;}
  }
  $("loginForm").addEventListener("submit",e=>{
    e.preventDefault();login($("accessCode").value.trim());
  });
  $("logout").addEventListener("click",()=>{
    secret="";sessionStorage.removeItem(STORE);snapshot=null;switchAuth(false);message("");
  });
  for(const [id,cmd] of [["startBtn","start"],["pauseBtn","pause"],["resumeBtn","resume"],
    ["resetBtn","reset"],["resetViewBtn","reset_scene"]]){
    $(id).addEventListener("click",()=>send(cmd));
  }
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)poll();});
  window.addEventListener("online",poll);
  setInterval(poll,2800);setInterval(countdown,250);
  const saved=sessionStorage.getItem(STORE);
  if(saved)login(saved);
  else switchAuth(false);
})();
