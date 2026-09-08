#!/usr/bin/env bash
# 0509-vision-kabul.sh — A3'un TEK kabul komutu. exit 0 = adim kabul.
# Brief KABUL maddesi birebir olculur:
#   (1) her graf.json sema + grafdogrula 0 kirmizi
#   (2) 5/5 flat.png var ve >= 400px
#   (3) onbellek 5 dosya
#   (4) celiski tablosu en az bir fotografta dolu
# Ayrica bu adimin iki gecidi (sema, guvenli-taban/arka_koken) kosulur.
set -uo pipefail
cd "$(dirname "$0")/../.."
k=0
say() { printf '%-34s %s\n' "$1" "$2"; }

bash engine/tests/0509-vision-sema.sh >/dev/null 2>&1 \
  && say vision_sema_check OK || { say vision_sema_check FAIL; k=$((k+1)); }
bash engine/tests/0509-vision-guvenli-taban.sh >/dev/null 2>&1 \
  && say guvenli_taban_arka_koken OK || { say guvenli_taban_arka_koken FAIL; k=$((k+1)); }

python3 - <<'PY' || k=$((k+1))
import json, os, subprocess, sys, struct
kirmizi = 0
def say(a, d): print(f"{a:<34} {d}")

# (3) onbellek 5 vision-graf-v1 dosyasi
v1 = [f for f in os.listdir("KOSU/onbellek") if f.endswith(".json")
      and json.load(open("KOSU/onbellek/" + f)).get("semaSurumu") == "vision-graf-v1"]
if len(v1) == 5: say("onbellek_5_dosya", "OK (5)")
else: say("onbellek_5_dosya", f"FAIL ({len(v1)})"); kirmizi += 1

dolu = 0
for n in range(1, 6):
    d = f"KOSU/ciktilar/giris/{n}"
    # (1) graf + grafdogrula
    g = f"{d}/graf.json"
    if not os.path.exists(g): say(f"{n}_graf", "FAIL yok"); kirmizi += 1; continue
    try:
        out = subprocess.run(["engine/build/grafdogrula", g, "gercek36", "--json"],
                             capture_output=True, text=True, timeout=60)
        j = json.loads(out.stdout)
        if j["kirmizi"] == 0: say(f"{n}_grafdogrula", "OK (0 kirmizi)")
        else:
            fails = [f"{h['kural']}:{h['hedef']}" for h in j["hukumler"] if not h.get("gecti") and not h.get("bilgi")]
            say(f"{n}_grafdogrula", f"FAIL ({j['kirmizi']}) {'; '.join(fails)}"); kirmizi += 1
    except Exception as e:
        say(f"{n}_grafdogrula", f"FAIL {e}"); kirmizi += 1

    # (2) flat.png var ve >= 400px (PNG basligindan, kutuphanesiz)
    p = f"{d}/flat.png"
    if not os.path.exists(p): say(f"{n}_flat_png", "FAIL yok"); kirmizi += 1
    else:
        with open(p, "rb") as fh:
            fh.read(16); w, h = struct.unpack(">II", fh.read(8))
        if w >= 400 and h >= 400: say(f"{n}_flat_png", f"OK ({w}x{h})")
        else: say(f"{n}_flat_png", f"FAIL ({w}x{h} < 400)"); kirmizi += 1

    # teslim dosyalari
    for ad in ("kaynak-yolu.txt", "kalip-36.svg", "dikilebilir.md"):
        if not os.path.exists(f"{d}/{ad}"): say(f"{n}_{ad}", "FAIL yok"); kirmizi += 1

# (4) celiski tablosu en az bir fotografta dolu
for f in v1:
    if json.load(open("KOSU/onbellek/" + f)).get("celiskiTablosu"): dolu += 1
if dolu: say("celiski_tablosu_dolu", f"OK ({dolu}/5 fotografta)")
else: say("celiski_tablosu_dolu", "FAIL (hicbiri)"); kirmizi += 1

# kontak sayfasi
if os.path.exists("KOSU/ciktilar/giris/giris-foto-5.png"): say("kontak_sayfasi", "OK")
else: say("kontak_sayfasi", "FAIL yok"); kirmizi += 1

print(f"OZET kirmizi={kirmizi}")
sys.exit(1 if kirmizi else 0)
PY

echo "KABUL kirmizi=$k"
exit $([ "$k" -eq 0 ] && echo 0 || echo 1)
