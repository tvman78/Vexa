// For models whose Wikipedia page covers several generations, keeps a secondary photo only when
// its file name proves the right generation (generation code or a year inside the production run).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MODELS } from '../src/data/models.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'src', 'data', 'photos.json');
const outDir = path.join(root, 'public', 'cars');
const MULTI_GENERATION = /^(bmw\|M3|audi\|(RS6|A3|R8)|bentley\||chevrolet\|Silverado|citroen\|C3|dacia\||fiat\|Panda|honda\|Jazz|hyundai\||kia\||lexus\|IS|mazda\|(RX-7|CX-5)|mercedes\|(G 63|AMG)|mini\|Cooper|mitsubishi\||nissan\|(Skyline|Qashqai)|opel\||peugeot\|(208|3008)|porsche\|(911 GT3|Cayenne)|renault\|(Clio|Megane)|seat\||skoda\||subaru\||suzuki\||toyota\|(GR Supra|Hilux)|volkswagen\|Touareg|volvo\|XC90)/;
const CODES = { 'bmw|M3 Competition (G80)': /g8[02]/i, 'audi|RS6 Avant (C8)': /c8/i, 'audi|A3 Sportback 35 TDI': /8y/i, 'audi|R8 V10 Performance': /4s/i, 'mini|Cooper S (F56)': /f56/i, 'mitsubishi|Lancer Evolution X': /evolution x\b|evo x\b/i, 'nissan|Skyline GT-R (R34)': /r34/i, 'subaru|Impreza WRX STI (GD)': /\bgd[a-z]?\b/i, 'toyota|GR Supra 3.0': /a90|j29|gr.?supra/i };

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let removed = 0, touched = 0;
for (const model of MODELS) {
  const key = `${model.brand}|${model.name}`;
  const photos = manifest[key];
  if (!photos || !MULTI_GENERATION.test(key)) continue;
  const [from, to] = model.years.split('-').map((y) => Number(y) || 2026);
  const end = to || 2026;
  const proves = (title) => {
    if (CODES[key]?.test(title)) return true;
    const years = (title.match(/\b(19|20)\d{2}\b/g) || []).map(Number);
    return years.some((y) => y >= from && y <= end);
  };
  const kept = photos.filter((p, i) => i === 0 || p.file.includes('-fix') || proves(p.title));
  if (kept.length === photos.length) continue;
  photos.filter((p) => !kept.includes(p)).forEach((p) => { fs.rmSync(path.join(outDir, p.file), { force: true }); removed++; });
  manifest[key] = kept;
  touched++;
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
const all = Object.values(manifest);
console.log(JSON.stringify({ modelsTouched: touched, photosRemoved: removed, models: all.length, photos: all.flat().length, singlePhotoModels: all.filter((p) => p.length === 1).length }));
