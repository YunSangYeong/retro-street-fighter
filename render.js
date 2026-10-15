import {drawFighter} from './fighter-art.js';
export {drawFighter} from './fighter-art.js';
import { WIDTH, HEIGHT, attackBox } from './engine.js';
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
