/* ============================================================
   MOH MAYA MEDIA — app.js
   Main entry point. Bootstraps all modules after DOM is ready.
   ============================================================ */

'use strict';

/* ── GLOBAL TOAST ── */
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; });
  setTimeout(() => {
    t.style.opacity    = '0';
    t.style.transition = 'opacity 0.4s';
    setTimeout(() => t.remove(), 450);
  }, 2500);
}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', async () => {

  /* 1. Load persisted state */
  await MohMayaMediaState.load();
  await Bookmarks.loadCustom();
  await Todo.load();

  /* 2. Build all panel DOM + wire dock */
  Panels.buildAll();
  Panels.wireDoc();

  /* 3. Apply saved appearance */
  const s = MohMayaMediaState.getAll();
  Settings.applyTheme(s.isDark);
  Settings.applyAccents(s.accents);
  Settings.setGlass(s.glassIntensity);

  /* 4. Wallpaper — init restores saved image/video from IDB */
  await Wallpaper.init();
  if (s.wpType === 'preset')     Wallpaper.applyPreset(s.wpPresetIdx || 0);
  else if (s.wpType === 'color') Wallpaper.applyColor(s.wpColor);
  /* image/video are restored inside Wallpaper.init() */
  Wallpaper.setBlur(s.wpBlur || 0);
  Wallpaper.setDim(s.wpDim  ?? 22);

  /* 5. Clock + 24h format */
  Clock.init();
  Clock.set24h(s.is24h);

  /* 6. Search bar */
  Search.init();

  /* 7. Command palette */
  CommandPalette.init();

  /* 8. Stats — real values */
  _seedStats(s);

  /* 9. Daily quote */
  const q = QUOTES[new Date().getDate() % QUOTES.length];
  document.getElementById('qt').textContent = q.t;
  document.getElementById('qa').textContent = '— ' + q.a;

  /* 10. Show/hide widgets */
  _applyWidgetVisibility(s);

  /* 11. Streak tracking */
  await _updateStreak();

  /* 12. Top-bar buttons */
  document.getElementById('focus-mode-btn').addEventListener('click', function () {
    this.classList.toggle('on');
    document.body.classList.toggle('focus-mode');
    showToast(document.body.classList.contains('focus-mode') ? 'Focus mode on' : 'Focus mode off', 'info');
  });

  document.getElementById('notif-btn').addEventListener('click', () => {
    showToast('No new notifications', 'info');
  });

  /* 13. Keyboard shortcuts */
  document.addEventListener('keydown', e => {
    const mod = e.ctrlKey || e.metaKey;

    /* Ctrl/Cmd + K → command palette */
    if (mod && e.key === 'k') {
      e.preventDefault();
      CommandPalette.toggle();
    }
    /* Ctrl/Cmd + B → bookmarks */
    if (mod && e.key === 'b') {
      e.preventDefault();
      Panels.toggle('bookmarks');
    }
    /* Escape → close palette then panels */
    if (e.key === 'Escape') {
      if (document.getElementById('cmd-palette')?.style.display !== 'none' &&
          document.getElementById('cmd-palette')?.style.display !== '') {
        CommandPalette.close();
        return;
      }
      document.querySelectorAll('.panel.open').forEach(p =>
        Panels.close(p.id.replace('panel-', ''))
      );
      document.getElementById('s-inp')?.blur();
    }
  });

  /* 14. Fade in */
  document.body.style.opacity    = '0';
  document.body.style.transition = 'opacity 0.45s';
  requestAnimationFrame(() => { document.body.style.opacity = '1'; });

  console.log('%c Moh Maya Media v3.1 booted ✓', 'color:#b06ef5;font-size:14px;font-weight:bold');
});

/* ── STATS ── */
function _seedStats(s) {
  /* Tasks done = real count from todos */
  const done = (s.todos || []).filter(t => t.done).length;
  const elT  = document.getElementById('stat-tasks');
  if (elT) elT.textContent = done;

  /* Focus score */
  const elF = document.getElementById('stat-focus');
  if (elF) elF.textContent = (s.focusScore || 0) + '%';

  /* Streak */
  const elS = document.getElementById('stat-streak');
  if (elS) elS.textContent = (s.streak || 0) + '🔥';
}

/* ── STREAK ── */
async function _updateStreak() {
  const today    = new Date().toDateString();
  const lastDate = MohMayaMediaState.get('lastActiveDate');
  let   streak   = MohMayaMediaState.get('streak') || 0;

  if (lastDate === today) {
    /* already updated today */
  } else if (lastDate === _yesterday()) {
    streak++;
    await MohMayaMediaState.patch({ streak, lastActiveDate: today });
  } else {
    streak = 1;
    await MohMayaMediaState.patch({ streak, lastActiveDate: today });
  }

  const el = document.getElementById('stat-streak');
  if (el) el.textContent = streak + '🔥';
}

function _yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toDateString();
}

/* ── WIDGET VISIBILITY ── */
function _applyWidgetVisibility(s) {
  const items = [
    { key: 'showStats',  id: 'stats-center' },
    { key: 'showQuote',  id: 'quote-strip'  },
    { key: 'showSearch', id: 'search-bar'   },
  ];
  items.forEach(({ key, id }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const visible = s[key] !== false;
    el.style.opacity     = visible ? '1' : '0';
    el.style.pointerEvents = visible ? '' : 'none';
  });
}
