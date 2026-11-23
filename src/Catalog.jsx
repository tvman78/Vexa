import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from './context.js';
import { BRANDS } from './data/brands.js';
import { modelsOfBrand } from './data/models.js';
import PHOTOS from './data/photos.json';
import { partsFor, problemsFor } from './data/care.js';
import { motoParts, motoProblems } from './data/extra.js';
import { countryName } from './i18n.js';

const PAGE = 48;
const TIERS = ['economy', 'mid', 'premium', 'exotic', 'other'];
const TIER_BRANDS = {
  economy: ['bajaj', 'hero', 'hero honda', 'tvs', 'kymco', 'sym', 'lifan', 'zongshen', 'loncin', 'mondial', 'kuba', 'rks', 'minsk', 'planeta', 'izh', 'simson', 'mz', 'daelim', 'hyosung', 'royal enfield', 'jawa', 'cz', 'piaggio', 'vespa', 'peugeot', 'dnepr', 'voskhod'],
  mid: ['honda', 'yamaha', 'suzuki', 'kawasaki', 'cfmoto', 'benelli', 'gilera', 'cagiva', 'ural', 'beta', 'sherco', 'gasgas', 'derbi', 'laverda', 'bsa', 'matchless', 'ajs'],
  premium: ['bmw', 'ducati', 'triumph', 'harley-davidson', 'indian', 'moto guzzi', 'ktm', 'aprilia', 'norton', 'husqvarna', 'buell', 'victory'],
  exotic: ['mv agusta', 'bimota', 'vyrus', 'confederate', 'brough superior', 'vincent', 'ecosse', 'morbidelli', 'egli', 'munch', 'tamburini'],
};

let catalogPromise = null;
export function useCatalog() {
  const [catalog, setCatalog] = useState(null);
  useEffect(() => {
    let live = true;
    catalogPromise ||= import('./data/catalog.json').then((m) => m.default);
    catalogPromise.then((data) => { if (live) setCatalog(data); });
    return () => { live = false; };
  }, []);
  return catalog;
}

const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export const commonsThumb = (file, width) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
const tierOf = (name) => TIERS.find((tier) => TIER_BRANDS[tier]?.includes(fold(name))) || 'other';
const yearLabel = (row, t) => (row[3] ? `${row[3]}${row[4] ? ` – ${row[4]}` : ''}` : t.unknownYear);

export function Monogram({ name, large }) {
  const hue = [...name].reduce((sum, c) => sum + c.charCodeAt(0) * 7, 0) % 360;
  const letters = name.replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return <span className={`mono ${large ? 'large' : ''}`} style={{ '--h': hue }}>{letters}</span>;
}

function rowsOf(part, name) {
  const index = part.brands.findIndex((b) => fold(b[0]) === fold(name));
  if (index < 0) return [];
  return part.rows.filter((r) => r[2] === index).sort((a, b) => (a[3] || 9999) - (b[3] || 9999) || a[1].localeCompare(b[1]));
}

function coverFor(part, name) {
  const row = rowsOf(part, name).find((r) => r[5]);
  return row ? commonsThumb(row[5], 500) : null;
}

function BrandTile({ name, country, founded, count, cover, onOpen }) {
  const { t, lang, n } = useI18n();
  const [failed, setFailed] = useState(false);
  return (
    <button className="brand-card" onClick={onOpen}>
      <span className="brand-cover">{cover && !failed ? <img src={cover} alt={name} loading="lazy" onError={() => setFailed(true)} /> : <Monogram name={name} large />}</span>
      <span className="brand-info">
        <Monogram name={name} />
        <span><b>{name}</b><small>{[country && countryName(country, lang), founded].filter(Boolean).join(' · ')}</small><small>{n(count)} {t.models}</small></span>
      </span>
    </button>
  );
}

function usePaged(deps) {
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), deps); // eslint-disable-line react-hooks/exhaustive-deps
  return [limit, () => setLimit((v) => v + PAGE)];
}

export function Brands({ openBrand, openCatalogBrand }) {
  const { t, lang } = useI18n();
  const catalog = useCatalog();
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const all = useMemo(() => {
    if (!catalog) return [];
    const curated = BRANDS.map((b) => {
      const inCatalog = rowsOf(catalog.car, b.name);
      const photo = modelsOfBrand(b.id).map((m) => PHOTOS[`${m.brand}|${m.name}`]?.[0]).find(Boolean);
      return { key: b.id, id: b.id, name: b.name, country: b.country, founded: b.founded, count: modelsOfBrand(b.id).length + inCatalog.length, cover: photo ? `./cars/${photo.file}` : coverFor(catalog.car, b.name) };
    });
    const known = new Set(curated.map((b) => fold(b.name)));
    const extra = catalog.car.brands.filter((b) => !known.has(fold(b[0]))).map((b) => ({ key: b[0], name: b[0], country: b[1], count: b[2], cover: coverFor(catalog.car, b[0]) }));
    return [...curated, ...extra].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  }, [catalog]);
  const codes = useMemo(() => [...new Set(all.map((b) => b.country).filter(Boolean))].sort((a, b) => countryName(a, lang).localeCompare(countryName(b, lang), lang)), [all, lang]);
  const needle = fold(q);
  const list = all.filter((b) => fold(b.name).includes(needle) && (!country || b.country === country));
  const [limit, more] = usePaged([q, country]);
  return (
    <div className="page">
      <h1>{t.brands}</h1>
      <div className="filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} />
        <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label={t.country}>
          <option value="">{t.allCountries}</option>
          {codes.map((c) => <option key={c} value={c}>{countryName(c, lang)}</option>)}
        </select>
      </div>
      {list.length ? <div className="brand-grid">{list.slice(0, limit).map((b) => <BrandTile key={b.key} {...b} onOpen={() => (b.id ? openBrand(b.id) : openCatalogBrand('car', b.name))} />)}</div> : catalog && <p className="empty">{t.noResults}</p>}
      {list.length > limit && <button className="more" onClick={more}>{t.loadMore}</button>}
    </div>
  );
}

export function ModelList({ kind, brandName, openModel }) {
  const { t } = useI18n();
  const catalog = useCatalog();
  const [era, setEra] = useState('');
  const rows = useMemo(() => (catalog ? rowsOf(catalog[kind], brandName) : []), [catalog, kind, brandName]);
  const eras = useMemo(() => [...new Set(rows.filter((r) => r[3]).map((r) => Math.floor(r[3] / 10) * 10))].sort((a, b) => a - b), [rows]);
  const list = era === '' ? rows : rows.filter((r) => r[3] && Math.floor(r[3] / 10) * 10 === era);
  const [limit, more] = usePaged([era, brandName, kind]);
  if (!rows.length) return null;
  return (
    <section>
      <h2>{t.allEras} ({rows.length})</h2>
      {eras.length > 1 && <div className="pills">
        <button className={era === '' ? 'on' : ''} onClick={() => setEra('')}>{t.allEras}</button>
        {eras.map((d) => <button key={d} className={era === d ? 'on' : ''} onClick={() => setEra(d)}>{d}s</button>)}
      </div>}
      <div className="model-grid">
        {list.slice(0, limit).map((row) => <ModelTile key={row[0]} row={row} onOpen={() => openModel(kind, row[0])} />)}
      </div>
      {list.length > limit && <button className="more" onClick={more}>{t.loadMore}</button>}
    </section>
  );
}

function ModelTile({ row, onOpen }) {
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);
  return (
    <button className="model-card" onClick={onOpen}>
      <span className="model-photo">{row[5] && !failed ? <img src={commonsThumb(row[5], 330)} alt={row[1]} loading="lazy" onError={() => setFailed(true)} /> : <span className="no-photo">{t.noPhoto}</span>}</span>
      <b><bdi>{row[1]}</bdi></b>
      <small><bdi>{yearLabel(row, t)}</bdi></small>
    </button>
  );
}

export function CatalogBrand({ kind, name, back, openModel }) {
  const { t, lang } = useI18n();
  const catalog = useCatalog();
  const brand = catalog?.[kind].brands.find((b) => fold(b[0]) === fold(name));
  return (
    <div className="page">
      <button className="ghost" onClick={back}><span className="flip">←</span> {t.back}</button>
      <section className="brand-head">
        <Monogram name={name} large />
        <div><h1>{name}</h1><p className="muted">{[brand?.[1] && countryName(brand[1], lang), kind === 'moto' && t[`tier_${tierOf(name)}`]].filter(Boolean).join(' · ')}</p></div>
      </section>
      <ModelList kind={kind} brandName={name} openModel={openModel} />
    </div>
  );
}

export function Motorcycles({ openCatalogBrand }) {
  const { t } = useI18n();
  const catalog = useCatalog();
  const [q, setQ] = useState('');
  const [tier, setTier] = useState('');
  const all = useMemo(() => (catalog ? catalog.moto.brands.map((b) => ({ key: b[0], name: b[0], country: b[1], count: b[2], tier: tierOf(b[0]), cover: coverFor(catalog.moto, b[0]) })).sort((a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) || b.count - a.count) : []), [catalog]);
  const needle = fold(q);
  const list = all.filter((b) => fold(b.name).includes(needle) && (!tier || b.tier === tier));
  const [limit, more] = usePaged([q, tier]);
  return (
    <div className="page">
      <h1>{t.motorcycles}</h1>
      <div className="filters"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} /></div>
      <div className="pills">
        <button className={!tier ? 'on' : ''} onClick={() => setTier('')}>{t.tier_all}</button>
        {TIERS.map((x) => <button key={x} className={tier === x ? 'on' : ''} onClick={() => setTier(x)}>{t[`tier_${x}`]}</button>)}
      </div>
      {list.length ? <div className="brand-grid">{list.slice(0, limit).map((b) => <BrandTile key={b.key} {...b} onOpen={() => openCatalogBrand('moto', b.name)} />)}</div> : catalog && <p className="empty">{t.noResults}</p>}
      {list.length > limit && <button className="more" onClick={more}>{t.loadMore}</button>}
    </div>
  );
}

export function CatalogDetail({ kind, id, back }) {
  const { t, lang } = useI18n();
  const catalog = useCatalog();
  const [tab, setTab] = useState('overview');
  const [failed, setFailed] = useState(false);
  const row = catalog?.[kind].rows.find((r) => r[0] === id);
  if (!row) return <div className="page"><button className="ghost" onClick={back}><span className="flip">←</span> {t.back}</button></div>;
  const brand = catalog[kind].brands[row[2]];
  const pseudo = { asp: '', engine: 'I4', years: String(row[3] || 2000), fuel: '', gearType: '', drive: '', screen: 0, cat: row[3] && row[3] < 1990 ? 'classic' : '' };
  const problems = kind === 'moto' ? motoProblems(lang) : problemsFor(pseudo, lang);
  const parts = kind === 'moto' ? motoParts(lang) : partsFor(pseudo, lang);
  const facts = [[t.brands, brand[0]], [t.production, yearLabel(row, t)], ...(brand[1] ? [[t.country, countryName(brand[1], lang)]] : []), ...(kind === 'moto' ? [[t.category, t[`tier_${tierOf(brand[0])}`]]] : [])];
  return (
    <div className="page detail">
      <header className="detail-head">
        <button className="ghost" onClick={back}><span className="flip">←</span> {t.back}</button>
        <div className="detail-title"><Monogram name={brand[0]} /><div><small>{brand[0]}</small><h1><bdi>{row[1]}</bdi></h1></div></div>
      </header>
      <section className="gallery">
        <div className="gallery-main">{row[5] && !failed ? <img src={commonsThumb(row[5], 960)} alt={`${brand[0]} ${row[1]}`} onError={() => setFailed(true)} /> : <span className="no-photo">{t.noPhoto}</span>}</div>
        {row[5] && <a className="credit" href={`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(row[5])}`} target="_blank" rel="noreferrer">{t.photoBy}: Wikimedia Commons</a>}
      </section>
      <div className="tabs">{['overview', 'problems', 'parts'].map((k) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t[`tab_${k}`]}</button>)}</div>
      {tab === 'overview' && <>
        <dl className="spec-grid">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd><bdi>{v}</bdi></dd></div>)}</dl>
        <a className="ghost source" href={`https://www.wikidata.org/wiki/${row[0]}`} target="_blank" rel="noreferrer">{t.openWiki}</a>
      </>}
      {tab === 'problems' && <div className="problem-list">
        <p className="note">{kind === 'moto' ? t.motoNote : t.genericNote}</p>
        {problems.map((p) => <article className="problem" key={p.id}><header><h3>{p.title}</h3><span className={`sev ${p.severity}`}>{t[`sev_${p.severity}`]}</span></header><p><b>{t.symptoms}:</b> {p.symptoms}</p><p><b>{t.solution}:</b> {p.solution}</p></article>)}
      </div>}
      {tab === 'parts' && <div>
        <p className="note">{kind === 'moto' ? t.motoNote : t.genericNote}</p>
        <div className="part-groups">{parts.map(({ group, parts: items }) => <section className="part-group" key={group}><h3>{t[`group_${group}`]}</h3><ul>{items.map((x) => <li key={x.id}>{x.name}</li>)}</ul></section>)}</div>
      </div>}
    </div>
  );
}
