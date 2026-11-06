import { SEED_PROJECTS } from './data.js';

export const BOARD_KEY = 'xdash.board.v1';
export const ACTOR_KEY = 'xdash.actor';
const boardKey = (projectId) => `xdash.board.v2.${projectId}`;

export const COLS = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'In progress' },
  { id: 'done', label: 'Done' },
];

const WEEK = 7 * 864e5;
const ts = (s) => Date.parse(`${s}T12:00:00+05:30`);
const nid = () => Math.random().toString(36).slice(2, 9);

export function mockShot(label, c1 = '#1b3a4a', c2 = '#0f8c80') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="460">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <rect width="720" height="460" fill="#0f1218"/>
    <rect x="20" y="20" width="680" height="420" rx="18" fill="#161a21"/>
    <rect x="20" y="20" width="680" height="52" fill="#1c212b"/>
    <circle cx="48" cy="46" r="6" fill="#d33a2f"/>
    <circle cx="68" cy="46" r="6" fill="#c06f08"/>
    <circle cx="88" cy="46" r="6" fill="#18a957"/>
    <text x="114" y="51" fill="#9aa2ae" font-family="Manrope,Helvetica,sans-serif" font-size="13" font-weight="700">${label}</text>
    <rect x="44" y="96" width="240" height="14" rx="7" fill="#2a3140"/>
    <rect x="44" y="124" width="380" height="8" rx="4" fill="#232833"/>
    <rect x="44" y="152" width="632" height="248" rx="14" fill="url(#g)"/>
    <rect x="68" y="178" width="180" height="10" rx="5" fill="rgba(255,255,255,.55)"/>
    <rect x="68" y="202" width="280" height="8" rx="4" fill="rgba(255,255,255,.28)"/>
    <rect x="68" y="340" width="120" height="28" rx="14" fill="rgba(255,255,255,.9)"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function peopleOf(id) {
  return SEED_PROJECTS.find((p) => p.id === id)?.people || [];
}

function comment(people, author, text, at, extra = {}) {
  const p = people.find((x) => x.name === author) || people[0];
  return { id: nid(), kind: 'comment', author: p.name, side: p.side, tone: p.tone, text, at: ts(at), shots: [], ...extra };
}

function stamp(tasks) {
  return tasks.map((t) => ({ history: [{ id: nid(), kind: 'created', author: t.assignee || 'Arjun Rao', side: 'xeroura', text: 'Opened', at: t.created }], ...t }));
}

function seedInq() {
  const people = peopleOf('inq');
  const c = (author, text, at, extra) => comment(people, author, text, at, extra);
  return stamp([
    { id: 'INQ-1', title: 'Campus map and roles', body: 'Who signs what, which classes, which parent phones. Closed in April.', status: 'done', phase: 'discovery', points: 3, assignee: 'Arjun Rao', need: null, due: null, created: ts('2024-03-04'), doneAt: ts('2024-04-12'), shots: [], comments: [] },
    { id: 'INQ-2', title: 'Parent interviews', body: 'Twelve families. Circulars and fee reminders were the two things they actually open.', status: 'done', phase: 'discovery', points: 2, assignee: 'Meera Nair', need: null, due: null, created: ts('2024-03-18'), doneAt: ts('2024-04-28'), shots: [], comments: [] },
    { id: 'INQ-3', title: 'Orbit · admissions', body: 'Application through allotment, on the school side.', status: 'done', phase: 'orbit', points: 8, assignee: 'Arjun Rao', need: null, due: null, created: ts('2024-05-02'), doneAt: ts('2024-06-20'), shots: [], comments: [] },
    { id: 'INQ-4', title: 'Orbit · attendance', body: '1,284 students. Day closes from the class teacher phone.', status: 'done', phase: 'orbit', points: 8, assignee: 'Meera Nair', need: null, due: null, created: ts('2024-06-22'), doneAt: ts('2024-08-15'), shots: [], comments: [] },
    { id: 'INQ-5', title: 'Staff logins', body: 'Front office, class teachers, accounts.', status: 'done', phase: 'orbit', points: 5, assignee: 'Arjun Rao', need: null, due: null, created: ts('2024-07-01'), doneAt: ts('2024-08-30'), shots: [], comments: [] },
    { id: 'INQ-6', title: 'Teacher roster', body: 'Homeroom mapping for attendance.', status: 'done', phase: 'orbit', points: 5, assignee: 'Meera Nair', need: null, due: null, created: ts('2024-08-18'), doneAt: ts('2024-09-10'), shots: [], comments: [] },
    { id: 'INQ-7', title: 'Concession import', body: 'Last cycle’s eleven families loaded into Ledger.', status: 'done', phase: 'ledger', points: 3, assignee: 'Arjun Rao', need: null, due: null, created: ts('2026-10-06'), doneAt: ts('2026-10-23'), shots: [], comments: [] },
    { id: 'INQ-8', title: 'Reminder dry-run · Class 8', body: 'No doubles. Ready to turn on for the rest.', status: 'done', phase: 'pulse', points: 2, assignee: 'Meera Nair', need: null, due: null, created: ts('2026-10-20'), doneAt: ts('2026-10-30'), shots: [], comments: [] },
    { id: 'INQ-9', title: 'Pulse 2.4 · circulars', body: 'Circulars land on the parent phone the same morning they go out.', status: 'done', phase: 'pulse', points: 8, assignee: 'Meera Nair', need: null, due: null, created: ts('2026-09-12'), doneAt: ts('2026-11-04'), shots: [{ id: 's1', name: 'circular-feed.svg', dataUrl: mockShot('Pulse · circulars', '#123348', '#1689a8'), at: ts('2026-11-04'), by: 'Meera Nair' }], comments: [c('Meera Nair', 'Shipped to the Class 8 parents first. No bounce on the morning batch.', '2026-11-04')] },
    { id: 'INQ-10', title: 'Reminder retry bug', body: 'Was firing twice on poor networks. Closed.', status: 'done', phase: 'pulse', points: 3, assignee: 'Arjun Rao', need: null, due: null, created: ts('2026-10-28'), doneAt: ts('2026-11-05'), shots: [], comments: [] },
    { id: 'INQ-11', title: 'October GST pack', body: 'Downloaded by Rahul on the 5th.', status: 'done', phase: 'ledger', points: 2, assignee: 'Arjun Rao', need: null, due: null, created: ts('2026-10-30'), doneAt: ts('2026-11-05'), shots: [], comments: [c('Rahul Mehta', 'Got it. Numbers match the Tally export.', '2026-11-05')] },
    { id: 'INQ-12', title: 'Parent preview · Pulse 2.4', body: 'The build Priya walked on Friday.', status: 'done', phase: 'pulse', points: 5, assignee: 'Meera Nair', need: null, due: null, created: ts('2026-10-27'), doneAt: ts('2026-11-06'), shots: [{ id: 's2', name: 'parent-preview.svg', dataUrl: mockShot('Pulse · parent phone', '#14283a', '#5a47d6'), at: ts('2026-11-06'), by: 'Meera Nair' }], comments: [] },
    { id: 'INQ-13', title: 'Parent-app dark mode', body: 'Parents asked for it. In on Meera this week — not blocking launch.', status: 'doing', phase: 'pulse', points: 3, assignee: 'Meera Nair', need: null, due: '2026-11-20', created: ts('2026-11-01'), doneAt: null, shots: [], comments: [c('Meera Nair', 'Palette is in. Need a pass on the fee receipt before I call it done.', '2026-11-06')] },
    { id: 'INQ-14', title: 'Pulse 2.4 reminder copy', body: 'November fee text. We will not send until you say go.', status: 'doing', phase: 'pulse', points: 2, assignee: 'Arjun Rao', need: 'client', due: '2026-11-08', created: ts('2026-11-03'), doneAt: null, shots: [
      { id: 's3', name: 'reminder-en.svg', dataUrl: mockShot('Fee reminder · EN', '#1a3320', '#18a957'), at: ts('2026-11-06'), by: 'Arjun Rao' },
      { id: 's4', name: 'reminder-hi.svg', dataUrl: mockShot('Fee reminder · HI', '#1a2833', '#2f6fe0'), at: ts('2026-11-06'), by: 'Arjun Rao' },
    ], comments: [
      c('Arjun Rao', 'English and Hindi both in the preview. Holding send until you sign the Hindi line.', '2026-11-06'),
      c('Priya Sharma', 'Send me the screenshot of the Hindi version — I want Ananya to read it first.', '2026-11-06'),
      c('Arjun Rao', 'Attached both. Default stays English until you pick.', '2026-11-06', { shots: [{ id: 's4c', name: 'reminder-hi.svg', dataUrl: mockShot('Fee reminder · HI', '#1a2833', '#2f6fe0'), at: ts('2026-11-06'), by: 'Arjun Rao' }] }),
    ] },
    { id: 'INQ-15', title: 'Hindi on fee receipts', body: 'Ledger can print EN / HI. Default stays English until you pick.', status: 'doing', phase: 'ledger', points: 3, assignee: 'Arjun Rao', need: 'client', due: '2026-11-13', created: ts('2026-11-04'), doneAt: null, shots: [], comments: [c('Arjun Rao', 'Need a yes on Hindi as default for Class 1–5, English for the rest — or Hindi everywhere.', '2026-11-06')] },
    { id: 'INQ-16', title: 'November concession list', body: 'Eleven families from last cycle. Missing names will be billed in full.', status: 'todo', phase: 'ledger', points: 2, assignee: null, need: 'client', due: '2026-11-16', created: ts('2026-11-05'), doneAt: null, shots: [], comments: [c('Arjun Rao', 'Same eleven as October unless accounts send a new sheet.', '2026-11-05')] },
    { id: 'INQ-17', title: 'Ledger · November cycle', body: 'Can run once the concession list is in. Not before.', status: 'todo', phase: 'ledger', points: 3, assignee: 'Arjun Rao', need: null, due: '2026-11-20', created: ts('2026-11-05'), doneAt: null, shots: [], comments: [] },
    { id: 'INQ-18', title: 'Launch rehearsal · 12 Dec', body: 'Two hours with front office and class teachers.', status: 'todo', phase: 'launch', points: 2, assignee: 'Arjun Rao', need: 'client', due: '2026-12-12', created: ts('2026-11-04'), doneAt: null, shots: [], comments: [c('Arjun Rao', 'Need the hall and a yes from Ananya on the 12th, 10–12.', '2026-11-04')] },
    { id: 'INQ-19', title: 'Teacher training', body: 'Attendance, circulars, who to ping when a parent replies.', status: 'todo', phase: 'launch', points: 3, assignee: 'Meera Nair', need: null, due: '2026-12-10', created: ts('2026-11-04'), doneAt: null, shots: [], comments: [] },
    { id: 'INQ-20', title: 'Campus go-live', body: 'Flip Pulse and Ledger for the whole school.', status: 'todo', phase: 'launch', points: 3, assignee: 'Arjun Rao', need: null, due: '2026-12-15', created: ts('2026-11-04'), doneAt: null, shots: [], comments: [] },
  ]);
}

function seedNorthline() {
  const people = peopleOf('northline');
  const c = (author, text, at) => comment(people, author, text, at);
  return stamp([
    { id: 'NL-1', title: 'Discovery · claims desk', body: 'How a ticket moves today, who picks it up after hours.', status: 'done', phase: 'discovery', points: 3, assignee: 'Arjun Rao', need: null, due: null, created: ts('2026-06-04'), doneAt: ts('2026-06-20'), shots: [], comments: [] },
    { id: 'NL-2', title: 'Intent map', body: 'Forty-two intents from Q3. Policy status and document chase cover most of it.', status: 'done', phase: 'discovery', points: 5, assignee: 'Meera Nair', need: null, due: null, created: ts('2026-06-22'), doneAt: ts('2026-07-18'), shots: [], comments: [] },
    { id: 'NL-3', title: 'WhatsApp channel · test number', body: 'Live on the sandbox number. Production number waits on IT.', status: 'done', phase: 'build', points: 5, assignee: 'Arjun Rao', need: null, due: null, created: ts('2026-08-01'), doneAt: ts('2026-10-28'), shots: [{ id: 'ns1', name: 'wa-test.svg', dataUrl: mockShot('LiveBot · WhatsApp', '#123348', '#18a957'), at: ts('2026-10-28'), by: 'Arjun Rao' }], comments: [c('Dev Patel', 'Sandbox is fine. Production number after the 20th.', '2026-10-29')] },
    { id: 'NL-4', title: 'Desk handover', body: 'A chat can move to claims without dropping the thread.', status: 'doing', phase: 'build', points: 5, assignee: 'Arjun Rao', need: null, due: '2026-11-12', created: ts('2026-10-20'), doneAt: null, shots: [{ id: 'ns2', name: 'handover.svg', dataUrl: mockShot('LiveBot · handover', '#14283a', '#5a47d6'), at: ts('2026-11-05'), by: 'Arjun Rao' }], comments: [c('Arjun Rao', 'Handover keeps the history. Need Dev on the desk SSO.', '2026-11-05')] },
    { id: 'NL-5', title: 'Hindi scripts', body: 'Draft is in Files. Will not put it on the number until Kavya signs it.', status: 'doing', phase: 'pilot', points: 3, assignee: 'Meera Nair', need: 'client', due: '2026-11-14', created: ts('2026-11-01'), doneAt: null, shots: [], comments: [c('Meera Nair', 'Draft attached in Files. Two lines I’m unsure about — flagged in the doc.', '2026-11-05')] },
    { id: 'NL-6', title: 'After-hours flow', body: 'Hold, or pass to the on-call? Waiting on ops.', status: 'todo', phase: 'pilot', points: 2, assignee: 'Meera Nair', need: 'client', due: '2026-11-18', created: ts('2026-11-03'), doneAt: null, shots: [], comments: [c('Arjun Rao', 'Need a yes from Kavya: hold until morning, or wake on-call.', '2026-11-04')] },
    { id: 'NL-7', title: 'Pilot · claims team', body: 'Eight people, two weeks. Date is the 18th if scripts are signed.', status: 'todo', phase: 'pilot', points: 3, assignee: 'Arjun Rao', need: 'client', due: '2026-11-18', created: ts('2026-11-04'), doneAt: null, shots: [], comments: [] },
    { id: 'NL-8', title: 'Production number', body: 'IT flips the live WhatsApp once the pilot holds.', status: 'todo', phase: 'launch', points: 2, assignee: 'Dev Patel', need: null, due: '2026-11-25', created: ts('2026-11-04'), doneAt: null, shots: [], comments: [] },
    { id: 'NL-9', title: 'Go-live', body: 'Bot on the public number, desk behind it.', status: 'todo', phase: 'launch', points: 3, assignee: 'Arjun Rao', need: null, due: '2026-11-28', created: ts('2026-11-04'), doneAt: null, shots: [], comments: [] },
  ]);
}

const SEED_BOARDS = {
  inq: seedInq,
  northline: seedNorthline,
};

function migrateLegacyInq() {
  try {
    const v2 = localStorage.getItem(boardKey('inq'));
    if (v2) return;
    const v1 = localStorage.getItem(BOARD_KEY);
    if (v1) localStorage.setItem(boardKey('inq'), v1);
  } catch { /* */ }
}

export function seedBoard(projectId) {
  const seed = SEED_BOARDS[projectId];
  return seed ? seed() : [];
}

export function loadBoard(projectId) {
  if (projectId === 'inq') migrateLegacyInq();
  try {
    const raw = JSON.parse(localStorage.getItem(boardKey(projectId)) || 'null');
    if (Array.isArray(raw)) return raw;
  } catch { /* */ }
  const seed = SEED_BOARDS[projectId];
  return seed ? seed() : [];
}

export function saveBoard(projectId, tasks) {
  const key = boardKey(projectId);
  try {
    localStorage.setItem(key, JSON.stringify(tasks));
  } catch {
    const slim = tasks.map((t) => ({
      ...t,
      shots: (t.shots || []).map((s) => ({ ...s, dataUrl: (s.dataUrl || '').length > 120000 ? '' : s.dataUrl })),
      comments: (t.comments || []).map((c) => ({
        ...c,
        shots: (c.shots || []).map((s) => ({ ...s, dataUrl: (s.dataUrl || '').length > 80000 ? '' : s.dataUrl })),
      })),
    }));
    try { localStorage.setItem(key, JSON.stringify(slim)); } catch { /* quota */ }
  }
}

export function loadActor(people, email) {
  try {
    const id = localStorage.getItem(ACTOR_KEY);
    const saved = people.find((p) => p.id === id);
    if (saved) return saved;
  } catch { /* */ }
  return people.find((p) => p.email?.toLowerCase() === String(email || '').toLowerCase()) || people[0];
}

export function saveActor(p) {
  try { localStorage.setItem(ACTOR_KEY, p.id); } catch { /* */ }
}

export function nextId(tasks, prefix = 'TASK') {
  const n = Math.max(0, ...tasks.map((t) => Number(String(t.id).split('-').pop()) || 0));
  return `${prefix}-${n + 1}`;
}

export function readImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1280;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve({
        id: nid(),
        name: file.name,
        dataUrl: c.toDataURL('image/jpeg', 0.74),
        at: Date.now(),
      });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}

export function addTask(tasks, partial, actor, prefix = 'TASK') {
  const now = Date.now();
  const t = {
    id: nextId(tasks, prefix),
    title: partial.title.trim(),
    body: (partial.body || '').trim(),
    status: partial.status || 'todo',
    phase: partial.phase || 'build',
    points: Number(partial.points) || 2,
    assignee: partial.assignee || actor.name,
    need: partial.need || null,
    due: partial.due || null,
    created: now,
    doneAt: null,
    shots: [],
    comments: [],
    history: [{ id: nid(), kind: 'created', author: actor.name, side: actor.side, text: 'Opened', at: now }],
  };
  return [t, ...tasks];
}

export function patchTask(tasks, id, patch) {
  return tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
}

export function moveTask(tasks, id, status, actor) {
  return tasks.map((t) => {
    if (t.id !== id || t.status === status) return t;
    const now = Date.now();
    const col = COLS.find((c) => c.id === status);
    return {
      ...t,
      status,
      doneAt: status === 'done' ? now : null,
      need: status === 'done' ? null : t.need,
      history: [...(t.history || []), { id: nid(), kind: 'moved', author: actor.name, side: actor.side, text: `Moved to ${col?.label || status}`, at: now }],
    };
  });
}

export function addComment(tasks, id, { actor, text, shots = [] }) {
  const now = Date.now();
  const row = { id: nid(), kind: 'comment', author: actor.name, side: actor.side, tone: actor.tone, text: text.trim(), at: now, shots };
  return tasks.map((t) => {
    if (t.id !== id) return t;
    const extraShots = shots.map((s) => ({ ...s, by: actor.name }));
    return { ...t, comments: [...(t.comments || []), row], shots: extraShots.length ? [...(t.shots || []), ...extraShots] : t.shots };
  });
}

export function addShots(tasks, id, shots, actor) {
  const now = Date.now();
  const tagged = shots.map((s) => ({ ...s, by: actor.name, at: s.at || now }));
  return tasks.map((t) => {
    if (t.id !== id) return t;
    return {
      ...t,
      shots: [...(t.shots || []), ...tagged],
      history: [...(t.history || []), { id: nid(), kind: 'shot', author: actor.name, side: actor.side, text: `Added ${tagged.length} screenshot${tagged.length === 1 ? '' : 's'}`, at: now }],
    };
  });
}

export function approveTask(tasks, id, actor) {
  const now = Date.now();
  return tasks.map((t) => {
    if (t.id !== id) return t;
    return {
      ...t,
      need: null,
      comments: [...(t.comments || []), { id: nid(), kind: 'comment', author: actor.name, side: actor.side, tone: actor.tone, text: 'Approved.', at: now, shots: [] }],
    };
  });
}

export function paceOf(tasks, project, now = Date.now()) {
  const start = Date.parse(project.startedISO);
  const end = Date.parse(project.targetISO);
  const total = tasks.reduce((a, t) => a + (t.points || 0), 0) || 1;
  const done = tasks.filter((t) => t.status === 'done').reduce((a, t) => a + (t.points || 0), 0);
  const doing = tasks.filter((t) => t.status === 'doing').reduce((a, t) => a + (t.points || 0), 0);
  const remaining = total - done;
  const pct = done / total;
  const span = Math.max(1, end - start);
  const elapsed = Math.max(0, Math.min(1, (now - start) / span));
  const daysLeft = Math.max(0, Math.round((end - now) / 864e5));
  const recentFrom = now - 42 * 864e5;
  const recentPts = tasks.filter((t) => t.status === 'done' && t.doneAt && t.doneAt >= recentFrom).reduce((a, t) => a + t.points, 0);
  const recentWeeks = 6;
  const velocity = recentPts / recentWeeks || done / Math.max(1, (now - start) / WEEK);
  const weeksNeeded = velocity > 0.05 ? remaining / velocity : Infinity;
  const forecast = now + weeksNeeded * WEEK;
  const slackDays = Math.round((end - forecast) / 864e5);
  const onTrack = slackDays >= -7;
  const tight = slackDays < 14 && slackDays >= -7;
  const label = onTrack ? (tight ? 'Tight' : 'On track') : 'Behind';
  const tone = onTrack ? (tight ? 'amber' : 'wa') : 'red';
  const needClient = tasks.filter((t) => t.need === 'client' && t.status !== 'done');
  const open = tasks.filter((t) => t.status !== 'done');
  const phases = project.phases || [];
  const byPhase = phases.map((p) => {
    const rows = tasks.filter((t) => t.phase === p.id);
    const pts = rows.reduce((a, t) => a + t.points, 0);
    const d = rows.filter((t) => t.status === 'done').reduce((a, t) => a + t.points, 0);
    return { ...p, points: pts, done: d, pct: pts ? d / pts : 0, n: rows.length };
  });
  return {
    start, end, total, done, doing, remaining, pct, elapsed, daysLeft, velocity, weeksNeeded, forecast, slackDays, onTrack, tight, label, tone, needClient, open, byPhase,
  };
}

export function burnSeries(tasks, project, now = Date.now()) {
  const start = Date.parse(project.startedISO);
  const end = Date.parse(project.targetISO);
  const total = tasks.reduce((a, t) => a + (t.points || 0), 0) || 1;
  const from = now - 11 * WEEK;
  const pts = [];
  for (let t = from; t <= end + WEEK / 2; t += WEEK) {
    const actual = tasks.filter((x) => x.status === 'done' && x.doneAt && x.doneAt <= t + WEEK - 1).reduce((a, x) => a + x.points, 0);
    const planned = total * Math.max(0, Math.min(1, (t - start) / Math.max(1, end - start)));
    pts.push({ t, actual: t <= now ? actual : null, planned, isNow: t <= now && t + WEEK > now });
  }
  const pace = paceOf(tasks, project, now);
  return pts.map((p) => {
    if (p.actual != null) return { ...p, forecast: null };
    const weeksOut = (p.t - now) / WEEK;
    return { ...p, forecast: Math.min(total, pace.done + pace.velocity * weeksOut) };
  });
}
