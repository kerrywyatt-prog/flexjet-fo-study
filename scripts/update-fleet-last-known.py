#!/usr/bin/env python3
"""Poll ADSB.lol for LXJ E545/E550 and merge into data/fleet-last-known.json.

Respects rate limits with sequential type queries + sleep.
Commits are handled by the GitHub Action (only if this script changes the file).
"""
from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "fleet-last-known.json"
TYPES = ("E545", "E550")
API = "https://api.adsb.lol/v2/type/{}"
UA = "flexjet-fo-study-fleet-bot/1.0 (+https://github.com/kerrywyatt-prog/flexjet-fo-study)"
SLEEP_BETWEEN_TYPES_SEC = 12


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch_type(icao_type: str) -> list:
    url = API.format(icao_type)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=45) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    return payload.get("ac") or []


def callsign(raw: dict) -> str:
    return str(raw.get("flight") or raw.get("callsign") or "").strip().upper()


def icao_type(raw: dict) -> str:
    return str(raw.get("t") or raw.get("type") or "").strip().upper()


def filter_lxj(records: list, expected_type: str) -> list:
    out = []
    for raw in records:
        t = icao_type(raw)
        cs = callsign(raw)
        if t != expected_type:
            continue
        if not cs.startswith("LXJ"):
            continue
        lat = raw.get("lat")
        lon = raw.get("lon")
        try:
            lat_f = float(lat)
            lon_f = float(lon)
        except (TypeError, ValueError):
            continue
        if not (abs(lat_f) <= 90 and abs(lon_f) <= 180):
            continue
        out.append(raw)
    return out


def key_for(raw: dict) -> str:
    hx = str(raw.get("hex") or "").strip().lower()
    if hx:
        return hx
    reg = str(raw.get("r") or raw.get("registration") or "").strip().upper()
    return reg or "unknown"


def normalize_live(raw: dict, seen_at: str) -> dict:
    t = icao_type(raw)
    return {
        "hex": str(raw.get("hex") or "").strip().lower() or None,
        "registration": str(raw.get("r") or raw.get("registration") or "UNKNOWN").strip().upper(),
        "type": t,
        "model": "Praetor 500" if t == "E545" else "Praetor 600",
        "callsign": callsign(raw),
        "lat": float(raw["lat"]),
        "lon": float(raw["lon"]),
        "alt_baro": raw.get("alt_baro"),
        "alt_geom": raw.get("alt_geom"),
        "gs": raw.get("gs"),
        "track": raw.get("track"),
        "true_heading": raw.get("true_heading"),
        "mag_heading": raw.get("mag_heading"),
        "last_seen": seen_at,
        "status": "live",
        "source": "ADSB.lol type query",
    }


def load_existing() -> dict:
    if not OUT.exists():
        return {
            "updated_at": None,
            "source": "ADSB.lol public type queries (cumulative last-known)",
            "notes": [
                "Keyed by Mode-S hex when available, else registration.",
                "Live polls update last_seen/position; aircraft not visible keep prior last-known.",
            ],
            "aircraft": {},
        }
    return json.loads(OUT.read_text(encoding="utf-8"))


def main() -> int:
    existing = load_existing()
    store = existing.get("aircraft") or {}
    if not isinstance(store, dict):
        store = {}

    seen_at = utc_now()
    live_keys = set()
    errors = []

    for i, t in enumerate(TYPES):
        try:
            raw = fetch_type(t)
            lxj = filter_lxj(raw, t)
            print(f"{t}: raw={len(raw)} lxj={len(lxj)}", flush=True)
            for ac in lxj:
                k = key_for(ac)
                if k == "unknown":
                    continue
                store[k] = normalize_live(ac, seen_at)
                live_keys.add(k)
        except Exception as exc:  # noqa: BLE001 — bot must continue other type
            errors.append(f"{t}: {exc}")
            print(f"ERROR {t}: {exc}", file=sys.stderr, flush=True)
        if i < len(TYPES) - 1:
            time.sleep(SLEEP_BETWEEN_TYPES_SEC)

    # Mark not-visible prior entries as last_known (preserve positions)
    for k, entry in list(store.items()):
        if k in live_keys:
            continue
        if isinstance(entry, dict):
            entry["status"] = "last_known"
            store[k] = entry

    out = {
        "updated_at": seen_at,
        "source": "ADSB.lol public type queries (cumulative last-known)",
        "notes": existing.get("notes")
        or [
            "Keyed by Mode-S hex when available, else registration.",
            "Live polls update last_seen/position; aircraft not visible keep prior last-known.",
        ],
        "last_poll": {
            "at": seen_at,
            "live_count": len(live_keys),
            "stored_count": len(store),
            "errors": errors,
        },
        "aircraft": store,
    }

    new_text = json.dumps(out, indent=2, sort_keys=False) + "\n"
    old_text = OUT.read_text(encoding="utf-8") if OUT.exists() else ""

    # Compare meaningful content (ignore updated_at-only churn when nothing live changed
    # — still write when live_keys non-empty or store keys/positions differ)
    def strip_volatile(obj: dict) -> dict:
        c = json.loads(json.dumps(obj))
        c.pop("updated_at", None)
        if "last_poll" in c:
            c["last_poll"] = {
                "live_count": c["last_poll"].get("live_count"),
                "stored_count": c["last_poll"].get("stored_count"),
                "errors": c["last_poll"].get("errors"),
            }
        # Normalize statuses for equality of positions
        return c

    changed = True
    if old_text:
        try:
            old = json.loads(old_text)
            # Always update if live aircraft present (refresh last_seen timestamps)
            # or if aircraft key set / positions differ
            old_ac = old.get("aircraft") or {}
            if not live_keys and set(old_ac.keys()) == set(store.keys()):
                # Check position/fields equality ignoring status/last_seen if nothing live
                def core(d):
                    return {
                        k: {
                            kk: vv
                            for kk, vv in v.items()
                            if kk not in ("status", "last_seen", "source")
                        }
                        for k, v in d.items()
                    }

                if core(old_ac) == core(store) and not errors:
                    # Still bump file if last_poll errors cleared differently — skip write
                    changed = False
        except json.JSONDecodeError:
            changed = True

    if live_keys:
        changed = True  # always persist fresh live sightings

    if not changed:
        print("No material change; skipping write", flush=True)
        return 0

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(new_text, encoding="utf-8")
    print(f"Wrote {OUT} live={len(live_keys)} stored={len(store)}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
