/* ============================================================
   MOH MAYA MEDIA — clock.js
   Live clock, date, and time-based greeting using saved user name
   ============================================================ */

'use strict';

const Clock = (() => {
  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  let clkEl, dateEl, greetEl;
  let is24h = false;

  function init() {
    clkEl   = document.getElementById('clk');
    dateEl  = document.getElementById('hd');
    greetEl = document.getElementById('hg');
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
