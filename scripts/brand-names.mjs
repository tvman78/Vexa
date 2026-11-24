// Shared brand-name cleanup for the catalog and logo scripts.
const ALIASES = { 'birmingham small arms company': 'BSA', 'kwang yang motor': 'KYMCO', 'kawasaki heavy industries': 'Kawasaki', 'bayerische motoren werke': 'BMW', 'bmw motorrad': 'BMW', 'mercedes-benz group': 'Mercedes-Benz', 'daimler-benz': 'Mercedes-Benz', 'fiat automobiles': 'Fiat', 'ferrari n.v.': 'Ferrari' };
const COMPANY_SUFFIX = /\s+(motor cars|motor company|motor corporation|motor co\.?|motorcycle company|motorcycles|motorcycle|motors?|automobiles?|automobili|cars|ag|s\.?p\.?a\.?|gmbh|ltd\.?|limited|inc\.?|corporation|company|group|n\.v\.)$/i;

export function canonicalBrand(name) {
  const alias = ALIASES[name.toLowerCase()];
  if (alias) return alias;
  if (/^(general|american|british|united) motors?/i.test(name)) return name;
  let out = name.replace(/,/g, '').trim();
  for (let next = out.replace(COMPANY_SUFFIX, ''); next !== out && next.length >= 2; next = out.replace(COMPANY_SUFFIX, '')) out = next;
  return ALIASES[out.toLowerCase()] || out;
}

export const foldBrand = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
