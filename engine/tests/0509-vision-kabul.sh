#!/usr/bin/env bash
# 0509-vision-kabul.sh — A3'un TEK kabul komutu. exit 0 = adim kabul.
# Brief KABUL maddesi + 2026-09-09 Damla karari (motor taban + primitif emir listesini uygular ve cizer):
#   (1) her graf.json sema + grafdogrula 0 kirmizi
#   (2) 5/5 flat.png var ve >= 400px
#   (3) onbellek 5 dosya
#   (4) celiski tablosu en az bir fotografta dolu
#   (5) her teslimde ops.json var, bos degil; flat.svg data-ops = op sayisi (cizici ops SONRASI cizdi)
#   (6) OP'SUZ CIZIM = KIRMIZI: teslim flat'i tabanin op'suz flat'iyla bayt-ayni olamaz;
#       grafciz --ops bos liste -> exit 2 (ERR_NO_OPS) olmali
#   (7) bayt farki OLCULUR: 5 flat ikiser ikiser karsilastirilir, tablo basilir (ayni olanlar adiyla);
#       ayni flat yalniz AYNI fotograf govdesinin iki cekimi icin kabul (kaynak-yolu.txt dosya koku, sira degil)
#   (8) OLCUM MOTORA GIRER: her teslimde hedefler.json var; grafdogrula --hedef en az bir 'hedef' satiri basar
#       (siluet orani -> bolluk; sapma yazili). Bos hedefler[] de satir basar ("bos") — sessizlik yok.
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
import json, os, subprocess, sys, struct, hashlib, re, tempfile
kirmizi = 0
def say(a, d): print(f"{a:<34} {d}")
TABAN = "KOSU/ciktilar/graf-ilk/graf.json"

v1 = [f for f in os.listdir("KOSU/onbellek") if f.endswith(".json")
      and json.load(open("KOSU/onbellek/" + f)).get("semaSurumu") == "vision-graf-v1"]
if len(v1) == 5: say("onbellek_5_dosya", "OK (5)")
else: say("onbellek_5_dosya", f"FAIL ({len(v1)})"); kirmizi += 1

# (6a) op'suz cizim kirmizi: bos emir listesi reddedilir
with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as t: t.write("[]"); bos = t.name
r = subprocess.run(["engine/build/grafciz", TABAN, "--ops", bos, "croquis36", "flat"], capture_output=True, text=True)
if r.returncode == 2 and "ERR_NO_OPS" in r.stderr: say("opsuz_cizim_kirmizi", "OK (bos ops -> exit 2 ERR_NO_OPS)")
else: say("opsuz_cizim_kirmizi", f"FAIL (exit {r.returncode}: {r.stderr.strip()[:80]})"); kirmizi += 1
os.unlink(bos)
# tabanin op'suz flat'i (karsilastirma icin)
r = subprocess.run(["engine/build/grafciz", TABAN, "croquis36", "flat"], capture_output=True, text=True)
tabanFlat = hashlib.md5(r.stdout.encode()).hexdigest() if r.returncode == 0 else None

dolu = 0; flatMd5 = {}; govde = {}
for n in range(1, 6):
    d = f"KOSU/ciktilar/giris/{n}"
    g = f"{d}/graf.json"
    if not os.path.exists(g): say(f"{n}_graf", "FAIL yok"); kirmizi += 1; continue
    try: govde[n] = re.sub(r"(-arka)?\.(jpg|jpeg|png)$", "", open(f"{d}/kaynak-yolu.txt").read().split("\n")[0].split("/")[-1])
    except Exception: govde[n] = f"?{n}"
    hy = f"{d}/hedefler.json"
    try:
        cmd = ["engine/build/grafdogrula", g, "gercek36", "--json"] + (["--hedef", hy] if os.path.exists(hy) else [])
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        j = json.loads(out.stdout)
        hed = [h for h in j["hukumler"] if h.get("kural") == "hedef"]
        if not os.path.exists(hy): say(f"{n}_hedef_motora", "FAIL hedefler.json yok"); kirmizi += 1
        elif not hed: say(f"{n}_hedef_motora", "FAIL grafdogrula --hedef satir basmadi"); kirmizi += 1
        else: say(f"{n}_hedef_motora", f"OK ({len(hed)} hedef: " + "; ".join(h["deger"].split(" | ")[-1] for h in hed) + ")")
        if j["kirmizi"] == 0: say(f"{n}_grafdogrula", "OK (0 kirmizi)")
        else:
            fails = [f"{h['kural']}:{h['hedef']}" for h in j["hukumler"] if not h.get("gecti") and not h.get("bilgi")]
            say(f"{n}_grafdogrula", f"FAIL ({j['kirmizi']}) {'; '.join(fails)}"); kirmizi += 1
    except Exception as e:
        say(f"{n}_grafdogrula", f"FAIL {e}"); kirmizi += 1
    p = f"{d}/flat.png"
    if not os.path.exists(p): say(f"{n}_flat_png", "FAIL yok"); kirmizi += 1
    else:
        with open(p, "rb") as fh:
            fh.read(16); w, h = struct.unpack(">II", fh.read(8))
        if w >= 400 and h >= 400: say(f"{n}_flat_png", f"OK ({w}x{h})")
        else: say(f"{n}_flat_png", f"FAIL ({w}x{h} < 400)"); kirmizi += 1
    for ad in ("kaynak-yolu.txt", "kalip-36.svg", "dikilebilir.md"):
        if not os.path.exists(f"{d}/{ad}"): say(f"{n}_{ad}", "FAIL yok"); kirmizi += 1
    # (5) ops.json + data-ops
    o = f"{d}/ops.json"
    if not os.path.exists(o): say(f"{n}_ops_json", "FAIL yok"); kirmizi += 1; nOps = 0
    else:
        ops = json.load(open(o)); nOps = len(ops)
        if nOps == 0: say(f"{n}_ops_json", "FAIL bos"); kirmizi += 1
        else: say(f"{n}_ops_json", f"OK ({nOps} op: {','.join(sorted(set(x['op'] for x in ops)))})")
    fs = f"{d}/flat.svg"
    if os.path.exists(fs):
        svg = open(fs).read(); m = re.search(r'data-ops="(\d+)"', svg)
        if m and int(m.group(1)) == nOps and nOps > 0: say(f"{n}_flat_ops_sonrasi", f"OK (data-ops={m.group(1)})")
        else: say(f"{n}_flat_ops_sonrasi", f"FAIL (data-ops={m.group(1) if m else 'YOK'}, ops={nOps})"); kirmizi += 1
        h = hashlib.md5(svg.encode()).hexdigest(); flatMd5[n] = h
        if tabanFlat and h == tabanFlat: say(f"{n}_flat_taban_farki", "FAIL flat tabanin op'suz flat'iyle BAYT AYNI"); kirmizi += 1
        else: say(f"{n}_flat_taban_farki", "OK (tabandan farkli)")

# (7) bayt farki tablosu
print("bayt_farki_tablosu (flat.svg md5, ikiser ikiser):")
ayni = []
for a in range(1, 6):
    for b in range(a + 1, 6):
        if a in flatMd5 and b in flatMd5:
            e = flatMd5[a] == flatMd5[b]
            if e: ayni.append((a, b))
            print(f"  {a}-{b}: {'AYNI' if e else 'FARKLI'}")
say("flat_ikiser_farkli", f"{'OK' if not ayni else 'BILGI'} ({len(flatMd5)} flat, ayni cift: {ayni or 'yok'})")
# ayni fotograf govdesinin iki cekimi (or. biba-O1194418-dress ve -arka; KOSU/0509-a3-secim.md: ikisi de ON yuz) ayni
# okumaya cozunur -> ayni flat BEKLENIR ve ilan edilir; FARKLI govdeler ayni flat verirse KIRMIZI. Kural sira numarasina
# degil kaynak-yolu.txt dosya kokune bagli.
for a, b in ayni:
    if govde.get(a) != govde.get(b): say(f"flat_ayni_{a}_{b}", f"FAIL farkli giysiler ayni flat ({govde.get(a)} / {govde.get(b)})"); kirmizi += 1
    else: say(f"flat_ayni_{a}_{b}", f"BILGI ayni govde iki cekim ({govde.get(a)}), ayni flat beklenir")

for f in v1:
    if json.load(open("KOSU/onbellek/" + f)).get("celiskiTablosu"): dolu += 1
if dolu: say("celiski_tablosu_dolu", f"OK ({dolu}/5 fotografta)")
else: say("celiski_tablosu_dolu", "FAIL (hicbiri)"); kirmizi += 1
if os.path.exists("KOSU/ciktilar/giris/giris-foto-5.png"): say("kontak_sayfasi", "OK")
else: say("kontak_sayfasi", "FAIL yok"); kirmizi += 1
print(f"OZET kirmizi={kirmizi}")
sys.exit(1 if kirmizi else 0)
PY

echo "KABUL kirmizi=$k"
exit $([ "$k" -eq 0 ] && echo 0 || echo 1)
