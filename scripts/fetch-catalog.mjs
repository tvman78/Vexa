// Builds public/data/catalog.json from Wikidata: car and motorcycle models from all eras.
// Electric and hybrid vehicles are removed. Row: [wikidataId, name, brandIndex, startYear, endYear, commonsImage]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalBrand } from './brand-names.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(root, 'src', 'data', 'catalog.json');
const HEADERS = { 'User-Agent': 'VexaDataBuilder/1.0 (open-source vehicle reference app)', Accept: 'application/sparql-results+json' };
const CLASSES = { car: 'Q3231690', moto: 'Q23866334' };

// Makers that only build (or are only known for) electric vehicles.
const ELECTRIC_BRANDS = /^(tesla|rivian|lucid|polestar|nio|xpeng|zeekr|aiways|byton|fisker|faraday future|rimac|lightyear|sono motors|canoo|lordstown|togg|neta|leapmotor|ora|aion|avatr|denza|voyah|zero motorcycles|energica|livewire|lightning motorcycles?|damon|cake|super soco|niu|ather|ola electric|gogoro|arcimoto|sondors|evoke|verge|maeving|tacita)( .*)?$/i;
const ELECTRIC_NAME = /\b(electric|elektro|electrique|e-?tron|ev\d*|bev|phev|mhev|hev|hybrid|hybride|plug-?in|e-?golf|e-?up!?|id\.\d|ioniq|leaf|bz4x|eq[a-z]|i[3-9]x?|ix\d?|taycan|mach-e|e-tense|e-?208|e-?2008|zoe|twizy|hydrogen|fuel cell|mirai|nexo|solar)\b/i;
const ELECTRIC_POWER = /electric|hybrid|battery|fuel cell|hydrogen|solar/i;
const ELECTRIC_MODEL = /\b(prius|aqua|volt|ampera|clarity|insight|niro|mirai|ariya|mx-30|z\.e\.|e-tech|dm-i|dm-p|\d{3}h|galaxy e\d|e-hs\d|e-qm\d|e-moke|e-motion|e-park|e-nv200|e-ka)\b|(^|\s)e-(?!class|type|pace|series|body|\d{3}\b)|^(byd )?(dolphin|atto|seal|han|qin|song|yuan|tang|e[1-9])\b|\bbyd (dolphin|atto|seal|han|qin|song|yuan|tang|e[1-9])\b/i;
const ELECTRIC_BRAND_WORD = /\belectric\b|\bev\b|e-mobility/i;
const ELECTRIC_INTRO = /(battery|all|fully|pure)[- ]electric|electric (car|vehicle|motorcycle|scooter|suv|sedan|crossover|hatchback|pickup|van|city car|supercar)|plug-in hybrid|hybrid (electric|car|vehicle|suv|sedan|hatchback)|fuel[- ]cell/i;
const cachePath = path.join(root, '.tools', 'cache', 'wiki-intros.json');

// Reads the opening sentences of each English Wikipedia article (cached between runs).
async function wikiIntros(titles) {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
  const missing = titles.filter((t) => !(t in cache));
  for (let i = 0; i < missing.length; i += 20) {
    const batch = missing.slice(i, i + 20);
    const url = `https://en.wikipedia.org/w/api.php?${new URLSearchParams({ format: 'json', formatversion: '2', action: 'query', prop: 'extracts', exintro: '1', explaintext: '1', exsentences: '3', exlimit: '20', redirects: '1', titles: batch.join('|') })}`;
    let data = null;
    for (let attempt = 0; attempt < 6 && !data; attempt++) {
      const res = await fetch(url, { headers: { 'User-Agent': HEADERS['User-Agent'] } });
      if (res.ok) data = await res.json();
      else await sleep(Number(res.headers.get('retry-after')) * 1000 || 3000 * (attempt + 1));
    }
    if (!data) continue;
    const back = new Map(batch.map((t) => [t, t]));
    for (const list of [data.query.normalized || [], data.query.redirects || []]) for (const { from, to } of list) for (const [orig, now] of back) if (now === from) back.set(orig, to);
    const byTitle = new Map(data.query.pages.map((p) => [p.title, p.extract || '']));
    for (const [orig, now] of back) cache[orig] = (byTitle.get(now) || '').slice(0, 500);
    if (i % 400 === 0) { fs.writeFileSync(cachePath, JSON.stringify(cache)); console.log(`intros ${i}/${missing.length}`); }
    await sleep(120);
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache));
  return cache;
}

function yearsFromIntro(text) {
  const Y = '(18[6-9]\\d|19\\d{2}|20[0-2]\\d)';
  const range = text.match(new RegExp(`${Y}\\s*(?:-|–|—|to|until|through)\\s*(present|${Y})`, 'i'));
  if (range) return { start: Number(range[1]), end: /present/i.test(range[2]) ? 0 : Number(range[2]) };
  const between = text.match(new RegExp(`between\\s+${Y}\\s+and\\s+${Y}`, 'i'));
  if (between) return { start: Number(between[1]), end: Number(between[2]) };
  const since = text.match(new RegExp(`(?:since|from|produced in|manufactured in|built in|introduced in|launched in|unveiled in|released in|debuted in|in)\\s+(?:[A-Z][a-z]+\\s+)?${Y}`));
  return since ? { start: Number(since[1]), end: 0 } : null;
}

const NOT_A_PRODUCT = /\b(concept|prototype|show car|race car|racing car|formula|f1 car|gt3|lmp\d?|dtm|wrc|rally car|toy|scale model)\b/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qid = (uri) => uri.split('/').pop();
const val = (row, key) => row[key]?.value;
const year = (s) => { const y = s ? parseInt(String(s).replace(/^\+/, ''), 10) : 0; return y >= 1860 && y <= 2030 ? y : 0; };

async function sparql(query) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch('https://query.wikidata.org/sparql', {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ query }),
    });
    if (res.ok) {
      try { return (await res.json()).results.bindings; } catch { /* truncated response: retry */ }
    } else if (res.status !== 429 && res.status < 500) throw new Error(`HTTP ${res.status}`);
    await sleep(Number(res.headers.get('retry-after')) * 1000 || 6000 * (attempt + 1));
  }
  throw new Error('SPARQL failed after retries');
}

async function harvest(kind) {
  const base = `?m wdt:P31/wdt:P279* wd:${CLASSES[kind]} .`;
  const core = await sparql(`SELECT DISTINCT ?m ?label ?b ?bLabel ?brand WHERE { ${base} ?m rdfs:label ?label FILTER(LANG(?label)="en") { ?m wdt:P1716 ?b BIND(1 AS ?brand) } UNION { ?m wdt:P176 ?b } ?b rdfs:label ?bLabel FILTER(LANG(?bLabel)="en") }`);
  await sleep(1500);
  const images = await sparql(`SELECT ?m (SAMPLE(?i) AS ?img) WHERE { ${base} ?m wdt:P18 ?i } GROUP BY ?m`);
  await sleep(1500);
  const starts = [], ends = [], power = [];
  const descriptions = await sparql(`SELECT ?m ?d WHERE { ${base} ?m schema:description ?d FILTER(LANG(?d)="en") }`);
  await sleep(1200);
  for (const p of ['P571', 'P729', 'P580', 'P577']) { starts.push(...await sparql(`SELECT ?m ?v WHERE { ${base} ?m wdt:${p} ?v }`)); await sleep(1200); }
  for (const p of ['P576', 'P730', 'P2669', 'P582']) { ends.push(...await sparql(`SELECT ?m ?v WHERE { ${base} ?m wdt:${p} ?v }`)); await sleep(1200); }
  for (const p of ['P516', 'P31', 'P279']) { power.push(...await sparql(`SELECT DISTINCT ?m ?l WHERE { ${base} ?m wdt:${p} ?p . ?p rdfs:label ?l FILTER(LANG(?l)="en") }`)); await sleep(1200); }
  const brandIds = [...new Set(core.map((row) => qid(val(row, 'b'))))];
  const countries = [];
  for (let i = 0; i < brandIds.length; i += 150) {
    const values = brandIds.slice(i, i + 150).map((id) => `wd:${id}`).join(' ');
    countries.push(...await sparql(`SELECT DISTINCT ?b ?code WHERE { VALUES ?b { ${values} } ?b wdt:P17|wdt:P495 ?c . ?c wdt:P297 ?code }`));
    await sleep(500);
  }

  const items = new Map();
  for (const row of core) {
    const id = qid(val(row, 'm'));
    const current = items.get(id);
    if (current && (current.fromBrand || !row.brand)) continue;
    items.set(id, { id, name: val(row, 'label'), brandId: qid(val(row, 'b')), brand: canonicalBrand(val(row, 'bLabel')), fromBrand: !!row.brand });
  }
  for (const row of images) { const it = items.get(qid(val(row, 'm'))); if (it) it.img = decodeURIComponent(val(row, 'img').split('/').pop()); }
  for (const row of starts) { const it = items.get(qid(val(row, 'm'))); const y = year(val(row, 'v')); if (it && y) it.start = it.start ? Math.min(it.start, y) : y; }
  for (const row of ends) { const it = items.get(qid(val(row, 'm'))); const y = year(val(row, 'v')); if (it && y) it.end = Math.max(it.end || 0, y); }
  const electric = new Set();
  for (const row of descriptions) {
    const id = qid(val(row, 'm')), it = items.get(id), text = val(row, 'd');
    if (ELECTRIC_POWER.test(text)) electric.add(id);
    if (!it) continue;
    const found = (text.match(/\b(18[6-9]\d|19\d{2}|20[0-2]\d)\b/g) || []).map(Number);
    if (found.length && !it.start) it.start = Math.min(...found);
    if (found.length > 1 && !it.end) it.end = Math.max(...found);
  }
  for (const it of items.values()) {
    const fromName = (it.name.match(/\b(18[6-9]\d|19\d{2}|20[0-2]\d)\b/) || [])[0];
    if (!it.start && fromName) it.start = Number(fromName);
  }
  for (const row of power) if (ELECTRIC_POWER.test(val(row, 'l'))) electric.add(qid(val(row, 'm')));
  const links = await sparql(`SELECT ?m ?title WHERE { ${base} ?a schema:about ?m ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?title }`);
  for (const row of links) { const it = items.get(qid(val(row, 'm'))); if (it) it.title = val(row, 'title'); }
  const intros = await wikiIntros([...items.values()].map((it) => it.title).filter(Boolean));
  for (const it of items.values()) {
    const intro = it.title ? intros[it.title] : '';
    if (!intro) continue;
    if (ELECTRIC_INTRO.test(intro.split(/(?<=\.)\s/)[0] || '')) electric.add(it.id);
    if (!it.start) { const y = yearsFromIntro(intro); if (y) { it.start = y.start; if (!it.end) it.end = y.end; } }
  }
  const brandCountry = new Map();
  for (const row of countries) { const b = qid(val(row, 'b')); if (!brandCountry.has(b)) brandCountry.set(b, val(row, 'code')); }

  const removed = { electric: 0, electricBrand: 0, notProduct: 0, badName: 0 };
  const kept = [];
  for (const it of items.values()) {
    if (/^Q\d+$/.test(it.name) || it.name.length > 70) removed.badName++;
    else if (ELECTRIC_BRANDS.test(it.brand) || ELECTRIC_BRAND_WORD.test(it.brand)) removed.electricBrand++;
    else if (electric.has(it.id) || ELECTRIC_NAME.test(it.name) || ELECTRIC_MODEL.test(it.name)) removed.electric++;
    else if (NOT_A_PRODUCT.test(it.name)) removed.notProduct++;
    else kept.push({ ...it, country: brandCountry.get(it.brandId) || '' });
  }
  console.log(kind, JSON.stringify({ raw: items.size, kept: kept.length, withImage: kept.filter((x) => x.img).length, withYear: kept.filter((x) => x.start).length, removed }));
  return kept;
}

function pack(items) {
  const brands = new Map();
  for (const it of items) {
    const key = it.brand.toLowerCase();
    if (!brands.has(key)) brands.set(key, { name: it.brand, country: it.country, count: 0 });
    const b = brands.get(key);
    b.count++;
    if (!b.country) b.country = it.country;
  }
  const list = [...brands.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  const index = new Map(list.map((b, i) => [b.name.toLowerCase(), i]));
  const rows = items
    .sort((a, b) => a.brand.localeCompare(b.brand, 'en') || (a.start || 9999) - (b.start || 9999) || a.name.localeCompare(b.name, 'en'))
    .map((it) => {
      const prefix = new RegExp(`^${it.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i');
      return [it.id, it.name.replace(prefix, '') || it.name, index.get(it.brand.toLowerCase()), it.start || 0, it.end && it.end >= (it.start || 0) ? it.end : 0, it.img || ''];
    });
  return { brands: list.map((b) => [b.name, b.country, b.count]), rows };
}

const cars = await harvest('car');
await sleep(2000);
const motos = await harvest('moto');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ source: 'Wikidata (CC0)', generated: new Date().toISOString().slice(0, 10), car: pack(cars), moto: pack(motos) }));
const catalog = JSON.parse(fs.readFileSync(outPath, 'utf8'));
console.log(`DONE carBrands=${catalog.car.brands.length} carModels=${catalog.car.rows.length} motoBrands=${catalog.moto.brands.length} motoModels=${catalog.moto.rows.length} MB=${(fs.statSync(outPath).size / 1048576).toFixed(2)}`);
const top = (part) => [...part.brands].sort((a, b) => b[2] - a[2]).slice(0, 18).map((b) => `${b[0]}:${b[2]}`).join(', ');
console.log('top cars:', top(catalog.car));
console.log('top motos:', top(catalog.moto));
