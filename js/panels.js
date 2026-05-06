/* ============================================================
   MOH MAYA MEDIA — panels.js
   Dock click handling, panel lifecycle, HTML templates.
   Weather uses live API; wallpaper zones support drag-and-drop.
   ============================================================ */

'use strict';

const Panels = (() => {
  let openPanel = null;

  /* ── PANEL HTML TEMPLATES ── */
  const TEMPLATES = {

    bookmarks: () => `
      <div class="panel-head">
        <span class="panel-title"><i class="ti ti-bookmark"></i> Bookmarks</span>
        <div class="panel-close" data-close="bookmarks"><i class="ti ti-x"></i></div>
      </div>
      <div class="panel-body">
        <div class="bm-search">
          <i class="ti ti-search"></i>
          <input type="text" id="bm-srch" placeholder="Search bookmarks…" autocomplete="off" />
        </div>
        <div class="bm-cats" id="bm-cats"></div>
        <div class="bm-grid" id="bm-grid"></div>
        <div class="bm-add-section">
          <div class="p-label">Add Bookmark</div>
          <div class="bm-add-row">
            <input type="text" id="bm-add-name" placeholder="Name"        class="bm-add-inp" />
            <input type="text" id="bm-add-url"  placeholder="https://…"   class="bm-add-inp" />
            <button class="bm-add-btn" onclick="Bookmarks.addCustom()"><i class="ti ti-plus"></i> Add</button>
          </div>
        </div>
      </div>`,

    todo: () => `
      <div class="panel-head">
        <span class="panel-title"><i class="ti ti-check"></i> To-Do</span>
        <div class="panel-close" data-close="todo"><i class="ti ti-x"></i></div>
      </div>
      <div class="panel-body">
        <div class="todo-add">
          <input type="text" id="td-inp" placeholder="New task… (Enter to add)" />
          <select id="td-pri" class="td-pri-new" title="Priority">
            <option value="high">high</option>
            <option value="med" selected>med</option>
            <option value="low">low</option>
          </select>
          <button class="todo-add-btn" onclick="Todo.add()" title="Add task"><i class="ti ti-plus"></i></button>
        </div>
        <div class="todo-filters" id="td-filters">
          <div class="todo-filter on" data-filter="all">All</div>
          <div class="todo-filter"    data-filter="active">Active</div>
          <div class="todo-filter"    data-filter="done">Done</div>
        </div>
        <div class="todo-list"  id="td-list"></div>
        <div class="todo-empty" id="td-empty" style="display:none">
          <i class="ti ti-circle-check" style="font-size:28px;color:var(--a5);display:block;margin-bottom:6px"></i>
          All done! 🎉
        </div>
      </div>`,

    weather: () => `
      <div class="panel-head">
        <span class="panel-title"><i class="ti ti-cloud"></i> Weather</span>
        <div style="display:flex;gap:6px;align-items:center">
          <div class="panel-close" id="weather-refresh" title="Refresh" style="cursor:pointer">
            <i class="ti ti-refresh"></i>
          </div>
          <div class="panel-close" data-close="weather"><i class="ti ti-x"></i></div>
        </div>
      </div>
      <div class="panel-body" id="weather-body">
        <div class="weather-loading">
          <div class="w-spin"></div>
          <span>Detecting location…</span>
        </div>
      </div>`,

    notes: () => `
      <div class="panel-head">
        <span class="panel-title"><i class="ti ti-note"></i> Notes</span>
        <div class="panel-close" data-close="notes"><i class="ti ti-x"></i></div>
      </div>
      <div class="panel-body">
        <textarea class="notes-ta" id="notes-ta" placeholder="Start typing… notes auto-save instantly"></textarea>
        <div class="notes-footer" id="notes-footer">Auto-saved</div>
      </div>`,

    focus: () => `
      <div class="panel-head">
        <span class="panel-title"><i class="ti ti-clock"></i> Focus Timer</span>
        <div class="panel-close" data-close="focus"><i class="ti ti-x"></i></div>
      </div>
      <div class="panel-body">
        <div class="timer-card">
          <div class="timer-mode" id="timer-mode">Pomodoro · 25 min</div>
          <div class="timer-display" id="timer-display">25:00</div>
          <div class="timer-progress"><div class="timer-progress-fill" id="timer-bar" style="width:100%"></div></div>
          <div class="timer-btns">
            <button class="timer-btn pri" id="timer-start-btn" onclick="Timer.toggle()">Start</button>
            <button class="timer-btn" onclick="Timer.reset()">Reset</button>
          </div>
        </div>
        <div>
          <div class="p-label">Presets</div>
          <div class="timer-presets">
            <div class="timer-preset" onclick="Timer.setMins(25)">25 min</div>
            <div class="timer-preset" onclick="Timer.setMins(50)">50 min</div>
            <div class="timer-preset" onclick="Timer.setMins(5)">5 min break</div>
            <div class="timer-preset" onclick="Timer.setMins(15)">15 min break</div>
          </div>
        </div>
        <div>
          <div class="p-label">Today's Sessions</div>
          <div id="timer-sessions" style="display:flex;gap:6px;flex-wrap:wrap;min-height:30px"></div>
        </div>
      </div>`,

    ai: () => `
      <div class="panel-head">
        <span class="panel-title"><i class="ti ti-cpu"></i> AI Hub</span>
        <div class="panel-close" data-close="ai"><i class="ti ti-x"></i></div>
      </div>
      <div class="panel-body">
        <div class="ai-grid" id="ai-grid"></div>
      </div>`,

    wallpaper: () => `
      <div class="panel-head">
        <span class="panel-title"><i class="ti ti-photo"></i> Wallpaper</span>
        <div class="panel-close" data-close="wallpaper"><i class="ti ti-x"></i></div>
      </div>
      <div class="panel-body" id="wp-panel-body"></div>`,

    settings: () => `
      <div class="panel-head">
        <span class="panel-title"><i class="ti ti-settings"></i> Settings</span>
        <div class="panel-close" data-close="settings"><i class="ti ti-x"></i></div>
      </div>
      <div class="panel-body" id="settings-body"></div>`,
  };

  /* ── BUILD ALL PANEL DOM ── */
  function buildAll() {
    const root = document.getElementById('panels-root');
    root.innerHTML = '';
    Object.keys(TEMPLATES).forEach(id => {
      const el = document.createElement('div');
      el.className = 'panel';
      el.id = 'panel-' + id;
      el.setAttribute('aria-label', id + ' panel');
      el.innerHTML = TEMPLATES[id]();
      root.appendChild(el);
    });
    root.addEventListener('click', e => {
      const btn = e.target.closest('[data-close]');
      if (btn) close(btn.dataset.close);
    });
  }

  /* ── DOCK WIRING ── */
  function wireDoc() {
    document.querySelectorAll('.di[data-panel]').forEach(di =>
      di.addEventListener('click', () => toggle(di.dataset.panel))
    );
  }

  /* ── PANEL LIFECYCLE ── */
  function toggle(id) {
    if (openPanel === id) { close(id); return; }
    if (openPanel)        { close(openPanel, false); }
    open(id);
  }

  function open(id) {
    openPanel = id;
    const panel = document.getElementById('panel-' + id);
    if (panel) {
      panel.classList.add('open');
      panel.style.animation = 'none';
      void panel.offsetWidth;
      panel.style.animation = '';
    }
    const di = document.getElementById('di-' + id);
    if (di) di.classList.add('active');

    if (id === 'bookmarks') Bookmarks.render('All');
    if (id === 'todo')      Todo.init();
    if (id === 'weather')   _renderWeather();
    if (id === 'notes')     Notes.init();
    if (id === 'focus')     Timer.init();
    if (id === 'ai')        _renderAI();
    if (id === 'wallpaper') WallpaperPanel.render();
    if (id === 'settings')  Settings.render();
  }

  function close(id, clearOpen = true) {
    const panel = document.getElementById('panel-' + id);
    if (panel) panel.classList.remove('open');
    const di = document.getElementById('di-' + id);
    if (di) di.classList.remove('active');
    if (clearOpen) openPanel = null;
  }

  /* ── WEATHER RENDER (async) ── */
  async function _renderWeather(forceRefresh = false) {
    const body = document.getElementById('weather-body');
    if (!body) return;

    body.innerHTML = `<div class="weather-loading"><div class="w-spin"></div><span>Fetching weather…</span></div>`;

    /* Wire refresh button */
    const refBtn = document.getElementById('weather-refresh');
    if (refBtn && !refBtn._wired) {
      refBtn._wired = true;
      refBtn.addEventListener('click', () => _renderWeather(true));
    }

    const d = forceRefresh ? await Weather.refresh() : await Weather.load();

    if (!d) {
      body.innerHTML = `
        <div class="weather-error">
          <i class="ti ti-cloud-off" style="font-size:32px;color:var(--text3);margin-bottom:8px;display:block"></i>
          <div style="font-size:13px;color:var(--text2)">Couldn't fetch weather</div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px">Check your connection</div>
          <button onclick="Panels._weatherRetry()" style="margin-top:12px;padding:7px 14px;border-radius:10px;border:1px solid var(--border);background:var(--glass2);color:var(--text);font-family:Sora,sans-serif;font-size:11px;cursor:pointer">Retry</button>
        </div>`;
      return;
    }

    body.innerHTML = `
      <div class="weather-hero">
        <div class="w-emoji">${d.emoji}</div>
        <div>
          <div class="w-temp">${d.temp}<sup>°${d.unit}</sup></div>
          <div class="w-cond">${d.condition}</div>
          <div class="w-loc">${d.city}${d.region ? ', ' + d.region : ''}</div>
        </div>
      </div>
      <div class="weather-details">
        <div class="wd-pill"><i class="ti ti-droplet"></i>${d.humidity}%</div>
        <div class="wd-pill"><i class="ti ti-wind"></i>${d.wind} km/h</div>
        <div class="wd-pill"><i class="ti ti-eye"></i>${d.visibility} km</div>
        <div class="wd-pill"><i class="ti ti-temperature"></i>Feels ${d.feelsLike}°</div>
      </div>
      <div>
        <div class="p-label">5-Day Forecast</div>
        <div class="weather-forecast">
          ${d.forecast.map(f => `
            <div class="wf-day">
              <div class="wf-emoji">${f.emoji}</div>
              <div class="wf-name">${f.day}</div>
              <div class="wf-temp">${f.temp}°</div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  function _weatherRetry() { _renderWeather(true); }

  /* ── AI HUB RENDER ── */
  function _renderAI() {
    const grid = document.getElementById('ai-grid');
    if (!grid) return;
    grid.innerHTML = AI_TOOLS.map(a => `
      <div class="ai-card" onclick="window.open('${a.u}','_blank')" role="link" tabindex="0">
        <div class="ai-card-ico">${a.i}</div>
        <div class="ai-card-info">
          <div class="ai-card-name">${a.n}</div>
          <div class="ai-card-tag">${a.t}</div>
        </div>
        <div class="ai-dot"></div>
      </div>`).join('');
  }

  return { buildAll, wireDoc, toggle, open, close, _weatherRetry };
})();
