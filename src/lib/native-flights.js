const $ = s => document.querySelector(s);

export class NativeFlightPlayer {
 constructor() {
  this.canvas = $('#flight-canvas');
  this.ctx = this.canvas.getContext('2d', {alpha:true});
  this.cache = new Map(); this.generation = 0; this.current = null;
  this.manifest = fetch('assets/native/flights/manifest.json').then(r => {
   if (!r.ok) throw Error('Animation manifest unavailable');
   return r.json();
  });
  this.load(0).catch(() => {});
 }
 async load(id) {
  if (this.cache.has(id)) {
   const value = this.cache.get(id);
   this.cache.delete(id); this.cache.set(id,value); return value;
  }
  const job = (async () => {
   const manifest = await this.manifest;
   if (manifest.renderMode !== 'native-flight-matched' || manifest.faceReview?.status !== 'reviewed' || manifest.faceReview?.textureFlipY !== false)
    throw Error('Unverified animation frames are disabled');
   const clip = manifest.clips.find(c => c.id === id);
   if (!clip || clip.terminal !== 'original-illustration' || clip.handoff !== 'pose-cut') throw Error('Missing matching illustration');
   const images = new Array(clip.frames.length); let next = 0;
   const worker = async () => {
    while (next < images.length) {
     const index = next++, image = new Image();
     await new Promise((resolve,reject) => { image.onload=resolve; image.onerror=reject; image.src=clip.frames[index]; });
     images[index] = await createImageBitmap(image);
    }
   };
   const prepareLanding=async()=>{
    const original=new Image();original.src=clip.artLayout.src;await original.decode();
    images.terminal=original;
   };
   await Promise.all([...Array.from({length:4},worker),prepareLanding()]); return {clip,images};
  })();
  this.cache.set(id,job);
  for (const key of this.cache.keys()) {
   if (this.cache.size <= 2) break;
   if (key !== 0 && key !== id) this.cache.delete(key);
  }
  try { return await job; }
  catch (error) { if (this.cache.get(id) === job) this.cache.delete(id); throw error; }
 }
 cancel() {
  this.generation++;
  if (this.raf) cancelAnimationFrame(this.raf);
  this.pending?.(false); this.pending = null; this.current = null;
  this.ctx.setTransform(1,0,0,1,0,0);
  this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
  document.body.classList.remove('native-flight','flight-settling');
 }
 layout(clip,art) {
  const frame = $('#game-frame'), style = getComputedStyle(art);
  // Canvas and DOM share the same image-content rectangle at every viewport.
  const width = parseFloat(style.width), height = parseFloat(style.height);
  const imageScale = style.objectFit === 'contain'
   ? Math.min(width/art.naturalWidth,height/art.naturalHeight) : width/art.naturalWidth;
  const scale = art.naturalWidth*imageScale/clip.artLayout.width;
  if (this.canvas.width !== frame.clientWidth || this.canvas.height !== frame.clientHeight) {
   this.canvas.width = frame.clientWidth; this.canvas.height = frame.clientHeight;
  }
  this.canvas.style.opacity = style.opacity;
  return {scale,dx:parseFloat(style.left)-clip.artLayout.left*scale,
   dy:parseFloat(style.top)-clip.artLayout.top*scale};
 }
 draw(clip,images,art,elapsed,base=this.layout(clip,art)) {
  const nativeDuration = clip.nativeDuration*1000;
  const index = Math.min(images.length-1,Math.max(0,Math.floor(elapsed/((clip.motionDuration ?? clip.nativeDuration)*1000)*(images.length-1))));
  const ctx=this.ctx;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.setTransform(base.scale,0,0,base.scale,base.dx,base.dy);
  if(elapsed>=nativeDuration){
   const l=clip.artLayout;ctx.drawImage(images.terminal,l.left,l.top,l.width,l.height);
  }else{
   const r=clip.frameRects[index];ctx.drawImage(images[index],r[0],r[1]);
  }
  ctx.setTransform(1,0,0,1,0,0);
  this.current={id:clip.id,index,frames:images.length,elapsed,fps:clip.fps};
 }

 async play(id) {
  this.cancel(); const generation = this.generation, art = $('#camp-art');
  const status = setTimeout(() => {
   if (generation === this.generation) $('#load-status').textContent = 'Loading animation…';
  },160);
  let loaded;
  try { [loaded] = await Promise.all([this.load(id),art.complete && art.naturalWidth ? Promise.resolve() : new Promise((resolve,reject) => { art.addEventListener("load",resolve,{once:true}); art.addEventListener("error",reject,{once:true}); })]); }
  catch (error) {
   clearTimeout(status);
   if (generation === this.generation) {
    this.cancel(); $('#load-status').textContent = 'Animation unavailable. Reload to retry.';
   }
   console.error(error); return false;
  }
  clearTimeout(status); if (generation !== this.generation) return false;
  $('#load-status').textContent = '';
  const {clip,images} = loaded; let start = null;
  let viewportWidth=innerWidth,viewportHeight=innerHeight,base=this.layout(clip,art);
  // Prepare the browser's scaled PNG cache before starting the motion clock.
  // Keep the HTML image source so its filtering matches the resting DOM image.
  this.ctx.imageSmoothingEnabled=true;this.ctx.imageSmoothingQuality='high';
  this.ctx.setTransform(base.scale,0,0,base.scale,base.dx,base.dy);
  const landing=clip.artLayout;
  this.ctx.drawImage(images.terminal,landing.left,landing.top,landing.width,landing.height);
  this.ctx.setTransform(1,0,0,1,0,0);
  this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
  document.body.classList.add('native-flight');
  return new Promise(resolve => {
   this.pending = resolve;
   const tick = () => {
    if (generation !== this.generation) { resolve(false); return; }
    // A queued RAF timestamp can predate synchronous landing-image preparation.
    // Anchor and sample the clock at the actual draw so startup work cannot
    // make two adjacent draws skip tens of milliseconds of the native clip.
    const now = performance.now();
    start ??= now; const elapsed = now-start;
    // Avoid style/layout reads on every animation frame. Recalculate only
    // if the viewport changes during this flight.
    if (innerWidth!==viewportWidth || innerHeight!==viewportHeight) {
     viewportWidth=innerWidth;viewportHeight=innerHeight;base=this.layout(clip,art);
    }
    this.draw(clip,images,art,elapsed,base);
    if (elapsed < clip.duration*1000) this.raf = requestAnimationFrame(tick);
    else {
     this.after = clip.id; this.current = null; this.pending = null;
     document.body.classList.remove('native-flight');
     this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); resolve(true);
    }
   };
   this.raf = requestAnimationFrame(tick);
  });
 }
}
