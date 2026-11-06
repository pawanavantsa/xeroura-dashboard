import { useEffect, useRef, useState } from 'react';
import { Bar, Chip, useApp } from './ui.jsx';
import { fmtDay } from './lib/time.js';

function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(520);
  useEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export function PaceMeter({ pace }) {
  const { project } = useApp();
  return (
    <div className="pace-meter">
      <div className="pace-head">
        <div>
          <div className="eyebrow">Delivery · {project.target}</div>
          <b className="pace-days">{pace.daysLeft} days left</b>
        </div>
        <Chip tone={pace.tone} className="square">{pace.label}</Chip>
      </div>
      <div className="pace-row">
        <span>Work</span>
        <Bar value={pace.pct} color="var(--accent)" />
        <em className="num">{Math.round(pace.pct * 100)}%</em>
      </div>
      <div className="pace-row">
        <span>Time</span>
        <Bar value={pace.elapsed} color="var(--slate)" />
        <em className="num">{Math.round(pace.elapsed * 100)}%</em>
      </div>
      <p className="pace-note">
        {pace.done}/{pace.total} pts · {pace.label.toLowerCase()} for {project.target}
      </p>
    </div>
  );
}

export function BurnChart({ series, tz = 'Asia/Kolkata' }) {
  const [ref, w] = useWidth();
  const [hov, setHov] = useState(null);
  const h = 168;
  const pl = 32;
  const pr = 8;
  const pt = 10;
  const pb = 22;
  const max = Math.max(1, ...series.map((p) => Math.max(p.planned, p.actual || 0, p.forecast || 0))) * 1.08;
  const x = (i) => pl + (i * (w - pl - pr)) / Math.max(1, series.length - 1);
  const y = (v) => pt + (1 - v / max) * (h - pt - pb);
  const actualPath = series.reduce((acc, p, i) => {
    if (p.actual == null) return acc;
    return acc ? `${acc} L${x(i)},${y(p.actual)}` : `M${x(i)},${y(p.actual)}`;
  }, '');
  const plannedPath = series.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.planned)}`).join(' ');
  const forecastPath = series.reduce((acc, p, i) => {
    if (p.forecast == null) return acc;
    const prev = series[i - 1];
    const start = !acc && prev?.actual != null ? `M${x(i - 1)},${y(prev.actual)} ` : '';
    return acc ? `${acc} L${x(i)},${y(p.forecast)}` : `${start}M${x(i)},${y(p.forecast)}`;
  }, '');
  const nowI = series.findIndex((p) => p.isNow);
  const ticks = [0, Math.round(max / 2), Math.round(max)];
  return (
    <div ref={ref} className="chart-rel">
      <svg width={w} height={h} role="img" aria-label="Work vs plan">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pl} x2={w - pr} y1={y(t)} y2={y(t)} stroke="var(--border)" />
            <text x={pl - 6} y={y(t) + 3} fontSize="10" textAnchor="end" fill="var(--faint)">{t}</text>
          </g>
        ))}
        {nowI >= 0 && <line x1={x(nowI)} x2={x(nowI)} y1={pt} y2={h - pb} stroke="var(--accent)" strokeDasharray="3 4" />}
        <path d={plannedPath} fill="none" stroke="var(--faint)" strokeWidth="1.5" strokeDasharray="4 4" />
        {forecastPath && <path d={forecastPath} fill="none" stroke="var(--amber)" strokeWidth="2" strokeDasharray="5 4" />}
        {actualPath && <path d={actualPath} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinejoin="round" pathLength="1" className="draw-line" />}
        {series.map((p, i) => (i % 3 === 0 || i === series.length - 1) && (
          <text key={p.t} x={x(i)} y={h - 6} fontSize="10" textAnchor={i === series.length - 1 ? 'end' : 'middle'} fill="var(--faint)">{fmtDay(p.t, tz)}</text>
        ))}
        {hov != null && (
          <>
            <line className="crosshair" x1={x(hov)} x2={x(hov)} y1={pt} y2={h - pb} stroke="var(--border-strong)" />
            <circle cx={x(hov)} cy={y(series[hov].actual ?? series[hov].forecast ?? series[hov].planned)} r="4" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
          </>
        )}
        {series.map((p, i) => (
          <rect key={p.t} x={x(i) - (w - pl) / series.length / 2} y={pt} width={(w - pl) / series.length} height={h - pt - pb} fill="transparent" onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />
        ))}
      </svg>
      {hov != null && (
        <div className="tip" style={{ left: x(hov), top: y(series[hov].actual ?? series[hov].forecast ?? series[hov].planned) }}>
          {fmtDay(series[hov].t, tz)}
          {series[hov].actual != null ? <> · <b>{series[hov].actual}</b> done</> : <> · forecast <b>{Math.round(series[hov].forecast || 0)}</b></>}
          {' · '}plan {Math.round(series[hov].planned)}
        </div>
      )}
    </div>
  );
}

export function PhaseBars({ byPhase }) {
  const max = Math.max(1, ...byPhase.map((p) => p.points));
  return (
    <div className="phase-bars">
      {byPhase.map((p) => (
        <div className="phase-bar" key={p.id}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <b>{p.name}</b>
            <span className="muted num">{p.done}/{p.points}</span>
          </div>
          <div className="phase-bar-track">
            <i className="plan" style={{ width: `${(p.points / max) * 100}%` }} />
            <i className="done" style={{ width: `${(p.done / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
