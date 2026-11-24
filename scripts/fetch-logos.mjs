// Downloads brand logos listed on Wikidata (P154, hosted on Wikimedia Commons) into public/logos
// and records them in src/data/logos.json. Resumable: brands already saved are skipped.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { BRANDS } from '../src/data/brands.js';
import { canonicalBrand, foldBrand } from './brand-names.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'logos');
const manifestPath = path.join(root, 'src', 'data', 'logos.json');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'catalog.json'), 'utf8'));
const UA = 'VexaLogoBuilder/1.0 (open-source vehicle reference app)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fileName = (uri) => decodeURIComponent(uri.split('/').pop());
// upload.wikimedia.org rate-limits original files hard; thumbnails from thumb.wikimedia.org are served normally.
const thumbUrl = (info) => {
  const clean = (u) => u.replace(/\?utm_source=.*$/, '');
  const t = clean(info.thumburl || '');
  if (t.includes('/thumb/')) return t.replace('//upload.wikimedia.org/', '//thumb.wikimedia.org/');
  const m = clean(info.url).match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(\w\/\w\w)\/(.+)$/);
  if (!m) return t || clean(info.url);
  return `https://thumb.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/250px-${m[2]}${/\.svg$/i.test(m[2]) ? '.png' : ''}`;
};
const slug = (s) => foldBrand(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'brand';

async function sparql(query) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch('https://query.wikidata.org/sparql', { method: 'POST', headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ query }) });
    if (res.ok) { try { return (await res.json()).results.bindings; } catch { /* truncated: retry */ } } else if (res.status !== 429 && res.status < 500) throw new Error(`HTTP ${res.status}`);
    await sleep(Number(res.headers.get('retry-after')) * 1000 || 6000 * (attempt + 1));
  }
  throw new Error('SPARQL failed');
}

async function get(url, binary) {
  url = url.replace(/\?utm_source=.*$/, '');
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      if (process.env.LOGO_DEBUG) console.log(`    get #${attempt} ${url.slice(0, 90)}`);
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
      if (process.env.LOGO_DEBUG) console.log(`    -> ${res.status}`);
      if (res.ok) return binary ? Buffer.from(await res.arrayBuffer()) : await res.json();
      if (res.status !== 429 && res.status < 500) throw Object.assign(new Error(`HTTP ${res.status}`), { fatal: true });
      const wait = Math.min(Number(res.headers.get('retry-after')) * 1000 || 4000 * (attempt + 1), 300000);
      if (process.env.LOGO_DEBUG) console.log(`    waiting ${wait / 1000}s`);
      await sleep(wait + 1000);
    } catch (e) {
      if (e.fatal) throw e;
      await sleep(4000 * (attempt + 1));
    }
  }
  throw new Error('too many retries');
}

const names = new Map();
for (const name of [...BRANDS.map((b) => b.name), ...catalog.car.brands.map((b) => b[0]), ...catalog.moto.brands.map((b) => b[0])]) names.set(foldBrand(name), name);

// Checked by hand: these Wikidata "logos" are car photos, blank images or electric-only branding.
const REJECT = new Set(['changan', 'sbarro', 'vehiculos automotores mexicanos', 'briggs automotive', 'k-1 vehicles', 'soueast', 'mahindra & mahindra',
  'advanced design tramontana', 'david brown automotive', 'changan ford', 'ford-vairogs', 'beijing', 'thomas', 'daniels', 'douglas', 'pathfinder']);
const found = new Map();
const offer = (brandName, logo, exact) => {
  const key = foldBrand(canonicalBrand(brandName));
  if (!names.has(key) || REJECT.has(key)) return;
  const current = found.get(key);
  if (!current || (exact && !current.exact)) found.set(key, { logo: fileName(logo), exact });
};

for (const cls of ['Q3231690', 'Q23866334']) {
  const rows = await sparql(`SELECT DISTINCT ?label ?logo WHERE { ?m wdt:P31/wdt:P279* wd:${cls} ; wdt:P1716|wdt:P176 ?b . ?b wdt:P154 ?logo ; rdfs:label ?label FILTER(LANG(?label)="en") }`);
  rows.forEach((r) => offer(r.label.value, r.logo.value, foldBrand(r.label.value) === foldBrand(canonicalBrand(r.label.value))));
  await sleep(2500);
}
console.log(`from model makers: ${found.size}/${names.size}`);

// Brands not linked from a model: match the exact name, and only accept vehicle companies.
const VEHICLE = /\b(car|cars|auto|automobile|automotive|automaker|motor|motors|motorcycle|motorcycles|vehicle|vehicles|truck|trucks|scooter|moped)\b/i;
const missing = [...names.entries()].filter(([key]) => !found.has(key)).map(([, name]) => name);
for (let i = 0; i < missing.length; i += 60) {
  const values = missing.slice(i, i + 60).flatMap((n) => [n, `${n} Motors`, `${n} Motor Company`, `${n} Automobiles`]).map((n) => `"${n.replace(/["\\]/g, '')}"@en`).join(' ');
  const rows = await sparql(`SELECT DISTINCT ?label ?logo ?d WHERE { VALUES ?label { ${values} } ?b rdfs:label ?label ; wdt:P154 ?logo ; schema:description ?d FILTER(LANG(?d)="en") }`);
  rows.filter((r) => VEHICLE.test(r.d.value)).forEach((r) => offer(r.label.value, r.logo.value, false));
  await sleep(1200);
}
console.log(`after name match: ${found.size}/${names.size}`);

fs.mkdirSync(outDir, { recursive: true });
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
const todo = [...found.entries()].filter(([key]) => !manifest[key]);
const failed = [];
for (let i = 0; i < todo.length; i += 40) {
  const batch = todo.slice(i, i + 40);
  const params = new URLSearchParams({ format: 'json', formatversion: '2', action: 'query', titles: batch.map(([, v]) => `File:${v.logo}`).join('|'), prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '250' });
  if (process.env.LOGO_DEBUG) console.log(`batch ${i}: query`);
  const data = await get(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (process.env.LOGO_DEBUG) console.log(`batch ${i}: ${data.query?.pages?.length} pages`);
  const back = new Map();
  for (const n of data.query.normalized || []) back.set(n.to, n.from);
  const byTitle = new Map(data.query.pages.map((p) => [back.get(p.title) || p.title, p]));
  for (const [key, value] of batch) {
    const info = byTitle.get(`File:${value.logo}`)?.imageinfo?.[0];
    if (!info) { failed.push(names.get(key)); continue; }
    try {
      if (process.env.LOGO_DEBUG) console.log(`  ${names.get(key)}: ${thumbUrl(info)}`);
      const raw = await get(thumbUrl(info), true);
      const file = `${slug(names.get(key))}.webp`;
      await sharp(raw, { animated: false }).resize({ width: 160, height: 160, fit: 'inside', withoutEnlargement: false }).webp({ quality: 84, alphaQuality: 90 }).toFile(path.join(outDir, file));
      manifest[key] = { file, title: value.logo, url: info.descriptionurl, license: info.extmetadata?.LicenseShortName?.value || '' };
      fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    } catch (e) { failed.push(`${names.get(key)} (${e.message})`); }
    await sleep(1500);
  }
  console.log(`logos ${Math.min(i + 40, todo.length)}/${todo.length}`);
  await sleep(800);
}
const bytes = fs.readdirSync(outDir).reduce((sum, f) => sum + fs.statSync(path.join(outDir, f)).size, 0);
console.log(`DONE logos=${Object.keys(manifest).length}/${names.size} MB=${(bytes / 1048576).toFixed(1)} failed=${failed.length}`);
const major = ['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 'Ford', 'Ferrari', 'Lamborghini', 'Porsche', 'Honda', 'Yamaha', 'Ducati', 'Kawasaki', 'Suzuki', 'Harley-Davidson', 'Renault', 'Fiat', 'Tofaş', 'Anadol', 'KTM'];
console.log('major brands missing:', major.filter((m) => !manifest[foldBrand(m)]).join(', ') || 'none');
