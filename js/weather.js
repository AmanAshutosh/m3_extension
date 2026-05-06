/* ============================================================
   MOH MAYA MEDIA — weather.js
   Real weather via open-meteo.com — no API key required
   Location: GPS → IP geolocation fallback
   ============================================================ */

'use strict';

const Weather = (() => {
  /* WMO weather interpretation codes → [emoji, description] */
  const WMO = {
    0:  ['☀️',  'Clear Sky'],
    1:  ['🌤️', 'Mainly Clear'],
    2:  ['⛅',  'Partly Cloudy'],
    3:  ['☁️',  'Overcast'],
    45: ['🌫️', 'Foggy'],
    48: ['🌫️', 'Icy Fog'],
    51: ['🌦️', 'Light Drizzle'],
    53: ['🌦️', 'Drizzle'],
    55: ['🌦️', 'Dense Drizzle'],
    61: ['🌧️', 'Light Rain'],
    63: ['🌧️', 'Moderate Rain'],
    65: ['🌧️', 'Heavy Rain'],
    71: ['❄️',  'Light Snow'],
    73: ['❄️',  'Moderate Snow'],
    75: ['❄️',  'Heavy Snow'],
    77: ['🌨️', 'Snow Grains'],
    80: ['🌦️', 'Rain Showers'],
    81: ['🌧️', 'Heavy Showers'],
    82: ['⛈️',  'Violent Showers'],
    85: ['🌨️', 'Snow Showers'],
    86: ['🌨️', 'Heavy Snow Showers'],
    95: ['⛈️',  'Thunderstorm'],
    96: ['⛈️',  'Thunderstorm + Hail'],
    99: ['⛈️',  'Severe Thunderstorm'],
  };
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const CACHE_MS = 10 * 60 * 1000; // 10 min

  function decode(code) {
    return WMO[code] || ['🌡️', 'Unknown'];
  }

  /* ── GPS LOCATION ── */
  function getGPS() {
    return new Promise(resolve => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => resolve(null),
        { timeout: 6000, maximumAge: 300000 }
      );
    });
  }

  /* ── REVERSE GEOCODE (Nominatim) ── */
  async function getCityName(lat, lon) {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const d = await r.json();
      const a = d.address || {};
      const city = a.city || a.town || a.village || a.county || a.state || 'Unknown';
      const country = (a.country_code || '').toUpperCase();
      return { city, country };
    } catch {
      return { city: 'Unknown', country: '' };
    }
  }

  /* ── UNIT CONVERSION ── */
  function toUnit(celsius) {
    const isCelsius = MohMayaMediaState.get('isCelsius') !== false;
    return isCelsius ? Math.round(celsius) : Math.round(celsius * 9 / 5 + 32);
  }

  function unitLabel() {
    return MohMayaMediaState.get('isCelsius') !== false ? 'C' : 'F';
  }

  /* ── MAIN LOAD ── */
  async function load() {
    /* In-memory + storage cache */
    const cached   = await MohMayaMediaState.get('weatherCache');
    const cachedAt = await MohMayaMediaState.get('weatherCacheTime');
    if (cached && cachedAt && Date.now() - cachedAt < CACHE_MS) return cached;

    try {
      let lat, lon, location = { city: 'Unknown', country: '' };

      /* 1. Try GPS */
      const gps = await getGPS();
      if (gps) {
        lat = gps.lat;
        lon = gps.lon;
        location = await getCityName(lat, lon);
      } else {
        /* 2. IP-based fallback */
        const ip = await fetch('https://ip-api.com/json/?fields=lat,lon,city,country')
          .then(r => r.json()).catch(() => null);
        if (ip && ip.lat) {
          lat = ip.lat;
          lon = ip.lon;
          location = { city: ip.city || 'Unknown', country: ip.country || '' };
        } else {
          return await MohMayaMediaState.get('weatherCache') || null;
        }
      }

      /* 3. Open-Meteo API (free, no key) */
      const url = [
        `https://api.open-meteo.com/v1/forecast`,
        `?latitude=${lat}&longitude=${lon}`,
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature`,
        `,wind_speed_10m,weather_code,visibility`,
        `&daily=weather_code,temperature_2m_max,temperature_2m_min`,
        `&timezone=auto&forecast_days=5&wind_speed_unit=kmh`,
      ].join('');

      const wd = await fetch(url).then(r => r.json());
      const c  = wd.current;
      const d  = wd.daily;
      const [emoji, cond] = decode(c.weather_code);

      const forecast = (d.time || []).slice(0, 5).map((t, i) => ({
        day:   DAYS[new Date(t).getDay()],
        emoji: decode(d.weather_code[i])[0],
        temp:  toUnit(d.temperature_2m_max[i]),
      }));

      const result = {
        city:       location.city,
        region:     location.country,
        temp:       toUnit(c.temperature_2m),
        unit:       unitLabel(),
        condition:  cond,
        emoji,
        humidity:   c.relative_humidity_2m,
        wind:       Math.round(c.wind_speed_10m),
        visibility: c.visibility != null ? Math.round(c.visibility / 1000) : '—',
        feelsLike:  toUnit(c.apparent_temperature),
        forecast,
      };

      await MohMayaMediaState.patch({
        weatherCache:     result,
        weatherCacheTime: Date.now(),
      });
      return result;

    } catch (err) {
      console.warn('[Weather] Fetch failed:', err);
      return await MohMayaMediaState.get('weatherCache') || null;
    }
  }

  /* Force-refresh (clears cache) */
  async function refresh() {
    await MohMayaMediaState.patch({ weatherCache: null, weatherCacheTime: 0 });
    return load();
  }

  return { load, refresh };
})();
