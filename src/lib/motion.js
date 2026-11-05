import { NativeFlightPlayer } from './native-flights.js';
export const SECTION_FLIGHTS=Object.freeze([20,5,30,10,41,35]);
const $=s=>document.querySelector(s);
const ease='cubic-bezier(.16,.86,.24,1)';
export class MenuMotion{
 constructor({reduced=false}={}){
  this.nativeFaceVerified=true;this.flight=new NativeFlightPlayer();this.reduced=reduced;this.sequence=0;this.animations=new Map();this.timers=new Set();this.ghosts=new Set();this.art=$('#camp-art');this.frame=$('#game-frame');this.dialog=$('#content-dialog');
  this.setReduced(reduced,false);
 }
 run(element,frames,options={}){
  this.animations.get(element)?.cancel();if(this.reduced)return null;
  const a=element.animate(frames,{duration:420,easing:ease,...options});this.animations.set(element,a);
  a.finished.then(()=>{if(this.animations.get(element)===a)this.animations.delete(element);},()=>{});return a;
 }
 after(ms,fn){const id=setTimeout(()=>{this.timers.delete(id);fn();},ms);this.timers.add(id);}
 clear(){this.sequence++;this.flight.cancel();document.body.classList.remove('main-arriving');$('#commands').inert=false;for(const a of this.animations.values())a.cancel();this.animations.clear();for(const t of this.timers)clearTimeout(t);this.timers.clear();for(const g of this.ghosts)g.remove();this.ghosts.clear();}
 ghost(){
  if(this.reduced)return;const c=getComputedStyle(this.art),g=this.art.cloneNode();g.removeAttribute('id');g.className='scene-ghost';g.style.cssText=`left:${c.left};top:${c.top};width:${c.width};height:${c.height};object-fit:${c.objectFit};object-position:${c.objectPosition};opacity:${c.opacity}`;this.frame.append(g);this.ghosts.add(g);
  this.run(g,[{transform:c.transform==='none'?'none':c.transform,opacity:1},{transform:'translate(-190px,95px) rotate(-17deg) scale(.76)',opacity:1,offset:.72},{transform:'translate(-330px,160px) rotate(-24deg) scale(.64)',opacity:0}],{duration:310,easing:'cubic-bezier(.55,0,.85,.35)'});this.after(325,()=>{g.remove();this.ghosts.delete(g);});
 }
 wipe(reverse=false){this.run($('#scene-wipe'),[{transform:`translateX(${reverse?'125%':'-125%'}) skewX(-25deg)`,opacity:1},{transform:'translateX(0) skewX(-25deg)',opacity:1,offset:.45},{transform:`translateX(${reverse?'-140%':'140%'}) skewX(-25deg)`,opacity:1}],{duration:470,easing:'cubic-bezier(.7,0,.2,1)'});}
 async enter(){this.clear();if(this.reduced||!this.nativeFaceVerified)return;document.body.classList.add('main-arriving');const ok=await this.flight.play(0);if(!ok){document.body.classList.remove('main-arriving');return;}document.body.classList.remove('main-arriving');this.commandsIn(0);this.run($('.menu-heading'),[{translate:'90px -20px',opacity:0},{translate:'0 0',opacity:1}],{duration:180});}
 canHover(){return performance.now()>(this.menuUntil||0);}
 commandsIn(delay=0){this.menuUntil=performance.now()+delay+340;$('#commands').inert=true;this.after(delay+340,()=>{$('#commands').inert=false;});document.querySelectorAll('.command').forEach((b,i)=>this.run(b,[{translate:'-200px 30px',opacity:0},{translate:'8px -2px',opacity:1,offset:.78},{translate:'0 0',opacity:1}],{duration:230,delay:delay+i*22,fill:'backwards'}));this.run($('.command-mark'),[{translate:'0 120px',opacity:0},{translate:'0 0',opacity:1}],{duration:250,delay:delay+65,fill:'backwards'});}
 select(i){
  if(this.reduced||document.body.classList.contains('section-open'))return;
  this.after(100,()=>this.flight.load(SECTION_FLIGHTS[i]).catch(()=>{}));const b=document.querySelectorAll('.command')[i];if(b)this.run(b,[{translate:'0 0'},{translate:'-13px -2px',offset:.3},{translate:'4px 1px',offset:.65},{translate:'0 0'}],{duration:230});
  this.run($('.section-counter'),[{translate:'9px 0',opacity:.25},{translate:'-3px 0',opacity:1,offset:.6},{translate:'0 0',opacity:1}],{duration:180});
 }
 async section(i,plate,animate=true){
  this.clear();const sequence=this.sequence,id=SECTION_FLIGHTS[i];
  if(animate&&!this.reduced&&this.nativeFaceVerified){
   // Keep the current screen visible until the whole next movement is decoded.
   await this.flight.load(id).catch(()=>null);if(sequence!==this.sequence)return false;
  }
  document.body.classList.add('section-open');document.body.dataset.section=i;this.art.src='assets/native/'+plate;
  if(!animate||this.reduced||!this.nativeFaceVerified)return true;return this.flight.play(id);
 }
 panel(entering){this.run(this.dialog,[{translate:entering?'-160px 24px':'-35px 0',opacity:0},{translate:'8px 0',opacity:1,offset:.78},{translate:'0 0',opacity:1}],{duration:entering?260:180,fill:'backwards'});}
 async home(){this.clear();document.body.classList.remove('section-open');delete document.body.dataset.section;this.art.src='assets/native/camp-top.png';if(this.reduced||!this.nativeFaceVerified)return;document.body.classList.add('main-arriving');const ok=await this.flight.play(0);if(!ok)return;document.body.classList.remove('main-arriving');this.commandsIn(0);}
 setReduced(value,replay=true){this.reduced=value;document.body.classList.toggle('motion-paused',value);if(value)this.clear();else if(replay&&!document.body.classList.contains('section-open'))this.enter();}
}
