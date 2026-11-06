import { LuCalendar, LuCircleDashed, LuGauge, LuLayers } from 'react-icons/lu';
import { Avatar, Stat, useApp } from '../ui.jsx';
import { fmtDay, fmtLongDay, greeting } from '../lib/time.js';
import { BurnChart, PaceMeter, PhaseBars } from '../charts.jsx';
import { burnSeries } from '../store.js';

export default function Update() {
  const { actor, tz, now, navigate, pace, tasks, project, updates } = useApp();
  const t = now();
  const series = burnSeries(tasks, project, t);
  const waiting = pace.needClient;
  const latest = updates[0];
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="eyebrow">{fmtLongDay(t, tz)} · {project.client}</div>
          <h1>{greeting(t, tz)}, {actor.name.split(' ')[0]}</h1>
        </div>
      </div>
      <div className="stats">
        <Stat icon={LuLayers} label="Done" value={Math.round(pace.pct * 100)} unit="%" />
        <Stat icon={LuCircleDashed} label="Open" value={pace.open.length} />
        <Stat icon={LuCalendar} label="Days left" value={pace.daysLeft} />
        <Stat icon={LuGauge} label="Pace" value={pace.label} />
      </div>
      <div className="dash-grid">
        <section className="card update-letter">
          {latest ? (
            <>
              <div className="eyebrow">{latest.week} · {latest.date}</div>
              <h2>{latest.headline}</h2>
              <p className="lede">{latest.body}</p>
              <div className="update-cols">
                <div>
                  <div className="eyebrow">Shipped</div>
                  <ul className="update-list">
                    {latest.shipped.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="eyebrow">Next</div>
                  <ul className="update-list">
                    {latest.next.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
              </div>
              <div className="update-sign">
                <Avatar name={latest.author} size="sm" tone="teal" />
                <div><b>{latest.author}</b><span className="muted">{latest.role}</span></div>
              </div>
            </>
          ) : (
            <>
              <div className="eyebrow">Update</div>
              <h2>No Friday note yet.</h2>
              <p className="lede">Once work is moving, the weekly letter lands here.</p>
            </>
          )}
        </section>
        <div className="dash-stack">
          <section className="card card-pad">
            <PaceMeter pace={pace} />
          </section>
          <section className="card">
            <div className="card-head"><h2>Needs {project.needNoun}</h2><span className="sub">{waiting.length}</span></div>
            <div className="card-body">
              {waiting.length === 0 && <div className="muted" style={{ padding: '8px 12px' }}>Nothing waiting.</div>}
              {waiting.map((d) => (
                <button className="waiting-row" key={d.id} onClick={() => navigate(`progress/${d.id}`)} type="button">
                  <div className="grow">
                    <b>{d.title}</b>
                    <span>{d.due ? fmtDay(d.due) : d.id}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className="rep-grid" style={{ marginTop: 14 }}>
        <section className="card">
          <div className="card-head">
            <h2>Work vs plan</h2>
            <div className="legend" style={{ marginLeft: 'auto' }}>
              <span><i style={{ background: 'var(--accent)' }} />Done</span>
              <span><i style={{ background: 'var(--faint)' }} />Plan</span>
              <span><i style={{ background: 'var(--amber)' }} />This pace</span>
            </div>
          </div>
          <div className="chart-wrap"><BurnChart series={series} tz={tz} /></div>
        </section>
        <section className="card">
          <div className="card-head"><h2>By phase</h2></div>
          <div className="chart-wrap"><PhaseBars byPhase={pace.byPhase} /></div>
          <div className="card-body">
            {updates.slice(1).map((u) => (
              <div className="feed-item" key={u.id}>
                <div className="grow">
                  <b>{u.headline}</b>
                  <div className="muted">{u.week} · {u.date}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
