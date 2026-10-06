# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

"AFK Blood Pressure & Exercise Journal" — a vanilla HTML/CSS/JS Progressive Web App for logging blood pressure, weight, BMI, and exercises. No framework, no bundler, no package.json, no tests, no linter. All data lives in the browser's `localStorage`.

## Running

Serve the directory over HTTP (opening the files via `file://` breaks `localStorage` sharing between pages and the service worker):

```
python -m http.server 8000
```

Then open http://localhost:8000/index.html.

## Architecture

Two pages, each loading one native ES module entry point from `js/` (`<script type="module">`). The pages share data only through `localStorage`.

- `index.html` → `js/index-page.js` — entry form (pre-fill, submit, erase all), using `js/exercise-queue.js` for the in-memory exercise queue.
- `logs.html` → `js/logs-page.js` — owns `loadEntries()` (filter → charts → entry list) and wires the controls. Uses `js/charts.js` (Chart.js + `chartjs-plugin-annotation`, loaded as globals from the CDN), `js/entries-view.js` (entry cards, inline edit/delete) and `js/backup.js` (CSV export/import, JSON backup/restore).
- Shared modules: `storage.js` (the only code that touches `localStorage`), `validation.js`, `health.js` (`calcBMI`, `TIME_BASED_EXERCISES`, `formatExercise`), `csv.js`, `toast.js`, `download.js`.
- `styles.css` is loaded by both pages; `logs.css` only by the logs page. The UI uses a deliberate retro/Windows-95 gray-and-navy look; don't change styling unless asked.

### localStorage schema

- `entries` — JSON array, appended in submission order (not sorted by date):
  `{ date: "YYYY-MM-DD", weight: string, bloodPressure: "120/80", bmi: string, exercises: [{ name, reps } | { name, time }] }`
  Numeric fields are stored as strings straight from the inputs. Exercises in `TIME_BASED_EXERCISES` (`running`, `outdoor-walk`, `cycling`) store `time` (minutes); all others store `reps`.
- `userHeight` — `{ feet, inches }`, overwritten on every submit; used to pre-fill the form and to recompute BMI when an entry is edited on the logs page.

Both import formats replace all existing data after a `confirm()`:
- **JSON backup** — `{ entries, userHeight }`, lossless.
- **CSV** — header `Date,Weight (lbs),BMI,Systolic (mmHg),Diastolic (mmHg),Exercises`, RFC 4180 quoting, exercises as `name: 50 reps; name: 30 min`. On import, columns are matched by header name (ignoring case and `(...)`), every row is validated, and one bad row aborts the whole import. A blank BMI is recomputed from `userHeight`. Inside exercise names, `;` and `\` are backslash-escaped (`\;`, `\\`); any other backslash is read literally, so older exports still import.

### Conventions that matter

- **Entry identity is the array index.** Storage keeps submission order; `loadEntries()` tags each entry with `_index`, then sorts by date, filters, and reverses for display. Edit/delete use `_index` against the raw stored array, so always tag before reordering.
- **Escape stored values before putting them in markup.** Use `escapeHTML` (`js/html.js`) in any template literal assigned to `innerHTML`, including attribute values; imported CSV/JSON is untrusted.
- **Dates are local `YYYY-MM-DD` strings.** Use `toLocalISODate` (`js/dates.js`), never `toISOString()`, which gives the UTC date.- **No inline handlers** (module scope isn't global). Generated buttons carry `data-action` / `data-index` and are handled by one delegated click listener per container (`#logs-container` in `entries-view.js`, `#exercise-queue` in `exercise-queue.js`); static controls are bound with `addEventListener` in the page entry module.
- Validators in `validation.js` return an error message or `null`; callers decide how to show it (`showToast(msg, "error")`, or `Row N: msg` for CSV). The form, the edit form, and CSV import all share them, so ranges live in one place.
- `csv.js`, `health.js` and `validation.js` are DOM-free and can be exercised directly in Node (`node --input-type=module -e "import ... from './js/csv.js'"`).
- User feedback uses toasts; `confirm()` is used only for destructive actions.

### PWA / service worker

`sw.js` is **cache-first** with a precache list (`ASSETS_TO_CACHE`, including the Chart.js CDN URLs). The CDN versions are pinned exactly (`chart.js@4.5.1`, `chartjs-plugin-annotation@3.1.0`); to upgrade, change the URL in both `logs.html` and `sw.js` (they must match for offline use). Consequences when editing:

- Bump `CACHE_NAME` (e.g. `health-tracker-v1` → `v2`) whenever any cached asset changes, or installed clients will keep serving stale files.
- Add any new local file (page, script, stylesheet, icon) to `ASSETS_TO_CACHE`.
- During development, use DevTools → Application → "Update on reload" / "Bypass for network", or unregister the worker, to see changes.

`manifest.json` defines the installable app (start URL `index.html`, SVG icons `icon.svg` / `icon-maskable.svg`).
