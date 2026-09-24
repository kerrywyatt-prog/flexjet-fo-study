#!/usr/bin/env python3
"""Poll ADSB.lol for Flexjet Praetors and merge into data/fleet-last-known.json.

1. Type queries (E545, E550) filtered to LXJ callsigns.
2. Roster sweep: every tail in data/praetor-fleet-roster.json with a Mode-S hex that
   was not already seen in step 1 is queried by hex (batched), so roster tails are
   polled even when ADSB.lol lacks a type code or the crew files a non-LXJ callsign.
Entries are annotated with roster serial number / type. Never fabricates positions.

If the box live relay (scripts/fleet-live-daemon.py) has a fresh snapshot in
$FLEET_LIVE_STATE/live.json (< 5 min old), its sightings are reused instead of
re-polling ADSB.lol (avoids 429s). When run on the box, the script also makes sure
the relay daemon is running (set FLEET_LIVE_ENSURE=0 to disable).

Respects rate limits with sequential queries + sleep.
Commits are handled by the GitHub Action (only if this script changes the file).
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "fleet-last-known.json"
ROSTER = ROOT / "data" / "praetor-fleet-roster.json"
TYPES = ("E545", "E550")
API = "https://api.adsb.lol/v2/type/{}"
HEX_API = "https://api.adsb.lol/v2/hex/{}"
HEX_BATCH = 40
LIVE_STATE_DIR = Path(os.environ.get("FLEET_LIVE_STATE", "/workspace/flexjet-fleet-live-state"))
LIVE_FRESH_SEC = 300


def load_relay_snapshot():
    """Return the relay's live.json if fresh, else None."""
    p = LIVE_STATE_DIR / "live.json"
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        gen = datetime.strptime(data["generated_at"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except Exception:  # noqa: BLE001
        return None
    if (datetime.now(timezone.utc) - gen).total_seconds() > LIVE_FRESH_SEC:
        return None
    return data


def ensure_live_daemon() -> None:
    if os.environ.get("FLEET_LIVE_ENSURE", "1") == "0" or os.environ.get("GITHUB_ACTIONS"):
        return
    if not LIVE_STATE_DIR.exists():
        return
    pidf = LIVE_STATE_DIR / "daemon.pid"
    try:
        pid = int(pidf.read_text().strip())
        cmd = Path(f"/proc/{pid}/cmdline").read_bytes().decode(errors="ignore")
        if "fleet-live-daemon" in cmd:
            print(f"live relay running (pid {pid})", flush=True)
            return
    except Exception:  # noqa: BLE001
        pass
    logf = open(LIVE_STATE_DIR / "daemon.log", "a")
    proc = subprocess.Popen(
        [sys.executable, str(ROOT / "scripts" / "fleet-live-daemon.py")],
        cwd=str(ROOT), stdout=logf, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
        start_new_session=True,
    )
    print(f"started live relay (pid {proc.pid})", flush=True)
UA = "flexjet-fo-study-fleet-bot/1.0 (+https://github.com/kerrywyatt-prog/flexjet-fo-study)"
SLEEP_BETWEEN_TYPES_SEC = 12


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_roster() -> dict:
    """Return {hex_lower: roster_entry} plus registration index under key '_by_reg'."""
    by_hex, by_reg = {}, {}
    try:
        data = json.loads(ROSTER.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"WARN roster unreadable: {exc}", file=sys.stderr, flush=True)
        return {"by_hex": by_hex, "by_reg": by_reg}
    for ac in data.get("aircraft") or []:
        reg = str(ac.get("registration") or "").strip().upper()
        hx = str(ac.get("hex") or "").strip().lower()
        if reg:
            by_reg[reg] = ac
        if hx:
            by_hex[hx] = ac
    return {"by_hex": by_hex, "by_reg": by_reg}


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=45) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_hexes(hexes: list) -> list:
    return fetch_json(HEX_API.format(",".join(hexes))).get("ac") or []


def has_position(raw: dict) -> bool:
    try:
        lat_f = float(raw.get("lat"))
        lon_f = float(raw.get("lon"))
    except (TypeError, ValueError):
        return False
    return abs(lat_f) <= 90 and abs(lon_f) <= 180


def annotate(entry: dict, roster: dict) -> dict:
    ra = roster["by_hex"].get(str(entry.get("hex") or "").lower()) or roster["by_reg"].get(
        str(entry.get("registration") or "").upper()
    )
    if ra:
        if entry.get("registration") in (None, "", "UNKNOWN"):
            entry["registration"] = ra.get("registration")
        if not entry.get("type") and ra.get("icao_type"):
            entry["type"] = ra["icao_type"]
            entry["model"] = ra.get("label") or entry.get("model")
        entry["serial_number"] = ra.get("serial_number")
        entry["on_company_fleet_list"] = ra.get("on_company_fleet_list")
        if ra.get("flag"):
            entry["roster_flag"] = ra["flag"]
    return entry


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
        "baro_rate": raw.get("baro_rate"),
        "geom_rate": raw.get("geom_rate"),
        "squawk": raw.get("squawk"),
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
    roster = load_roster()
    print(f"roster: {len(roster['by_reg'])} tails, {len(roster['by_hex'])} with hex", flush=True)
    existing = load_existing()
    store = existing.get("aircraft") or {}
    if not isinstance(store, dict):
        store = {}

    seen_at = utc_now()
    live_keys = set()
    errors = []

    relay = load_relay_snapshot()
    if relay:
        for ac in relay.get("aircraft") or []:
            try:
                pos_ts = datetime.strptime(ac["pos_time"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
            except Exception:  # noqa: BLE001
                continue
            if (datetime.now(timezone.utc) - pos_ts).total_seconds() > 180 or not ac.get("hex"):
                continue
            k = ac["hex"].lower()
            raw = dict(ac)
            raw["flight"] = ac.get("callsign") or ""
            raw["t"] = ac.get("type") or ""
            raw["r"] = ac.get("registration") or ""
            entry = normalize_live(raw, ac["pos_time"])
            entry["source"] = f"box live relay ({ac.get('source') or 'ADS-B'})"
            store[k] = entry
            live_keys.add(k)
        print(f"relay snapshot {relay.get('generated_at')}: live={len(live_keys)} (skipping direct polls)", flush=True)
    for i, t in enumerate(TYPES if not relay else ()):
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

    # Roster sweep — poll roster tails by hex that the type queries did not return.
    pending = [] if relay else sorted(h for h in roster["by_hex"] if h not in live_keys)
    roster_hits = 0
    for start in range(0, len(pending), HEX_BATCH):
        batch = pending[start : start + HEX_BATCH]
        time.sleep(SLEEP_BETWEEN_TYPES_SEC)
        try:
            for raw in fetch_hexes(batch):
                hx = str(raw.get("hex") or "").strip().lower()
                if hx not in roster["by_hex"] or not has_position(raw):
                    continue
                ra = roster["by_hex"][hx]
                entry = normalize_live(raw, seen_at)
                if not entry["type"]:
                    entry["type"] = ra.get("icao_type") or ""
                entry["model"] = ra.get("label") or entry["model"]
                if entry["registration"] in ("", "UNKNOWN"):
                    entry["registration"] = ra.get("registration")
                entry["source"] = "ADSB.lol hex query (roster)"
                store[hx] = entry
                live_keys.add(hx)
                roster_hits += 1
        except Exception as exc:  # noqa: BLE001
            errors.append(f"hex batch {start // HEX_BATCH + 1}: {exc}")
            print(f"ERROR hex batch: {exc}", file=sys.stderr, flush=True)
    print(f"roster sweep: queried={len(pending)} extra_live={roster_hits}", flush=True)

    # Annotate every stored entry with roster serial/type (no positions touched).
    for k, entry in list(store.items()):
        if isinstance(entry, dict):
            store[k] = annotate(entry, roster)

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

    ensure_live_daemon()

    if not changed:
        print("No material change; skipping write", flush=True)
        return 0

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(new_text, encoding="utf-8")
    print(f"Wrote {OUT} live={len(live_keys)} stored={len(store)}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
