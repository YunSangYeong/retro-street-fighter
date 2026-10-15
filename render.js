import { WIDTH, HEIGHT, FLOOR, attackBox, attackPhase } from './engine.js';
export const STAGES=[{name:'황혼의 골목',en:'OLD TOWN',tag:'01 / KYOTO DISTRICT',sky:'#25373c',ground:'#383f45'},{name:'미드나잇 항구',en:'NEON HARBOR',tag:'02 / DOCKSIDE',sky:'#171e38',ground:'#30334c'},{name:'잊혀진 사원',en:'ANCIENT RUINS',tag:'03 / HIGHLANDS',sky:'#343144',ground:'#464348'}];
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function segment(c,a,b,width,color){c.strokeStyle='#16262b';c.lineWidth=width+5;c.lineCap='butt';c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke();c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function text(c,label,x,y,size,color='#eee4cd',align='center'){c.fillStyle=color;c.font=`900 ${size}px monospace`;c.textAlign=align;c.fillText(label,x,y);}
function building(c,x,y,w,h,color){rect(c,x,y,w,h,color);rect(c,x-8,y-8,w+16,9,'#131f29');for(let j=16;j<w-10;j+=24)for(let k=20;k<h-12;k+=36){rect(c,x+j,y+k,12,21,'#92735e');rect(c,x+j+3,y+k+2,3,17,'#b69a6a');}}
function roof(c,x,y,w){poly(c,[[x-20,y+20],[x+w/2,y-8],[x+w+20,y+20],[x+w+9,y+29],[x-9,y+29]],'#172a30');rect(c,x-15,y+23,w+30,5,'#9c6752');for(let j=0;j<w;j+=16)rect(c,x+j,y+15,2,10,'#56605a');}
export function drawStage(c,index,time=0){
 const s=STAGES[index];rect(c,0,0,WIDTH,HEIGHT,s.sky);
 const g=c.createLinearGradient(0,0,0,420);g.addColorStop(0,s.sky);g.addColorStop(1,index===0?'#be8a71':index===1?'#514365':'#ba957b');c.fillStyle=g;c.fillRect(0,0,WIDTH,420);
 rect(c,697,70,52,52,index===1?'#b9c5b6':'#e3b88a');rect(c,688,80,70,32,index===1?'#b9c5b6':'#e3b88a');
 for(let i=0;i<12;i++){const y=105+i*14;rect(c,((i*177)%980)-40+Math.sin(time*.06+i)*5,y,100+(i%3)*70,2,'#887a78');}
 if(index===0){
  poly(c,[[0,280],[155,140],[280,277],[410,172],[590,288],[755,192],[960,290],[960,430],[0,430]],'#4f6564');
  for(let i=0;i<8;i++)building(c,i*143-45,226+(i%3)*18,122,200,'#40504e');
  building(c,-20,245,236,191,'#746253');roof(c,-20,218,236);roof(c,5,164,190);rect(c,30,190,130,28,'#535446');
  building(c,746,234,240,204,'#675d50');roof(c,746,206,240);roof(c,771,152,190);
  rect(c,253,243,19,191,'#854e3e');rect(c,680,243,19,191,'#854e3e');rect(c,235,243,485,16,'#9d5d47');roof(c,238,215,478);
  rect(c,330,290,290,130,'#354346');for(let x=335;x<620;x+=24)rect(c,x,300,4,120,'#56615a');
  for(const x of [96,243,711,847]){rect(c,x,278,2,82,'#372d31');rect(c,x-12,312,27,39,'#cd805d');rect(c,x-7,314,17,34,'#e1ab78');rect(c,x-9,326,21,3,'#815044');rect(c,x-6,351,14,5,'#543d37');}
  rect(c,790,275,43,87,'#cbc0a0');text(c,'武',811,306,23,'#564c42');text(c,'道',811,338,23,'#564c42');
  for(let i=0;i<10;i++){const x=(i*127+time*12)%1010-30,y=200+(i*39+time*18)%215;rect(c,x,y,5,3,'#dba38f');}
 }else if(index===1){
  for(let i=0;i<10;i++){building(c,i*113,170+(i%4)*32,90,220,'#252d42');rect(c,i*113+8,181+(i%4)*32,8,50,i%2?'#84a5a0':'#b46c97');}
  rect(c,0,357,960,62,'#38435b');for(let i=0;i<35;i++)rect(c,(i*91+time*4)%960,363+i%7*7,25+(i%4)*6,2,i%2?'#645770':'#688b92');
  for(const x of [85,780]){rect(c,x,152,9,265,'#1a2637');segment(c,[x,160],[x+130,110],7,'#314052');segment(c,[x+130,110],[x+200,170],5,'#314052');rect(c,x+188,171,3,130,'#263142');}
  for(let i=0;i<3;i++){rect(c,90+i*190,330,170,84,i===1?'#59435e':'#35565d');for(let j=0;j<160;j+=18)rect(c,99+i*190+j,335,3,73,'#283d4c');}
  rect(c,380,202,206,63,'#222b3e');text(c,'NIGHT DOCK',483,242,24,'#6ae2d0');rect(c,383,207,200,2,'#dd729e');rect(c,383,260,200,2,'#dd729e');
 }else{
  poly(c,[[0,340],[150,160],[345,320],[540,140],[780,325],[900,180],[960,225],[960,440],[0,440]],'#545b60');
  for(const x of [60,240,675,855]){rect(c,x,213,42,214,'#6c6c60');rect(c,x-9,205,60,14,'#9a8d70');rect(c,x-5,406,52,20,'#93866c');for(let j=0;j<3;j++)rect(c,x+8+j*10,223,3,169,'#535a54');rect(c,x-4,272,48,3,'#4c5350');}
  poly(c,[[333,398],[333,284],[375,284],[375,251],[585,251],[585,284],[627,284],[627,398]],'#79705e');roof(c,333,235,294);rect(c,415,292,130,120,'#46474a');
  for(const x of [331,614]){rect(c,x,360,15,60,'#413e3d');poly(c,[[x-9,362],[x+7,326+Math.sin(time*9)*5],[x+21,362]],'#eca765');rect(c,x,348,10,18,'#f6d39b');}
  for(let i=0;i<16;i++)rect(c,(i*113+Math.sin(time+i)*20)%960,170+(i*43)%240,2,2,'#d0b68b');
 }
 rect(c,0,419,960,121,s.ground);rect(c,0,419,960,6,'#aa9780');rect(c,0,425,960,3,'#242e34');
 for(let row=0;row<5;row++){const y=437+row*25;rect(c,0,y,960,2,'#262e37');for(let col=0;col<14;col++)rect(c,col*87+(row%2)*42,y,2,25,'#282f37');}
 for(let i=0;i<28;i++)rect(c,(i*137)%960,445+(i*17)%88,15,2,'#525452');
 rect(c,0,504,960,36,'#1b2933');text(c,s.tag,24,526,12,'#97a6a5','left');text(c,'R E T R O   S T R E E T   F I G H T E R',936,526,10,'#899393','right');
}
export function drawFighter(c,f,time=0,options={}){
 const scale=options.scale||1;const dead=f.hp<=0;
 if(!options.portrait){c.fillStyle='#13212766';c.beginPath();c.ellipse(f.x,FLOOR+3,f.id==='titan'?46:36,9,0,0,Math.PI*2);c.fill();}
 if(f.trail&&!options.ghost)for(const t of f.trail){c.save();c.globalAlpha=t.life*.8;drawFighter(c,{...f,x:t.x,y:t.y,trail:[]},time,{...options,ghost:true});c.restore();}
 c.save();c.translate(Math.round(f.x),Math.round(f.y));c.scale(f.face*scale,scale);
 if(f.invuln>0&&Math.floor(time*22)%2===0)c.globalAlpha=.5;
 if(dead){c.translate(0,-10);c.rotate(-1.4);}else if(f.slam>0){c.translate(0,-30);c.rotate((.6-f.slam)*8);}
 const a=f.attack,m=a?.move,p=attackPhase(f),active=a&&a.t>=m.startup&&a.t<m.startup+m.active;
 const walk=Math.sin((f.walk||0)*1.5),bob=Math.sin(time*5)*2;
 let hip=[0,-52],chest=[-4,-87],head=[-1,-110];
 if(f.crouch){hip=[-5,-28];chest=[2,-51];head=[8,-72];}
 else if(f.y<FLOOR-5){hip=[0,-58];chest=[0,-89];head=[2,-113];}
 else {hip[1]+=bob;chest[1]+=bob;head[1]+=bob;}
 if(f.stun>0){chest[0]-=12;head[0]-=17;}
 if(f.land>0){hip[1]+=9;chest[1]+=9;head[1]+=9;}
 const width=f.id==='titan'?25:f.id==='mina'?15:19;
 let backFoot=[-25-walk*9,0],frontFoot=[25+walk*9,0],backKnee=[-20,-26],frontKnee=[18,-26];
 if(f.crouch){backKnee=[-28,-16];frontKnee=[27,-19];}
 if(f.y<FLOOR-5){backFoot=[-30,-20];frontFoot=[30,-27];backKnee=[-21,-44];frontKnee=[23,-52];}
 let backElbow=[-26,chest[1]+21],backHand=[-23,chest[1]+4],elbow=[24,chest[1]+10],hand=[32,chest[1]-9];
 if(f.guard){hand=[19,head[1]+1];elbow=[33,chest[1]+17];backHand=[8,head[1]+9];backElbow=[-5,chest[1]+22];}
 if(f.stun>0){hand=[-3,chest[1]+28];elbow=[14,chest[1]+35];}
 if(a){
  const wind=a.t<m.startup,extension=active?Math.sin(Math.PI*p):wind?-.3:Math.max(0,1-(a.t-m.startup-m.active)/m.recovery)*.15;
  if(['punch','flurry','stretch','breath','projectile','throw'].includes(m.type)){
   const range=m.type==='stretch'&&m.limb==='arm'?(attackBox(f)?.range||45):m.type==='breath'?50:m.type==='throw'?55:m.range*f.reach;
   if(m.limb!=='leg'){hand=[active?range+12:28+extension*20,chest[1]+(f.crouch?13:4)];elbow=[hand[0]*.5,chest[1]+9];}
  }
  if(['kick','spin','dash','dive'].includes(m.type)||m.limb==='leg'){
   const range=m.limb==='leg'?(attackBox(f)?.range||40):m.range*f.reach;
   if(active){frontFoot=[range+10,-(f.crouch?33:58)];frontKnee=[range*.45,-48];}
   else if(wind){frontKnee=[30,-52];frontFoot=[18,-34];}
  }
  if(m.type==='rise'&&active){hand=[29,-151];elbow=[35,-115];frontKnee=[32,-53];frontFoot=[25,-31];}
  if(m.type==='throw'&&active){hand=[20,-140];elbow=[38,-105];backHand=[-10,-141];backElbow=[-27,-102];}
  if(m.type==='float'){backFoot=[10,-18];frontFoot=[-18,-16];backKnee=[-32,-40];frontKnee=[32,-40];hand=[32,-66];backHand=[-32,-66];}
  if(m.type==='spin'&&active){backHand=[-52,-86];backElbow=[-32,-82];hand=[55,-84];elbow=[30,-83];}
 }
 if(f.victory){hand=[33,-143];elbow=[40,-114];backHand=[-35,-114];backElbow=[-35,-91];}
 const cloth=f.cloth,skin=f.skin,dark='#29333a';
 segment(c,hip,backKnee,width,cloth);segment(c,backKnee,backFoot,width-3,f.id==='agni'?skin:cloth);segment(c,[backFoot[0]-8,backFoot[1]-3],[backFoot[0]+10,backFoot[1]-3],10,f.id==='ryuji'||f.id==='agni'?skin:dark);
 segment(c,chest,backElbow,13,skin);segment(c,backElbow,backHand,12,skin);
 poly(c,[[chest[0]-width,chest[1]-7],[chest[0]+width,chest[1]-7],[hip[0]+width-3,hip[1]+9],[hip[0]-width+3,hip[1]+9]],f.id==='titan'||f.id==='agni'?skin:cloth);
 if(f.id==='ryuji'){poly(c,[[-14,chest[1]-6],[4,chest[1]+19],[12,chest[1]-6]],skin);segment(c,[-12,chest[1]-5],[6,chest[1]+29],4,'#9faeaa');rect(c,-18,hip[1]-1,36,7,'#d78354');rect(c,5,hip[1]+4,6,22,'#d78354');}
 if(f.id==='kazan'){rect(c,-15,chest[1]+9,31,7,'#354b45');rect(c,5,chest[1],10,15,'#b3a779');rect(c,-17,hip[1],35,7,'#263e39');}
 if(f.id==='titan'){segment(c,[-16,chest[1]-3],[-10,hip[1]],7,cloth);segment(c,[16,chest[1]-3],[10,hip[1]],7,cloth);rect(c,-21,hip[1]-2,42,13,cloth);rect(c,-10,hip[1],20,9,'#e6b66c');}
 if(f.id==='mina'){rect(c,-15,chest[1]+17,30,9,skin);rect(c,-18,hip[1],36,10,'#d294b9');rect(c,-13,hip[1]+11,9,13,'#d294b9');}
 if(f.id==='agni'){segment(c,[-16,chest[1]-8],[14,hip[1]],12,cloth);for(let i=0;i<5;i++)rect(c,-13+i*6,chest[1]+5+Math.abs(i-2)*-3,4,5,'#bfd0bb');rect(c,-17,hip[1],34,10,'#dba16b');}
 if(f.id==='bolt'){poly(c,[[-2,chest[1]-5],[12,chest[1]-5],[3,chest[1]+9],[14,chest[1]+9],[-6,hip[1]-3],[-1,chest[1]+14],[-11,chest[1]+14]],f.color);}
 segment(c,hip,frontKnee,width,cloth);segment(c,frontKnee,frontFoot,width-3,f.id==='agni'?skin:cloth);segment(c,[frontFoot[0]-8,frontFoot[1]-3],[frontFoot[0]+13,frontFoot[1]-3],10,f.id==='ryuji'||f.id==='agni'?skin:dark);
 segment(c,chest,elbow,14,f.id==='ryuji'?cloth:skin);segment(c,elbow,hand,12,skin);rect(c,hand[0]-6,hand[1]-6,13,13,f.id==='agni'?skin:f.color);
 rect(c,head[0]-8,head[1]+9,15,10,skin);rect(c,head[0]-12,head[1]-12,25,26,skin);rect(c,head[0]-15,head[1]-9,6,16,skin);rect(c,head[0]+10,head[1],7,6,skin);rect(c,head[0]+6,head[1]-3,5,3,'#192c30');rect(c,head[0]+6,head[1]+9,7,2,'#664b44');
 if(f.id==='agni'){rect(c,head[0]-13,head[1]-13,27,6,'#b9c0aa');rect(c,head[0]-6,head[1]-19,14,9,'#b9c0aa');rect(c,head[0]+3,head[1]-9,4,4,'#ebac72');rect(c,head[0]-12,head[1]+9,8,13,'#b9c0aa');}
 else {rect(c,head[0]-13,head[1]-16,27,10,f.id==='bolt'?'#c3db8a':'#263337');if(f.id==='bolt')poly(c,[[-12,head[1]-14],[-7,head[1]-26],[0,head[1]-19],[8,head[1]-28],[12,head[1]-13]],'#c3db8a');if(f.id==='mina'){rect(c,head[0]-19,head[1]-12,10,12,'#293035');segment(c,[-18,head[1]],[-28,head[1]+34],8,'#293035');}rect(c,head[0]-13,head[1]-6,26,4,f.color);if(f.id==='ryuji'||f.id==='kazan')poly(c,[[-13,head[1]-5],[-36,head[1]-8+Math.sin(time*9)*4],[-29,head[1]+1],[-13,head[1]-2]],f.color);}
 if(active&&m.type==='breath'){for(let i=0;i<7;i++){const len=30+i*((attackBox(f)?.range||205)-35)/6;poly(c,[[22,-102],[len,-115+Math.sin(time*30+i)*10],[len+22,-85],[len,-64-Math.sin(time*22+i)*7]],i%2?'#ffd17d':'#ed754a');}}
 if(active&&f.id==='bolt'){c.strokeStyle=f.color;c.lineWidth=3;c.beginPath();c.moveTo(-36,-20);c.lineTo(-49,-57);c.lineTo(-29,-48);c.lineTo(-41,-103);c.lineTo(-17,-81);c.stroke();}
 if(active&&['spin','rise'].includes(m.type)){c.strokeStyle=f.color;c.globalAlpha=.6;c.lineWidth=5;c.beginPath();c.ellipse(12,-65,64,49,-p*4,0,Math.PI*1.5);c.stroke();}
 c.restore();
}
export function drawMatch(c,match,stage,time,fx=[],debug=false){
 c.save();if(match.shake)c.translate(Math.sin(time*140)*match.shake,Math.cos(time*123)*match.shake*.5);
 drawStage(c,stage,time);
 for(const [i,f] of match.fighters.entries())drawFighter(c,{...f,victory:(match.phase==='ended'||match.phase==='over')&&match.result?.winner===i},time);
 for(const p of match.projectiles){const dir=Math.sign(p.v);poly(c,[[p.x-dir*42,p.y-7],[p.x+dir*9,p.y-20],[p.x+dir*28,p.y],[p.x+dir*9,p.y+20],[p.x-dir*42,p.y+7]],p.color);rect(c,p.x-10,p.y-7,23,14,'#f3f5d0');}
 for(const f of fx){c.globalAlpha=Math.max(0,f.life/f.max);for(let i=0;i<9;i++){const angle=i*Math.PI*2/9,d=(1-f.life/f.max)*60;rect(c,f.x+Math.cos(angle)*d,f.y+Math.sin(angle)*d,4+i%3,3,f.color);}c.globalAlpha=1;}
 if(debug){c.lineWidth=1;for(const f of match.fighters){const b=attackBox(f);if(b){c.strokeStyle='#ff4949';c.strokeRect(b.x,b.y,b.w,b.h);}}}
 c.restore();
}
export function drawHud(c,match){
 const [a,b]=match.fighters;
 for(let i=0;i<2;i++){
  const f=i?b:a,x=i?552:32;rect(c,x,30,376,23,'#14252b');rect(c,x+3,33,370,17,'#633f3d');const health=370*f.hp/f.maxHp;rect(c,i?x+373-health:x+3,33,health,17,f.hp/f.maxHp<.3?'#e77d64':'#d8db9f');rect(c,x+3,33,health,3,'#ecedbe');text(c,f.name,i?928:32,23,17,'#ebe8d5',i?'right':'left');text(c,i?'CPU':'1P',i?552:408,23,11,'#b7d8ce',i?'left':'right');
  for(let j=0;j<2;j++){const wx=i?908-j*19:42+j*19;poly(c,[[wx,63],[wx+6,69],[wx,75],[wx-6,69]],match.wins[i]>j?'#eda778':'#69746a');}
 }
 rect(c,441,12,78,57,'#172a31');text(c,String(Math.ceil(match.time)).padStart(2,'0'),480,50,37,'#eee6cc');text(c,'TIME',480,67,9,'#91a7a3');
 let label='',sub='';
 if(match.phase==='intro'){label=match.phaseTime>1?'ROUND '+match.round:'FIGHT';sub=match.phaseTime>1?'FIRST TO TWO WINS':'MAKE YOUR MOVE';}
 if(match.phase==='ended'){label=match.result.draw?'DRAW':match.result.reason;sub=match.result.draw?'동점 · 승수 없이 같은 라운드를 재경기합니다':`${match.fighters[match.result.winner].name} WINS`;}
 if(label){rect(c,0,187,960,120,'#13252bcb');text(c,label,480,252,56,'#efb782');text(c,sub,480,283,15,'#e0e1c7');}
}
