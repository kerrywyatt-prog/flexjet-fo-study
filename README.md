# Flexjet FO Study App

Password-gated mobile-first study framework for Kerry Wyatt (Flexjet FO).

## Live URL
**https://kerrywyatt-prog.github.io/flexjet-fo-study/**

## Password
`flexjet!`

Unlock persists in `sessionStorage` for the browser tab session.

## Structure
- `index.html` — SPA shell
- `styles.css` — dark aviation UI
- `app.js` — routing, password gate, localStorage notes/checklist
- `manifest.json` + `sw.js` — PWA Add to Home Screen
- `icons/` — app icons

## Screens (after unlock)
1. **New hire / Orientation** — mindset, what to bring, note-taking
2. **Indoc** — capture / encode / open items + schedule placeholders
3. **Embraer Phenom 300** — systems shelves, memory, limitations, flows, notes
4. **Embraer Praetor** — same empty shelf structure (separate track)
5. **Study ritual** — 20–30 min daily framework
6. **Admin / open items** — checklist (localStorage; pre-seeded)
7. Stubs: Flashcards — coming next · Notifications — later

## Rebuild / local serve
```bash
cd /workspace/flexjet-study-app
# any static file server, e.g.
python3 -m http.server 8080
# then open http://localhost:8080
```

Push to `main` on `kerrywyatt-prog/flexjet-fo-study` to update GitHub Pages.

No proprietary Flexjet/Embraer manual content — framework + empty shelves only.
