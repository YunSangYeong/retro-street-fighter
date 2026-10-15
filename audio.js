// Short classic voice/SFX clips and CC0 impact recordings are credited in assets/audio/SOURCES.md.
export const AUDIO_FILES = Object.fromEntries([
  'ryuji-a','ryuji-s','ryuji-d','kazan-s','agni-a','agni-s','titan-a','titan-win',
  'fight','win','lose','round','one','two','three','block','hit-light','hit-medium',
  'hit-heavy','kick','ryuji-grunt-1','ryuji-grunt-2','hurt','electric'
].map(name=>[name,`classic/${name}.mp3`]));
Object.assign(AUDIO_FILES,{
  'impact-light':'impact/impact_punch_medium_000.ogg',
  'impact-medium':'impact/impact_punch_medium_001.ogg',
  'impact-heavy':'impact/impact_punch_heavy_000.ogg',
  'impact-slam':'impact/impact_punch_heavy_001.ogg',
  'impact-block':'impact/impact_metal_heavy_000.ogg'
});
export const VOICE_PROFILES={
  ryuji:{pitch:145,formant:1,roughness:.17,rate:1},
  kazan:{pitch:121,formant:.95,roughness:.2,rate:1},
  titan:{pitch:80,formant:.78,roughness:.38,rate:.86},
  mina:{pitch:275,formant:1.27,roughness:.06,rate:1.2},
  agni:{pitch:105,formant:.88,roughness:.12,rate:.95},
  bolt:{pitch:185,formant:1.12,roughness:.3,rate:1.18}
};
const notes=[0,7,12,10,7,3,5,7,0,3,7,10,12,10,7,5,0,7,12,15,12,10,7,3,5,7,10,7,3,2,-1,2];
const hz=midi=>440*Math.pow(2,(midi-69)/12);
const vowel={a:[750,1150,2600],o:[500,850,2400],i:[320,2150,2900],u:[350,750,2200],e:[500,1750,2500]};
export class ArcadeAudio{
  constructor({context=null,fetcher=globalThis.fetch}={}){
    this.context=context;this.fetcher=fetcher.bind(globalThis);this.enabled=true;this.musicEnabled=true;this.pack='classic';this.volume=.6;
    this.buffers=new Map();this.failedSamples=[];this.loadErrors={};this.sources=new Set();this.noiseBuffer=null;
    this.scene={playing:false,paused:false,stage:0,urgent:false};this.beat=0;this.nextBeat=0;this.serial=0;this.ready=null;this.lastVoice=[-10,-10];this.fireCount=0;
  }
  async unlock(){
    if(!this.context){const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return false;this.context=new Audio();}
    if(!this.master)this.connect();
    if(this.context.state==='suspended')await this.context.resume();
    if(!this.ready)this.ready=this.load();
    return true;
  }
  connect(){
    const c=this.context;this.master=c.createGain();this.master.gain.value=this.enabled?this.volume:0;
    const compressor=c.createDynamicsCompressor();compressor.threshold.value=-14;compressor.knee.value=12;compressor.ratio.value=7;compressor.attack.value=.005;compressor.release.value=.12;
    this.master.connect(compressor).connect(c.destination);
    this.effects=c.createGain();this.effects.gain.value=.55;this.effects.connect(this.master);
    this.voices=c.createGain();this.voices.gain.value=.8;this.voices.connect(this.master);
    this.music=c.createGain();this.music.gain.value=.14;this.music.connect(this.master);
    this.noiseBuffer=c.createBuffer(1,c.sampleRate,c.sampleRate);const data=this.noiseBuffer.getChannelData(0);let seed=67;for(let i=0;i<data.length;i++){seed=(1664525*seed+1013904223)>>>0;data[i]=seed/2147483648-1;}
  }
  async load(){
    await Promise.all(Object.entries(AUDIO_FILES).map(async([name,path])=>{
      try{const response=await this.fetcher(new URL(`./assets/audio/${path}`,import.meta.url));if(!response.ok)throw new Error(`HTTP ${response.status}`);const buffer=await this.context.decodeAudioData(await response.arrayBuffer());this.buffers.set(name,buffer);}
      catch(error){this.failedSamples.push(name);this.loadErrors[name]=String(error.message||error);}
    }));
    return {loaded:this.buffers.size,failed:[...this.failedSamples],errors:{...this.loadErrors}};
  }
  setEnabled(value){this.enabled=!!value;if(this.master)this.master.gain.setTargetAtTime(this.enabled?this.volume:0,this.context.currentTime,.015);if(!value)this.stop();this.nextBeat=0;}
  setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)));if(this.master)this.master.gain.setTargetAtTime(this.enabled?this.volume:0,this.context.currentTime,.015);}
  setMusic(value){this.musicEnabled=!!value;if(!value)this.stop('music');this.nextBeat=0;}
  setScene(scene){
    if(this.scene.playing!==scene.playing||this.scene.stage!==scene.stage){this.serial++;this.beat=0;this.nextBeat=0;}
    if(scene.paused&&!this.scene.paused||!scene.playing&&this.scene.playing)this.stop();
    if(scene.paused!==this.scene.paused)this.nextBeat=0;
    this.scene={...this.scene,...scene};
  }
  track(source,nodes,channel){
    if(this.sources.size>=48){for(const entry of this.sources){if(entry.channel==='effects'){try{entry.source.stop();}catch{}break;}}}
    const entry={source,channel,owner:this.voiceOwner};this.sources.add(entry);source.onended=()=>{this.sources.delete(entry);source.disconnect();for(const node of nodes)node.disconnect();};return source;
  }
  stopVoice(owner){for(const entry of this.sources)if(entry.channel==='voices'&&entry.owner===owner){try{entry.source.stop();}catch{}}this.voiceOwner=owner;}
  stop(channel){for(const entry of this.sources)if(!channel||entry.channel===channel){try{entry.source.stop();}catch{}}}
  sample(name,{rate=1,gain=.8,delay=0,channel='voices'}={}){
    const c=this.context,buffer=this.buffers.get(name);if(!buffer||!c||!this.enabled||this.scene.paused)return false;
    const source=c.createBufferSource(),level=c.createGain(),filter=c.createBiquadFilter();source.buffer=buffer;source.playbackRate.value=rate;filter.type='lowpass';filter.frequency.value=7200;level.gain.value=gain;source.connect(filter).connect(level).connect(this[channel]);this.track(source,[filter,level],channel);source.start(c.currentTime+delay);return true;
  }
  tone(from,to,duration,{gain=.1,wave='triangle',delay=0,channel='effects',at=null}={}){
    const c=this.context;if(!c||!this.enabled)return;const start=at??c.currentTime+delay,osc=c.createOscillator(),level=c.createGain();osc.type=wave;osc.frequency.setValueAtTime(from,start);osc.frequency.exponentialRampToValueAtTime(Math.max(12,to),start+duration);level.gain.setValueAtTime(.0001,start);level.gain.exponentialRampToValueAtTime(gain,start+.005);level.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(level).connect(this[channel]);this.track(osc,[level],channel);osc.start(start);osc.stop(start+duration+.02);
  }
  noise(duration,{frequency=1700,gain=.13,delay=0,at=null,channel='effects'}={}){
    const c=this.context;if(!c||!this.enabled)return;const start=at??c.currentTime+delay,source=c.createBufferSource(),filter=c.createBiquadFilter(),level=c.createGain();source.buffer=this.noiseBuffer;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.7;level.gain.setValueAtTime(gain,start);level.gain.exponentialRampToValueAtTime(.0001,start+duration);source.connect(filter).connect(level).connect(this[channel]);this.track(source,[filter,level],channel);source.start(start);source.stop(start+duration);
  }
  vocal(id,syllables=['a'],{hurt=false,delay=0}={}){
    const c=this.context;if(!c||!this.enabled)return;const profile=VOICE_PROFILES[id]||VOICE_PROFILES.ryuji;
    syllables.forEach((syllable,i)=>{
      const start=c.currentTime+delay+i*.14/profile.rate,duration=(hurt?.21:.17)/profile.rate;
      const fundamental=profile.pitch*(hurt?.8:1)*(i===syllables.length-1?1.22:1);
      const source=c.createOscillator(),envelope=c.createGain();source.type='sawtooth';source.frequency.setValueAtTime(fundamental*1.15,start);source.frequency.exponentialRampToValueAtTime(fundamental*.8,start+duration);envelope.gain.setValueAtTime(.0001,start);envelope.gain.exponentialRampToValueAtTime(.13,start+.025);envelope.gain.exponentialRampToValueAtTime(.0001,start+duration);source.connect(envelope);
      const nodes=[envelope];for(const [j,formant] of (vowel[syllable]||vowel.a).entries()){const filter=c.createBiquadFilter(),level=c.createGain();filter.type='bandpass';filter.frequency.value=formant*profile.formant;filter.Q.value=4+j*2;level.gain.value=2.4/(j+1);envelope.connect(filter).connect(level).connect(this.voices);nodes.push(filter,level);}
      this.track(source,nodes,'voices');source.start(start);source.stop(start+duration+.01);
      this.noise(.055,{frequency:3300*profile.formant,gain:profile.roughness*.25,delay:delay+i*.14/profile.rate,channel:'voices'});
    });
  }
  async event(event){
    if(!this.enabled||!this.context||this.scene.paused)return;
    const serial=this.serial;
    if(this.ready)await this.ready;
    if(serial!==this.serial||!this.enabled||this.scene.paused)return;
    const classic=this.pack==='classic',f=event.fighter,move=event.move;
    switch(event.type){
      case 'attack':{
        if(move.special)return;const now=this.context.currentTime,slot=event.side||0;if(now-this.lastVoice[slot]>.38){this.lastVoice[slot]=now;this.stopVoice(slot);if(!(classic&&f.id==='ryuji'&&this.sample('ryuji-grunt-'+(event.key==='z'?1:2),{gain:.45})))this.vocal(f.id,event.key==='c'?['i','a']:['a']);}
        this.noise(.09,{frequency:move.type==='kick'?2400:1700,gain:.09});break;
      }
      case 'special':{
        this.stopVoice(event.side??f.id);
        const name=f.id==='agni'&&event.key==='a'&&this.fireCount++%2?'agni-s':`${f.id}-${event.key}`;
        const valid=classic&&!(f.id==='agni'&&event.key!=='a')&&this.sample(name,{gain:.9});
        if(!valid)this.vocal(f.id,f.id==='agni'?['o','a']:f.id==='mina'?['i','a']:f.id==='bolt'?['e','a']:['a','u']);
        if(f.id==='bolt'){if(!classic||!this.sample('electric',{gain:.4,channel:'effects'}))this.tone(950,180,.32,{wave:'sawtooth',gain:.09});this.noise(.28,{frequency:4000,gain:.12});}
        else if(move.type==='breath'){this.noise(.45,{frequency:600,gain:.23});this.tone(85,40,.35,{gain:.12,wave:'sawtooth'});}
        else{this.tone(move.type==='rise'?180:440,move.type==='rise'?650:90,.22,{gain:.07});this.noise(.16,{frequency:1300,gain:.1});}
        break;
      }
      case 'hit':{
        const weight=move.damage>=12?'heavy':move.damage>=8?'medium':'light';
        const sample=classic?(move.type==='kick'?'kick':`hit-${weight}`):`impact-${move.type==='throw'?'slam':weight}`;
        this.sample(sample,{channel:'effects',gain:weight==='heavy'?.9:.72,rate:move.type==='throw'?.82:1});
        this.tone(weight==='heavy'?110:170,35,.14,{gain:.13,wave:'sine'});this.noise(.07,{frequency:weight==='heavy'?800:1800,gain:.09});
        if(event.target&&move.damage>=8){this.stopVoice(event.side===1?0:1);if(!(classic&&event.target.id==='ryuji'&&this.sample('hurt',{gain:.55,delay:.02})))this.vocal(event.target.id,['a'],{hurt:true,delay:.02});}break;
      }
      case 'block':this.sample(classic?'block':'impact-block',{gain:.6,channel:'effects'});this.tone(560,180,.07,{gain:.06});break;
      case 'projectile':this.tone(580,90,.3,{wave:'sawtooth',gain:.035});break;
      case 'jump':this.noise(.06,{frequency:900,gain:.05});break;
      case 'round':{
        this.stopVoice('announcer');
        if(classic){this.sample('round',{gain:.85});this.sample(['one','two','three'][Math.min(2,(event.round||1)-1)],{delay:.75,gain:.85});}
        else for(let i=0;i<3;i++)this.tone(220+i*110,220+i*110,.1,{delay:i*.13,gain:.1,wave:'square'});break;
      }
      case 'fight':this.stopVoice('announcer');if(!classic||!this.sample('fight',{gain:.9}))this.vocal('kazan',['a','i']);break;
      case 'ko':this.stop('music');this.tone(160,28,.65,{gain:.16,wave:'sawtooth'});this.noise(.25,{frequency:550,gain:.15});break;
      case 'over':
        this.stopVoice('announcer');
        if(classic){this.sample(event.won?'win':'lose',{gain:.9});if(event.won&&event.winnerId==='titan')this.sample('titan-win',{gain:.55,delay:1.5});}
        if(event.won)for(let i=0;i<5;i++)this.tone(hz(64+[0,4,7,12,16][i]),hz(64+[0,4,7,12,16][i]),.3,{wave:'square',delay:i*.1,gain:.05});
        break;
      case 'select':this.tone(650,900,.065,{gain:.06,wave:'square'});break;
    }
  }
  tick(){
    const c=this.context;if(!c||c.state!=='running'||!this.enabled||!this.musicEnabled||!this.scene.playing||this.scene.paused)return;
    const interval=60/(this.scene.urgent?155:132)/4;
    if(this.nextBeat<c.currentTime-.15)this.nextBeat=c.currentTime+.025;
    let budget=4;
    while(this.nextBeat<c.currentTime+.12&&budget-->0){
      const beat=this.beat++,time=this.nextBeat,root=[45,43,40][this.scene.stage]||45,chord=[0,-3,-5,-1][Math.floor(beat/16)%4];
      if(beat%2===0){const midi=root+24+notes[Math.floor(beat/2)%notes.length]+chord;this.tone(hz(midi),hz(midi),interval*1.5,{at:time,channel:'music',gain:.13,wave:'square'});this.tone(hz(midi+12),hz(midi+12),interval*.6,{at:time,channel:'music',gain:.025,wave:'triangle'});}
      if(beat%4===0){const bass=hz(root+chord+(beat%8===4?7:0));this.tone(bass,bass,interval*2.6,{at:time,channel:'music',gain:.27,wave:'triangle'});this.tone(125,37,.12,{at:time,channel:'music',gain:.25,wave:'sine'});}
      if(beat%8===4)this.noise(.12,{at:time,channel:'music',frequency:1800,gain:.24});
      this.noise(.028,{at:time,channel:'music',frequency:6500,gain:beat%2?.08:.13});
      this.nextBeat+=interval;
    }
  }
}
