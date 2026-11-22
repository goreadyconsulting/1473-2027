const assert=require("node:assert/strict");
(async()=>{
 const url="https://mmheljndcdhzzuobjaxz.supabase.co/functions/v1/larp-portal";
 const res=await fetch(url,{signal:AbortSignal.timeout(14000),headers:{"Cache-Control":"no-cache"}});
 const body=await res.json();
 assert.equal(res.status,200,"public game state endpoint must return HTTP 200");
 assert.equal(body.ok,true);
 assert.equal(body.places.length,7);
 assert.equal(body.relics.length,9);
 assert.equal(body.session.duration_seconds,25200);
 const denied=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"admin",command:"login",secret:"intentionally-invalid-keeper-key"}),signal:AbortSignal.timeout(14000)});
 assert.equal(denied.status,401,"admin must reject an invalid keeper key");
 console.log("Live backend: seven places, nine items, seven-hour clock, secured admin ✓");
})().catch(e=>{console.error(e);process.exitCode=1;});
