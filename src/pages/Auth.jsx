import { useLayoutEffect, useRef, useState } from 'react';
import { LuEye, LuEyeOff, LuArrowRight, LuCheck } from 'react-icons/lu';
import { animate, EASE_OUT } from '../motion.js';
import { findLogin, loadCatalog, projectsFor } from '../data.js';
import AuthStage from './AuthStage.jsx';
import { Logo } from '../Logo.jsx';
import './auth.css';

function applySavedTheme() {
  let t = 'system';
  try { t = localStorage.getItem('xdash.theme') || 'light'; } catch { /* */ }
  const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

function Field({ label, children }) {
  return (
    <label className="au-field">
      <span className="au-label">{label}</span>
      {children}
    </label>
  );
}

function Password({ value, onChange, autoComplete, invalid }) {
  const [show, setShow] = useState(false);
  return (
    <div className="au-pw">
      <input className={`au-input ${invalid ? 'invalid' : ''}`} type={show ? 'text' : 'password'} value={value} onChange={onChange}
        autoComplete={autoComplete} required />
      <button type="button" className={`au-eye ${show ? 'on' : ''}`} onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} tabIndex={-1}>
        <LuEye className="i-show" /><LuEyeOff className="i-hide" />
      </button>
    </div>
  );
}

export default function Auth({ onEnter }) {
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [state, setState] = useState('idle');
  const root = useRef(null);
  const form = useRef(null);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); if (err) setErr(''); };

  useLayoutEffect(() => { applySavedTheme(); document.title = 'Xeroura'; }, []);

  useLayoutEffect(() => {
    const els = root.current.querySelectorAll('.au-brand, .au-head > *, .au-swap > *, .au-actions > *, .au-foot');
    els.forEach((el, i) => animate(el, [
      { opacity: 0, transform: 'translateY(10px)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'none', filter: 'blur(0)' },
    ], { duration: 700, delay: 80 + i * 45, easing: EASE_OUT }));
    animate(root.current.querySelector('.au-right'), [
      { opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' },
    ], { duration: 900, delay: 120, easing: EASE_OUT });
  }, []);

  const shake = () => {
    animate(form.current, [
      { transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' },
      { transform: 'translateX(-3px)' }, { transform: 'translateX(1px)' }, { transform: 'translateX(0)' },
    ], { duration: 380, easing: 'ease-out' });
  };

  const enter = async (session) => {
    setState('busy'); setErr('');
    await new Promise((r) => setTimeout(r, 520));
    setState('done');
    await new Promise((r) => setTimeout(r, 420));
    const out = animate(root.current, [{ opacity: 1, transform: 'none', filter: 'blur(0)' }, { opacity: 0, transform: 'scale(.985)', filter: 'blur(4px)' }], { duration: 320, easing: 'ease-in', fill: 'forwards' });
    if (out) await out.finished.catch(() => {});
    onEnter(session);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (state !== 'idle') return;
    const catalog = loadCatalog();
    const hit = findLogin(f.email, catalog);
    if (!hit) {
      setErr('No login for that email.');
      shake();
      return;
    }
    const pass = hit.person.password || 'demo';
    if (f.password !== pass) {
      setErr('Wrong email or password.');
      shake();
      return;
    }
    const accessible = projectsFor(hit.person.email, catalog);
    await enter({ email: hit.person.email, projectId: accessible[0]?.id || hit.project.id });
  };

  const label = state === 'busy' ? 'Opening project' : 'Sign in';

  return (
    <div className="au" ref={root}>
      <section className="au-left">
        <div className="au-brand">
          <div className="brand-mark"><Logo /></div>
          <span>Xeroura</span>
        </div>

        <form className="au-form" ref={form} onSubmit={submit}>
          <div className="au-head">
            <h1>Sign in to Xeroura</h1>
            <p>Open the project we’re building with you.</p>
          </div>

          <div className="au-swap">
            <Field label="Email">
              <input className={`au-input ${err ? 'invalid' : ''}`} type="email" value={f.email} onChange={set('email')} autoComplete="username" placeholder="you@company.com" autoFocus required />
            </Field>
            <Field label="Password">
              <Password value={f.password} onChange={set('password')} autoComplete="current-password" invalid={!!err} />
            </Field>
          </div>

          <div className={`au-err ${err ? 'on' : ''}`} role="alert" aria-live="polite"><div><span>{err}</span></div></div>

          <div className="au-actions">
            <button className={`au-btn primary ${state}`} type="submit" disabled={state !== 'idle'}>
              <span className="au-btn-label">{label}</span>
              <span className="au-btn-icon">
                {state === 'busy' ? <span className="au-spin" /> : state === 'done' ? <LuCheck /> : <LuArrowRight />}
              </span>
            </button>
          </div>
        </form>

        <footer className="au-foot">
          <span>© {new Date().getFullYear()} Xeroura</span>
        </footer>
      </section>

      <aside className="au-right">
        <AuthStage />
      </aside>
    </div>
  );
}
