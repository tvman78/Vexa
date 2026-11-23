import React, { useEffect, useState } from 'react';
import { useI18n } from './context.js';
import { faqFor } from './data/extra.js';
import { APP_VERSION, RELEASES_URL, checkLatest, desktopUpdater } from './update.js';
import logoUrl from '../build/icon.svg';

export function Help() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(0);
  return (
    <div className="page">
      <h1>{t.help}</h1>
      <h2>{t.faq}</h2>
      <div className="faq">
        {faqFor(lang).map((item, i) => (
          <article key={item.q} className={open === i ? 'open' : ''}>
            <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span>{item.q}</span><i>{open === i ? '−' : '+'}</i></button>
            {open === i && <p>{item.a}</p>}
          </article>
        ))}
      </div>
      <h2>{t.about}</h2>
      <section className="about">
        <img src={logoUrl} alt="Vexa" />
        <div><b>Vexa</b><small>v{APP_VERSION}</small><p>{t.madeBy}: <strong>Tv Man</strong></p></div>
      </section>
    </div>
  );
}

export function UpdatePanel() {
  const { t } = useI18n();
  const desktop = desktopUpdater();
  const [state, setState] = useState({ state: 'idle' });
  const [online, setOnline] = useState(null);
  const [useDesktop, setUseDesktop] = useState(false);

  useEffect(() => {
    if (!desktop) return undefined;
    desktop.status().then((s) => { setUseDesktop(!!s.enabled); if (s.enabled) setState(s); }).catch(() => setUseDesktop(false));
    return desktop.onState(setState);
  }, [desktop]);

  const check = async () => {
    if (useDesktop) { await desktop.check(); return; }
    setState({ state: 'checking' });
    try {
      const result = await checkLatest();
      if (result.error) { setState({ state: 'error', error: result.error }); return; }
      setOnline(result);
      setState({ state: result.newer ? 'available' : 'none', version: result.version, notes: result.notes });
    } catch { setState({ state: 'error', error: 'network' }); }
  };

  const busy = state.state === 'checking' || state.state === 'downloading';
  const latest = state.version || online?.version;
  return (
    <section className="update-panel">
      <div className="update-versions">
        <div><small>{t.currentVersion}</small><b>v{APP_VERSION}</b></div>
        {latest && <div><small>{t.latestVersion}</small><b>v{latest}</b></div>}
      </div>
      {state.state === 'none' && <p className="ok">{t.upToDate}</p>}
      {state.state === 'checking' && <p>{t.checking}</p>}
      {state.state === 'available' && <p className="ok">{t.updateAvailable}</p>}
      {state.state === 'downloading' && <div><p>{t.downloadingUpdate} %{state.percent || 0}</p><div className="progress"><i style={{ width: `${state.percent || 0}%` }} /></div></div>}
      {state.state === 'downloaded' && <p className="ok">{t.updateAvailable}</p>}
      {state.state === 'error' && <p className="err">{t[`updErr_${state.error}`] || t.updErr_other}</p>}
      {state.notes && (state.state === 'downloaded' || state.state === 'available') && <div className="whats-new"><b>{t.whatsNew}</b><pre>{state.notes}</pre></div>}
      <div className="update-actions">
        {state.state === 'downloaded' && <button className="primary" onClick={() => desktop.install()}>{t.restartNow}</button>}
        {state.state === 'available' && <a className="primary" href={online?.url || RELEASES_URL} target="_blank" rel="noreferrer">{t.downloadUpdate}</a>}
        {state.state !== 'downloaded' && state.state !== 'available' && <button className="primary" disabled={busy} onClick={check}>{busy ? t.checking : t.checkUpdates}</button>}
      </div>
    </section>
  );
}
