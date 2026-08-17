#!/usr/bin/env python3
# ============================================================================
# spec_census.py — SPEC'İN ŞEKLİ. Kaç panel, kaç dikiş, sekiz bedende AYNI MI.
#
# NEDEN VAR (T15, ölçülmüş delik):
# walkgate_check.sh / edgemono_check.sh / printpack_sheet_check.sh üçü de
# `surface-pattern` çıktısını bir dosyaya basıp o dosyayı bir hakeme veriyor.
# Hakemler kusuru İYİ buluyor — ama hepsi "elimdeki panelleri yargıla" diye
# yazılmış. Elde panel YOKSA ya da AZSA yargılanacak bir şey de yoktur ve
# kapı sessizce yeşil basar.
#
# 13B bu deliğin yarısını ölçtü: kayıp-satır (bir bedende panel düşmesi) hâli
# ÇAPRAZ-BEDEN tutarlılığıyla yakalanıyor. Ama kendi notunda kalan yarıyı da
# yazdı: "8 bedenin 8'i birden 2 panele düşse çapraz-beden tutarlılığı da
# yakalamaz." TEKDÜZE ÇÖKÜŞ. Sekiz beden birden aynı yanlışı yaparsa
# birbirleriyle kusursuz tutarlıdır.
#
# İki hüküm, ve ikisi de ayrı bir çöküş şeklini kapatıyor:
#
#   MUTLAK TABAN      beden başına panel/dikiş sayısının ALT SINIRI. Tekdüze
#                     çöküşü yakalayan tek şey budur, çünkü karşılaştırdığı
#                     şey diğer bedenler değil GİYSİNİN KENDİSİ.
#   ÇAPRAZ SABİTLİK   sekiz bedenin panel ADI KÜMESİ ve dikiş sayısı birebir
#                     aynı olmak zorunda. Aynı kalıbın sekiz bedeni aynı
#                     tarifi taşır; taşımıyorsa tarif tek tarif değildir.
#
# TABAN NEREDEN GELİYOR — uydurulmadı, sevk edilen giysinin inşasından:
# tek-yüzey hattı bel halkasını bir kez örnekler ve ondan ÇEYREK gövde + ÇEYREK
# etek keser: 4 + 4 = 8 panel. Sekizden az panele ayrılan şey bu giysi değildir.
# Dikiş tabanı ise SAYILMADI, TÜRETİLDİ: n parçalı bir giysinin tek parça
# hâlinde durabilmesi için en az n-1 dikiş gerekir (bağlı graf / kapsayan
# ağaç). Bugün 26 dikiş var, taban 7 — yani taban bugünkü sayıya UYDURULMADI,
# altında geniş bir pay bırakıyor ve yine de "bütün dikişler silinmiş" hâlini
# yakalar.
#
# Panel başına 3 kenar da bir tanımdır, ayarlanmış bir sayı değil: iki kenarla
# çevrelenen bir alan yoktur, kesilecek parça yoktur.
#
# kullanım: spec_census.py <min_panels> <spec.json> [<spec.json> ...]
# ============================================================================
import json
import sys

MIN_EDGES_PER_PANEL = 3    # tanım: iki kenar bir alan çevirmez


def census(path):
    """Bir spec dosyasının şekli. Okunamıyorsa bu da bir bulgudur."""
    with open(path, encoding='utf-8') as fh:
        raw = fh.read()
    if not raw.strip():
        return {'path': path, 'error': 'dosya BOŞ (0 anlamlı bayt)'}
    try:
        spec = json.loads(raw)
    except (ValueError, TypeError) as exc:
        return {'path': path, 'error': f'JSON ayrıştırılamadı: {exc}'}
    pat = spec.get('pattern', spec)
    if not isinstance(pat, dict):
        return {'path': path, 'error': "spec bir 'pattern' nesnesi taşımıyor"}
    panels = pat.get('panels')
    if not isinstance(panels, dict):
        return {'path': path, 'error': "spec 'panels' nesnesi taşımıyor"}
    stitches = pat.get('stitches')
    if not isinstance(stitches, list):
        return {'path': path, 'error': "spec 'stitches' listesi taşımıyor"}
    thin = sorted(n for n, p in panels.items()
                  if len((p or {}).get('edges') or ()) < MIN_EDGES_PER_PANEL)
    return {
        'path': path,
        'error': None,
        'bytes': len(raw),
        'panels': len(panels),
        'names': tuple(sorted(panels)),
        'stitches': len(stitches),
        'thin': thin,
    }


def main(argv):
    if len(argv) < 3:
        print('kullanım: spec_census.py <min_panels> <spec.json> ...')
        return 2
    min_panels = int(argv[1])
    rows = [census(p) for p in argv[2:]]
    fails = []

    for r in rows:
        tag = r['path'].split('/')[-1]
        if r['error']:
            print(f'  {tag:22s} OKUNAMADI — {r["error"]}')
            fails.append(f'{tag}: {r["error"]}')
            continue
        print(f'  {tag:22s} panels {r["panels"]:3d}  stitches '
              f'{r["stitches"]:3d}  bytes {r["bytes"]:6d}')

        # ---- MUTLAK TABAN: bu giysi sekiz parçaya ayrılır, azına değil.
        if r['panels'] < min_panels:
            fails.append(
                f'{tag}: {r["panels"]} panel — taban {min_panels}. '
                f'Sekiz bedenin sekizi birden çökse çapraz sabitlik bunu '
                f'YAKALAMAZ; taban tam bunun için var.')
        # ---- dikiş tabanı TÜRETİLİR: n panel en az n-1 dikişle bağlanır.
        need = max(0, r['panels'] - 1)
        if r['stitches'] < need:
            fails.append(
                f'{tag}: {r["panels"]} panel için {r["stitches"]} dikiş — '
                f'bağlı bir giysi en az {need} ister. Parçaları birbirine '
                f'bağlanmamış bir giysi dikilebilir değildir.')
        if r['thin']:
            fails.append(
                f'{tag}: {len(r["thin"])} panel {MIN_EDGES_PER_PANEL} '
                f'kenardan az taşıyor ({", ".join(r["thin"])}) — kesilecek '
                f'bir alan çevrelemiyorlar.')

    # ---- ÇAPRAZ SABİTLİK: aynı kalıbın sekiz bedeni aynı tarifi taşır.
    good = [r for r in rows if not r['error']]
    if len(good) > 1:
        names = {r['names'] for r in good}
        counts = {r['stitches'] for r in good}
        if len(names) > 1:
            for r in good:
                print(f'    {r["path"].split("/")[-1]}: '
                      f'{", ".join(r["names"]) or "(hiç panel yok)"}')
            fails.append(
                f'panel ADI KÜMESİ bedenler arasında değişiyor '
                f'({len(names)} ayrı küme) — aynı kalıbın sekiz bedeni tek '
                f'tarif olmak zorunda.')
        if len(counts) > 1:
            fails.append(
                f'dikiş sayısı bedenler arasında değişiyor '
                f'({sorted(counts)}) — tarif tek tarif değil.')

    print(f'CENSUS  spec {len(rows)}  taban {min_panels} panel  '
          f'ihlal {len(fails)}')
    if fails:
        print('SPEC CENSUS: FAIL')
        for f in fails:
            print(f'  FAIL {f}')
        return 1
    print('SPEC CENSUS: PASS')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
