import { useRef, useState } from 'react';
import { LuImagePlus, LuSend, LuX } from 'react-icons/lu';
import { Avatar, Chip, Drawer, Menu, Seg, useApp } from '../ui.jsx';
import { addComment, addShots, COLS, moveTask, patchTask, readImage } from '../store.js';
import { fmtAgo, fmtDay } from '../lib/time.js';

export default function TaskDrawer({ task, onClose }) {
  const { tasks, setTasks, actor, toast, people, phases, personByName, project } = useApp();
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef(null);
  const live = tasks.find((t) => t.id === task.id) || task;

  const save = (patch) => setTasks((list) => patchTask(list, live.id, patch));
  const move = (status) => setTasks((list) => moveTask(list, live.id, status, actor));

  const onFiles = async (files) => {
    const out = [];
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      try { out.push(await readImage(f)); } catch { toast('Could not read that image', 'error'); }
    }
    return out;
  };

  const attach = async (e) => {
    const shots = await onFiles([...e.target.files || []]);
    e.target.value = '';
    if (!shots.length) return;
    if (draft.trim()) setPending((p) => [...p, ...shots]);
    else setTasks((list) => addShots(list, live.id, shots, actor));
  };

  const send = () => {
    if (!draft.trim() && !pending.length) return;
    setTasks((list) => addComment(list, live.id, { actor, text: draft.trim() || 'Attached.', shots: pending }));
    setDraft('');
    setPending([]);
  };

  const activity = [...(live.history || []), ...(live.comments || [])].sort((a, b) => a.at - b.at);
  const who = live.assignee ? personByName(live.assignee) : null;

  return (
    <Drawer onClose={onClose} wide>
      <div className="drawer-head task-dh">
        <span className="mono faint">{live.id}</span>
        <span className="grow" />
        {live.need === 'client' && <Chip tone="amber" className="square">Needs {project.needShort.toLowerCase()}</Chip>}
        <button className="btn ghost sm" onClick={onClose} aria-label="Close"><LuX /></button>
      </div>
      <div
        className="drawer-body task-db"
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={async (e) => {
          e.preventDefault();
          const shots = await onFiles([...e.dataTransfer.files]);
          if (shots.length) setTasks((list) => addShots(list, live.id, shots, actor));
        }}
      >
        <input className="task-title" value={live.title} onChange={(e) => save({ title: e.target.value })} />
        <div className="task-meta">
          <Seg value={live.status} onChange={move} options={COLS.map((c) => ({ value: c.id, label: c.label }))} />
          <select className="select" style={{ width: 128 }} value={live.phase} onChange={(e) => save({ phase: e.target.value })}>
            {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className={`btn sm ${live.need ? 'soft' : ''}`} onClick={() => save({ need: live.need ? null : 'client' })}>
            {live.need ? `Needs ${project.needShort.toLowerCase()}` : `Flag for ${project.needShort.toLowerCase()}`}
          </button>
        </div>
        <div className="task-kv">
          <div>
            <div className="eyebrow">Assignee</div>
            <Menu width={200} trigger={({ toggle }) => (
              <button className="btn sm" onClick={toggle}>
                {who ? <><Avatar name={who.name} size="xs" tone={who.tone} />{who.name.split(' ')[0]}</> : 'Unassigned'}
              </button>
            )}>
              <button onClick={() => save({ assignee: null })}>Unassigned</button>
              {people.map((p) => (
                <button key={p.id} onClick={() => save({ assignee: p.name })}><Avatar name={p.name} size="sm" tone={p.tone} />{p.name}</button>
              ))}
            </Menu>
          </div>
          <div>
            <div className="eyebrow">Due</div>
            <input className="input" type="date" value={live.due || ''} onChange={(e) => save({ due: e.target.value || null })} style={{ width: 148 }} />
          </div>
          <div>
            <div className="eyebrow">Points</div>
            <input className="input" type="number" min="1" max="13" value={live.points} onChange={(e) => save({ points: Number(e.target.value) || 1 })} style={{ width: 64 }} />
          </div>
        </div>
        <label className="field">
          <span>Work</span>
          <textarea className="textarea" rows={4} value={live.body} onChange={(e) => save({ body: e.target.value })} placeholder="What this is, what’s left, what you’re waiting on." />
        </label>
        <div>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="eyebrow" style={{ margin: 0 }}>Screenshots</div>
            <button className="btn sm" onClick={() => fileRef.current?.click()}><LuImagePlus />Add</button>
          </div>
          {live.shots?.some((s) => s.dataUrl) ? (
            <div className="shot-grid">
              {live.shots.filter((s) => s.dataUrl).map((s) => (
                <button type="button" className="shot" key={s.id} onClick={() => setLightbox(s)}>
                  <img src={s.dataUrl} alt={s.name} />
                </button>
              ))}
            </div>
          ) : <p className="muted" style={{ margin: 0, fontSize: 12.5 }}>Drop images here, or add from the thread.</p>}
        </div>
        <div className="task-thread">
          <div className="eyebrow">Thread</div>
          {activity.map((a) => (
            a.kind === 'comment' ? (
              <div className={`bubble ${a.side === 'client' ? 'in' : 'out'}`} key={a.id}>
                <div className="who"><Avatar name={a.author} size="xs" tone={a.tone} />{a.author}</div>
                {a.text}
                {a.shots?.filter((s) => s.dataUrl).map((s) => (
                  <button type="button" className="shot inline" key={s.id} onClick={() => setLightbox(s)}><img src={s.dataUrl} alt={s.name} /></button>
                ))}
                <div className="meta">{fmtAgo(a.at)}</div>
              </div>
            ) : (
              <div className="event" key={a.id}>{a.text} · {a.author} · {fmtAgo(a.at)}</div>
            )
          ))}
        </div>
      </div>
      <div className="task-compose">
        {pending.length > 0 && (
          <div className="shot-grid sm" style={{ marginBottom: 8 }}>
            {pending.map((s) => (
              <span className="shot" key={s.id}><img src={s.dataUrl} alt="" /></span>
            ))}
          </div>
        )}
        <div className="compose-row">
          <div className="compose-box">
            <textarea
              rows={2}
              placeholder={actor.side === 'client' ? `Note from ${project.client}…` : 'Note from Xeroura…'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
            />
          </div>
          <button className="icon-btn" onClick={() => fileRef.current?.click()} aria-label="Attach screenshot"><LuImagePlus size={16} /></button>
          <button className="send-btn" onClick={send} disabled={!draft.trim() && !pending.length} aria-label="Send"><LuSend /></button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={attach} />
      </div>
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)} role="dialog">
          <img src={lightbox.dataUrl} alt={lightbox.name} />
          <span className="muted">{lightbox.name}{lightbox.by ? ` · ${lightbox.by}` : ''}{lightbox.at ? ` · ${fmtDay(lightbox.at)}` : ''}</span>
        </div>
      )}
    </Drawer>
  );
}
