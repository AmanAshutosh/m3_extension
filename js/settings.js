/* ============================================================
   MOH MAYA MEDIA — settings.js
   Settings panel + Wallpaper panel renderers.
   All settings persist immediately via Chrome Storage.
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════
   WALLPAPER PANEL
   ════════════════════════════════════════════════════ */
const WallpaperPanel = (() => {
  let activeTab = 'pr';

  function render() {
    const body = document.getElementById('wp-panel-body');
    if (!body) return;
    body.innerHTML = _html();
    _wire();
  }

  function _html() {
    const s = MohMayaMediaState.getAll();
    return `
      <div class="wp-tabs">
        <div class="wp-tab on"  data-wptab="pr">Presets</div>
        <div class="wp-tab"     data-wptab="ph">Photo</div>
        <div class="wp-tab"     data-wptab="vi">Video</div>
        <div class="wp-tab"     data-wptab="cl">Color</div>
      </div>

      <!-- Presets -->
      <div id="wp-pr">
        <div class="wp-preset-grid" id="wp-preset-grid"></div>
      </div>

      <!-- Photo upload -->
      <div id="wp-ph" style="display:none">
        <div class="wp-upload-zone" id="wp-ph-zone">
          <i class="ti ti-photo-up"></i>
          <p>Click or drag a photo here</p>
          <small>JPG · PNG · WebP · GIF — persists across sessions</small>
        </div>
        <input type="file" id="wp-ph-inp" accept="image/*" style="display:none" />
        <div class="wp-file-bar" id="wp-ph-bar" style="display:none">
          <i class="ti ti-photo-check"></i>
          <span id="wp-ph-name">photo.jpg</span>
          <button id="wp-ph-remove-btn">Remove</button>
        </div>
      </div>

      <!-- Video upload -->
      <div id="wp-vi" style="display:none">
        <div class="wp-upload-zone" id="wp-vi-zone">
          <i class="ti ti-video-plus"></i>
          <p>Click or drag a video here</p>
          <small>MP4 · WebM · MOV — max 80 MB, loops silently</small>
        </div>
        <input type="file" id="wp-vi-inp" accept="video/*" style="display:none" />
        <div class="wp-file-bar" id="wp-vi-bar" style="display:none">
          <i class="ti ti-video"></i>
          <span id="wp-vi-name">video.mp4</span>
          <button id="wp-vi-remove-btn">Remove</button>
        </div>
      </div>

      <!-- Solid color -->
      <div id="wp-cl" style="display:none">
        <div class="wp-color-row">
          <input type="color" id="wp-cl-pick" value="${s.wpColor || '#0b0818'}" />
          <span>Pick a background color</span>
        </div>
        <div class="wp-color-swatches" id="wp-cl-swatches"></div>
      </div>

      <!-- Sliders -->
      <div class="wp-sliders">
        <div class="wp-sl-row">
          <span class="wp-sl-label">Blur overlay</span>
          <input type="range" min="0" max="30" step="1" value="${s.wpBlur || 0}" id="wp-blur-sl" />
          <span class="wp-sl-val" id="wp-blur-v">${s.wpBlur || 0}px</span>
        </div>
        <div class="wp-sl-row">
          <span class="wp-sl-label">Dimmer</span>
          <input type="range" min="0" max="85" step="1" value="${s.wpDim ?? 22}" id="wp-dim-sl" />
          <span class="wp-sl-val" id="wp-dim-v">${s.wpDim ?? 22}%</span>
        </div>
      </div>

      <button class="wp-reset-btn" id="wp-reset-btn">
        <i class="ti ti-refresh"></i> Reset to Default
      </button>`;
  }

  function _wire() {
    /* Tabs */
    document.querySelectorAll('[data-wptab]').forEach(tab =>
      tab.addEventListener('click', () => _switchTab(tab.dataset.wptab))
    );

    /* Build preset grid */
    _buildPresets();

    /* Build colour swatches */
    _buildSwatches();

    /* Sliders */
    const blurSl = document.getElementById('wp-blur-sl');
    const dimSl  = document.getElementById('wp-dim-sl');
    if (blurSl) blurSl.addEventListener('input', e => {
      Wallpaper.setBlur(+e.target.value);
      document.getElementById('wp-blur-v').textContent = e.target.value + 'px';
    });
    if (dimSl) dimSl.addEventListener('input', e => {
      Wallpaper.setDim(+e.target.value);
      document.getElementById('wp-dim-v').textContent = e.target.value + '%';
    });

    /* Photo — click + drag-drop */
    const phZone = document.getElementById('wp-ph-zone');
    const phInp  = document.getElementById('wp-ph-inp');
    if (phZone && phInp) {
      phZone.addEventListener('click', () => phInp.click());
      _dragDrop(phZone, async file => {
        if (!file.type.startsWith('image/')) { showToast('Not an image file', 'info'); return; }
        await Wallpaper.applyImage(file);
        document.getElementById('wp-ph-name').textContent = file.name;
        document.getElementById('wp-ph-bar').style.display = 'flex';
        showToast('Photo wallpaper applied ✓');
      });
      phInp.addEventListener('change', async () => {
        const f = phInp.files[0];
        if (!f) return;
        await Wallpaper.applyImage(f);
        document.getElementById('wp-ph-name').textContent = f.name;
        document.getElementById('wp-ph-bar').style.display = 'flex';
        showToast('Photo wallpaper applied ✓');
      });
    }

    /* Video — click + drag-drop */
    const viZone = document.getElementById('wp-vi-zone');
    const viInp  = document.getElementById('wp-vi-inp');
    if (viZone && viInp) {
      viZone.addEventListener('click', () => viInp.click());
      _dragDrop(viZone, async file => {
        if (!file.type.startsWith('video/')) { showToast('Not a video file', 'info'); return; }
        await Wallpaper.applyVideo(file);
        document.getElementById('wp-vi-name').textContent = file.name;
        document.getElementById('wp-vi-bar').style.display = 'flex';
        showToast('Video wallpaper applied ✓');
      });
      viInp.addEventListener('change', async () => {
        const f = viInp.files[0];
        if (!f) return;
        await Wallpaper.applyVideo(f);
        document.getElementById('wp-vi-name').textContent = f.name;
        document.getElementById('wp-vi-bar').style.display = 'flex';
        showToast('Video wallpaper applied ✓');
      });
    }

    /* Color picker */
    const clPick = document.getElementById('wp-cl-pick');
    if (clPick) clPick.addEventListener('input', e => Wallpaper.applyColor(e.target.value));

    /* Remove media buttons */
    const phRemove = document.getElementById('wp-ph-remove-btn');
    const viRemove = document.getElementById('wp-vi-remove-btn');
    const resetBtn = document.getElementById('wp-reset-btn');
    if (phRemove) phRemove.addEventListener('click', () => removeMedia('ph'));
    if (viRemove) viRemove.addEventListener('click', () => removeMedia('vi'));
    if (resetBtn) resetBtn.addEventListener('click', () => resetAll());

    /* Show saved tab */
    const savedType = MohMayaMediaState.get('wpType');
    if (savedType === 'image')  _switchTab('ph');
    else if (savedType === 'video') _switchTab('vi');
    else if (savedType === 'color') _switchTab('cl');
  }

  function _buildPresets() {
    const grid = document.getElementById('wp-preset-grid');
    if (!grid) return;
    const selIdx = MohMayaMediaState.get('wpPresetIdx') || 0;
    grid.innerHTML = WP_PRESETS.map((p, i) => `
      <div class="wp-preset-card${i === selIdx ? ' sel' : ''}"
           style="background:radial-gradient(ellipse at 30% 40%,${p.c[1]},${p.c[0]})"
           data-idx="${i}">
        <span>${p.n}</span>
      </div>`).join('');

    grid.addEventListener('click', e => {
      const card = e.target.closest('.wp-preset-card');
      if (!card) return;
      document.querySelectorAll('.wp-preset-card').forEach(c => c.classList.remove('sel'));
      card.classList.add('sel');
      Wallpaper.applyPreset(+card.dataset.idx);
      showToast('Preset applied ✓');
    });
  }

  function _buildSwatches() {
    const el = document.getElementById('wp-cl-swatches');
    if (!el) return;
    el.innerHTML = COLOR_SWATCHES.map(c => `
      <div class="wp-color-swatch" style="background:${c}" title="${c}" data-color="${c}"></div>`
    ).join('');

    el.addEventListener('click', e => {
      const swatch = e.target.closest('.wp-color-swatch');
      if (!swatch) return;
      const color = swatch.dataset.color;
      Wallpaper.applyColor(color);
      const pick = document.getElementById('wp-cl-pick');
      if (pick) pick.value = color;
    });
  }

  function _switchTab(tab) {
    activeTab = tab;
    ['pr','ph','vi','cl'].forEach(t => {
      const el = document.getElementById('wp-' + t);
      if (el) el.style.display = t === tab ? '' : 'none';
    });
    document.querySelectorAll('[data-wptab]').forEach(btn =>
      btn.classList.toggle('on', btn.dataset.wptab === tab));
  }

  function _dragDrop(zone, onFile) {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    });
  }

  async function removeMedia(type) {
    document.getElementById('wp-' + type + '-bar').style.display = 'none';
    await Wallpaper.reset();
    showToast('Wallpaper reset', 'info');
  }

  async function resetAll() {
    await Wallpaper.reset();
    _buildPresets();
    _switchTab('pr');
    showToast('Wallpaper reset to default', 'info');
  }

  return { render, removeMedia, resetAll };
})();


/* ════════════════════════════════════════════════════
   SETTINGS PANEL
   ════════════════════════════════════════════════════ */
const Settings = (() => {

  function render() {
    const body = document.getElementById('settings-body');
    if (!body) return;
    body.innerHTML = _html();
    _wire();
  }

  function _html() {
    const s = MohMayaMediaState.getAll();
    return `
      <!-- Appearance -->
      <div class="p-label">Appearance</div>

      <div class="setting-row">
        <div>
          <div class="setting-lbl">Dark / Light Mode</div>
          <div class="setting-sub">Toggle theme</div>
        </div>
        <div class="tog${s.isDark ? '' : ' on'}" id="theme-tog"></div>
      </div>

      <div class="setting-row">
        <div class="setting-lbl">Accent Color</div>
        <div class="sw-row" id="accent-swatches">
          ${ACCENT_PALETTES.map((p, i) => `
            <div class="sw${JSON.stringify(s.accents) === JSON.stringify(p.colors) ? ' sel' : ''}"
                 style="background:linear-gradient(135deg,${p.colors[0]},${p.colors[1]})"
                 data-idx="${i}" title="${p.label}"></div>`).join('')}
        </div>
      </div>

      <div class="setting-row">
        <div class="setting-lbl">Glass Intensity</div>
        <input type="range" min="1" max="10" step="1" value="${s.glassIntensity}"
               style="width:120px" id="glass-sl" />
      </div>

      <!-- Clock -->
      <div style="height:6px"></div>
      <div class="p-label">Clock</div>

      <div class="setting-row">
        <div class="setting-lbl">24-hour format</div>
        <div class="tog${s.is24h ? ' on' : ''}" id="h24-tog"></div>
      </div>

      <!-- Identity -->
      <div style="height:6px"></div>
      <div class="p-label">Identity</div>

      <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:6px">
        <div class="setting-lbl">Your Name</div>
        <input type="text" id="user-name-inp" value="${_esc(s.userName || '')}"
               placeholder="Enter your name…" class="setting-text-inp" />
      </div>

      <!-- Weather -->
      <div style="height:6px"></div>
      <div class="p-label">Weather</div>

      <div class="setting-row">
        <div class="setting-lbl">Temperature Unit</div>
        <div style="display:flex;gap:6px" id="temp-unit-row">
          <div class="unit-btn${s.isCelsius !== false ? ' on' : ''}" data-celsius="true">°C</div>
          <div class="unit-btn${s.isCelsius === false ? ' on' : ''}" data-celsius="false">°F</div>
        </div>
      </div>

      <!-- Behaviour -->
      <div style="height:6px"></div>
      <div class="p-label">Behaviour</div>

      <div class="setting-row">
        <div>
          <div class="setting-lbl">Open links in new tab</div>
          <div class="setting-sub">Bookmarks &amp; search results</div>
        </div>
        <div class="tog${s.openInNewTab !== false ? ' on' : ''}" id="newtab-tog"></div>
      </div>

      <!-- Dashboard widgets -->
      <div style="height:6px"></div>
      <div class="p-label">Dashboard</div>

      <div class="setting-row">
        <div class="setting-lbl">Show Stats Row</div>
        <div class="tog${s.showStats ? ' on' : ''}"
             data-widget-key="showStats" data-widget-el="stats-center"></div>
      </div>
      <div class="setting-row">
        <div class="setting-lbl">Show Daily Quote</div>
        <div class="tog${s.showQuote ? ' on' : ''}"
             data-widget-key="showQuote" data-widget-el="quote-strip"></div>
      </div>
      <div class="setting-row">
        <div class="setting-lbl">Show Search Bar</div>
        <div class="tog${s.showSearch ? ' on' : ''}"
             data-widget-key="showSearch" data-widget-el="search-bar"></div>
      </div>

      <!-- About -->
      <div style="height:12px"></div>
      <div class="about-card">
        <div class="about-logo-text">Moh Maya Media</div>
        <div class="about-version">v3.1.0 · Chrome Extension MV3</div>
        <div class="about-links">
          <div class="about-link" data-href="https://github.com/mohmaayamedia">
            <i class="ti ti-brand-github"></i>GitHub
          </div>
          <div class="about-link" data-href="https://linkedin.com">
            <i class="ti ti-brand-linkedin"></i>LinkedIn
          </div>
          <div class="about-link" data-href="mailto:contact@mohmaaya.com">
            <i class="ti ti-mail"></i>Contact
          </div>
        </div>
      </div>`;
  }

  function _wire() {
    /* Name input */
    const nameInp = document.getElementById('user-name-inp');
    if (nameInp) nameInp.addEventListener('input', e => setUserName(e.target.value));

    /* Theme toggle */
    const themeTog = document.getElementById('theme-tog');
    if (themeTog) themeTog.addEventListener('click', () => toggleTheme());

    /* Accent swatches — event delegation on container */
    const accentRow = document.getElementById('accent-swatches');
    if (accentRow) {
      accentRow.addEventListener('click', e => {
        const sw = e.target.closest('.sw');
        if (sw) setAccent(+sw.dataset.idx, sw);
      });
    }

    /* Glass intensity slider */
    const glassSl = document.getElementById('glass-sl');
    if (glassSl) glassSl.addEventListener('input', e => setGlass(+e.target.value));

    /* 24h toggle */
    const h24Tog = document.getElementById('h24-tog');
    if (h24Tog) h24Tog.addEventListener('click', () => toggle24h(h24Tog));

    /* Temperature unit buttons — event delegation */
    const tempRow = document.getElementById('temp-unit-row');
    if (tempRow) {
      tempRow.addEventListener('click', e => {
        const btn = e.target.closest('.unit-btn');
        if (btn) setTempUnit(btn.dataset.celsius === 'true', btn);
      });
    }

    /* New tab toggle */
    const newTabTog = document.getElementById('newtab-tog');
    if (newTabTog) newTabTog.addEventListener('click', () => toggleNewTab(newTabTog));

    /* Widget toggles — each has data-widget-key + data-widget-el */
    document.querySelectorAll('[data-widget-key]').forEach(tog => {
      tog.addEventListener('click', () =>
        toggleWidget(tog.dataset.widgetKey, tog.dataset.widgetEl, tog)
      );
    });

    /* About external links */
    document.querySelectorAll('[data-href]').forEach(link => {
      link.addEventListener('click', () => window.open(link.dataset.href, '_blank'));
    });
  }

  /* ── PUBLIC ACTIONS ── */
  async function toggleTheme() {
    const isDark = !MohMayaMediaState.get('isDark');
    await MohMayaMediaState.set('isDark', isDark);
    applyTheme(isDark);
    const tog = document.getElementById('theme-tog');
    if (tog) tog.classList.toggle('on', !isDark);
  }

  function applyTheme(isDark) {
    document.body.classList.toggle('light-mode', !isDark);
  }

  async function setAccent(idx, el) {
    const palette = ACCENT_PALETTES[idx];
    await MohMayaMediaState.set('accents', palette.colors);
    applyAccents(palette.colors);
    document.querySelectorAll('#accent-swatches .sw').forEach(s => s.classList.remove('sel'));
    el.classList.add('sel');
  }

  function applyAccents(colors) {
    ['--a1','--a2','--a3','--a4','--a5'].forEach((v, i) =>
      document.documentElement.style.setProperty(v, colors[i])
    );
  }

  async function setGlass(v) {
    await MohMayaMediaState.set('glassIntensity', v);
    const a = v / 10;
    document.documentElement.style.setProperty('--glass',  `rgba(255,255,255,${(0.03 + a * 0.05).toFixed(3)})`);
    document.documentElement.style.setProperty('--glass2', `rgba(255,255,255,${(0.08 + a * 0.07).toFixed(3)})`);
    document.documentElement.style.setProperty('--glass3', `rgba(255,255,255,${(0.14 + a * 0.08).toFixed(3)})`);
  }

  async function toggle24h(el) {
    const val = !MohMayaMediaState.get('is24h');
    await MohMayaMediaState.set('is24h', val);
    el.classList.toggle('on', val);
    Clock.set24h(val);
  }

  async function setUserName(name) {
    await MohMayaMediaState.set('userName', name.trim());
    Clock.refreshGreeting();
  }

  async function setTempUnit(celsius, el) {
    await MohMayaMediaState.set('isCelsius', celsius);
    await MohMayaMediaState.patch({ weatherCache: null, weatherCacheTime: 0 });
    document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('on'));
    el.classList.add('on');
    showToast(`Temperature unit set to °${celsius ? 'C' : 'F'}`, 'info');
  }

  async function toggleNewTab(el) {
    const val = !MohMayaMediaState.get('openInNewTab');
    await MohMayaMediaState.set('openInNewTab', val);
    el.classList.toggle('on', val);
  }

  async function toggleWidget(key, elId, tog) {
    const val = !MohMayaMediaState.get(key);
    await MohMayaMediaState.set(key, val);
    tog.classList.toggle('on', val);
    const el = document.getElementById(elId);
    if (el) {
      el.style.transition    = 'opacity 0.3s, transform 0.3s';
      el.style.opacity       = val ? '1' : '0';
      el.style.pointerEvents = val ? '' : 'none';
    }
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return {
    render, toggleTheme, applyTheme, setAccent, applyAccents,
    setGlass, toggle24h, toggleWidget, setUserName, setTempUnit, toggleNewTab,
  };
})();
