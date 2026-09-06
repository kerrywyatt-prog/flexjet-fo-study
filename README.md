# Flexjet FO Study App

Password-gated mobile-first study framework for Kerry Wyatt (Flexjet FO).

## Password
`flexjet!`

Unlock persists in `sessionStorage` for the browser tab session.

## Structure
- `index.html` — SPA shell
- `styles.css` — dark aviation UI
- `app.js` — routing, password gate, localStorage notes/checklist
- `manifest.json` + `sw.js` — PWA Add to Home Screen
- `icons/` — app icons

## Screens
1. New hire / Orientation
2. Indoc
3. Embraer Phenom 300 (empty shelves)
4. Embraer Praetor (empty shelves)
5. Study ritual
6. Admin / open items
7. Flashcards / Notifications stubs

## Rebuild
Open `index.html` via any static server from this folder, or rebuild dist and redeploy.

```bash
cd /workspace/flexjet-study-app
# serve locally
npx --yes serve .
```

No proprietary Flexjet/Embraer manual content — framework + empty shelves only.
