import {FLOOR, attackBox, attackPhase} from './engine.js';

// Paint on a half-resolution reusable surface, then enlarge without smoothing.
// Every palette, silhouette and animation here is original procedural artwork.
const PALETTES = {
  ryuji:{cloth:['#6c798a','#b1b9bd','#e5e8d7','#fff5d4'],skin:['#754638','#b97750','#e6aa77','#ffd49b'],accent:'#bf4944',hair:'#332d32'},
  kazan:{cloth:['#273c36','#4f6750','#7e9562','#a5b57b'],skin:['#6b4438','#a86e4d','#d49b70','#f1c494'],accent:'#dda35b',hair:'#b7ad74'},
  titan:{cloth:['#512839','#8e3447','#c8555b','#ec8573'],skin:['#663c35','#a56349','#d29564','#efba82'],accent:'#e3b75e',hair:'#49302d'},
  mina:{cloth:['#283e70','#355f9e','#628fd0','#a0c4e7'],skin:['#805044','#b97e5c','#e8b085','#ffdab0'],accent:'#f0b8c3',hair:'#282d3c'},
  agni:{cloth:['#683e30','#a75a35','#d88845','#efb669'],skin:['#554c55','#89706a','#b4947d','#dec29a'],accent:'#e5c27e',hair:'#d2d5bd'},
  bolt:{cloth:['#203b50','#2d6170','#4b9b9a','#82c3b4'],skin:['#654334','#a76e4c','#d39d6c','#f3c58a'],accent:'#c4e866',hair:'#bbc879'}
};
let surface;
function polygon(c,points,color){c.fillStyle=color;c.beginPath();for(let i=0;i<points.length;i++)i?c.lineTo(...points[i]):c.moveTo(...points[i]);c.closePath();c.fill();}
function box(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const ease=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
function outlined(c,points,colors){
  c.lineWidth=3;c.strokeStyle='#202432';c.lineJoin='miter';c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=colors[1];c.fill();c.stroke();
  c.save();c.clip();const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
  polygon(c,[[x,y+h*.5],[x+w*.48,y+h*.3],[x+w,y+h*.62],[x+w,y+h],[x,y+h]],colors[0]);
  polygon(c,[[x+2,y+2],[x+w*.68,y+2],[x+w*.45,y+h*.48],[x+2,y+h*.62]],colors[2]);
  box(c,x+3,y+3,Math.max(2,w*.27),3,colors[3]);c.restore();
}
function limb(c,a,b,wa,wb,palette){
 const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.max(1,Math.hypot(dx,dy)),nx=-dy/length,ny=dx/length;
 const side=(p,w,dir)=>[p[0]+nx*w*dir,p[1]+ny*w*dir];
 const mid=mix(a,b,.4);
 outlined(c,[side(a,wa,.8),side(mid,wa,1),side(b,wb,.85),side(b,wb,-.85),side(mid,wa,-1),side(a,wa,-.8)],palette);
 // Directional highlight follows the limb, including AGNI's long extensions.
 const hi=mix(side(a,wa,.45),side(b,wb,.45),.12),end=mix(side(a,wa,.45),side(b,wb,.45),.76);
 c.strokeStyle=palette[3];c.lineWidth=2;c.beginPath();c.moveTo(...hi);c.lineTo(...end);c.stroke();
}
export function fighterPose(f,time=0){
 const a=f.attack,m=a?.move,p=attackPhase(f),active=!!a&&a.t>=m.startup&&a.t<m.startup+m.active;
 const grounded=f.y>=FLOOR-5,walking=(f.walk||0),step=Math.sin(walking*1.5),idle=Math.sin(time*(f.id==='bolt'?7:4));
 const build={ryuji:1,kazan:1.04,titan:1.4,mina:.82,agni:.85,bolt:.94}[f.id]||1;
 const pose={hip:[-1,-54],chest:[-5,-87],head:[-2,-112],backKnee:[-25,-27],backFoot:[-33,0],knee:[20,-28],foot:[32,0],backElbow:[-27,-71],backHand:[-10,-89],elbow:[20,-70],hand:[35,-92],build,active,move:m};
 if(grounded&&!f.crouch){pose.hip[1]+=idle*1.3;pose.chest[1]+=idle*2;pose.head[1]+=idle*2;pose.hand[1]+=idle*2;pose.backFoot[0]-=step*9;pose.foot[0]+=step*8;pose.knee[1]-=Math.abs(step)*4;}
 if(f.crouch){Object.assign(pose,{hip:[-6,-27],chest:[4,-53],head:[10,-78],backKnee:[-31,-16],backFoot:[-35,0],knee:[29,-18],foot:[34,0],elbow:[29,-39],hand:[38,-63],backElbow:[-20,-42],backHand:[1,-63]});}
 if(!grounded){pose.hip=[-2,-58];pose.backKnee=[-26,-39];pose.backFoot=[-37,-21];pose.knee=[28,-56];pose.foot=[28,-29];}
 if(f.guard){pose.hand=[23,pose.head[1]+3];pose.elbow=[32,pose.chest[1]+14];pose.backHand=[6,pose.head[1]+10];pose.backElbow=[-10,pose.chest[1]+19];}
 if(f.stun>0){pose.chest[0]-=11;pose.head[0]-=17;pose.hand=[4,pose.chest[1]+23];pose.elbow=[19,pose.chest[1]+30];}
 if(f.land>0)for(const key of ['hip','chest','head','elbow','hand','backHand','backElbow'])pose[key][1]+=7;
 if(a){
  const wind=a.t<m.startup,recovery=Math.max(0,(a.t-m.startup-m.active)/m.recovery),reach=attackBox(f)?.range||m.range*f.reach;
  const extension=active?1:wind?-.18:1-ease(recovery);
  if(['punch','flurry','stretch','breath','projectile','throw'].includes(m.type)&&m.limb!=='leg'){
   const range=['breath','projectile','throw'].includes(m.type)?55:reach;
   const center=pose.chest[1]+(f.crouch?17:3);
   const pulse=m.type==='flurry'?Math.sin(p*Math.PI*6):0;
   pose.hand=mix(pose.hand,[range+12,center+pulse*8],extension);
   pose.elbow=[pose.hand[0]*.48,center+9-pulse*4];
   if(wind){pose.chest[0]-=3;pose.hand[1]+=7;}
  }
  if(['kick','spin','dash','dive'].includes(m.type)||m.limb==='leg'){
   if(wind){pose.knee=[28,-62];pose.foot=[17,-41];}
   else {const amount=active?1:1-ease(recovery);pose.foot=mix(pose.foot,[reach+11,f.crouch?-33:-58],amount);pose.knee=mix(pose.knee,[reach*.42,-51],amount);pose.chest[0]-=7*amount;}
  }
  if(m.type==='rise'&&active){pose.hand=[27,-153];pose.elbow=[36,-117];pose.knee=[33,-58];pose.foot=[23,-36];}
  if(m.type==='throw'&&active){pose.hand=[22,-144];pose.elbow=[39,-108];pose.backHand=[-12,-140];pose.backElbow=[-29,-101];}
  if(m.type==='float'){pose.backFoot=[11,-21];pose.foot=[-16,-18];pose.backKnee=[-34,-43];pose.knee=[34,-43];pose.hand=[34,-67];pose.backHand=[-34,-67];}
  if(m.type==='spin'&&active){pose.backHand=[-51,-86];pose.backElbow=[-30,-83];pose.hand=[53,-85];pose.elbow=[31,-83];}
 }
 if(f.victory){pose.hand=[28,-151];pose.elbow=[41,-119];pose.backHand=[-32,-127];pose.backElbow=[-39,-96];}
 return pose;
}
function paintHead(c,f,p,pal,time){
 const [x,y]=p.head,skin=pal.skin; c.save();c.translate(x,y);
 outlined(c,[[-12,-10],[-5,-15],[8,-13],[14,-6],[13,0],[18,3],[12,7],[10,14],[0,17],[-10,10],[-13,0]],skin);
 box(c,-13,-1,5,9,skin[1]);box(c,-12,1,2,5,skin[0]);polygon(c,[[3,6],[13,4],[11,11],[3,12]],skin[1]);
 box(c,3,-2,10,3,'#30303a');box(c,5,1,7,3,'#fff2d4');box(c,10,1,3,3,'#252635');box(c,5,10,7,2,'#754137');box(c,9,6,5,2,skin[3]);
 if(f.id==='agni'){
  polygon(c,[[-13,-4],[-13,-13],[-5,-17],[9,-16],[13,-8],[6,-10],[-4,-10],[-7,-2]],pal.hair);box(c,-4,-23,10,9,pal.hair);box(c,-2,-22,4,3,'#eff0ce');box(c,1,-8,4,4,'#f3b557');
  polygon(c,[[-7,10],[-1,13],[7,12],[4,20],[-3,21],[-9,16]],pal.hair);box(c,-9,12,3,5,'#a0aa9a');
 }else if(f.id==='titan'){
  polygon(c,[[-13,-2],[-14,-12],[-8,-18],[4,-18],[12,-11],[11,-6],[-5,-8],[-9,1]],pal.hair);
  polygon(c,[[-9,7],[-3,11],[6,9],[13,7],[11,17],[3,21],[-6,17]],pal.hair);box(c,4,10,7,2,'#e5b78a');box(c,-2,-14,8,3,'#785346');
 }else if(f.id==='mina'){
  polygon(c,[[-13,5],[-16,-9],[-9,-18],[6,-18],[14,-12],[14,-4],[6,-8],[1,-3],[-5,-8],[-9,8]],pal.hair);
  for(const sx of [-15,9]){polygon(c,[[sx,-9],[sx-4,-15],[sx+2,-20],[sx+8,-17],[sx+8,-10]],pal.hair);box(c,sx,-16,6,3,pal.accent);}
  const sway=Math.sin(time*7)*3;polygon(c,[[-15,-12],[-24+sway,19],[-17+sway,15],[-9,-11]],pal.accent);
 }else if(f.id==='bolt'){
  polygon(c,[[-14,-6],[-17,-16],[-8,-13],[-7,-27],[1,-19],[7,-29],[10,-17],[18,-21],[13,-8],[5,-10],[-4,-7]],pal.hair);polygon(c,[[-7,-13],[1,-20],[0,-10],[8,-16],[6,-8]],pal.accent);
 }else if(f.id==='kazan'){
  polygon(c,[[-13,1],[-14,-14],[-9,-20],[11,-20],[13,-12],[5,-10],[-5,-11],[-6,-1]],pal.hair);box(c,-8,-19,18,3,'#dfd399');box(c,-14,-3,7,4,'#c7b17e');
 }else{
  polygon(c,[[-13,4],[-16,-7],[-12,-18],[-4,-16],[1,-22],[7,-17],[15,-18],[12,-6],[4,-8],[-2,-3],[-7,-8],[-9,4]],pal.hair);
  box(c,-14,-7,27,5,pal.accent);box(c,-5,-7,12,2,'#ed8f72');const flap=Math.sin(time*8)*3;
  polygon(c,[[-13,-6],[-36,-9+flap],[-30,-3+flap],[-14,-2]],pal.accent);polygon(c,[[-14,-3],[-27,6+flap],[-30,1+flap],[-16,-5]],'#e06a58');
 }
 c.restore();
}
function paintBody(c,f,p,pal,time){
 const skin=pal.skin,cloth=pal.cloth,backCloth=[cloth[0],cloth[0],cloth[1],cloth[2]],backSkin=[skin[0],skin[0],skin[1],skin[2]];
 const width=18*p.build,arm=8*p.build,leg=f.id==='agni'?8:10*p.build;
 const shoulderBack=[p.chest[0]-width*.68,p.chest[1]],shoulder=[p.chest[0]+width*.68,p.chest[1]];
 const bareLeg=['agni','titan','mina'].includes(f.id),bareBody=f.id==='agni'||f.id==='titan';
 function foot(point,back=false){const barefoot=['agni','ryuji'].includes(f.id),colors=barefoot?(back?backSkin:skin):(back?backCloth:cloth);outlined(c,[[point[0]-10,point[1]-9],[point[0]+7,point[1]-8],[point[0]+17,point[1]-2],[point[0]+16,point[1]+3],[point[0]-12,point[1]+3]],colors);if(!barefoot)box(c,point[0]-11,point[1]+1,27,3,'#28303a');}
 limb(c,[p.hip[0]-9,p.hip[1]],p.backKnee,leg+2,leg,['titan','mina'].includes(f.id)?backSkin:backCloth);limb(c,p.backKnee,p.backFoot,leg,leg*.72,bareLeg?backSkin:backCloth);foot(p.backFoot,true);
 limb(c,shoulderBack,p.backElbow,arm+2,arm-1,backSkin);limb(c,p.backElbow,p.backHand,arm,arm*.7,backSkin);
 const chest=p.chest,hip=p.hip;
 const torso=[[chest[0]-width,chest[1]-8],[chest[0]-width*.3,chest[1]-13],[chest[0]+width*.7,chest[1]-12],[chest[0]+width+3,chest[1]-3],[chest[0]+width-1,chest[1]+18],[hip[0]+width*.66,hip[1]+7],[hip[0]-width*.7,hip[1]+7],[chest[0]-width+3,chest[1]+16]];
 outlined(c,torso,bareBody?skin:cloth);
 if(bareBody){
  polygon(c,[[chest[0]-13,chest[1]+1],[chest[0]-2,chest[1]-2],[chest[0]+1,chest[1]+9],[chest[0]-9,chest[1]+11]],skin[2]);
  polygon(c,[[chest[0]+3,chest[1]-1],[chest[0]+18,chest[1]+3],[chest[0]+13,chest[1]+12],[chest[0]+2,chest[1]+10]],skin[2]);
  box(c,chest[0],chest[1]+11,2,15,skin[0]);for(let row=0;row<2;row++){box(c,chest[0]-7,chest[1]+15+row*7,5,3,skin[2]);box(c,chest[0]+4,chest[1]+15+row*7,5,3,skin[1]);}
 }
 if(f.id==='ryuji'){
  polygon(c,[[chest[0]-10,chest[1]-10],[chest[0]+1,chest[1]+15],[chest[0]+13,chest[1]-10]],skin[1]);
  polygon(c,[[chest[0]-15,chest[1]-9],[chest[0]-10,chest[1]-12],[chest[0]+8,chest[1]+20],[hip[0]+5,hip[1]+1],[chest[0]-5,chest[1]+6]],cloth[3]);
  polygon(c,[[chest[0]+12,chest[1]-10],[chest[0]+17,chest[1]-7],[chest[0]-2,chest[1]+23],[chest[0]-7,chest[1]+19]],cloth[2]);
  box(c,hip[0]-16,hip[1]-1,34,6,pal.accent);polygon(c,[[hip[0]+2,hip[1]+2],[hip[0]+9,hip[1]+3],[hip[0]+17,hip[1]+24],[hip[0]+11,hip[1]+25]],pal.accent);
  for(let i=0;i<3;i++)box(c,chest[0]+10-i*2,chest[1]+22+i*3,7,2,cloth[0]);
 }else if(f.id==='kazan'){
  box(c,chest[0]-4,chest[1]-10,9,11,skin[1]);box(c,chest[0]+2,chest[1]+2,3,16,'#c4c6b0');box(c,chest[0],chest[1]+15,8,5,'#d6d7c5');
  box(c,hip[0]-18,hip[1]-1,36,7,'#493d36');box(c,hip[0]-3,hip[1],8,5,pal.accent);
  for(let i=0;i<3;i++)polygon(c,[[chest[0]-13+i*10,chest[1]+9],[chest[0]-5+i*9,chest[1]+12],[chest[0]-9+i*8,chest[1]+17]],cloth[0]);
 }else if(f.id==='titan'){
  outlined(c,[[hip[0]-25,hip[1]-4],[hip[0]+25,hip[1]-4],[hip[0]+22,hip[1]+13],[hip[0]+9,hip[1]+24],[hip[0]-6,hip[1]+15],[hip[0]-23,hip[1]+18]],cloth);
  box(c,hip[0]-26,hip[1]-4,53,7,pal.accent);outlined(c,[[hip[0]-10,hip[1]-6],[hip[0]+10,hip[1]-6],[hip[0]+12,hip[1]+6],[hip[0],hip[1]+12],[hip[0]-12,hip[1]+6]],['#9e672f','#c49541','#efd276','#fff0b3']);
 }else if(f.id==='mina'){
  box(c,chest[0]-5,chest[1]-13,9,5,pal.accent);polygon(c,[[chest[0]+7,chest[1]-11],[chest[0]+13,chest[1]-6],[hip[0]-6,hip[1]+4],[hip[0]-11,hip[1]+1]],cloth[3]);
  for(let i=0;i<3;i++)box(c,chest[0]+5-i*3,chest[1]+3+i*6,5,2,pal.accent);
  polygon(c,[[hip[0]-16,hip[1]-2],[hip[0]+16,hip[1]-2],[hip[0]+27,hip[1]+24],[hip[0]+8,hip[1]+19],[hip[0],hip[1]+7],[hip[0]-6,hip[1]+25],[hip[0]-25,hip[1]+19]],cloth[1]);box(c,hip[0]-17,hip[1]-2,34,5,pal.accent);
 }else if(f.id==='agni'){
  polygon(c,[[chest[0]-14,chest[1]-11],[chest[0]-7,chest[1]-12],[hip[0]+14,hip[1]+3],[hip[0]+4,hip[1]+8]],cloth[2]);
  for(let i=0;i<7;i++){const x=chest[0]-14+i*4,y=chest[1]+1+Math.sin(i/6*Math.PI)*11;box(c,x-2,y-2,5,5,pal.accent);box(c,x-1,y-2,2,2,'#ffdd9e');}
  outlined(c,[[hip[0]-17,hip[1]-4],[hip[0]+16,hip[1]-4],[hip[0]+20,hip[1]+21],[hip[0]+1,hip[1]+28],[hip[0]-23,hip[1]+14]],cloth);box(c,hip[0]-17,hip[1]-3,35,5,pal.accent);
 }else if(f.id==='bolt'){
  polygon(c,[[chest[0]+1,chest[1]-9],[chest[0]+11,chest[1]-9],[chest[0]+2,chest[1]+6],[chest[0]+13,chest[1]+6],[hip[0]-7,hip[1]+4],[chest[0]-1,chest[1]+12],[chest[0]-10,chest[1]+12]],pal.accent);
  box(c,hip[0]-17,hip[1],34,5,'#9bd0b2');
 }
 limb(c,[p.hip[0]+8,p.hip[1]],p.knee,leg+2,leg,['titan','mina'].includes(f.id)?skin:cloth);limb(c,p.knee,p.foot,leg,leg*.72,bareLeg?skin:cloth);foot(p.foot);
 if(['titan','mina'].includes(f.id))limb(c,mix(p.knee,p.foot,.3),mix(p.knee,p.foot,.88),leg,leg*.8,cloth);
 if(f.id==='kazan'){const pocket=mix(p.hip,p.knee,.58);box(c,pocket[0]-6,pocket[1]-5,11,12,cloth[0]);box(c,pocket[0]-5,pocket[1]-4,8,3,cloth[2]);}
 limb(c,shoulder,p.elbow,arm+2,arm-1,f.id==='ryuji'?cloth:skin);limb(c,p.elbow,p.hand,arm,arm*.72,skin);
 const [hx,hy]=p.hand;const glove=['ryuji','bolt','titan'].includes(f.id);
 outlined(c,[[hx-7,hy-7],[hx+4,hy-8],[hx+10,hy-3],[hx+10,hy+5],[hx+2,hy+8],[hx-7,hy+5]],glove?[pal.accent,pal.accent,pal.accent,'#ffd5a0']:skin);
 box(c,hx+1,hy-5,6,2,glove?'#f6c597':skin[3]);box(c,hx+3,hy+1,7,2,glove?'#873e3e':skin[1]);
 // Wrist wraps and visible finger divisions add readable sprite detail.
 limb(c,mix(p.elbow,p.hand,.78),mix(p.elbow,p.hand,.88),arm*.82,arm*.8,f.id==='agni'?['#8d6c35','#b39450','#e5c988','#f3e2a8']:['#7b858d','#acb4af','#d8d9c0','#ece7cc']);
 limb(c,[p.head[0]-2,p.head[1]+11],[p.chest[0]+1,p.chest[1]-5],7,8,skin);paintHead(c,f,p,pal,time);
}
function paintEffects(c,f,p,pal,time){
 if(!p.active)return;const m=p.move,phase=attackPhase(f);
 if(m.type==='breath'){
  const range=attackBox(f)?.range||205;
  for(let i=0;i<9;i++){const distance=25+i*(range-24)/8,wave=Math.sin(time*35+i*2)*8,envelope=Math.sin((i+1)/11*Math.PI);polygon(c,[[24,-104],[distance,-102-24*envelope+wave],[distance+20,-90],[distance,-75+15*envelope-wave]],i%2?'#f7a340':'#d64e37');if(i<7)polygon(c,[[26,-99],[distance,-101-wave*.5],[distance+8,-87],[distance,-85]],'#ffe39a');}
 }
 if(f.id==='bolt')for(let i=0;i<3;i++){const x=-35+i*38;const wave=Math.sin(time*53+i)*11;c.strokeStyle=i===1?'#efffc0':pal.accent;c.lineWidth=3;c.beginPath();c.moveTo(x,-18);c.lineTo(x-11,-45+wave);c.lineTo(x+3,-42);c.lineTo(x-10,-87);c.lineTo(x+7,-76+wave);c.lineTo(x,-123);c.stroke();}
 if(['rise','spin','dash','dive'].includes(m.type)){c.strokeStyle=f.color;c.lineWidth=5;c.globalAlpha*=.55;c.beginPath();c.ellipse(12,-66,61,48,-phase*4,0,Math.PI*1.4);c.stroke();}
}
export function drawFighter(c,f,time=0,options={}){
 if(!surface){surface=document.createElement('canvas');surface.width=384;surface.height=256;}
 const scale=options.scale||1,pal=PALETTES[f.id]||PALETTES.ryuji;
 if(!options.portrait&&!options.ghost){c.fillStyle='#101a2480';c.beginPath();c.ellipse(f.x,FLOOR+4,f.id==='titan'?46:34,7,0,0,Math.PI*2);c.fill();}
 if(!options.ghost&&f.trail)for(const t of f.trail){c.save();c.globalAlpha=t.life*1.5;drawFighter(c,{...f,x:t.x,y:t.y,trail:[]},time,{...options,ghost:true});c.restore();}
 const local=surface.getContext('2d');local.clearRect(0,0,384,256);local.save();local.translate(192,210);local.scale(.5,.5);
 if(f.hp<=0){local.translate(0,-12);local.rotate(-1.4);}else if(f.slam>0){local.translate(0,-30);local.rotate((.6-f.slam)*8);}
 const pose=fighterPose(f,time);paintBody(local,f,pose,pal,time);paintEffects(local,f,pose,pal,time);local.restore();
 c.save();c.translate(Math.round(f.x),Math.round(f.y));c.scale(f.face*scale,scale);c.imageSmoothingEnabled=false;if(f.invuln>0&&Math.floor(time*22)%2===0)c.globalAlpha*=.45;c.drawImage(surface,-384,-420,768,512);c.restore();
}
