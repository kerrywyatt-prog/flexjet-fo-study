#!/usr/bin/env python3
"""Job A+B: Praetor 600-primary bank + Kerry-style source/explanation fields.
Reads/writes site data under data/. Does not invent manual cites beyond CTH/AOM
already present on each item.
"""
from __future__ import annotations
import json, re, copy
from pathlib import Path

ROOT = Path("/workspace/flexjet-study-app/data")
REMOVED = []  # document for commit message

# --- 600-only rewrites for CTH comparative questions ---
# Answers/cites taken from existing CTH Rev 2.5 extraction (600 figures only).
SIX00 = {
    "7.1-1": {
        "q": "What is the length of the Praetor 600?",
        "a": "68’ 0.5”",
        "d": ["64’ 7”", "70’ 6.4”", "66’ 8”"],
        "explain": "Type class is the Praetor 600 — fuselage length 68 ft 0.5 in (the 500 is shorter; not your target).",
    },
    "7.1-2": {
        "q": "What is the height of the Praetor 600?",
        "a": "21’ 0.3”",
        "d": ["21’ 3”", "19’ 4”", "23’ 6”"],
        "explain": "P600 overall height is 21 ft 0.3 in. CTH also prints a 500 height; memorize the 600 figure.",
    },
    "7.1-3": {
        "q": "What is the wingspan of the Praetor 600?",
        "a": "70’ 6.4”",
        "d": ["68’ 0.5”", "64’ 7”", "74’ 2”"],
        "explain": "Same span as the 500 — 70 ft 6.4 in. Easy trap if you mix length and span.",
    },
    "7.1-4": {
        "q": "What is the minimum pavement width for a 180* turn (Praetor 600)?",
        "a": "56’",
        "d": ["52’5”", "48’2”", "64’7”"],
        "explain": "P600 needs 56 ft of pavement for a 180° turn (main gear). 52’5” is the 500 number — drop it.",
    },
    "7.7-25": {
        "q": "What is the total fuel capacity of the Praetor 600?",
        "a": "16,262 lbs.",
        "d": ["13,146 lbs.", "16,138 lbs.", "15,730 lbs."],
        "explain": "P600 total capacity 16,262 lb (wings + FWD/VTRL aux). 13,146 is the 500 wing-only figure.",
    },
    "7.7-26": {
        "q": "What is the total usable fuel for the Praetor 600?",
        "a": "16,138 lbs.",
        "d": ["13,058 lbs.", "16,262 lbs.", "15,990 lbs."],
        "explain": "P600 usable 16,138 lb. Capacity vs usable differ — don’t swap them, and ignore the 500 usable number.",
    },
    "7.22-1": {
        "q": "What is the Maximum Ramp Weight (MRW) of the Praetor 600?",
        "a": "42,990",
        "d": ["42,858", "37,699", "41,590"],
        "explain": "P600 MRW 42,990 lb. MTOW is 132 lb less (42,858). 37,699 is the 500 MRW.",
    },
    "7.22-2": {
        "q": "What is the Maximum Takeoff Weight (MTOW) of the Praetor 600?",
        "a": "42,858",
        "d": ["42,990", "37,567", "41,558"],
        "explain": "P600 MTOW 42,858 lb — know this cold for the oral. 37,567 is the 500 MTOW.",
    },
    "7.22-3": {
        "q": "What is the Maximum Landing Weight (MLW) of the Praetor 600?",
        "a": "37,479",
        "d": ["34,172", "42,858", "36,379"],
        "explain": "P600 MLW 37,479 lb. 34,172 is the 500 MLW — type class is the 600.",
    },
    "7.22-4": {
        "q": "What is the Maximum Zero Fuel Weight (MZFW) of the Praetor 600?",
        "a": "28,660",
        "d": ["25,959", "42,858", "27,260"],
        "explain": "P600 MZFW 28,660 lb; weight above MZFW must be fuel. 25,959 is the 500 MZFW.",
    },
    "7.24-2": {
        "q": "Describe Climb Schedule 1 (Praetor 600).",
        "a": "250 KIAS up to 10,000 ft; Climb at 250 KIAS and then Mach 0.66 up to selected altitude",
        "d": [
            "Climb at 250 KIAS and then Mach 0.72 up to selected altitude",
            "250 KIAS up to 10,000 ft; Climb at 250 KIAS and then Mach 0.74 up to selected altitude",
            "250 KIAS up to 10,000 ft; Acceleration from 250 KIAS up to 300 KIAS; Climb at 300 KIAS and then Mach 0.78 up to selected altitude",
        ],
        "explain": "Schedule 1 on the 600: 250 to 10k, then 250 / M0.66. Do not use the 500’s M0.72 Schedule 1.",
    },
    "7.24-5": {
        "q": "Describe Climb Schedule 3 (Praetor 600).",
        "a": "250 KIAS up to 10,000 ft; Acceleration from 250 KIAS up to 300 KIAS; Climb at 300 KIAS and the Mach 0.78 up to selected altitude",
        "d": [
            "250 KIAS up to 10,000 ft; Acceleration from 250 KIAS up to 280 KIAS; Climb at 280 KIAS and the Mach 0.74 up to selected altitude",
            "250 KIAS up to 10,000 ft; Climb at 250 KIAS and then Mach 0.72 up to selected altitude",
            "250 KIAS up to 10,000 ft; Acceleration from 250 KIAS up to 320 KIAS; Climb at 320 KIAS and the Mach 0.80 up to selected altitude",
        ],
        "explain": "Schedule 3 (high-speed climb): 250→10k, accel to 300, then 300 / M0.78. Same schedule numbers on 500/600 — learn the 600 wording.",
    },
    "7.24-8": {
        "q": "Describe the descent schedule that is used for planning (Praetor 600):",
        "a": "Schedule 1: Descent at Mach 0.74 then 250 KIAS down to sea level. Schedule 2: Descent at Mach 0.78 then 300 KIAS down to 10,000 ft; Deceleration from 300 KIAS to 250 KIAS at 10,000 ft; 250 KIAS down to sea level",
        "d": [
            "Schedule 1: Descent at Mach 0.78 then 300 KIAS down to sea level. Schedule 2: Descent at Mach 0.74 then 250 KIAS down to 10,000 ft; Deceleration from 250 KIAS to 200 KIAS at 10,000 ft; 200 KIAS down to sea level",
            "Schedule 1: Descent at Mach 0.74 then 280 KIAS down to sea level. Schedule 2: Descent at Mach 0.80 then 320 KIAS down to 15,000 ft; Deceleration from 320 KIAS to 250 KIAS at 15,000 ft; 250 KIAS down to sea level",
            "Schedule 1: Descent at Mach 0.70 then 250 KIAS down to sea level. Schedule 2: Descent at Mach 0.76 then 290 KIAS down to 10,000 ft; Deceleration from 290 KIAS to 250 KIAS at 10,000 ft; 250 KIAS down to sea level",
        ],
        "explain": "Two planning descents: S1 = M0.74→250 to SL; S2 = M0.78→300 to 10k, slow to 250, then 250 to SL. Shared 500/600 numbers — keep the 600 label.",
    },
}

# Soft-clean answers that still name both types in shared schedules already 600-only in SIX00
# 7.24-4 is already P600-only in bank.


def strip_ctH_echo(x: str, q: str, a: str) -> str | None:
    if not x:
        return None
    x = x.strip()
    # "The CTH answers “Q” with: “A”" or with “A” — so the statement is True/False.
    m = re.match(
        r'^The CTH answers [“"](.+?)[”"] with:?\s*[“"](.+?)[”"](?:\s*[—-]\s*so the statement is (True|False)\.)?$',
        x,
        re.S,
    )
    if m:
        return None  # will regenerate
    if x.startswith("The CTH answers"):
        return None
    return x


def kerry_explain(it: dict, sec: str) -> tuple[str, bool]:
    """Return (explain, pending). pending=True only if we lack a usable cite."""
    qid = it["id"]
    if qid in SIX00 and "explain" in SIX00[qid]:
        return SIX00[qid]["explain"], False

    cite = (it.get("cite") or "").strip()
    a = (it.get("a") or "").strip()
    q = (it.get("q") or it.get("s") or "").strip()
    note = (it.get("note") or "").strip()

    existing = strip_ctH_echo(it.get("x") or "", q, a)
    if existing and not existing.startswith("The CTH"):
        # keep hand-authored non-echo text if any
        explain = existing
    elif it.get("t") == "tf":
        if it.get("ans"):
            explain = f"True — this matches the CTH §{sec} systems review wording."
        else:
            explain = f"False — the CTH §{sec} wording does not support that statement."
        if a and a.lower() not in ("true.", "false.", "true", "false"):
            explain += f" Book answer: {a}"
    else:
        # Concise fact line from the book answer (Kerry: short, useful, no Q-parrot).
        one = a.replace("\n", " ").strip()
        if len(one) > 220:
            one = one[:217].rsplit(" ", 1)[0] + "…"
        if len(one) <= 90:
            explain = f"Book answer to memorize: {one}"
        else:
            explain = f"Per CTH §{sec}: {one}"

    if note:
        explain += f" (CTH printing note: {note})"

    pending = not bool(cite)
    if pending:
        explain = (
            "PENDING — no page cite on this item after checking CTH-SYSTEMS-QA / "
            "data/cth-systems-quiz.json; do not invent an AOM/AFM cite."
        )
    return explain, pending


def apply_600_item(it: dict) -> dict:
    qid = it["id"]
    if qid in SIX00:
        rw = SIX00[qid]
        it = dict(it)
        it["q"] = rw["q"]
        it["a"] = rw["a"]
        if it.get("t") == "mc" or "d" in it:
            it["d"] = rw["d"]
            it["t"] = "mc"
        REMOVED.append(f"CTH {qid}: rewritten to Praetor 600-only Q/A (dropped 500 figures)")
    return it


def transform_cth():
    path = ROOT / "cth-systems-quiz.json"
    data = json.loads(path.read_text())
    data["v"] = "26.8"
    data["source"] = "CTH Rev 2.5 §7 Systems Review Questions (Praetor 600 primary; 500-only figures removed)"
    data["aircraft"] = "Praetor 600 (EMB-550)"
    n_src = n_pend = 0
    for s in data["systems"]:
        new_items = []
        for it in s["items"]:
            it = apply_600_item(it)
            explain, pending = kerry_explain(it, s["sec"])
            it["explain"] = explain
            it["pending"] = pending
            # keep `x` as alias for older UI paths
            it["x"] = explain
            if pending:
                n_pend += 1
            else:
                n_src += 1
            new_items.append(it)
        s["items"] = new_items
    data["total"] = sum(len(s["items"]) for s in data["systems"])
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    return n_src, n_pend, data


def sync_systems(cth_data):
    path = ROOT / "systems.json"
    sys = json.loads(path.read_text())
    sys["source_note"] = (
        "Praetor 600 systems study for the FO site (type class = 600). "
        "One entry per Flexjet Crew Training Handbook Rev 2.5 §7 Systems Review Questions section "
        "(24 sections). Praetor 500-only figures removed; shared 500/600 facts kept with 600 wording. "
        "Each card has tap-to-reveal Source / explanation citing CTH (and AOM when the CTH cites it)."
    )
    by_id = {}
    for s in cth_data["systems"]:
        for it in s["items"]:
            by_id[it["id"]] = it
    n_src = n_pend = 0
    for s in sys["systems"]:
        for c in s.get("cards", []):
            m = re.match(r"(\d+\.\d+)-q(\d+)", c["id"])
            if not m:
                c["explain"] = "PENDING — card id not mapped to CTH §7 item; checked systems.json id scheme."
                c["pending"] = True
                n_pend += 1
                continue
            qid = f"{m.group(1)}-{int(m.group(2))}"
            it = by_id.get(qid)
            if not it:
                c["explain"] = f"PENDING — no CTH item {qid} in cth-systems-quiz.json."
                c["pending"] = True
                n_pend += 1
                continue
            # Keep systems cards in sync with 600 rewrites
            c["q"] = it["q"]
            c["a"] = it["a"]
            # Prefer systems-style cite if present, else quiz cite
            if not c.get("cite"):
                c["cite"] = it.get("cite")
            # If comparative cite only, refresh from quiz when we rewrote
            if qid in SIX00:
                # systems cite format: CTH Rev 2.5 p.XX (citing AOM …)
                c["cite"] = _systems_cite(it)
            c["explain"] = it["explain"]
            c["pending"] = bool(it.get("pending"))
            if c["pending"]:
                n_pend += 1
            else:
                n_src += 1
    path.write_text(json.dumps(sys, ensure_ascii=False, indent=2) + "\n")
    return n_src, n_pend


def _systems_cite(it: dict) -> str:
    cite = it.get("cite") or ""
    # "CTH 7.1 (p.22) · AOM 9-01-15" -> "CTH Rev 2.5 p.22 (citing AOM 9-01-15)"
    m = re.search(r"\(pp?\.\s*([^)]+)\)", cite)
    page = m.group(1).strip() if m else ""
    aom = None
    m2 = re.search(r"(AOM|AMO)\s*([\d-]+(?:\s*and\s*(?:AOM\s*)?[\d-]+)*)", cite)
    if m2:
        aom = re.sub(r"\s+", " ", m2.group(0)).replace("AMO", "AOM")
    if page and aom:
        return f"CTH Rev 2.5 p.{page} (citing {aom})"
    if page:
        return f"CTH Rev 2.5 p.{page}"
    return cite or "CTH Rev 2.5 §7"


def transform_limitations():
    path = ROOT / "limitations.json"
    lim = json.loads(path.read_text())
    lim["source_note"] = (
        "Praetor 600 limitations for the FO study. Type class is the 600 — Praetor 500-only "
        "limits and the old 500-vs-600 differences deck were removed. Sources: CTH Rev 2.5 §5 / §7, "
        "CFM Rev 3.3, MEL as cited on each card. Prefer Flexjet CTH/CFM over CAE."
    )
    lim["aircraft"] = "Praetor 600 (EMB-550)"

    drop_ids = {
        "general-04",  # Length P500
        "general-06",  # Wingspan P500
        "general-08",  # Height P500
        "weights-01", "weights-02", "weights-03", "weights-04",  # P500 weights
        "weights-10",  # CG P500
        "fuel-01", "fuel-02",  # P500 fuel
    }
    # Entire differences category is 500-vs-600 framing
    drop_cats = {"differences"}

    rewrites = {
        "general-05": ("Length", "68 ft 0.5 in"),
        "general-07": ("Wingspan", "70'6.4\""),
        "general-09": ("Height", "21'0.3\""),
        "general-10": (
            "180° turn minimum pavement width (main gear)",
            "56'00\"",
        ),
        "general-11": (
            "Wingtip wall-to-wall (180° turn)",
            "104'06\"",
        ),
        "weights-05": ("Max ramp weight", "42,990 lb"),
        "weights-06": ("Max takeoff weight", "42,858 lb"),
        "weights-07": ("Max landing weight", "37,479 lb"),
        "weights-08": ("Max zero fuel weight", "28,660 lb"),
        "weights-11": ("CG limits, %MAC", None),  # keep value, rename label
        "engine-18": ("Thrust rating TO-1", "7,570 lb"),
        "fuel-03": ("Total fuel capacity", None),
        "fuel-04": ("Usable fuel (pressure refuel)", None),
        "fuel-05": (
            "Refuel quantity",
            "Holds more fuel than listed; do not use the INCR button to max",
        ),
        "fuel-08": ("Aux tank transfer", None),  # already P600
        "navigation-17": (
            "Approach category",
            "Straight-in: CAT C · Circle: CAT C (all Flexjet Praetor)",
        ),
        "prohibitions-11": ("Passenger oxygen masks", "14"),
        "prohibitions-12": ("Passenger seats", "9"),
        "prohibitions-14": (
            "Life rafts",
            "2 rafts, 9 souls each, forward storage closet (CFM Rev 3.3 cockpit-setup card)",
        ),
    }

    new_cats = []
    for cat in lim["categories"]:
        if cat["id"] in drop_cats:
            for i in cat["items"]:
                REMOVED.append(f"limitations/{cat['id']}/{i['id']}: {i.get('label')} (500-vs-600 differences deck)")
            continue
        items = []
        for i in cat["items"]:
            iid = i["id"]
            if iid in drop_ids:
                REMOVED.append(f"limitations/{cat['id']}/{iid}: {i.get('label')} = {str(i.get('value'))[:60]}")
                continue
            if iid in rewrites:
                lab, val = rewrites[iid]
                old_lab, old_val = i.get("label"), i.get("value")
                i = dict(i)
                i["label"] = lab
                if val is not None:
                    i["value"] = val
                if "P500" in str(old_val) or "P500" in str(old_lab) or "500" in str(old_lab):
                    REMOVED.append(
                        f"limitations/{cat['id']}/{iid}: rewritten to 600-only "
                        f"({old_lab} → {i['label']})"
                    )
            # scrub leftover P500 mentions in remaining shared text
            blob = json.dumps(i)
            if re.search(r"P500|Praetor 500|\(P500\)", blob):
                i = dict(i)
                for k in ("label", "value", "note", "conflict"):
                    if isinstance(i.get(k), str):
                        i[k] = re.sub(
                            r"\s*[·•]\s*P500[^.·]*",
                            "",
                            i[k],
                        )
                        i[k] = re.sub(r"P500\s*[:=]?\s*[^·;]+[·;]?\s*", "", i[k])
                        i[k] = re.sub(r"Praetor 500[^.·]*[·;]?\s*", "", i[k])
                        i[k] = re.sub(r"\s*\(P500\)", "", i[k])
                        i[k] = re.sub(r"\s*P600\s*", " ", i[k])
                        i[k] = re.sub(r"\s{2,}", " ", i[k]).strip(" ·;")
                REMOVED.append(f"limitations/{cat['id']}/{iid}: scrubbed residual P500 text")
            # drop redundant (P600) from labels now that bank is 600-only
            if isinstance(i.get("label"), str):
                i = dict(i)
                i["label"] = re.sub(r"\s*\(P600\)", "", i["label"])
                i["label"] = re.sub(r"^P600\s+", "", i["label"])
            items.append(i)
        cat = dict(cat)
        if cat["id"] == "differences":
            continue
        # rename differences was dropped; rename weights titles that say P500
        if cat["id"] == "general":
            cat["title"] = "Kinds of operation, crew, dimensions"
        cat["items"] = items
        new_cats.append(cat)
    lim["categories"] = new_cats
    path.write_text(json.dumps(lim, ensure_ascii=False, indent=2) + "\n")


def transform_memory():
    path = ROOT / "memory-items.json"
    mem = json.loads(path.read_text())
    old = mem.get("aircraft")
    mem["aircraft"] = "Embraer Praetor 600 (EMB-550)"
    if old and "500" in old:
        REMOVED.append(f"memory-items aircraft label: {old} → {mem['aircraft']} (IAI content shared; no 500-only cards found)")
    # ensure no 500-only cards (audit)
    keep = []
    for c in mem["cards"]:
        blob = json.dumps(c)
        if re.search(r"Praetor 500|P500|EMB-?545|500-only", blob, re.I):
            REMOVED.append(f"memory-items/{c.get('id')}: removed 500-specific card {c.get('title')}")
            continue
        keep.append(c)
    mem["cards"] = keep
    path.write_text(json.dumps(mem, ensure_ascii=False, indent=2) + "\n")


def transform_study_meta():
    # Light touch on study.json oral Q that is already P600-focused; update any 500 primacy
    path = ROOT / "study.json"
    st = json.loads(path.read_text())
    # bump built note
    st["built"] = "2026-10-01"
    # scrub obvious 500-primary strings in gaps/pending if any
    def scrub(obj, path=""):
        if isinstance(obj, dict):
            return {k: scrub(v, path + "/" + k) for k, v in obj.items()}
        if isinstance(obj, list):
            return [scrub(v, path) for v in obj]
        if isinstance(obj, str) and "Praetor 500/600" in obj:
            return obj.replace("Praetor 500/600", "Praetor 600")
        return obj
    st = scrub(st)
    path.write_text(json.dumps(st, ensure_ascii=False, indent=2) + "\n")


def main():
    n_src, n_pend, cth = transform_cth()
    s_src, s_pend = sync_systems(cth)
    transform_limitations()
    transform_memory()
    transform_study_meta()
    report = ROOT.parent / "scripts" / "job-ab-report.txt"
    lines = [
        f"CTH quiz explains with source: {n_src}; PENDING: {n_pend}",
        f"systems.json cards with source: {s_src}; PENDING: {s_pend}",
        f"Removed/rewritten items ({len(REMOVED)}):",
        *REMOVED,
    ]
    report.write_text("\n".join(lines) + "\n")
    print("\n".join(lines[:5]))
    print(f"... total REMOVED log lines: {len(REMOVED)}")
    print("Wrote", report)


if __name__ == "__main__":
    main()
