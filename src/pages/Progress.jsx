import { useRef, useState } from 'react';
import { LuPlus } from 'react-icons/lu';
import { Avatar, Btn, Chip, Modal, useApp } from '../ui.jsx';
import { useFlip } from '../motion.js';
import { addTask, COLS, moveTask } from '../store.js';
import { PaceMeter } from '../charts.jsx';
import { fmtDay } from '../lib/time.js';
import TaskDrawer from './TaskDrawer.jsx';

export default function Progress() {
  const { tasks, setTasks, actor, toast, navigate, route, pace, project, people, phases, personByName } = useApp();
  const boardRef = useRef(null);
  useFlip(boardRef, tasks);
  const [over, setOver] = useState(null);
  const [creating, setCreating] = useState(false);
  const dragging = useRef(false);
  const dragId = useRef(null);

  const openId = route.page === 'progress' ? route.id : null;
  const open = openId && tasks.find((t) => t.id === openId);

  const drop = (status) => {
    const id = dragId.current;
    dragId.current = null;
    setOver(null);
    if (!id) return;
    setTasks((list) => {
      const cur = list.find((t) => t.id === id);
      if (!cur || cur.status === status) return list;
      return moveTask(list, id, status, actor);
    });
  };

  return (
    <div className="content flush">
      <div className="page-head">
        <div>
          <div className="eyebrow">{project.name} · {project.target}</div>
          <h1>Progress</h1>
        </div>
        <div className="head-actions">
          <Btn variant="dark" icon={LuPlus} onClick={() => setCreating(true)}>New task</Btn>
        </div>
      </div>
      <div className="pace-strip card">
        <PaceMeter pace={pace} />
      </div>
      <div className="board" ref={boardRef}>
        {COLS.map((col) => {
          const rows = tasks.filter((t) => t.status === col.id);
          return (
            <section
              key={col.id}
              className={`board-col ${over === col.id ? 'over' : ''}`}
              data-flip-group={col.id}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOver(col.id); }}
              onDrop={(e) => { e.preventDefault(); drop(col.id); }}
            >
              <div className="board-col-h">
                <b>{col.label}</b>
                <span className="n">{rows.length}</span>
                <span className="muted num" style={{ marginLeft: 'auto' }}>{rows.reduce((a, t) => a + t.points, 0)} pts</span>
              </div>
              <div className="board-col-body">
                {rows.map((t) => {
                  const who = t.assignee ? personByName(t.assignee) : null;
                  return (
                    <button
                      type="button"
                      className={`tcard ${t.need === 'client' ? 'need' : ''}`}
                      key={t.id}
                      data-flip={t.id}
                      draggable
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setOver(col.id); }}
                      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); drop(col.id); }}
                      onDragStart={(e) => { dragging.current = true; dragId.current = t.id; e.dataTransfer.setData('text/plain', t.id); e.dataTransfer.effectAllowed = 'move'; }}
                      onDragEnd={() => { setOver(null); setTimeout(() => { dragging.current = false; dragId.current = null; }, 50); }}
                      onClick={() => { if (!dragging.current) navigate(`progress/${t.id}`); }}
                    >
                      <span className="mono faint">{t.id}</span>
                      <b>{t.title}</b>
                      <div className="tcard-foot">
                        {who ? <Avatar name={who.name} size="xs" tone={who.tone} /> : <span className="muted" style={{ fontSize: 11 }}>–</span>}
                        <Chip className="square" tone="slate">{phases.find((p) => p.id === t.phase)?.name}</Chip>
                        {t.need === 'client' && <Chip className="square" tone="amber">{project.needShort}</Chip>}
                        {t.due && <span className="muted" style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700 }}>{fmtDay(t.due)}</span>}
                        {t.shots?.some((s) => s.dataUrl) && <span className="shot-pip" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      {open && <TaskDrawer task={open} onClose={() => navigate('progress')} />}
      {creating && <NewTask onClose={() => setCreating(false)} onCreate={(partial) => {
        setTasks((list) => addTask(list, partial, actor, project.prefix));
        toast('Opened.');
        setCreating(false);
      }} />}
    </div>
  );
}

function NewTask({ onClose, onCreate }) {
  const { people, phases, project } = useApp();
  const lead = people.find((p) => p.side === 'xeroura') || people[0];
  const [f, setF] = useState({ title: '', body: '', phase: phases[0]?.id || 'build', points: 2, assignee: lead?.name || '', due: '', need: false });
  return (
    <Modal
      title="New task"
      onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!f.title.trim()} onClick={() => onCreate({ ...f, need: f.need ? 'client' : null, due: f.due || null })}>Open</button>
      </>}
    >
      <label className="field"><span>Title</span><input className="input" autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="What needs to happen" /></label>
      <label className="field"><span>Work</span><textarea className="textarea" rows={3} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></label>
      <div className="grid2">
        <label className="field"><span>Phase</span>
          <select className="select" value={f.phase} onChange={(e) => setF({ ...f, phase: e.target.value })}>
            {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="field"><span>Assignee</span>
          <select className="select" value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })}>
            {people.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </label>
        <label className="field"><span>Due</span><input className="input" type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></label>
        <label className="field"><span>Points</span><input className="input" type="number" min="1" max="13" value={f.points} onChange={(e) => setF({ ...f, points: Number(e.target.value) || 2 })} /></label>
      </div>
      <label className="row" style={{ gap: 10 }}>
        <input type="checkbox" className="cb" checked={f.need} onChange={(e) => setF({ ...f, need: e.target.checked })} />
        Waiting on {project.needNoun}
      </label>
    </Modal>
  );
}
