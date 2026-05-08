/* ============================================================
   MOH MAYA MEDIA — clock.js
   Live clock, date, and time-based greeting using saved user name
   ============================================================ */

'use strict';

const Clock = (() => {
  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  let clkEl, dateEl, greetEl, dayEndEl;
  let is24h = false;

  function init() {
    clkEl    = document.getElementById('clk');
    dateEl   = document.getElementById('hd');
    greetEl  = document.getElementById('hg');
    dayEndEl = document.getElementById('stat-dayend');
    tick();
    setInterval(tick, 1000);
  }

  function set24h(val) {
    is24h = val;
    tick();
  }

  function tick() {
    const now = new Date();
    let   h   = now.getHours();
    const m   = now.getMinutes();
    const pad = n => String(n).padStart(2, '0');

    let sfx = '';
    if (!is24h) {
      sfx = h >= 12 ? ' PM' : ' AM';
      h   = h % 12 || 12;
    }

    if (clkEl)   clkEl.textContent   = pad(h) + ':' + pad(m) + (sfx || '');
    if (dateEl)  dateEl.textContent  = DAYS[now.getDay()] + ', ' + MONTHS[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
    if (greetEl) greetEl.textContent = _greeting(now.getHours());

    if (dayEndEl) {
      const s        = now.getSeconds();
      const totalSec = now.getHours() * 3600 + now.getMinutes() * 60 + s;
      const left     = 86400 - totalSec;
      const rh = Math.floor(left / 3600);
      const rm = Math.floor((left % 3600) / 60);
      const rs = left % 60;
      dayEndEl.textContent = pad(rh) + ':' + pad(rm) + ':' + pad(rs);
    }
  }

  /* Public so settings can trigger a re-render after name change */
  function refreshGreeting() { tick(); }

  function _greeting(h) {
    const name = MohMayaMediaState.get('userName') || 'Friend';
    if (h < 5)  return `Good night 🌙, ${name}`;
    if (h < 12) return `Good morning ☀️, ${name}`;
    if (h < 17) return `Good afternoon ⛅, ${name}`;
    if (h < 21) return `Good evening 🌇, ${name}`;
    return `Good night 🌙, ${name}`;
  }

  return { init, set24h, refreshGreeting };
})();
