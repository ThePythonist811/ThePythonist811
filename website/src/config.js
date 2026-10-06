'use strict';

const fs = require('node:fs');

const COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const LANG = /^[a-z]{2}(?:-[A-Za-z]{2})?$/;
const ROW_FIELDS = ['meta', 'sub', 'title', 'text', 'extra', 'href'];
const THEME_KEYS = ['background', 'text', 'textSoft', 'muted', 'line', 'accent'];

class ConfigError extends Error {
  constructor(file, problems) {
    super(`Konfiguration ungültig (${file}):\n` + problems.map(p => '  - ' + p).join('\n'));
    this.problems = problems;
  }
}

/**
 * Reads and validates the profile config. Throws ConfigError with a list of
 * every problem found, so one restart is enough to see all mistakes.
 */
function loadConfig(file) {
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch (err) {
    throw new ConfigError(file, [`Datei nicht lesbar: ${err.message}`]);
  }
  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (err) {
    throw new ConfigError(file, [`Kein gültiges JSON: ${err.message}`]);
  }

  const problems = [];
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const str = (v, path, required) => {
    if (v === undefined || v === null || v === '') {
      if (required) problems.push(`${path} fehlt`);
      return;
    }
    if (typeof v !== 'string') problems.push(`${path} muss Text sein`);
  };

  if (!isObj(cfg)) throw new ConfigError(file, ['Oberste Ebene muss ein Objekt sein']);

  const site = cfg.site ?? {};
  if (!isObj(site)) problems.push('site muss ein Objekt sein');
  str(site.baseUrl, 'site.baseUrl', false);
  if (site.baseUrl && !/^https?:\/\//.test(site.baseUrl)) problems.push('site.baseUrl muss mit http:// oder https:// beginnen');
  if (site.indexable !== undefined && typeof site.indexable !== 'boolean') problems.push('site.indexable muss true oder false sein');
  const theme = site.theme ?? {};
  for (const [k, v] of Object.entries(theme)) {
    if (!THEME_KEYS.includes(k)) problems.push(`site.theme.${k} ist unbekannt (erlaubt: ${THEME_KEYS.join(', ')})`);
    else if (typeof v !== 'string' || !COLOR.test(v)) problems.push(`site.theme.${k} muss eine Hex-Farbe wie #c4dc5a sein`);
  }

  const person = cfg.person;
  if (!isObj(person)) problems.push('person fehlt');
  else {
    str(person.name, 'person.name', true);
    str(person.email, 'person.email', false);
    str(person.address, 'person.address', false);
  }

  const langs = cfg.languages;
  if (!isObj(langs) || Object.keys(langs).length === 0) {
    problems.push('languages muss mindestens eine Sprache enthalten');
  } else {
    for (const [code, l] of Object.entries(langs)) {
      const p = `languages.${code}`;
      if (!LANG.test(code)) problems.push(`${p}: Sprachcode muss wie "de" oder "en" aussehen`);
      if (!isObj(l)) { problems.push(`${p} muss ein Objekt sein`); continue; }
      str(l.label, `${p}.label`, false);
      if (l.meta !== undefined && !isObj(l.meta)) problems.push(`${p}.meta muss ein Objekt sein`);
      str(l.meta?.title, `${p}.meta.title`, false);
      str(l.meta?.description, `${p}.meta.description`, false);
      for (const k of ['role', 'bio', 'interests', 'footer']) str(l[k], `${p}.${k}`, false);

      if (l.facts !== undefined) {
        if (!Array.isArray(l.facts)) problems.push(`${p}.facts muss eine Liste sein`);
        else l.facts.forEach((f, i) => {
          if (!isObj(f)) return problems.push(`${p}.facts[${i}] muss ein Objekt sein`);
          str(f.label, `${p}.facts[${i}].label`, true);
          str(f.value, `${p}.facts[${i}].value`, true);
        });
      }

      if (l.sections !== undefined) {
        if (!Array.isArray(l.sections)) problems.push(`${p}.sections muss eine Liste sein`);
        else l.sections.forEach((s, i) => {
          const sp = `${p}.sections[${i}]`;
          if (!isObj(s)) return problems.push(`${sp} muss ein Objekt sein`);
          str(s.title, `${sp}.title`, true);
          if (!Array.isArray(s.rows)) return problems.push(`${sp}.rows muss eine Liste sein`);
          s.rows.forEach((r, j) => {
            const rp = `${sp}.rows[${j}]`;
            if (!isObj(r)) return problems.push(`${rp} muss ein Objekt sein`);
            for (const k of Object.keys(r)) {
              if (!ROW_FIELDS.includes(k) && k !== 'hidden') problems.push(`${rp}.${k} ist unbekannt (erlaubt: ${ROW_FIELDS.join(', ')}, hidden)`);
            }
            ROW_FIELDS.forEach(k => str(r[k], `${rp}.${k}`, false));
            if (!r.meta && !r.title && !r.text) problems.push(`${rp} braucht mindestens meta, title oder text`);
            if (r.href && !r.title) problems.push(`${rp}.href braucht einen title als Linktext`);
            if (typeof r.href === 'string' && r.href && !/^(https?:|mailto:|tel:)/.test(r.href)) problems.push(`${rp}.href muss mit https://, http://, mailto: oder tel: beginnen`);
          });
        });
      }

      if (l.imprint !== undefined) {
        if (!isObj(l.imprint)) problems.push(`${p}.imprint muss ein Objekt sein`);
        else {
          str(l.imprint.label, `${p}.imprint.label`, true);
          if (!Array.isArray(l.imprint.lines)) problems.push(`${p}.imprint.lines muss eine Liste sein`);
          else l.imprint.lines.forEach((x, i) => str(x, `${p}.imprint.lines[${i}]`, true));
        }
      }
    }
    if (site.defaultLanguage !== undefined && !(site.defaultLanguage in langs)) {
      problems.push(`site.defaultLanguage "${site.defaultLanguage}" ist keine der Sprachen unter languages`);
    }
  }

  if (problems.length) throw new ConfigError(file, problems);

  const codes = Object.keys(langs);
  return {
    site: {
      defaultLanguage: site.defaultLanguage ?? codes[0],
      baseUrl: (site.baseUrl ?? '').replace(/\/+$/, ''),
      indexable: site.indexable ?? true,
      theme: { ...theme }
    },
    person: { email: '', address: '', ...person },
    languages: langs,
    codes
  };
}

module.exports = { loadConfig, ConfigError };
