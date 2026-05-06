/* ============================================================
   MOH MAYA MEDIA — notes.js
   Sticky notes: auto-save with debounce, persistent across reloads
   ============================================================ */

'use strict';

const Notes = (() => {
  let saveTimer = null;

  async function init() {
    const ta = document.getElementById('notes-ta');
    if (!ta) return;

    /* Restore saved note */
    ta.value = (await MohMayaMediaState.get('notes')) || '';

    /* Re-attach each time panel opens (ta may have been re-rendered) */
    if (ta._notesBound) return;
    ta._notesBound = true;

    ta.addEventListener('input', () => {
      clearTimeout(saveTimer);
      _setFooter('Saving…');
      saveTimer = setTimeout(async () => {
        await MohMayaMediaState.set('notes', ta.value);
        _setFooter('✓ Saved');
        setTimeout(() => _setFooter('Auto-saved'), 1500);
      }, 500);
    });
  }

  function _setFooter(msg) {
    const el = document.getElementById('notes-footer');
    if (el) el.textContent = msg;
  }

  return { init };
})();
