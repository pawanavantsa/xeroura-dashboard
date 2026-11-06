import { useEffect, useRef, useState } from 'react';
import { reduced } from '../motion.js';
import './auth-showcase.css';

const SCENE_MS = 6800;
const NAV = ['Update', 'Progress', 'Decisions', 'Files', 'Settings'];

function Count({ to, from = 0, ms = 1400, delay = 0, fmt = (v) => v }) {
  const [v, setV] = useState(reduced() ? to : from);
  useEffect(() => {
    if (reduced()) return undefined;
    let raf; const t0 = performance.now() + delay;
    const f = (t) => {
      const p = Math.max(0, Math.min(1, (t - t0) / ms));
      setV(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [to, from, ms, delay]);
  return <>{fmt(v)}</>;
}

const Ic = {
  ok: <svg viewBox="0 0 24 24" fill="none" stroke="#18a957" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.2L19 7" /></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="#c06f08" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  send: <svg viewBox="0 0 24 24" fill="none" stroke="#5a47d6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></svg>,
  eye: <svg viewBox="0 0 24 24" fill="none" stroke="#2f6fe0" strokeWidth="2.2" strokeLinecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>,
  up: <svg viewBox="0 0 24 24" fill="none" stroke="#5a47d6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>,
};
const TONE = { ok: '#e2f5e9', clock: '#fcefd9', send: '#eeebff', eye: '#e5eefd', up: '#eeebff' };

function UpdateScreen() {
  return (
    <div className="xs-today">
      <div className="xs-hello"><small>FRIDAY · YOUR PROJECT</small>Week 32</div>
      <div className="xs-stats">
        <div className="xs-st"><span>Project</span><b><Count to={68} fmt={(v) => `${Math.round(v)}%`} /></b></div>
        <div className="xs-st"><span>This phase</span><b>82%</b></div>
        <div className="xs-st"><span>Open</span><b>4</b></div>
        <div className="xs-st"><span>Target</span><b>15 Dec</b></div>
      </div>
      <div className="xs-flow">
        <div className="xs-fc"><h5><i style={{ background: '#18a957' }} />Shipped</h5><div className="xs-k">Pulse 2.4<span>Circulars in under a minute</span></div><div className="xs-k">Reminder bug closed<span>No more doubles</span></div></div>
        <div className="xs-fc"><h5><i style={{ background: '#5a47d6' }} />Next</h5><div className="xs-k">Hindi receipts<span>After you lock copy</span></div><div className="xs-k">Launch rehearsal<span>12 Dec</span></div></div>
        <div className="xs-fc"><h5><i style={{ background: '#c06f08' }} />Waiting</h5><div className="xs-k hot">Reminder copy<span>Needs your yes</span></div><div className="xs-k">Concession list<span>11 families</span></div></div>
        <div className="xs-fc"><h5><i style={{ background: '#2f6fe0' }} />From Arjun</h5><div className="xs-k">Friday update<span>Week 32 is in</span></div></div>
      </div>
    </div>
  );
}

function ProgressScreen() {
  const cols = [
    [['T-16', 'Concession list'], ['T-17', 'November cycle']],
    [['T-14', 'Reminder copy'], ['T-13', 'Dark mode']],
    [['T-9', 'Pulse 2.4'], ['T-11', 'GST pack']],
  ];
  return (
    <div className="xs-rep">
      <div className="xs-stats">
        <div className="xs-st"><span>Work done</span><b><Count to={75} fmt={(v) => `${Math.round(v)}%`} /></b></div>
        <div className="xs-st"><span>Open</span><b>8</b></div>
        <div className="xs-st"><span>Days left</span><b>38</b></div>
        <div className="xs-st"><span>Pace</span><b>Tight</b></div>
      </div>
      <div className="xs-board">
        {['To do', 'In progress', 'Done'].map((h, i) => (
          <div className="xs-bcol" key={h}>
            <h5>{h}<span>{cols[i].length}</span></h5>
            {cols[i].map(([id, n]) => <div className="xs-tc" key={id}><b>{n}</b><span>{id}</span></div>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function DecisionsScreen() {
  const rows = [
    ['YR', '#eeebff', '#5a47d6', 'Reminder copy', 'Approve Pulse 2.4', true],
    ['HI', '#e5eefd', '#2f6fe0', 'Hindi receipts', 'EN or HI default'],
    ['CO', '#fcefd9', '#c06f08', 'Concessions', 'November list'],
    ['LA', '#e2f5e9', '#0f7a3d', 'Launch rehearsal', '12 Dec · 2 hours'],
  ];
  return (
    <div className="xs-inbox">
      <div className="xs-list" style={{ gridColumn: '1 / -1' }}>
        <div className="xs-seg"><span className="on">Open 4</span><span>Done</span></div>
        {rows.map(([a, bg, fg, n, m, on], i) => (
          <div key={n} className={`xs-row ${on ? 'on' : ''}`} style={{ '--d': `${i * 0.07}s` }}>
            <span className="xs-av" style={{ background: bg, color: fg }}>{a}</span>
            <div className="t"><b>{n}</b><span>{m}</span></div>
            {i === 0 && <span className="xs-badge">1</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function FilesScreen() {
  return (
    <div className="xs-camp">
      <div className="xs-camp-l">
        <div className="xs-camp-h"><b>Files</b><span className="xs-btn">Download</span></div>
        {[['Pulse 2.4 — parent preview', 'Prototype', '#eeebff', '#5a47d6'], ['November fee reminder — copy', 'Doc', '#e5eefd', '#2f6fe0'], ['October GST pack', 'PDF', '#e2f5e9', '#0f7a3d'], ['Launch rehearsal — agenda', 'Doc', '#fcefd9', '#c06f08']].map(([n, s, bg, fg], i) => (
          <div key={n} className={`xs-crow ${i === 0 ? 'on' : ''}`} style={{ '--d': `${i * 0.08}s` }}><b>{n}</b><span className="xs-chip" style={{ background: bg, color: fg }}>{s}</span></div>
        ))}
      </div>
      <div className="xs-phone">
        <div className="xs-ph-head">Pulse · parent phone</div>
        <div className="xs-ph-body">
          <div className="xs-tpl">
            <div className="xs-tpl-img">Fee reminder</div>
            <b>Hi Kavya,</b> November fees for Aarav are due Friday. One tap — after you approve the copy.
            <small>Held until you say go</small>
            <div className="xs-tpl-btn">Approve copy</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SCENES = [
  {
    nav: 0, label: 'Update', Screen: UpdateScreen,
    title: ['Friday’s note,', 'from Arjun.'], sub: 'What shipped this week, what’s next, and the four things still open.',
    floats: [
      { ic: 'ok', b: 'Pulse 2.4 is up', s: 'Circulars the same morning', x: 50, y: 13 },
      { ic: 'clock', b: 'Reminder is held', s: 'Needs the copy signed', x: 58, y: 44 },
    ],
  },
  {
    nav: 1, label: 'Progress', Screen: ProgressScreen,
    title: ['Orbit is done.', 'Pulse is in review.'], sub: 'Discovery through launch — where the work sits this week.',
    floats: [
      { ic: 'up', b: 'Project at 75%', s: '38 days to 15 Dec', x: 50, y: 12 },
      { ic: 'ok', b: 'Orbit is done', s: '1,284 students marked', x: 58, y: 44 },
    ],
  },
  {
    nav: 2, label: 'Decisions', Screen: DecisionsScreen,
    title: ['Four things', 'waiting on you.'], sub: 'Copy, Hindi receipts, the November list, and a date for rehearsal.',
    floats: [
      { ic: 'send', b: '4 open', s: 'Reminder copy is first', x: 46, y: 12 },
      { ic: 'clock', b: 'Due tomorrow', s: 'November fee text', x: 58, y: 44 },
    ],
  },
  {
    nav: 3, label: 'Files', Screen: FilesScreen,
    title: ['The files', 'from this build.'], sub: 'Parent preview, reminder copy, October GST pack.',
    floats: [
      { ic: 'eye', b: 'Parent preview', s: 'Pulse 2.4', x: 48, y: 12 },
      { ic: 'ok', b: 'GST pack', s: 'October · Rahul has it', x: 56, y: 44 },
    ],
  },
];

export default function AuthStage() {
  const [i, setI] = useState(0);
  const [run, setRun] = useState(0);
  const root = useRef(null);
  const tilt = useRef(null);

  useEffect(() => {
    if (reduced()) return undefined;
    const t = setTimeout(() => { setI((x) => (x + 1) % SCENES.length); setRun((r) => r + 1); }, SCENE_MS);
    return () => clearTimeout(t);
  }, [i, run]);

  useEffect(() => {
    const host = root.current?.closest('.au-right');
    const el = tilt.current;
    if (!host || !el || reduced()) return undefined;
    const move = (e) => {
      const r = host.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', `${20 - y * 7}deg`);
      el.style.setProperty('--ry', `${-17 + x * 9}deg`);
    };
    const leave = () => { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); };
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    return () => { host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); };
  }, []);

  const go = (k) => { setI(k); setRun((r) => r + 1); };
  const s = SCENES[i];
  const Screen = s.Screen;

  return (
    <div className="xc" ref={root} style={{ '--scene': `${SCENE_MS}ms` }}>
      <div className="xc-aurora"><i /><i /><i /></div>
      <div className="xc-horizon" />
      <div className="xc-stage">
        <div className="xc-tilt" ref={tilt}>
          <div className="xc-screen">
            <aside className="xs-side">
              <div className="xs-brand">
                <span className="xs-bm"><img src="/logo-mark.png" alt="" /></span>
                Xeroura
              </div>
              <div className="xs-nav">
                <span className="xs-pill" style={{ transform: `translateY(${s.nav * 100}%)` }} />
                {NAV.map((n, k) => <div key={n} className={k === s.nav ? 'on' : ''}>{n}{n === 'Decisions' && <b>4</b>}</div>)}
              </div>
              <div className="xs-wa"><i />On track · 15 Dec</div>
            </aside>
            <main className="xs-main">
              <div className="xs-top"><span className="xs-search">Search this project…</span><span className="xs-clock"><i />6:44 PM</span><span className="xs-new">Note</span></div>
              <div className="xs-page" key={`${i}-${run}`}><Screen /></div>
            </main>
            <span className="xc-sweep" key={`sw-${i}-${run}`} />
          </div>
        </div>
        {s.floats.map((f, k) => (
          <div key={`${i}-${run}-${k}`} className="xc-float" style={{ left: `${f.x}%`, top: `${f.y}%`, '--delay': `${900 + k * 1300}ms` }}>
            <span className="ic" style={{ background: TONE[f.ic] }}>{Ic[f.ic]}</span>
            <div><b>{f.b}</b><span>{f.s}</span></div>
          </div>
        ))}
      </div>
      <div className="xc-vignette" />
      <div className="xc-cap">
        <div className="xc-steps">
          {SCENES.map((x, k) => (
            <button key={x.label} type="button" onClick={() => go(k)} className={k === i ? 'on' : k < i ? 'done' : ''}>
              <span>{x.label}</span><i key={k === i ? run : 'x'} />
            </button>
          ))}
        </div>
        <h3 key={`h-${i}-${run}`}><span>{s.title[0]}</span><br /><em>{s.title[1]}</em></h3>
        <p key={`p-${i}-${run}`}>{s.sub}</p>
      </div>
    </div>
  );
}
