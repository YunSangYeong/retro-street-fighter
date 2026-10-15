import test from 'node:test';
import assert from 'node:assert/strict';
import {fighter,moveFor,attackBox} from '../engine.js';
import {fighterPose} from '../fighter-art.js';
test('AGNI arm and leg animation endpoints follow the active hitbox',()=>{
 for(const key of ['x','c'])for(const t of [.22,.27,.32,.38]){const f=fighter('agni',300,1);f.attack={move:moveFor('agni',key),t};const pose=fighterPose(f),box=attackBox(f);assert.ok(box);assert.equal(Math.round(key==='x'?pose.hand[0]-12:pose.foot[0]-11),Math.round(box.range));}
});
test('normal strikes smoothly retract during recovery',()=>{const f=fighter('ryuji',300,1),move=moveFor('ryuji','x');f.attack={move,t:move.startup+move.active+.01};const early=fighterPose(f).hand[0];f.attack.t=move.startup+move.active+move.recovery*.8;assert.ok(fighterPose(f).hand[0]<early-25);});
test('character silhouettes and guard/KO related poses remain distinct',()=>{const titan=fighterPose(fighter('titan',300,1)),mina=fighterPose(fighter('mina',300,1));assert.ok(titan.build>mina.build*1.5);const f=fighter('ryuji',300,1),idle=fighterPose(f);f.guard=true;assert.ok(fighterPose(f).hand[1]<idle.hand[1]);f.guard=false;f.crouch=true;assert.ok(fighterPose(f).head[1]>idle.head[1]);});
