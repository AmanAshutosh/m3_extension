/* ============================================================
   MOH MAYA MEDIA — search.js
   Center search bar + global command palette (Ctrl/Cmd + K)
   ============================================================ */

'use strict';

/* ── CENTER SEARCH BAR ── */
const Search = (() => {
  const ENGINES = {
    Google:     q => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    Bing:       q => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    DuckDuckGo: q => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
    Brave:      q => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
    Perplexity: q => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`,
  };
  let engine = 'Google';

  function init() {
    const inp = document.getElementById('s-inp');
    const eng = document.getElementById('search-eng');
    if (!inp) return;

    /* Restore last used engine */
    const saved = MohMayaMediaState.get('lastSearchEngine');
    if (saved && ENGINES[saved]) { engine = saved; if (eng) eng.textContent = engine; }

    inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || !inp.value.trim()) return;
      const q      = inp.value.trim();
      const target = MohMayaMediaState.get('openInNewTab') !== false ? '_blank' : '_self';
      const isURL  = /^https?:\/\//i.test(q) || /^[\w-]+\.[a-z]{2,}/i.test(q);
      window.open(isURL ? (/^https?:\/\//i.test(q) ? q : 'https://' + q) : ENGINES[engine](q), target);
      inp.value = '';
    });

    if (eng) {
      eng.addEventListener('click', () => {
        const keys = Object.keys(ENGINES);
        engine = keys[(keys.indexOf(engine) + 1) % keys.length];
        eng.textContent = engine;
        MohMayaMediaState.set('lastSearchEngine', engine);
      });
    }
  }

  return { init };
})();


/* ── COMMAND PALETTE ── */
const CommandPalette = (() => {
  let isOpen = false;
  let items  = [];
  let selIdx = -1;

  const QUICK_ACTIONS = [
    { icon: 'ti-bookmark', label: 'Bookmarks',    sub: 'Open bookmarks panel',     type: 'panel',  fn: () => Panels.toggle('bookmarks') },
    { icon: 'ti-check',    label: 'To-Do',         sub: 'Open tasks panel',         type: 'panel',  fn: () => Panels.toggle('todo')      },
    { icon: 'ti-note',     label: 'Notes',          sub: 'Open sticky notes',        type: 'panel',  fn: () => Panels.toggle('notes')     },
    { icon: 'ti-cloud',    label: 'Weather',        sub: 'Open weather panel',       type: 'panel',  fn: () => Panels.toggle('weather')   },
    { icon: 'ti-clock',    label: 'Focus Timer',    sub: 'Start a Pomodoro session', type: 'panel',  fn: () => Panels.toggle('focus')     },
    { icon: 'ti-cpu',      label: 'AI Hub',         sub: 'Open AI tools',            type: 'panel',  fn: () => Panels.toggle('ai')        },
    { icon: 'ti-photo',    label: 'Wallpaper',      sub: 'Change background',        type: 'panel',  fn: () => Panels.toggle('wallpaper') },
    { icon: 'ti-settings', label: 'Settings',       sub: 'Extension settings',       type: 'panel',  fn: () => Panels.toggle('settings')  },
    { icon: 'ti-moon',     label: 'Toggle Theme',   sub: 'Switch dark / light mode', type: 'action', fn: () => Settings.toggleTheme()     },
  ];

  /* ── OPEN / CLOSE ── */
  function open() {
    const el = document.getElementById('cmd-palette');
    if (!el) return;
    el.style.display = 'flex';
    isOpen = true;
    const inp = document.getElementById('cmd-inp');
    if (inp) { inp.value = ''; inp.focus(); }
    _showQuickActions();
  }

  function close() {
    const el = document.getElementById('cmd-palette');
    if (!el) return;
    el.style.display = 'none';
    isOpen = false;
    selIdx = -1;
    items  = [];
  }

  function toggle() { isOpen ? close() : open(); }

  /* ── SEARCH ── */
  async function search(q) {
    q = q.trim().toLowerCase();
    if (!q) { _showQuickActions(); return; }

    const found = [];

    /* Bookmarks — custom + defaults */
    const custom   = (await MohMayaMediaState.get('customBookmarks')) || [];
    const defaults = Object.values(DEFAULT_BOOKMARKS).flat();
    const seen     = new Set();
    [...custom, ...defaults].forEach(b => {
      if (!b.u || seen.has(b.u)) return;
      seen.add(b.u);
      if (b.n.toLowerCase().includes(q) || b.u.toLowerCase().includes(q)) {
        found.push({
          icon: 'ti-bookmark', label: b.n, sub: b.u, type: 'bookmark',
          fn: () => window.open(b.u, MohMayaMediaState.get('openInNewTab') !== false ? '_blank' : '_self'),
        });
      }
    });

    /* To-Do tasks */
    const todos = (await MohMayaMediaState.get('todos')) || [];
    todos.filter(t => t.text.toLowerCase().includes(q)).forEach(t =>
      found.push({
        icon: t.done ? 'ti-circle-check' : 'ti-check',
        label: t.text, sub: t.done ? 'Completed' : `Priority: ${t.priority}`,
        type: 'task', fn: () => Panels.toggle('todo'),
      })
    );

    /* Notes */
    const notes = (await MohMayaMediaState.get('notes')) || '';
    if (notes.toLowerCase().includes(q)) {
      found.push({
        icon: 'ti-note', label: 'Notes contain match',
        sub: notes.slice(0, 80) + (notes.length > 80 ? '…' : ''),
        type: 'note', fn: () => Panels.toggle('notes'),
      });
    }

    /* AI tools */
    AI_TOOLS.filter(a => a.n.toLowerCase().includes(q) || a.t.toLowerCase().includes(q))
      .forEach(a => found.push({
        icon: 'ti-cpu', label: a.n, sub: a.t, type: 'ai',
        fn: () => window.open(a.u, '_blank'),
      }));

    items  = found;
    selIdx = found.length ? 0 : -1;
    _renderResults(found.length ? found : null, q);
  }

  /* ── RENDER ── */
  function _showQuickActions() {
    items  = QUICK_ACTIONS;
    selIdx = -1;
    _renderResults(QUICK_ACTIONS);
  }

  function _renderResults(list, query) {
    const el = document.getElementById('cmd-results');
    if (!el) return;
    if (!list) {
      el.innerHTML = `<div class="cmd-empty">No results for "<strong>${_esc(query)}</strong>"</div>`;
      return;
    }
    el.innerHTML = list.map((r, i) => `
      <div class="cmd-result${i === selIdx ? ' sel' : ''}" data-idx="${i}">
        <i class="ti ${r.icon}"></i>
        <div class="cmd-result-info">
          <div class="cmd-result-label">${_esc(r.label)}</div>
          ${r.sub ? `<div class="cmd-result-sub">${_esc(r.sub)}</div>` : ''}
        </div>
        <span class="cmd-result-type">${_esc(r.type || 'action')}</span>
      </div>`).join('');
  }

  function _highlight(idx) {
    document.querySelectorAll('.cmd-result').forEach((el, i) =>
      el.classList.toggle('sel', i === idx));
    selIdx = idx;
  }

  function _run(idx) {
    if (idx >= 0 && items[idx]) { items[idx].fn?.(); close(); }
  }

  /* ── INIT ── */
  function init() {
    const inp     = document.getElementById('cmd-inp');
    const results = document.getElementById('cmd-results');
    const palette = document.getElementById('cmd-palette');

    if (inp) {
      inp.addEventListener('input',   e => search(e.target.value));
      inp.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); _highlight(Math.min(selIdx + 1, items.length - 1)); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); _highlight(Math.max(selIdx - 1, 0)); }
        if (e.key === 'Enter')     { e.preventDefault(); _run(selIdx >= 0 ? selIdx : 0); }
        if (e.key === 'Escape')    { close(); }
      });
    }

    if (results) {
      results.addEventListener('click', e => {
        const row = e.target.closest('.cmd-result');
        if (row) _run(+row.dataset.idx);
      });
      results.addEventListener('mousemove', e => {
        const row = e.target.closest('.cmd-result');
        if (row && +row.dataset.idx !== selIdx) _highlight(+row.dataset.idx);
      });
    }

    if (palette) {
      palette.addEventListener('click', e => {
        if (e.target === palette || e.target.classList.contains('cmd-backdrop')) close();
      });
    }
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { init, open, close, toggle };
})();
