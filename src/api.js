import { addPerson as addPersonLocal, addProject as addProjectLocal, decorateProject, loadCatalog, saveCatalog } from './data.js';
import { hasSupabase, supabase } from './lib/supabase.js';
import { loadBoard, saveBoard } from './store.js';

function shapeProject(row) {
  const phases = (row.phases || []).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0)).map((p) => ({ id: p.id, name: p.name }));
  const people = (row.people || []).map((p) => ({
    id: p.id, name: p.name, role: p.role, side: p.side, email: p.email, tone: p.tone,
  }));
  const files = (row.files || []).map((f) => ({
    id: f.id, name: f.name, kind: f.kind, when: f.when_label, by: f.by_name,
  }));
  const updates = (row.updates || []).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0)).map((u) => ({
    id: u.id, date: u.date_label, week: u.week, author: u.author, role: u.role,
    headline: u.headline, body: u.body, shipped: u.shipped || [], next: u.next || [],
  }));
  return decorateProject({
    id: row.id,
    name: row.name,
    client: row.client,
    prefix: row.prefix,
    phase: row.phase,
    startedISO: row.started_iso,
    targetISO: row.target_iso,
    needNoun: row.need_noun,
    needShort: row.need_short,
    phases, people, files, updates,
  });
}

function shapeTask(row, comments, shots, history) {
  const taskShots = shots.filter((s) => s.task_id === row.id).map((s) => ({
    id: s.id, name: s.name, dataUrl: s.url, by: s.by_name, at: Date.parse(s.created_at), commentId: s.comment_id,
  }));
  return {
    id: row.id,
    title: row.title,
    body: row.body || '',
    status: row.status,
    phase: row.phase,
    points: row.points,
    assignee: row.assignee,
    need: row.need,
    due: row.due,
    created: Date.parse(row.created_at),
    doneAt: row.done_at ? Date.parse(row.done_at) : null,
    shots: taskShots.filter((s) => !s.commentId),
    comments: comments.filter((c) => c.task_id === row.id).map((c) => ({
      id: c.id, kind: 'comment', author: c.author, side: c.side, tone: c.tone,
      text: c.body, at: Date.parse(c.created_at),
      shots: taskShots.filter((s) => s.commentId === c.id),
    })),
    history: history.filter((h) => h.task_id === row.id).map((h) => ({
      id: h.id, kind: h.kind, author: h.author, side: h.side, text: h.body, at: Date.parse(h.created_at),
    })),
  };
}

export async function fetchCatalog() {
  if (!hasSupabase) return loadCatalog();
  const { data, error } = await supabase.from('projects').select(`
    *,
    phases (*),
    people (*),
    files (*),
    updates (*)
  `);
  if (error) throw error;
  return (data || []).map(shapeProject);
}

export async function fetchBoard(projectId) {
  if (!hasSupabase) return loadBoard(projectId);
  const [{ data: tasks, error: e1 }, { data: comments, error: e2 }, { data: shots, error: e3 }, { data: history, error: e4 }] = await Promise.all([
    supabase.from('tasks').select('*').eq('project_id', projectId),
    supabase.from('task_comments').select('*').eq('project_id', projectId),
    supabase.from('task_shots').select('*').eq('project_id', projectId),
    supabase.from('task_history').select('*').eq('project_id', projectId),
  ]);
  const err = e1 || e2 || e3 || e4;
  if (err) throw err;
  return (tasks || []).map((t) => shapeTask(t, comments || [], shots || [], history || []))
    .sort((a, b) => (b.created || 0) - (a.created || 0));
}

function iso(ms) {
  if (!ms) return null;
  return new Date(ms).toISOString();
}

export async function pushTask(projectId, task) {
  if (!hasSupabase) return;
  const { error } = await supabase.from('tasks').upsert({
    project_id: projectId,
    id: task.id,
    title: task.title,
    body: task.body || '',
    status: task.status,
    phase: task.phase,
    points: task.points,
    assignee: task.assignee,
    need: task.need,
    due: task.due || null,
    created_at: iso(task.created) || new Date().toISOString(),
    done_at: iso(task.doneAt),
  });
  if (error) throw error;
  const comments = task.comments || [];
  if (comments.length) {
    const { error: ce } = await supabase.from('task_comments').upsert(comments.map((c) => ({
      id: c.id, project_id: projectId, task_id: task.id, author: c.author, side: c.side, tone: c.tone,
      body: c.text || '', created_at: iso(c.at) || new Date().toISOString(),
    })));
    if (ce) throw ce;
  }
  const history = task.history || [];
  if (history.length) {
    const { error: he } = await supabase.from('task_history').upsert(history.map((h) => ({
      id: h.id, project_id: projectId, task_id: task.id, kind: h.kind, author: h.author, side: h.side,
      body: h.text || '', created_at: iso(h.at) || new Date().toISOString(),
    })));
    if (he) throw he;
  }
  const commentShotIds = new Set(comments.flatMap((c) => (c.shots || []).map((s) => s.id)));
  const raw = [
    ...(task.shots || []).filter((s) => !commentShotIds.has(s.id)).map((s) => ({ ...s, commentId: null })),
    ...comments.flatMap((c) => (c.shots || []).map((s) => ({ ...s, commentId: c.id }))),
  ];
  const unique = [];
  const seen = new Set();
  for (const s of raw) {
    if (!s?.id || seen.has(s.id) || !s.dataUrl) continue;
    seen.add(s.id);
    unique.push(s);
  }
  const uploaded = [];
  for (const s of unique) uploaded.push(await uploadShot(projectId, task.id, s));
  if (uploaded.length) {
    const { error: se } = await supabase.from('task_shots').upsert(uploaded.map((s) => ({
      id: s.id, project_id: projectId, task_id: task.id, comment_id: s.commentId || null,
      name: s.name, url: s.dataUrl, by_name: s.by, created_at: iso(s.at) || new Date().toISOString(),
    })));
    if (se) throw se;
  }
}

export function persistLocalBoard(projectId, tasks) {
  if (!hasSupabase) saveBoard(projectId, tasks);
}

export async function uploadShot(projectId, taskId, shot) {
  if (!hasSupabase || !shot.dataUrl?.startsWith('data:')) return shot;
  const res = await fetch(shot.dataUrl);
  const blob = await res.blob();
  const path = `${projectId}/${taskId}/${shot.id}.jpg`;
  const { error } = await supabase.storage.from('shots').upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
  if (error) return shot;
  const { data } = supabase.storage.from('shots').getPublicUrl(path);
  return { ...shot, dataUrl: data.publicUrl };
}

export async function createProjectRemote(catalog, fields, actor) {
  if (!hasSupabase) {
    const out = addProjectLocal(catalog, fields);
    saveCatalog(out.catalog);
    return out;
  }
  const { catalog: next, project } = addProjectLocal(catalog, fields);
  const { error } = await supabase.from('projects').insert({
    id: project.id, name: project.name, client: project.client, prefix: project.prefix,
    phase: project.phase, started_iso: project.startedISO, target_iso: project.targetISO,
    need_noun: project.needNoun, need_short: project.needShort,
  });
  if (error) throw error;
  await supabase.from('phases').insert(project.phases.map((p, i) => ({
    project_id: project.id, id: p.id, name: p.name, sort: i,
  })));
  await supabase.from('people').insert(project.people.map((p) => ({
    project_id: project.id, id: p.id, name: p.name, role: p.role, side: p.side, email: p.email, tone: p.tone,
  })));
  const { data: staff } = await supabase.from('profiles').select('id').eq('side', 'xeroura');
  const ids = new Set((staff || []).map((s) => s.id));
  if (actor?.uid) ids.add(actor.uid);
  if (ids.size) {
    await supabase.from('project_members').insert([...ids].map((user_id) => ({ project_id: project.id, user_id })));
  }
  return { catalog: next, project };
}

export async function addPersonRemote(catalog, projectId, person) {
  if (!hasSupabase) {
    const next = addPersonLocal(catalog, projectId, person);
    saveCatalog(next);
    return next;
  }
  const next = addPersonLocal(catalog, projectId, person);
  const row = next.find((p) => p.id === projectId)?.people.find((x) => x.email === person.email.trim().toLowerCase());
  if (row) {
    const { error } = await supabase.from('people').insert({
      project_id: projectId, id: row.id, name: row.name, role: row.role, side: row.side, email: row.email, tone: row.tone,
    });
    if (error && !String(error.message || '').includes('duplicate')) throw error;
  }
  return next;
}

export { hasSupabase };
