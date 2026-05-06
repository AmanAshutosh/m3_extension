/* ============================================================
   MOH MAYA MEDIA — todo.js
   Tasks: add (Enter key), toggle, delete, priority selector,
   filters, persistent storage, live stats update.
   ============================================================ */

'use strict';

const Todo = (() => {
  let todos  = [];
  let filter = 'all';
  let nextId = 1;

  /* ── LOAD ── */
  async function load() {
    todos  = (await MohMayaMediaState.get('todos'))      || [];
    nextId = (await MohMayaMediaState.get('nextTodoId')) || todos.length + 1;
  }

  async function _save() {
    await MohMayaMediaState.patch({ todos, nextTodoId: nextId });
    _updateStats();
  }

  /* ── CRUD ── */
  async function add() {
    const inp = document.getElementById('td-inp');
    if (!inp || !inp.value.trim()) return;

    /* Read priority from selector (if present) */
    const priEl = document.getElementById('td-pri');
    const pri   = priEl ? priEl.value : 'med';

    todos.unshift({ id: nextId++, text: inp.value.trim(), done: false, priority: pri });
    inp.value = '';
    if (priEl) priEl.value = 'med';
    await _save();
    render();
  }

  async function toggleDone(id) {
    const t = todos.find(x => x.id === id);
    if (t) t.done = !t.done;
    await _save();
    render();
  }

  async function remove(id) {
    todos = todos.filter(x => x.id !== id);
    await _save();
    render();
  }

  /* ── FILTERS ── */
  function setFilter(f) {
    filter = f;
    document.querySelectorAll('.todo-filter').forEach(el =>
      el.classList.toggle('on', el.dataset.filter === f));
    render();
  }

  function _filtered() {
    if (filter === 'active') return todos.filter(t => !t.done);
    if (filter === 'done')   return todos.filter(t =>  t.done);
    return todos;
  }

  /* ── RENDER ── */
  function render() {
    const list  = document.getElementById('td-list');
    const empty = document.getElementById('td-empty');
    if (!list) return;

    const items = _filtered();

    if (empty) empty.style.display = items.length ? 'none' : '';
    if (!items.length) { list.innerHTML = ''; return; }

    list.innerHTML = items.map(t => `
      <div class="td-item${t.done ? ' done' : ''}" data-id="${t.id}">
        <div class="td-chk" onclick="Todo.toggleDone(${t.id})">${t.done ? '✓' : ''}</div>
        <span class="td-txt">${_esc(t.text)}</span>
        <select class="td-pri-sel p-${t.priority}" onchange="Todo.setPriority(${t.id},this.value)">
          <option value="high"${t.priority==='high'?' selected':''}>high</option>
          <option value="med"${t.priority==='med'?' selected':''}>med</option>
          <option value="low"${t.priority==='low'?' selected':''}>low</option>
        </select>
        <span class="td-del ti ti-trash" onclick="Todo.remove(${t.id})" title="Delete"></span>
      </div>`).join('');

    _wireFilters();
  }

  function _wireFilters() {
    const el = document.getElementById('td-filters');
    if (!el || el._wired) return;
    el._wired = true;
    el.addEventListener('click', e => {
      const btn = e.target.closest('.todo-filter');
      if (btn) setFilter(btn.dataset.filter);
    });
  }

  function _wireInput() {
    const inp = document.getElementById('td-inp');
    if (!inp || inp._tdWired) return;
    inp._tdWired = true;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
  }

  /* ── PRIORITY CHANGE ── */
  async function setPriority(id, pri) {
    const t = todos.find(x => x.id === id);
    if (t) t.priority = pri;
    await _save();
    /* Re-render just the item's select colour */
    document.querySelectorAll('.td-pri-sel').forEach(el => {
      const itemEl = el.closest('.td-item');
      if (itemEl && +itemEl.dataset.id === id) {
        el.className = `td-pri-sel p-${pri}`;
      }
    });
  }

  /* ── STATS ── */
  function _updateStats() {
    const done = todos.filter(t => t.done).length;
    const el   = document.getElementById('stat-tasks');
    if (el) el.textContent = done;
  }

  /* ── INIT ── */
  function init() {
    render();
    _wireFilters();
    _wireInput();
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { load, add, toggleDone, remove, setPriority, render, init, updateStats: _updateStats };
})();
