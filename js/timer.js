/* ============================================================
   MOH MAYA MEDIA — timer.js
   Pomodoro focus timer: start/pause/reset, presets, session
   persistence across page loads (daily count).
   ============================================================ */

'use strict';

const Timer = (() => {
  let secs     = 25 * 60;
  let total    = 25 * 60;
  let running  = false;
  let iv       = null;
  let sessions = 0;

  /* ── INIT (called when focus panel opens) ── */
  async function init() {
    const saved = await MohMayaMediaState.get('timerSessions');
    if (saved) {
      sessions = (saved.date === new Date().toDateString()) ? (saved.count || 0) : 0;
    }
    updateUI();
    renderSessions();
    _wireButtons();
  }

  /* Wire buttons once per panel open — elements are fresh each time */
  function _wireButtons() {
    const startBtn = document.getElementById('timer-start-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    const presets  = document.getElementById('timer-presets');

    if (startBtn && !startBtn._wired) {
      startBtn._wired = true;
      startBtn.addEventListener('click', () => toggle());
    }
    if (resetBtn && !resetBtn._wired) {
      resetBtn._wired = true;
      resetBtn.addEventListener('click', () => reset());
    }
    if (presets && !presets._wired) {
      presets._wired = true;
      presets.addEventListener('click', e => {
        const preset = e.target.closest('.timer-preset');
        if (preset && preset.dataset.mins) setMins(+preset.dataset.mins);
      });
    }
  }

  /* ── CONTROLS ── */
  function toggle() { running ? pause() : start(); }

  function start() {
    running = true;
    _setBtn('Pause');
    iv = setInterval(tick, 1000);
  }

  function pause() {
    running = false;
    clearInterval(iv);
    _setBtn('Resume');
  }

  function reset() {
    clearInterval(iv);
    running = false;
    secs = total;
    _setBtn('Start');
    updateUI();
  }

  function setMins(m) {
    total = m * 60;
    reset();
    const modeEl = document.getElementById('timer-mode');
    if (!modeEl) return;
    if      (m <= 5)  modeEl.textContent = `Short Break · ${m} min`;
    else if (m <= 15) modeEl.textContent = `Long Break · ${m} min`;
    else if (m <= 25) modeEl.textContent = `Pomodoro · ${m} min`;
    else              modeEl.textContent = `Deep Work · ${m} min`;
  }

  /* ── TICK ── */
  function tick() {
    if (secs <= 0) {
      clearInterval(iv);
      running = false;
      sessions++;
      _saveSession();
      _setBtn('Start');
      showToast('Session complete! Take a break 🎉', 'success');
      secs = total;
      renderSessions();
    } else {
      secs--;
    }
    updateUI();
  }

  /* ── UI ── */
  function updateUI() {
    const m   = Math.floor(secs / 60);
    const s   = secs % 60;
    const pad = n => String(n).padStart(2, '0');
    const disp = document.getElementById('timer-display');
    const bar  = document.getElementById('timer-bar');
    if (disp) disp.textContent = pad(m) + ':' + pad(s);
    if (bar)  bar.style.width  = Math.round((secs / total) * 100) + '%';
  }

  function renderSessions() {
    const el = document.getElementById('timer-sessions');
    if (!el) return;
    if (!sessions) {
      el.innerHTML = `<span style="font-size:11px;color:var(--text3)">No sessions yet today</span>`;
      return;
    }
    el.innerHTML = Array.from({ length: sessions }, (_, i) =>
      `<div class="timer-session-dot" title="Session ${i + 1}">${i + 1}</div>`
    ).join('');
  }

  /* ── PERSISTENCE ── */
  async function _saveSession() {
    await MohMayaMediaState.set('timerSessions', {
      date:  new Date().toDateString(),
      count: sessions,
    });
    const score = Math.min(100, sessions * 20);
    await MohMayaMediaState.set('focusScore', score);
    const el = document.getElementById('stat-focus');
    if (el) el.textContent = score + '%';
  }

  function _setBtn(label) {
    const btn = document.getElementById('timer-start-btn');
    if (btn) btn.textContent = label;
  }

  return { init, toggle, reset, setMins };
})();
