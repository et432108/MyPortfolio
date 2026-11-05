import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { JokerTransition } from './components/JokerTransition.jsx';
import { MenuHeading, Navigation } from './components/Navigation.jsx';
import { SectionContent } from './components/Sections.jsx';
import { sections } from './sections.js';
import { projects } from './lib/data.js';
import { SECTION_FLIGHTS } from './lib/motion.js';

function savedMotion() {
  try { return localStorage.getItem('portfolio-motion')==='off'; }
  catch { return false; }
}
function resizeStage() {
  const scale = Math.min(innerWidth/1280, innerHeight/720);
  const style = document.documentElement.style;
  style.setProperty('--game-scale',scale);
  style.setProperty('--stage-left',`${(innerWidth-1280*scale)/2}px`);
  style.setProperty('--stage-top',`${(innerHeight-720*scale)/2}px`);
}
function panelIndex(view) {
  if (!view) return '';
  if (view.kind==='quick') return 'QUICK VIEW / CONTENT FIRST';
  if (view.kind==='about') return 'PRESENTATION / ASSET SOURCES';
  if (view.kind==='project') return `PROJECT FILE / ${String(projects.findIndex(p=>p.id===view.id)+1).padStart(2,'0')}`;
  return `0${view.index+1} / ${sections[view.index].label.toUpperCase()}`;
}

export function App() {
  const [selected, setSelected] = useState(0);
  const [view, setView] = useState(null);
  const [reduced, setReduced] = useState(savedMotion);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const initialReduced = useRef(reduced);
  const motion = useRef(null), buttons = useRef([]), dialog = useRef(null), closeButton = useRef(null);
  const lastFocused = useRef(null), selection = useRef(0), generation = useRef(0), opening = useRef(false);
  const sounds = useRef({}), soundOn = useRef(false);

  function sound(name) {
    const audio = sounds.current[name];
    if (!soundOn.current || !audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
  function select(index, withSound=true) {
    const next = (index+sections.length)%sections.length;
    if (next!==selection.current) {
      if (withSound) sound('cursor');
      motion.current?.select(next);
    }
    selection.current = next;
    setSelected(next);
  }
  function rememberFocus() {
    if (!dialog.current.open && !opening.current) lastFocused.current = document.activeElement;
  }
  function routeTo(hash='') {
    history.replaceState(null, '', location.pathname+location.search+(hash ? `#${hash}` : ''));
  }
  async function openSection(index, { animate=true }={}) {
    const player = motion.current;
    if (!player) return;
    rememberFocus();
    const request = ++generation.current;
    select(index, false);
    opening.current = true;
    sound('open');
    const completed = await player.section(index, sections[index].plate, animate);
    if (request!==generation.current) return;
    if (!completed) await player.section(index, sections[index].plate, false);
    if (request!==generation.current) return;
    opening.current = false;
    setView({ kind:'section', index });
    routeTo(sections[index].slug);
  }
  function openProject(id) {
    if (!projects.some(p=>p.id===id)) return;
    rememberFocus();
    generation.current++;
    opening.current = false;
    select(1, false);
    motion.current.section(1, sections[1].plate, false);
    sound('whoosh');
    setView({ kind:'project', id });
    routeTo(`projects/${id}`);
  }
  function openUtility(kind) {
    rememberFocus();
    generation.current++;
    opening.current = false;
    const index = kind==='quick' ? 1 : 5;
    motion.current.section(index, sections[index].plate, false);
    document.body.classList.remove('native-transition');
    sound('open');
    setView({ kind });
    routeTo(kind==='quick' ? 'quick' : 'presentation');
  }
  function goHome() {
    generation.current++;
    opening.current = false;
    document.body.classList.remove('native-transition');
    dialog.current.close();
    setView(null);
    motion.current.home();
    sound('cancel');
    routeTo();
    const target = lastFocused.current;
    (target?.isConnected && !dialog.current.contains(target) ? target : buttons.current[selection.current])?.focus();
  }
  function closePanel() {
    if (view?.kind==='project') openSection(1, { animate:false });
    else goHome();
  }
  function toggleSound() {
    soundOn.current = !soundOn.current;
    setSoundEnabled(soundOn.current);
    sound('cursor');
  }
  function changeReduced(value) {
    setReduced(value);
    motion.current.setReduced(value);
    try { localStorage.setItem('portfolio-motion',value ? 'off' : 'on'); } catch {}
  }
  function openRoute() {
    const [slug,id] = location.hash.slice(1).split('/');
    if (slug==='projects' && projects.some(p=>p.id===id)) return openProject(id);
    if (slug==='quick') return openUtility('quick');
    if (slug==='presentation') return openUtility('about');
    const index = sections.findIndex(s=>s.slug===slug);
    if (index>=0) return openSection(index,{ animate:false });
    goHome();
  }

  useLayoutEffect(() => {
    resizeStage();
    addEventListener('resize',resizeStage);
    sounds.current = Object.fromEntries([['open',170],['cancel',172],['cursor',177],['whoosh',224]].map(([name,id]) => {
      const audio = new Audio(`assets/native/sound-${id}.wav`);
      audio.preload = 'none'; audio.volume = .24;
      return [name,audio];
    }));
    window.portfolioScene = {
      framework:'react', type:'steam-keyframe-flights-and-original-menu-art',
      plates:sections.map(s=>s.plate), flightIds:SECTION_FLIGHTS, motion:motion.current,
    };
    if (location.hash) openRoute();
    else motion.current.enter();
    return () => {
      generation.current++;
      removeEventListener('resize',resizeStage);
      for (const audio of Object.values(sounds.current)) audio.pause();
      delete window.portfolioScene;
    };
  }, []);

  useLayoutEffect(() => {
    if (!view) return;
    const element = dialog.current, entering = !element.open;
    if (entering) element.showModal();
    element.scrollTop = 0;
    motion.current.panel(entering);
    closeButton.current.focus();
  }, [view]);

  useEffect(() => {
    function keydown(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
      if (dialog.current.open) return;
      if (event.key==='Escape' && opening.current) {
        event.preventDefault(); goHome(); return;
      }
      if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
        event.preventDefault();
        const index = event.key==='Home' ? 0 : event.key==='End' ? sections.length-1 : selection.current+(event.key==='ArrowDown'?1:-1);
        select(index); buttons.current[selection.current]?.focus();
      }
      if (event.key==='Enter' && !event.target.closest('button,a')) {
        event.preventDefault(); openSection(selection.current);
      }
      if (event.key.toLowerCase()==='q') { event.preventDefault(); openUtility('quick'); }
    }
    document.addEventListener('keydown',keydown);
    addEventListener('hashchange',openRoute);
    return () => {
      document.removeEventListener('keydown',keydown);
      removeEventListener('hashchange',openRoute);
    };
  });

  return <>
    <svg width="0" height="0" aria-hidden="true"><defs><filter id="red-ink" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter></defs></svg>
    <a className="skip-link" href="#commands" onClick={e => { e.preventDefault(); buttons.current[selection.current]?.focus(); }}>Skip to navigation</a>
    <div id="game-frame">
      <div id="native-background" aria-hidden="true" />
      <JokerTransition ref={motion} initialReduced={initialReduced.current} />
      <header>
        <a href="#" className="identity" aria-label="Ethan Pacheco, home" onClick={e => { e.preventDefault(); goHome(); select(0); }}><span>ETHAN PACHECO</span><small>GAMES / SOFTWARE / TOOLS</small></a>
        <div className="utility">
          <button id="quick-view" onClick={() => openUtility('quick')}>Quick View <kbd>Q</kbd></button>
          <button id="sound" aria-pressed={soundEnabled} onClick={toggleSound}>Sound {soundEnabled?'ON':'OFF'}</button>
          <button id="motion" aria-pressed={!reduced} onClick={() => changeReduced(!reduced)}>Motion {reduced?'OFF':'ON'}</button>
        </div>
      </header>
      <Navigation selected={selected} buttons={buttons} onSelect={select} onOpen={openSection} canHover={() => motion.current?.canHover()} />
      <MenuHeading selected={selected} />
      <footer><span><kbd>↑</kbd><kbd>↓</kbd> Select &nbsp; <kbd>Enter</kbd> Open &nbsp; <kbd>Esc</kbd> Back</span><button id="about-assets" onClick={() => openUtility('about')}>About this presentation</button></footer>
    </div>
    <dialog id="content-dialog" ref={dialog} aria-labelledby="panel-title"
      onCancel={e => { e.preventDefault(); closePanel(); }}
      onClick={e => {
        if (e.target!==dialog.current) return;
        const r = dialog.current.getBoundingClientRect();
        if (e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) closePanel();
      }}>
      <div className="panel-top"><span id="panel-index">{panelIndex(view)}</span><button id="close-panel" ref={closeButton} aria-label="Close section" onClick={closePanel}>Back <kbd>Esc</kbd></button></div>
      <div id="panel-content"><SectionContent view={view} onProject={openProject} onProjects={() => openSection(1,{ animate:false })} reduced={reduced} onReduced={changeReduced} /></div>
    </dialog>
  </>;
}
