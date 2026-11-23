'use strict';
/* Vexa automatic updates via GitHub Releases | Made by Tv Man
   The installed Windows app checks at startup and every 4 hours, downloads in the background,
   and installs when the user presses Restart or quits the app. */
const { app, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let state = { state: 'idle', version: null, percent: 0, error: '', notes: '' };
let getWin = () => null;
let updater = null;

const status = () => ({ ...state, current: app.getVersion(), enabled: !!updater });
function set(patch) {
  state = { ...state, ...patch };
  const win = getWin();
  if (win && !win.isDestroyed()) win.webContents.send('update-state', status());
}

function errorCode(err) {
  const message = String((err && err.message) || err);
  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|net::ERR/i.test(message)) return 'network';
  if (/404|No published versions|Cannot find latest/i.test(message)) return 'norelease';
  if (/sha512 checksum mismatch/i.test(message)) return 'corrupt';
  return 'other';
}

function notesText(notes) {
  const text = Array.isArray(notes) ? notes.map((n) => (n && n.note) || '').join('\n') : String(notes || '');
  return text.replace(/<li[^>]*>/gi, '\n• ').replace(/<br\s*\/?>|<\/p>|<\/h\d>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 30).join('\n');
}

function setup() {
  // macOS self-update requires a paid code signature, so only the packaged Windows app updates itself.
  if (process.platform !== 'win32' || !app.isPackaged) return;
  if (!fs.existsSync(path.join(process.resourcesPath, 'app-update.yml'))) return;
  ({ autoUpdater: updater } = require('electron-updater'));
  updater.autoDownload = true;
  updater.autoInstallOnAppQuit = true;
  updater.allowPrerelease = false;
  updater.logger = null;
  updater.on('checking-for-update', () => set({ state: 'checking', error: '' }));
  updater.on('update-available', (info) => set({ state: 'downloading', version: info.version, percent: 0 }));
  updater.on('update-not-available', () => set({ state: 'none' }));
  updater.on('download-progress', (p) => set({ state: 'downloading', percent: Math.round(p.percent || 0) }));
  updater.on('update-downloaded', (info) => set({ state: 'downloaded', version: info.version, percent: 100, notes: notesText(info.releaseNotes) }));
  updater.on('error', (err) => set({ state: 'error', error: errorCode(err) }));
  const check = () => updater.checkForUpdates().catch(() => {});
  setTimeout(check, 8000);
  setInterval(check, 4 * 60 * 60 * 1000).unref();
}

function registerUpdater(winGetter) {
  getWin = winGetter;
  setup();
  ipcMain.handle('update-status', () => status());
  ipcMain.handle('update-check', async () => {
    if (!updater) return { ok: false };
    if (state.state === 'downloading' || state.state === 'downloaded') return { ok: true };
    try { await updater.checkForUpdates(); return { ok: true }; } catch (err) { set({ state: 'error', error: errorCode(err) }); return { ok: false }; }
  });
  ipcMain.handle('update-install', () => {
    if (!updater || state.state !== 'downloaded') return { ok: false };
    setImmediate(() => updater.quitAndInstall(true, true));
    return { ok: true };
  });
}

module.exports = { registerUpdater };
