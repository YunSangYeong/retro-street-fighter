export const WIDTH = 960, HEIGHT = 540, FLOOR = 434;
export const ROSTER = [
  {id:'ryuji',name:'RYUJI',title:'푸른 파동의 계승자',role:'균형형 무술가',color:'#58d9ed',cloth:'#dfe9e6',skin:'#c58a67',hp:100,speed:215,power:1,reach:1,desc:'흐트러짐 없는 기본기. 파동과 상승권으로 전장을 지배하세요.',skills:['블루 에너지','라이징 피스트','사이클론 킥']},
  {id:'kazan',name:'KAZAN',title:'전선을 가르는 섬광',role:'중거리 킥 파이터',color:'#bad479',cloth:'#687956',skin:'#c39476',hp:100,speed:235,power:.95,reach:1.2,desc:'긴 발차기와 빠른 접근. 상대의 빈틈에 섬광처럼 파고드세요.',skills:['플래시 킥','소닉 웨이브','러시 킥']},
  {id:'titan',name:'TITAN',title:'무너지지 않는 거인',role:'파워형 레슬러',color:'#f3aa60',cloth:'#9b4c52',skin:'#ae725b',hp:125,speed:150,power:1.32,reach:.95,desc:'한 번의 접근, 묵직한 한 방. 가까이 붙어 강력한 잡기를 노리세요.',skills:['파워 슬램','자이언트 러시','스핀 크러시']},
  {id:'mina',name:'MINA',title:'바람을 밟는 무도가',role:'민첩한 콤보 파이터',color:'#f1a4c3',cloth:'#805eab',skin:'#d7a080',hp:90,speed:270,power:.87,reach:1.05,desc:'가벼운 발놀림과 연속 발차기. 공중에서 전투의 흐름을 바꾸세요.',skills:['스피닝 킥','에어 스트라이크','팬텀 러시']},
  {id:'agni',name:'AGNI',title:'고요 속에 피어난 불꽃',role:'장거리 명상가',color:'#ffa359',cloth:'#b76b35',skin:'#9d756b',hp:95,speed:165,power:.95,reach:1.15,desc:'늘어나는 팔다리와 화염. 거리를 지키며 상대의 접근을 봉쇄하세요.',skills:['플레임 브레스','스트레치 펀치','플로팅 요가']},
  {id:'bolt',name:'BOLT',title:'한계를 넘는 전류',role:'초고속 돌진 파이터',color:'#b1ed6e',cloth:'#376f78',skin:'#9d705b',hp:85,speed:305,power:.85,reach:1,desc:'번개 같은 돌진과 잔상. 짧고 빠른 공격으로 기회를 만드세요.',skills:['썬더 러시','라이트닝 어퍼','팬텀 콤보']}
];
const basic = {
 z:{name:'약펀치',type:'punch',startup:.075,active:.09,recovery:.16,damage:5,range:68},
 x:{name:'강펀치',type:'punch',startup:.18,active:.12,recovery:.27,damage:10,range:85},
 c:{name:'발차기',type:'kick',startup:.14,active:.14,recovery:.25,damage:8,range:108}
};
const special=(name,type,damage,range,extra={})=>({name,type,damage,range,startup:.22,active:.24,recovery:.4,special:true,...extra});
export function moveFor(id,key,down=false){
 const char=ROSTER.find(c=>c.id===id);
 if(!char) throw new Error('Unknown fighter');
 if(id==='agni' && (key==='x'||key==='c'||(key==='s'&&down))) return special(key==='x'?'스트레치 펀치':'스트레치 킥','stretch',key==='x'?11:10,key==='x'?270:235,{startup:.2,active:.2,recovery:.35,limb:key==='x'?'arm':'leg',special:key==='s'});
 if(basic[key]) return {...basic[key]};
 const types={ryuji:['projectile','rise','spin'],kazan:['rise','projectile','dash'],titan:['throw','dash','spin'],mina:['spin','dive','flurry'],agni:['breath','stretch','float'],bolt:['dash','rise','flurry']};
 const i=['a','s','d'].indexOf(key); if(i<0) return null;
 const type=types[id][i];
 return special(char.skills[i],type,type==='throw'?24:type==='flurry'?5:type==='float'?0:14,type==='throw'?74:type==='stretch'?285:type==='breath'?205:125,{
  ...(type==='projectile'?{active:.08,recovery:.44}:{}),
  ...(type==='rise'?{active:.32,recovery:.42,range:80}:{}),
  ...(type==='flurry'||type==='spin'?{active:.5,damage:5,pulses:3,recovery:.35}:{}),
  ...(type==='dash'?{active:.3,recovery:.48}:{}),
  ...(type==='float'?{active:.65,recovery:.2}:{}),
  ...(type==='stretch'?{limb:'arm',active:.22}:{}),
  ...(type==='dive'?{active:.34,recovery:.3}:{}),
 });
}
export function fighter(id,x,face){ const c=ROSTER.find(c=>c.id===id);return { ...c,x,y:FLOOR,vx:0,vy:0,face,hp:c.hp,maxHp:c.hp,attack:null,stun:0,invuln:0,cooldown:0,guard:false,crouch:false,walk:0,land:0,float:0,combo:0,comboTimer:0,trail:[],lastInput:{},ai:{wait:0,input:{},memory:null}}; }
export function attackPhase(f){if(!f.attack)return 0;const a=f.attack;return Math.max(0,Math.min(1,(a.t-a.move.startup)/a.move.active));}
export function attackBox(f){
 const a=f.attack;if(!a)return null;const m=a.move,p=attackPhase(f);
 if(a.t<m.startup||a.t>=m.startup+m.active||['projectile','float'].includes(m.type))return null;
 let range=m.range*f.reach;
 if(m.type==='stretch')range=45+(range-45)*Math.sin(Math.PI*p);
 const ground=f.y>=FLOOR-2;
 const low=f.crouch&&ground;
 const y=f.y-(low?33:m.type==='kick'||m.limb==='leg'?58:85);
 return {x:f.face===1?f.x+12:f.x-12-range,y:m.type==='rise'?f.y-155:y-17,w:range,h:m.type==='rise'?120:m.type==='breath'?48:34,low,range};
}
export function hurtBox(f){return {x:f.x-(f.id==='titan'?29:23),y:f.y-(f.crouch?65:118),w:f.id==='titan'?58:46,h:f.crouch?65:118};}
export const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export class Match {
 constructor(player='ryuji',enemy='kazan',difficulty='normal',rng=Math.random){this.ids=[player,enemy];this.difficulty=difficulty;this.rng=rng;this.wins=[0,0];this.round=1;this.events=[];this.roundStart();}
 roundStart(){this.fighters=[fighter(this.ids[0],270,1),fighter(this.ids[1],690,-1)];this.projectiles=[];this.particles=[];this.time=99;this.phase='intro';this.phaseTime=2.3;this.hitstop=0;this.shake=0;this.result=null;this.events.push({type:'round'});}
 emit(type,data={}){this.events.push({type,...data});}
 attack(f,key,input={}){
  if(f.attack||f.stun>0||f.hp<=0)return false;
  const m=moveFor(f.id,key,input.down);if(!m||m.special&&f.cooldown>0)return false;
  if(m.type==='throw'&&f.y<FLOOR-2)return false;
  f.attack={move:m,t:0,hits:new Set(),spawned:false};f.guard=false;
  if(m.special) {f.cooldown=1.15;this.emit('special',{fighter:f,move:m});}
  return true;
 }
 aiInput(dt){
  const f=this.fighters[1],p=this.fighters[0],ai=f.ai;
  ai.wait-=dt;if(ai.wait>0)return ai.input;
  const cfg={easy:{delay:.52,attack:.48,miss:.3},normal:{delay:.3,attack:.72,miss:.16},hard:{delay:.17,attack:.9,miss:.07}}[this.difficulty];
  ai.wait=cfg.delay+this.rng()*.12;
  // Decisions use only visible world state at reaction intervals; never player input.
  const distance=Math.abs(p.x-f.x),toward=p.x>f.x?'right':'left',away=toward==='right'?'left':'right';
  const input={},r=this.rng();
  const threat=this.projectiles.some(b=>b.owner!==1&&Math.abs(b.x-f.x)<260)||p.attack&&distance<180;
  if(threat&&r>cfg.miss){if(this.projectiles.length&&this.rng()<.5)input.up=true;else {input[away]=true;input.down=p.crouch;}}
  else if(r<cfg.miss){if(r<cfg.miss*.4)input[away]=true;}
  else {
   const ideal=f.id==='agni'?220:f.id==='titan'?64:110;
   if(distance>ideal)input[toward]=true;
   if(distance<ideal*.6&&f.hp<f.maxHp*.35)input[away]=true;
   if(this.rng()<.09)input.up=true;
   if(this.rng()<cfg.attack){
    if(distance<145)input.attack=this.rng()<.3&&!f.cooldown?['a','s','d'][Math.floor(this.rng()*3)]:['z','x','c'][Math.floor(this.rng()*3)];
    else if(!f.cooldown)input.attack=f.id==='kazan'?'s':f.id==='agni'?(distance<280?'s':'a'):f.id==='titan'?'s':f.id==='bolt'?'a':f.id==='mina'?'d':'a';
   }
  }
  ai.memory={distance,hp:p.hp};ai.input=input;return input;
 }
 hit(attacker,target,move,sourceX){
  if(target.hp<=0||target.invuln>0)return false;
  if(move.type==='throw'&&(target.y<FLOOR-2||target.stun>0))return false;
  const blocking=target.guard&&!target.attack&&target.stun<=0&&target.y>=FLOOR-1&&move.type!=='throw';
  const defended=blocking&&(!move.low||target.crouch);
  const damage=move.damage*attacker.power*(defended?.16:1);
  target.hp=Math.max(0,target.hp-damage);target.stun=defended?.15:move.type==='throw'?.6:.21+move.damage*.008;
  target.vx=(target.x>=sourceX?1:-1)*(defended?80:move.type==='throw'?245:170);
  if(!defended){target.attack=null;target.float=0;if(move.type==='throw')target.slam=.6;target.combo++;target.comboTimer=1.1;if(target.combo>=4){target.invuln=.65;target.combo=0;target.vx*=1.5;}if(move.type==='rise'||move.type==='throw')target.vy=-230;}
  this.hitstop=defended?.025:.055;this.shake=defended?1:move.damage>12?7:3;
  this.emit(defended?'block':'hit',{x:target.x,y:target.y-70,color:attacker.color,move,damage});return true;
 }
 step(dt,input={},useAI=true){
  if(this.phase==='over')return;
  this.shake=Math.max(0,this.shake-dt*22);
  if(this.hitstop>0){this.hitstop-=dt;return;}
  if(this.phase!=='fight'){
   if(this.phase==='ended')this.fighters.forEach((f,i)=>this.updateFighter(f,this.fighters[1-i],{},dt));
   this.phaseTime-=dt;
   if(this.phase==='intro'&&this.phaseTime<=0){this.phase='fight';this.emit('fight');}
   else if(this.phase==='ended'&&this.phaseTime<=0){if(this.wins.some(w=>w>=2)){this.phase='over';this.emit('over');}else this.roundStart();}
   return;
  }
  this.time=Math.max(0,this.time-dt);
  const inputs=[input,useAI?this.aiInput(dt):{}];
  this.fighters.forEach((f,i)=>this.updateFighter(f,this.fighters[1-i],inputs[i],dt));
  const [a,b]=this.fighters;
  if(Math.abs(a.x-b.x)<49&&Math.abs(a.y-b.y)<95){const mid=(a.x+b.x)/2,dir=a.x<=b.x?1:-1;a.x=Math.max(35,Math.min(WIDTH-35,mid-25*dir));b.x=Math.max(35,Math.min(WIDTH-35,mid+25*dir));}
  for(let i=0;i<2;i++){
   const f=this.fighters[i],target=this.fighters[1-i],a=f.attack;if(!a)continue;
   const box=attackBox(f);const pulse=Math.min((a.move.pulses||1)-1,Math.floor(attackPhase(f)*(a.move.pulses||1)));
   if(box&&!a.hits.has(pulse)&&overlaps(box,hurtBox(target))){a.hits.add(pulse);this.hit(f,target,{...a.move,low:box.low},f.x);}
  }
  this.projectiles=this.projectiles.filter(p=>{
   p.x+=p.v*dt;p.life-=dt;const target=this.fighters[1-p.owner];
   if(overlaps({x:p.x-20,y:p.y-17,w:40,h:34},hurtBox(target))){this.hit(this.fighters[p.owner],target,p.move,p.x-p.v*.1);return false;}
   return p.life>0&&p.x>-50&&p.x<WIDTH+50;
  });
  if(a.hp<=0||b.hp<=0||this.time<=0)this.endRound();
 }
 updateFighter(f,enemy,input,dt){
  f.slam=Math.max(0,(f.slam||0)-dt);f.cooldown=Math.max(0,f.cooldown-dt);f.stun=Math.max(0,f.stun-dt);f.invuln=Math.max(0,f.invuln-dt);f.land=Math.max(0,f.land-dt);f.comboTimer-=dt;if(f.comboTimer<=0)f.combo=0;
  if(!f.attack&&f.stun<=0)f.face=enemy.x>=f.x?1:-1;
  const grounded=f.y>=FLOOR-.01;
  if(!f.attack)f.crouch=!!input.down&&grounded&&f.stun<=0;
  const direction=(input.right?1:0)-(input.left?1:0);
  f.guard=direction===-f.face&&!f.attack&&grounded&&f.stun<=0;
  if(f.stun<=0&&!f.attack){
   if(input.up&&!f.lastInput.up&&grounded){f.vy=-530;f.crouch=false;this.emit('jump');}
   if(input.attack)this.attack(f,input.attack,input);
   if(!f.crouch&&!f.attack){f.x+=direction*f.speed*dt;f.walk+=Math.abs(direction)*dt*10;}
  }
  if(f.attack){
   const a=f.attack,m=a.move;a.t+=dt;
   const active=a.t>=m.startup&&a.t<m.startup+m.active;
   if(a.t>=m.startup&&!a.spawned){
    a.spawned=true;
    if(m.type==='projectile'){this.projectiles.push({x:f.x+f.face*45,y:f.y-65,v:f.face*390,owner:this.fighters.indexOf(f),move:m,color:f.color,life:3});this.emit('projectile');}
    if(m.type==='rise')f.vy=-440;
    if(m.type==='dive'&&grounded)f.vy=-380;
    if(m.type==='float'){f.float=.85;f.vy=-130;}
   }
   if(active&&['dash','flurry','spin'].includes(m.type))f.x+=f.face*(m.type==='dash'?470:m.type==='flurry'?270:180)*dt;
   if(active&&m.type==='rise')f.x+=f.face*110*dt;
   if(active&&m.type==='dive'&&a.t>m.startup+.15){f.vy=540;f.x+=f.face*310*dt;}
   if(a.t>=m.startup+m.active+m.recovery)f.attack=null;
  }
  f.x+=f.vx*dt;f.vx*=Math.exp(-9*dt);f.x=Math.max(35,Math.min(WIDTH-35,f.x));
  if(f.float>0){f.float-=dt;f.vy*=Math.exp(-6*dt);f.x+=direction*f.speed*.7*dt;}else f.vy+=1400*dt;
  f.y+=f.vy*dt;if(f.y>=FLOOR){if(!grounded)f.land=.14;f.y=FLOOR;f.vy=0;}
  f.lastInput={up:input.up};
  for(const t of f.trail)t.life-=dt;
  f.trail=f.trail.filter(t=>t.life>0);
  if(f.id==='bolt'&&(direction||f.attack)&&(!f.trail.length||f.trail.at(-1).life<.16))f.trail.push({x:f.x,y:f.y,life:.22});
 }
 endRound(){
  const [a,b]=this.fighters;const winner=a.hp===b.hp?-1:a.hp>b.hp?0:1;
  if(winner>=0){this.wins[winner]++;this.round++;}
  for(const f of this.fighters){f.attack=null;f.float=0;f.invuln=0;f.stun=0;f.crouch=false;}
  this.result={winner,reason:this.time<=0?'TIME UP':'KO',draw:winner<0};this.phase='ended';this.phaseTime=3.1;this.projectiles=[];this.emit('ko',this.result);
 }
}
