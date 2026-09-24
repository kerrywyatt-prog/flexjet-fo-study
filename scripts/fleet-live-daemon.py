#!/usr/bin/env python3
"""Box-side live relay for the Fleet Map.

Why: every free ADS-B API tested (ADSB.lol, adsb.fi, airplanes.live) omits the
Access-Control-Allow-Origin header, so a browser on kerrywyatt-prog.github.io can
never read them directly. This daemon polls from the box and publishes
to the `fleet-live` branch; the client reads it from raw.githubusercontent.com
(which sends `Access-Control-Allow-Origin: *`).

raw.githubusercontent.com caches every URL for ~5 min and ignores query strings, so a
single fixed file would be up to 5 min stale. Instead each cycle (aligned to the start
of a UTC minute M, published ~10-20 s later) writes the same payload to
`m/<M>.json` … `m/<M+k>.json` (bucket = floor(unix_seconds / 60)). A client at minute B
requests `m/<B>.json` (at ~B:25); that URL always exists (pre-written by the previous
cycle) and holds data at most ~1-2 min old, usually ~25 s, so a CDN copy can never be
more stale than that. `live.json` is also written (fallback / hourly script).
Buckets older than 10 min are deleted from the branch tip.

Per cycle (~60 s while anything is airborne, ~5 min otherwise):
  * ADSB.lol /v2/type/E545 + /v2/type/E550, kept if hex is in the roster or callsign LXJ*
  * every 3rd cycle: ADSB.lol /v2/hex/<roster hexes not yet seen> (batched)
  * if ADSB.lol fails: adsb.fi /api/v2/hex/<roster hexes> (batched) fallback
Derived, clearly labelled estimates (never presented as fact):
  * departed_est  – nearest jet-capable airport to the last on-ground ADS-B fix, or to
                    the first low-altitude fix of a flight
  * on_ground_at_est / last_landed_est – nearest airport to on-ground fixes
  * route         – only if a callsign-route DB (adsbdb.com) actually returns one
Never fabricates positions, times or routes.
"""
from __future__ import annotations

import csv
import fcntl
import json
import math
import os
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROSTER = ROOT / "data" / "praetor-fleet-roster.json"
LAST_KNOWN = ROOT / "data" / "fleet-last-known.json"
AIRPORTS = ROOT / "scripts" / "airports-jet.csv"
STATE_DIR = Path(os.environ.get("FLEET_LIVE_STATE", "/workspace/flexjet-fleet-live-state"))
PUB_DIR = Path(os.environ.get("FLEET_LIVE_WORKTREE", "/workspace/flexjet-fleet-live"))
BRANCH = "fleet-live"
PUSH_URL = os.environ.get("FLEET_LIVE_PUSH_URL", "https://github.com/kerrywyatt-prog/flexjet-fo-study.git")
UA = "flexjet-fo-study-fleet-bot/1.1 (+https://github.com/kerrywyatt-prog/flexjet-fo-study)"
ACTIVE_INTERVAL = int(os.environ.get("FLEET_LIVE_INTERVAL", "60"))
IDLE_INTERVAL = int(os.environ.get("FLEET_LIVE_IDLE_INTERVAL", "300"))
HEX_BATCH = 40
TRAIL_MAX = 240
LIVE_WINDOW_S = 150
STOP = False


def log(msg: str) -> None:
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} {msg}", flush=True)


def iso(ts: float) -> str:
    return datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_iso(s):
    try:
        return datetime.strptime(s, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc).timestamp()
    except Exception:  # noqa: BLE001
        return None


def get_json(url: str, timeout: int = 30):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ---------- roster / airports ----------
def load_roster():
    by_hex, by_reg = {}, {}
    try:
        data = json.loads(ROSTER.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        log(f"WARN roster: {exc}")
        return by_hex, by_reg
    for ac in data.get("aircraft") or []:
        if ac.get("hex"):
            by_hex[ac["hex"].lower()] = ac
        if ac.get("registration"):
            by_reg[ac["registration"].upper()] = ac
    return by_hex, by_reg


def load_airports():
    out = []
    try:
        with AIRPORTS.open(encoding="utf-8") as fh:
            for r in csv.DictReader(fh):
                out.append((float(r["lat"]), float(r["lon"]), r["code"], r["name"], r["city"], r["region"], int(r["longest_rwy_ft"] or 0)))
    except Exception as exc:  # noqa: BLE001
        log(f"WARN airports: {exc}")
    return out


def nm_between(lat1, lon1, lat2, lon2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 3440.065 * 2 * math.asin(math.sqrt(min(1.0, a)))


def nearest_airport(airports, lat, lon, max_nm, min_rwy=0):
    best = None
    dlat = max_nm / 60.0
    for a in airports:
        if abs(a[0] - lat) > dlat or a[6] < min_rwy:
            continue
        d = nm_between(lat, lon, a[0], a[1])
        if d <= max_nm and (best is None or d < best[0]):
            best = (d, a)
    if not best:
        return None
    d, a = best
    return {"code": a[2], "name": a[3], "city": a[4], "region": a[5], "distance_nm": round(d, 1)}


# ---------- providers ----------
def alt_num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def has_pos(raw):
    lat, lon = alt_num(raw.get("lat")), alt_num(raw.get("lon"))
    return lat is not None and lon is not None and abs(lat) <= 90 and abs(lon) <= 180


def poll(by_hex, cycle_no, errors):
    """Return {hex: (raw, provider)} for roster / LXJ Praetors with a position."""
    seen = {}
    lol_ok = True
    for i, t in enumerate(("E545", "E550")):
        if i:
            time.sleep(3)
        try:
            for raw in get_json(f"https://api.adsb.lol/v2/type/{t}").get("ac") or []:
                hx = str(raw.get("hex") or "").lower()
                cs = str(raw.get("flight") or "").strip().upper()
                if not has_pos(raw):
                    continue
                if hx in by_hex or cs.startswith("LXJ"):
                    seen[hx] = (raw, "ADSB.lol")
        except Exception as exc:  # noqa: BLE001
            lol_ok = False
            errors.append(f"adsb.lol type {t}: {exc}")
    pending = [h for h in sorted(by_hex) if h not in seen]
    if lol_ok and cycle_no % 3 == 0:
        for s in range(0, len(pending), HEX_BATCH):
            time.sleep(3)
            try:
                for raw in get_json("https://api.adsb.lol/v2/hex/" + ",".join(pending[s:s + HEX_BATCH])).get("ac") or []:
                    hx = str(raw.get("hex") or "").lower()
                    if hx in by_hex and has_pos(raw):
                        seen[hx] = (raw, "ADSB.lol")
            except Exception as exc:  # noqa: BLE001
                errors.append(f"adsb.lol hex: {exc}")
                lol_ok = False
                break
    if not lol_ok:
        pending = [h for h in sorted(by_hex) if h not in seen]
        for s in range(0, len(pending), HEX_BATCH):
            time.sleep(1.5)
            try:
                for raw in get_json("https://opendata.adsb.fi/api/v2/hex/" + ",".join(pending[s:s + HEX_BATCH])).get("ac") or []:
                    hx = str(raw.get("hex") or "").lower()
                    if hx in by_hex and has_pos(raw):
                        seen[hx] = (raw, "adsb.fi")
            except Exception as exc:  # noqa: BLE001
                errors.append(f"adsb.fi hex: {exc}")
                break
    return seen


ROUTE_CACHE: dict = {}


def route_for(callsign):
    """adsbdb callsign route lookup (cached per UTC day). Returns dict or None."""
    if not callsign:
        return None
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    key = (callsign, day)
    if key in ROUTE_CACHE:
        return ROUTE_CACHE[key]
    res = None
    try:
        data = get_json(f"https://api.adsbdb.com/v0/callsign/{callsign}", timeout=15)
        fr = (data.get("response") or {}).get("flightroute") if isinstance(data.get("response"), dict) else None
        if fr and fr.get("origin") and fr.get("destination"):
            o, d = fr["origin"], fr["destination"]
            res = {
                "origin": {"code": o.get("icao_code"), "name": o.get("name")},
                "destination": {"code": d.get("icao_code"), "name": d.get("name")},
                "source": "adsbdb.com callsign route DB (crowdsourced; may be stale for fractional callsigns)",
            }
    except urllib.error.HTTPError as exc:
        if exc.code != 404:
            res = None
    except Exception:  # noqa: BLE001
        res = None
    ROUTE_CACHE[key] = res
    return res


# ---------- state ----------
def load_state():
    p = STATE_DIR / "state.json"
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            pass
    # seed from committed last-known store (historical positions only)
    st = {"aircraft": {}}
    try:
        lk = json.loads(LAST_KNOWN.read_text(encoding="utf-8")).get("aircraft") or {}
        for hx, e in lk.items():
            ts = parse_iso(e.get("last_seen") or "")
            if ts is None or e.get("lat") is None:
                continue
            st["aircraft"][hx] = {"last": {k: e.get(k) for k in ("registration", "type", "callsign", "lat", "lon", "alt_baro", "alt_geom", "gs", "track", "true_heading", "mag_heading")},
                                  "pos_ts": ts, "provider": "ADSB.lol (last-known store)", "on_ground": e.get("alt_baro") == "ground", "trail": []}
    except Exception as exc:  # noqa: BLE001
        log(f"WARN seed: {exc}")
    return st


def save_state(st):
    tmp = STATE_DIR / "state.json.tmp"
    tmp.write_text(json.dumps(st), encoding="utf-8")
    tmp.replace(STATE_DIR / "state.json")


FIELDS = ("alt_baro", "alt_geom", "gs", "track", "true_heading", "mag_heading", "baro_rate", "geom_rate", "squawk", "emergency", "lat", "lon")


def update_aircraft(st, hx, raw, provider, now, airports, roster_entry):
    seen_pos = alt_num(raw.get("seen_pos")) or alt_num(raw.get("seen")) or 0.0
    ts = now - seen_pos
    prev = st["aircraft"].get(hx) or {}
    last = {k: raw.get(k) for k in FIELDS}
    last["lat"], last["lon"] = float(raw["lat"]), float(raw["lon"])
    last["callsign"] = str(raw.get("flight") or "").strip().upper() or None
    last["registration"] = (roster_entry or {}).get("registration") or str(raw.get("r") or "").upper() or None
    last["type"] = str(raw.get("t") or "").upper() or (roster_entry or {}).get("icao_type")
    gs = alt_num(raw.get("gs"))
    on_ground = raw.get("alt_baro") == "ground" or (gs is not None and gs < 40 and (alt_num(raw.get("alt_baro")) or 0) < 15000)
    prev_ts = prev.get("pos_ts") or 0
    gap = ts - prev_ts
    e = dict(prev)
    e.update({"last": last, "pos_ts": ts, "provider": provider, "on_ground": on_ground})
    trail = list(prev.get("trail") or [])
    alt = "G" if raw.get("alt_baro") == "ground" else alt_num(raw.get("alt_baro"))
    if on_ground:
        apt = nearest_airport(airports, last["lat"], last["lon"], 5)
        if prev and not prev.get("on_ground") and 0 < gap < 1800 and prev.get("flight"):
            e["last_landed_est"] = {"airport": apt, "time": iso(ts), "method": "nearest airport to first on-ground ADS-B fix after flight"}
        ground_since = prev.get("ground_since") if prev.get("on_ground") and gap < 3600 else ts
        e["ground_since"] = ground_since
        e["on_ground_at_est"] = apt
        e["last_ground_fix"] = {"lat": last["lat"], "lon": last["lon"], "time": iso(ts), "airport": apt}
        if prev.get("flight"):
            e["prev_flight"] = prev.get("flight")
        e["flight"] = None
        trail = trail[-TRAIL_MAX:]
    else:
        flight = prev.get("flight")
        lg = prev.get("last_ground_fix")
        if prev.get("on_ground") and 0 < gap < 1800 and lg:
            flight = {"start": iso(ts), "departed_est": {"airport": lg.get("airport"), "time": lg.get("time"),
                      "method": "nearest airport to last on-ground ADS-B fix before takeoff"}}
            trail = [[round(lg["lat"], 4), round(lg["lon"], 4), "G"]]
        elif not flight or gap > 2700:
            dep = None
            a = alt_num(raw.get("alt_baro"))
            vr = alt_num(raw.get("baro_rate"))
            if vr is None:
                vr = alt_num(raw.get("geom_rate"))
            if a is not None and a < 5000 and vr is not None and vr > 500:
                apt = nearest_airport(airports, last["lat"], last["lon"], 10, min_rwy=5000) or nearest_airport(airports, last["lat"], last["lon"], 6)
                if apt:
                    dep = {"airport": apt, "time": iso(ts), "method": f"nearest airport to first ADS-B fix of this flight (climbing through {int(a)} ft)"}
            flight = {"start": iso(ts), "departed_est": dep,
                      "first_seen": {"time": iso(ts), "alt_baro": raw.get("alt_baro")}}
            trail = []
        e["flight"] = flight
        e["on_ground_at_est"] = None
        e["ground_since"] = None
    moved = True
    if trail:
        lt = trail[-1]
        moved = nm_between(lt[0], lt[1], last["lat"], last["lon"]) >= (0.1 if on_ground else 0.5)
    if not trail or (moved and (ts - (e.get("trail_last_ts") or 0)) >= 55):
        trail.append([round(last["lat"], 4), round(last["lon"], 4), alt])
        e["trail_last_ts"] = ts
    e["trail"] = trail[-TRAIL_MAX:]
    st["aircraft"][hx] = e


def build_live(st, now, by_hex, providers, errors, route_cache_lookup=True):
    out = []
    airborne = ground = live = 0
    for hx, e in st["aircraft"].items():
        last = e.get("last") or {}
        if last.get("lat") is None:
            continue
        r = by_hex.get(hx) or {}
        pos_ts = e.get("pos_ts") or 0
        is_live = now - pos_ts <= LIVE_WINDOW_S
        if is_live:
            live += 1
            if e.get("on_ground"):
                ground += 1
            else:
                airborne += 1
        flight = e.get("flight") or {}
        route = route_for(last.get("callsign")) if (is_live and not e.get("on_ground") and route_cache_lookup) else None
        trail = e.get("trail") or []
        if now - pos_ts > 6 * 3600:
            trail = []
        out.append({
            "hex": hx,
            "registration": r.get("registration") or last.get("registration"),
            "type": r.get("icao_type") or last.get("type"),
            "model": r.get("label") or ("Praetor 600" if last.get("type") == "E550" else "Praetor 500"),
            "serial_number": r.get("serial_number"),
            "roster_flag": r.get("flag"),
            "in_roster": bool(r),
            "callsign": last.get("callsign"),
            **{k: last.get(k) for k in FIELDS},
            "on_ground": bool(e.get("on_ground")),
            "pos_time": iso(pos_ts),
            "source": e.get("provider"),
            "departed_est": flight.get("departed_est") if not e.get("on_ground") else None,
            "first_seen_this_flight": flight.get("first_seen") if not e.get("on_ground") else None,
            "on_ground_at_est": e.get("on_ground_at_est") if e.get("on_ground") else None,
            "ground_since": iso(e["ground_since"]) if e.get("on_ground") and e.get("ground_since") else None,
            "last_landed_est": e.get("last_landed_est"),
            "route": route,
            "trail": trail,
        })
    out.sort(key=lambda a: a["registration"] or "")
    return {
        "generated_at": iso(now),
        "generator": "box relay scripts/fleet-live-daemon.py",
        "cycle_seconds": ACTIVE_INTERVAL if airborne else IDLE_INTERVAL,
        "live_window_seconds": LIVE_WINDOW_S,
        "providers": providers,
        "errors": errors,
        "counts": {"live": live, "airborne": airborne, "on_ground": ground, "stored": len(out)},
        "notes": [
            "Positions: public ADS-B (ADSB.lol, fallback adsb.fi) relayed by the box. Not Flexjet dispatch/Tailwind data.",
            "departed_est / on_ground_at_est / last_landed_est are ESTIMATES: nearest jet-capable airport (OurAirports) to ADS-B fixes.",
            "route is present only when a callsign-route DB returns one; fractional (LXJ) flights normally publish no destination.",
        ],
        "aircraft": out,
    }


# ---------- publishing ----------
def git(*args, cwd=PUB_DIR, timeout=90):
    return subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, timeout=timeout)


def ensure_worktree():
    if (PUB_DIR / ".git").exists():
        return True
    r = git("ls-remote", "--heads", PUSH_URL, BRANCH, cwd=ROOT)
    if BRANCH in (r.stdout or ""):
        git("fetch", PUSH_URL, f"{BRANCH}:{BRANCH}", cwd=ROOT)
        r = git("worktree", "add", str(PUB_DIR), BRANCH, cwd=ROOT)
    else:
        r = git("worktree", "add", "--orphan", "-b", BRANCH, str(PUB_DIR), cwd=ROOT)
    if r.returncode != 0:
        log(f"worktree error: {r.stderr.strip()}")
        return False
    return True


def publish(payload, cycle_start):
    if not ensure_worktree():
        return False
    body = json.dumps(payload, separators=(",", ":")) + "\n"
    (PUB_DIR / "live.json").write_text(body, encoding="utf-8")
    mdir = PUB_DIR / "m"
    mdir.mkdir(exist_ok=True)
    minute = int(cycle_start // 60)
    ahead = max(2, math.ceil(payload["cycle_seconds"] / 60) + 1)
    for b in range(minute, minute + ahead + 1):
        (mdir / f"{b}.json").write_text(body, encoding="utf-8")
    for old in mdir.glob("*.json"):
        try:
            if int(old.stem) < minute - 10:
                old.unlink()
        except ValueError:
            pass
    readme = PUB_DIR / "README.md"
    if not readme.exists():
        readme.write_text("# fleet-live\n\nMachine-written by `scripts/fleet-live-daemon.py` (box relay). `live.json` = latest public ADS-B positions for the Fleet Map. Do not edit by hand.\n", encoding="utf-8")
    git("add", "-A", "live.json", "README.md", "m")
    ident = []
    if not (os.environ.get("GIT_AUTHOR_EMAIL") or git("config", "user.email").stdout.strip()):
        ident = ["-c", "user.name=Kerry Wyatt", "-c", "user.email=kerrywyatt@gmail.com"]
    c = payload["counts"]
    r = git(*ident, "commit", "-q", "-m", f"live: {payload['generated_at']} live={c['live']} air={c['airborne']}")
    if r.returncode != 0 and "nothing to commit" not in (r.stdout + r.stderr):
        log(f"commit error: {r.stderr.strip()}")
        return False
    r = git("push", "-q", PUSH_URL, f"HEAD:refs/heads/{BRANCH}")
    if r.returncode != 0:
        log(f"push error: {r.stderr.strip()[:300]}")
        return False
    return True


def run_once(st, cycle_no, airports, cycle_start):
    by_hex, _ = load_roster()
    errors = []
    now0 = time.time()
    seen = poll(by_hex, cycle_no, errors)
    now = time.time()
    for hx, (raw, provider) in seen.items():
        update_aircraft(st, hx, raw, provider, now, airports, by_hex.get(hx))
    providers = sorted({p for _, p in seen.values()}) or []
    payload = build_live(st, now, by_hex, providers, errors)
    save_state(st)
    (STATE_DIR / "live.json").write_text(json.dumps(payload), encoding="utf-8")
    ok = publish(payload, cycle_start)
    c = payload["counts"]
    log(f"cycle {cycle_no}: seen={len(seen)} live={c['live']} air={c['airborne']} gnd={c['on_ground']} errors={len(errors)} pushed={ok} ({time.time() - now0:.1f}s)")
    return payload


def main() -> int:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    lock = open(STATE_DIR / "daemon.lock", "w")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        log("another daemon holds the lock; exiting")
        return 0
    (STATE_DIR / "daemon.pid").write_text(str(os.getpid()))

    def _stop(*_):
        global STOP
        STOP = True
    signal.signal(signal.SIGTERM, _stop)
    signal.signal(signal.SIGINT, _stop)
    once = "--once" in sys.argv
    airports = load_airports()
    st = load_state()
    cycle = 0
    while not STOP:
        start = time.time()
        try:
            payload = run_once(st, cycle, airports, start)
            interval = payload["cycle_seconds"]
        except Exception as exc:  # noqa: BLE001
            log(f"cycle error: {exc}")
            interval = ACTIVE_INTERVAL
        cycle += 1
        if once:
            break
        # next cycle at a UTC minute boundary >= start + interval (keeps bucket files aligned)
        nxt = (int((start + interval - 5) // 60) + 1) * 60 + 1
        while not STOP and time.time() < nxt:
            time.sleep(1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
