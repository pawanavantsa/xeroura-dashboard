import { useRef, useState } from 'react';
import { LuBell, LuCheck, LuFolderKanban, LuMonitor, LuMoon, LuPalette, LuPlus, LuSun, LuUsers } from 'react-icons/lu';
import { Avatar, Chip, Toggle, useApp } from '../ui.jsx';
import { themeTransition, useSlidingPill } from '../motion.js';

const SECTIONS = [
  ['project', 'Project', LuFolderKanban],
  ['people', 'People', LuUsers],
  ['alerts', 'Alerts', LuBell],
  ['appearance', 'Appearance', LuPalette],
];

export default function Settings() {
  const { route, navigate, project } = useApp();
  const sec = SECTIONS.some((s) => s[0] === route.id) ? route.id : 'project';
  const navRef = useRef(null);
  const subPill = useSlidingPill(navRef, 'button.on', [sec]);
  return (
    <div className="content">
      <div className="page-head"><div><div className="eyebrow">{project.client}</div><h1>Settings</h1></div></div>
      <div className="settings">
        <nav className="card subnav" ref={navRef}>
          <span className="sub-pill" ref={subPill} />
          {SECTIONS.map(([k, l, Ic]) => (
            <button key={k} className={sec === k ? 'on' : ''} onClick={() => navigate(`settings/${k}`)}>
              <Ic />{l}
            </button>
          ))}
          <div className="saved"><LuCheck />Saved as you go</div>
        </nav>
        <div key={sec} className="section-in">
          {sec === 'project' && <Project />}
          {sec === 'people' && <People />}
          {sec === 'alerts' && <Alerts />}
          {sec === 'appearance' && <Appearance />}
        </div>
      </div>
    </div>
  );
}

function Head({ title, sub }) {
  return <div className="set-head"><h2>{title}</h2><p>{sub}</p></div>;
}

function Project() {
  const { project, staff, openModal } = useApp();
  return (
    <>
      <Head title="Project" sub={project.client} />
      <section className="card set-card">
        <div className="tile-row" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <div className="tile"><div className="l">Project</div><div className="v">{project.name}</div></div>
          <div className="tile"><div className="l">Phase</div><div className="v">{project.phase}</div></div>
          <div className="tile"><div className="l">Target</div><div className="v">{project.target}</div></div>
        </div>
        <div className="setting-row">
          <div className="t"><b>Organisation</b><span>On every Friday note.</span></div>
          <b>{project.client}</b>
        </div>
        {staff && (
          <div className="setting-row">
            <div className="t"><b>Another client</b><span>Open a project, then add their login.</span></div>
            <button className="btn sm" onClick={() => openModal({ type: 'new-project' })}><LuPlus />New project</button>
          </div>
        )}
      </section>
    </>
  );
}

function People() {
  const { people, staff, openModal } = useApp();
  return (
    <>
      <Head title="People" sub="This project — client and Xeroura." />
      <section className="card set-card">
        {people.map((m) => (
          <div className="setting-row" key={m.email}>
            <Avatar name={m.name} tone={m.tone} />
            <div className="t"><b>{m.name}</b><span>{m.email}</span></div>
            <Chip tone={m.side === 'xeroura' ? 'teal' : 'slate'}>{m.role}</Chip>
          </div>
        ))}
        {staff && (
          <div className="setting-row">
            <div className="t"><b>Add a login</b><span>They sign in with this email.</span></div>
            <button className="btn sm" onClick={() => openModal({ type: 'add-person' })}><LuPlus />Add</button>
          </div>
        )}
      </section>
    </>
  );
}

function Alerts() {
  const { session, project } = useApp();
  const [mail, setMail] = useState(true);
  const [dec, setDec] = useState(true);
  return (
    <>
      <Head title="Alerts" sub="Friday email, and when something is open." />
      <section className="card set-card">
        <div className="setting-row">
          <div className="t"><b>Weekly update</b><span>Friday email from this project.</span></div>
          <Toggle on={mail} onChange={setMail} />
        </div>
        <div className="setting-row">
          <div className="t"><b>Decisions</b><span>Ping {session.email} when something needs {project.needNoun}.</span></div>
          <Toggle on={dec} onChange={setDec} />
        </div>
      </section>
    </>
  );
}

function Appearance() {
  const { theme, setTheme } = useApp();
  const cards = [['light', 'Light', LuSun, ['#11141a', '#f3f4f0']], ['dark', 'Dark', LuMoon, ['#0a0c10', '#161a21']], ['system', 'Match system', LuMonitor, ['#11141a', 'linear-gradient(90deg,#f3f4f0 50%,#161a21 50%)']]];
  return (
    <>
      <Head title="Appearance" sub="This device only." />
      <section className="card set-card">
        <div className="h"><h3>Theme</h3></div>
        <div className="theme-cards">
          {cards.map(([k, l, Ic, [side, main]]) => (
            <button key={k} className={`theme-card ${theme === k ? 'on' : ''}`} onClick={(e) => themeTransition(e, () => setTheme(k))}>
              <div className="sw"><span style={{ background: side }} /><span style={{ background: main }} /></div>
              <span className="row"><Ic size={14} />{l}{theme === k && <LuCheck className="c-wa" style={{ marginLeft: 'auto' }} />}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
