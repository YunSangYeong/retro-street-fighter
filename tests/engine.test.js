import test from 'node:test';
import assert from 'node:assert/strict';
import {Match,ROSTER,FLOOR,moveFor,attackBox,hurtBox,overlaps} from '../engine.js';
const run=(m,seconds,input={})=>{for(let i=0;i<Math.ceil(seconds*60);i++)m.step(1/60,input,false);};
const ready=(a='ryuji',b='kazan')=>{const m=new Match(a,b,'normal',()=>.5);m.phase='fight';return m;};
test('all six characters have distinct stats and legal special moves',()=>{
 assert.equal(ROSTER.length,6);assert.equal(new Set(ROSTER.map(f=>f.speed)).size,6);
 for(const c of ROSTER)for(const key of ['z','x','c','a','s','d']){const m=moveFor(c.id,key);assert.ok(m);assert.ok(m.startup>0&&m.recovery>0);}
});
test('startup, active collision, single hit and recovery stay synchronized',()=>{
 const m=ready(),[a,b]=m.fighters;a.x=400;b.x=480;
 m.attack(a,'x');run(m,.1);assert.equal(b.hp,b.maxHp);assert.equal(attackBox(a),null);
 run(m,.18);assert.ok(b.hp<b.maxHp);const hp=b.hp;
 run(m,.12);assert.equal(b.hp,hp);assert.equal(m.attack(a,'z'),false);
 run(m,.4);assert.equal(m.attack(a,'z'),true);
});
test('attacks outside range miss; crouched hurtbox dodges a high punch',()=>{
 const m=ready(),[a,b]=m.fighters;a.x=300;b.x=700;m.attack(a,'x');run(m,.7);assert.equal(b.hp,b.maxHp);
 b.x=370;b.crouch=true;const box=attackBox({...a,attack:{move:moveFor(a.id,'x'),t:.23}});assert.equal(overlaps(box,hurtBox(b)),false);
});
test('backward direction blocks with chip damage; throws bypass guard',()=>{
 const m=ready('titan'),[a,b]=m.fighters;a.x=400;b.x=470;b.guard=true;
 m.hit(a,b,moveFor('titan','x'),a.x);const chip=b.maxHp-b.hp;assert.ok(chip>0&&chip<3);
 b.stun=0;m.hit(a,b,moveFor('titan','a'),a.x);assert.ok(b.hp<b.maxHp-25);
});
test('TITAN grab misses at long range and against airborne opponents',()=>{
 const m=ready('titan'),[a,b]=m.fighters;a.x=300;b.x=520;m.attack(a,'a');run(m,.9);assert.equal(b.hp,b.maxHp);
 b.y=FLOOR-100;assert.equal(m.hit(a,b,moveFor('titan','a'),a.x),false);
});
test('projectile spawns once, moves, damages and disappears on impact',()=>{
 const m=ready(),[a,b]=m.fighters;a.x=200;b.x=620;m.attack(a,'a');run(m,.28);assert.equal(m.projectiles.length,1);const x=m.projectiles[0].x;run(m,.2);assert.ok(m.projectiles[0].x>x);run(m,1);assert.ok(b.hp<b.maxHp);assert.equal(m.projectiles.length,0);
});
test('AGNI arm extends with its hitbox, hits at distance, then retracts',()=>{
 const m=ready('agni'),[a,b]=m.fighters;a.x=300;b.x=555;m.attack(a,'x');a.attack.t=.21;const early=attackBox(a).range;a.attack.t=.30;const extended=attackBox(a).range;assert.ok(extended>early+150);a.attack.t=0;run(m,.42);assert.ok(b.hp<b.maxHp);run(m,.6);assert.equal(attackBox(a),null);assert.equal(a.attack,null);
 assert.equal(moveFor('agni','c').limb,'leg');assert.equal(moveFor('agni','s',true).limb,'leg');
});
test('AGNI float lifts and lands; MINA dive lifts from ground and lands',()=>{
 for(const [id,key] of [['agni','d'],['mina','s']]){const m=ready(id),a=m.fighters[0];m.attack(a,key);run(m,.3);assert.ok(a.y<FLOOR);run(m,2);assert.equal(a.y,FLOOR);}
});
test('jump is edge triggered and grounded crouch lowers hurtbox',()=>{
 const m=ready(),a=m.fighters[0];run(m,.2,{up:true});assert.ok(a.y<FLOOR);run(m,1.1,{up:true});assert.equal(a.y,FLOOR);run(m,.1,{down:true});assert.equal(a.crouch,true);assert.equal(hurtBox(a).h,65);
});
test('special cooldown and hitstun prevent repeated actions',()=>{
 const m=ready(),[a,b]=m.fighters;m.attack(a,'a');run(m,.8);assert.equal(a.attack,null);assert.ok(a.cooldown>0);assert.equal(m.attack(a,'s'),false);run(m,.5);assert.equal(m.attack(a,'s'),true);
 b.stun=.5;assert.equal(m.attack(b,'z'),false);
});
test('combo escape grants invulnerability after four hits',()=>{
 const m=ready(),[a,b]=m.fighters;for(let i=0;i<4;i++)m.hit(a,b,{damage:2,type:'punch'},a.x);assert.ok(b.invuln>0);const hp=b.hp;assert.equal(m.hit(a,b,{damage:2,type:'punch'},a.x),false);assert.equal(b.hp,hp);
});
test('KO and timeout award wins; two wins finish match',()=>{
 const m=ready();m.fighters[1].hp=0;m.step(1/60,{},false);assert.equal(m.wins[0],1);assert.equal(m.phase,'ended');run(m,6);assert.equal(m.phase,'fight');assert.equal(m.round,2);m.fighters[0].hp=90;m.fighters[1].hp=20;m.time=.001;m.step(1/60,{},false);assert.equal(m.result.reason,'TIME UP');run(m,4);assert.equal(m.phase,'over');assert.deepEqual(m.wins,[2,0]);
});
test('timeout and double KO ties replay round without awarding a win',()=>{
 for(const hp of [0,50]){const m=ready();m.fighters.forEach(f=>f.hp=hp);m.time=.001;m.step(1/60,{},false);assert.equal(m.result.draw,true);assert.deepEqual(m.wins,[0,0]);run(m,4);assert.equal(m.round,1);assert.equal(m.phase,'intro');}
});
test('AI observes on delayed intervals and all difficulty levels can fight',()=>{
 for(const difficulty of ['easy','normal','hard']){let seed=34;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);const m=new Match('titan','bolt',difficulty,rng);m.phase='fight';const a=m.aiInput(1/60);assert.equal(m.aiInput(1/60),a);for(let i=0;i<2400;i++)m.step(1/60,{});assert.ok(m.fighters[0].hp<125||m.wins[1]>0);}
});
test('every matchup remains finite and bounded through a simulated fight',()=>{
 for(const c of ROSTER){let seed=123;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);const m=new Match(c.id,c.id,'hard',rng);for(let i=0;i<3600;i++){m.step(1/60,{right:i%180<60,left:i%180>140,up:i%160===0,down:i%150>130,attack:i%35===0?['a','s','d','z','x','c'][Math.floor(i/35)%6]:undefined});for(const f of m.fighters){assert.ok(Number.isFinite(f.x)&&Number.isFinite(f.y)&&Number.isFinite(f.hp));assert.ok(f.x>=35&&f.x<=925&&f.y<=FLOOR&&f.hp>=0);}}}
});

test('crouching attacks retain a low hitbox throughout the active window',()=>{const m=ready(),a=m.fighters[0];run(m,.05,{down:true});m.attack(a,'c');run(m,.18,{down:true});assert.equal(a.crouch,true);assert.equal(attackBox(a).low,true);assert.equal(hurtBox(a).h,65);});
