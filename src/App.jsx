import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  LuBell, LuCheck, LuCircleCheck, LuClipboardList, LuFileText, LuFolderKanban, LuKeyboard,
  LuLogOut, LuMessageSquarePlus, LuMonitor, LuMoon, LuNewspaper, LuPlus, LuSearch, LuSettings, LuSun,
  LuChevronsUpDown,
} from 'react-icons/lu';
import { AppCtx, Avatar, Badge, Menu, Modal, Roll } from './ui.jsx';
import { Logo } from './Logo.jsx';
import { exit, installRipples, stagger, themeTransition, useSlidingPill } from './motion.js';
import {
  addPerson, addProject, clearSession, isXerouraEmail, loadCatalog, loadSession,
  personByName, projectsFor, saveCatalog, saveSession,
} from './data.js';
import { loadBoard, paceOf, saveBoard } from './store.js';
import { fmtTime } from './lib/time.js';
import Auth from './pages/Auth.jsx';
import Update from './pages/Update.jsx';
import Progress from './pages/Progress.jsx';
import Decisions from './pages/Decisions.jsx';
import Files from './pages/Files.jsx';
import Settings from './pages/Settings.jsx';
import CommandPalette from './components/CommandPalette.jsx';

const NAV = [
  { path: 'update', label: 'Update', icon: LuNewspaper },
  { path: 'progress', label: 'Progress', icon: LuFolderKanban },
  { path: 'decisions', label: 'Decisions', icon: LuClipboardList },
  { path: 'files', label: 'Files', icon: LuFileText },
  { path: 'settings', label: 'Settings', icon: LuSettings },
];

function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [page, id] = h.split('/');
  const alias = { overview: 'update', products: 'progress', usage: 'progress', tickets: 'decisions', invoices: 'files', board: 'progress' };
  const raw = page && page !== 'login' ? page : 'update';
  return { page: alias[raw] || raw, id: id || null };
}

function applyTheme(t) {
  const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

function initialSession() {
  try {
    if (new URLSearchParams(window.location.search).get('demo') === '1') {
      const catalog = loadCatalog();
      const s = { email: 'priya@inq.edu', projectId: projectsFor('priya@inq.edu', catalog)[0]?.id || 'inq' };
      saveSession(s);
      return s;
    }
  } catch { /* */ }
  return loadSession();
}

export default function App() {
  const [session, setSession] = useState(() => initialSession());
  const login = useCallback((s) => {
    saveSession(s);
    setSession(s);
    window.location.hash = '#/update';
  }, []);
  if (!session) return <Auth onEnter={login} />;
  return <Shell session={session} onLogout={() => { clearSession(); setSession(null); window.location.hash = '#/login'; }} />;
}

function Shell({ session, onLogout }) {
  const [catalog, setCatalogState] = useState(loadCatalog);
  const accessible = useMemo(() => projectsFor(session.email, catalog), [session.email, catalog]);
  const [projectId, setProjectIdState] = useState(() => {
    const list = projectsFor(session.email);
    return list.some((p) => p.id === session.projectId) ? session.projectId : list[0]?.id;
  });
  const project = catalog.find((p) => p.id === projectId) || accessible[0] || catalog[0];
  const people = project?.people || [];
  const staff = isXerouraEmail(session.email, catalog);

  const persistCatalog = useCallback((next) => {
    saveCatalog(next);
    setCatalogState(next);
  }, []);

  const setProjectId = useCallback((id) => {
    setProjectIdState(id);
    saveSession({ ...session, projectId: id });
  }, [session]);

  const [route, setRoute] = useState(parseHash);
  const [theme, setThemeState] = useState(() => { try { return localStorage.getItem('xdash.theme') || 'light'; } catch { return 'light'; } });
  const [palette, setPalette] = useState(false);
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [, tick] = useState(0);
  const mainRef = useRef(null);
  const navRef = useRef(null);
  const navPill = useSlidingPill(navRef, 'a.active', [route.page]);
  const tz = 'Asia/Kolkata';
  const now = Date.now();
  const [tasks, setTasks] = useState(() => loadBoard(project?.id));
  const actor = useMemo(
    () => people.find((p) => p.email?.toLowerCase() === String(session.email).toLowerCase()) || people[0],
    [people, session.email],
  );
  const pace = useMemo(() => (project ? paceOf(tasks, project, now) : null), [tasks, project, now]);
  const waiting = pace?.needClient.length || 0;

  const pidRef = useRef(project.id);
  useEffect(() => {
    if (pidRef.current !== project.id) {
      pidRef.current = project.id;
      setTasks(loadBoard(project.id));
      document.title = `Xeroura · ${project.name}`;
      return;
    }
    document.title = `Xeroura · ${project.name}`;
    saveBoard(project.id, tasks);
  }, [project.id, project.name, session.email, tasks]);

  useEffect(() => { installRipples(); }, []);
  useEffect(() => { applyTheme(theme); try { localStorage.setItem('xdash.theme', theme); } catch { /* */ } }, [theme]);
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 15000); return () => clearInterval(t); }, []);

  useEffect(() => {
    let cur = parseHash();
    const on = async () => {
      const next = parseHash();
      if (next.page !== cur.page) {
        const el = mainRef.current?.querySelector('.content');
        await Promise.race([
          exit(el, [{ opacity: 1, transform: 'none', filter: 'blur(0)' }, { opacity: 0, transform: 'translateY(-6px)', filter: 'blur(4px)' }], 140),
          new Promise((r) => setTimeout(r, 220)),
        ]);
      }
      cur = next;
      setRoute(next);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  useLayoutEffect(() => {
    const el = mainRef.current?.querySelector('.content');
    if (!el) return;
    stagger(el, '.page-head > *, .stats > *, .settings > *, .dash-grid > *, .dash-stack > *, .pace-strip, .board-col, .rep-grid > .card, .content > .card', { step: 45, max: 14, y: 16 });
  }, [route.page, project.id]);

  useEffect(() => {
    const k = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p); }
      if (e.target.matches('input, textarea, select')) return;
      if (e.key === '?') setModal({ type: 'shortcuts' });
      if (e.key === 'g') window.__g = Date.now();
      else if (window.__g && Date.now() - window.__g < 800) {
        const m = { u: 'update', p: 'progress', d: 'decisions', f: 'files', s: 'settings' }[e.key];
        if (m) window.location.hash = `#/${m}`;
        window.__g = 0;
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const toast = useCallback((msg, kind = 'ok') => {
    const id = Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x))), 3000);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3260);
  }, []);
  useEffect(() => { window.__xdashToast = toast; }, [toast]);

  const navigate = useCallback((p) => { window.location.hash = `#/${p}`; }, []);
  const setTheme = (t) => { applyTheme(t); flushSync(() => setThemeState(t)); };

  const latestUpdate = project.updates?.[0] || null;
  const ctx = useMemo(() => ({
    session, project, people, phases: project.phases, files: project.files || [], updates: project.updates || [],
    staff, theme, setTheme, navigate, toast, tz, now: () => Date.now(), openModal: setModal, route,
    tasks, setTasks, actor, pace, personByName: (n) => personByName(people, n),
    catalog, persistCatalog, setProjectId,
  }), [session, project, people, staff, theme, navigate, toast, tz, route, tasks, actor, pace, catalog, persistCatalog, setProjectId]);

  const pages = { update: Update, progress: Progress, decisions: Decisions, files: Files, settings: Settings };
  const Page = pages[route.page] || Update;
  const resolvedDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

  const createProject = (fields) => {
    const { catalog: next, project: created } = addProject(catalog, fields);
    persistCatalog(next);
    setProjectId(created.id);
    toast(`Opened ${created.name}.`);
    setModal(null);
    navigate('progress');
  };

  if (!project || !pace) return null;

  return (
    <AppCtx.Provider value={ctx}>
      <div className="shell">
        <aside className="side">
          <Menu block align="left" width={248} trigger={({ toggle, open }) => (
            <button type="button" className={`brand brand-btn ${open ? 'open' : ''}`} onClick={toggle} aria-label="Switch project">
              <div className="brand-mark" aria-hidden><Logo /></div>
              <div className="grow">
                <div className="brand-name">Xeroura</div>
                <div className="brand-sub ellipsis">{project.name}<LuChevronsUpDown /></div>
              </div>
            </button>
          )}>
            <div className="menu-title">Projects</div>
            {accessible.map((p) => (
              <button key={p.id} onClick={() => { setProjectId(p.id); navigate('update'); }}>
                <span className="menu-stack">
                  <b>{p.name}</b>
                  <span>{p.client}</span>
                </span>
                {p.id === project.id && <LuCircleCheck className="check" />}
              </button>
            ))}
            {staff && (
              <>
                <hr />
                <button onClick={() => setModal({ type: 'new-project' })}><LuPlus />New project</button>
              </>
            )}
          </Menu>
          <div className="side-label">Project</div>
          <nav className="nav" ref={navRef}>
            <span className="nav-pill" ref={navPill} />
            {NAV.map((n) => (
              <a key={n.path} href={`#/${n.path}`} className={route.page === n.path ? 'active' : ''}>
                <n.icon />{n.label}
                {n.path === 'decisions' && waiting > 0 && <Badge n={waiting} className="count" />}
              </a>
            ))}
          </nav>
          <div className="side-foot">
            <div className={`wa-card ${pace.onTrack ? '' : 'off'}`} role="status">
              <span className="dot-wrap"><LuCheck size={16} /></span>
              <div>
                <b>{pace.label} · {Math.round(pace.pct * 100)}%</b>
                {pace.daysLeft} days · {project.target}
              </div>
            </div>
            <Menu up block align="left" width={238} trigger={({ toggle, open }) => (
              <button className={`user-row ${open ? 'open' : ''}`} onClick={toggle} aria-label="Account menu" aria-expanded={open}>
                <Avatar name={actor.name} tone={actor.tone} />
                <div className="who grow"><b className="ellipsis">{actor.name}</b><span className="ellipsis">{actor.side === 'xeroura' ? 'Xeroura' : project.client}</span></div>
                <LuChevronsUpDown className="menu-btn" />
              </button>
            )}>
              <div className="menu-account" title={actor.email}>
                <b className="ellipsis">{actor.email}</b>
                <span className="ellipsis">{actor.role}</span>
              </div>
              <button onClick={() => navigate('settings')}><LuSettings />Settings</button>
              <button onClick={() => setModal({ type: 'shortcuts' })}><LuKeyboard />Keyboard shortcuts</button>
              <hr />
              <button onClick={(e) => themeTransition(e, () => setTheme('light'))}><LuSun />Light{theme === 'light' && <LuCircleCheck className="check" />}</button>
              <button onClick={(e) => themeTransition(e, () => setTheme('dark'))}><LuMoon />Dark{theme === 'dark' && <LuCircleCheck className="check" />}</button>
              <button onClick={(e) => themeTransition(e, () => setTheme('system'))}><LuMonitor />Match system{theme === 'system' && <LuCircleCheck className="check" />}</button>
              <hr />
              <button className="danger" onClick={onLogout}><LuLogOut />Sign out</button>
            </Menu>
          </div>
        </aside>

        <main className="main" ref={mainRef}>
          <header className="topbar">
            <button className="search-trigger" onClick={() => setPalette(true)}>
              <LuSearch size={16} />Search this project…<kbd>⌘K</kbd>
            </button>
            <div className="top-right">
              <button className="clock" title="Business time">
                <span className="live-dot" /><Roll>{fmtTime(now, tz)}</Roll><small>Kolkata</small>
              </button>
              <button
                className="icon-btn"
                onClick={(e) => {
                  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                  themeTransition(e, () => setTheme(next));
                }}
                aria-label="Toggle theme"
              >
                {resolvedDark ? <LuSun size={17} /> : <LuMoon size={17} />}
              </button>
              <Menu width={300} trigger={({ toggle }) => (
                <button className="icon-btn" onClick={toggle} aria-label="Notifications">
                  <LuBell size={17} />
                  {waiting > 0 && <span className="pip" />}
                </button>
              )}>
                <div className="menu-title">Open</div>
                {pace.needClient.slice(0, 5).map((d) => (
                  <button key={d.id} onClick={() => navigate(`progress/${d.id}`)}>
                    <Avatar name="Xeroura" size="sm" tone="teal" />
                    <span className="grow ellipsis">{d.title}</span>
                  </button>
                ))}
                {!pace.needClient.length && <div className="muted" style={{ padding: '8px 10px', fontSize: 12.5 }}>Nothing waiting.</div>}
              </Menu>
              <button className="btn dark" onClick={() => setModal({ type: 'note' })}><LuMessageSquarePlus />Note</button>
            </div>
          </header>
          <Page key={`${route.page}-${project.id}`} />
        </main>
      </div>

      {palette && <CommandPalette onClose={() => setPalette(false)} />}
      {modal?.type === 'shortcuts' && (
        <Modal title="Keyboard shortcuts" onClose={() => setModal(null)}>
          {[['⌘ K', 'Search this project'], ['g then u / p / d / f / s', 'Jump pages'], ['?', 'This list']].map(([k, d]) => (
            <div key={k} className="row" style={{ justifyContent: 'space-between' }}><span>{d}</span><kbd>{k}</kbd></div>
          ))}
        </Modal>
      )}
      {modal?.type === 'note' && (
        <Modal
          title="Note"
          onClose={() => setModal(null)}
          footer={<>
            <button className="btn" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn primary" onClick={() => { toast('Sent.'); setModal(null); }}>Send</button>
          </>}
        >
          <div className="field"><label>To {latestUpdate?.author || 'Xeroura'}</label><textarea className="textarea" rows={4} placeholder="A note on this week’s work…" /></div>
        </Modal>
      )}
      {modal?.type === 'new-project' && (
        <NewProject onClose={() => setModal(null)} onCreate={createProject} />
      )}
      {modal?.type === 'add-person' && (
        <AddPerson
          onClose={() => setModal(null)}
          onAdd={(person) => {
            persistCatalog(addPerson(catalog, project.id, person));
            toast(`Added ${person.name}.`);
            setModal(null);
          }}
        />
      )}

      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind === 'error' ? 'error' : ''} ${t.leaving ? 'leaving' : ''}`}>
            {t.kind === 'error' ? '!' : <LuCircleCheck />}{t.msg}
          </div>
        ))}
      </div>
    </AppCtx.Provider>
  );
}

function NewProject({ onClose, onCreate }) {
  const [f, setF] = useState({ client: '', name: '', targetISO: '', contactName: '', contactEmail: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ready = f.client.trim() && f.name.trim() && f.targetISO;
  return (
    <Modal
      title="New project"
      onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!ready} onClick={() => onCreate({
          client: f.client, name: f.name, targetISO: f.targetISO,
          contact: f.contactName.trim() && f.contactEmail.trim() ? { name: f.contactName, email: f.contactEmail } : null,
        })}>Open</button>
      </>}
    >
      <label className="field"><span>Organisation</span><input className="input" autoFocus value={f.client} onChange={set('client')} placeholder="Who we’re building for" /></label>
      <label className="field"><span>Project</span><input className="input" value={f.name} onChange={set('name')} placeholder="What we call the work" /></label>
      <label className="field"><span>Delivery</span><input className="input" type="date" value={f.targetISO} onChange={set('targetISO')} /></label>
      <div className="grid2">
        <label className="field"><span>First login · name</span><input className="input" value={f.contactName} onChange={set('contactName')} placeholder="Optional" /></label>
        <label className="field"><span>Email</span><input className="input" type="email" value={f.contactEmail} onChange={set('contactEmail')} placeholder="they@org.com" /></label>
      </div>
    </Modal>
  );
}

function AddPerson({ onClose, onAdd }) {
  const [f, setF] = useState({ name: '', email: '', role: 'Client', side: 'client' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ready = f.name.trim() && f.email.trim();
  return (
    <Modal
      title="Add a login"
      onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!ready} onClick={() => onAdd(f)}>Add</button>
      </>}
    >
      <label className="field"><span>Name</span><input className="input" autoFocus value={f.name} onChange={set('name')} /></label>
      <label className="field"><span>Email</span><input className="input" type="email" value={f.email} onChange={set('email')} placeholder="they@org.com" /></label>
      <div className="grid2">
        <label className="field"><span>Role</span><input className="input" value={f.role} onChange={set('role')} /></label>
        <label className="field"><span>Side</span>
          <select className="select" value={f.side} onChange={set('side')}>
            <option value="client">Client</option>
            <option value="xeroura">Xeroura</option>
          </select>
        </label>
      </div>
    </Modal>
  );
}
