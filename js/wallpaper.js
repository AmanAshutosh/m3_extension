/* ============================================================
   MOH MAYA MEDIA — wallpaper.js
   Backgrounds: animated canvas presets, photo, video, solid color.
   Images and videos persist via IndexedDB across sessions.
   ============================================================ */

'use strict';

const Wallpaper = (() => {
  let canvas, ctx, bgImg, bgVid, blurEl, dimEl;
  let animFrame = null;
  let orbAngle  = 0;

  const MAX_VIDEO_BYTES = 80 * 1024 * 1024; // 80 MB cap

  /* ── INIT (async — restores saved media from IDB) ── */
  async function init() {
    canvas = document.getElementById('bg-canvas');
    bgImg  = document.getElementById('bg-img');
    bgVid  = document.getElementById('bg-vid');
    blurEl = document.getElementById('blur-l');
    dimEl  = document.getElementById('dim-l');
    ctx    = canvas.getContext('2d');
    _resize();
    window.addEventListener('resize', _resize);

    /* Restore persisted media */
    const wpType = MohMayaMediaState.get('wpType');
    if (wpType === 'image') {
      const data = await IDB.get('wpImage');
      if (data) { _showImage(data); return; }
    } else if (wpType === 'video') {
      const data = await IDB.get('wpVideo');
      if (data) { _showVideo(data); return; }
    }
    /* Fallback handled in app.js (preset / color) */
  }

  /* ── ANIMATED GRADIENT PRESET ── */
  function applyPreset(idx) {
    _stopMedia();
    canvas.style.display = '';
    _drawPreset(WP_PRESETS[idx]);
    MohMayaMediaState.set('wpType', 'preset');
    MohMayaMediaState.set('wpPresetIdx', idx);
  }

  function _drawPreset(preset) {
    if (!preset || !ctx) return;
    cancelAnimationFrame(animFrame);
    const w = canvas.width;
    const h = canvas.height;
    function frame() {
      orbAngle += 0.002;
      ctx.fillStyle = preset.c[0];
      ctx.fillRect(0, 0, w, h);
      [
        { x: w * (0.15 + Math.sin(orbAngle) * 0.06),        y: h * (0.20 + Math.cos(orbAngle * 0.7) * 0.06),  r: w * 0.50, c: preset.c[1] || preset.c[0] },
        { x: w * (0.82 + Math.cos(orbAngle * 1.1) * 0.05),  y: h * (0.28 + Math.sin(orbAngle * 0.9) * 0.07),  r: w * 0.42, c: preset.c[2] || preset.c[1] || preset.c[0] },
        { x: w * (0.50 + Math.sin(orbAngle * 0.8) * 0.07),  y: h * (0.88 + Math.cos(orbAngle * 1.2) * 0.05),  r: w * 0.48, c: preset.c[3] || preset.c[2] || preset.c[0] },
      ].forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c + 'cc');
        g.addColorStop(1, b.c + '00');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });
      animFrame = requestAnimationFrame(frame);
    }
    frame();
  }

  /* ── SOLID COLOR ── */
  function applyColor(hex) {
    _stopMedia();
    cancelAnimationFrame(animFrame);
    canvas.style.display = '';
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    MohMayaMediaState.set('wpType', 'color');
    MohMayaMediaState.set('wpColor', hex);
  }

  /* ── IMAGE UPLOAD (persistent via IDB) ── */
  function applyImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async e => {
        const dataUrl = e.target.result;
        _showImage(dataUrl);
        await IDB.set('wpImage', dataUrl);
        await IDB.remove('wpVideo');
        MohMayaMediaState.set('wpType', 'image');
        resolve(dataUrl);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ── VIDEO UPLOAD (persistent via IDB, capped at MAX_VIDEO_BYTES) ── */
  function applyVideo(file) {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_VIDEO_BYTES) {
        showToast('Video too large (max 80 MB)', 'info');
        reject(new Error('File too large'));
        return;
      }
      const reader = new FileReader();
      reader.onload = async e => {
        const dataUrl = e.target.result;
        _showVideo(dataUrl);
        await IDB.set('wpVideo', dataUrl);
        await IDB.remove('wpImage');
        MohMayaMediaState.set('wpType', 'video');
        resolve(dataUrl);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ── BLUR & DIM ── */
  function setBlur(px) {
    blurEl.style.backdropFilter       = `blur(${px}px)`;
    blurEl.style.webkitBackdropFilter = `blur(${px}px)`;
    MohMayaMediaState.set('wpBlur', px);
  }

  function setDim(pct) {
    dimEl.style.background = `rgba(0,0,0,${pct / 100})`;
    MohMayaMediaState.set('wpDim', pct);
  }

  /* ── RESET ── */
  async function reset() {
    _stopMedia();
    canvas.style.display = '';
    await IDB.remove('wpImage');
    await IDB.remove('wpVideo');
    applyPreset(0);
    setBlur(0);
    setDim(22);
  }

  /* ── PRIVATE HELPERS ── */
  function _showImage(src) {
    _stopCanvas();
    bgImg.src = src;
    bgImg.style.display = '';
    bgVid.style.display = 'none';
  }

  function _showVideo(src) {
    _stopCanvas();
    bgVid.src = src;
    bgVid.style.display = '';
    bgImg.style.display = 'none';
    bgVid.play().catch(() => {});
  }

  function _stopCanvas() {
    cancelAnimationFrame(animFrame);
    canvas.style.display = 'none';
  }

  function _stopMedia() {
    bgImg.style.display = 'none';
    bgVid.style.display = 'none';
    bgVid.src = '';
    canvas.style.display = '';
  }

  function _resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    if (MohMayaMediaState.get('wpType') === 'preset') {
      _drawPreset(WP_PRESETS[MohMayaMediaState.get('wpPresetIdx') || 0]);
    } else if (MohMayaMediaState.get('wpType') === 'color') {
      ctx.fillStyle = MohMayaMediaState.get('wpColor') || '#0b0818';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { init, applyPreset, applyImage, applyVideo, applyColor, setBlur, setDim, reset };
})();
