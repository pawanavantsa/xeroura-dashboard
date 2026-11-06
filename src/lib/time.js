export const TZ = 'Asia/Kolkata';

export function fmtTime(d, tz = TZ) {
  return new Date(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: tz });
}

export function fmtLongDay(d, tz = TZ) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', timeZone: tz });
}

export function greeting(d, tz = TZ) {
  const h = Number(new Date(d).toLocaleString('en-GB', { hour: 'numeric', hour12: false, timeZone: tz }));
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function fmtDay(d, tz = TZ) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: tz });
}

export function fmtDayYear(d, tz = TZ) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: tz });
}

export function fmtAgo(d) {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 14) return `${days}d ago`;
  return fmtDay(d);
}
