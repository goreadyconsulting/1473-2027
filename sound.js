/* Original generative ambience. No remote audio, assets or autoplay. */
(function () {
  "use strict";
  var context=null,master=null,drones=[],enabled=false;
  function supported() {return !!(window.AudioContext||window.webkitAudioContext);}
  function create() {
    if(context||!supported())return !!context;
    var Audio=window.AudioContext||window.webkitAudioContext;
    try {
      context=new Audio();
      master=context.createGain();master.gain.value=0;
      master.connect(context.destination);
      var filter=context.createBiquadFilter();
      filter.type="lowpass";filter.frequency.value=260;filter.Q.value=.65;
      filter.connect(master);
      [55,82.41,110].forEach(function(hz,index){
        var osc=context.createOscillator(),g=context.createGain();
        osc.type=index===1?"triangle":"sine";
        osc.frequency.value=hz;
        g.gain.value=index===0?.43:index===1?.21:.13;
        osc.connect(g);g.connect(filter);osc.start();
        drones.push(osc);
      });
      return true;
    } catch(e) {context=null;return false;}
  }
  function fade(value,seconds) {
    if(!context||!master)return;
    var now=context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(value,now,Math.max(.012,seconds/4));
  }
  function cue(name) {
    if(!enabled||!context||context.state!=="running")return;
    var table={
      enter:[165,.8,.18,"sine"],step:[110,.1,.065,"triangle"],
      rune:[392,.48,.09,"sine"],travel:[196,1.3,.16,"triangle"],
      destroy:[72,1.1,.14,"sawtooth"],warning:[135,1,.16,"sawtooth"],
      stabilise:[523,.8,.12,"sine"],final:[659,2,.16,"sine"],glitch:[480,.2,.06,"square"],
      close:[70,1.8,.15,"triangle"]
    };
    var spec=table[name]||table.rune;
    try {
      var osc=context.createOscillator(),env=context.createGain();
      var t=context.currentTime;
      osc.type=spec[3];osc.frequency.setValueAtTime(spec[0],t);
      if(name==="destroy"||name==="warning"||name==="close")osc.frequency.exponentialRampToValueAtTime(Math.max(40,spec[0]/2),t+spec[1]);
      if(name==="final"||name==="travel")osc.frequency.exponentialRampToValueAtTime(spec[0]*1.5,t+spec[1]);
      env.gain.setValueAtTime(.0001,t);
      env.gain.exponentialRampToValueAtTime(spec[2],t+.035);
      env.gain.exponentialRampToValueAtTime(.0001,t+spec[1]);
      osc.connect(env);env.connect(master);
      osc.start(t);osc.stop(t+spec[1]+.05);
      osc.onended=function(){try{osc.disconnect();env.disconnect();}catch(e){}};
    }catch(e){}
  }
  function toggle() {
    if(!create())return Promise.resolve(false);
    if(enabled) {enabled=false;fade(0,.5);return Promise.resolve(false);}
    return Promise.resolve(context.resume()).then(function(){
      if(context.state!=="running")return false;
      enabled=true;fade(.09,1.4);cue("enter");return true;
    }).catch(function(){enabled=false;return false;});
  }
  window.PortalAudio={toggle:toggle,cue:cue,enabled:function(){return enabled;},supported:supported};
})();