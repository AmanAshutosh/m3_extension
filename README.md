# Moh Maya Media — Glass New Tab Dashboard 🌌

A premium, fully glassmorphic Chrome Extension new-tab dashboard with a floating left-center dock, animated wallpapers, and a full widget suite.

---

## ✨ Features

- **Floating pill dock** — compact, centered on the left edge (like GNTD but better)
- **Animated canvas backgrounds** — 12 cinematic gradient presets with live orb animation
- **Photo wallpaper upload** — any JPG/PNG/WebP
- **Video wallpaper upload** — MP4/WebM/MOV, loops silently
- **Solid color backgrounds** — color picker + 12 quick swatches
- **Blur & dim overlays** — frosted glass control over any wallpaper
- **Bookmarks panel** — 6 categories, 60+ defaults, add custom, search
- **To-Do panel** — add/delete/complete, priority tags, filters
- **Weather panel** — current conditions + 5-day forecast (Patna, IN)
- **Notes panel** — auto-saving sticky note
- **Focus Timer** — Pomodoro with presets (5/15/25/50 min), session counter
- **AI Hub** — 10 AI tools with one click (ChatGPT, Claude, Gemini, Grok…)
- **Settings panel** — accent palettes, glass intensity, clock format, widget toggles
- **Dark & Light mode**
- **Live clock** with 12/24h toggle
- **Rotating daily quotes**
- **Keyboard shortcuts** — Ctrl+K (search), Ctrl+B (bookmarks), Esc (close)
- **Chrome storage persistence** — all settings & todos survive restarts

---

## 🚀 Install in Chrome (Developer Mode)

1. **Download / unzip** this folder (`moh-maya-media-extension/`)
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle top-right)
4. Click **"Load unpacked"**
5. Select the `moh-maya-media-extension/` folder
6. Open a **New Tab** — Moh Maya Media loads instantly ✓

---

## 📁 File Structure

```
moh-maya-media-extension/
├── manifest.json         ← Chrome MV3 manifest
├── newtab.html           ← Main HTML shell
├── css/
│   ├── base.css          ← Reset, variables, animations
│   ├── dock.css          ← Floating pill dock
│   ├── panels.css        ← All slide panels + components
│   ├── center.css        ← Clock, search, stats, quote
│   └── wallpaper.css     ← Wallpaper panel styles
├── js/
│   ├── data.js           ← All static data (quotes, bookmarks, presets)
│   ├── storage.js        ← Chrome storage wrapper + MohMayaMediaState
│   ├── wallpaper.js      ← Canvas/image/video/color wallpaper engine
│   ├── clock.js          ← Live clock + greeting
│   ├── panels.js         ← Dock wiring, panel open/close, HTML builders
│   ├── bookmarks.js      ← Bookmark panel logic
│   ├── todo.js           ← To-Do CRUD + filters
│   ├── notes.js          ← Notes auto-save + Timer + Search
│   ├── settings.js       ← Settings panel + WallpaperPanel renderer
│   ├── search.js         ← Global search bar
│   └── app.js            ← Bootstrap entry point
└── icons/
    ├── icon16.png        ← Add your own icons (any 16×16 PNG)
    ├── icon48.png        ← 48×48 PNG
    └── icon128.png       ← 128×128 PNG
```

---

## 🎨 Customisation

### Change accent colors
Click ⚙️ Settings → pick a color palette. 5 built-in palettes.

### Change wallpaper
Click 🖼️ Wallpaper → choose Presets / Photo / Video / Color.  
Upload any photo or video from your device.

### Add bookmarks
Click 🔖 Bookmarks → scroll down → type name + URL → "+ Add".

### Add your own city for weather
Edit `js/data.js` → update `WEATHER_DATA` object.  
For live weather, integrate [OpenWeatherMap API](https://openweathermap.org/api):
```js
const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Patna&appid=YOUR_KEY&units=metric`);
```

---

## 🛠 Tech Stack

- Vanilla JS (ES2020, no framework — fast load)
- CSS custom properties + glassmorphism
- Chrome Extension Manifest V3
- Chrome Storage API
- HTML5 Canvas for animated backgrounds

---

## 📸 Icons

Add your own 16×16, 48×48, and 128×128 PNG icons to the `icons/` folder.  
A simple "N" letter on a purple gradient works perfectly.

---

## 📄 License

MIT — use freely, credit appreciated.

Built with ❤️ · by Ashutosh 
