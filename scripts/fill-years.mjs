// Fills missing production years in src/data/catalog.json from sources fetch-catalog.mjs does not read:
// Wikidata work-period dates and manufacturer qualifiers, and the opening sentences of non-English Wikipedia articles.
// Only explicit year ranges are accepted. Results are saved to scripts/years-extra.json so patch-catalog.mjs can
// re-apply them after the catalog is rebuilt. Resumable: fetched intros are cached in .tools/cache.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(root, 'src', 'data', 'catalog.json');
const outPath = path.join(root, 'scripts', 'years-extra.json');
const cachePath = path.join(root, '.tools', 'cache', 'intl-intros.json');
const UA = 'VexaDataBuilder/1.0 (open-source vehicle reference app)';
const LANGS = ['de', 'fr', 'it', 'es', 'nl', 'pl', 'cs', 'ru', 'ja', 'tr', 'sv', 'pt'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOW = new Date().getFullYear();

async function sparql(query) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch('https://query.wikidata.org/sparql', { method: 'POST', headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ query }) });
    if (res.ok) { try { return (await res.json()).results.bindings; } catch { /* truncated */ } } else if (res.status !== 429 && res.status < 500) throw new Error(`HTTP ${res.status}`);
    await sleep(Math.min(Number(res.headers.get('retry-after')) * 1000 || 6000 * (attempt + 1), 120000));
  }
  throw new Error('SPARQL failed');
}

async function getJson(url) {
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
      if (res.ok) return await res.json();
      if (res.status !== 429 && res.status < 500) return null;
      await sleep(Math.min(Number(res.headers.get('retry-after')) * 1000 || 4000 * (attempt + 1), 120000));
    } catch { await sleep(4000 * (attempt + 1)); }
  }
  return null;
}

const Y = '(18[89]\\d|19\\d\\d|20[0-2]\\d)';
const DASH = '\\s*(?:-|–|—|bis|à|a|al|tot|do|до|по|till|até)\\s*';
const RANGES = [
  new RegExp(`${Y}${DASH}${Y}`),                                    // 1990–1995, von 1990 bis 1995, de 1990 à 1995, dal 1990 al 1995, od 1990 do 1995
  new RegExp(`${Y}\\s*年?\\s*(?:から|～|〜|-|–)\\s*${Y}\\s*年`),        // 1990年から1995年
  new RegExp(`с\\s+${Y}\\s+(?:по|до)\\s+${Y}`),                      // с 1990 по 1995
];
const valid = (s, e) => s >= 1885 && e >= s && e <= NOW && e - s <= 60;
// Years next to these words are design, racing or concept dates, not production.
const NOT_PRODUCTION = /renn|entwickel|konstruiert|développ|conçu|svilupp|progettat|разработ|спроектир|desarroll|diseñ|ontwikkel|ontworpen|opracow|zaprojekt|vyvinut|navržen|開発|設計|geliştiril|tasarlan|utveckl|desenvolv|rennen|course|corsa|гонк|carrera|race|wyścig|závod|レース|yarış|concept|prototyp|прототип|試作/i;
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// The article must name this exact model: a link can redirect to a general page (Focus ST -> Ford Focus).
function namesModel(text, name, brand) {
  const t = fold(text).replace(/[\s-]+/g, ' ');
  const brandWords = new Set(fold(brand).split(/[\s-]+/));
  const tokens = fold(name).replace(/[()]/g, ' ').split(/[\s-]+/).filter((w) => w && !brandWords.has(w));
  const digits = tokens.map((w) => w.replace(/\D/g, '')).filter(Boolean);
  if (digits.length) return digits.every((d) => new RegExp(`(^|\\D)${d}(\\D|$)`).test(t));
  const last = tokens[tokens.length - 1];
  return !!last && last.length >= 2 && /[a-z]/.test(last) && t.includes(last);
}
function rangeFrom(text) {
  const head = text.split(/(?<=[.。])\s/).slice(0, 2).join(' ');
  const all = RANGES.flatMap((re) => [...head.matchAll(new RegExp(re.source, 'g'))]);
  if (all.length > 2) return null; // several ranges (variants, revivals): too ambiguous
  for (const re of RANGES) {
    const m = head.match(re);
    if (!m || !valid(Number(m[1]), Number(m[2]))) continue;
    const around = head.slice(Math.max(0, m.index - 80), m.index + m[0].length + 30);
    if (NOT_PRODUCTION.test(around)) return null;
    // An earlier year before the range ("since 1996 ... 2013–2018") means the range is one generation of many.
    const earlier = (head.slice(0, m.index).match(/(18[89]\d|19\d\d|20[0-2]\d)/g) || []).map(Number);
    if (earlier.some((y) => y < Number(m[1]))) return null;
    return [Number(m[1]), Number(m[2])];
  }
  return null;
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const missing = [];
for (const kind of ['car', 'moto']) for (const r of catalog[kind].rows) if (!r[3] && /^Q\d+$/.test(r[0])) missing.push(r[0]);
console.log('missing years with a Wikidata id:', missing.length);

const found = {};
// 1) Wikidata: work period (P2031/P2032) and start/end qualifiers on manufacturer or brand statements.
for (let i = 0; i < missing.length; i += 300) {
  const values = missing.slice(i, i + 300).map((q) => `wd:${q}`).join(' ');
  const rows = await sparql(`SELECT ?m (MIN(YEAR(?s)) AS ?start) (MAX(YEAR(?e)) AS ?end) WHERE { VALUES ?m { ${values} }
    { ?m wdt:P2031 ?s . OPTIONAL { ?m wdt:P2032 ?e } } UNION { ?m (p:P176|p:P1716) ?st . ?st pq:P580 ?s . OPTIONAL { ?st pq:P582 ?e } } } GROUP BY ?m`);
  for (const r of rows) {
    const s = Number(r.start?.value), e = Number(r.end?.value) || 0;
    if (s >= 1885 && s <= NOW && (!e || e >= s)) found[r.m.value.split('/').pop()] = [s, e, 'wikidata'];
  }
  await sleep(1500);
}
console.log('from Wikidata qualifiers:', Object.keys(found).length);

// 2) Other-language Wikipedia intros.
const left = missing.filter((q) => !found[q]);
const links = new Map(); // qid -> [[lang, title]]
for (let i = 0; i < left.length; i += 300) {
  const values = left.slice(i, i + 300).map((q) => `wd:${q}`).join(' ');
  const sites = LANGS.map((l) => `<https://${l}.wikipedia.org/>`).join(' ');
  const rows = await sparql(`SELECT ?m ?site ?title WHERE { VALUES ?m { ${values} } VALUES ?site { ${sites} } ?a schema:about ?m ; schema:isPartOf ?site ; schema:name ?title }`);
  for (const r of rows) {
    const q = r.m.value.split('/').pop(), lang = r.site.value.match(/\/\/(\w+)\./)[1];
    if (!links.has(q)) links.set(q, []);
    links.get(q).push([lang, r.title.value]);
  }
  await sleep(1500);
}
console.log('items with other-language articles:', links.size);

fs.mkdirSync(path.dirname(cachePath), { recursive: true });
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
for (const lang of LANGS) {
  const titles = [...new Set([...links.values()].flat().filter(([l]) => l === lang).map(([, t]) => t))].filter((t) => !(`${lang}:${t}` in cache));
  for (let i = 0; i < titles.length; i += 20) {
    const batch = titles.slice(i, i + 20);
    const data = await getJson(`https://${lang}.wikipedia.org/w/api.php?${new URLSearchParams({ format: 'json', formatversion: '2', action: 'query', prop: 'extracts', exintro: '1', explaintext: '1', exlimit: '20', redirects: '1', titles: batch.join('|') })}`);
    if (!data?.query) continue;
    const back = new Map(batch.map((t) => [t, t]));
    for (const list of [data.query.normalized || [], data.query.redirects || []]) for (const { from, to } of list) for (const [orig, now] of back) if (now === from) back.set(orig, to);
    const byTitle = new Map(data.query.pages.map((p) => [p.title, p.extract || '']));
    for (const [orig, now] of back) cache[`${lang}:${orig}`] = (byTitle.get(now) || '').slice(0, 600);
    if (i % 200 === 0) { fs.writeFileSync(cachePath, JSON.stringify(cache)); console.log(`${lang} ${i}/${titles.length}`); }
    await sleep(300);
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache));
}

const info = new Map();
for (const kind of ['car', 'moto']) for (const r of catalog[kind].rows) info.set(r[0], [r[1], catalog[kind].brands[r[2]][0]]);
for (const [q, list] of links) {
  // Prefer the language whose article gives a range; when two languages disagree, keep neither.
  const [name, brand] = info.get(q);
  const ranges = list.map(([lang, t]) => { const text = cache[`${lang}:${t}`] || ''; return [lang, namesModel(text, name, brand) ? rangeFrom(text) : null, t]; }).filter(([, r]) => r);
  if (!ranges.length) continue;
  const agree = ranges.every(([, r]) => r[0] === ranges[0][1][0]);
  if (agree) found[q] = [...ranges[0][1], ranges[0][0], ranges[0][2]];
}

fs.writeFileSync(outPath, JSON.stringify(Object.fromEntries(Object.entries(found).sort()), null, 0));
const byLang = Object.values(found).reduce((a, [, , src]) => ({ ...a, [src]: (a[src] || 0) + 1 }), {});
console.log('DONE filled', Object.keys(found).length, 'of', missing.length, JSON.stringify(byLang));
