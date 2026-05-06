/* ============================================================
   MOH MAYA MEDIA — storage.js
   Chrome storage API wrapper + IndexedDB for large media blobs
   ============================================================ */

'use strict';

/* ── CHROME STORAGE WRAPPER ── */
const Store = (() => {
  const ok = typeof chrome !== 'undefined' && chrome.storage;

  async function get(key) {
    if (ok) return new Promise(r => chrome.storage.local.get([key], res => r(res[key] ?? null)));
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }

  async function set(key, value) {
    if (ok) return new Promise(r => chrome.storage.local.set({ [key]: value }, r));
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  async function remove(key) {
    if (ok) return new Promise(r => chrome.storage.local.remove([key], r));
    localStorage.removeItem(key);
  }

  async function getAll() {
    if (ok) return new Promise(r => chrome.storage.local.get(null, r));
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      try { out[k] = JSON.parse(localStorage.getItem(k)); } catch {}
    }
    return out;
  }

  return { get, set, remove, getAll };
})();


/* ── INDEXED-DB (large media blobs: wallpaper images/videos) ── */
const IDB = (() => {
  let _db = null;

  async function _open() {
    if (_db) return _db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('mmm_media', 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore('blobs', { keyPath: 'key' });
      req.onsuccess = e => { _db = e.target.result; resolve(_db); };
      req.onerror   = () => reject(req.error);
    });
  }

  async function set(key, value) {
    try {
      const db = await _open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('blobs', 'readwrite');
        tx.objectStore('blobs').put({ key, value });
        tx.oncomplete = resolve;
        tx.onerror    = () => reject(tx.error);
      });
    } catch (e) { console.warn('[IDB] set failed:', e); }
  }

  async function get(key) {
    try {
      const db = await _open();
      return new Promise((resolve, reject) => {
        const tx  = db.transaction('blobs', 'readonly');
        const req = tx.objectStore('blobs').get(key);
        req.onsuccess = () => resolve(req.result?.value ?? null);
        req.onerror   = () => reject(req.error);
      });
    } catch { return null; }
  }

  async function remove(key) {
    try {
      const db = await _open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('blobs', 'readwrite');
        tx.objectStore('blobs').delete(key);
        tx.oncomplete = resolve;
        tx.onerror    = () => reject(tx.error);
      });
    } catch {}
  }

  return { set, get, remove };
})();


/* ── APP STATE ── */
const MohMayaMediaState = (() => {
  const DEFAULTS = {
    todos:            [],
    notes:            '',
    accents:          ACCENT_PALETTES[0].colors,
    glassIntensity:   5,
    is24h:            false,
    isDark:           true,
    showStats:        true,
    showQuote:        true,
    showSearch:       true,
    wpBlur:           0,
    wpDim:            22,
    wpType:           'preset',
    wpPresetIdx:      0,
    wpColor:          '#0b0818',
    focusScore:       0,
    streak:           0,
    lastActiveDate:   '',
    nextTodoId:       1,
    customBookmarks:  [],
    /* user preferences */
    userName:         '',
    isCelsius:        true,
    openInNewTab:     true,
    lastSearchEngine: 'Google',
    /* timer */
    timerSessions:    null,
    /* weather cache */
    weatherCache:     null,
    weatherCacheTime: 0,
  };

  let state = { ...DEFAULTS };

  async function load() {
    const stored = await Store.getAll();
    Object.keys(DEFAULTS).forEach(k => {
      if (stored[k] !== undefined && stored[k] !== null) state[k] = stored[k];
    });
    return state;
  }

  function get(key)  { return state[key]; }
  function getAll()  { return { ...state }; }

  async function set(key, value) {
    state[key] = value;
    await Store.set(key, value);
  }

  async function patch(partial) {
    Object.assign(state, partial);
    for (const [k, v] of Object.entries(partial)) await Store.set(k, v);
  }

  return { load, get, getAll, set, patch };
})();
