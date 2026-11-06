/**
 * Push seed projects + boards + auth users into a Supabase project.
 *
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/seed.mjs
 *
 * Run supabase/schema.sql in the SQL editor first.
 */
import { createClient } from '@supabase/supabase-js';
import { SEED_PROJECTS } from '../src/data.js';
import { seedBoard } from '../src/store.js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

function passFor(email) {
  if (email === 'nisha@inq.edu') return 'look-inq';
  return 'demo';
}

async function ensureUser(person) {
  const email = person.email.toLowerCase();
  const password = passFor(email);
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: person.name, role: person.role, side: person.side, tone: person.tone },
  });
  if (error && !/already been registered|already exists/i.test(error.message || '')) {
    throw error;
  }
  if (data?.user) return data.user;
  const { data: list } = await db.auth.admin.listUsers({ perPage: 200 });
  return (list?.users || []).find((u) => u.email?.toLowerCase() === email);
}

function iso(ms) {
  return ms ? new Date(ms).toISOString() : new Date().toISOString();
}

async function main() {
  const users = new Map();
  for (const project of SEED_PROJECTS) {
    for (const person of project.people) {
      if (users.has(person.email.toLowerCase())) continue;
      const u = await ensureUser(person);
      if (!u) throw new Error(`Could not create ${person.email}`);
      users.set(person.email.toLowerCase(), u);
      console.log('user', person.email, u.id);
    }
  }

  for (const project of SEED_PROJECTS) {
    const { error: pe } = await db.from('projects').upsert({
      id: project.id, name: project.name, client: project.client, prefix: project.prefix,
      phase: project.phase, started_iso: project.startedISO, target_iso: project.targetISO,
      need_noun: project.needNoun, need_short: project.needShort,
    });
    if (pe) throw pe;
    await db.from('phases').delete().eq('project_id', project.id);
    await db.from('phases').insert(project.phases.map((p, i) => ({
      project_id: project.id, id: p.id, name: p.name, sort: i,
    })));
    await db.from('people').delete().eq('project_id', project.id);
    await db.from('people').insert(project.people.map((p) => ({
      project_id: project.id, id: p.id, name: p.name, role: p.role, side: p.side,
      email: p.email, tone: p.tone, user_id: users.get(p.email.toLowerCase())?.id || null,
    })));
    const memberIds = [...new Set(project.people.map((p) => users.get(p.email.toLowerCase())?.id).filter(Boolean))];
    await db.from('project_members').delete().eq('project_id', project.id);
    await db.from('project_members').insert(memberIds.map((user_id) => ({ project_id: project.id, user_id })));
    await db.from('updates').delete().eq('project_id', project.id);
    if (project.updates?.length) {
      await db.from('updates').insert(project.updates.map((u, i) => ({
        id: u.id, project_id: project.id, date_label: u.date, week: u.week, author: u.author, role: u.role,
        headline: u.headline, body: u.body, shipped: u.shipped || [], next: u.next || [], sort: i,
      })));
    }
    await db.from('files').delete().eq('project_id', project.id);
    if (project.files?.length) {
      await db.from('files').insert(project.files.map((f) => ({
        id: f.id, project_id: project.id, name: f.name, kind: f.kind, when_label: f.when, by_name: f.by,
      })));
    }

    const tasks = seedBoard(project.id);
    await db.from('task_shots').delete().eq('project_id', project.id);
    await db.from('task_comments').delete().eq('project_id', project.id);
    await db.from('task_history').delete().eq('project_id', project.id);
    await db.from('tasks').delete().eq('project_id', project.id);
    if (tasks.length) {
      await db.from('tasks').insert(tasks.map((t) => ({
        project_id: project.id, id: t.id, title: t.title, body: t.body || '', status: t.status, phase: t.phase,
        points: t.points, assignee: t.assignee, need: t.need, due: t.due, created_at: iso(t.created), done_at: t.doneAt ? iso(t.doneAt) : null,
      })));
      const comments = tasks.flatMap((t) => (t.comments || []).map((c) => ({
        id: c.id, project_id: project.id, task_id: t.id, author: c.author, side: c.side, tone: c.tone,
        body: c.text || '', created_at: iso(c.at),
      })));
      if (comments.length) await db.from('task_comments').insert(comments);
      const history = tasks.flatMap((t) => (t.history || []).map((h) => ({
        id: h.id, project_id: project.id, task_id: t.id, kind: h.kind, author: h.author, side: h.side,
        body: h.text || '', created_at: iso(h.at),
      })));
      if (history.length) await db.from('task_history').insert(history);
      const shots = tasks.flatMap((t) => [
        ...(t.shots || []).map((s) => ({ ...s, taskId: t.id, commentId: null })),
        ...(t.comments || []).flatMap((c) => (c.shots || []).map((s) => ({ ...s, taskId: t.id, commentId: c.id }))),
      ]).filter((s) => s.dataUrl);
      if (shots.length) {
        await db.from('task_shots').insert(shots.map((s) => ({
          id: s.id, project_id: project.id, task_id: s.taskId, comment_id: s.commentId, name: s.name,
          url: s.dataUrl, by_name: s.by, created_at: iso(s.at),
        })));
      }
    }
    console.log('project', project.id, tasks.length, 'tasks');
  }
  console.log('done');
}

main().catch((err) => { console.error(err); process.exit(1); });
