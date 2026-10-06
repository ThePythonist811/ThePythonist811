'use strict';

// Writes the site as static files to dist/ (for GitHub Pages, Netlify, any web host).
// Same renderer and config as server.js; run again after editing the config.

const fs = require('node:fs');
const path = require('node:path');
const { loadConfig, ConfigError } = require('./src/config');
const { renderSite, favicon, robots } = require('./src/render');

const configFile = path.resolve(process.env.PROFILE_CONFIG || path.join(__dirname, 'config', 'profile.json'));
const out = path.resolve(process.argv[2] || path.join(__dirname, 'dist'));

let cfg;
try {
  cfg = loadConfig(configFile);
} catch (err) {
  console.error(err instanceof ConfigError ? err.message : err);
  process.exit(1);
}

fs.rmSync(out, { recursive: true, force: true });
const write = (rel, body) => {
  const file = path.join(out, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
};

for (const [rel, html] of Object.entries(renderSite(cfg))) write(rel, html);
write('favicon.svg', favicon(cfg));
write('robots.txt', robots(cfg));
fs.cpSync(path.join(__dirname, 'public', 'fonts'), path.join(out, 'fonts'), { recursive: true });

console.log(`Statische Seite geschrieben nach ${out}`);
