#!/usr/bin/env python3
# KOSU/flat-olcum.py — satilan flat'lerin (GIRDI/iyi-flat/adaylar, 15 PNG) piksel olcumu.
#
#   python3 KOSU/flat-olcum.py   ->  KOSU/ciktilar/flat-olcum.json
#
# BOLUM 1 (F6-konvansiyon IS 2, 2026-09-02): 5 referans flatin bel/gogus yari-genislik
#   orani. contract/mannequin-chart-v1.json v2 blogu bunun kayit kopyasidir; DOKUNULMADI.
# BOLUM 2 (F1 kapanis, 2026-09-05; hakem kusur 2+3): croquis36'nin uc agir sayisi 15 flatte
#   olculur — kol oyugu tabani y ve pens ucu (apex vekili) y, paydasi SNP->bel (torso);
#   kol ekseni acisi (omuz ucu -> kol ucu orta noktasi, yatayin ALTINA derece).
#   Medyanlar contract/body-v1.json croquisOranlar._iyiFlatOlcumu ve
#   flat-convention-v1.json sevkPoz.kolAcisiDeg'e yazilir (elle degil, bu dosyadan).
#
# YONTEM (tekrar uretilebilir; her flat icin PENCERELER ve TOHUMLAR asagida CFG2'de
# yazili, hepsi ORIJINAL piksel; goruntu buyutulmez):
#   - gri ton, murekkep = piksel < esik (05'te croquis govde acik gri: esik 100).
#   - SNP: pencerede EN USTTEKI murekkep satiri (omuz dikisinin boyna degdigi nokta;
#     flat'te govdenin en ust noktasidir, arka yaka dususu SNP'nin ALTINDA kalir).
#   - bel: pencere bandinda EN DAR siluet satiri (Bolum 1 ile ayni tanim).
#   - kol oyugu tabani, KOLLU flat: kol ic kenari ile govde yan dikisi arasindaki beyaz
#     BOSLUGUN gorundugu en ust satir (pencerede >= 2 ayri murekkep parcasi; ustunde
#     yalniz kol oyugu dikisi var, tek parca). KOLSUZ flat: bantta en genis satir
#     (kol oyugu egrisinin yan dikise dondugu nokta).
#   - pens ucu: pencerede CF'ye en yakin murekkep pikseli (pensin sivri ucu).
#   - omuz ucu: GOZ tohumu (kesikli cizgi cizerken kavis+kirilma tek bir piksel
#     degil), tohum en yakin murekkep pikseline OTURTULUR (snap yaricapi yazili);
#     tohum ve oturan piksel ikisi de JSON'da.
#   - kol ucu orta noktasi: kol agzi/manset penceresindeki murekkebin ana ekseni
#     (PCA), eksen ucundaki iki nokta kol agzi koseleri, ortasi kol ucu.
#   - aci = atan2(dy, |dx|) derece, omuz ucundan kol ucuna, yatayin altina (+).
# Olculemeyen her kalem ADIYLA yazilir (kimono/kaftan: omuz ucu ve oyuk yok; empire:
# dogal bel yok; kare yaka: SNP yok). Yanlis olcmektense olcmemek.
import json, math, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(HERE, '..', 'GIRDI', 'iyi-flat', 'adaylar')
OUT = os.path.join(HERE, 'ciktilar', 'flat-olcum.json')
ESIK = 160

# ---------------------------------------------------------------- BOLUM 1 (eski, dokunulmadi)
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

def genislik(px, W, x0, x1, y, esik=ESIK):
    xs = [x for x in range(x0, min(x1, W)) if px[x, y] < esik]
    return (xs[0], xs[-1], xs[-1] - xs[0]) if xs else None

def enDarSatir(px, W, x0, x1, bant, esik=ESIK):
    enDar = None
    for y in range(*bant):
        g = genislik(px, W, x0, x1, y, esik)
        if g and (enDar is None or g[2] < enDar[3]):
            enDar = (y,) + g
    return enDar

def enGenisSatir(px, W, x0, x1, bant, esik=ESIK):
    enGenis = None
    for y in range(*bant):
        g = genislik(px, W, x0, x1, y, esik)
        if g and (enGenis is None or g[2] > enGenis[3]):
            enGenis = (y,) + g
    return enGenis

sonuc = {'_ne': 'satilan flat piksel olcumu. Uretici: KOSU/flat-olcum.py. Bolum 1: F6-konvansiyon 5 flat bel/gogus; '
                'Bolum 2 (F1 kapanis 2026-09-05): 15 flatte kol oyugu tabani / pens ucu / kol acisi',
         'esik': ESIK, 'flatler': {}, 'oranlar': {}}
oranlar = []
for ad, c in CFG.items():
    im = Image.open(os.path.join(BASE, ad)).convert('L')
    px, (W, H) = im.load(), im.size
    kayit = {'pencereX': list(c['x']), 'not': c['not_']}
    x0, x1 = c['x']
    enDar = enDarSatir(px, W, x0, x1, c['belBant'])
    kayit['bel'] = {'satirY': enDar[0], 'solX': enDar[1], 'sagX': enDar[2],
                    'genislikPX': enDar[3], 'bant': list(c['belBant'])}
    if c['gogusBant']:
        enGenis = enGenisSatir(px, W, x0, x1, c['gogusBant'])
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

# ---------------------------------------------------------------- BOLUM 2 (F1 kapanis)
# Her flat: on gorunum (A) SOL yarisi olculur (cizimler simetrik). Pencereler orijinal px.
#   snp:     (x0,x1,y0,y1) en ust murekkep
#   bel:     dict(x=(x0,x1), bant=(y0,y1)) en dar satir
#   oyuk:    dict(tip='bosluk', x=(..), y=(..))  kollu: ilk >=2 parcali satir
#            dict(tip='enGenis', x=(..), bant=(..)) kolsuz: en genis satir (sol kenar en kucuk x)
#            dict(tip='tohum', xy=(x,y))          kose acikca okunuyor, snap
#   pens:    (x0,x1,y0,y1) CF'ye en yakin murekkep (cf verilir)
#   omuzUcu: (x,y) goz tohumu, snap
#   kolUcu:  (x0,x1,y0,y1) kol agzi penceresi, PCA orta noktasi
#   kolTipi: 'setin' | 'puf' | 'bishop' | 'kap' | 'kimono' | 'yok'
CFG2 = {
  '01-kaftan-maxi-uzun-kol.png': dict(olculemez='kaftan: omuz dikisi, kol oyugu ve dogal bel cizimde yok (govde hatti gorunmez)'),
  '02-uzun-robe-dress.png': dict(
    urun='Folkwear robe (tarama, 1036 px)', esik=160, cf=246, snap=8, kolTipi='setin',
    snpTohum=(203, 168), omuzUcu=(145, 180), oyuk=dict(tip='tohum', xy=(169, 323)),
    bel=dict(x=(100, 400), bant=(360, 400)), kolUcu=(100, 156, 410, 452),
    not_='tarama kalitesi dusuk: SNP ve oyuk tohumla (snap); sal yaka SNP penceresini bozar. Kol oyugu 1940 robe: dusuk oyuk'),
  '03-empire-dress-uc-boy.png': dict(
    urun='Folkwear empire (Simple Version Front, ~200 px figur)', esik=160, cf=157, snap=6, kolTipi='puf',
    omuzUcu=(98, 328), kolUcu=(22, 60, 340, 385),
    olculemezTorso='empire kesim: dogal bel cizimde yok; kare yaka: SNP yok; oyuk puf altinda',
    not_='yalniz kol acisi (kisa PUF kol: kol yana acilir, sarkan kol degil — medyanda ayri etiketle)'),
  '04-a-line-puff-kol.png': dict(
    urun="Helen's Closet Holmes, view A", esik=160, cf=350, snap=6, kolTipi='setin',
    snp=(290, 312, 55, 85), omuzUcu=(249, 89),
    oyukOlculemez='kol ic kenari govde yan dikisiyle CAKISIK (tek cizgi x~271, y 175-232), kol agzi ic kosesi govdeye deger: oyuk tabani kosesi cizimde yok; zoom ile bakildi (2026-09-05)',
    bel=dict(x=(190, 510), bant=(232, 262)), pens=(270, 296, 174, 196), kolUcu=(195, 266, 195, 235),
    not_='kisa set-in kol, V yaka, buzgulu bel; pens: gogus altindan yana pens, ucu apex vekili'),
  '05-a-line-top-ve-elbise.png': dict(
    urun="Helen's Closet March, view A (gri croquis ustunde)", esik=100, cf=304, snap=6, kolTipi='bishop',
    snp=(232, 252, 245, 272), omuzUcu=(167, 277), oyuk=dict(tip='bosluk', x=(180, 206), y=(350, 400)),
    kolUcu=(100, 165, 590, 636),
    olculemezTorso='empire/yoke kesim: dogal bel cizimde yok',
    not_='esik 100: arkadaki croquis govde acik gri, murekkep koyu; uzun bishop kol manset'),
  '06-a-line-puff-kol-varyant.png': dict(
    urun='Deer&Doe Eleanor, view A', esik=160, cf=283, snap=6, kolTipi='setin',
    snp=(225, 250, 60, 95), omuzUcu=(194, 88), oyuk=dict(tip='bosluk', x=(176, 206), y=(150, 230)),
    bel=dict(x=(111, 475), bant=(230, 300)), pens=(205, 230, 172, 195), kolUcu=(125, 190, 200, 240),
    not_='set-in kisa kol (omuzda hafif buzgu); pens: kol oyugundan gogse pens (armhole dart), ucu apex vekili. Oyuk penceresi x<=206: pens cizgisi (x 193-222, y 183-193) dikise bagli, pencereye girse tek parca sayilir'),
  '07-uzun-kol-akiskan-etek.png': dict(
    urun='Deer&Doe Celia, gorunum A', esik=160, cf=278, snap=6, kolTipi='setin',
    snp=(245, 265, 15, 45), omuzUcu=(195, 60), oyuk=dict(tip='bosluk', x=(185, 215), y=(120, 190)),
    bel=dict(x=(51, 443), bant=(194, 240)), kolUcu=(140, 190, 170, 200),
    not_='kisa set-in kol (omuzda buzgu), V yaka, bel dikisi; pens yok (buzgu)'),
  '08-empire-buzgu-etek.png': dict(olculemez='kimono kol: omuz ucu ve kol oyugu yok'),
  '09-a-line-puff-kol-midi.png': dict(olculemez='kare yaka omuzsuz: SNP yok; balon kol bagli, kol ekseni tanimsiz'),
  '10-princess-a-line.png': dict(
    urun='Alice (4375 px)', esik=160, cf=1104, snap=12, kolTipi='bishop',
    snp=(900, 940, 395, 430), omuzUcu=(695, 460), kolUcu=(330, 520, 1350, 1500),
    olculemezTorso='empire/yoke: dogal bel yok; kol oyugu tabani kolun altinda (kol ic kenari govdeye bel dikisinde deger)',
    not_='uzun bishop kol, manset; yalniz kol acisi'),
  '11-a-line-uzun-kol.png': dict(olculemez='kutu kesim tiered, kolsuz: dogal bel yok (payda yok)'),
  '12-empire-uzun-kol.png': dict(olculemez='kimono kol: omuz ucu ve kol oyugu yok'),
  '13-yuksek-bel-a-line.png': dict(
    urun='Deer&Doe Mica, view A (2188 px)', esik=160, cf=547, snap=10, kolTipi='yok',
    snp=(460, 490, 90, 122), omuzUcu=(425, 130), oyuk=dict(tip='enGenis', x=(300, 560), bant=(250, 420)),
    bel=dict(x=(300, 800), bant=(480, 580)), pens=(440, 472, 395, 430),
    not_='kolsuz: oyuk tabani = en genis satir (kol oyugu egrisi yan dikise doner); pens: bel pensi ucu (apex vekili, apexin ~2 cm altinda)'),
  '14-uzun-kol-maxi.png': dict(olculemez='askili kare yaka: SNP yok (payda yok); gorunum B uzun kollu ama govde figuru kucuk ve askili ust ayni'),
  '15-maxi-akiskan.png': dict(
    urun='Sallie jumpsuit, view A', esik=160, cf=135, snap=6, kolTipi='kap',
    snp=(82, 97, 10, 30), omuzUcu=(38, 44), oyuk=dict(tip='tohum', xy=(66, 96)),
    bel=dict(x=(20, 260), bant=(140, 185)),
    not_='kap kol (govdeden uzanti): omuz ucu = kap dis kosesi, oyuk = kap alt kenarinin yan dikise degdigi kose (tohum+snap); kol ekseni tanimsiz'),
}

def inkPts(px, W, H, x0, x1, y0, y1, esik):
    return [(x, y) for y in range(max(0, y0), min(H, y1)) for x in range(max(0, x0), min(W, x1)) if px[x, y] < esik]

def snap(px, W, H, xy, r, esik):
    best = None
    for (x, y) in inkPts(px, W, H, xy[0] - r, xy[0] + r + 1, xy[1] - r, xy[1] + r + 1, esik):
        d = math.hypot(x - xy[0], y - xy[1])
        if best is None or d < best[0]: best = (d, x, y)
    return None if best is None else {'tohum': list(xy), 'snapPX': [best[1], best[2]], 'mesafePX': round(best[0], 2), 'yaricapPX': r}

def parcalar(px, W, y, x0, x1, esik):
    seg, cur = [], None
    for x in range(x0, min(x1, W)):
        if px[x, y] < esik:
            if cur is None: cur = [x, x]
            else: cur[1] = x
        elif cur is not None:
            seg.append(cur); cur = None
    if cur is not None: seg.append(cur)
    return seg

def boslukSatiri(px, W, x0, x1, y0, y1, esik):
    # kol ic kenari ile govde yan dikisi arasinda beyaz bosluk: >=2 parca ve aradaki beyaz >= 2 px
    for y in range(y0, y1):
        seg = parcalar(px, W, y, x0, x1, esik)
        if len(seg) >= 2 and any(seg[i + 1][0] - seg[i][1] - 1 >= 2 for i in range(len(seg) - 1)):
            return {'satirY': y, 'parcalar': seg, 'pencere': [x0, x1, y0, y1]}
    return None

def pca_uclar(pts):
    n = len(pts); mx = sum(p[0] for p in pts) / n; my = sum(p[1] for p in pts) / n
    sxx = sum((p[0] - mx) ** 2 for p in pts) / n; syy = sum((p[1] - my) ** 2 for p in pts) / n
    sxy = sum((p[0] - mx) * (p[1] - my) for p in pts) / n
    th = 0.5 * math.atan2(2 * sxy, sxx - syy)
    ux, uy = math.cos(th), math.sin(th)
    pr = [((p[0] - mx) * ux + (p[1] - my) * uy, p) for p in pts]
    a = min(pr)[1]; b = max(pr)[1]
    return a, b, (round((a[0] + b[0]) / 2, 1), round((a[1] + b[1]) / 2, 1))

f1 = {'_ne': 'F1 kapanis: 15 flat, on gorunum, SOL yari. Sayilar orijinal piksel. Oranlar: (y - SNP.y) / (bel.y - SNP.y).',
      'flatler': {}, 'medyanlar': {}}
oyukOran, pensOran, acilarHepsi, acilarSarkan = [], [], [], []
for ad, c in CFG2.items():
    if 'olculemez' in c:
        f1['flatler'][ad] = {'OLCULEMEDI': c['olculemez']}
        continue
    im = Image.open(os.path.join(BASE, ad)).convert('L')
    px, (W, H) = im.load(), im.size
    esik, r = c['esik'], c['snap']
    k = {'urun': c['urun'], 'boyutPX': [W, H], 'esik': esik, 'kolTipi': c['kolTipi'], 'cfX': c['cf'], 'not': c['not_']}
    # SNP
    snpY = None
    if 'snp' in c:
        x0, x1, y0, y1 = c['snp']
        pts = inkPts(px, W, H, x0, x1, y0, y1, esik)
        if pts:
            top = min(pts, key=lambda p: (p[1], p[0]))
            k['snp'] = {'yontem': 'pencerede en ust murekkep', 'pencere': list(c['snp']), 'xy': list(top)}
            snpY = top[1]
    elif 'snpTohum' in c:
        s = snap(px, W, H, c['snpTohum'], r, esik)
        k['snp'] = {'yontem': 'goz tohumu + snap', **s}; snpY = s['snapPX'][1]
    # bel
    belY = None
    if 'bel' in c:
        e = enDarSatir(px, W, c['bel']['x'][0], c['bel']['x'][1], c['bel']['bant'], esik)
        k['bel'] = {'yontem': 'bantta en dar siluet satiri', 'pencereX': list(c['bel']['x']), 'bant': list(c['bel']['bant']),
                    'satirY': e[0], 'solX': e[1], 'sagX': e[2], 'genislikPX': e[3]}
        belY = e[0]
    # omuz ucu
    om = snap(px, W, H, c['omuzUcu'], r, esik)
    k['omuzUcu'] = {'yontem': 'goz tohumu + snap', **om}
    # oyuk
    oyukY = None
    if 'oyukOlculemez' in c:
        k['oyukTabani'] = {'OLCULEMEDI': c['oyukOlculemez']}
    if 'oyuk' in c:
        o = c['oyuk']
        if o['tip'] == 'bosluk':
            b = boslukSatiri(px, W, o['x'][0], o['x'][1], o['y'][0], o['y'][1], esik)
            k['oyukTabani'] = {'yontem': 'kol ic kenari - yan dikis arasinda beyaz boslugun ilk satiri', **(b or {'BULUNAMADI': o})}
            oyukY = b and b['satirY']
        elif o['tip'] == 'enGenis':
            # sol yari: siluetin SOL kenarinin en kucuk x'e ulastigi ilk satir (en genis nokta)
            e = None
            for y in range(*o['bant']):
                g = genislik(px, W, o['x'][0], o['x'][1], y, esik)
                if g and (e is None or g[0] < e[1]): e = (y, g[0])
            k['oyukTabani'] = {'yontem': 'kolsuz: sol siluet kenarinin en dista oldugu ilk satir (kol oyugu egrisi yan dikise doner)',
                               'pencereX': list(o['x']), 'bant': list(o['bant']), 'satirY': e[0], 'solX': e[1]}
            oyukY = e[0]
        else:
            s = snap(px, W, H, o['xy'], r, esik)
            k['oyukTabani'] = {'yontem': 'goz tohumu + snap (kose)', **s}; oyukY = s['snapPX'][1]
    # pens ucu
    pensY = None
    if 'pens' in c:
        x0, x1, y0, y1 = c['pens']
        pts = inkPts(px, W, H, x0, x1, y0, y1, esik)
        if pts:
            p = min(pts, key=lambda q: (abs(q[0] - c['cf']), q[1]))
            k['pensUcu'] = {'yontem': "pencerede CF'ye en yakin murekkep (pens ucu)", 'pencere': list(c['pens']), 'xy': list(p)}
            pensY = p[1]
    # oranlar
    if snpY is not None and belY is not None:
        torso = belY - snpY
        k['torsoPX'] = torso
        if oyukY is not None:
            k['oyukOverTorso'] = round((oyukY - snpY) / torso, 4); oyukOran.append((ad, k['oyukOverTorso']))
        if pensY is not None:
            k['pensUcuOverTorso'] = round((pensY - snpY) / torso, 4); pensOran.append((ad, k['pensUcuOverTorso']))
    elif 'olculemezTorso' in c:
        k['torso'] = {'OLCULEMEDI': c['olculemezTorso']}
    # kol acisi
    if 'kolUcu' in c:
        x0, x1, y0, y1 = c['kolUcu']
        pts = inkPts(px, W, H, x0, x1, y0, y1, esik)
        a, b, mid = pca_uclar(pts)
        sx, sy = om['snapPX']
        dx, dy = mid[0] - sx, mid[1] - sy
        aci = round(math.degrees(math.atan2(dy, abs(dx))), 1)
        k['kolUcu'] = {'yontem': 'kol agzi penceresi PCA ana ekseni uclari, ortasi', 'pencere': list(c['kolUcu']),
                       'uclar': [list(a), list(b)], 'orta': list(mid), 'nMurekkep': len(pts)}
        k['kolAcisiDeg'] = {'deger': aci, 'tanim': 'omuz ucu -> kol ucu ortasi, yatayin ALTINA derece', 'dxdy': [round(dx, 1), round(dy, 1)]}
        acilarHepsi.append((ad, aci, c['kolTipi']))
        if c['kolTipi'] in ('setin', 'bishop'): acilarSarkan.append((ad, aci))
    f1['flatler'][ad] = k

def medyan(v):
    s = sorted(v); n = len(s)
    return None if not n else (s[n // 2] if n % 2 else round((s[n // 2 - 1] + s[n // 2]) / 2, 4))

f1['medyanlar'] = {
  'oyukOverTorso': {'n': len(oyukOran), 'degerler': dict(oyukOran), 'medyan': medyan([v for _, v in oyukOran]),
                    'min': min(v for _, v in oyukOran), 'max': max(v for _, v in oyukOran),
                    'tanim': 'kol oyugu tabani y / (SNP->bel); croquisOranlar.underarmOverTorso adayi'},
  'pensUcuOverTorso': {'n': len(pensOran), 'degerler': dict(pensOran), 'medyan': medyan([v for _, v in pensOran]),
                       'tanim': 'pens ucu y / (SNP->bel); apexDropOverTorso VEKILI (pens ucu apexin 1.5-3 cm yaninda/altinda biter)'},
  'kolAcisiDeg': {'nHepsi': len(acilarHepsi), 'hepsi': {ad: {'deg': a, 'kolTipi': t} for ad, a, t in acilarHepsi},
                  'medyanHepsi': medyan([a for _, a, _ in acilarHepsi]),
                  'sarkan': {'n': len(acilarSarkan), 'degerler': dict(acilarSarkan), 'medyan': medyan([a for _, a in acilarSarkan]),
                             'min': min(a for _, a in acilarSarkan), 'max': max(a for _, a in acilarSarkan),
                             'tanim': 'set-in ve bishop (sarkan) kollar; kisa puf yana acilir, sarkma acisi degil'}},
}
sonuc['f1Kapanis'] = f1
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w') as f:
    json.dump(sonuc, f, indent=1, ensure_ascii=False)
print(json.dumps(sonuc['oranlar'], indent=1, ensure_ascii=False))
for ad, k in f1['flatler'].items():
    if 'OLCULEMEDI' in k: print(ad, 'OLCULEMEDI:', k['OLCULEMEDI']); continue
    print(ad, '| snp', k.get('snp', {}).get('xy') or k.get('snp', {}).get('snapPX'), '| bel', k.get('bel', {}).get('satirY'),
          '| oyuk', k.get('oyukTabani', {}).get('satirY') or k.get('oyukTabani', {}).get('snapPX'), '| pens', k.get('pensUcu', {}).get('xy'),
          '| omuz', k['omuzUcu']['snapPX'], '| kolUcu', k.get('kolUcu', {}).get('orta'),
          '| oyuk/torso', k.get('oyukOverTorso'), '| pens/torso', k.get('pensUcuOverTorso'), '| aci', k.get('kolAcisiDeg', {}).get('deger'))
print(json.dumps(f1['medyanlar'], indent=1, ensure_ascii=False))
