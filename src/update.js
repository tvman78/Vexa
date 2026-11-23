import { Capacitor } from '@capacitor/core';

export const APP_VERSION = __APP_VERSION__;
export const RELEASES_URL = 'https://github.com/tvman78/Vexa/releases/latest';
const LATEST_API = 'https://api.github.com/repos/tvman78/Vexa/releases/latest';

export const desktopUpdater = () => window.vexa?.update || null;

function platformAsset() {
  const platform = Capacitor.getPlatform();
  if (platform === 'android') return /\.apk$/i;
  if (platform === 'ios') return /\.ipa$/i;
  if (/Mac/i.test(navigator.platform || '')) return /\.dmg$/i;
  return /Setup.*\.exe$/i;
}

export function isNewer(latest, current) {
  const a = latest.replace(/^v/, '').split('.').map(Number);
  const b = current.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  }
  return false;
}

// Android, iOS and unsigned macOS cannot replace themselves, so they get a direct download link.
export async function checkLatest() {
  const res = await fetch(LATEST_API, { headers: { Accept: 'application/vnd.github+json' } });
  if (res.status === 404) return { error: 'norelease' };
  if (!res.ok) return { error: 'network' };
  const release = await res.json();
  const version = String(release.tag_name || '').replace(/^v/, '');
  const asset = (release.assets || []).find((a) => platformAsset().test(a.name));
  return { version, newer: isNewer(version, APP_VERSION), url: asset?.browser_download_url || release.html_url, notes: release.body || '' };
}
