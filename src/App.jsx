import React, { useEffect, useMemo, useRef, useState } from 'react';
import { I18n, useI18n } from './context.js';
import { Brands, CatalogBrand, CatalogDetail, ModelList, Monogram, Motorcycles, useCatalog } from './Catalog.jsx';
import { Help, UpdatePanel } from './Help.jsx';
import { NavIcon } from './icons.jsx';
import { APP_VERSION } from './update.js';
import { BRANDS, brandById } from './data/brands.js';
import { MODELS, modelById, modelsOfBrand } from './data/models.js';
import { DICTS, LANGUAGES, countryName, detectLanguage } from './i18n.js';
import { partsFor, problemsFor } from './data/care.js';
import PHOTOS from './data/photos.json';
import logoUrl from '../build/icon.svg';

const CATS = ['sport', 'classic', 'economy', 'luxury', 'suv'];
const BODIES = ['sedan', 'hatch', 'coupe', 'wagon', 'suv', 'convertible', 'pickup', 'supercar'];
const photosOf = (car) => PHOTOS[`${car.brand}|${car.name}`] || [];
const photoSrc = (photo) => `./cars/${photo.file}`;
const NAV = ['home', 'brands', 'cars', 'motorcycles', 'compare', 'favorites', 'help', 'settings'];
const FEATURED = ['M3 Competition (G80)', '911 Carrera S (992)', 'Huracán EVO', 'GT-R (R35)', 'Golf GTI (Mk8)', 'F40'];

const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };

function specs(car, t, n) {
  const yes = (v, unit) => `${n(v)} ${unit}`;
  const gear = car.gearType === 'CVT' ? t.gb_CVT : `${car.gears} ${t.speeds} ${t[`gb_${car.gearType}`]}`;
  return {
    engine: [[t.engine, car.engine], [t.displacement, yes(car.cc, 'cc')], [t.cylinders, car.cyl], [t.aspiration, t[`asp_${car.asp}`]], [t.fuel, t[`fuel_${car.fuel}`]], [t.power, yes(car.hp, 'hp')], [t.torque, yes(car.nm, 'Nm')], [t.specificPower, yes(Math.round(car.hp / (car.cc / 1000)), 'hp/L')]],
    perf: [[t.accel, `${n(car.acc)} s`], [t.topSpeed, yes(car.top, 'km/h')], [t.powerWeight, yes(Math.round(car.hp / (car.kg / 1000)), 'hp/t')], [t.consumption, yes(car.cons, 'L/100 km')], [t.drive, t[`drive_${car.drive}`]], [t.gearbox, gear]],
    dims: [[t.length, yes(car.len, 'mm')], [t.width, yes(car.wid, 'mm')], [t.height, yes(car.hei, 'mm')], [t.wheelbase, yes(car.wb, 'mm')], [t.weight, yes(car.kg, 'kg')], [t.trunk, yes(car.trunk, 'L')]],
    interior: [[t.seats, car.seats], [t.screen, car.screen ? `${n(car.screen)}″` : t.noScreen], [t.cluster, t[`cl_${car.cluster}`]], [t.trunk, yes(car.trunk, 'L')]],
    exterior: [[t.bodyType, t[`body_${car.body}`]], [t.category, t[`cat_${car.cat}`]], [t.length, yes(car.len, 'mm')], [t.width, yes(car.wid, 'mm')], [t.height, yes(car.hei, 'mm')]],
  };
}

const years = (car, t) => (car.years.endsWith('-') ? `${car.years.slice(0, -1)} – ${t.present}` : car.years.replace('-', ' – '));

function CarCard({ car, open, fav, toggleFav }) {
  const { t, n } = useI18n();
  const brand = brandById[car.brand];
  const cover = photosOf(car)[0];
  return (
    <article className="car-card" onClick={() => open(car.id)}>
      <div className="card-photo">
        {cover ? <img src={photoSrc(cover)} alt={`${brand.name} ${car.name}`} loading="lazy" /> : <span className="no-photo">{t.noPhoto}</span>}
        <span className={`chip ${car.fuel}`}>{t[`fuel_${car.fuel}`]}</span>
        <button className={`heart ${fav ? 'on' : ''}`} aria-label={fav ? t.removeFav : t.addFav} title={fav ? t.removeFav : t.addFav} onClick={(e) => { e.stopPropagation(); toggleFav(car.id); }}>♥</button>
      </div>
      <div className="card-body">
        <small>{brand.name}</small>
        <h3><bdi>{car.name}</bdi></h3>
        <p className="muted">{t[`body_${car.body}`]} · <bdi>{years(car, t)}</bdi></p>
        <div className="mini-stats">
          <span><b>{n(car.hp)}</b> hp</span><span><b>{n(car.acc)}</b> s</span><span><b>{n(car.top)}</b> km/h</span>
        </div>
      </div>
    </article>
  );
}

function Gallery({ car }) {
  const { t } = useI18n();
  const brand = brandById[car.brand];
  const photos = photosOf(car);
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [car]);
  if (!photos.length) return <section className="gallery"><div className="gallery-main"><span className="no-photo">{t.noPhoto}</span></div></section>;
  const photo = photos[Math.min(index, photos.length - 1)];
  const step = (delta) => setIndex((i) => (i + delta + photos.length) % photos.length);
  return (
    <section className="gallery">
      <div className="gallery-main">
        <img src={photoSrc(photo)} alt={`${brand.name} ${car.name}`} />
        <span className="photo-kind">{t[`photo_${photo.kind}`]}</span>
        {photos.length > 1 && <>
          <button className="nav prev" aria-label={t.back} onClick={() => step(-1)}><span className="flip">‹</span></button>
          <button className="nav next" aria-label={t.photoBy} onClick={() => step(1)}><span className="flip">›</span></button>
        </>}
      </div>
      {photos.length > 1 && <div className="thumbs">{photos.map((p, i) => (
        <button key={p.file} className={i === index ? 'on' : ''} aria-label={`${t.photoBy} ${i + 1}`} onClick={() => setIndex(i)}><img src={photoSrc(p)} alt="" loading="lazy" /></button>
      ))}</div>}
      <a className="credit" href={photo.url} target="_blank" rel="noreferrer">{t.photoBy}: <bdi>{photo.author}</bdi> · <bdi>{photo.license}</bdi> · Wikimedia Commons</a>
    </section>
  );
}

function SpecGrid({ rows }) {
  return <dl className="spec-grid">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd><bdi>{v}</bdi></dd></div>)}</dl>;
}

function Problems({ car }) {
  const { t, lang } = useI18n();
  return (
    <div className="problem-list">
      <p className="note">{t.problemsNote}</p>
      {problemsFor(car, lang).map((p) => (
        <article className="problem" key={p.id}>
          <header><h3>{p.title}</h3><span className={`sev ${p.severity}`}>{t[`sev_${p.severity}`]}</span></header>
          <p><b>{t.symptoms}:</b> {p.symptoms}</p>
          <p><b>{t.solution}:</b> {p.solution}</p>
        </article>
      ))}
    </div>
  );
}

function Parts({ car }) {
  const { t, lang } = useI18n();
  return (
    <div>
      <p className="note">{t.partsNote}</p>
      <div className="part-groups">
        {partsFor(car, lang).map(({ group, parts }) => (
          <section className="part-group" key={group}>
            <h3>{t[`group_${group}`]}</h3>
            <ul>{parts.map((part) => <li key={part.id}>{part.name}</li>)}</ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function CarDetail({ car, back, fav, toggleFav }) {
  const { t, n, lang } = useI18n();
  const [tab, setTab] = useState('overview');
  const brand = brandById[car.brand];
  const s = useMemo(() => specs(car, t, n), [car, t, n]);
  const overview = [[t.production, years(car, t)], [t.country, countryName(brand.country, lang)], [t.category, t[`cat_${car.cat}`]], [t.bodyType, t[`body_${car.body}`]], s.engine[0], s.engine[5], s.engine[6], s.perf[0], s.perf[1], s.perf[4], s.perf[5], s.engine[4]];
  const tabs = { overview, engine: s.engine, perf: s.perf, dims: s.dims, interior: s.interior, exterior: s.exterior, problems: null, parts: null };
  return (
    <div className="page detail">
      <header className="detail-head">
        <button className="ghost" onClick={back}><span className="flip">←</span> {t.back}</button>
        <div className="detail-title"><Monogram name={brand.name} /><div><small>{brand.name}</small><h1><bdi>{car.name}</bdi></h1></div></div>
        <button className={`ghost fav ${fav ? 'on' : ''}`} onClick={() => toggleFav(car.id)}>♥ {fav ? t.removeFav : t.addFav}</button>
      </header>
      <Gallery car={car} />
      <div className="tabs">{Object.keys(tabs).map((k) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t[`tab_${k}`]}</button>)}</div>
      {tab === 'problems' ? <Problems car={car} /> : tab === 'parts' ? <Parts car={car} /> : <><SpecGrid rows={tabs[tab]} /><p className="note">{t.dataNote}</p></>}
    </div>
  );
}

function Home({ go, open, favs, toggleFav }) {
  const { t, n } = useI18n();
  const catalog = useCatalog();
  const countries = new Set([...BRANDS.map((b) => b.country), ...(catalog ? [...catalog.car.brands, ...catalog.moto.brands].map((b) => b[1]).filter(Boolean) : [])]).size;
  const brandTotal = new Set([...BRANDS.map((b) => b.name.toLowerCase()), ...(catalog ? [...catalog.car.brands, ...catalog.moto.brands].map((b) => b[0].toLowerCase()) : [])]).size;
  const modelTotal = MODELS.length + (catalog ? catalog.car.rows.length + catalog.moto.rows.length : 0);
  const featured = FEATURED.map((name) => MODELS.find((m) => m.name === name)).filter(Boolean);
  return (
    <div className="page">
      <section className="hero">
        <div>
          <img src={logoUrl} alt="Vexa" className="hero-logo" />
          <h1>{t.tagline}</h1>
          <p>{t.heroText}</p>
          <button className="primary" onClick={() => go('cars')}>{t.explore} <span className="flip">→</span></button>
        </div>
        <div className="hero-stats">
          <div><b>{n(brandTotal)}</b><span>{t.statBrands}</span></div>
          <div><b>{n(modelTotal)}</b><span>{t.statModels}</span></div>
          <div><b>{n(countries)}</b><span>{t.statCountries}</span></div>
        </div>
      </section>
      <h2>{t.featured}</h2>
      <div className="car-grid">{featured.map((c) => <CarCard key={c.id} car={c} open={open} fav={favs.includes(c.id)} toggleFav={toggleFav} />)}</div>
    </div>
  );
}

function BrandPage({ brand, back, open, favs, toggleFav, openModel }) {
  const { t, lang } = useI18n();
  const cars = modelsOfBrand(brand.id);
  return (
    <div className="page">
      <button className="ghost" onClick={back}><span className="flip">←</span> {t.back}</button>
      <section className="brand-head">
        <Monogram name={brand.name} large />
        <div><h1>{brand.name}</h1><p className="muted">{countryName(brand.country, lang)} · {t.founded} {brand.founded} · {brand.active ? t.active : t.defunct}</p></div>
      </section>
      {cars.length > 0 && <div className="car-grid">{cars.map((c) => <CarCard key={c.id} car={c} open={open} fav={favs.includes(c.id)} toggleFav={toggleFav} />)}</div>}
      <ModelList kind="car" brandName={brand.name} openModel={openModel} />
    </div>
  );
}

function Cars({ open, favs, toggleFav }) {
  const { t, lang } = useI18n();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [fuel, setFuel] = useState('');
  const [body, setBody] = useState('');
  const needle = q.toLocaleLowerCase(lang);
  const list = MODELS.filter((m) => `${brandById[m.brand].name} ${m.name}`.toLocaleLowerCase(lang).includes(needle) && (!cat || m.cat === cat) && (!fuel || m.fuel === fuel) && (!body || m.body === body));
  return (
    <div className="page">
      <h1>{t.cars}</h1>
      <div className="filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} />
        <select value={fuel} onChange={(e) => setFuel(e.target.value)} aria-label={t.fuel}><option value="">{t.fuel}: {t.all}</option><option value="p">{t.fuel_p}</option><option value="d">{t.fuel_d}</option></select>
        <select value={body} onChange={(e) => setBody(e.target.value)} aria-label={t.bodyType}><option value="">{t.bodyType}: {t.all}</option>{BODIES.map((b) => <option key={b} value={b}>{t[`body_${b}`]}</option>)}</select>
      </div>
      <div className="pills">
        <button className={!cat ? 'on' : ''} onClick={() => setCat('')}>{t.all}</button>
        {CATS.map((c) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{t[`cat_${c}`]}</button>)}
      </div>
      {list.length ? <div className="car-grid">{list.map((c) => <CarCard key={c.id} car={c} open={open} fav={favs.includes(c.id)} toggleFav={toggleFav} />)}</div> : <p className="empty">{t.noResults}</p>}
    </div>
  );
}

function Compare() {
  const { t, n } = useI18n();
  const [a, setA] = useState(MODELS.find((m) => m.name.startsWith('M3'))?.id);
  const [b, setB] = useState(MODELS.find((m) => m.name.startsWith('911 Carrera'))?.id);
  const cars = [modelById[a], modelById[b]];
  const rows = [[t.power, 'hp', 'hp', 1], [t.torque, 'nm', 'Nm', 1], [t.accel, 'acc', 's', -1], [t.topSpeed, 'top', 'km/h', 1], [t.weight, 'kg', 'kg', -1], [t.consumption, 'cons', 'L/100 km', -1], [t.displacement, 'cc', 'cc', 0], [t.length, 'len', 'mm', 0], [t.trunk, 'trunk', 'L', 1]];
  return (
    <div className="page">
      <h1>{t.compare}</h1>
      <div className="compare-picks">
        {[[a, setA], [b, setB]].map(([value, set], i) => (
          <select key={i} value={value} onChange={(e) => set(e.target.value)} aria-label={t.pickCar}>
            {MODELS.map((m) => <option key={m.id} value={m.id}>{brandById[m.brand].name} {m.name}</option>)}
          </select>
        ))}
      </div>
      <div className="compare-table">
        {rows.map(([label, key, unit, better]) => {
          const [x, y] = [cars[0][key], cars[1][key]];
          const max = Math.max(x, y) || 1;
          const win = better === 0 || x === y ? -1 : (x > y) === (better > 0) ? 0 : 1;
          return (
            <div className="cmp-row" key={key}>
              <span className={win === 0 ? 'win' : ''}>{n(x)} {unit}<i style={{ width: `${(x / max) * 100}%` }} /></span>
              <b>{label}</b>
              <span className={win === 1 ? 'win' : ''}>{n(y)} {unit}<i style={{ width: `${(y / max) * 100}%` }} /></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Favorites({ open, favs, toggleFav }) {
  const { t } = useI18n();
  const list = favs.map((id) => modelById[id]).filter(Boolean);
  return <div className="page"><h1>{t.favorites}</h1>{list.length ? <div className="car-grid">{list.map((c) => <CarCard key={c.id} car={c} open={open} fav toggleFav={toggleFav} />)}</div> : <p className="empty">{t.noFavs}</p>}</div>;
}

function Settings({ setLang }) {
  const { t, lang } = useI18n();
  return (
    <div className="page">
      <h1>{t.settings}</h1>
      <h2>{t.language}</h2>
      <p className="muted">{t.languageHint}</p>
      <div className="lang-grid">{LANGUAGES.map(([code, name]) => <button key={code} lang={code} className={lang === code ? 'on' : ''} onClick={() => setLang(code)}>{name}</button>)}</div>
      <h2>{t.updates}</h2>
      <UpdatePanel />
    </div>
  );
}

export default function App() {
  const [lang, setLangState] = useState(detectLanguage);
  const [stack, setStack] = useState([{ view: 'home' }]);
  const [favs, setFavs] = useState(() => read('vexa.favs', []));
  const route = stack[stack.length - 1];
  const main = useRef(null);

  const i18n = useMemo(() => {
    const format = new Intl.NumberFormat(lang);
    return { lang, t: DICTS[lang], n: (v) => format.format(v) };
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem('vexa.lang', lang); } catch {}
  }, [lang]);
  useEffect(() => { main.current?.scrollTo(0, 0); }, [route]);

  const go = (view) => setStack([{ view }]);
  const push = (next) => setStack((s) => [...s, next]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const open = (id) => push({ view: 'car', id });
  const openBrand = (id) => push({ view: 'brand', id });
  const toggleFav = (id) => setFavs((list) => { const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]; write('vexa.favs', next); return next; });
  const openCatalogBrand = (kind, name) => push({ view: 'catbrand', kind, name });
  const openModel = (kind, id) => push({ view: 'model', kind, id });
  const shared = { open, favs, toggleFav };
  const active = stack.find((r) => NAV.includes(r.view))?.view || 'brands';

  return (
    <I18n.Provider value={i18n}>
      <div className="shell">
        <nav className="side">
          <button className="brand" onClick={() => go('home')}><img src={logoUrl} alt="" /><span>Vexa</span></button>
          {NAV.map((key) => <button key={key} className={`nav-item ${active === key ? 'on' : ''}`} aria-current={active === key ? 'page' : undefined} onClick={() => go(key)}><i><NavIcon name={key} /></i><span>{i18n.t[key]}</span></button>)}
          <div className="side-foot"><small>{i18n.t.madeBy}</small><b>Tv Man</b><small>v{APP_VERSION}</small></div>
        </nav>
        <main ref={main}>
          {route.view === 'home' && <Home go={go} {...shared} />}
          {route.view === 'brands' && <Brands openBrand={openBrand} openCatalogBrand={openCatalogBrand} />}
          {route.view === 'brand' && <BrandPage brand={brandById[route.id]} back={back} openModel={openModel} {...shared} />}
          {route.view === 'catbrand' && <CatalogBrand key={route.name} kind={route.kind} name={route.name} back={back} openModel={openModel} />}
          {route.view === 'model' && <CatalogDetail key={route.id} kind={route.kind} id={route.id} back={back} />}
          {route.view === 'motorcycles' && <Motorcycles openCatalogBrand={openCatalogBrand} />}
          {route.view === 'help' && <Help />}
          {route.view === 'cars' && <Cars {...shared} />}
          {route.view === 'car' && <CarDetail car={modelById[route.id]} back={back} fav={favs.includes(route.id)} toggleFav={toggleFav} />}
          {route.view === 'compare' && <Compare />}
          {route.view === 'favorites' && <Favorites {...shared} />}
          {route.view === 'settings' && <Settings setLang={setLangState} />}
        </main>
      </div>
    </I18n.Provider>
  );
}
