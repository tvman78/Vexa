// Adds hand-picked Wikimedia Commons photos to src/data/photos.json for models whose Wikipedia page
// mixes several generations. Usage: node scripts/add-photos.mjs (edits the PICKS list below first).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'src', 'data', 'photos.json');
const UA = { 'User-Agent': 'VexaPhotoBuilder/1.0 (open-source car reference app)' };
const PICKS = {
  'hyundai|Accent Blue 1.6 CRDi': [['2012 Hyundai Accent (RB) Premium sedan (2018-10-01) 01.jpg', 'front'], ['2012 Hyundai Accent (RB) Premium sedan (2018-10-01) 02.jpg', 'rear']],
  'opel|Vectra B 1.6': [['Opel Vectra B - 1998 - front.jpg', 'front'], ['Opel Vectra B rear.jpg', 'rear']],
  'kia|Rio 1.4 CRDi': [['2017 Kia Rio (YB) S 5-door hatchback (2017-07-15) 01.jpg', 'front'], ['2017 Kia Rio (YB) S 5-door hatchback (2017-07-15) 02.jpg', 'rear']],
};
const isFree = (l = '') => /^(cc0|cc[ -]by|public domain|pd\b|attribution)/i.test(l) && !/\b(nc|nd)\b/i.test(l);
const strip = (h = '') => h.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().slice(0, 90);
const slug = (s) => s.normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase();

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
for (const [key, picks] of Object.entries(PICKS)) {
  const params = new URLSearchParams({ format: 'json', formatversion: '2', action: 'query', prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '960', titles: picks.map(([t]) => `File:${t}`).join('|') });
  const data = await (await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: UA })).json();
  const byTitle = new Map(data.query.pages.map((p) => [p.title.replace(/^File:/, ''), p.imageinfo?.[0]]));
  const list = (manifest[key] || []).filter((p) => !picks.some(([t]) => t === p.title));
  for (const [title, kind] of picks) {
    const ii = byTitle.get(title);
    const license = ii?.extmetadata?.LicenseShortName?.value;
    if (!ii || !isFree(license)) { console.log(`skip ${title}: ${license || 'not found'}`); continue; }
    const url = ii.thumburl.replace(/\?utm_source=.*$/, '').replace('//upload.wikimedia.org/', '//thumb.wikimedia.org/');
    const raw = Buffer.from(await (await fetch(url, { headers: UA })).arrayBuffer());
    const file = `${slug(key.replace('|', '-'))}-pick-${slug(kind)}-${list.length + 1}.webp`;
    await sharp(raw).rotate().resize({ width: 960, withoutEnlargement: true }).webp({ quality: 66 }).toFile(path.join(root, 'public', 'cars', file));
    list.push({ file, kind, title, author: strip(ii.extmetadata.Artist?.value) || 'Wikimedia Commons', license, url: ii.descriptionurl });
    await new Promise((r) => setTimeout(r, 800));
  }
  // Exterior photos first, so cards show the outside of the car.
  manifest[key] = list.sort((a, b) => ['front', 'rear', 'interior', 'engine'].indexOf(a.kind) - ['front', 'rear', 'interior', 'engine'].indexOf(b.kind));
  console.log(key, manifest[key].map((p) => p.kind).join(','));
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
