export const SESSION_KEY = 'xdash.session';
export const CATALOG_KEY = 'xdash.catalog.v1';

export const xerouraStaff = [
  { id: 'arjun', name: 'Arjun Rao', role: 'Xeroura', side: 'xeroura', email: 'arjun@xeroura.com', tone: 'teal' },
  { id: 'meera', name: 'Meera Nair', role: 'Xeroura', side: 'xeroura', email: 'meera@xeroura.com', tone: 'cyan' },
];

export const DEFAULT_PHASES = [
  { id: 'discovery', name: 'Discovery' },
  { id: 'build', name: 'Build' },
  { id: 'review', name: 'Review' },
  { id: 'launch', name: 'Launch' },
];

function fmtStarted(iso) {
  try {
    return new Date(`${iso}T12:00:00+05:30`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  } catch { return iso; }
}
function fmtTarget(iso) {
  try {
    return new Date(`${iso}T12:00:00+05:30`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

export function decorateProject(p) {
  return {
    needNoun: 'the client',
    needShort: 'Client',
    phases: DEFAULT_PHASES,
    people: [...xerouraStaff],
    updates: [],
    files: [],
    ...p,
    started: p.started || fmtStarted(p.startedISO),
    target: p.target || fmtTarget(p.targetISO),
  };
}

export const SEED_PROJECTS = [
  decorateProject({
    id: 'inq',
    name: 'inQ',
    client: 'inQ Public School',
    prefix: 'INQ',
    phase: 'Pulse',
    startedISO: '2024-03-01',
    targetISO: '2026-12-15',
    needNoun: 'the school',
    needShort: 'School',
    phases: [
      { id: 'discovery', name: 'Discovery' },
      { id: 'orbit', name: 'Orbit' },
      { id: 'pulse', name: 'Pulse' },
      { id: 'ledger', name: 'Ledger' },
      { id: 'launch', name: 'Launch' },
    ],
    people: [
      { id: 'priya', name: 'Priya Sharma', role: 'Client', side: 'client', email: 'priya@inq.edu', tone: 'violet' },
      { id: 'rahul', name: 'Rahul Mehta', role: 'Finance', side: 'client', email: 'rahul@inq.edu', tone: 'amber' },
      { id: 'ananya', name: 'Ananya Iyer', role: 'Ops', side: 'client', email: 'ananya@inq.edu', tone: 'rose' },
      { id: 'nisha', name: 'Nisha Kulkarni', role: 'Principal', side: 'client', email: 'nisha@inq.edu', password: 'look-inq', tone: 'indigo' },
      ...xerouraStaff,
    ],
    updates: [
      {
        id: 'w32',
        date: '6 Nov 2026',
        week: 'Week 32',
        author: 'Arjun Rao',
        role: 'Xeroura',
        headline: 'Pulse 2.4 is up. Held the November reminder.',
        body: 'Circulars now reach parents the morning they go out. The November fee reminder is ready, but we will not send it until you sign the copy. October GST pack is in Files — Rahul already has it.',
        shipped: ['Pulse 2.4 — circulars', 'Reminder retry (no more doubles)', 'October GST pack'],
        next: ['Hindi receipts, once copy is locked', 'Parent-app dark mode', 'Launch rehearsal, 12 Dec'],
      },
      {
        id: 'w31',
        date: '30 Oct 2026',
        week: 'Week 31',
        author: 'Arjun Rao',
        role: 'Xeroura',
        headline: 'Attendance is live for the whole campus.',
        body: 'Orbit closed the day with 1,284 students marked. Spent the week on the parent-app reminder so it never double-sends.',
        shipped: ['Orbit attendance for every class', 'Reminder dry-run on Class 8'],
        next: ['Pulse 2.4 review build'],
      },
      {
        id: 'w30',
        date: '23 Oct 2026',
        week: 'Week 30',
        author: 'Arjun Rao',
        role: 'Xeroura',
        headline: 'Fee cycles moved off the spreadsheet.',
        body: 'Ledger can run November without a second sheet. Concessions still need your list before we publish.',
        shipped: ['Ledger November cycle', 'Concession import'],
        next: ['GST pack', 'Pulse copy review'],
      },
    ],
    files: [
      { id: 'f1', name: 'Pulse 2.4 — parent preview', kind: 'Prototype', when: '6 Nov', by: 'Xeroura' },
      { id: 'f2', name: 'November fee reminder — copy', kind: 'Doc', when: '6 Nov', by: 'Xeroura' },
      { id: 'f3', name: 'October GST pack', kind: 'PDF', when: '5 Nov', by: 'Rahul' },
      { id: 'f4', name: 'Campus launch rehearsal — agenda', kind: 'Doc', when: '4 Nov', by: 'Xeroura' },
      { id: 'f5', name: 'Orbit attendance — week of 27 Oct', kind: 'Sheet', when: '31 Oct', by: 'Orbit' },
    ],
  }),
  decorateProject({
    id: 'northline',
    name: 'LiveBot',
    client: 'Northline Assurance',
    prefix: 'NL',
    phase: 'Pilot',
    startedISO: '2026-06-01',
    targetISO: '2026-11-28',
    people: [
      { id: 'kavya', name: 'Kavya Menon', role: 'Ops', side: 'client', email: 'kavya@northline.in', tone: 'violet' },
      { id: 'dev', name: 'Dev Patel', role: 'IT', side: 'client', email: 'dev@northline.in', tone: 'amber' },
      ...xerouraStaff,
    ],
    phases: [
      { id: 'discovery', name: 'Discovery' },
      { id: 'build', name: 'Build' },
      { id: 'pilot', name: 'Pilot' },
      { id: 'launch', name: 'Launch' },
    ],
    updates: [
      {
        id: 'n18',
        date: '6 Nov 2026',
        week: 'Week 18',
        author: 'Meera Nair',
        role: 'Xeroura',
        headline: 'Handover is in review. Hindi scripts are waiting on you.',
        body: 'Claims can pass a chat to the desk without dropping the thread. Hindi still needs Kavya’s pass before we put it on the WhatsApp number.',
        shipped: ['WhatsApp channel on the test number', 'Desk handover'],
        next: ['Hindi scripts', 'Pilot with claims, 18 Nov'],
      },
      {
        id: 'n17',
        date: '30 Oct 2026',
        week: 'Week 17',
        author: 'Arjun Rao',
        role: 'Xeroura',
        headline: 'Intent map closed. Channel is next.',
        body: 'Forty-two intents from the last quarter of tickets. Nothing exotic — most of it is policy status and document chase.',
        shipped: ['Intent map', 'Fallback to desk'],
        next: ['WhatsApp channel'],
      },
    ],
    files: [
      { id: 'nf1', name: 'Intent map — Q3 tickets', kind: 'Sheet', when: '30 Oct', by: 'Xeroura' },
      { id: 'nf2', name: 'Hindi scripts — draft', kind: 'Doc', when: '5 Nov', by: 'Meera' },
      { id: 'nf3', name: 'Pilot plan — claims desk', kind: 'Doc', when: '4 Nov', by: 'Xeroura' },
    ],
  }),
];

export function loadCatalog() {
  let stored = [];
  try {
    const raw = JSON.parse(localStorage.getItem(CATALOG_KEY) || 'null');
    if (Array.isArray(raw) && raw.length) stored = raw;
  } catch { /* */ }
  if (!stored.length) {
    const seed = SEED_PROJECTS.map((p) => structuredClone(p));
    saveCatalog(seed);
    return seed;
  }
  const seedById = new Map(SEED_PROJECTS.map((p) => [p.id, p]));
  const out = stored.map((p) => {
    const seed = seedById.get(p.id);
    if (!seed) return decorateProject(p);
    const have = new Set((p.people || []).map((x) => String(x.email || '').toLowerCase()));
    const people = [...(p.people || [])];
    for (const person of seed.people) {
      const email = String(person.email || '').toLowerCase();
      if (!have.has(email)) people.push(person);
      else {
        const i = people.findIndex((x) => String(x.email || '').toLowerCase() === email);
        if (i >= 0 && person.password && !people[i].password) people[i] = { ...people[i], password: person.password };
      }
    }
    return decorateProject({ ...p, people });
  });
  const haveIds = new Set(out.map((p) => p.id));
  for (const seed of SEED_PROJECTS) {
    if (!haveIds.has(seed.id)) out.push(structuredClone(seed));
  }
  saveCatalog(out);
  return out;
}

export function saveCatalog(projects) {
  try { localStorage.setItem(CATALOG_KEY, JSON.stringify(projects)); } catch { /* */ }
}

export function slugify(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28) || 'project';
}

export function uniqueId(base, taken) {
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  return id;
}

export function prefixFrom(name, taken) {
  const letters = String(name || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  const base = (letters.slice(0, 3) || 'PRJ');
  return uniqueId(base, taken);
}

export function addProject(catalog, { name, client, targetISO, prefix, contact }) {
  const takenIds = new Set(catalog.map((p) => p.id));
  const takenPx = new Set(catalog.map((p) => p.prefix));
  const id = uniqueId(slugify(name || client), takenIds);
  const px = prefixFrom(prefix || name || client, takenPx);
  const startedISO = new Date().toISOString().slice(0, 10);
  const people = [...xerouraStaff];
  if (contact?.name && contact?.email) {
    people.unshift({
      id: slugify(contact.email.split('@')[0]),
      name: contact.name.trim(),
      role: contact.role || 'Client',
      side: 'client',
      email: contact.email.trim().toLowerCase(),
      tone: 'violet',
    });
  }
  const project = decorateProject({
    id,
    name: (name || client).trim(),
    client: (client || name).trim(),
    prefix: px,
    phase: 'Discovery',
    startedISO,
    targetISO,
    people,
  });
  return { catalog: [project, ...catalog], project };
}

export function patchProject(catalog, id, patch) {
  return catalog.map((p) => (p.id === id ? decorateProject({ ...p, ...patch }) : p));
}

export function addPerson(catalog, projectId, person) {
  const email = person.email.trim().toLowerCase();
  const row = {
    id: slugify(email.split('@')[0] || person.name),
    name: person.name.trim(),
    role: person.role || (person.side === 'xeroura' ? 'Xeroura' : 'Client'),
    side: person.side || (email.endsWith('@xeroura.com') ? 'xeroura' : 'client'),
    email,
    tone: person.tone || (person.side === 'xeroura' ? 'teal' : 'violet'),
  };
  return catalog.map((p) => {
    if (p.id !== projectId) return p;
    if (p.people.some((x) => x.email.toLowerCase() === email)) return p;
    return { ...p, people: [...p.people, row] };
  });
}

export function personByName(people, name) {
  return people.find((p) => p.name === name) || people[0] || xerouraStaff[0];
}

export function findLogin(email, catalog = loadCatalog()) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) return null;
  for (const p of catalog) {
    const who = p.people.find((x) => x.email.toLowerCase() === e);
    if (who) return { person: who, project: p };
  }
  return null;
}

export function isXerouraEmail(email, catalog = loadCatalog()) {
  const e = String(email || '').trim().toLowerCase();
  if (e.endsWith('@xeroura.com')) return true;
  return catalog.some((p) => p.people.some((x) => x.email.toLowerCase() === e && x.side === 'xeroura'));
}

export function projectsFor(email, catalog = loadCatalog()) {
  if (isXerouraEmail(email, catalog)) return catalog;
  const e = String(email || '').trim().toLowerCase();
  return catalog.filter((p) => p.people.some((x) => x.email.toLowerCase() === e));
}

export function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
export function saveSession(s) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
