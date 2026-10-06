'use strict';

const DEFAULT_THEME = {
  background: '#101214',
  text: '#ecece8',
  textSoft: '#c9c9c4',
  muted: '#9ea4aa',
  line: '#3a3f45',
  accent: '#c4dc5a'
};

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const visible = list => (Array.isArray(list) ? list : []).filter(x => x && !x.hidden);

/** Public path of a language page, relative to the site root ("" or "en/"). */
const langPath = (cfg, code) => (code === cfg.site.defaultLanguage ? '' : code + '/');

function css(theme) {
  const t = { ...DEFAULT_THEME, ...theme };
  return `
@font-face{font-family:Geist;src:url(FONTS/Geist-Variable.woff2) format("woff2");font-weight:100 900;font-display:swap}
@font-face{font-family:"Geist Mono";src:url(FONTS/GeistMono-Regular.woff2) format("woff2");font-weight:400;font-display:swap}
:root{--bg:${t.background};--text:${t.text};--soft:${t.textSoft};--muted:${t.muted};--line:${t.line};--accent:${t.accent};color-scheme:dark}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font-family:Geist,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;min-height:100dvh}
a{color:var(--accent);text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}
a:hover{color:#fff}
a:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:2px}
.skip{position:absolute;left:-9999px;top:8px;background:var(--accent);color:var(--bg);padding:8px 12px;font-weight:600;text-decoration:none}
.skip:focus{left:8px}
.wrap{max-width:1040px;margin:0 auto;padding:clamp(24px,4vw,48px) clamp(20px,5vw,64px) 96px;padding-left:max(clamp(20px,5vw,64px),env(safe-area-inset-left));padding-right:max(clamp(20px,5vw,64px),env(safe-area-inset-right));display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;font-size:15px}
.top .who{font-weight:600}
.langs{display:flex;gap:16px}
.langs a{display:inline-flex;align-items:center;min-height:44px;font-weight:500;font-size:15px;color:var(--muted);text-decoration:none}
.langs a span{border-bottom:1px solid transparent;padding-bottom:2px}
.langs a[aria-current]{color:var(--text)}
.langs a[aria-current] span{border-bottom-color:var(--accent)}
.langs a:hover{color:var(--text)}
.hero{display:flex;flex-direction:column;gap:32px;padding:clamp(56px,9vw,104px) 0 clamp(48px,7vw,80px)}
h1{margin:0;font-size:clamp(52px,13vw,148px);font-weight:700;letter-spacing:-.06em;line-height:.88;color:var(--accent);overflow-wrap:anywhere}
.intro{display:flex;flex-direction:column;gap:16px;max-width:640px}
.role{font-size:clamp(20px,2.4vw,24px);font-weight:500;letter-spacing:-.01em;line-height:1.3}
.bio{margin:0;font-size:18px;line-height:1.55;color:var(--soft);text-wrap:pretty}
.interests{margin:0;font-size:15px;line-height:1.5;color:var(--muted)}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;border-top:1px solid var(--line);padding:32px 0 48px;margin:0}
.facts div{display:flex;flex-direction:column;gap:3px}
.facts dt{font-size:13px;color:var(--muted)}
.facts dd{margin:0;font-size:18px;font-weight:600;line-height:1.3}
section{border-top:1px solid var(--line);padding:48px 0;display:flex;gap:24px 48px;flex-wrap:wrap}
h2{flex:0 0 200px;margin:0;font-size:15px;font-weight:600;color:var(--muted)}
.rows{flex:1 1 440px;display:flex;flex-direction:column;gap:32px;margin:0;padding:0;list-style:none;min-width:0}
.row{display:flex;gap:8px 32px;flex-wrap:wrap}
.when{flex:0 0 170px;display:flex;flex-direction:column;gap:2px}
.meta{font-family:"Geist Mono",ui-monospace,monospace;font-size:15px;line-height:1.4;color:var(--accent)}
.sub{font-size:13px;color:var(--muted)}
.what{flex:1 1 260px;display:flex;flex-direction:column;gap:4px;min-width:0}
.title{font-size:18px;font-weight:600;letter-spacing:-.01em;line-height:1.3;overflow-wrap:anywhere}
.text{font-size:15px;line-height:1.55;color:var(--soft);text-wrap:pretty}
.extra{font-size:13px;color:var(--muted)}
footer{position:relative;border-top:1px solid var(--line);padding:24px 0;font-size:13px;line-height:1.5;color:var(--muted)}
.foot.has-imp{padding-right:120px}
summary{position:absolute;top:12px;right:0;padding:12px 0;cursor:pointer;list-style:none;text-decoration:underline;text-underline-offset:3px}
summary::-webkit-details-marker{display:none}
summary:hover{color:#fff}
.imprint{display:flex;flex-direction:column;gap:2px;line-height:1.6;color:var(--soft);margin-top:16px}
@media (max-width:600px){
  .hero{gap:24px}
  .bio{font-size:17px}
  .facts{grid-template-columns:1fr 1fr;gap:20px 16px;padding:24px 0 40px}
  .facts dd{font-size:16px}
  section{padding:36px 0;gap:20px}
  h2{flex-basis:100%}
  .rows{gap:28px}
  .row{flex-direction:column;gap:6px}
  .when{flex:none;flex-direction:row;align-items:baseline;gap:10px;flex-wrap:wrap}
  .what{flex:none}
}
@media print{
  :root{--bg:#fff;--text:#000;--soft:#222;--muted:#555;--line:#bbb;--accent:#000;color-scheme:light}
  .langs,.skip,summary{display:none}
  .wrap{padding:0;max-width:none}
  .hero{padding:24px 0}
  h1{font-size:56px}
  section,.row{break-inside:avoid}
  a{color:#000}
  .imprint{margin-top:0}
}`.replace(/FONTS/g, '%FONTS%').trim();
}

function renderRow(r) {
  const title = r.title
    ? (r.href
      ? `<a class="title" href="${esc(r.href)}"${/^https?:/.test(r.href) ? ' rel="me noopener"' : ''}>${esc(r.title)}</a>`
      : `<div class="title">${esc(r.title)}</div>`)
    : '';
  return `<li class="row"><div class="when">${r.meta ? `<div class="meta">${esc(r.meta)}</div>` : ''}${r.sub ? `<div class="sub">${esc(r.sub)}</div>` : ''}</div>`
    + `<div class="what">${title}${r.text ? `<div class="text">${esc(r.text)}</div>` : ''}${r.extra ? `<div class="extra">${esc(r.extra)}</div>` : ''}</div></li>`;
}

function jsonLd(cfg, l, url) {
  const sameAs = [];
  for (const s of visible(l.sections)) for (const r of visible(s.rows)) {
    if (r.href && /^https?:/.test(r.href)) sameAs.push(r.href);
  }
  const data = { '@context': 'https://schema.org', '@type': 'Person', name: cfg.person.name };
  if (l.role) data.description = l.role;
  if (url) data.url = url;
  if (cfg.person.email) data.email = 'mailto:' + cfg.person.email;
  if (sameAs.length) data.sameAs = [...new Set(sameAs)];
  // "<" is escaped so config text can never close the script element.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Renders the full HTML document for one language. */
function renderPage(cfg, code) {
  const l = cfg.languages[code];
  const base = langPath(cfg, code) ? '../' : '';
  const name = cfg.person.name;
  const absUrl = c => (cfg.site.baseUrl ? `${cfg.site.baseUrl}/${langPath(cfg, c)}` : '');
  const fill = s => String(s)
    .replace(/\{name\}/g, name)
    .replace(/\{email\}/g, cfg.person.email)
    .replace(/\{address\}/g, cfg.person.address);

  const langLinks = cfg.codes.length > 1
    ? `<nav class="langs" aria-label="Language">${cfg.codes.map(c => {
      const target = base + langPath(cfg, c) || './';
      return `<a href="${esc(target)}" hreflang="${esc(c)}" lang="${esc(c)}"${c === code ? ' aria-current="page"' : ''}><span>${esc(cfg.languages[c].label || c.toUpperCase())}</span></a>`;
    }).join('')}</nav>`
    : '';

  const alternates = cfg.site.baseUrl && cfg.codes.length > 1
    ? cfg.codes.map(c => `<link rel="alternate" hreflang="${esc(c)}" href="${esc(absUrl(c))}">`).join('')
      + `<link rel="alternate" hreflang="x-default" href="${esc(absUrl(cfg.site.defaultLanguage))}">`
    : '';

  const title = l.meta?.title || name;
  const desc = l.meta?.description || l.role || '';
  const facts = visible(l.facts);
  const sections = visible(l.sections).map(s => ({ ...s, rows: visible(s.rows) })).filter(s => s.rows.length);
  const imprint = l.imprint?.lines?.length ? l.imprint : null;

  return `<!doctype html>
<html lang="${esc(code)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
${desc ? `<meta name="description" content="${esc(desc)}">` : ''}
${cfg.site.indexable ? '' : '<meta name="robots" content="noindex, nofollow">'}
<meta name="theme-color" content="${esc(cfg.site.theme.background || DEFAULT_THEME.background)}">
<meta name="author" content="${esc(name)}">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(title)}">
${desc ? `<meta property="og:description" content="${esc(desc)}">` : ''}
${absUrl(code) ? `<meta property="og:url" content="${esc(absUrl(code))}"><link rel="canonical" href="${esc(absUrl(code))}">` : ''}
${alternates}
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<link rel="preload" href="${base}fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<style>${css(cfg.site.theme).replace(/%FONTS%/g, base + 'fonts')}</style>
<script type="application/ld+json">${jsonLd(cfg, l, absUrl(code))}</script>
</head>
<body>
<a class="skip" href="#main">${code === 'de' ? 'Zum Inhalt' : 'Skip to content'}</a>
<div class="wrap">
<header class="top"><span class="who">${esc(name)}</span>${langLinks}</header>
<main id="main">
<div class="hero">
<h1>${esc(name)}</h1>
<div class="intro">${l.role ? `<div class="role">${esc(l.role)}</div>` : ''}${l.bio ? `<p class="bio">${esc(l.bio)}</p>` : ''}${l.interests ? `<p class="interests">${esc(l.interests)}</p>` : ''}</div>
</div>
${facts.length ? `<dl class="facts">${facts.map(f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>` : ''}
${sections.map(s => `<section aria-label="${esc(s.title)}"><h2>${esc(s.title)}</h2><ul class="rows">${s.rows.map(renderRow).join('')}</ul></section>`).join('\n')}
</main>
<footer>
<div class="foot${imprint ? ' has-imp' : ''}">${esc(l.footer || '')}</div>
${imprint ? `<details><summary>${esc(imprint.label)}</summary><div class="imprint">${imprint.lines.map(x => `<div>${esc(fill(x))}</div>`).join('')}</div></details>` : ''}
</footer>
</div>
</body>
</html>
`;
}

/** All pages of the site as { "<relative path>": html }. */
function renderSite(cfg) {
  const pages = {};
  for (const code of cfg.codes) pages[langPath(cfg, code) + 'index.html'] = renderPage(cfg, code);
  return pages;
}

function favicon(cfg) {
  const t = { ...DEFAULT_THEME, ...cfg.site.theme };
  const initials = cfg.person.name.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${t.background}"/><text x="32" y="43" text-anchor="middle" font-family="system-ui,sans-serif" font-size="30" font-weight="700" letter-spacing="-2" fill="${t.accent}">${esc(initials)}</text></svg>`;
}

function robots(cfg) {
  return cfg.site.indexable ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n';
}

module.exports = { renderSite, renderPage, favicon, robots };
