import { sections } from '../sections.js';

const glyphMap = { A:[1397,29,86,112],C:[555,195,133,121],D:[964,212,106,91],E:[984,399,68,76],F:[833,198,85,105],I:[913,212,47,94],J:[16,546,43,179,7],K:[158,32,65,105],L:[364,36,85,96],M:[1052,385,119,98],N:[1324,53,84,94],O:[1254,49,81,91],P:[967,24,112,117],Q:[217,382,92,105],R:[1115,45,93,105],S:[1200,65,66,69],T:[1240,210,116,102],U:[304,411,64,74],X:[559,539,169,177],Y:[763,397,78,98] };

function Lettering({ label }) {
  const letters = [...label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()];
  return letters.map((letter, index) => {
    const glyph = glyphMap[letter];
    if (!glyph) return <span className="fallback-letter" key={index}>{letter}</span>;
    const [x,y,w,h,atlas=5] = glyph;
    const sy = 59/h, sx = atlas===7 ? .52 : letter==='X' ? .36 : .55;
    return <span className="glyph" key={index} style={{
      width:w*sx, height:h*sy, backgroundImage:`url(assets/native/menu-atlas-${atlas}.png)`,
      backgroundSize:`${1536*sx}px ${(atlas===5?768:1536)*sy}px`,
      backgroundPosition:`${-x*sx}px ${-y*sy}px`,
    }} />;
  });
}

export function Navigation({ selected, buttons, onSelect, onOpen, canHover }) {
  return <main id="menu">
    <div className="command-caption" aria-hidden="true">SELECT A COMMAND</div>
    <nav id="commands" aria-label="Portfolio sections">
      {sections.map(({ label }, index) => <button
        key={label} className="command" data-section={index} aria-label={label}
        aria-current={selected===index ? 'true' : 'false'}
        ref={node => { buttons.current[index] = node; }}
        onPointerEnter={() => { if (canHover()) onSelect(index); }}
        onFocus={() => onSelect(index)} onClick={() => onOpen(index)}
      ><span className="menu-no" aria-hidden="true">0{index+1}</span>
        <span className="glyphs" aria-hidden="true"><Lettering label={label} /></span>
      </button>)}
    </nav>
    <div id="menu-caption"><span id="selection-number">0{selected+1} / 06</span><p id="selection-description">{sections[selected].description}</p></div>
  </main>;
}

export function MenuHeading({ selected }) {
  return <><aside className="menu-heading" aria-hidden="true">
    <div className="look-at-me"><span>Don’t Look at Me</span><span>Like That</span></div>
    <div className="owner">ETHAN PACHECO</div>
    <div className="menu-main">MeNu: MaiN<small>SELECT A COMMAND</small></div>
    <div className="section-counter">{String(selected+1).padStart(2,'0')}</div>
  </aside><div className="command-mark" aria-hidden="true" /></>;
}
