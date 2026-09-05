#!/bin/bash
# vocab_reference_check.sh — THE CLOSED-ENUM RATCHET (§6/V2 madde b).
#
# WHY THIS FILE EXISTS. engine/vocab.json is the single vocabulary authority
# (GECE/V2-R.md §3.3), and V2's direction is BREADTH -> DEPTH: the menu is to be
# dismantled, not grown. But nothing in this repo could tell you whether the
# menu was getting bigger or smaller. V0-0D §3 measured the spread once — 37
# axes, 132 values, `garment` alone referenced 1167 times in the narrow scope —
# and that number was a snapshot in a markdown file, which is to say a number
# nobody could break.
#
# WHAT IT ENFORCES. A ratchet, in the PHPStan / Android-lint class rather than
# the betterer class (GECE/V2-R.md §2.1): a committed baseline of counts, and a
# gate that goes RED when a count RISES. A count that FALLS leaves the gate
# green and does NOT rewrite the baseline — locking a decrease in is a separate,
# deliberate commit (`--baseline`), so the shrink is visible in the diff and
# cannot happen by accident. There is no published formula for "how many
# references are normal"; every source in §2.1 says the same thing — take
# today's number as the floor. So this baseline is measured, not chosen.
#
# HOW IT COUNTS — and why the counting method is not obvious.
# V0-0D §3 left two warnings and both are obeyed here:
#   1. NARROW SCOPE. Counting over the whole tree inflates by ~7.7x (`garment`
#      8978 wide vs 1167 narrow) because Logs/, docs/, reports/ and .git/ carry
#      transcripts of the words, not references to them. The scope below is
#      V0-0D's canonical list, verbatim.
#   2. THE "none" POLLUTION. 132 enum values collapse to 100 distinct words, and
#      the shared ones are almost all of the noise: "none" alone lives on 22
#      axes and a single grep for it counts all 22 at once. So VALUES ARE ONLY
#      COUNTED WHEN THE WORD BELONGS TO EXACTLY ONE AXIS (PAYLASIM=1, 92 of the
#      100 words). The 8 shared words are deliberately not in the baseline; a
#      ratchet built on them would be counting other axes' traffic.
# The healthy baseline is therefore 37 axis-NAME counts + 92 unique-VALUE
# counts. Each is one grep, and both greps are printed verbatim in the baseline
# file so any number in it can be reproduced by hand.
#
# WHY BOTH SIDES ARE MEASURED IN A DETACHED WORKTREE, NOT IN THE WORKING TREE.
# This is the k8s hack/verify-generated.sh move (GECE/V2-R.md §2.2b) and it is
# not decoration — it was forced by a measurement. Counting this repo's working
# tree on 2026-08-24 gave 10386 against a floor of 10349, twenty axes/words
# "risen". Every one of those 37 lines came from ANOTHER CARD'S UNCOMMITTED
# EDITS to contract/ (`git status --porcelain -- contract` showed two modified
# files) plus untracked .rabadon/ session dumps sitting inside the scope. The
# committed trees agree exactly: a6b473a..HEAD has a ZERO-line diff over the
# scope, and HEAD counted in a worktree reproduces the floor key for key.
# So the ratchet's unit is the COMMIT, which is also what the card asks for
# ("artiran commit kirmizi duser"): both the floor and today's number are read
# out of commit-addressable trees, and neither a parallel worker nor a stray
# node_modules can move them.
#
# WHY THE FLOOR IS NOT a6b473a, WHICH IS WHAT THE CARD ASKED FOR. Measured, not
# chosen: a6b473a counts 10349, and the tree this gate actually lands on counts
# 10416, +67. That rise is not a vocabulary change — engine/vocab.json is
# byte-identical across the range, still 37 axes and 132 values. Every one of
# the 67 lines was attributed to a file (the three lines below sum to exactly
# the gate's delta):
#     contract/vocab-resolution-v1.json  +25   V2-A, e5c9628 (registry entries)
#     contract/garment-spec-v2.md        +25   V2-A, e5c9628 (prose about the menu)
#     engine/tools/gen-vision-vocab.mjs  +17   THIS card (a generator's comments)
# A floor that is red on the day it is cut is not a ratchet, it is a disabled
# test — the exact failure this repo already lived through (preview_truth_check
# and figure_check spent weeks being waved past as "already broken", CLAUDE.md
# KOSU 2). So the floor is re-cut at the landing commit, the old number is kept
# below so the drift is not lost, and the card's contradiction is reported
# rather than papered over.
# KNOWN NOISE, unfixed on purpose: this signature counts prose. 25 of the 67 came
# from a markdown file inside contract/. The counting method is V0-0D §3's
# canonical grep verbatim, and changing it would make every number in this file
# incomparable to the one measurement anybody has; stability beats cleverness
# here. Read the per-key deltas before touching the baseline.
#   --tree <root>   counts an arbitrary directory instead. `--tree .` is how you
#                   check your own dirty working tree before committing, and it
#                   is how the mutation proof in GECE/V2-B.md breaks this gate.
#
# WHAT IT IS NOT. It is not a claim that the counted lines are all "real" uses:
# a grep for a bare word matches comments and generated tables too. It does not
# have to be exact to be a ratchet — it has to be STABLE and REPRODUCIBLE, so
# that a rise means something moved. Line-count signatures are noisy under file
# moves (detekt's warning, §2.1); when this gate fires, read the per-key deltas
# it prints before touching the baseline.
#
# HOW TO GO GREEN AFTER A DELIBERATE INCREASE. You do not. That is the point:
# adding a new reference to a closed enum is the thing being forbidden. If the
# vocabulary genuinely gained an axis or a value, that is a scope decision and
# the baseline is re-cut by hand with --baseline, in its own commit, with the
# reason in the message.
#
# IKI KOVA (F1 duzeltme turu 2, 2026-09-05; karar ajani 4).
# 9c35e10b'de taban ikinci kez YUKARI kesildi (11037 -> 11075) ve hakem bunu reward hacking saydi:
# artisin tamami body-v1 landmark adlarinin (waist/hip/elbow/bust) ve contract prose'unun sozluk
# kelimeleriyle CARPISMASIYDI, sozluk buyumemisti (engine/vocab.json bayt-ayni). 73113fa7 bunu bir
# 'beden' kovasiyla (dosya adina bagli istisna: body-v1.json, body*.hpp/.cpp) sayimdan cikardi; hakem
# onu da reward hacking saydi (kapinin icinde dosya listesine bagli ozel-durum). Kural artik:
# taban yukari kesilmez; carpisma KAYNAGINDA kesilir: landmark anahtarlari 'landmark.<ad>' namespace
# (contract'taki girth./length./width./angle. ile ayni bicim), dosya istisnasi YOK. Iki kova:
#   kod   : sozluge gercek referans olabilecek satirlar (eski grep ile ayni eslesme) — ratchet burada
#   prose : .md/.txt, yorum satirlari, JSON aciklama alanlari (_*, kaynak, tanim, not, anlam, ...) — basilir, hukum yok
# Iki kovanin toplami eski tek sayimin toplamina esittir; yontem satirlari yeniden boler, atmaz.
# Sayac python'da (grep -w / grep -F ile birebir ayni eslesme, satir basina bir), asagida count_tree icinde.
set -uo pipefail
export LC_ALL=C

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BASELINE="$ROOT/engine/tests/vocab-reference-baseline.json"

# V0-0D §3 canonical narrow scope, verbatim. Logs/ docs/ reports/ .git/ are out
# by construction: they are simply not on this list.
SCOPE=(contract engine/src engine/wasm engine/tools engine/pattern-bridge
       engine/vocab.json web/js recipes backend knowledge)
# V0-0D's four exclusions, plus two that only exist in a WORKING tree and are
# invisible to the commit path: .rabadon/ (agent session dumps, gitignored, and
# they sit INSIDE backend/, engine/src/ and engine/pattern-bridge/) and
# .wrangler/. Measured 2026-08-24: with V0-0D's four alone, `--tree .` read
# 10428 against a floor of 10416 on a tree whose scope files were all clean —
# all 12 lines were .rabadon transcripts. They are the same class as Logs/ and
# reports/, which V0-0D drops by construction. Adding them does not move the
# committed number: git never checks those paths out, so --baseline recuts
# byte-identical (verified).
EXCL=(--exclude-dir=__pycache__ --exclude-dir=.venv --exclude-dir=node_modules
      --exclude-dir=probe --exclude-dir=.rabadon --exclude-dir=.wrangler)

AXIS_GREP='grep -rIn --exclude-dir=__pycache__ --exclude-dir=.venv --exclude-dir=node_modules --exclude-dir=probe --exclude-dir=.rabadon --exclude-dir=.wrangler -w <AXIS> <SCOPE> | wc -l'
VALUE_GREP='grep -rIn --exclude-dir=__pycache__ --exclude-dir=.venv --exclude-dir=node_modules --exclude-dir=probe --exclude-dir=.rabadon --exclude-dir=.wrangler -F "\"<VALUE>\"" <SCOPE> | wc -l'

# ---- count every key inside a tree root, emit "kova<TAB>kind<TAB>key<TAB>count" -------
# UC KOVA sayaci (bkz. baslik). grep ile birebir eslesme: eksen adi kelime sinirinda,
# enum degeri tirnakli literal; satir basina bir sayim; ikili (NUL iceren) dosya atlanir.
count_tree() {
  local root="$1"
  local present=0
  for p in "${SCOPE[@]}"; do [ -e "$root/$p" ] && present=1; done
  if [ "$present" -eq 0 ]; then
    echo "FAIL: none of the scope paths exist under $root" >&2
    return 1
  fi
  python3 - "$root" <<'PY'
# Kullanim: python3 vocab_kova.py <agac koku>   -> "kova<TAB>kind<TAB>key<TAB>count" satirlari
# kova: kod | prose. Ratchet yalniz KOD kovasina uygulanir; prose basilir, hukum tasimaz.
#   prose : .md/.txt satirlari; // # * /* ile baslayan yorum satirlari; kelimenin // sonrasinda gectigi satirlar;
#           JSON'da anahtari _ ile baslayan ya da kaynak/tanim/not/anlam/derivation/source/note/why/neden/gerekce/
#           aciklama/description/kural/law olan satirlar; 60+ karakterlik ciplak dize satirlari (aciklama dizileri).
#   kod   : geri kalan her sey — grep -w / grep -F '"<deger>"' ile AYNI eslesme (satir basina bir).
# Dosya adina bagli istisna YOK (eski 'beden' kovasi silindi, karar ajani 4): body-v1 landmark adlari
# 'landmark.<ad>' oldugu icin tirnakli enum degeriyle ("hip") artik carpismaz.
# Eslesme kurali V0-0D §3 ile birebir: eksen adi kelime sinirinda (\b), enum degeri tirnakli literal.
import json, os, re, sys, collections
root = sys.argv[1]
SCOPE = "contract engine/src engine/wasm engine/tools engine/pattern-bridge engine/vocab.json web/js recipes backend knowledge".split()
EXCL = {"__pycache__", ".venv", "node_modules", "probe", ".rabadon", ".wrangler"}
v = json.load(open(os.path.join(root, "engine/vocab.json")))["fields"]
owner = collections.defaultdict(list)
for f, d in v.items():
    for x in d["values"]: owner[x].append(f)
axes = sorted(v); values = sorted(w for w in owner if len(owner[w]) == 1)
axis_re = {a: re.compile(r"(?<![A-Za-z0-9_])" + re.escape(a) + r"(?![A-Za-z0-9_])") for a in axes}
val_re = {w: re.compile(re.escape('"' + w + '"')) for w in values}
PROSE_KEY = re.compile(r'^\s*"(_[^"]*|kaynak|tanim|not|anlam|derivation|source|note|why|neden|gerekce|aciklama|description|kural|law)"\s*:')
BARE_STR = re.compile(r'^\s*"[^"]{60,}"\s*,?\s*$')
def files():
    for p in SCOPE:
        ap = os.path.join(root, p)
        if os.path.isfile(ap): yield ap; continue
        for d, dirs, fs in os.walk(ap):
            dirs[:] = [x for x in dirs if x not in EXCL]
            for f in sorted(fs): yield os.path.join(d, f)
def is_prose(path, line, pos):
    if path.endswith((".md", ".txt")): return True
    s = line.lstrip()
    if s.startswith(("//", "#", "*", "/*")): return True
    if path.endswith(".json"):
        return bool(PROSE_KEY.match(line) or BARE_STR.match(line))
    c = line.find("//")
    return c >= 0 and pos > c
counts = {"kod": collections.Counter(), "prose": collections.Counter()}
for fp in files():
    try: data = open(fp, "rb").read()
    except Exception: continue
    if b"\0" in data: continue
    for line in data.decode("utf-8", "replace").split("\n"):
        for a, rx in axis_re.items():
            m = rx.search(line)
            if m: counts["prose" if is_prose(fp, line, m.start()) else "kod"][("axis", a)] += 1
        for w, rx in val_re.items():
            m = rx.search(line)
            if not m: continue
            counts["prose" if is_prose(fp, line, m.start()) else "kod"][("value", w)] += 1
for kova in ("kod", "prose"):
    for (kind, key), n in sorted(counts[kova].items()):
        print(f"{kova}\t{kind}\t{key}\t{n}")
PY
}

WT=""
cleanup_worktree() {
  [ -n "$WT" ] || return 0
  cd "$ROOT" && git worktree remove -f "$WT" >/dev/null 2>&1
  rm -rf "$(dirname "$WT")"
  WT=""
}

# ---- count a COMMIT: check it out detached, count there, clean up -----------
count_commit() {
  local rev="$1" full
  cd "$ROOT" || return 1
  full=$(git rev-parse "$rev^{commit}" 2>/dev/null) || { echo "FAIL: unknown commit $rev" >&2; return 1; }
  WT="$(mktemp -d)/wt"
  git worktree add -f -q "$WT" "$full" || { echo "FAIL: git worktree add" >&2; return 1; }
  trap cleanup_worktree EXIT
  count_tree "$WT"
  local rc=$?
  cleanup_worktree
  return $rc
}

# ---- --baseline: recount the floor from a detached worktree ------------------
if [ "${1:-}" = "--baseline" ]; then
  # No default commit on purpose: re-cutting the floor is a deliberate act, and
  # a default would silently re-cut it at whatever commit was typed here once.
  COMMIT="${2:?--baseline needs a commit: engine/tests/vocab_reference_check.sh --baseline <commit>}"
  cd "$ROOT" || exit 1
  FULL=$(git rev-parse "$COMMIT^{commit}") || { echo "FAIL: unknown commit $COMMIT"; exit 1; }
  COUNTS=$(count_commit "$FULL") || exit 1
  cd "$ROOT" || exit 1
  python3 - "$BASELINE" "$FULL" "$AXIS_GREP" "$VALUE_GREP" <<PY
import json, sys
path, commit, axis_cmd, value_cmd = sys.argv[1:5]
rows = [l.split("\t") for l in """$COUNTS""".strip().split("\n") if l.strip()]
axes = {k: int(n) for kova, kind, k, n in rows if kova == "kod" and kind == "axis"}
values = {k: int(n) for kova, kind, k, n in rows if kova == "kod" and kind == "value"}
prose = {f"{kind}:{k}": int(n) for kova, kind, k, n in rows if kova == "prose"}
out = {
  "_baslik": "vocab_reference_check TABANI — kapali enum referans sayaci. Kapi: engine/tests/vocab_reference_check.sh (ctest: vocab_reference_check). Sayi YALNIZ DUSEBILIR; artiran commit KIRMIZI duser.",
  "_yasa": [
    "Taban ayri bir git worktree'de, taban commit'inde sayilir — calisma agacindan DEGIL. Bugunun sayisi da ayni sekilde HEAD'in worktree'sinden okunur; olculdu (2026-08-24): kirli calisma agaci 10386, ikisi de commit'li agac 10349, aradaki 37 satirin tamami paralel kosan baska bir kartin commit'lenmemis contract/ duzenlemeleriydi.",
    "TABAN TARIHI. V2-B karti tabani a6b473a'te SABIT ilan etti; olculdu ve a6b473a 10349, kapinin indigi agac 10416 = +67. Sozluk BUYUMEDI (engine/vocab.json aralik boyunca bayt-ayni, 37 eksen / 132 deger); 67 satirin tamami uc dosyaya yazildi: contract/vocab-resolution-v1.json +25 ve contract/garment-spec-v2.md +25 (V2-A, e5c9628), engine/tools/gen-vision-vocab.mjs +17 (bu kartin ureteci, yorum satirlari). Kesildigi gun kirmizi olan taban ratchet degil kapatilmis testtir, bu yuzden taban inis commit'inde yeniden kesildi ve a6b473a'nin sayisi burada duruyor.",
    "BILINEN GURULTU, bilerek onarilmadi: bu imza duz metni de sayar — 67'nin 25'i contract/ icindeki bir markdown dosyasindan geldi. Sayim yontemi V0-0D §3'un kanonik grep'inin AYNISIDIR; degistirmek bu dosyadaki her sayiyi tek mevcut olcumle kiyaslanamaz kilardi.",
    "Sayim yontemi GECE/V0-0D.md §3'un dar kapsam grep'idir; Logs/ docs/ reports/ .git/ kapsam disidir (genis kapsam ~7.7x sisik).",
    "Deger sayimi yalniz PAYLASIM=1 kelimeler icin yapilir: 'none' 22 eksende ortak, tek basina 1178 referans veriyor ve bir ratchet'i gurultuye bogar. 100 tekil kelimenin 92'si sayilir, 8 paylasilan kelime BILEREK disarida.",
    "Sayi dustugunde kapi YESIL kalir ama bu dosya KENDILIGINDEN guncellenmez — dususu sabitlemek ayri, bilincli bir commit'tir (--baseline).",
    "Bu bir kullanim analizi DEGIL, bir imzadir: yorum satiri da uretilmis tablo da sayilir. Sart dogruluk degil, KARARLILIK.",
    "IKI KOVA (2026-09-05, F1 duzeltme turu 2): eksenAdi/enumDegeri ve toplam* alanlari yalniz KOD kovasidir (ratchet). prose kovasi ayrica basilir, hukum tasimaz. 9c35e10b'deki yukari kesim (11037->11075, tamami landmark adi + prose carpismasi) geri alindi; 73113fa7'nin dosya-adina bagli 'beden' kovasi da SILINDI (hakem: istisna kilifinda reward hacking) — carpisma kaynaginda kesildi: body-v1 landmark anahtarlari 'landmark.<ad>' (karar ajani 4). Taban bir daha yukari kesilmez: kod kovasi artarsa kaynagi duzeltilir."
  ],
  "tabanCommit": commit,
  "sayimKomutu": {"eksenAdi": axis_cmd, "enumDegeri": value_cmd,
                  "kapsam": "contract engine/src engine/wasm engine/tools engine/pattern-bridge engine/vocab.json web/js recipes backend knowledge",
                  "yeniden_uret": "engine/tests/vocab_reference_check.sh --baseline <commit>",
                  "kirli_agaci_denetle": "engine/tests/vocab_reference_check.sh --tree ."},
  "toplam": sum(axes.values()) + sum(values.values()),
  "toplamEksenAdi": sum(axes.values()),
  "toplamEnumDegeri": sum(values.values()),
  "eksenSayisi": len(axes),
  "paylasim1KelimeSayisi": len(values),
  "eksenAdi": dict(sorted(axes.items())),
  "enumDegeri": dict(sorted(values.items())),
  "prose": {"toplam": sum(prose.values()), "sayim": dict(sorted(prose.items()))},
}
open(path, "w").write(json.dumps(out, indent=2, ensure_ascii=True) + "\n")
print("baseline written:", path)
print("  commit", commit)
print("  axes", len(axes), "sum", sum(axes.values()))
print("  unique values", len(values), "sum", sum(values.values()))
print("  TOTAL kod", out["toplam"], "| prose", out["prose"]["toplam"])
PY
  exit $?
fi

# ---- default: measure HEAD (or --tree <root>) against the committed floor ----
# A MISSING LAW IS NEVER A PASS.
if [ ! -f "$BASELINE" ]; then
  echo "FAIL: no baseline at $BASELINE — a missing law is never a pass."
  echo "      cut it once with: engine/tests/vocab_reference_check.sh --baseline <commit>"
  exit 1
fi

if [ "${1:-}" = "--tree" ]; then
  SUBJECT_ROOT="$(cd "${2:?--tree needs a directory}" && pwd)"
  SUBJECT="agac $SUBJECT_ROOT"
  NOW=$(count_tree "$SUBJECT_ROOT") || exit 1
else
  SUBJECT="commit HEAD ($(cd "$ROOT" && git rev-parse --short HEAD))"
  NOW=$(count_commit HEAD) || exit 1
fi
cd "$ROOT" || exit 1

python3 - "$BASELINE" "$SUBJECT" <<PY
import json, sys
b = json.load(open(sys.argv[1]))
subject = sys.argv[2]
rows = [l.split("\t") for l in """$NOW""".strip().split("\n") if l.strip()]
now = {"axis": {}, "value": {}}
other = {"prose": 0}
for kova, kind, k, n in rows:
    if kova == "kod": now[kind][k] = int(n)
    else: other[kova] += int(n)
base = {"axis": b["eksenAdi"], "value": b["enumDegeri"]}
label = {"axis": "eksen ADI", "value": "enum DEGERI"}

risen, new, fallen = [], [], []
for kind in ("axis", "value"):
    for k, n in sorted(now[kind].items()):
        if k not in base[kind]:
            if n > 0:
                new.append((kind, k, n))
        elif n > base[kind][k]:
            risen.append((kind, k, base[kind][k], n))
        elif n < base[kind][k]:
            fallen.append((kind, k, base[kind][k], n))

t_now = sum(now["axis"].values()) + sum(now["value"].values())
print("olculen       :", subject)
print("taban commit  :", b["tabanCommit"])
print("taban toplam  :", b["toplam"])
print("bugun toplam  :", t_now, "(delta %+d)" % (t_now - b["toplam"]), "— KOD kovasi; prose", other["prose"], "(taban", b.get("prose", {}).get("toplam", "?"), ") hukum disi")
print()
for kind, k, was, got in fallen:
    print("  DUSTU  %-11s %-22s %5d -> %5d" % (label[kind], k, was, got))
if fallen:
    print("  (dusus kapiyi kirmaz ve tabani KENDILIGINDEN guncellemez —")
    print("   sabitlemek icin: engine/tests/vocab_reference_check.sh --baseline <commit>)")
    print()
for kind, k, was, got in risen:
    print("  FAIL ARTTI  %-11s %-22s %5d -> %5d  (+%d)" % (label[kind], k, was, got, got - was))
for kind, k, n in new:
    print("  FAIL YENI   %-11s %-22s taban YOK -> %5d" % (label[kind], k, n))

print()
print("vocab_reference_check: %d eksen + %d kelime olculdu" % (len(now["axis"]), len(now["value"])))
if risen or new:
    print("HUKUM: FAIL (%d artan, %d yeni)" % (len(risen), len(new)))
    print("Kapali bir enuma YENI referans eklendi. Sozluk buyumez, kucululur (BREADTH -> DEPTH).")
    print("Bu gercekten bir kapsam karari ise: tabani elle yeniden kes ve gerekcesini commit mesajina yaz.")
    sys.exit(1)
print("HUKUM: YESIL — hicbir sayi tabanin ustune cikmadi.")
PY
