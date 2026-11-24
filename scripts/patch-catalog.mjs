// Hand-checked fixes applied to src/data/catalog.json after fetch-catalog.mjs. Safe to run more than once.
// Wikidata files some models under their maker (Anadol under Ford Otosan); these fixes move them to the brand people know.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
const car = catalog.car;

// [Wikidata id, model name, start year, end year, Commons file]. Years stay 0 when no reliable source gives them.
// Models with no Wikidata item use a "vx-" id; the app hides the Wikidata link for them.
const ADD = {
  'Tofaş': { country: 'TR', rows: [
    ['vx-tofas-serce', 'Serçe', 1984, 1995, 'Tofaş Serçe late fv.JPG'],
  ] },
  Anadol: { country: 'TR', rows: [
    ['Q31187731', 'A1', 1966, 1976, 'Rahmi Koç Museum DSC 1308 (17910902750).jpg'],
    ['vx-anadol-a2', 'A2', 1971, 1981, 'Otosan Anadol P2 Saloon c.1970-81 (15889631104).jpg'],
    ['Q6100603', 'STC-16', 1973, 1975, 'Anadol 4a.JPG'],
    ['Q31192527', 'Böcek', 1975, 1977, 'Otosan Böcek in the Rahmi M. Koç Museum.JPG'],
    ['Q31192528', 'SV-1600', 1973, 1982, 'Anadol SV 1600.jpg'],
    ['vx-anadol-p2-pickup', 'P2 Pickup', 0, 0, 'Anadol P2 pickup in Izmir.jpg'],
  ] },
};
// Production years from Turkish Wikipedia (Tofaş Kuş Serisi, Tofaş Murat 124/Serçe, Anadol A8-16) for rows that keep their Wikidata data.
const YEARS = { Q55049425: [1971, 1976], Q851687: [1981, 2003], Q656455: [1981, 2003], Q6555784: [1984, 2003], Q6097116: [1981, 1984] };
const MOVE = [{ from: 'Ford Otosan', to: 'Anadol', match: /^Anadol /, rename: (n) => n.replace(/^Anadol /, '') }];
const DROP = new Set(['Q1814507']); // the Anadol company itself, not a model

const brandIndex = (name, country) => {
  let i = car.brands.findIndex((b) => b[0] === name);
  if (i < 0) { car.brands.push([name, country || '', 0]); i = car.brands.length - 1; }
  return i;
};

car.rows = car.rows.filter((r) => !DROP.has(r[0]));
for (const m of MOVE) {
  const from = car.brands.findIndex((b) => b[0] === m.from);
  if (from < 0) continue;
  const to = brandIndex(m.to, ADD[m.to]?.country);
  for (const r of car.rows) if (r[2] === from && m.match.test(r[1])) { r[2] = to; r[1] = m.rename(r[1]); }
}
for (const [brand, { country, rows }] of Object.entries(ADD)) {
  const idx = brandIndex(brand, country);
  for (const [id, name, start, end, img] of rows) {
    const row = [id, name, idx, start, end, img];
    const at = car.rows.findIndex((r) => r[0] === id);
    if (at < 0) car.rows.push(row); else car.rows[at] = row;
  }
}

for (const r of car.rows) if (YEARS[r[0]]) [r[3], r[4]] = YEARS[r[0]];

// Drop brands left without models and renumber, then refresh model counts.
const counts = car.brands.map((_, i) => car.rows.filter((r) => r[2] === i).length);
const keep = car.brands.map((_, i) => counts[i] > 0);
const remap = []; let next = 0;
keep.forEach((k, i) => { remap[i] = k ? next++ : -1; });
car.brands = car.brands.filter((_, i) => keep[i]).map((b, i) => [b[0], b[1], 0]);
for (const r of car.rows) r[2] = remap[r[2]];
for (const r of car.rows) car.brands[r[2]][2]++;

fs.writeFileSync(file, JSON.stringify(catalog));
const anadol = car.brands.findIndex((b) => b[0] === 'Anadol');
console.log('brands', car.brands.length, 'models', car.rows.length, 'Anadol', car.rows.filter((r) => r[2] === anadol).map((r) => r[1]).join(', '));
