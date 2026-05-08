/* ============================================================
   MOH MAYA MEDIA — bookmarks.js
   Mac-style app drawer: sections per category, favicon icons,
   search, custom bookmarks (add/delete).
   ============================================================ */

'use strict';

const Bookmarks = (() => {
  let currentCat      = 'All';
  let customBookmarks = [];
  let chromeBkm       = [];
  let chromeCats      = [];
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
    const cats = useChrome
      ? chromeCats
      : ['All', ...Object.keys(DEFAULT_BOOKMARKS).filter(k => k !== 'All')];
    el.innerHTML = cats.map(c =>
      `<div class="bm-cat${c === currentCat ? ' on' : ''}" data-cat="${_escAttr(c)}">${_esc(c)}</div>`
    ).join('');

    if (!el._catWired) {
      el._catWired = true;
      el.addEventListener('click', e => {
        const cat = e.target.closest('.bm-cat');
        if (cat) render(cat.dataset.cat);
      });
    }
  }

  /* ── GRID — sections when "All" + no search, flat grid otherwise ── */
  function _renderGrid() {
    const el = document.getElementById('bm-grid');
    if (!el) return;

    if (currentCat === 'All' && !searchQuery) {
      _renderSections(el);
      _wireGrid(el);
      return;
    }

    /* Flat filtered grid */
    let base = useChrome
      ? (currentCat === 'All' ? chromeBkm : chromeBkm.filter(b => b.cat === currentCat))
      : [...(DEFAULT_BOOKMARKS[currentCat] || DEFAULT_BOOKMARKS.All || [])];

    const customInCat = customBookmarks.filter(b =>
      currentCat === 'All' || b.cat === currentCat
    );
    let items = [...customInCat, ...base];

    /* Deduplicate by URL */
    const seen = new Set();
    items = items.filter(b => { if (seen.has(b.u)) return false; seen.add(b.u); return true; });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(b =>
        b.n.toLowerCase().includes(q) || (b.u || '').toLowerCase().includes(q)
      );
    }

    if (!items.length) {
      el.innerHTML = `<div class="bm-empty">No bookmarks found</div>`;
      _wireGrid(el);
      return;
    }

    el.innerHTML = `<div class="bm-app-grid">${
      items.slice(0, 30).map(b => {
        const cidx = customBookmarks.findIndex(cb => cb.u === b.u);
        return _cardHtml(b, cidx);
      }).join('')
    }</div>`;

    _wireGrid(el);
  }

  /* ── SECTIONED VIEW (All + no search) ── */
  function _renderSections(el) {
    let html = '';

    if (customBookmarks.length) {
      html += _sectionHtml('My Bookmarks',
        customBookmarks.slice(0, 24).map((b, i) => _cardHtml(b, i)).join('')
      );
    }

    if (useChrome) {
      chromeCats.filter(c => c !== 'All').forEach(cat => {
        const items = chromeBkm.filter(b => b.cat === cat).slice(0, 24);
        if (items.length)
          html += _sectionHtml(cat, items.map(b => _cardHtml(b, -1)).join(''));
      });
      const other = chromeBkm.filter(b => b.cat === 'All').slice(0, 24);
      if (other.length)
        html += _sectionHtml('Other', other.map(b => _cardHtml(b, -1)).join(''));
    } else {
      Object.keys(DEFAULT_BOOKMARKS).filter(k => k !== 'All').forEach(cat => {
        const items = DEFAULT_BOOKMARKS[cat] || [];
        if (items.length)
          html += _sectionHtml(cat, items.map(b => _cardHtml(b, -1)).join(''));
      });
    }

    el.innerHTML = html || `<div class="bm-empty">No bookmarks yet. Click + to add one.</div>`;
  }

  function _sectionHtml(title, cardsHtml) {
    return `<div class="bm-section">
      <div class="bm-section-hd">${_esc(title)}</div>
      <div class="bm-app-grid">${cardsHtml}</div>
    </div>`;
  }

  function _cardHtml(b, customIdx) {
    const isCustom = customIdx >= 0;
    return `<div class="bm-card" data-url="${_escAttr(b.u)}" title="${_escAttr(b.n)}" role="link" tabindex="0">
      <div class="bm-card-ico">${_faviconImg(b.u) || _defaultIcon(b.n)}</div>
      <div class="bm-card-name">${_esc(b.n)}</div>
      ${isCustom ? `<div class="bm-card-del" data-del-idx="${customIdx}" title="Remove">×</div>` : ''}
    </div>`;
  }

  /* One delegated listener on the grid container — survives innerHTML re-renders */
  function _wireGrid(el) {
    if (!el || el._bmWired) return;
    el._bmWired = true;
    el.addEventListener('click', e => {
      const del  = e.target.closest('.bm-card-del');
      const card = e.target.closest('.bm-card');
      if (del) {
        e.stopPropagation();
        const idx = +del.dataset.delIdx;
        if (!isNaN(idx) && idx >= 0) deleteCustom(idx);
        return;
      }
      if (card && card.dataset.url) {
        const target = MohMayaMediaState.get('openInNewTab') !== false ? '_blank' : '_self';
        window.open(card.dataset.url, target);
      }
    });
  }

  /* ── SEARCH ── */
  function _wireSearch() {
    const inp = document.getElementById('bm-srch');
    if (!inp || inp._bsWired) return;
    inp._bsWired = true;
    inp.addEventListener('input', e => { searchQuery = e.target.value; _renderGrid(); });
  }

  /* ── ADD FORM TOGGLE + ADD INPUTS ── */
  function _wireAdd() {
    const toggle  = document.getElementById('bm-add-toggle');
    const section = document.getElementById('bm-add-section');
    if (toggle && !toggle._wired) {
      toggle._wired = true;
      toggle.addEventListener('click', () => {
        if (!section) return;
        const hidden = section.style.display === 'none' || section.style.display === '';
        section.style.display = hidden ? 'block' : 'none';
      });
    }

    const nameInp = document.getElementById('bm-add-name');
    const urlInp  = document.getElementById('bm-add-url');
    const addBtn  = document.getElementById('bm-add-btn');
    if (!nameInp || nameInp._addWired) return;
    nameInp._addWired = true;
    [nameInp, urlInp].forEach(inp => {
      if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') addCustom(); });
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
      return `<img src="https://www.google.com/s2/favicons?sz=64&domain=${host}" alt="" class="bm-favicon" />`;
    } catch { return null; }
  }

  function _defaultIcon(name) { return name?.[0]?.toUpperCase() || '?'; }
  function _hostname(url)     { try { return new URL(url).hostname; } catch { return url; } }
  function _esc(s)    { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function _escAttr(s){ return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  return { loadCustom, render, addCustom, deleteCustom };
})();
