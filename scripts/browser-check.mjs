import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,stat,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{try{let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname.replace(/^\/retro-street-fighter(?=\/|$)/,'')));if(path!==root&&!path.startsWith(root+'/')){res.writeHead(403).end();return;}if((await stat(path)).isDirectory())path=resolve(path,'index.html');res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
const errors=[];const failed=[];
await mkdir(resolve(root,'test-results'),{recursive:true});
const url=`http://127.0.0.1:${server.address().port}`;
try{
 const page=await browser.newPage({viewport:{width:1440,height:1200}});
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
 await page.goto(url+'/retro-street-fighter/');await page.locator('.fighter-card').last().waitFor();assert.equal(await page.locator('.fighter-card').count(),6);
 await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:resolve(root,'test-results/desktop-lobby.png'),fullPage:true});
 assert.ok(await page.locator('.fighter-card canvas').first().evaluate(c=>{const a=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<a.length;i+=4)if(a[i])n++;return n>2500;}),'portrait art must be visible');
 await page.locator('[data-fighter=agni]').click();assert.equal(await page.locator('#fighter-name').textContent(),'AGNI');assert.match(await page.locator('#extra-skill').textContent(),/팔 늘리기/);
 await page.selectOption('#opponent','titan');await page.selectOption('#stage','2');await page.selectOption('#difficulty','hard');
 await page.evaluate(async()=>{const {Match}=await import('./engine.js');Match.prototype.aiInput=function(){return {};};const original=Match.prototype.step;Match.prototype.step=function(...args){original.apply(this,args);window.__match=this;window.__observed={ids:this.ids,phase:this.phase,time:this.time,wins:this.wins,fighters:this.fighters.map(f=>({id:f.id,x:f.x,y:f.y,hp:f.hp,attack:f.attack?.move.name,float:f.float}))};};});
 await page.locator('#start').click();await page.waitForTimeout(2600);assert.equal((await page.evaluate(()=>window.__observed)).phase,'fight');
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(350);await page.keyboard.up('ArrowRight');const moved=await page.evaluate(()=>window.__observed);assert.ok(moved.fighters[0].x>270);
 await page.keyboard.press('x');await page.waitForTimeout(220);assert.equal((await page.evaluate(()=>window.__observed)).fighters[0].attack,'스트레치 펀치');
 await page.waitForTimeout(700);await page.keyboard.press('d');await page.waitForTimeout(380);assert.ok((await page.evaluate(()=>window.__observed)).fighters[0].y<434);
 await page.keyboard.press('Escape');await page.locator('#pause-overlay').waitFor({state:'visible'});const before=await page.evaluate(()=>window.__observed.time);await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>window.__observed.time),before);
 await page.locator('#resume').click();await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>window.__observed.time)<before);
 await page.screenshot({path:resolve(root,'test-results/desktop-fight.png'),fullPage:true});
 await page.locator('#help-open').click();assert.equal(await page.locator('#help').evaluate(d=>d.open),true);await page.locator('#help-close').click();await page.locator('#resume').click();
 await page.evaluate(()=>window.__match.fighters[1].hp=0);await page.waitForTimeout(5600);assert.equal((await page.evaluate(()=>window.__observed)).phase,'fight');await page.evaluate(()=>window.__match.fighters[1].hp=0);await page.waitForTimeout(3300);await page.locator('#result-overlay').waitFor({state:'visible'});assert.equal(await page.locator('#result-title').textContent(),'YOU WIN!');await page.locator('#rematch').click();await page.waitForTimeout(100);assert.deepEqual((await page.evaluate(()=>window.__observed)).wins,[0,0]);await page.locator('#pause').click();await page.locator('#return-select').click();
 await page.locator('#sound').click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
 // Keyboard input outside the canvas must remain available to the hosting blog.
 await page.locator('#difficulty').focus();assert.equal(await page.evaluate(()=>{const e=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});document.activeElement.dispatchEvent(e);return e.defaultPrevented;}),false);
 console.log('PASS desktop: subpath assets, visible portraits, roster, settings, movement, AGNI stretch/float, pause, guide, sound, focus, victory, rematch');
 await page.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});const mp=await mobile.newPage();mp.on('pageerror',e=>errors.push(e.message));await mp.goto(url);await mp.locator('.fighter-card').last().waitFor();assert.ok(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mp.screenshot({path:resolve(root,'test-results/mobile-lobby.png'),fullPage:true});
 await mp.locator('[data-fighter=bolt]').click();await mp.locator('#start').click();await mp.waitForTimeout(2600);await mp.locator('.touch-controls').waitFor({state:'visible'});
 const snapshots=await mp.evaluate(async()=>{const {Match}=await import('./engine.js');let last;const original=Match.prototype.step;Match.prototype.step=function(...args){original.apply(this,args);last=this;};await new Promise(r=>requestAnimationFrame(r));const fire=(key,type,id)=>document.querySelector(`[data-control=${key}]`).dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',bubbles:true,cancelable:true}));
 // Synthetic pointer capture is unavailable, so use real CDP touch below for capture coverage.
 window.__mobileSnapshot=()=>last&&({x:last.fighters[0].x,attack:last.fighters[0].attack?.move.name});return !!window.__mobileSnapshot;});assert.ok(snapshots);
 const cdp=await mobile.newCDPSession(mp);await mp.locator('.touch-controls').scrollIntoViewIfNeeded();const right=await mp.locator('[data-control=right]').boundingBox(),attack=await mp.locator('[data-control=a]').boundingBox();const point=(b,id)=>({x:b.x+b.width/2,y:b.y+b.height/2,id});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(right,1)]});await mp.waitForTimeout(200);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(right,1),point(attack,2)]});await mp.waitForTimeout(200);const state=await mp.evaluate(()=>window.__mobileSnapshot());assert.ok(state.x>270);assert.equal(state.attack,'썬더 러시');assert.equal(await mp.locator('.held').count(),2);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await mp.locator('.held').count(),0);
 await mp.screenshot({path:resolve(root,'test-results/mobile-fight.png'),fullPage:true});assert.ok(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));console.log('PASS mobile: 390px layout, simultaneous direction + special, pointer release, no horizontal overflow');
 assert.deepEqual(errors,[]);console.log('PASS no browser runtime errors');if(failed.length)console.log('External request failures:',failed);await mobile.close();
 const embed=await browser.newPage({viewport:{width:1100,height:900}});embed.on('pageerror',e=>errors.push(e.message));await embed.setContent(`<iframe title="embedded-game" src="${url}/retro-street-fighter/" style="width:100%;height:850px;border:0" allow="autoplay; fullscreen" allowfullscreen></iframe>`);const frame=embed.frameLocator('iframe');await frame.locator('#start').click();await frame.locator('#pause').click();await frame.locator('#pause-overlay').waitFor({state:'visible'});assert.equal(await frame.locator('#mode-label').textContent(),'ARCADE / PLAYER VS CPU');await embed.close();assert.deepEqual(errors,[]);console.log('PASS iframe: subpath launch, focus and pause');
}finally{await browser.close();server.close();}
