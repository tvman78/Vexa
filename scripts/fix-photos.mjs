// Replaces hand-reviewed wrong or weak photos using targeted Wikimedia Commons searches.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'cars');
const manifestPath = path.join(root, 'src', 'data', 'photos.json');
const HEADERS = { 'User-Agent': 'VexaPhotoBuilder/1.0 (open-source car reference app)' };

// key: [search text, regex the file name must match]
const FIXES = {
  'abarth|695 Biposto': ['Abarth 695 Biposto', /biposto/i],
  'fiat|500 (1957)': ['Fiat Nuova 500', /(nuova|500 ?[dfl]\b)/i],
  'lamborghini|Huracán EVO': ['Lamborghini Huracan EVO', /hurac[aá]n.*evo|evo.*hurac[aá]n/i],
  'toyota|GR Supra 3.0': ['Toyota GR Supra A90 J29 front', /supra.*(a90|j29|db\d|1x7a|2019|2020|2021|2022)(?!.*\b95\d\d)/i],
  'bmw|320d (G20)': ['BMW 320d G20', /(g20|320d)/i],
  'dacia|Sandero 1.0 TCe': ['Dacia Sandero III', /sandero.*(iii|3|2021|2020|2022|2023)/i],
  'toyota|AE86 Trueno': ['Toyota Sprinter Trueno AE86', /(trueno|ae86)/i],
  'toyota|Corolla 1.6 (E210)': ['Toyota Corolla E210 sedan', /corolla.*(e21|210|sedan|2019|2020|2021)/i],
  'honda|Civic Type R (FL5)': ['Honda Civic Type R FL5', /(fl5|type.?r.*(2022|2023|2024)|(2022|2023|2024).*type.?r)/i],
  'citroen|C3 BlueHDi': ['Citroen C3 2017 PureTech', /c3/i],
  'skoda|Octavia 2.0 TDI': ['Škoda Octavia IV', /octavia.*(iv|nx|2020|2021|2022)/i],
  'peugeot|208 1.2 PureTech': ['Peugeot 208 II', /208.*(ii|2019|2020|2021|2022)/i],
};
const REJECT = /race|racing|rally|gt3|super ?trofeo|police|polizei|wreck|crash|concept|interior|cockpit|dashboard|engine|rear|heck|detail|badge|logo|\btoy\b|model car|aircross|e-?208|e-?c3|hybrid|hydrid|electric|\bev\b|d(ü|ue)lmen/i;
const only = process.argv.slice(2);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim().slice(0, 90);
const isFree = (license = '') => /^(cc0|cc[ -]by|public domain|pd\b|attribution)/i.test(license) && !/\b(nc|nd)\b/i.test(license);
const slug = (key) => key.replace('|', '-').normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

async function get(url, binary) {
  for (let attempt = 0; attempt < 7; attempt++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) return binary ? Buffer.from(await res.arrayBuffer()) : res.json();
    if (res.status !== 429 && res.status < 500) throw new Error(`HTTP ${res.status}`);
    await sleep(Number(res.headers.get('retry-after')) * 1000 || 4000 * (attempt + 1));
  }
  throw new Error('too many retries');
}

async function search(text, must) {
  const params = new URLSearchParams({ format: 'json', formatversion: '2', action: 'query', generator: 'search', gsrnamespace: '6', gsrlimit: '50', gsrsearch: `${text} filetype:bitmap`, prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '960' });
  const data = await get(`https://commons.wikimedia.org/w/api.php?${params}`);
  return (data.query?.pages || [])
    .sort((a, b) => a.index - b.index)
    .filter((p) => p.imageinfo?.[0] && /\.jpe?g$/i.test(p.title) && must.test(p.title) && !REJECT.test(p.title))
    .filter((p) => { const i = p.imageinfo[0]; return i.width >= 1000 && i.width > i.height * 1.15 && isFree(i.extmetadata?.LicenseShortName?.value); })
    .slice(0, 3);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const failed = [];
for (const [key, [text, must]] of Object.entries(FIXES).filter(([k]) => !only.length || only.some((o) => k.includes(o)))) {
  try {
    const picks = await search(text, must);
    if (!picks.length) { failed.push(key); console.log(`0 ${key}`); continue; }
    const base = slug(key);
    const old = manifest[key] || [];
    const saved = [];
    for (const [i, page] of picks.entries()) {
      const info = page.imageinfo[0];
      const raw = await get(info.thumburl, true);
      const file = `${base}-fix${i + 1}.webp`;
      await sharp(raw).rotate().resize({ width: 960, withoutEnlargement: true }).webp({ quality: 66 }).toFile(path.join(outDir, file));
      saved.push({ file, kind: 'front', title: page.title.replace(/^File:/, ''), author: strip(info.extmetadata?.Artist?.value) || 'Wikimedia Commons', license: info.extmetadata.LicenseShortName.value, url: info.descriptionurl });
      await sleep(900);
    }
    // Keep correct interior/engine shots from the earlier set, except for the models whose whole set was the wrong car.
    const wholeSetWrong = /abarth|fiat\|500|supra/.test(key);
    const keep = wholeSetWrong ? [] : old.filter((p) => (p.kind === 'interior' || p.kind === 'engine') && !p.file.includes('-fix'));
    manifest[key] = [...saved, ...keep].slice(0, 4);
    const used = new Set(manifest[key].map((p) => p.file));
    old.filter((p) => !used.has(p.file)).forEach((p) => fs.rmSync(path.join(outDir, p.file), { force: true }));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
    console.log(`${saved.length} ${key}: ${saved[0].title}`);
  } catch (e) { failed.push(key); console.log(`ERR ${key}: ${e.message}`); }
  await sleep(1200);
}
console.log('FAILED:', JSON.stringify(failed));
