/* ============================================================
   MOH MAYA MEDIA — data.js
   All static data: quotes, default bookmarks, AI tools, presets
   ============================================================ */

'use strict';

/* ── DAILY QUOTES ── */
const QUOTES = [
  { t: '"The secret of getting ahead is getting started."',          a: 'Mark Twain' },
  { t: '"Stay hungry, stay foolish."',                               a: 'Steve Jobs' },
  { t: '"Focus on being productive instead of busy."',               a: 'Tim Ferriss' },
  { t: '"Do what you can, with what you have, where you are."',      a: 'Theodore Roosevelt' },
  { t: '"Dream big and dare to fail."',                              a: 'Norman Vaughan' },
  { t: '"The best way to predict the future is to create it."',      a: 'Peter Drucker' },
  { t: '"It always seems impossible until it\'s done."',             a: 'Nelson Mandela' },
  { t: '"You miss 100% of the shots you don\'t take."',             a: 'Wayne Gretzky' },
  { t: '"Simplicity is the ultimate sophistication."',               a: 'Leonardo da Vinci' },
  { t: '"Work hard in silence, let success make the noise."',        a: 'Frank Ocean' },
  { t: '"The harder I work, the luckier I get."',                    a: 'Samuel Goldwyn' },
  { t: '"Don\'t watch the clock. Do what it does. Keep going."',    a: 'Sam Levenson' },
];

/* ── DEFAULT BOOKMARK CATEGORIES ── */
const DEFAULT_BOOKMARKS = {
  All: [
    { n: 'YouTube',   u: 'https://youtube.com',          i: '📺' },
    { n: 'GitHub',    u: 'https://github.com',            i: '🐙' },
    { n: 'Gmail',     u: 'https://gmail.com',             i: '✉️' },
    { n: 'Notion',    u: 'https://notion.so',             i: '📝' },
    { n: 'ChatGPT',   u: 'https://chatgpt.com',           i: '🤖' },
    { n: 'Claude',    u: 'https://claude.ai',             i: '✨' },
    { n: 'Netflix',   u: 'https://netflix.com',           i: '🎬' },
    { n: 'Spotify',   u: 'https://spotify.com',           i: '🎵' },
    { n: 'Drive',     u: 'https://drive.google.com',      i: '☁️' },
    { n: 'Twitter',   u: 'https://x.com',                 i: '🐦' },
    { n: 'LinkedIn',  u: 'https://linkedin.com',          i: '💼' },
    { n: 'Reddit',    u: 'https://reddit.com',            i: '👽' },
  ],
  Work: [
    { n: 'GitHub',     u: 'https://github.com',           i: '🐙' },
    { n: 'Notion',     u: 'https://notion.so',            i: '📝' },
    { n: 'Gmail',      u: 'https://gmail.com',            i: '✉️' },
    { n: 'Slack',      u: 'https://slack.com',            i: '💬' },
    { n: 'Drive',      u: 'https://drive.google.com',     i: '☁️' },
    { n: 'Trello',     u: 'https://trello.com',           i: '📋' },
    { n: 'Calendly',   u: 'https://calendly.com',         i: '📅' },
    { n: 'Figma',      u: 'https://figma.com',            i: '🎨' },
    { n: 'Jira',       u: 'https://atlassian.com/jira',   i: '🔧' },
    { n: 'StackOverflow', u: 'https://stackoverflow.com', i: '🧑‍💻' },
  ],
  AI: [
    { n: 'ChatGPT',     u: 'https://chatgpt.com',          i: '🤖' },
    { n: 'Claude',      u: 'https://claude.ai',            i: '✨' },
    { n: 'Gemini',      u: 'https://gemini.google.com',    i: '🔮' },
    { n: 'Perplexity',  u: 'https://perplexity.ai',        i: '🔍' },
    { n: 'Grok',        u: 'https://grok.com',             i: '⚡' },
    { n: 'Midjourney',  u: 'https://midjourney.com',       i: '🎨' },
    { n: 'ElevenLabs',  u: 'https://elevenlabs.io',        i: '🎙️' },
    { n: 'HuggingFace', u: 'https://huggingface.co',       i: '🤗' },
    { n: 'Runway',      u: 'https://runwayml.com',         i: '🎞️' },
    { n: 'Leonardo',    u: 'https://leonardo.ai',          i: '🖼️' },
  ],
  Social: [
    { n: 'Twitter',    u: 'https://x.com',                  i: '🐦' },
    { n: 'Instagram',  u: 'https://instagram.com',          i: '📸' },
    { n: 'LinkedIn',   u: 'https://linkedin.com',           i: '💼' },
    { n: 'Reddit',     u: 'https://reddit.com',             i: '👽' },
    { n: 'WhatsApp',   u: 'https://web.whatsapp.com',       i: '💬' },
    { n: 'Telegram',   u: 'https://telegram.org',           i: '✈️' },
    { n: 'Facebook',   u: 'https://facebook.com',           i: '👤' },
    { n: 'Discord',    u: 'https://discord.com',            i: '🎮' },
  ],
  Fun: [
    { n: 'Netflix',    u: 'https://netflix.com',            i: '🎬' },
    { n: 'YouTube',    u: 'https://youtube.com',            i: '📺' },
    { n: 'Spotify',    u: 'https://spotify.com',            i: '🎵' },
    { n: 'Prime',      u: 'https://primevideo.com',         i: '🎞️' },
    { n: 'Disney+',    u: 'https://disneyplus.com',         i: '🏰' },
    { n: 'Twitch',     u: 'https://twitch.tv',              i: '🎮' },
  ],
  Shopping: [
    { n: 'Amazon',     u: 'https://amazon.in',              i: '📦' },
    { n: 'Flipkart',   u: 'https://flipkart.com',           i: '🛒' },
    { n: 'Myntra',     u: 'https://myntra.com',             i: '👗' },
    { n: 'eBay',       u: 'https://ebay.com',               i: '🏷️' },
    { n: 'Meesho',     u: 'https://meesho.com',             i: '🛍️' },
    { n: 'Nykaa',      u: 'https://nykaa.com',              i: '💄' },
  ],
};

/* ── AI TOOLS (for AI Hub panel) ── */
const AI_TOOLS = [
  { n: 'ChatGPT',     u: 'https://chatgpt.com',         i: '🤖', t: 'GPT-4o · OpenAI'      },
  { n: 'Claude',      u: 'https://claude.ai',           i: '✨', t: 'Sonnet 4 · Anthropic'  },
  { n: 'Gemini',      u: 'https://gemini.google.com',   i: '🔮', t: 'Gemini 2.5 · Google'   },
  { n: 'Perplexity',  u: 'https://perplexity.ai',       i: '🔍', t: 'AI Search Engine'       },
  { n: 'Grok',        u: 'https://grok.com',            i: '⚡', t: 'Grok 3 · xAI'           },
  { n: 'Midjourney',  u: 'https://midjourney.com',      i: '🎨', t: 'Image Generation'       },
  { n: 'ElevenLabs',  u: 'https://elevenlabs.io',       i: '🎙️', t: 'Voice & Audio AI'       },
  { n: 'Runway',      u: 'https://runwayml.com',        i: '🎞️', t: 'Video Generation'       },
  { n: 'HuggingFace', u: 'https://huggingface.co',      i: '🤗', t: 'Open Source Models'     },
  { n: 'Leonardo AI', u: 'https://leonardo.ai',         i: '🖼️', t: 'Image & Art AI'         },
];

/* ── WALLPAPER PRESETS ── */
const WP_PRESETS = [
  { n: 'Aurora',  c: ['#0b0818','#1c0840','#060c32','#050820'] },
  { n: 'Sunset',  c: ['#1a0508','#2e0a1a','#3e1202','#1a0800'] },
  { n: 'Ocean',   c: ['#010a1a','#000830','#001835','#010820'] },
  { n: 'Forest',  c: ['#020c04','#021a08','#091a03','#051008'] },
  { n: 'Galaxy',  c: ['#050110','#140040','#06002c','#0c0020'] },
  { n: 'Cosmic',  c: ['#120418','#1c0522','#0a0532','#060018'] },
  { n: 'Fire',    c: ['#1a0500','#1c0a00','#220500','#150200'] },
  { n: 'Arctic',  c: ['#010e1a','#010d22','#021428','#000a18'] },
  { n: 'Neon',    c: ['#050015','#0a0028','#020a20','#0f0025'] },
  { n: 'Rose',    c: ['#180008','#200010','#1a0018','#0e0008'] },
  { n: 'Slate',   c: ['#0a0a12','#101018','#080818','#060610'] },
  { n: 'Jade',    c: ['#021008','#031808','#040e06','#02100a'] },
];

/* ── COLOR SWATCH PRESETS (wallpaper solid) ── */
const COLOR_SWATCHES = [
  '#0b0818','#021018','#030f08','#180408',
  '#0a0a0a','#180e00','#08091a','#130013',
  '#001018','#1a1000','#001800','#0a000a',
];

/* ── WEATHER (mock — replace with real API) ── */
const WEATHER_DATA = {
  city:      'Patna',
  region:    'Bihar, IN',
  temp:      28,
  unit:      'C',
  condition: 'Partly Cloudy',
  emoji:     '⛅',
  humidity:  72,
  wind:      14,
  visibility: 10,
  feelsLike: 31,
  forecast: [
    { day: 'Mon', emoji: '☀️',  temp: 32 },
    { day: 'Tue', emoji: '⛅',  temp: 28 },
    { day: 'Wed', emoji: '🌧️', temp: 24 },
    { day: 'Thu', emoji: '⛈️', temp: 22 },
    { day: 'Fri', emoji: '☀️',  temp: 30 },
  ],
};

/* ── DEFAULT TODOS ── */
const DEFAULT_TODOS = [
  { id: 1, text: 'Review design mockups',     done: false, priority: 'high' },
  { id: 2, text: 'Team standup at 10am',      done: false, priority: 'med'  },
  { id: 3, text: 'Ship v2 feature update',    done: false, priority: 'high' },
  { id: 4, text: 'Write weekly report',       done: true,  priority: 'low'  },
  { id: 5, text: 'Review pull requests',      done: false, priority: 'med'  },
];

/* ── ACCENT PALETTES ── */
const ACCENT_PALETTES = [
  { label: 'Purple × Blue',  colors: ['#b06ef5','#6e9ef5','#f56eb0','#f5a96e','#6ef5b0'] },
  { label: 'Pink × Orange',  colors: ['#f56eb0','#f5a96e','#b06ef5','#6e9ef5','#6ef5b0'] },
  { label: 'Green × Cyan',   colors: ['#6ef5b0','#6e9ef5','#b06ef5','#f56eb0','#f5a96e'] },
  { label: 'Amber × Yellow', colors: ['#f5a96e','#f5d06e','#6e9ef5','#b06ef5','#6ef5b0'] },
  { label: 'Cyan × Purple',  colors: ['#6ee8f5','#a06ef5','#f56e9e','#f5d06e','#6ef5b0'] },
];
