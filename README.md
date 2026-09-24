# Flexjet FO Study App

Password-gated mobile-first study framework for Kerry Wyatt (Flexjet FO).

## Live URL
**https://kerrywyatt-prog.github.io/flexjet-fo-study/**

## Password
`flexjet!`

Unlock persists in `localStorage` for this browser/device.

## Structure (v25)
- `index.html` — SPA shell (loads `study-v25.js` then `app-v5.js`)
- `app-v5.js` (= `app.js`) — core: gate, legacy views (Orientation, 135 bank/quiz, IAI flashcards, Fleet Map, Admin, Ritual, Notes); calls `FOStudyExt.route()` first
- `study-v25.js` — training-path views: Home "Where am I", Indoc hub, Checkride Prep, Drill engine, Checklists, Bulletins, Search, Gaps
- `styles-v5.css` — dark aviation UI (v25 block at the end)
- `data/study.json` — checkride prep content (built by `kerry/flexjet/praetor/checkride-prep/site-build/build_study_json.py`)
- `data/limitations.json`, `data/systems.json` — limitations / systems sets (separate worker; pages show "loading content" until present)
- `data/indoc-days.json` — Indoc Day 1–4 notes (security content excluded)
- `data/memory-items.json` (IAI, word-for-word), `data/135-recurrent-qa.json` (bank, word-for-word), fleet files

## Site map (hash routes)
- `#/` Home: where-am-I timeline, study today, search
- `#/indoc` → `day/1..4`, `flags[/N]`, `135` (study `/135/study[/N]`, quiz `/135/quiz`), Ops Specs `a..e`
- `#/checkride` → `structure`, `oral-flags`, `maneuvers[/N]`, `flows[/flow-N|/callouts]`, `memory[/id]`, `limits[/cat|/itemId]`, `systems[/id|/cardId]`, `mel[/iN]`, `fms`, `qa[/N]`
- `#/checklists` → `normal/10069|10070[/section]`, `walkaround[/section]`, `hpcart`
- `#/drill` → `qa[/TAG]`, `maneuvers`, `callouts`, `flows`, `limits[/cat|/conflicts]`, `systems[/id]`, `flags`, `ob`; IAI at `#/flashcards`
- `#/bulletins`, `#/gaps`, `#/search/<q>`, `#/fleet-map` (Tail Tracker)

Rules: no security-program content; no raw manual PDFs; memory items and the 135 bank are word-for-word; PENDING only where no source exists; source conflicts shown as "conflict — ask instructor"; no tail/serial ↔ checklist-effectivity mapping.

## Rebuild / local serve
```bash
cd /workspace/flexjet-study-app
# any static file server, e.g.
python3 -m http.server 8080
# then open http://localhost:8080
```

Push to `main` on `kerrywyatt-prog/flexjet-fo-study` to update GitHub Pages.

Study notes are summaries with page cites (CTH/CFM/MEL/ACS); no raw manual PDFs or bulk manual text.
