import {ArcadeAudio} from './audio.js';
import { Match, ROSTER, WIDTH, HEIGHT, fighter } from './engine.js';
import { drawMatch, drawHud, drawFighter, STAGES } from './render.js';
const $=id=>document.getElementById(id);
const canvas=$('game'),ctx=canvas.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=false;
let selected='ryuji',stage=0,match=null,attract=new Match('agni','bolt','normal'),mode='lobby',paused=false,elapsed=0,last=0,accumulator=0,fx=[],sound=true,animationId;
const audio=new ArcadeAudio();
const keys=new Set(),pointers=new Map(),pending=[];
if(navigator.maxTouchPoints>0||matchMedia('(pointer: coarse)').matches)document.body.classList.add('touch-device');
const attackKeys=['z','x','c','a','s','d'];
let saved;try{saved=JSON.parse(localStorage.getItem('rsf-settings')||'{}');}catch{saved={};}
if(typeof saved.sound==='boolean')sound=saved.sound;
audio.setEnabled(sound);if(typeof saved.music==='boolean')audio.setMusic(saved.music);if(['classic','synth'].includes(saved.audioPack))audio.pack=saved.audioPack;if(typeof saved.volume==='number')audio.setVolume(saved.volume);
if(ROSTER.some(f=>f.id===saved.fighter))selected=saved.fighter;
if(['easy','normal','hard'].includes(saved.difficulty))$('difficulty').value=saved.difficulty;
if(Number.isInteger(saved.stage)&&saved.stage>=0&&saved.stage<3){stage=saved.stage;$('stage').value=stage;}
function save(){try{localStorage.setItem('rsf-settings',JSON.stringify({fighter:selected,difficulty:$('difficulty').value,stage,sound,music:audio.musicEnabled,audioPack:audio.pack,volume:audio.volume}));}catch{/* Storage is optional in embedded browsers. */}}
function soundInit(){audio.unlock().catch(()=>{$('game-status').textContent='사운드를 시작하려면 사운드 버튼을 다시 눌러 주세요';});}
function syncAudio(){audio.setScene({playing:mode==='play'&&match?.phase!=='over'&&match?.phase!=='ended',paused,stage,urgent:!!match&&match.fighters.some(f=>f.hp/f.maxHp<.25)});}
function drainEvents(m,audible){for(const e of m.events){if(audible){syncAudio();audio.event({...e,round:m.round,won:m.wins[0]>=2,winnerId:m.fighters[m.wins[0]>=2?0:1].id,side:e.fighter===m.fighters[1]?1:0});}if(e.type==='hit'||e.type==='block')fx.push({x:e.x,y:e.y,color:e.type==='block'?'#e3e7ba':e.color,life:.28,max:.28});if(e.type==='over'&&m===match)showResult();}m.events.length=0;}
function renderRoster(){
 $('roster').innerHTML='';
 ROSTER.forEach((f,i)=>{const card=document.createElement('button');card.className='fighter-card';card.dataset.fighter=f.id;card.setAttribute('aria-pressed',String(selected===f.id));card.setAttribute('aria-label',`${f.name}, ${f.role}`);card.innerHTML=`<span class="card-number">0${i+1}</span><canvas width="170" height="140" aria-hidden="true"></canvas><span class="card-caption"><strong>${f.name}</strong><small>${f.role}</small></span>`;
 const cc=card.querySelector('canvas').getContext('2d');cc.imageSmoothingEnabled=false;drawFighter(cc,{...fighter(f.id,83,1),y:140,trail:[]},0,{scale:1,portrait:true});
 card.onclick=()=>{selected=f.id;renderSelection();save();audio.event({type:'select'});};$('roster').append(card);});
}
function renderSelection(){const f=ROSTER.find(f=>f.id===selected);if(!$('roster').children.length)renderRoster();else document.querySelectorAll('.fighter-card').forEach(card=>card.setAttribute('aria-pressed',String(card.dataset.fighter===selected)));$('fighter-role').textContent=f.role+' / '+f.title;$('fighter-name').textContent=f.name;$('fighter-desc').textContent=f.desc;
 $('stats').innerHTML=[['체력',f.hp/125],['속도',f.speed/305],['파워',f.power/1.32]].map(([label,value])=>`<span class="stat">${label}<i><b style="width:${Math.round(value*100)}%"></b></i></span>`).join('');
 $('skills').innerHTML=f.skills.map((s,i)=>`<div><kbd>${['A','S','D'][i]}</kbd><span>${s}</span></div>`).join('');
 $('extra-skill').textContent=f.id==='agni'?'X 팔 늘리기 · C / ↓+S 다리 늘리기 · D 공중 부양':f.id==='titan'?'A 잡기는 가까운 지상 상대에게만 성공합니다.':'발동과 후딜레이를 고려해 공격을 연결하세요.';
}
for(const f of ROSTER){const o=document.createElement('option');o.value=f.id;o.textContent=f.name;$('opponent').append(o);}
function clearInput(){keys.clear();pointers.clear();pending.length=0;document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
function start(){
 const enemy=$('opponent').value==='random'?ROSTER.filter(f=>f.id!==selected)[Math.floor(Math.random()*5)].id:$('opponent').value;
 match=new Match(selected,enemy,$('difficulty').value);mode='play';paused=false;fx=[];clearInput();accumulator=0;save();
 document.body.classList.add('playing');$('attract-overlay').hidden=true;$('result-overlay').hidden=true;$('pause-overlay').hidden=true;$('pause').disabled=false;$('pause').textContent='Ⅱ';$('mode-label').textContent='ARCADE / PLAYER VS CPU';$('game-status').textContent='FIRST TO TWO · GOOD LUCK, FIGHTER';
 soundInit();syncAudio();$('screen').focus({preventScroll:true});$('screen').scrollIntoView({block:'center',behavior:'smooth'});
}
function lobby(){mode='lobby';match=null;paused=false;clearInput();document.body.classList.remove('playing');$('attract-overlay').hidden=false;$('pause-overlay').hidden=true;$('result-overlay').hidden=true;$('pause').disabled=true;$('mode-label').textContent='ATTRACT MODE';$('game-status').textContent='CHOOSE YOUR FIGHTER BELOW';renderSelection();$('start').focus({preventScroll:true});syncAudio();}
function pause(value=!paused){if(mode!=='play'||match.phase==='over')return;paused=value;clearInput();$('pause-overlay').hidden=!paused;$('pause').textContent=paused?'▶':'Ⅱ';$('pause').setAttribute('aria-label',paused?'게임 계속':'게임 일시정지');if(paused)$('resume').focus({preventScroll:true});else $('screen').focus({preventScroll:true});syncAudio();}
function showResult(){clearInput();const won=match.wins[0]>=2;$('result-score').textContent=`FINAL SCORE / ${match.wins[0]} — ${match.wins[1]}`;$('result-title').textContent=won?'YOU WIN!':'KEEP FIGHTING';$('result-description').textContent=won?`${match.fighters[0].name}, 오늘의 거리는 당신의 것입니다.`:'한 번 더, 당신의 다음 라운드가 기다립니다.';$('result-overlay').hidden=false;$('pause').disabled=true;$('game-status').textContent=won?'VICTORY · THE STREETS ARE YOURS':'DEFEAT · EVERY FIGHT IS A NEW BEGINNING';$('rematch').focus({preventScroll:true});}
function input(){const held=new Set(keys);for(const key of pointers.values())held.add(key);return {left:held.has('left'),right:held.has('right'),up:held.has('up'),down:held.has('down'),attack:pending.shift()};}
const keyMap={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
$('screen').addEventListener('pointerdown',()=>{soundInit();if(!$('help').open&&mode==='play'&&!paused)$('screen').focus({preventScroll:true});});
window.addEventListener('keydown',e=>{
 const key=e.key.toLowerCase(),focused=document.activeElement=== $('screen');
 if(focused&&mode==='lobby'&&e.key==='Enter'){e.preventDefault();start();return;}
 if(mode==='play'&&!$('help').open&&(focused||$('pause-overlay').contains(document.activeElement))&&(key==='escape'||key==='p')){e.preventDefault();if(!e.repeat)pause();return;}
 if(!focused||mode!=='play'||paused||match.phase==='over')return;
 const control=keyMap[e.key]||key;if(![...attackKeys,'up','down','left','right'].includes(control))return;
 e.preventDefault();if(!e.repeat){keys.add(control);if(attackKeys.includes(control))pending.push(control);soundInit();}
});
window.addEventListener('keyup',e=>keys.delete(keyMap[e.key]||e.key.toLowerCase()));
window.addEventListener('blur',()=>{clearInput();if(mode==='play')pause(true);});
$('screen').addEventListener('blur',e=>{if(mode==='play'&&!paused&&match.phase!=='over'&&!e.relatedTarget?.closest('.touch-controls'))pause(true);});
// Distinct pointer IDs keep simultaneous movement and attacks independent.
document.querySelectorAll('[data-control]').forEach(button=>{
 button.addEventListener('pointerdown',e=>{e.preventDefault();if(mode!=='play'||paused)return;button.setPointerCapture(e.pointerId);pointers.set(e.pointerId,button.dataset.control);button.classList.add('held');if(attackKeys.includes(button.dataset.control))pending.push(button.dataset.control);soundInit();});
 const release=e=>{pointers.delete(e.pointerId);if(![...pointers.values()].includes(button.dataset.control))button.classList.remove('held');};
 button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);button.addEventListener('contextmenu',e=>e.preventDefault());
});
$('start').onclick=start;$('quick-start').onclick=start;$('rematch').onclick=start;$('pause').onpointerdown=e=>e.preventDefault();$('pause').onclick=()=>pause();$('resume').onclick=()=>pause(false);$('return-select').onclick=lobby;$('choose-again').onclick=lobby;
function soundUI(){$('sound').innerHTML=`♫ <span>${sound?'ON':'OFF'}</span>`;$('sound').setAttribute('aria-label',sound?'사운드 끄기':'사운드 켜기');$('sound').setAttribute('aria-pressed',String(sound));}
$('sound').onclick=()=>{sound=!sound;audio.setEnabled(sound);soundInit();soundUI();save();if(sound)audio.event({type:'select'});};
$('audio-pack').value=audio.pack;$('music').checked=audio.musicEnabled;$('volume').value=Math.round(audio.volume*100);
$('audio-pack').onchange=()=>{audio.pack=$('audio-pack').value;save();audio.event({type:'select'});};
$('music').onchange=()=>{audio.setMusic($('music').checked);save();};$('volume').oninput=()=>{audio.setVolume(Number($('volume').value)/100);save();};soundUI();
$('stage').onchange=()=>{stage=Number($('stage').value);$('stage-label').textContent=STAGES[stage].tag;save();};$('difficulty').onchange=save;
$('fullscreen').onpointerdown=e=>e.preventDefault();$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.querySelector('.arcade').requestFullscreen)await document.querySelector('.arcade').requestFullscreen();else $('game-status').textContent='이 브라우저는 전체화면을 지원하지 않습니다 · 가로 화면을 이용하세요';}catch{$('game-status').textContent='전체화면 권한이 필요합니다 · 브라우저 설정을 확인하세요';}if(mode==='play'&&!paused)$('screen').focus({preventScroll:true});};
function help(){if(mode==='play')pause(true);$('help').showModal();}
$('help-open').onclick=help;$('help-bottom').onclick=help;$('help-close').onclick=()=>$('help').close();
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(mode==='play')pause(true);}last=0;accumulator=0;});
function loop(timestamp){
 const dt=last?Math.min((timestamp-last)/1000,.1):0;last=timestamp;
 if(!document.hidden){
  if(!paused){accumulator+=dt;let steps=0;while(accumulator>=1/60&&steps<6){elapsed+=1/60;
   if(mode==='play'){match.step(1/60,input());drainEvents(match,true);}else{if(attract.phase==='over')attract=new Match('agni','bolt','hard');const f=attract.fighters[0],enemy=attract.fighters[1];const direction=f.x<enemy.x?'right':'left';const demo={[direction]:Math.abs(f.x-enemy.x)>220,attack:Math.random()<.025?['a','s','c','d'][Math.floor(Math.random()*4)]:undefined};attract.step(1/60,demo);drainEvents(attract,false);}
   for(const f of fx)f.life-=1/60;fx=fx.filter(f=>f.life>0);accumulator-=1/60;steps++;
  }}
  syncAudio();audio.tick();drawMatch(ctx,mode==='play'?match:attract,stage,elapsed,fx);if(mode==='play')drawHud(ctx,match);
 }
 animationId=requestAnimationFrame(loop);
}
window.addEventListener('pagehide',()=>{cancelAnimationFrame(animationId);clearInput();audio.stop();});
window.addEventListener('pageshow',e=>{if(e.persisted){last=0;animationId=requestAnimationFrame(loop);}});
renderSelection();$('stage-label').textContent=STAGES[stage].tag;animationId=requestAnimationFrame(loop);
