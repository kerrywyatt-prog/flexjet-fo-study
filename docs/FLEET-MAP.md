# Praetor Fleet Map

Route: `#/fleet-map` (Home tile **Fleet Map**).

## Data source
- Live primary: ADSB.lol public type queries
  - `https://api.adsb.lol/v2/type/E545`
  - `https://api.adsb.lol/v2/type/E550`
- Client uses CORS `fetch` first. Live LXJ hits are merged with the cumulative store `flexjet-study-app/data/fleet-last-known.json`.
- If live fails: prefer `fleet-last-known.json`, then `/data/fleet-map-snapshot.json`. Snapshot / last-known modes are never presented as live.
- Tracker deep link for a selected aircraft: `https://adsb.lol/?icao=<hex>`.

## Exact client filter (live)
Only aircraft that pass all of these enter as **Live**:
1. Normalized ICAO type `t` / `type` is exactly `E545` or `E550`.
2. Callsign (`flight` or `callsign`) trims/uppercases and `startsWith('LXJ')`.
3. `lat` and `lon` are finite numbers.

Last-known entries keep prior positions when an airframe is not in the current live poll.

## Public roster (not invented)
`flexjet-study-app/data/praetor-fleet-roster.json` — honest incomplete US Flexjet EMB-545 / EMB-550 list:

| Source | What we took |
| --- | --- |
| [aircraftdata.org Flexjet LLC](https://aircraftdata.org/reg-name/flexjet-llc/) (FAA Aircraft Registry mirror) | Registration + FAA model `EMB-545` / `EMB-550` |
| [flightdb.net type E550](https://www.flightdb.net/type.php?type=E550) | Mode-S hex for Flexjet **Praetor 600** rows only |
| ADSB.lol live / `fleet-map-snapshot.json` | Hex + registration when observed with LXJ callsign |

Notes:
- FAA `EMB-545` / `EMB-550` covers Legacy and Praetor families; ICAO types are still E545/E550.
- Hex codes are included **only** when observed or listed publicly — never fabricated.
- Full official Flexjet / Tailwind roster may differ; a second pass can reconcile further.

## Automation — last-known poll
- Workflow: `.github/workflows/fleet-last-known.yml` (`Fleet last-known poll`)
  - Template committed as `docs/fleet-last-known.yml.example` (OAuth push lacks `workflow` scope). Copy to `.github/workflows/fleet-last-known.yml` on GitHub if the Action is not yet present.
- Schedule: every **20 minutes** (`*/20 * * * *`) + `workflow_dispatch`
- Script: `scripts/update-fleet-last-known.py`
  - Sequential E545 then E550 queries with **8s sleep** between types (rate-limit friendly)
  - Filter LXJ + type + position
  - Merge into `data/fleet-last-known.json` keyed by hex (else registration)
  - Updates `last_seen`, lat/lon, alt, gs, track, callsign when live; preserves prior last-known when not visible; `status`: `live` \| `last_known`
  - Bot commit **only if changed** (`flexjet-fleet-bot`); no force push

## UI
- **All fleet** (default) / **Live only** toggle
- Live markers: bright cyan; last-known: dimmer / ghost markers
- Detail card: Live vs Last known + age
- Manual **Refresh aircraft**; auto-refresh every **90 seconds** on `#/fleet-map`
- Topbar **Reload** (primary) + mobile sticky **Reload app** (and **Refresh aircraft** on Fleet Map)

## Refresh / cache bust
- Hard Reload clears SW/caches then navigates to `pathname + '?v=' + Date.now() + hash` so Home Screen PWAs pick new assets (`?v=18` on CSS/JS).

## Details card fields
Tail/registration, Praetor 500 vs 600, callsign, altitude, ground speed, heading/track, coordinates, Live/Last known + age, source, ADSB.lol tracker link.

Origin/destination/current route are shown only if a verified public source actually supplies them. This build does not invent route fields.

## Next publicly filed
UI always shows:

> Next publicly filed: No public next-filed flight available.

unless a genuinely future publicly filed leg is returned by a verified source (unlikely). Never imply Flexjet internal dispatch or Tailwind access.

## Coverage limitations
Public ADS-B is incomplete, delayed, filtered, or blocked. Last-known positions age out of usefulness and are informational only — not Flexjet dispatch/Tailwind data. GitHub Actions runners share public IP space; ADSB.lol may rate-limit or fail intermittently — the cumulative store still grows over successful polls.

## Fallback snapshot
`flexjet-study-app/data/fleet-map-snapshot.json` stores a last-known verified LXJ Praetor set captured at `2026-09-22T01:17:55Z` (4 aircraft). Used when both live and the automated last-known store are unavailable.
