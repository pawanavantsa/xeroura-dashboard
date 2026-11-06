import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { animate, exit, SPRING, useSlidingPill } from '../motion.js';
import {
  LuSearch, LuNewspaper, LuFolderKanban, LuClipboardList, LuFileText, LuSettings, LuMessageSquarePlus,
} from 'react-icons/lu';
import { useApp } from '../ui.jsx';

const PAGES = [
  ['Update', 'update', LuNewspaper],
  ['Progress', 'progress', LuFolderKanban],
  ['Decisions', 'decisions', LuClipboardList],
  ['Files', 'files', LuFileText],
  ['Settings', 'settings', LuSettings],
];

export default function CommandPalette({ onClose }) {
  const { navigate, openModal, tasks, files, updates } = useApp();
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const items = useMemo(() => {
    const s = q.toLowerCase();
    const out = [];
    tasks.filter((t) => !s || t.title.toLowerCase().includes(s) || t.id.toLowerCase().includes(s)).forEach((t) => {
      out.push({ key: t.id, icon: <LuFolderKanban />, label: t.title, hint: t.id, run: () => navigate(`progress/${t.id}`) });
    });
    updates.filter((u) => !s || u.headline.toLowerCase().includes(s) || u.week.toLowerCase().includes(s)).forEach((u) => {
      out.push({ key: u.id, icon: <LuNewspaper />, label: u.headline, hint: u.week, run: () => navigate('update') });
    });
    files.filter((f) => !s || f.name.toLowerCase().includes(s)).forEach((f) => {
      out.push({ key: f.id, icon: <LuFileText />, label: f.name, hint: f.kind, run: () => navigate('files') });
    });
    PAGES.filter(([l]) => !s || l.toLowerCase().includes(s)).forEach(([l, p, Ic]) => out.push({ key: p, icon: <Ic />, label: l, hint: 'Go to', run: () => navigate(p) }));
    if (!s || 'note'.includes(s)) out.push({ key: 'note', icon: <LuMessageSquarePlus />, label: 'Note', hint: 'Action', run: () => openModal({ type: 'note' }) });
    return out;
  }, [q, navigate, openModal, tasks, files, updates]);

  const box = useRef(null);
  const list = useRef(null);
  const pill = useSlidingPill(list, '.palette-item.on', [i, items.length]);
  useLayoutEffect(() => {
    animate(box.current, [{ opacity: 0, transform: 'translateY(-10px) scale(.96)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: SPRING.bouncy.duration, easing: SPRING.bouncy.easing });
  }, []);
  const close = async () => { await exit(box.current, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px) scale(.97)' }], 140); onClose(); };
  const go = (it) => { onClose(); it.run(); };
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="palette" role="dialog" aria-label="Search" ref={box}>
        <div className="palette-input">
          <LuSearch size={18} className="faint" />
          <input
            autoFocus
            placeholder="Search tasks, updates, files…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setI(0); }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
              if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(items.length - 1, x + 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
              if (e.key === 'Enter' && items[i]) go(items[i]);
            }}
          />
          <kbd>esc</kbd>
        </div>
        <div className="palette-list" ref={list} style={{ position: 'relative' }}>
          <span className="sub-pill" ref={pill} style={{ borderRadius: 9 }} />
          {items.map((it, k) => (
            <button key={it.key} type="button" style={{ position: 'relative', zIndex: 1, animation: `fadeUp .4s var(--ease-out) ${Math.min(k, 10) * 22}ms backwards` }} className={`palette-item ${k === i ? 'on' : ''}`} onMouseEnter={() => setI(k)} onClick={() => go(it)}>
              {it.icon}<span className="ellipsis">{it.label}</span><small>{it.hint}</small>
            </button>
          ))}
          {!items.length && <div className="empty">No results</div>}
        </div>
      </div>
    </div>
  );
}
