// Finds engine, interior and exterior photos of one exact model on Wikimedia Commons.
// A photo is accepted only if its file name names the brand, the model and the requested view.
const API = 'https://commons.wikimedia.org/w/api.php';
const CACHE_DAYS = 30;

const VIEW_RE = {
  engine: /\bengines?\d*\b|engine[ _-]?bay|\bmotorraum\b|\bmoteur\b|\bmotore\b|\bmotor\b(?![ _-]?(show|sport|company|museum|club|cycle))/i,
  interior: /\binteriors?\d*\b|\bcockpit\d*\b|\bdashboard\d*\b|\binnenraum\b|\barmaturenbrett\b|\bint[eé]rieur\b|\binterno\b/i,
  cockpit: /\bcockpit\d*\b|\bdashboard\d*\b|\binstruments?\b|\bhandlebars?\b|\bspeedometer\b|\btacho\w*\b|\bgauges?\b/i,
};
const SEARCH_WORDS = { engine: ['engine', 'motor'], interior: ['interior', 'cockpit'], cockpit: ['cockpit', 'dashboard', 'instruments'], exterior: [''] };
const REJECT = /\b(toy|model car|scale model|diecast|lego|wreck|crash|crashed|accident|burnt|police|polizei|race|racing|rally|concept|prototype|logo|badge|emblem|hybrid|electric|phev|bev|ev|advert|brochure|poster|stamp|drawing|diagram|blueprint)\b/i;
const NOT_EXTERIOR = /\binteriors?\b|\bcockpit\b|\bdashboard\b|\bengine\b|\bmotorraum\b|\binnenraum\b|\bseats?\b|\bsteering\b|\bdetail\b|\bwheel\b|\bbadge\b/i;
const STOP_WORDS = new Set(['model', 'type', 'series', 'class', 'the', 'and', 'de', 'car', 'cars', 'sedan', 'coupe', 'wagon', 'hatchback', 'roadster', 'convertible', 'classic', 'diesel', 'petrol', 'turbo', 'competition', 'performance']);

export const fold = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').toLowerCase();
const clean = (s) => fold(s).replace(/[_()[\],.]/g, ' ').replace(/\s+/g, ' ').trim();
const hasWord = (text, word) => new RegExp(`(^|[^a-z0-9])${word.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}($|[^a-z0-9])`).test(text);
const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim().slice(0, 90);
const isFree = (license = '') => /^(cc0|cc[ -]by|public domain|pd\b|attribution)/i.test(license) && !/\b(nc|nd)\b/i.test(license);

function identity(vehicle) {
  const code = (vehicle.name.match(/\(([^)]+)\)/) || [])[1];
  // Engine sizes such as "1.6" or "3.3D" describe a variant and rarely appear in photo names.
  const base = clean(vehicle.name.replace(/\([^)]*\)/g, ' ').replace(/\b\d\.\d\w*/g, ' '));
  const brandWords = clean(vehicle.brand).split(' ');
  const words = base.split(' ').filter((w) => !brandWords.includes(w));
  const useful = words.filter((w) => !STOP_WORDS.has(w) && (w.length >= 2 || /\d/.test(w)));
  // Numbered variants must match too, so a "Panigale V4" never shows a "1199 Panigale".
  const variants = useful.slice(1).filter((w) => w.length >= 2 && /\d/.test(w) && !w.includes('-'));
  return { brand: brandWords[0], code: code && !/^\d{4}$/.test(code) ? clean(code) : '', key: useful[0] || '', variants, phrase: words.join(' ') };
}

export function acceptsTitle(title, vehicle, view) {
  const text = clean(title.replace(/^File:/, '').replace(/\.[a-z]+$/i, ''));
  const id = identity(vehicle);
  if (REJECT.test(text) || /(^|[^a-z0-9])e-[a-z]/.test(text)) return null;
  if (view === 'exterior' ? NOT_EXTERIOR.test(text) : !VIEW_RE[view].test(text)) return null;
  // A file tagged as both engine and interior cannot be trusted for either tab.
  if ((view === 'engine' && VIEW_RE.interior.test(text)) || ((view === 'interior' || view === 'cockpit') && /\bengine\b/.test(text))) return null;
  // Model names such as "M3" must appear; a brand is also required unless the model token is distinctive.
  const hasBrand = hasWord(text, id.brand);
  const hasCode = !!id.code && hasWord(text, id.code);
  const hasKey = id.key ? hasWord(text, id.key) : !!id.phrase && text.includes(id.phrase);
  if (!(hasKey || hasCode) || !(hasBrand || (hasCode && hasKey))) return null;
  if (id.variants.some((v) => !hasWord(text, v))) return null;
  let score = (hasCode ? 5 : 0) + (hasKey ? 2 : 0);
  const years = (text.match(/\b(18|19|20)\d{2}\b/g) || []).map(Number);
  const end = vehicle.end || new Date().getFullYear();
  const yearFits = !!vehicle.start && years.some((y) => y >= vehicle.start - 1 && y <= end + 1);
  if (vehicle.start && years.length && !yearFits) return null;
  if (yearFits) score += 3;
  if (id.code) {
    // Chassis-coded models (G80, E39, R34...) must prove the right generation.
    const chassis = text.match(/\b(mk ?\d+|[efgrw]\d{2,3})\b/g) || [];
    if (chassis.some((c) => c !== id.code)) return null;
    if (!hasCode && !yearFits) return null;
  }
  return score;
}

const cacheKey = (vehicle, view) => `vexa.photo.v1.${view}.${fold(vehicle.brand)}.${fold(vehicle.name)}`;
function readCache(key) {
  try {
    const item = JSON.parse(localStorage.getItem(key));
    return item && Date.now() - item.at < CACHE_DAYS * 86400000 ? item.photos : null;
  } catch { return null; }
}
function writeCache(key, photos) {
  try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), photos })); } catch {}
}

const running = new Map();

// Busy or rate-limited answers are retried and never cached as "no photo".
async function fetchWithRetry(url, headers) {
  let lastError;
  for (const wait of [0, 1500, 4000]) {
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    try {
      const res = await fetch(url, { headers });
      if (res.status === 429 || res.status >= 500) { lastError = new Error(`HTTP ${res.status}`); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.error) return data;
      lastError = new Error(data.error.code || 'api error');
      if (!/busy|ratelimit|maxlag/i.test(data.error.code || '')) break;
    } catch (error) { lastError = error; }
  }
  throw lastError;
}

export function searchPhotos(vehicle, view, options = {}) {
  const key = cacheKey(vehicle, view);
  const cached = readCache(key);
  if (cached) return Promise.resolve(cached);
  if (running.has(key)) return running.get(key);
  const job = (async () => {
    const id = identity(vehicle);
    const modelText = [id.key || id.phrase, ...id.variants].join(' ');
    const queries = [];
    if (id.code) queries.push(`${vehicle.brand} ${modelText} ${id.code} ${SEARCH_WORDS[view][0]}`);
    SEARCH_WORDS[view].forEach((word) => queries.push(`${vehicle.brand} ${modelText} ${word}`));
    let photos = [];
    for (const query of queries.slice(0, 3)) {
      const params = new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', action: 'query', generator: 'search', gsrnamespace: '6', gsrlimit: '40', gsrsearch: `${query} filetype:bitmap`.replace(/\s+/g, ' '), prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '960' });
      const data = await fetchWithRetry(`${API}?${params}`, options.headers);
      photos = (data.query?.pages || [])
        .filter((p) => p.imageinfo?.[0]?.thumburl && /\.jpe?g$/i.test(p.title))
        .map((p) => ({ page: p, info: p.imageinfo[0], score: acceptsTitle(p.title, vehicle, view) }))
        .filter(({ info, score }) => score !== null && info.width >= 640 && isFree(info.extmetadata?.LicenseShortName?.value))
        .sort((a, b) => b.score - a.score || a.page.index - b.page.index)
        .slice(0, 4)
        .map(({ page, info }) => ({ src: info.thumburl, title: page.title.replace(/^File:/, ''), author: stripHtml(info.extmetadata?.Artist?.value) || 'Wikimedia Commons', license: info.extmetadata.LicenseShortName.value, url: info.descriptionurl }));
      if (photos.length) break;
    }
    writeCache(key, photos);
    return photos;
  })().finally(() => running.delete(key));
  running.set(key, job);
  return job;
}

export const PHOTO_UI = {
  en: { tab_cockpit: 'Cockpit', photoSearching: 'Searching for photos of this model…', noKindPhoto: 'No verified photo of this view was found for this exact model.', photoError: 'Photos could not be loaded. Check your internet connection.' },
  tr: { tab_cockpit: 'Kokpit', photoSearching: 'Bu modelin fotoğrafları aranıyor…', noKindPhoto: 'Tam bu modele ait, bu görünümü gösteren doğrulanmış fotoğraf bulunamadı.', photoError: 'Fotoğraflar yüklenemedi. İnternet bağlantını kontrol et.' },
  de: { tab_cockpit: 'Cockpit', photoSearching: 'Fotos dieses Modells werden gesucht…', noKindPhoto: 'Für genau dieses Modell wurde kein geprüftes Foto dieser Ansicht gefunden.', photoError: 'Fotos konnten nicht geladen werden. Prüfe deine Internetverbindung.' },
  fr: { tab_cockpit: 'Poste de pilotage', photoSearching: 'Recherche de photos de ce modèle…', noKindPhoto: 'Aucune photo vérifiée de cette vue pour ce modèle précis.', photoError: 'Impossible de charger les photos. Vérifiez votre connexion.' },
  es: { tab_cockpit: 'Cabina', photoSearching: 'Buscando fotos de este modelo…', noKindPhoto: 'No se encontró una foto verificada de esta vista para este modelo exacto.', photoError: 'No se pudieron cargar las fotos. Revisa tu conexión.' },
  it: { tab_cockpit: 'Cockpit', photoSearching: 'Ricerca foto di questo modello…', noKindPhoto: 'Nessuna foto verificata di questa vista per questo modello esatto.', photoError: 'Impossibile caricare le foto. Controlla la connessione.' },
  pt: { tab_cockpit: 'Cockpit', photoSearching: 'Buscando fotos deste modelo…', noKindPhoto: 'Nenhuma foto verificada desta vista foi encontrada para este modelo exato.', photoError: 'Não foi possível carregar as fotos. Verifique sua conexão.' },
  ru: { tab_cockpit: 'Кокпит', photoSearching: 'Поиск фотографий этой модели…', noKindPhoto: 'Проверенное фото этого вида для данной модели не найдено.', photoError: 'Не удалось загрузить фото. Проверьте интернет.' },
  ar: { tab_cockpit: 'قمرة القيادة', photoSearching: 'جارٍ البحث عن صور هذا الطراز…', noKindPhoto: 'لم يُعثر على صورة موثقة لهذا المنظر لهذا الطراز بالتحديد.', photoError: 'تعذر تحميل الصور. تحقق من اتصالك بالإنترنت.' },
  zh: { tab_cockpit: '驾驶舱', photoSearching: '正在搜索该车型的照片…', noKindPhoto: '未找到该车型此视角的已验证照片。', photoError: '照片加载失败，请检查网络连接。' },
  ja: { tab_cockpit: 'コックピット', photoSearching: 'このモデルの写真を検索中…', noKindPhoto: 'このモデルのこの視点の確認済み写真は見つかりませんでした。', photoError: '写真を読み込めませんでした。インターネット接続を確認してください。' },
};
