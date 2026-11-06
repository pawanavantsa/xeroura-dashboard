import { useState } from 'react';
import { LuCheck } from 'react-icons/lu';
import { AsyncBtn, Seg, useApp } from '../ui.jsx';
import { approveTask } from '../store.js';
import { fmtDay } from '../lib/time.js';
import TaskDrawer from './TaskDrawer.jsx';

export default function Decisions() {
  const { tasks, setTasks, actor, toast, navigate, route, project } = useApp();
  const [f, setF] = useState('open');
  const open = tasks.filter((t) => t.need === 'client' && t.status !== 'done');
  const done = tasks.filter((t) => t.need == null && (t.comments || []).some((c) => c.text === 'Approved.'));
  const unique = f === 'open' ? open : f === 'done' ? done : [...open, ...done];

  const approve = async (id) => {
    await new Promise((r) => setTimeout(r, 350));
    setTasks((list) => approveTask(list, id, actor));
    toast('Noted.');
  };

  const openId = route.page === 'decisions' ? route.id : null;
  const drawer = openId && tasks.find((t) => t.id === openId);

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="eyebrow">{project.name}</div>
          <h1>Decisions</h1>
        </div>
        <div className="head-actions">
          <Seg
            value={f}
            onChange={setF}
            options={[
              { value: 'open', label: 'Open', n: open.length },
              { value: 'done', label: 'Done' },
              { value: 'all', label: 'All' },
            ]}
          />
        </div>
      </div>
      <div className="card table-wrap">
        <table className="t">
          <thead>
            <tr>
              <th>Item</th>
              <th>Due</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {unique.map((d) => (
              <tr key={d.id} onClick={() => navigate(`progress/${d.id}`)}>
                <td>
                  <div className="person">
                    <div>
                      <b>{d.title}</b>
                      <span>{d.body}</span>
                    </div>
                  </div>
                </td>
                <td className="muted" style={{ whiteSpace: 'nowrap' }}>{d.need ? (d.due ? fmtDay(d.due) : '—') : 'Done'}</td>
                <td style={{ textAlign: 'right', width: 1 }} onClick={(e) => e.stopPropagation()}>
                  {d.need === 'client' && (
                    <AsyncBtn variant="primary" size="sm" icon={LuCheck} doneLabel="Done" onClick={() => approve(d.id)}>
                      Approve
                    </AsyncBtn>
                  )}
                </td>
              </tr>
            ))}
            {!unique.length && (
              <tr style={{ cursor: 'default' }}><td colSpan={3} className="muted" style={{ padding: 24 }}>Nothing here.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {drawer && <TaskDrawer task={drawer} onClose={() => navigate('decisions')} />}
    </div>
  );
}
