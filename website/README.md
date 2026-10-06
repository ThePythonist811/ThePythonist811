# Profilseite Cosmin Fiegen

Umsetzung des Claude-Design-Entwurfs `project/Profilseite Cosmin.dc.html`. Alle Inhalte stehen in **`config/profile.json`** und werden beim Start geladen.

Die Seite braucht kein JavaScript im Browser und hat keine npm-Abhängigkeiten. Die Schriften (Geist, Geist Mono, SIL OFL) liegen im Projekt selbst, es gehen also keine Anfragen an Google Fonts.

## Starten

```bash
npm start           # Server auf http://localhost:3000 (PORT und HOST per Umgebungsvariable)
npm run dev         # wie start, startet bei Änderungen an config/ oder src/ automatisch neu
npm run check       # prüft nur die Konfiguration
npm run build       # schreibt die Seite als statische Dateien nach dist/
npm test
```

Voraussetzung: Node.js 18 oder neuer.

**Inhalte ändern:** `config/profile.json` bearbeiten und den Server neu starten. Ist die Datei fehlerhaft, startet der Server nicht und listet alle Fehler auf einmal auf, mit Pfad wie `languages.de.sections[2].rows[1].href`. Mit `PROFILE_CONFIG=/pfad/zur/datei.json` lässt sich eine andere Datei verwenden.

## Aufbau der Konfiguration

| Feld | Bedeutung |
|---|---|
| `site.defaultLanguage` | Sprache unter `/`. Weitere Sprachen liegen unter `/<code>/`, z. B. `/en/`. |
| `site.baseUrl` | Öffentliche Adresse, z. B. `https://cosmin.example`. Daraus entstehen Canonical-, hreflang- und OG-Links. Leer lassen, solange es keine Domain gibt. |
| `site.indexable` | `false` setzt `noindex` und sperrt Suchmaschinen per `robots.txt`. |
| `site.theme` | Farben: `background`, `text`, `textSoft`, `muted`, `line`, `accent` (Hex). |
| `person` | `name`, `email`, `address`. Werden im Impressum über `{name}`, `{email}` und `{address}` eingesetzt. |
| `languages.<code>` | Alle Texte einer Sprache. Wenn es nur eine Sprache gibt, verschwindet der Umschalter. |
| `… .label` | Text im Sprachumschalter (`DE`, `EN`). |
| `… .meta.title`, `.meta.description` | Browser-Tab und Suchergebnis. |
| `… .role`, `.bio`, `.interests` | Kopfbereich unter dem Namen. |
| `… .facts[]` | Kennzahlen-Leiste: `{ "label", "value" }`. |
| `… .sections[]` | Abschnitte: `{ "title", "rows": [...] }`. Reihenfolge in der Datei = Reihenfolge auf der Seite. |
| `… .rows[]` | `meta` (Datum oder Stichwort, grün), `sub` (klein darunter), `title`, `href` (macht den Titel zum Link: `https://`, `mailto:` oder `tel:`), `text`, `extra` (kleine Zusatzzeile). Alle Felder sind optional. |
| `… .footer` | Text links im Footer. |
| `… .imprint` | `label` (Link-Text) und `lines` (Zeilen, die beim Aufklappen erscheinen). |

Jeder Abschnitt, jede Zeile und jede Kennzahl kann `"hidden": true` bekommen und wird dann ausgeblendet, ohne dass man ihn löschen muss.

## Mobil und Desktop

- Auf dem Desktop entspricht das Layout dem Entwurf: 1040 px Inhaltsbreite, Überschriftenspalte, Datumsspalte, Textspalte.
- Unter 600 px stapeln sich Überschrift, Datum und Text. Die Kennzahlen stehen zweispaltig, die Abstände sind kleiner. Auf iPhones berücksichtigt die Seite die Safe Areas, und die Sprach-Links sind mindestens 44 px hoch zum Antippen.
- Für den Ausdruck gibt es ein eigenes Stylesheet, schwarz auf weiß und ohne Umschalter.
- Außerdem: Skip-Link, sichtbarer Tastaturfokus, Person-Daten als JSON-LD und strenge Sicherheits-Header (CSP ohne Skripte).

## Veröffentlichen

- **Mit Server:** `npm start` hinter einem Reverse Proxy (Caddy, nginx) laufen lassen.
- **Statisch:** `npm run build` ausführen und `dist/` hochladen, z. B. auf GitHub Pages oder Netlify. Alle Links sind relativ, deshalb funktioniert die Seite auch in einem Unterordner. Nach jeder Änderung an der Konfiguration muss `npm run build` erneut laufen.
