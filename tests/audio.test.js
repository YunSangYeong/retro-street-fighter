import test from 'node:test';
import assert from 'node:assert/strict';
import {ArcadeAudio} from '../audio.js';
for(const action of ['pause','mute'])test(`audio queued before ${action} cannot leak into resumed play`,async()=>{
 const audio=new ArcadeAudio({context:{currentTime:0}});let resolveLoad,played=0;
 audio.ready=new Promise(resolve=>{resolveLoad=resolve;});audio.sample=()=>{played++;return true;};
 audio.setScene({playing:true,paused:false,stage:0});const pending=audio.event({type:'fight'});
 if(action==='pause'){audio.setScene({playing:true,paused:true,stage:0});audio.setScene({playing:true,paused:false,stage:0});}
 else {audio.setEnabled(false);audio.setEnabled(true);}
 resolveLoad();await pending;assert.equal(played,0);
});
