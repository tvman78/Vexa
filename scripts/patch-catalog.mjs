// Hand-checked fixes applied to src/data/catalog.json after fetch-catalog.mjs. Safe to run more than once.
// Wikidata files some models under their maker (Anadol under Ford Otosan) and misses Turkish brands;
// these fixes move models to the brand people know and add models listed on Turkish Wikipedia.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
const slug = (s) => s.normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
// Models known only by name (no Wikidata item, no photo, no reliable years).
const named = (brand, names) => names.map((n) => [`vx-${slug(brand)}-${slug(n)}`, n, 0, 0, '']);

// [Wikidata id, model name, start year, end year, Commons file]. Years stay 0 when no reliable source gives them.
// Models with no Wikidata item use a "vx-" id; the app hides the Wikidata link for them.
const ADD = {
  car: {
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
  },
  // Turkish motorcycle makers, model lists from Turkish Wikipedia (Kuba Motor, RKS Motor, Asya Motor). Petrol only.
  moto: {
    Kuba: { country: 'TR', rows: named('kuba', ['Çita 100R-MAX', 'Çita 100R-MAX Gold', 'CG 100', 'KM125-6', 'Prince 50', 'Ege 50', 'Ege 100', 'SJ50 Pro', 'Reiz 50', 'KEE', 'Rainbow',
      'City GO 50', 'Trendy 50', 'Trendy XC', 'Zenzero 125', 'Rocca 100', 'Bluebery Pro', 'Valentino 50', 'Space 50 Pro', 'Bluebird 125', 'Gelli 125', 'VN50 Pro', 'Brilliant 50', 'Brilliant 125',
      'Pesora 125-X', 'Superlight 125', 'Superlight 200', 'KB150-25 MAX', 'Pikap 200 MAX', 'Kargo 180', 'TK03', 'X-Boss', 'Hussar 135', 'Hussar 220 Pro', 'MX 220', 'W180', 'Xwolf 700']) },
    RKS: { country: 'TR', rows: named('rks', ['Wildcat 125i', 'Pride 125', 'Newlight', 'Spontini 110', 'Blazer XR', 'K-Light', 'Titanic 150', 'Sniper 50', 'Premium 125', 'Bolero 50', 'Jaguar 100', 'Azure 50']) },
    Asya: { country: 'TR', rows: named('asya', ['Polo', 'Nostalji 125', 'Efsane Eco 100', 'Turkcup Lux', 'Turkcup Delux', 'Turkcup Klasik', 'Thunder', 'Ace', 'Bubbly', 'Bubbly 49', 'SkyMax',
      'SkyMax-Pro', 'T-Rex', 'Kedi Lux', 'Kedi Klasik', 'Swift-R 170', 'Elegant 150', 'Ultra 150', 'Pars 250', 'Ghost 350']) },
  },
};
// Production years from Turkish Wikipedia for rows that keep their Wikidata data.
const YEARS = { Q55049425: [1971, 1976], Q851687: [1981, 2003], Q656455: [1981, 2003], Q6555784: [1984, 2003], Q6097116: [1981, 1984], Q1207050: [1961, 1961] };
// Year ranges found by fill-years.mjs (other-language Wikipedia and Wikidata qualifiers); used only where a row has no year.
const extraPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'years-extra.json');
const EXTRA = fs.existsSync(extraPath) ? JSON.parse(fs.readFileSync(extraPath, 'utf8')) : {};
const MOVE = { car: [{ from: 'Ford Otosan', to: 'Anadol', match: /^Anadol /, rename: (n) => n.replace(/^Anadol /, '') }] };
const DROP = new Set(['Q1814507']); // the Anadol company itself, not a model

for (const kind of ['car', 'moto']) {
  const part = catalog[kind];
  const brandIndex = (name, country) => {
    let i = part.brands.findIndex((b) => b[0] === name);
    if (i < 0) { part.brands.push([name, country || '', 0]); i = part.brands.length - 1; }
    return i;
  };
  part.rows = part.rows.filter((r) => !DROP.has(r[0]));
  for (const m of MOVE[kind] || []) {
    const from = part.brands.findIndex((b) => b[0] === m.from);
    if (from < 0) continue;
    const to = brandIndex(m.to, ADD[kind]?.[m.to]?.country);
    for (const r of part.rows) if (r[2] === from && m.match.test(r[1])) { r[2] = to; r[1] = m.rename(r[1]); }
  }
  for (const [brand, { country, rows }] of Object.entries(ADD[kind] || {})) {
    const idx = brandIndex(brand, country);
    for (const [id, name, start, end, img] of rows) {
      const row = [id, name, idx, start, end, img];
      const at = part.rows.findIndex((r) => r[0] === id);
      if (at < 0) part.rows.push(row); else part.rows[at] = row;
    }
  }
  for (const r of part.rows) if (YEARS[r[0]]) [r[3], r[4]] = YEARS[r[0]];
  for (const r of part.rows) if (!r[3] && EXTRA[r[0]]) [r[3], r[4]] = EXTRA[r[0]];

  // Drop brands left without models and renumber, then refresh model counts.
  const counts = part.brands.map((_, i) => part.rows.filter((r) => r[2] === i).length);
  const keep = counts.map((c) => c > 0);
  const remap = []; let next = 0;
  keep.forEach((k, i) => { remap[i] = k ? next++ : -1; });
  part.brands = part.brands.filter((_, i) => keep[i]).map((b) => [b[0], b[1], 0]);
  for (const r of part.rows) r[2] = remap[r[2]];
  for (const r of part.rows) part.brands[r[2]][2]++;
  console.log(kind, 'brands', part.brands.length, 'models', part.rows.length);
}

fs.writeFileSync(file, JSON.stringify(catalog));
for (const [kind, name] of [['car', 'Anadol'], ['car', 'TÜLOMSAŞ'], ['moto', 'Kuba'], ['moto', 'RKS'], ['moto', 'Asya']]) {
  const i = catalog[kind].brands.findIndex((b) => b[0] === name);
  console.log(name, catalog[kind].brands[i]?.[2]);
}
