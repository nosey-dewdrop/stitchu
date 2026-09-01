#!/usr/bin/env python3
# KOSU/flat-olcum.py — F6-konvansiyon IS 2: secilen 5 referans flatin
# gogus/bel yari-genislik ORANLARI, dogrudan gorselin pikselinden.
#
#   python3 KOSU/flat-olcum.py   ->  KOSU/ciktilar/flat-olcum.json
#
# YONTEM (tekrar uretilebilir, elle cetvel yok):
#   - gorsel gri tona cevrilir, murekkep esigi < 160 (0-255).
#   - her gorselde SADECE on gorunumu iceren bir pencere (x0..x1) ilan edilir;
#     satir genisligi = penceredeki en soldaki ve en sagdaki murekkep pikseli
#     arasindaki mesafe (giysi SILUETI).
#   - gogus = ilan edilen bantta EN GENIS satir (kolsuz flatlerde bu kol
#     oyugunun dibi = gercek gogus hatti). KOLLU flatlerde govde kolun
#     altinda kalir ve gogus OLCULEMEZ — bu adiyla kaydedilir, orana girmez.
#   - bel = ilan edilen bantta EN DAR satir.
#   - oran = bel / gogus (yari-genislik orani = tam genislik orani).
# Kollu uc flatte yalnizca bel olculur; oranin kaynagi kolsuz iki flattir
# (13-mica, 14-pauline) ve bu sinir da dosyaya yazilir.
import json, os
from PIL import Image

BASE = os.path.join(os.path.dirname(__file__), '..', 'GIRDI', 'iyi-flat', 'adaylar')
OUT = os.path.join(os.path.dirname(__file__), 'ciktilar', 'flat-olcum.json')
ESIK = 160

# pencere = on gorunumun govdesini iceren kolonlar; bantlar satir araliklari.
CFG = {
  '13-yuksek-bel-a-line.png': dict(
    x=(119, 875), gogusBant=(300, 420), belBant=(420, 580),
    not_='kolsuz fitted beden + bel dikisi + A etek; gogus DOGRUDAN olculur (kol yok)'),
  '14-uzun-kol-maxi.png': dict(
    x=(30, 470), gogusBant=(206, 262), belBant=(262, 340),
    not_='askili fitted mini (Pauline gorunum A); gogus DOGRUDAN olculur (kol yok)'),
  '06-a-line-puff-kol-varyant.png': dict(
    x=(111, 475), gogusBant=None, belBant=(230, 300),
    not_='puf kollu dart elbise (Eleanor A); kol govdeyi ortuyor, gogus OLCULEMEDI'),
  '07-uzun-kol-akiskan-etek.png': dict(
    x=(51, 443), gogusBant=None, belBant=(194, 240),
    not_='puf kollu akiskan maxi (Celia A); kol govdeyi ortuyor, gogus OLCULEMEDI'),
  '09-a-line-puff-kol-midi.png': dict(
    x=(50, 450), gogusBant=None, belBant=(306, 350),
    not_='balon kollu midi (Lilas A); kol govdeyi ortuyor, gogus OLCULEMEDI'),
}

def genislik(px, W, x0, x1, y):
    xs = [x for x in range(x0, min(x1, W)) if px[x, y] < ESIK]
    return (xs[0], xs[-1], xs[-1] - xs[0]) if xs else None

sonuc = {'_ne': 'F6-konvansiyon: 5 referans flatin piksel olcumu. Uretici: KOSU/flat-olcum.py',
         'esik': ESIK, 'flatler': {}, 'oranlar': {}}
oranlar = []
for ad, c in CFG.items():
    im = Image.open(os.path.join(BASE, ad)).convert('L')
    px, (W, H) = im.load(), im.size
    kayit = {'pencereX': list(c['x']), 'not': c['not_']}
    x0, x1 = c['x']
    # bel: banttaki EN DAR satir
    enDar = None
    for y in range(*c['belBant']):
        g = genislik(px, W, x0, x1, y)
        if g and (enDar is None or g[2] < enDar[3]):
            enDar = (y,) + g
    kayit['bel'] = {'satirY': enDar[0], 'solX': enDar[1], 'sagX': enDar[2],
                    'genislikPX': enDar[3], 'bant': list(c['belBant'])}
    if c['gogusBant']:
        enGenis = None
        for y in range(*c['gogusBant']):
            g = genislik(px, W, x0, x1, y)
            if g and (enGenis is None or g[2] > enGenis[3]):
                enGenis = (y,) + g
        kayit['gogus'] = {'satirY': enGenis[0], 'solX': enGenis[1], 'sagX': enGenis[2],
                          'genislikPX': enGenis[3], 'bant': list(c['gogusBant'])}
        oran = enDar[3] / enGenis[3]
        kayit['belGogusOrani'] = round(oran, 6)
        oranlar.append((ad, oran))
    else:
        kayit['gogus'] = 'OLCULEMEDI — kol govdeyi ortuyor (kollu flatte kol alti govde satiri '\
                         'gercek gogus hatti DEGILDIR, yanlis olcmektense olcmemek secildi)'
    sonuc['flatler'][ad] = kayit

sonuc['oranlar'] = {
    '_ne': 'bel/gogus yari-genislik orani — yalnizca gogsu dogrudan olculebilen kolsuz flatlerden',
    'kaynakFlatler': {ad: round(o, 6) for ad, o in oranlar},
    'ortalama': round(sum(o for _, o in oranlar) / len(oranlar), 6),
    'n': len(oranlar),
    'sinir': 'n=2 — kollu uc referansta gogus olculemedigi icin oran iki kolsuz referanstan geliyor; '
             'Damla baska referans isaretlerse bu dosya yeniden kosulur ve contract v2 guncellenir',
}
sonuc['kalca'] = ('OLCULMEDI — bes referansin besinde de bel alti giysi klosu (A etek) govdeyi ortuyor; '
                  'olculecek sey mankenin kalcasi degil etegin klosu olurdu. En kisitlayici deger: fark 0 '
                  '(contract v2 kalcayi ve gogsu insan cizelgesinde birakir, yalniz bel donusur)')
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w') as f:
    json.dump(sonuc, f, indent=1, ensure_ascii=False)
print(json.dumps(sonuc['oranlar'], indent=1, ensure_ascii=False))
for ad, k in sonuc['flatler'].items():
    print(ad, '-> bel', k['bel']['genislikPX'], 'px @y', k['bel']['satirY'],
          '| gogus', k['gogus'] if isinstance(k['gogus'], str) else f"{k['gogus']['genislikPX']} px @y {k['gogus']['satirY']}")
