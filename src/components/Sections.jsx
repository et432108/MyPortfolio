import { useState } from 'react';
import { profile, projects, skills, experience } from '../lib/data.js';

function Title({ children, kicker='ETHAN PACHECO' }) {
  return <><p className="eyebrow">{kicker}</p><h1 id="panel-title">{children}</h1></>;
}
function Links({ items=profile.links }) {
  return <div className="links">{items.map(([label,url]) => <a key={url} href={url} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>;
}
function Education() {
  return profile.education.map(e => <div className="education" key={e.school}><h3>{e.school}</h3><p>{e.degree}</p><p className="muted">{e.date} · {e.detail}</p></div>);
}
function Tags({ items }) {
  return <span className="tags">{items.map(item => <span className="tag" key={item}>{item}</span>)}</span>;
}

export function Profile() {
  return <><Title>Profile</Title><p className="lede">I’m Ethan, an Information Technology student at UCF. I build games, applications, and developer tools.</p><p>I work across gameplay systems, procedural generation, web applications, and the tooling that connects an idea to a working project.</p><h2 className="section-heading">Education</h2><Education /><Links /></>;
}
export function Projects({ onProject }) {
  const [category, setCategory] = useState('All');
  const filtered = projects.filter(p => category==='All' || p.category===category);
  return <><Title>Projects</Title><p className="lede">Selected games, applications, and systems work.</p>
    <div className="filters" role="group" aria-label="Filter projects">
      {['All','Games','Web & apps','Tools & systems'].map(c => <button key={c} className="filter" data-filter={c} aria-pressed={category===c} onClick={() => setCategory(c)}>{c}</button>)}
    </div><p id="project-count" className="muted" role="status">{filtered.length} projects</p>
    <div id="project-list" className="projects-list">{filtered.map(p => <button key={p.id} className="project-row" data-project={p.id} aria-label={`Read about ${p.name}`} onClick={() => onProject(p.id)}>
      <span className="project-number">{String(projects.indexOf(p)+1).padStart(2,'0')}</span>
      <span><span className="project-role">{p.role}</span><h3>{p.name}</h3><p>{p.summary}</p><Tags items={p.stack} /></span><span className="project-arrow" aria-hidden="true">↗</span>
    </button>)}</div>
  </>;
}
export function ProjectDetail({ id, onBack }) {
  const p = projects.find(project => project.id===id);
  if (!p) return null;
  return <><button className="detail-back" data-back-projects onClick={onBack}>← All projects</button><Title kicker={p.role}>{p.name}</Title><p className="lede">{p.summary}</p><Tags items={p.stack} /><h2 className="section-heading">Project details</h2><ul className="detail-list">{p.details.map(d => <li key={d}>{d}</li>)}</ul>{!!p.links.length && <Links items={p.links} />}{p.availability && <p className="availability">{p.availability}</p>}</>;
}
export function Experience({ onProjects }) {
  return <><Title>Experience</Title>{experience.map(e => <section className="experience-entry" key={e.organization}><p className="eyebrow">{e.organization}</p><h2>{e.title}</h2>{e.date && <p className="muted">{e.date}</p>}</section>)}<h2 className="section-heading">Project experience</h2><p>My portfolio includes solo development and team projects. Each project identifies my role, and team results are attributed to the team.</p><button className="action" data-open="1" onClick={onProjects}>Explore projects →</button></>;
}
export function Skills() {
  return <><Title>Skills</Title><p className="lede">Tools and techniques used in my documented projects.</p><div className="skill-list">{skills.map(([label,items]) => <section className="skill-group" key={label}><h3>{label}</h3><p>{items.join(' · ')}</p></section>)}</div></>;
}
export function Resume() {
  return <><Title>Résumé</Title><p className="lede">Games, software, and developer tooling.</p><Education /><div className="links"><a href={`mailto:${profile.email}?subject=Resume%20request`}>Request my latest résumé →</a><a href="assets/Ethan-Pacheco-Portfolio-Summary.txt" download>Download portfolio summary (.txt)</a></div><p className="availability">The approved résumé PDF from the previous project is not available in this workspace. The download above is a plain-text portfolio summary.</p></>;
}
export function Contact() {
  return <><Title>Contact</Title><p className="lede">Let’s talk about games, software, and building things.</p><p><a className="quick-contact" href={`mailto:${profile.email}`}>{profile.email}</a></p><Links /></>;
}
export function QuickView({ onProject }) {
  return <><Title kicker="RECRUITER VIEW">Quick View</Title><p className="lede">Ethan Pacheco · UCF Information Technology student</p><p className="muted">Expected May 2028 · GPA 3.75 · {profile.email}</p><h2 className="section-heading">Selected work</h2><div className="projects-list">{projects.map(p => <button key={p.id} className="project-row" data-project={p.id} onClick={() => onProject(p.id)}><span className="project-arrow">↗</span><span><h3>{p.name}</h3><p>{p.summary}</p><span className="project-role">{p.role} · {p.stack.slice(0,3).join(' / ')}</span></span></button>)}</div><h2 className="section-heading">Education</h2><Education /><h2 className="section-heading">Experience</h2><p>Knight Hacks — Operations Member<br />Winn-Dixie — Grocery Associate, 2021–2022</p><div className="links"><a href={`mailto:${profile.email}`}>Contact Ethan →</a><a href="assets/Ethan-Pacheco-Portfolio-Summary.txt" download>Portfolio summary (.txt)</a></div><Links /></>;
}
export function Presentation({ reduced, onReduced }) {
  return <><Title>Presentation</Title><div className="asset-note"><p>The P5 presentation uses original character illustrations, bitmap lettering, and sounds extracted from this PC’s Steam installation.</p><p>Joker’s movements use the Steam model and skeletal clips, rendered offline into frames. Profile uses clip 45 with the original head and neck transforms, followed by the original Stats illustration. Camera framing, retiming, interpolation, and the handoff are custom adaptations. The Canvas player decodes frames before playback; React manages the interface.</p><p>Persona characters and game artwork © ATLUS / SEGA. Portfolio content © Ethan Pacheco.</p></div><label className="motion-toggle"><input type="checkbox" id="reduce-motion" checked={reduced} onChange={e => onReduced(e.target.checked)} /> Reduce motion</label><p className="muted">Sound stays optional. Quick View provides the same project content without navigating the animated menu.</p></>;
}

export function SectionContent({ view, onProject, onProjects, reduced, onReduced }) {
  if (!view) return null;
  if (view.kind==='project') return <ProjectDetail id={view.id} onBack={onProjects} />;
  if (view.kind==='quick') return <QuickView onProject={onProject} />;
  if (view.kind==='about') return <Presentation reduced={reduced} onReduced={onReduced} />;
  switch (view.index) {
    case 0: return <Profile />;
    case 1: return <Projects onProject={onProject} />;
    case 2: return <Experience onProjects={onProjects} />;
    case 3: return <Skills />;
    case 4: return <Resume />;
    case 5: return <Contact />;
    default: return null;
  }
}
