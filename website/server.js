'use strict';

// Serves the profile page. The config is read once at startup:
// edit config/profile.json, then restart the server to apply changes.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { loadConfig, ConfigError } = require('./src/config');
const { renderSite, favicon, robots } = require('./src/render');

const configFile = path.resolve(process.env.PROFILE_CONFIG || path.join(__dirname, 'config', 'profile.json'));
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

let cfg;
try {
  cfg = loadConfig(configFile);
} catch (err) {
  console.error(err instanceof ConfigError ? err.message : err);
  process.exit(1);
}

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
};

// Everything is rendered up front; requests only look up a fixed route table,
// so no request path ever touches the filesystem.
const routes = new Map();
const add = (url, type, body, cache) => routes.set(url, { type, body: Buffer.from(body), cache });

for (const [file, html] of Object.entries(renderSite(cfg))) {
  add('/' + file.replace(/index\.html$/, ''), 'text/html; charset=utf-8', html, 'no-cache');
}
add('/favicon.svg', 'image/svg+xml', favicon(cfg), 'public, max-age=86400');
add('/robots.txt', 'text/plain; charset=utf-8', robots(cfg), 'public, max-age=86400');
const fontDir = path.join(__dirname, 'public', 'fonts');
for (const f of fs.readdirSync(fontDir).filter(f => f.endsWith('.woff2'))) {
  add('/fonts/' + f, 'font/woff2', fs.readFileSync(path.join(fontDir, f)), 'public, max-age=31536000, immutable');
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', ...SECURITY_HEADERS });
    return res.end();
  }
  const url = new URL(req.url, 'http://localhost').pathname;
  let route = routes.get(url);
  if (!route && url.endsWith('/index.html')) route = routes.get(url.slice(0, -'index.html'.length));
  if (!route && routes.has(url + '/')) {
    res.writeHead(301, { Location: url + '/', ...SECURITY_HEADERS });
    return res.end();
  }
  if (!route) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
    return res.end('404 – Seite nicht gefunden / Page not found');
  }
  res.writeHead(200, {
    'Content-Type': route.type,
    'Content-Length': route.body.length,
    'Cache-Control': route.cache,
    ...SECURITY_HEADERS
  });
  res.end(req.method === 'HEAD' ? undefined : route.body);
});

server.listen(port, host, () => {
  console.log(`Profilseite läuft auf http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/`);
  console.log(`Konfiguration: ${configFile}`);
  console.log(`Sprachen: ${cfg.codes.map(c => '/' + (c === cfg.site.defaultLanguage ? '' : c + '/')).join(', ')}`);
});

for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.close(() => process.exit(0)));
