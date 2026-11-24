// Downloads freely licensed car photos from Wikipedia/Wikimedia Commons into public/cars
// and records author, license and source for each one in src/data/photos.json.
// Resumable: models already present in photos.json are skipped unless --force is passed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { MODELS } from '../src/data/models.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'cars');
const manifestPath = path.join(root, 'src', 'data', 'photos.json');
const API = 'https://en.wikipedia.org/w/api.php';
const HEADERS = { 'User-Agent': 'VexaPhotoBuilder/1.0 (open-source car reference app)' };

export const PAGES = {
  'abarth|695 Biposto': 'Abarth 695|Fiat 500 (2007)', 'alfa|Giulia Quadrifoglio': 'Alfa Romeo Giulia (952)', 'alfa|33 Stradale': 'Alfa Romeo 33 Stradale',
  'alpine|A110 S': 'Alpine A110 (2017)', 'aston|DB12': 'Aston Martin DB12', 'aston|DB5': 'Aston Martin DB5',
  'audi|RS6 Avant (C8)': 'Audi RS 6', 'audi|A3 Sportback 35 TDI': 'Audi A3', 'audi|R8 V10 Performance': 'Audi R8', 'audi|Quattro': 'Audi Quattro',
  'bentley|Continental GT V8': 'Bentley Continental GT', 'bmw|M3 Competition (G80)': 'BMW M3', 'bmw|320d (G20)': 'BMW 3 Series (G20)', 'bmw|M5 (E39)': 'BMW 5 Series (E39)', 'bmw|X5 xDrive30d (G05)': 'BMW X5 (G05)',
  'bugatti|Chiron': 'Bugatti Chiron', 'chevrolet|Corvette C8 Stingray': 'Chevrolet Corvette (C8)', 'chevrolet|Camaro SS (1969)': 'Chevrolet Camaro (first generation)', 'chevrolet|Silverado 1500 Diesel': 'Chevrolet Silverado',
  'citroen|C3 BlueHDi': 'Citroën C3', 'citroen|2CV': 'Citroën 2CV', 'cupra|Formentor VZ': 'Cupra Formentor', 'dacia|Sandero 1.0 TCe': 'Dacia Sandero', 'dacia|Duster 1.5 dCi': 'Dacia Duster',
  'delorean|DMC-12': 'DMC DeLorean', 'dodge|Challenger SRT Hellcat': 'Dodge Challenger (2008)|Dodge Challenger', 'dodge|Charger R/T (1969)': 'Dodge Charger (B-body)|Dodge Charger',
  'ferrari|F8 Tributo': 'Ferrari F8', 'ferrari|812 Superfast': 'Ferrari 812 Superfast', 'ferrari|F40': 'Ferrari F40', 'ferrari|250 GTO': 'Ferrari 250 GTO',
  'fiat|Egea 1.3 Multijet': 'Fiat Tipo (2015)', 'fiat|Panda 1.2': 'Fiat Panda', 'fiat|500 (1957)': 'Fiat 500 (1957)|Fiat Nuova 500|Fiat 500',
  'ford|Mustang GT (S650)': 'Ford Mustang (seventh generation)', 'ford|Focus 1.5 EcoBlue': 'Ford Focus (fourth generation)', 'ford|Ranger 2.0 EcoBlue': 'Ford Ranger (T6)|Ford Ranger', 'ford|GT40 Mk I': 'Ford GT40', 'ford|F-150 3.5 EcoBoost': 'Ford F-Series (fourteenth generation)|Ford F-150',
  'genesis|G80 2.5T': 'Genesis G80', 'honda|Civic Type R (FL5)': 'Honda Civic Type R', 'honda|NSX (NA1)': 'Honda NSX (first generation)|Honda NSX', 'honda|Jazz 1.3': 'Honda Fit',
  'hyundai|i20 1.0 T-GDI': 'Hyundai i20', 'hyundai|Elantra N': 'Hyundai Elantra', 'hyundai|Tucson 1.6 CRDi': 'Hyundai Tucson', 'jaguar|F-Type R': 'Jaguar F-Type', 'jaguar|E-Type Series 1': 'Jaguar E-Type', 'jeep|Wrangler Rubicon 2.0': 'Jeep Wrangler (JL)|Jeep Wrangler',
  'kia|Sportage 1.6 CRDi': 'Kia Sportage', 'kia|Picanto 1.0': 'Kia Picanto', 'koenigsegg|Jesko Attack': 'Koenigsegg Jesko', 'lada|Niva 1.7': 'Lada Niva', 'lada|Samara 2108': 'Lada Samara',
  'lamborghini|Huracán EVO': 'Lamborghini Huracán', 'lamborghini|Aventador SVJ': 'Lamborghini Aventador', 'lamborghini|Countach LP400': 'Lamborghini Countach', 'lamborghini|Miura P400': 'Lamborghini Miura', 'lancia|Delta HF Integrale': 'Lancia Delta',
  'landrover|Defender 110 D300': 'Land Rover Defender (L663)|Land Rover Defender', 'landrover|Range Rover P530': 'Range Rover (L460)|Range Rover', 'lexus|LFA': 'Lexus LFA', 'lexus|IS 500': 'Lexus IS', 'lotus|Emira V6': 'Lotus Emira', 'lotus|Elise S1': 'Lotus Elise',
  'maserati|MC20': 'Maserati MC20', 'mazda|MX-5 ND 2.0': 'Mazda MX-5 (ND)|Mazda MX-5', 'mazda|RX-7 FD': 'Mazda RX-7', 'mazda|CX-5 2.2 SKYACTIV-D': 'Mazda CX-5', 'mclaren|720S': 'McLaren 720S', 'mclaren|F1': 'McLaren F1',
  'mercedes|AMG GT 63 S': 'Mercedes-AMG GT 4-Door Coupé|Mercedes-AMG GT', 'mercedes|C 220 d (W206)': 'Mercedes-Benz C-Class (W206)', 'mercedes|S 500 (W223)': 'Mercedes-Benz S-Class (W223)', 'mercedes|G 63 AMG': 'Mercedes-Benz G-Class', 'mercedes|300 SL Gullwing': 'Mercedes-Benz 300 SL',
  'mg|MGB Roadster': 'MG MGB', 'mini|Cooper S (F56)': 'Mini Hatch', 'mini|Mini (Classic)': 'Mini', 'mitsubishi|Lancer Evolution X': 'Mitsubishi Lancer Evolution', 'morgan|Plus Six': 'Morgan Plus Six|Morgan Plus 6',
  'nissan|GT-R (R35)': 'Nissan GT-R', 'nissan|Skyline GT-R (R34)': 'Nissan Skyline GT-R', 'nissan|Qashqai 1.3 DIG-T': 'Nissan Qashqai', 'opel|Astra 1.5 D': 'Opel Astra', 'pagani|Huayra': 'Pagani Huayra',
  'peugeot|208 1.2 PureTech': 'Peugeot 208', 'peugeot|205 GTI 1.9': 'Peugeot 205', 'peugeot|3008 1.5 BlueHDi': 'Peugeot 3008', 'porsche|911 Carrera S (992)': 'Porsche 911 (992)', 'porsche|911 GT3 RS (992)': 'Porsche 911 GT3', 'porsche|Cayenne Turbo': 'Porsche Cayenne', 'porsche|959': 'Porsche 959',
  'renault|Clio 1.5 dCi': 'Renault Clio', 'renault|Megane RS Trophy': 'Renault Mégane', 'renault|12 Toros': 'Renault 12', 'rollsroyce|Phantom VIII': 'Rolls-Royce Phantom (VIII)|Rolls-Royce Phantom', 'seat|Leon 2.0 TDI': 'SEAT León', 'skoda|Octavia 2.0 TDI': 'Škoda Octavia', 'skoda|Superb 2.0 TSI': 'Škoda Superb',
  'subaru|Impreza WRX STI (GD)': 'Subaru Impreza WRX STI|Subaru Impreza', 'subaru|BRZ': 'Subaru BRZ', 'suzuki|Jimny 1.5': 'Suzuki Jimny', 'suzuki|Swift 1.2': 'Suzuki Swift',
  'tofas|Şahin 1.6': 'Tofaş Şahin|Fiat 131', 'tofas|Doğan SLX': 'Tofaş Doğan|Fiat 131', 'anadol|A1': 'Anadol A1|Anadol',
  'toyota|GR Supra 3.0': 'Toyota Supra', 'toyota|GR Yaris': 'Toyota GR Yaris', 'toyota|Corolla 1.6 (E210)': 'Toyota Corolla (E210)', 'toyota|Land Cruiser 300 3.3D': 'Toyota Land Cruiser (J300)|Toyota Land Cruiser', 'toyota|Hilux 2.8 D-4D': 'Toyota Hilux', 'toyota|AE86 Trueno': 'Toyota AE86', 'toyota|2000GT': 'Toyota 2000GT',
  'renault|Megane Sedan 1.5 dCi': 'Renault Mégane IV|Renault Mégane', 'renault|Taliant 1.0 TCe': 'Renault Taliant|Dacia Logan', 'renault|9 Broadway 1.4': 'Renault 9',
  'fiat|Linea 1.3 Multijet': 'Fiat Linea', 'fiat|Doblo 1.6 Multijet': 'Fiat Doblò', 'fiat|Tempra 1.6': 'Fiat Tempra', 'fiat|Uno 70': 'Fiat Uno', 'fiat|Palio 1.2': 'Fiat Palio', 'fiat|Albea 1.3 Multijet': 'Fiat Albea',
  'hyundai|Accent Blue 1.6 CRDi': 'Hyundai Accent (fourth generation)|Hyundai Accent', 'hyundai|i10 1.0': 'Hyundai i10', 'opel|Corsa 1.2 Turbo (F)': 'Opel Corsa F|Opel Corsa', 'opel|Vectra B 1.6': 'Opel Vectra B|Opel Vectra',
  'volkswagen|Polo 1.0 TSI': 'Volkswagen Polo Mk6|Volkswagen Polo', 'volkswagen|Jetta 1.4 TSI': 'Volkswagen Jetta (A7)|Volkswagen Jetta', 'volkswagen|Golf 1.6 (Mk4)': 'Volkswagen Golf Mk4',
  'toyota|Yaris 1.5': 'Toyota Yaris (XP210)|Toyota Yaris', 'ford|Fiesta 1.0 EcoBoost': 'Ford Fiesta (seventh generation)|Ford Fiesta', 'ford|Transit Courier 1.5 TDCi': 'Ford Transit Courier',
  'dacia|Logan 1.5 dCi': 'Dacia Logan', 'honda|Civic Sedan 1.6 (FC5)': 'Honda Civic (tenth generation)', 'peugeot|301 1.6 BlueHDi': 'Peugeot 301 (2012)|Peugeot 301', 'citroen|C-Elysée 1.6 BlueHDi': 'Citroën C-Elysée',
  'skoda|Fabia 1.0 TSI': 'Škoda Fabia', 'seat|Ibiza 1.0 TSI': 'SEAT Ibiza', 'kia|Rio 1.4 CRDi': 'Kia Rio', 'bmw|520d (G30)': 'BMW 5 Series (G30)', 'mercedes|E 220 d (W213)': 'Mercedes-Benz E-Class (W213)',
  'audi|A4 2.0 TDI (B9)': 'Audi A4 (B9)|Audi A4', 'tofas|Murat 131': 'Fiat 131',
  'volkswagen|Golf GTI (Mk8)': 'Volkswagen Golf Mk8', 'volkswagen|Passat 2.0 TDI': 'Volkswagen Passat (B8)', 'volkswagen|Beetle (Type 1)': 'Volkswagen Beetle', 'volkswagen|Touareg 3.0 TDI': 'Volkswagen Touareg', 'volvo|XC90 B5 Diesel': 'Volvo XC90', 'volvo|240': 'Volvo 200 Series',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (m) => `${m.brand}-${m.name}`.normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
const strip = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim().slice(0, 90);

async function get(url, binary = false) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) return binary ? Buffer.from(await res.arrayBuffer()) : res.json();
    if (res.status !== 429 && res.status < 500) throw new Error(`HTTP ${res.status}`);
    await sleep(Number(res.headers.get('retry-after')) * 1000 || 2000 * (attempt + 1));
  }
  throw new Error('too many retries');
}

const api = (params) => get(`${API}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`);
const isFree = (license = '') => /^(cc0|cc[ -]by|public domain|pd\b|attribution)/i.test(license) && !/\b(nc|nd)\b/i.test(license);
const kindOf = (name) => (/interior|cockpit|dashboard|innenraum|armaturen|\bseats?\b/i.test(name) ? 'interior' : /\bengine\b|motorraum|\bmotor[ _]bay/i.test(name) ? 'engine' : /\brear\b|heck|back/i.test(name) ? 'rear' : 'front');

function score(file, model, lead) {
  const name = file.toLowerCase();
  const tokens = model.name.toLowerCase().replace(/[()]/g, ' ').split(/\s+/).filter((t) => t.length >= 2);
  let value = file === lead ? 3 : 0;
  tokens.forEach((t) => { if (name.includes(t)) value += /\d/.test(t) ? 4 : 2; });
  if (/crop|cropped/.test(name)) value += 1;
  if (/race|racing|rally|wreck|crash|police|concept|prototype|toy|model car/.test(name)) value -= 6;
  return value;
}

async function photosFor(model) {
  let page = null;
  for (const title of PAGES[`${model.brand}|${model.name}`].split('|')) {
    const data = await api({ action: 'query', titles: title, redirects: '1', prop: 'pageimages|images', piprop: 'name', imlimit: '120' });
    const found = data.query.pages[0];
    if (!found.missing && found.images?.length) { page = found; break; }
  }
  if (!page) return [];
  const names = page.images.map((i) => i.title).filter((t) => /\.jpe?g$/i.test(t) && !/logo|badge|emblem|map|diagram|commons-|flag/i.test(t));
  const lead = page.pageimage ? `File:${page.pageimage.replace(/_/g, ' ')}` : null;
  if (lead && !names.includes(lead) && /\.jpe?g$/i.test(lead)) names.unshift(lead);
  const infos = [];
  for (let i = 0; i < names.length; i += 40) {
    const data = await api({ action: 'query', titles: names.slice(i, i + 40).join('|'), prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '960' }); // Wikimedia's standard thumbnail step
    infos.push(...data.query.pages.filter((p) => p.imageinfo?.[0]));
  }
  const usable = infos.map((p) => ({ title: p.title, ii: p.imageinfo[0], meta: p.imageinfo[0].extmetadata || {} }))
    .filter(({ ii, meta }) => ii.width >= 900 && ii.width >= ii.height && isFree(meta.LicenseShortName?.value))
    .map((x) => ({ ...x, kind: kindOf(x.title), score: score(x.title, model, lead) }))
    .sort((a, b) => b.score - a.score);
  const picks = [];
  for (const kind of ['front', 'rear', 'interior', 'engine']) {
    const pick = usable.find((x) => x.kind === kind && !picks.includes(x));
    if (pick) picks.push(pick);
  }
  for (const extra of usable) { if (picks.length >= 3) break; if (!picks.includes(extra)) picks.push(extra); }
  return picks.slice(0, 4);
}

async function main() {
  const force = process.argv.includes('--force');
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = !force && fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
  const unmapped = MODELS.filter((m) => !PAGES[`${m.brand}|${m.name}`]).map((m) => `${m.brand}|${m.name}`);
  if (unmapped.length) throw new Error(`No page for: ${unmapped.join(', ')}`);
  const failed = [];
  for (const model of MODELS) {
    const key = `${model.brand}|${model.name}`;
    if (manifest[key]?.length) continue;
    try {
      const picks = await photosFor(model);
      const saved = [];
      for (const [i, pick] of picks.entries()) {
        // upload.wikimedia.org rate-limits hard; the same thumbnail is served normally from thumb.wikimedia.org.
        const raw = await get(pick.ii.thumburl.replace(/\?utm_source=.*$/, '').replace('//upload.wikimedia.org/', '//thumb.wikimedia.org/'), true);
        const file = `${slug(model)}-${i + 1}.webp`;
        try {
          await sharp(raw).rotate().resize({ width: 960, withoutEnlargement: true }).webp({ quality: 66 }).toFile(path.join(outDir, file));
        } catch (e) { console.log(`  skip unreadable ${pick.title}: ${e.message}`); continue; }
        saved.push({ file, kind: pick.kind, title: pick.title.replace(/^File:/, ''), author: strip(pick.meta.Artist?.value) || 'Wikimedia Commons', license: pick.meta.LicenseShortName.value, url: pick.ii.descriptionurl });
        await sleep(250);
      }
      if (saved.length) { manifest[key] = saved; fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1)); } else failed.push(key);
      console.log(`${saved.length} ${key}`);
    } catch (e) { failed.push(key); console.log(`ERR ${key}: ${e.message}`); }
    await sleep(200);
  }
  const files = fs.readdirSync(outDir);
  const bytes = files.reduce((sum, f) => sum + fs.statSync(path.join(outDir, f)).size, 0);
  console.log(`DONE models=${Object.keys(manifest).length}/${MODELS.length} photos=${files.length} MB=${(bytes / 1048576).toFixed(1)}`);
  console.log(`MISSING: ${JSON.stringify(failed)}`);
}

main();
