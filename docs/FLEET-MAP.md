# Praetor Fleet Map

Route: `#/fleet-map` (Home tile **Fleet Map**).

## Why live never showed (root cause, 2026-09-24)
The client fetched `https://api.adsb.lol/v2/type/E545|E550` directly from the browser. ADSB.lol returns
**no `Access-Control-Allow-Origin` header**, so every browser (iPhone Safari included) blocks the response
(`corsError: MissingAllowOriginHeader`) and the page always fell back to the hourly last-known store.
Tested from `https://kerrywyatt-prog.github.io` (headless Chrome, 390×844, iOS Safari UA):

| Provider / endpoint | Browser CORS |
| --- | --- |
| api.adsb.lol `/v2/type`, `/v2/hex`, `/v2/icao`, `/v2/callsign`, `/api/0/routeset` | ✗ no ACAO header |
| api.airplanes.live `/v2/type`, `/v2/hex` | ✗ no ACAO (and 403 "contact us" for scripted use) |
| opendata.adsb.fi `/api/v2/hex`, `/icao`, `/callsign` | ✗ no ACAO (`/v2/type` = 400) |
| opensky-network.org `/api/states/all` | ✗ connection closed from box (unverified) |
| api.adsbdb.com `/v0/callsign`, `/v0/aircraft` | ✓ `ACAO: *` — but no positions; LXJ callsigns = "unknown callsign" |
| raw.githubusercontent.com | ✓ `ACAO: *` (CDN caches each URL ~5 min, ignores query strings) |

## Live data path (box relay)
- `scripts/fleet-live-daemon.py` runs on the box (Grok Bot machine) and polls every **60 s** while anything is
  airborne (5 min when nothing is), cycles aligned to UTC minute boundaries:
  - ADSB.lol `/v2/type/E545` + `/v2/type/E550`, kept if hex is in the roster or callsign `LXJ*`
  - every 3rd cycle ADSB.lol `/v2/hex/<roster hexes not seen>` (batches of 40)
  - if ADSB.lol fails (e.g. 429): adsb.fi `/api/v2/hex/<roster hexes>` fallback
- Publishes to branch **`fleet-live`** (not `main` → no Pages builds, no conflicts with site releases):
  - `m/<floor(unix/60)>.json` written for the current and next 1–2 minutes (up to 6 when idle) each cycle. The client at
    minute B fetches `m/<minute of (now − 25 s)>.json` (i.e. `m/<B>.json` from B:25) — a URL that always exists and holds data ≤1–2 min old (usually ~25 s), so the
    raw CDN can never serve anything staler. Buckets older than 10 min are deleted.
  - `live.json` (latest; fallback, may be ≤5 min stale on the CDN).
- State (flight segmentation, trails) lives in `/workspace/flexjet-fleet-live-state/` on the box.
- `scripts/update-fleet-last-known.py` (the hourly routine) reuses the relay snapshot when fresh (<5 min) instead
  of re-polling, and starts the relay if it is not running (`FLEET_LIVE_ENSURE=0` disables).
- Tradeoff: one small commit per minute on `fleet-live` while aircraft are airborne.

## Client
- Fetch order: `m/<current minute>.json` → `m/<previous minute>.json` → `fleet-live/live.json` →
  Pages `data/fleet-last-known.json` → `data/fleet-map-snapshot.json`. Merged with last-known for aircraft not in the relay.
- Refresh once a minute (at :25) **only while the tab is visible**; immediate refresh on return to the tab.
- Badge: **LIVE · updated Xs ago** when the relay file is < 7 min old, else **Last known · h:mm ET**.
- An aircraft is **LIVE** when its position is < 3 min old. ✈ green (rotated to track) = airborne;
  ■ amber = on ground; dimmed = last known.
- No direct ADS-B API calls from the browser (they are CORS-blocked).

## Roster
`flexjet-study-app/data/praetor-fleet-roster.json` — base roster from the **Flexjet fleet list (Oct 30 2025)**:
94 tails (76 Praetor 500 / EMB-545, 18 Praetor 600 / EMB-550), each with serial number
(5501xxxx = Praetor 500, 5502xxxx = Praetor 600). Only tail / serial / type are published.

- Every tail, serial and model cross-checked against the public FAA Aircraft Registry N-number inquiry.
- Mode-S hex: earlier observed values (ADSB.lol / flightdb.net) kept — all match FAA; the rest filled from the FAA registry "Mode S Code (Base 16 / Hex)". Never fabricated.
- 8 flagged tails (not on the company list), for **102 tails total** (83 E545 / 19 E550):
  - 6 from the earlier public-source roster (N274FX N275FX N279FX N281FX N434FX N619FX), kept with `flag: "not on company fleet list dated Oct 30 2025"`.
  - N272FX and N273FX, flagged "not on company fleet list dated Oct 30 2025; FAA-registered c/o Flexjet LLC 2026".
- UI: serial number on the click card and aircraft list; collapsible roster table (tail / type / serial / position / note) under the map.
- No serial ↔ checklist-effectivity mapping is made (unconfirmed).

## Tap card fields
| Field | Source | Real / estimate |
| --- | --- | --- |
| Tail, type, S/N, roster note | roster (Flexjet fleet list Oct 30 2025 + FAA registry) | real |
| Callsign, altitude (baro ft, FL at/above 18,000), ground speed, track / heading, vertical rate, squawk, emergency, on-ground flag, coordinates, position age | public ADS-B (ADSB.lol / adsb.fi) | real (as reported) |
| Departed (est.) | nearest jet-capable airport (OurAirports, paved ≥3,500 ft; `scripts/airports-jet.csv`) to the last on-ground ADS-B fix before takeoff, or to the first fix of a flight if climbing through < 5,000 ft; otherwise "Not determined" | **estimate**, labelled |
| On ground at (est.) / Last landed (est.) | nearest airport (≤5 nm) to on-ground fixes | **estimate**, labelled |
| Destination | only if a callsign-route DB (adsbdb.com) returns one — shown as "unverified"; otherwise **"Not published (fractional flight)"** | never invented |
| Track line | relay's recorded positions for the current/latest flight (≈1/min, up to 4 h) | real |

No next-filed / schedule data is shown. Never implies Flexjet dispatch or Tailwind access.

## Coverage limitations
Public ADS-B is incomplete, delayed, filtered, or blocked. Last-known positions age out of usefulness and are informational only — not Flexjet dispatch/Tailwind data. GitHub Actions runners share public IP space; ADSB.lol may rate-limit or fail intermittently — the cumulative store still grows over successful polls.

## Fallback snapshot
`flexjet-study-app/data/fleet-map-snapshot.json` stores a last-known verified LXJ Praetor set captured at `2026-09-22T01:17:55Z` (4 aircraft). Used when both live and the automated last-known store are unavailable.
