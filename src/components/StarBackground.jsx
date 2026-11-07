import { memo, useLayoutEffect, useRef } from 'react';

// A seamless tile made from nested five-point polygons. Color is authored here,
// so the browser never needs to filter the moving background.
const points = radius => Array.from({ length:10 }, (_, i) => {
  const angle = -Math.PI/2+i*Math.PI/5, r = radius*(i%2 ? .43 : 1);
  return `${(Math.cos(angle)*r).toFixed(2)},${(Math.sin(angle)*r).toFixed(2)}`;
}).join(' ');
// Reference menu frames use neutral gray paper and near-black ink.
const paper = '#d0d0d0', ink = '#030303';
const rings = [1,.88,.77,.66,.55,.44,.33,.22].map((r,i) =>
  `<polygon points="${points(100*r)}" fill="${i%2 ? paper : ink}"/>`).join('');
const stars = [[66,78,1.12,-14],[292,56,.82,18],[199,265,1.62,-9],[416,365,1.12,15],[25,383,.68,24]];
const copies = stars.flatMap(([x,y,s,a]) => [-440,0,440].flatMap(dx => [-440,0,440].map(dy =>
  `<use href="#star" transform="translate(${x+dx} ${y+dy}) rotate(${a}) scale(${s})"/>`))).join('');
const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="440" viewBox="0 0 440 440"><defs><g id="star">${rings}</g></defs><path fill="${paper}" d="M0 0h440v440H0z"/>${copies}</svg>`;
const tileUrl = `url("data:image/svg+xml,${encodeURIComponent(tile)}")`;

// Boundaries are expressed in the *illustration's* coordinate system, rather
// than viewport percentages. They follow its responsive placement and scaling.
const regions = {
  main: [[.46,0],[1,0],[1,.80],[.77,.80],[.35,.10]],
  0: [[.20,0],[1,0],[1,.55],[.70,.55],[.48,.28],[.20,.10]],
  1: [[0,0],[.72,0],[.64,.20],[.38,.70],[0,.70]],
  2: [[.58,0],[1,0],[1,.68],[.79,.68],[.38,.34]],
  3: [[0,0],[.66,0],[.57,.28],[.32,.70],[0,.70]],
  4: [[.58,0],[1,0],[1,1],[.38,1]],
  5: [[0,0],[.83,0],[1,.70],[.12,.70]],
};

export const StarBackground = memo(function StarBackground() {
  const host = useRef(null);
  useLayoutEffect(() => {
    const element = host.current, art = document.querySelector('#camp-art');
    const stage = document.querySelector('#game-frame');
    let scheduled = 0;
    function align() {
      scheduled = 0;
      if (!art.naturalWidth || !art.naturalHeight) return;
      const css = getComputedStyle(art);
      const boxW = parseFloat(css.width), boxH = parseFloat(css.height);
      const scale = css.objectFit==='contain'
        ? Math.min(boxW/art.naturalWidth,boxH/art.naturalHeight) : boxW/art.naturalWidth;
      const width = art.naturalWidth*scale, height = art.naturalHeight*scale;
      const left = parseFloat(css.left), top = parseFloat(css.top);
      const scene = document.body.dataset.section ?? 'main';
      const polygon = (regions[scene] || regions.main).map(([x,y]) => [left+x*width,top+y*height]);
      // Crop the layer to its visible footprint before allocating the moving tile.
      const x = Math.max(0,Math.min(...polygon.map(p=>p[0])));
      const y = Math.max(0,Math.min(...polygon.map(p=>p[1])));
      const w = Math.max(0,Math.min(stage.clientWidth,Math.max(...polygon.map(p=>p[0])))-x);
      const h = Math.max(0,Math.min(stage.clientHeight,Math.max(...polygon.map(p=>p[1])))-y);
      const tileSize = Math.round(440*Math.min(width/1024,1.35));
      Object.assign(element.style, {
        left:`${x}px`, top:`${y}px`, width:`${w}px`, height:`${h}px`,
        clipPath:`polygon(${polygon.map(p=>`${p[0]-x}px ${p[1]-y}px`).join(',')})`,
      });
      element.style.setProperty('--star-tile',`${tileSize}px`);
      element.style.setProperty('--star-origin-x',`${left-x}px`);
      element.style.setProperty('--star-origin-y',`${top-y}px`);
      element.dataset.scene = scene;
    }
    function schedule() {
      if (!scheduled) scheduled = requestAnimationFrame(align);
    }
    const poseObserver = new MutationObserver(schedule);
    poseObserver.observe(art,{attributes:true,attributeFilter:['src']});
    poseObserver.observe(document.body,{attributes:true,attributeFilter:['data-section']});
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(art); resizeObserver.observe(stage);
    art.addEventListener('load',align);
    window.addEventListener('resize',schedule);
    align();
    return () => {
      cancelAnimationFrame(scheduled);
      poseObserver.disconnect(); resizeObserver.disconnect();
      art.removeEventListener('load',align);
      window.removeEventListener('resize',schedule);
    };
  }, []);
  return <div id="native-background" ref={host} aria-hidden="true">
    <div className="star-field" style={{backgroundImage:tileUrl}} />
  </div>;
});
