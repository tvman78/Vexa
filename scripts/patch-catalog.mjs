// Hand-checked fixes applied to src/data/catalog.json after fetch-catalog.mjs. Safe to run more than once.
// Wikidata files some models under their maker (Anadol under Ford Otosan); these fixes move them to the brand people know.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
const car = catalog.car;

// [Wikidata id, model name, start year, end year, Commons file]. Years stay 0 when no reliable source gives them.
const ADD = {
  Anadol: { country: 'TR', rows: [
    ['Q31187731', 'A1', 1966, 1971,'Rahmi Koç Museum DSC 1308 (17910902750).jpg'],
    ['Q6100603', 'STC-16', 1973, 1975, 'Anadol 4a.JPG'],
    ['Q31192527', 'Böcek', 0, 0, 'Otosan Böcek in the Rahmi M. Koç Museum.JPG'],
    ['Q31192528', 'SV-1600', 0, 0, 'Anadol SV 1600.jpg'],
  ] },
};
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
