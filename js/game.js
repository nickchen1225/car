(()=>{
const cv=document.getElementById("game"),ctx=cv.getContext("2d"),W=1100,H=680;
const keys=new Set();let mouse={x:550,y:340,down:false},running=false,paused=false,last=performance.now(),shot=0,reload=0;
let p={x:550,y:430,hp:100,ammo:30,score:0,kills:0,combo:1,wave:1};
let enemies=[],bullets=[],particles=[],spawnTimer=0,gamepadPrevRT=false;
const controls=IR.controls;
addEventListener("keydown",e=>{keys.add(e.code);if(e.code==="Escape")togglePause();if(e.code===controls.reload)startReload()});
addEventListener("keyup",e=>keys.delete(e.code));
cv.addEventListener("mousemove",e=>{let r=cv.getBoundingClientRect();mouse.x=(e.clientX-r.left)*W/r.width;mouse.y=(e.clientY-r.top)*H/r.height});
cv.addEventListener("mousedown",()=>{mouse.down=true;startIfNeeded()});addEventListener("mouseup",()=>mouse.down=false);
cv.addEventListener("click",startIfNeeded);
reload.onclick=startReload;touchReload.onclick=startReload;
document.querySelectorAll(".touch button[data-key]").forEach(b=>{b.onpointerdown=()=>keys.add(b.dataset.key);b.onpointerup=()=>keys.delete(b.dataset.key);b.onpointerleave=()=>keys.delete(b.dataset.key)});
function startIfNeeded(){if(!running){running=true;centerMsg.style.display="none";spawnWave()}}
function togglePause(){if(!running)return;paused=!paused;centerMsg.style.display=paused?"grid":"none";msgTitle.textContent=paused?"PAUSED":"READY";msgSub.textContent=paused?"PRESS ESC TO RESUME":"CLICK TO START"}
function spawnWave(){wave.textContent="WAVE "+String(p.wave).padStart(2,"0");let n=Math.min(3+p.wave,10);for(let i=0;i<n;i++)setTimeout(()=>spawnEnemy(),i*300)}
function spawnEnemy(){let side=Math.floor(Math.random()*4),x=side===0?30:side===1?W-30:Math.random()*W,y=side===2?30:side===3?H-30:Math.random()*H*.45;enemies.push({x,y,r:18,hp:2,max:2,speed:45+p.wave*4,flash:0})}
function startReload(){if(reload>0||p.ammo===30)return;reload=.9}
function fire(){if(reload>0||p.ammo<=0)return;if(performance.now()-shot<105)return;shot=performance.now();p.ammo--;let a=Math.atan2(mouse.y-p.y,mouse.x-p.x),spread=(Math.random()-.5)*.055;bullets.push({x:p.x,y:p.y,vx:Math.cos(a+spread)*850,vy:Math.sin(a+spread)*850,life:1});muzzle();if(p.ammo===0)setTimeout(startReload,150)}
function muzzle(){for(let i=0;i<5;i++)particles.push({x:p.x+Math.random()*15-7,y:p.y+Math.random()*15-7,vx:(Math.random()-.5)*150,vy:(Math.random()-.5)*150,life:.15,c:"#ffcf70",s:3+Math.random()*4})}
function update(dt){
 let dx=0,dy=0;if(keys.has(controls.up))dy--;if(keys.has(controls.down))dy++;if(keys.has(controls.left))dx--;if(keys.has(controls.right))dx++;
 let pads=navigator.getGamepads?.()||[],g=[...pads].find(Boolean);if(g){dx=Math.abs(g.axes[0]||0)>.15?g.axes[0]:dx;dy=Math.abs(g.axes[1]||0)>.15?g.axes[1]:dy;let rt=(g.buttons[7]?.value||0)>.3;if(rt&&!gamepadPrevRT)mouse.down=true;else if(!rt)mouse.down=false;gamepadPrevRT=rt;if(g.buttons[5]?.pressed)startReload();if(g.buttons[0]?.pressed)startIfNeeded()}
 let l=Math.hypot(dx,dy)||1;p.x+=dx/l*250*dt;p.y+=dy/l*250*dt;p.x=Math.max(35,Math.min(W-35,p.x));p.y=Math.max(100,Math.min(H-45,p.y));
 if(mouse.down)fire();if(reload>0){reload-=dt;if(reload<=0)p.ammo=30}
 bullets.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt});
 bullets=bullets.filter(b=>b.life>0&&b.x>-20&&b.x<W+20&&b.y>-20&&b.y<H+20);
 enemies.forEach(e=>{let a=Math.atan2(p.y-e.y,p.x-e.x);e.x+=Math.cos(a)*e.speed*dt;e.y+=Math.sin(a)*e.speed*dt;e.flash=Math.max(0,e.flash-dt);if(Math.hypot(e.x-p.x,e.y-p.y)<e.r+17){p.hp-=18*dt;damage.classList.add("on");setTimeout(()=>damage.classList.remove("on"),70)}});
 for(let i=enemies.length-1;i>=0;i--)for(let j=bullets.length-1;j>=0;j--){let e=enemies[i],b=bullets[j];if(Math.hypot(e.x-b.x,e.y-b.y)<e.r+5){bullets.splice(j,1);e.hp--;e.flash=.08;hitmarker.classList.add("on");setTimeout(()=>hitmarker.classList.remove("on"),60);if(e.hp<=0){p.kills++;p.score+=100*p.combo;p.combo=Math.min(9,p.combo+1);burst(e.x,e.y);enemies.splice(i,1)}break}}
 if(enemies.length===0&&running){p.wave++;p.score+=250*p.wave;spawnWave()}if(p.hp<=0){running=false;centerMsg.style.display="grid";msgTitle.textContent="DOWN";msgSub.textContent="CLICK TO RESTART";p={x:550,y:430,hp:100,ammo:30,score:0,kills:0,combo:1,wave:1};enemies=[];bullets=[]}
}
function burst(x,y){for(let i=0;i<18;i++){let a=Math.random()*6.28;particles.push({x,y,vx:Math.cos(a)*120,vy:Math.sin(a)*120,life:.45,c:i%2?"#e65b48":"#ffcf70",s:2+Math.random()*4})}}
function draw(){
ctx.fillStyle="#101315";ctx.fillRect(0,0,W,H);ctx.strokeStyle="#1d2727";ctx.lineWidth=1;
for(let x=0;x<W;x+=55){ctx.beginPath();ctx.moveTo(x,80);ctx.lineTo(x,H);ctx.stroke()}for(let y=100;y<H;y+=55){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
ctx.fillStyle="#27302f";ctx.fillRect(80,130,230,24);ctx.fillRect(760,180,250,24);ctx.fillRect(430,250,180,24);ctx.fillStyle="#33403e";ctx.fillRect(160,260,28,190);ctx.fillRect(870,330,28,180);
enemies.forEach(e=>{ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle=e.flash?"#fff":"#bd493d";ctx.beginPath();ctx.arc(0,0,e.r,0,6.28);ctx.fill();ctx.fillStyle="#17191a";ctx.beginPath();ctx.arc(5,-3,5,0,6.28);ctx.fill();ctx.restore()});
bullets.forEach(b=>{ctx.fillStyle="#ffe08b";ctx.beginPath();ctx.arc(b.x,b.y,3,0,6.28);ctx.fill()});
let a=Math.atan2(mouse.y-p.y,mouse.x-p.x);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);ctx.fillStyle="#d7d9d4";ctx.fillRect(5,-5,34,10);ctx.fillStyle="#59615f";ctx.fillRect(-15,-12,25,24);ctx.restore();
particles.forEach(q=>{ctx.globalAlpha=Math.max(0,q.life*2);ctx.fillStyle=q.c;ctx.fillRect(q.x,q.y,q.s,q.s)});ctx.globalAlpha=1;
document.getElementById("score").textContent=Math.floor(p.score);document.getElementById("kills").textContent=p.kills;document.getElementById("combo").textContent="x"+p.combo;document.getElementById("ammo").textContent=p.ammo;document.getElementById("hp").textContent=Math.max(0,Math.floor(p.hp));document.getElementById("hpbar").style.width=Math.max(0,p.hp)+"%";
}
function loop(t){let dt=Math.min(.035,(t-last)/1000);last=t;if(running&&!paused)update(dt);particles.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt});particles=particles.filter(q=>q.life>0);draw();requestAnimationFrame(loop)}
requestAnimationFrame(loop);
})();