(()=>{
const defaults={up:"KeyW",left:"KeyA",down:"KeyS",right:"KeyD",reload:"KeyR"};let c=Object.assign({},defaults,IR.store.get("controls",{})),wait=null;
const pretty=k=>({KeyW:"W",KeyA:"A",KeyS:"S",KeyD:"D",KeyR:"R",Space:"SPACE"}[k]||k.replace("Key","").replace("Arrow",""));
document.querySelectorAll("[data-bind]").forEach(b=>{b.textContent=pretty(c[b.dataset.bind]);b.onclick=()=>{if(wait)wait.classList.remove("waiting");wait=b;b.classList.add("waiting");b.textContent="PRESS KEY";}});
addEventListener("keydown",e=>{if(!wait)return;e.preventDefault();c[wait.dataset.bind]=e.code;wait.textContent=pretty(e.code);wait.classList.remove("waiting");wait=null});
save.onclick=()=>{IR.store.set("controls",c);alert("SETTINGS SAVED");};reset.onclick=()=>{IR.store.set("controls",defaults);location.reload()};
function pad(){let p=navigator.getGamepads?.()[0];padStatus.textContent=p?"CONNECTED // "+p.id:"WAITING FOR GAMEPAD…";requestAnimationFrame(pad)}pad();
})();