#!/usr/bin/env python3
"""Recover the Wikimedia Commons credit (title, author, license) for every photo
in the measurement pool — by BYTE IDENTITY, not by guessing.

WHY THIS EXISTS
---------------
`vision/fetch-eval.sh` (deleted; recovered from git 0af5f83) saved only the 800px
`thumburl` bytes. It kept no file title, no author, no license and no page URL, so
the pool shipped with zero per-file provenance (KOSU-v7 §1F). Worse, the FILENAME
IS THE SEARCH TERM, NOT THE CONTENT: the script wrote `NN-<slug of the query>.jpg`
whatever Commons returned as hit #1, which is why `_dropped` says "17 (military
museum)" about a file called `17-knit-sweater-mannequin.jpg`.

HOW THE CREDIT IS PROVEN
------------------------
The search term is reconstructed from the slug, Commons is asked again, and each
candidate's 800px thumbnail is downloaded and hashed. A credit is only written when
`sha256(candidate thumbnail) == sha256(file on disk)`. That is identity, not
resemblance: the same bytes can only come from the same Commons file.

A candidate that merely "looks right" is NOT accepted, and a file whose bytes are
not reproduced by any candidate is reported as UNPROVEN — never given a made-up
credit. Commons search ranking drifts, so UNPROVEN is expected for some files and
is an honest outcome, not a failure of the method.

Usage:  python3 vision/eval/recover-credits.py [--limit N] [--out FILE]
"""
import argparse
import hashlib
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
PHOTOS = os.path.join(HERE, "photos")
API = "https://commons.wikimedia.org/w/api.php"
UA = "stitchu-eval/0.2 (damummyphus@gmail.com) credit-recovery"


def sha(b):
    return hashlib.sha256(b).hexdigest()


def get(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def term_of(filename):
    """`14-v-neck-dress-mannequin.jpg` -> `v neck dress mannequin`.

    The slug was produced by `tr ' ' '-' | tr -cd 'a-z0-9-'`, which is not
    invertible for terms that already contained a dash ("v-neck"). Commons search
    is tolerant of that; identity is proved by the hash, not by the term.
    """
    stem = re.sub(r"^\d+-", "", filename.rsplit(".", 1)[0])
    return stem.replace("-", " ")


def candidates(term, limit):
    q = urllib.parse.urlencode({
        "action": "query", "format": "json", "generator": "search",
        "gsrsearch": f"filetype:bitmap {term}", "gsrnamespace": "6",
        "gsrlimit": str(limit), "prop": "imageinfo",
        "iiprop": "url|extmetadata", "iiurlwidth": "800",
    })
    data = json.loads(get(f"{API}?{q}"))
    pages = data.get("query", {}).get("pages", {})
    out = []
    for p in sorted(pages.values(), key=lambda p: p.get("index", 99)):
        info = (p.get("imageinfo") or [{}])[0]
        if info.get("thumburl"):
            out.append((p.get("title", ""), info))
    return out


def plain(html):
    if not html:
        return ""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip()


def credit_of(title, info):
    em = info.get("extmetadata", {})

    def f(k):
        return plain((em.get(k) or {}).get("value", ""))
    page = "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(
        title.replace(" ", "_"))
    return {
        "commons_title": title,
        "commons_page": page,
        "author": f("Artist") or "YAYIN BULUNAMADI",
        "license": f("LicenseShortName") or "YAYIN BULUNAMADI",
        "license_url": f("LicenseUrl"),
        "credit_line": f("Credit"),
        "description": f("ImageDescription")[:300],
        "date": f("DateTimeOriginal"),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=8,
                    help="candidates per search term")
    ap.add_argument("--out", default=os.path.join(HERE, "credits.json"))
    ap.add_argument("--only", default=None, help="single filename, for debugging")
    args = ap.parse_args()

    files = sorted(f for f in os.listdir(PHOTOS) if f.lower().endswith(".jpg"))
    if args.only:
        files = [f for f in files if f == args.only]

    result = {}
    for name in files:
        disk = open(os.path.join(PHOTOS, name), "rb").read()
        want = sha(disk)
        term = term_of(name)
        rec = {"file": name, "bytes": len(disk), "sha256": want,
               "search_term": term, "status": "UNPROVEN",
               "candidates_checked": 0}
        try:
            cands = candidates(term, args.limit)
        except Exception as e:               # noqa: BLE001 - network is the point
            rec["error"] = f"{type(e).__name__}: {e}"
            result[name] = rec
            print(f"ERR   {name}: {rec['error']}", file=sys.stderr)
            continue
        for rank, (title, info) in enumerate(cands, 1):
            rec["candidates_checked"] = rank
            try:
                thumb = get(info["thumburl"])
            except Exception:                # noqa: BLE001
                continue
            if sha(thumb) == want:
                rec["status"] = "PROVEN"
                rec["match_rank"] = rank
                rec.update(credit_of(title, info))
                break
            time.sleep(0.2)
        print(f"{rec['status']:8} {name}  "
              f"{rec.get('commons_title', term)}")
        result[name] = rec
        time.sleep(0.6)

    with open(args.out, "w") as fh:
        json.dump(result, fh, indent=1, ensure_ascii=False, sort_keys=True)
    proven = sum(1 for r in result.values() if r["status"] == "PROVEN")
    print(f"\nPROVEN {proven} / {len(result)}  ->  {args.out}")


if __name__ == "__main__":
    main()
