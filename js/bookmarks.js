/* ============================================================
   MOH MAYA MEDIA — bookmarks.js
   Chrome Bookmarks API integration with fallback to static data.
   Shows real browser bookmarks organised by folder, plus
   custom bookmarks persisted in Chrome Storage.
   ============================================================ */

'use strict';

const Bookmarks = (() => {
  let currentCat      = 'All';
  let customBookmarks = [];
  let chromeBkm       = [];   // flat list from Chrome API
  let chromeCats      = [];   // folder names as categories
  let useChrome       = false;
  let searchQuery     = '';

  /* ── LOAD ── */
  async function loadCustom() {
    customBookmarks = (await MohMayaMediaState.get('customBookmarks')) || [];
    await _loadChrome();
  }

  async function _loadChrome() {
    if (typeof chrome === 'undefined' || !chrome.bookmarks) { useChrome = false; return; }
    try {
      const tree  = await new Promise(r => chrome.bookmarks.getTree(r));
      const items = [];
      const fSet  = new Set();

      function walk(node, folderName) {
        if (node.url) {
          items.push({ n: node.title || _hostname(node.url), u: node.url, id: node.id, cat: folderName || 'All' });
        }
        if (node.children) {
          const fname = node.title || '';
          const SKIP  = ['', 'Bookmarks bar', 'Other bookmarks', 'Mobile bookmarks', 'Managed bookmarks'];
          if (fname && !SKIP.includes(fname)) fSet.add(fname);
          node.children.forEach(c => walk(c, fname || folderName || 'All'));
        }
      }
      tree.forEach(n => walk(n, 'All'));

      chromeBkm  = items;
      chromeCats = ['All', ...Array.from(fSet).slice(0, 12)];
      useChrome  = items.length > 0;
    } catch (e) {
      console.warn('[Bookmarks] Chrome API failed:', e);
      useChrome = false;
    }
  }

  /* ── RENDER ── */
  function render(cat) {
    if (cat !== undefined) currentCat = cat;
    _renderCats();
    _renderGrid();
    _wireSearch();
    _wireAdd();
  }

  function _renderCats() {
    const el = document.getElementById('bm-cats');
    if (!el) return;
    const cats = useChrome ? chromeCats : Object.keys(DEFAULT_BOOKMARKS);
    el.innerHTML = cats.map(c =>
      `<div class="bm-cat${c === currentCat ? ' on' : ''}" data-cat="${_escAttr(c)}">${_esc(c)}</div>`
    ).join('');

    /* Event delegation — one listener survives re-renders */
    if (!el._catWired) {
      el._catWired = true;
      el.addEventListener('click', e => {
        const cat = e.target.closest('.bm-cat');
        if (cat) render(cat.dataset.cat);
      });
    }
  }

  function _renderGrid() {
    const el = document.getElementById('bm-grid');
    if (!el) return;

    let base = useChrome
      ? (currentCat === 'All' ? chromeBkm : chromeBkm.filter(b => b.cat === currentCat))
      : [...(DEFAULT_BOOKMARKS[currentCat] || DEFAULT_BOOKMARKS.All)];

    const customInCat = customBookmarks.filter(b => currentCat === 'All' || b.cat === currentCat);
    let items = [...customInCat, ...base];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(b => b.n.toLowerCase().includes(q) || (b.u || '').toLowerCase().includes(q));
    }

    if (!items.length) {
      el.innerHTML = `<div style="text-align:center;padding:20px 0;color:var(--text3);font-size:12px;grid-column:span 3">No bookmarks found</div>`;
      return;
    }

    el.innerHTML = items.slice(0, 18).map((b, idx) => {
      const isCustom = idx < customInCat.length;
      return `
        <div class="bm-card" data-url="${_escAttr(b.u)}" title="${_escAttr(b.n)}" role="link" tabindex="0">
          <div class="bm-card-ico">${b.i || _faviconImg(b.u) || _defaultIcon(b.n)}</div>
          <div class="bm-card-name">${_esc(b.n)}</div>
          ${isCustom ? `<div class="bm-card-del" data-custom-idx="${idx}" title="Remove">×</div>` : ''}
        </div>`;
    }).join('');

    /* Event delegation for card clicks & delete buttons */
    if (!el._bmWired) {
      el._bmWired = true;
      el.addEventListener('click', e => {
        const del  = e.target.closest('.bm-card-del');
        const card = e.target.closest('.bm-card');
        if (del) {
          e.stopPropagation();
          const realIdx = customBookmarks.indexOf(
            customInCat[+del.dataset.customIdx]
          );
          if (realIdx >= 0) deleteCustom(realIdx);
          return;
        }
        if (card && card.dataset.url) {
          const target = MohMayaMediaState.get('openInNewTab') !== false ? '_blank' : '_self';
          window.open(card.dataset.url, target);
        }
      });
    }
  }

  function _wireSearch() {
    const inp = document.getElementById('bm-srch');
    if (!inp || inp._bsWired) return;
    inp._bsWired = true;
    inp.addEventListener('input', e => { searchQuery = e.target.value; _renderGrid(); });
  }

  function _wireAdd() {
    const nameInp = document.getElementById('bm-add-name');
    const urlInp  = document.getElementById('bm-add-url');
    const addBtn  = document.getElementById('bm-add-btn');
    if (!nameInp || nameInp._addWired) return;
    nameInp._addWired = true;
    [nameInp, urlInp].forEach(inp => {
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') addCustom(); });
    });
    if (addBtn) addBtn.addEventListener('click', () => addCustom());
  }

  /* ── ADD / DELETE CUSTOM ── */
  async function addCustom() {
    const nameEl = document.getElementById('bm-add-name');
    const urlEl  = document.getElementById('bm-add-url');
    if (!nameEl || !urlEl) return;
    const name = nameEl.value.trim();
    let   url  = urlEl.value.trim();
    if (!name || !url) { showToast('Enter a name and URL', 'info'); return; }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    customBookmarks.unshift({ n: name, u: url, cat: currentCat });
    await MohMayaMediaState.set('customBookmarks', customBookmarks);
    nameEl.value = '';
    urlEl.value  = '';
    _renderGrid();
    showToast('Bookmark added ✓');
  }

  async function deleteCustom(idx) {
    customBookmarks.splice(idx, 1);
    await MohMayaMediaState.set('customBookmarks', customBookmarks);
    _renderGrid();
    showToast('Bookmark removed', 'info');
  }

  /* ── HELPERS ── */
  function _faviconImg(url) {
    try {
      const host = new URL(url).hostname;
      return `<img src="https://www.google.com/s2/favicons?sz=32&domain=${host}" width="20" height="20" style="border-radius:4px" onerror="this.replaceWith('🔗')" />`;
    } catch { return null; }
  }

  function _defaultIcon(name) { return name?.[0]?.toUpperCase() || '?'; }
  function _hostname(url)     { try { return new URL(url).hostname; } catch { return url; } }
  function _esc(s)    { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function _escAttr(s){ return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  return { loadCustom, render, addCustom, deleteCustom };
})();
