#!/usr/bin/env python3
# ============================================================================
# karar-lint — A DECISION THAT WAS NEVER EXECUTED IS A RED LIGHT, NOT A NOTE.
#
# Diagnosed 2026-08-16. Every session starts from the files with no memory of the
# last one. A session researches something, writes the conclusion into ROADMAP.md,
# and moves on; the next session reads the file, does not know the conclusion was
# never acted on, and re-derives something else. Two months of that.
#
# The proof is BFF and OptCuts: ROADMAP.md has listed them for months under
# "✅ ALINIR" — researched, licence-cleared, decided — and core/third_party/
# contains neither. Instead the flattener was hand-written, and a night was then
# spent debugging its conditioning.
#
# So decisions stop living in prose. contract/layers/decisions.json holds each
# one with the path that would EXIST if it had been carried out, and this script
# says out loud, on every harness run, which ones are still only words.
#
#   karar-lint.py            report + RATCHET (see exit codes)
#   karar-lint.py --strict   exit 1 if ANY decision is unexecuted
#
# TUR 9 (17 Agu) — H1b SILAHSIZDI. `engine-check/harness/run-all.sh` bunu
# `|| true` ile cagiriyordu: karar defteri linti HICBIR kosulda ariza
# sayilmiyordu. Kasit mi unutma mi diye bakildi, cevap IKISI birden:
#   KASIT   — rapor kipi bilerek var (`--strict` bayragi tam bunun icin yazilmis)
#             ve bugun yapilmamis 3 karar (bff/optcuts/ocg) BILINEN ACIK CEPHE.
#             Onlari tek tarafli kirmiziya cevirmek kararin sahibinin isi.
#   UNUTMA  — ama `|| true` bundan FAZLASINI yutuyordu: rapor kipinde sifirdan
#             farkli TEK cikis "defter dosyasi YOK" idi, ve o bir rapor degil
#             KAPININ GIRDISININ KAYBOLMASIDIR. taban.sh BOS MUHUR'u ile ayni
#             sinif (T17 md.5): girdisi yokken de yesil basan kapi, kapi degildir.
#             Ustelik defterin kendi `_rol` satiri "yazip gecmek artik kirmizi
#             basar" diyor — kirmizi basacak yer boruyla kapatilmisti.
# Cozum kapi boyamak degil, hukmu AYRISTIRMAK. Cikis kodlari anlam tasiyor:
#   0  rapor: yapilmamis karar sayisi TAVANIN altinda/esit (bilinen acik cephe)
#   1  --strict ile: yapilmamis karar var
#   2  ALET ARIZASI: defter yok / okunamiyor / bos       -> harness FAIL
#   3  RATCHET: yapilmamis karar sayisi TAVANI ASTI      -> harness FAIL
# Tavan `contract/layers/decisions.json` -> `tavan_yapilmadi`. Tavan bir esik
# gevsetmesi DEGIL bir MANDAL: bugunku acik cephe donduruluyor, YENI bir
# "yazip gec" ani kirmizi basiyor. Tavan yalniz ASAGI cekilir (karar uygulaninca).
# ============================================================================
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / 'contract/layers/decisions.json'


def main() -> int:
    if not LEDGER.exists():
        print(f'ALET ARIZASI: karar defteri yok: {LEDGER}')
        return 2
    try:
        doc = json.loads(LEDGER.read_text())
    except (json.JSONDecodeError, OSError) as e:
        print(f'ALET ARIZASI: karar defteri okunamiyor ({e}): {LEDGER}')
        return 2
    kararlar = doc.get('kararlar', [])
    if not kararlar:
        print('ALET ARIZASI: karar defteri BOS. Sifir karar sifir hukum demek;')
        print('  bos defter "butun kararlar uygulanmis" ANLAMINA GELMEZ (T17 BOS MUHUR dersi).')
        return 2
    tavan = doc.get('tavan_yapilmadi')
    if tavan is None:
        print('ALET ARIZASI: defterde `tavan_yapilmadi` mandali yok — ratchet kosamaz.')
        return 2
    yapilmadi = []

    print('== KARAR DEFTERI — yazilmis ama yapilmamis olan ==')
    for k in kararlar:
        var = (ROOT / k['kanit_yolu']).exists()
        print(f"  {'ok  ' if var else 'YOK '} {k['id']:<20} {k['karar'][:64]}")
        if not var:
            print(f"       kanit yolu : {k['kanit_yolu']}")
            print(f"       kaynak     : {k['kaynak']}")
            yapilmadi.append(k)

    if not yapilmadi:
        print('  butun kararlar uygulanmis')
        if tavan > 0:
            print(f'  ⚠ tavan_yapilmadi={tavan} ama yapilmamis karar 0 — tavani 0\'a CEK.')
        return 0

    print(f"\n  {len(yapilmadi)}/{len(kararlar)} KARAR SADECE YAZI HALINDE.")
    print('  Bir karari ROADMAP\'e yazip gecmek onu yapmis saymaz. Ya uygula,')
    print('  ya defterden cikar ve NEDEN vazgecildigini yaz.')
    if len(yapilmadi) > tavan:
        print(f'\n  RATCHET KIRILDI: yapilmamis {len(yapilmadi)} > tavan {tavan}.')
        print('  Bugunku acik cephe donduruldu; bu YENI bir "yazip gec".')
        print('  Tavani buyutmek kapi boyamaktir — karari uygula ya da defterden cikar.')
        return 3
    print(f'  (ratchet: {len(yapilmadi)} <= tavan {tavan} — bilinen acik cephe, damgalandi)')
    return 1 if '--strict' in sys.argv else 0


if __name__ == '__main__':
    sys.exit(main())
