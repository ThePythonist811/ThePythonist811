'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadConfig, ConfigError } = require('../src/config');
const { renderSite } = require('../src/render');

const shipped = path.join(__dirname, '..', 'config', 'profile.json');

function withConfig(obj) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'profile-')), 'profile.json');
  fs.writeFileSync(file, typeof obj === 'string' ? obj : JSON.stringify(obj));
  return loadConfig(file);
}

const minimal = () => ({
  person: { name: 'Ada Lovelace', email: 'ada@example.org', address: 'Somewhere 1' },
  languages: {
    de: {
      role: 'Rolle',
      sections: [{ title: 'Kontakt', rows: [{ meta: 'GitHub', title: 'gh', href: 'https://github.com/ada' }] }],
      imprint: { label: 'Impressum', lines: ['{name}', '{address}', 'E-Mail: {email}'] }
    }
  }
});

test('shipped config is valid and renders one page per language', () => {
  const cfg = loadConfig(shipped);
  const pages = renderSite(cfg);
  assert.deepStrictEqual(Object.keys(pages).sort(), ['en/index.html', 'index.html']);
  assert.match(pages['index.html'], /<html lang="de">/);
  assert.match(pages['en/index.html'], /<html lang="en">/);
  assert.match(pages['index.html'], /Kunststoffsortiermaschine/);
  assert.match(pages['en/index.html'], /plastic sorting machine/);
});

test('every row of the config ends up on the page', () => {
  const cfg = loadConfig(shipped);
  const pages = renderSite(cfg);
  for (const code of cfg.codes) {
    const html = pages[(code === cfg.site.defaultLanguage ? '' : code + '/') + 'index.html'];
    for (const s of cfg.languages[code].sections) for (const r of s.rows) {
      for (const k of ['meta', 'title', 'text']) {
        if (r[k]) assert.ok(html.includes(r[k].replace(/&/g, '&amp;')), `${code}: "${r[k]}" fehlt`);
      }
    }
  }
});

test('config text is HTML-escaped', () => {
  const c = minimal();
  c.languages.de.role = '<script>alert(1)</script>';
  c.person.name = 'A </script><b>';
  const html = renderSite(withConfig(c))['index.html'];
  assert.ok(!html.includes('<script>alert'));
  assert.ok(!html.includes('</script><b>'));
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test('hidden rows and sections are left out', () => {
  const c = minimal();
  c.languages.de.sections.push({ title: 'Geheim', hidden: true, rows: [{ title: 'x' }] });
  c.languages.de.sections[0].rows.push({ title: 'Versteckt', hidden: true });
  const html = renderSite(withConfig(c))['index.html'];
  assert.ok(!html.includes('Geheim'));
  assert.ok(!html.includes('Versteckt'));
});

test('imprint placeholders are filled from person', () => {
  const html = renderSite(withConfig(minimal()))['index.html'];
  assert.match(html, /<div>Ada Lovelace<\/div><div>Somewhere 1<\/div><div>E-Mail: ada@example.org<\/div>/);
});

test('a single language has no language switch', () => {
  const html = renderSite(withConfig(minimal()))['index.html'];
  assert.ok(!html.includes('class="langs"'));
});

test('invalid config reports all problems at once', () => {
  const c = minimal();
  delete c.person.name;
  c.languages.de.sections[0].rows[0].href = 'javascript:alert(1)';
  c.languages.de.sections[0].rows.push({ titel: 'Tippfehler' });
  c.site = { defaultLanguage: 'fr', theme: { accent: 'green' } };
  assert.throws(() => withConfig(c), err => {
    assert.ok(err instanceof ConfigError);
    const all = err.problems.join('\n');
    assert.match(all, /person\.name fehlt/);
    assert.match(all, /href muss mit/);
    assert.match(all, /titel ist unbekannt/);
    assert.match(all, /defaultLanguage "fr"/);
    assert.match(all, /theme\.accent muss eine Hex-Farbe/);
    return true;
  });
});

test('broken JSON gives a readable error', () => {
  assert.throws(() => withConfig('{ "person": '), /Kein gültiges JSON/);
});
