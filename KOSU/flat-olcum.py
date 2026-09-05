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

# ---------------------------------------------------------------- AKIL SUZGECI (F1 tur 6; hakem kusuru: 13 Mica 0.2954 fizik disi)
# Giysinin kol oyugu tabani bedenin koltukaltinin ALTINDA olur (kol oyugu bollugu); ustunde olamaz. Esik SAYI DEGIL,
# contract/body-v1.json gercek36 landmark.underarm.y / landmark.waist.y'den okunur (0.4769). Tolerans = 1 kaynak px / torsoPX
# (olcum cozunurlugu; Lenox 0.4765, 510 px torso -> 1 px = 0.0020). Gecmeyen olcum 'OLCULEMEDI' etiketiyle kayitta durur,
# medyana GIRMEZ (bilgi silinmez, hukum tasimaz).
_bv1 = json.load(open(os.path.join(HERE, '..', 'contract', 'body-v1.json')))
_g36 = _bv1['bedenler']['gercek36']['landmarklar']
ANATOMIK_KOLTUKALTI = round(_g36['landmark.underarm']['y'] / _g36['landmark.waist']['y'], 4)
def oyukFizik(oran, torsoPX):
    tol = 1.0 / torsoPX
    return {'ok': oran >= ANATOMIK_KOLTUKALTI - tol, 'esik': ANATOMIK_KOLTUKALTI, 'toleransPX': 1, 'tolerans': round(tol, 4),
            'kural': 'giysi oyuk tabani >= gercek36 koltukalti (underarm.y/waist.y, contract) - 1 px/torso'}
oyukFizikDisi = []   # (ad, oran) medyan disi kalanlar

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
    snp=(460, 490, 90, 122), omuzUcu=(425, 130), oyuk=dict(tip='bukum', x=(300, 560), bant=(130, 420)),
    bel=dict(x=(300, 800), bant=(480, 580)), pens=(440, 472, 395, 430),
    not_='kolsuz: oyuk tabani = kontur bukum noktasi (F1 tur 5; eski en-genis-satir yontemi gogus hattini olcuyordu, 0.581 REDDEDILDI); pens: bel pensi ucu (apex vekili, apexin ~2-3 cm altinda; medyanda -0.06 duzeltme)'),
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

# --- Bolum 3 yardimcilari (Bolum 2'nin 13 Mica egrilik yontemi de kullanir) ---
PUF_ESIK, KISA_ESIK, EGRI_ESIK, EGRI_PENCERE, APEX_TOL, APEX_PENCERE = 1.28, 0.6, 0.12, 12, 2, 6
YEREL = os.path.join(HERE, 'ciktilar', '_yerel', 'yeni-flat')
os.makedirs(YEREL, exist_ok=True)

def indir(url, ad):
    yol = os.path.join(YEREL, ad)
    if not os.path.exists(yol):
        import urllib.request, ssl
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        open(yol, 'wb').write(urllib.request.urlopen(req, timeout=60, context=ssl.create_default_context()).read())
    return yol

CFG3 = {
  # --- yeni flat'ler ---
  'cash-wyman.jpg': dict(
    url='https://cdn.shopify.com/s/files/1/0735/5719/files/Cashmerette-1112Wyman-tech-ill-IG.jpg?v=1780417777',
    sayfa='https://www.cashmerette.com/products/wyman-dress-sloper-pdf-pattern', urun='Cashmerette Wyman Dress Sloper (12-32 kalibi)',
    esik=160, cf=655, snap=8, snp=(480, 520, 730, 770), omuzUcu=(355, 790),
    oyuk=dict(tip='bosluk', x=(280, 380), y=(1130, 1230)),
    bel=dict(tip='yatayCizgi', pencere=(560, 760, 1280, 1320)),
    pens=(440, 500, 1085, 1125), pensTipi='yan pens ucu',
    apexCizgi=(560, 760, 1090, 1120),
    kolUcu=(100, 335, 1600, 1720), kolPencere=(0, 330, 1150, 1600), boy='torso',
    not_='sloper: yan gogus pensi + bel pensleri + bel dikisi + KESIK GOGUS HATTI cizgisi (apex seviyesi dogrudan). Uzun set-in kol.'),
  'cash-hampden.jpg': dict(
    url='https://cdn.shopify.com/s/files/1/0735/5719/files/Cashmerette-1111Hampden-tech-ill-IG.jpg?v=1780419534',
    sayfa='https://www.cashmerette.com/products/hampden-dress-pdf-pattern', urun='Cashmerette Hampden Dress',
    esik=200, cf=655, snap=10, snp=(430, 470, 650, 690), omuzUcu=(337, 702),
    oyuk=dict(tip='tohum', xy=(330, 1052)), oyukNot='kisa kol: kol agzi ic kosesi = kol oyugu dikisi + yan dikis kesisimi (uc cizgi bir noktada)',
    bel=dict(tip='bant', pencere=(560, 760, 1240, 1330)),
    prenses=dict(x=(400, 560), y=(945, 1262)), pensTipi='prenses 45 derece',
    kolUcu=(150, 340, 985, 1060), kolPencere=(150, 335, 720, 1052), boy='torso',
    not_='kol oyugu prenses dikisi + bel bandi + kisa set-in kol'),
  'cash-lenox.jpg': dict(
    url='https://cdn.shopify.com/s/files/1/0735/5719/files/Cashmerette-Lenox-tech-ill-4x5-v2.jpg?v=1780419002',
    sayfa='https://www.cashmerette.com/products/lenox-shirtdress-12-32-pdf-pattern', urun='Cashmerette Lenox Shirtdress (kolsuz gorunum)',
    esik=160, cf=675, snap=10, snpTohum=(585, 1660), snpNot='SNP yaka bandinin altinda: yaka bandi tabani ile omuz cizgisinin kesisimi',
    omuzUcu=(414, 1729),
    oyuk=dict(tip='tohum', xy=(427, 1902)), oyukNot='kolsuz, kol oyugu kesimi dar: sol kontur omuz ucundan bele neredeyse duz iner (egrilik isareti degismez); oyuk tabani = prenses dikisinin kontura degdigi nokta (kol oyugu prensesi tanim geregi oyuktan cikar)',
    bel=dict(tip='bant', pencere=(560, 800, 2140, 2190)),
    prenses=dict(x=(440, 600), y=(1900, 2150)), pensTipi='prenses 45 derece',
    kolTipi='yok',
    not_='kolsuz: kol oyugu prenses dikisi + bel bandi; oyuk tabani egrilik yontemi'),
  'soi-lori.png': dict(
    url='https://cdn.shopify.com/s/files/1/0628/1278/2766/files/Lori_Dress_line_drawing_1200px.png?v=1750235990',
    sayfa='https://www.sewoverit.com/products/lori-dress-pdf-sewing-pattern', urun='Sew Over It Lori Dress',
    esik=160, cf=305, snap=6, omuzUcu=(222, 62),
    olculemezTorso='anvelop: SNP yaka altinda, bel dikisi egik; pens isaretleri 2 px kalem — apex olculmedi',
    kolUcu=(125, 162, 195, 250), kolPencere=(120, 232, 70, 250), boy='kisa', boyKaynak='kisa mansetli puf kol; agiz omuz ucunun ~190 px altinda, figur bel ~250 px: dirsegin ustunde',
    not_='mansetli kisa puf kol (yalniz kol tipi + acisi)'),
  'dd-orage.png': dict(
    url='https://cdn.shopify.com/s/files/1/0632/8217/files/D0046S-dessin_technique.png?v=1710965602',
    sayfa='https://www.deer-and-doe.fr/products/orage-dress-top-skirt-pattern', urun='Deer&Doe Orage Dress, gorunum A (siyah dolgu)',
    esik=100, cf=262, snap=15, omuzUcu=(163, 222),
    olculemezTorso='siyah dolgu: pens/dikis okunmaz (yalniz siluet); yalniz kol',
    kolUcu=(128, 178, 478, 500), kolPencere=(110, 200, 300, 480), boy='uzun', boyKaynak='uzun kol: agiz bel dikisinin (y 375) 120 px altinda',
    not_='uzun set-in kol, bel dikisi (beyaz cizgi)'),
  'dd-passiflore.jpg': dict(
    url='https://cdn.shopify.com/s/files/1/0632/8217/files/Passiflore-dress-pattern_Deer-and-doe_techflat.jpg?v=1710966857',
    sayfa='https://www.deer-and-doe.fr/products/passiflore-dress-shirt-pattern', urun='Deer&Doe Passiflore Dress, gorunum A (siyah dolgu)',
    esik=100, cf=262, snap=15, omuzUcu=(175, 150),
    olculemezTorso='siyah dolgu; yalniz kol',
    kolUcu=(150, 205, 190, 250), kolPencere=(140, 215, 160, 250), boy='kisa', boyKaynak='kisa kol: agiz omuzun ~85 px altinda, bel bandi (y 275) ustunde',
    not_='kisa set-in kol'),
  'dd-magnolia.jpg': dict(
    url='https://cdn.shopify.com/s/files/1/0632/8217/files/magnolia-dress-pattern-tech-flat.jpg?v=1710966606',
    sayfa='https://www.deer-and-doe.fr/products/magnolia-dress-pattern', urun='Deer&Doe Magnolia Dress, gorunum A (siyah dolgu)',
    esik=100, cf=262, snap=15, omuzUcu=(178, 142),
    olculemezTorso='siyah dolgu; yalniz kol',
    kolUcu=(190, 245, 322, 352), kolPencere=(180, 250, 200, 352), boy='uzun', boyKaynak='uzun kol: agiz bel bandinin (y 250) 90 px altinda',
    not_='uzun set-in kol, mansetli'),
  # --- eski flat'lerin kolTipi yeniden etiketi (ayni GIRDI dosyalari) ---
  '03-empire-dress-uc-boy.png': dict(eski=True, kolPencere=(25, 92, 318, 398), boy='kisa', boyKaynak='agiz omuz ucunun 34 px altinda, figur ~200 px: dirsek ustu'),
  '04-a-line-puff-kol.png': dict(eski=True, kolPencere=(195, 272, 100, 240), boy='torso'),
  '06-a-line-puff-kol-varyant.png': dict(eski=True, kolPencere=(125, 203, 110, 235), boy='torso'),
  '02-uzun-robe-dress.png': dict(eski=True, kolPencere=(100, 170, 330, 452), boy='torso'),
  '05-a-line-top-ve-elbise.png': dict(eski=True, kolPencere=(95, 185, 400, 636), boy='uzun', boyKaynak='agiz omuzun 325 px altinda, figur govdesi ~300 px'),
  '07-uzun-kol-akiskan-etek.png': dict(eski=True, kolPencere=(135, 190, 130, 200), boy='torso'),
  '10-princess-a-line.png': dict(eski=True, kolPencere=(300, 700, 700, 1500), boy='uzun', boyKaynak='agiz omuzun ~1000 px altinda (4375 px goruntu)'),
}

def yatayCizgiSatiri(px, W, x0, x1, y0, y1, esik):
    best = None
    for y in range(y0, y1):
        n = sum(1 for x in range(x0, min(x1, W)) if px[x, y] < esik)
        if best is None or n > best[1]: best = (y, n)
    return best

def bantSatirlari(px, W, x0, x1, y0, y1, esik, oran=0.7):
    rows = [y for y in range(y0, y1) if sum(1 for x in range(x0, min(x1, W)) if px[x, y] < esik) >= oran * (min(x1, W) - x0)]
    return rows

def solKenar(px, W, x0, x1, y, esik):
    for x in range(x0, min(x1, W)):
        if px[x, y] < esik: return x
    return None

def egrilikOyuk(px, W, x0, x1, bant, esik):
    xs = [(y, solKenar(px, W, x0, x1, y, esik)) for y in range(*bant)]
    xs = [(y, x) for y, x in xs if x is not None]
    # kayan ortalama egim |dx/dy| EGRI_PENCERE satir uzerinde
    for i in range(EGRI_PENCERE, len(xs) - EGRI_PENCERE):
        egim = abs(xs[i + EGRI_PENCERE][1] - xs[i - EGRI_PENCERE][1]) / (2.0 * EGRI_PENCERE)
        ust = abs(xs[max(0, i - 3 * EGRI_PENCERE)][1] - xs[i - EGRI_PENCERE][1]) / max(1, (2 * EGRI_PENCERE))
        if egim < EGRI_ESIK and ust > 2 * EGRI_ESIK:
            return {'satirY': xs[i][0], 'solX': xs[i][1], 'egim': round(egim, 3), 'ustEgim': round(ust, 3)}
    return None

def bukumOyuk(px, W, x0, x1, bant, esik, pencere=12):
    # Kolsuz, kosesiz kontur (13 Mica): kol oyugu icbukey kavisi yan dikisin disbukey gogus kavisine
    # KOSESIZ baglanir; oyuk tabani = egriligin isaret degistirdigi satir = |dx/dy| egiminin tepe yaptigi
    # satir (bukum noktasi). Kayan ortalama 'pencere' satir.
    xs = [(y, solKenar(px, W, x0, x1, y, esik)) for y in range(*bant)]
    xs = [(y, x) for y, x in xs if x is not None]
    best = None
    for i in range(pencere, len(xs) - pencere):
        egim = (xs[i - pencere][1] - xs[i + pencere][1]) / (2.0 * pencere)   # iceri dogru pozitif
        if best is None or egim > best[1]: best = (xs[i][0], egim, xs[i][1])
    return {'satirY': best[0], 'solX': best[2], 'maxEgim': round(best[1], 3), 'pencere': pencere} if best else None

def prensesApex(px, W, H, x0, x1, y0, y1, esik):
    # her satirda pencere icindeki murekkebin EN SAG (CF'ye en yakin) pikseli = dikis x(y).
    # Kol oyugu prensesi bele kadar CF'ye yaklasmayi surdurur (max x bel dikisinde): 'CF'ye en yakin nokta'
    # apex DEGILDIR. Apex vekili = dikisin YATAYDAN DIKEYE dondugu dirsek: |dx/dy| = 1 (45 derece) kestigi
    # ilk satir (kayan ortalama APEX_PENCERE satir). Ustte dikis yatik (|dx/dy| > 1), altta dik (< 1).
    pts = []
    for y in range(y0, min(y1, H)):
        xs = [x for x in range(x0, min(x1, W)) if px[x, y] < esik]
        if xs: pts.append((y, max(xs)))
    if len(pts) < 2 * APEX_PENCERE + 1: return None
    mx = max(x for _, x in pts)
    for i in range(APEX_PENCERE, len(pts) - APEX_PENCERE):
        egim = abs(pts[i + APEX_PENCERE][1] - pts[i - APEX_PENCERE][1]) / float(pts[i + APEX_PENCERE][0] - pts[i - APEX_PENCERE][0])
        if egim <= 1.0:
            return {'satirY': pts[i][0], 'x': pts[i][1], 'egimDxDy': round(egim, 3), 'maxX': mx, 'n': len(pts), 'yontemNot': '45 derece dirsegi'}
    return {'BULUNAMADI': 'dikis hic 45 dereceyi kesmiyor', 'maxX': mx, 'n': len(pts)}

def kolBalon(px, W, H, x0, x1, y0, y1, esik):
    best = None
    for y in range(y0, min(y1, H)):
        xs = [x for x in range(x0, min(x1, W)) if px[x, y] < esik]
        if len(xs) >= 2 and (best is None or xs[-1] - xs[0] > best[1]): best = (y, xs[-1] - xs[0], xs[0], xs[-1])
    return best

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
        elif o['tip'] == 'bukum':
            e = bukumOyuk(px, W, o['x'][0], o['x'][1], o['bant'], esik)
            k['oyukTabani'] = {'yontem': 'kolsuz, kosesiz kontur: egriligin isaret degistirdigi satir (bukum: |dx/dy| tepe)', 'pencereX': list(o['x']), 'bant': list(o['bant']), **e}
            oyukY = e['satirY']
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
            k['oyukOverTorso'] = round((oyukY - snpY) / torso, 4)
            k['oyukFizik'] = oyukFizik(k['oyukOverTorso'], torso)
            if k['oyukFizik']['ok']: oyukOran.append((ad, k['oyukOverTorso']))
            else:
                k['oyukTabani']['OLCULEMEDI'] = 'fizik disi: oyuk tabani %.4f x torso, bedenin koltukalti %.4f USTUNDE (%.0f mm @390) — yontem yanlis ozelligi yakaladi; medyan disi' % (k['oyukOverTorso'], ANATOMIK_KOLTUKALTI, (ANATOMIK_KOLTUKALTI - k['oyukOverTorso']) * 390)
                oyukFizikDisi.append((ad, k['oyukOverTorso']))
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

# ---------------------------------------------------------------- BOLUM 3 (F1 tur 5, 2026-09-05; hakem kusurlari 3/5/6)
# Yeni acik teknik cizimler (indie kalip markalarinin urun sayfasi gorselleri; URL asagida, dosya
# KOSU/ciktilar/_yerel/yeni-flat/ altina indirilir — telif: repoya girmez, .gitignore). Hedef:
#   apex vekili n >= 6 (pens ucu / prenses kavis tepesi / gogus hatti cizgisi AYRI etiket),
#   kol acisi n >= 10, kolTipi OLCULEBILIR tanimla yeniden etiketlenir, kolsuz oyuk tabani yontemi.
# KOL TIPI TANIMI (olculebilir; hakem: 'puf = omuzda buzgu mu, agizda mi?'):
#   balonOran = kolPencere icindeki EN GENIS murekkep satiri (kolun govdesi) / kol agzi PCA uzunlugu.
#   agiz buzgulu/mansetli kol: balonOran >= PUF_ESIK (1.28) — kol govdesi agizdan genis. 1.28 = olculen kumede
#   duz/klos kollarin maksimumu (1.231, 02 robe) ile buzgulu kollarin minimumu (1.334, 03 empire puf) ortasi;
#   DOGRULANMADI: yayin kaynagi yok, veri bosluguna kondu (kume: 13 kol).
#   kol boyu: agiz ortasi omuz ucundan  < KISA_ESIK x torso asagidaysa KISA (dirsek ~0.85 torso; 0.6 secildi).
#   kolTipi: 'puf'   = balon + kisa   (yana acilan; sarkma bandina GIRMEZ)
#            'bishop'= balon + uzun   (sarkan; banda girer)
#            'setin' = balon degil    (duz, kloş ya da omuzda buzgulu ama agzi acik; sarkan; banda girer)
#   Omuzdaki buzgu tipi DEGISTIRMEZ (06 Eleanor omuzda buzgu, agzi acik -> setin; kol ekseni sarkar).
#   torso yoksa (03/05/10) boy 'boyKaynak' alaniyla elle yazilir ve gerekcesi durur.
# KOLSUZ OYUK TABANI: yan siluet egriliginin isaret degistirdigi satir (oyuk icbukey -> yan dikis)
#   'egrilik' yontemi: sol kenar x(y) bantta; |dx/dy| art arda EGRI_PENCERE satirda < EGRI_ESIK olan
#   ilk satir. Yaninda goz tohumu + snap; iki yontem KAYIT edilir, egrilik birincil.
# PRENSES APEX: dikis x(y) pencerede; kol oyugu prensesi bele kadar CF'ye yaklasir (max x belde), o yuzden
#   'CF'ye en yakin nokta' apex degil; vekil = dikisin yataydan dikeye dondugu DIRSEK (|dx/dy| = 1, 45 derece).
f3 = {'_ne': 'F1 tur 5: yeni acik teknik cizimler (indie kalip markalari; URL her kayitta) + eski flatlerin kolTipi yeniden etiketi. '
             'Yontem Bolum 2 ile ayni (SNP->bel payda; on gorunum sol yari); ek yontemler bu dosyanin BOLUM 3 basliginda. '
             'Dosyalar KOSU/ciktilar/_yerel/yeni-flat/ (telif; commit edilmez).',
      'tanimlar': {'PUF_ESIK': PUF_ESIK, 'KISA_ESIK': KISA_ESIK, 'EGRI_ESIK': EGRI_ESIK, 'EGRI_PENCERE': EGRI_PENCERE, 'APEX_PENCERE': APEX_PENCERE,
                   'kolTipi': 'balonOran = kol govdesinin en genis satiri / agiz PCA uzunlugu; >= PUF_ESIK -> agiz buzgulu; kisa+balon = puf (banda girmez), uzun+balon = bishop, degilse setin',
                   'kisa': 'agiz ortasi - omuz ucu dikey mesafesi < KISA_ESIK x torso (torso yoksa boyKaynak ile elle)'},
      'flatler': {}}
apexKayit = []   # (ad, oran, vekilTipi)
for ad, c in CFG3.items():
    if c.get('eski'):
        im = Image.open(os.path.join(BASE, ad)).convert('L'); px, (W, H) = im.load(), im.size
        eski = f1['flatler'][ad]; c2 = CFG2[ad]
        k = {'eskiKayit': 'Bolum 2', 'kolPencere': list(c['kolPencere'])}
        b = kolBalon(px, W, H, *c['kolPencere'], c2['esik'])
        agiz = eski['kolUcu']['uclar']; agizW = math.hypot(agiz[1][0] - agiz[0][0], agiz[1][1] - agiz[0][1])
        k['enGenisSatir'] = {'y': b[0], 'genislikPX': b[1], 'x': [b[2], b[3]]}; k['agizPX'] = round(agizW, 1)
        k['balonOran'] = round(b[1] / agizW, 3)
        dy = eski['kolUcu']['orta'][1] - eski['omuzUcu']['snapPX'][1]
        if c['boy'] == 'torso':
            k['kisa'] = dy < KISA_ESIK * eski['torsoPX']; k['kisaOlcu'] = round(dy / eski['torsoPX'], 3)
        else:
            k['kisa'] = c['boy'] == 'kisa'; k['boyKaynak'] = c['boyKaynak']
        balon = k['balonOran'] >= PUF_ESIK
        k['kolTipi'] = 'puf' if (balon and k['kisa']) else 'bishop' if balon else 'setin'
        k['kolTipiEski'] = c2['kolTipi']; k['kolAcisiDeg'] = eski['kolAcisiDeg']['deger']
        f3['flatler'][ad] = k
        continue
    yol = indir(c['url'], ad)
    im = Image.open(yol).convert('L'); px, (W, H) = im.load(), im.size
    esik, r = c['esik'], c['snap']
    k = {'urun': c['urun'], 'sayfa': c['sayfa'], 'gorselURL': c['url'], 'boyutPX': [W, H], 'esik': esik, 'cfX': c['cf'], 'not': c['not_']}
    snpY = None
    if 'snp' in c:
        pts = inkPts(px, W, H, *c['snp'], esik)
        top = min(pts, key=lambda p: (p[1], p[0])); k['snp'] = {'yontem': 'pencerede en ust murekkep', 'pencere': list(c['snp']), 'xy': list(top)}; snpY = top[1]
    elif 'snpTohum' in c:
        s = snap(px, W, H, c['snpTohum'], r, esik); k['snp'] = {'yontem': 'goz tohumu + snap', 'not': c.get('snpNot'), **s}; snpY = s['snapPX'][1]
    belY = None
    if 'bel' in c:
        b = c['bel']
        if b['tip'] == 'yatayCizgi':
            y, n = yatayCizgiSatiri(px, W, *b['pencere'], esik); k['bel'] = {'yontem': 'bel dikisi: pencerede en cok murekkepli satir', 'pencere': list(b['pencere']), 'satirY': y, 'nMurekkep': n}; belY = y
        elif b['tip'] == 'bant':
            rows = bantSatirlari(px, W, *b['pencere'], esik)
            belY = round((rows[0] + rows[-1]) / 2.0, 1)
            k['bel'] = {'yontem': 'bel bandi: >= %70 murekkepli satirlarin ilk/son ortasi (band ortasi = dogal bel)', 'pencere': list(b['pencere']), 'bantSatirlari': [rows[0], rows[-1]], 'satirY': belY}
    om = snap(px, W, H, c['omuzUcu'], r, esik)
    if om is None:
        print('UYARI', ad, 'omuz ucu tohumu murekkep bulamadi', c['omuzUcu']); k['omuzUcu'] = {'BULUNAMADI': list(c['omuzUcu'])}; f3['flatler'][ad] = k; continue
    k['omuzUcu'] = {'yontem': 'goz tohumu + snap', **om}
    oyukY = None
    if 'oyuk' in c:
        o = c['oyuk']
        if o['tip'] == 'bosluk':
            bb = boslukSatiri(px, W, o['x'][0], o['x'][1], o['y'][0], o['y'][1], esik)
            k['oyukTabani'] = {'yontem': 'kol ic kenari - yan dikis arasinda beyaz boslugun ilk satiri', **(bb or {'BULUNAMADI': o})}; oyukY = bb and bb['satirY']
        elif o['tip'] == 'egrilik':
            e = egrilikOyuk(px, W, o['x'][0], o['x'][1], o['bant'], esik)
            s = snap(px, W, H, o['tohum'], r, esik)
            k['oyukTabani'] = {'yontem': 'kolsuz: sol kenar egriliginin dikeye dondugu ilk satir (birincil) + goz tohumu (kayit)', 'pencereX': list(o['x']), 'bant': list(o['bant']), 'egrilik': e, 'tohum': s}
            oyukY = e['satirY'] if e else s['snapPX'][1]
        else:
            s = snap(px, W, H, o['xy'], r, esik); k['oyukTabani'] = {'yontem': 'goz tohumu + snap (kose)', 'not': c.get('oyukNot'), **s}; oyukY = s['snapPX'][1]
    apexY, vekil = None, None
    if 'pens' in c:
        pts = inkPts(px, W, H, *c['pens'], esik)
        p = min(pts, key=lambda q: (abs(q[0] - c['cf']), q[1]))
        k['pensUcu'] = {'yontem': "pencerede CF'ye en yakin murekkep (pens ucu)", 'pencere': list(c['pens']), 'xy': list(p)}; apexY, vekil = p[1], c['pensTipi']
    if 'prenses' in c:
        pa = prensesApex(px, W, H, c['prenses']['x'][0], c['prenses']['x'][1], c['prenses']['y'][0], c['prenses']['y'][1], esik)
        k['prensesApex'] = {'yontem': 'prenses dikisi x(y): yataydan dikeye dondugu dirsek, |dx/dy| = 1 (45 derece) kestigi ilk satir', 'pencere': [*c['prenses']['x'], *c['prenses']['y']], **pa}; apexY, vekil = pa['satirY'], c['pensTipi']
    if 'apexCizgi' in c:
        y, n = yatayCizgiSatiri(px, W, *c['apexCizgi'], esik); k['gogusHattiCizgisi'] = {'yontem': 'kesik gogus hatti: pencerede en cok murekkepli satir', 'pencere': list(c['apexCizgi']), 'satirY': y, 'nMurekkep': n}
    if snpY is not None and belY is not None:
        torso = belY - snpY; k['torsoPX'] = torso
        if oyukY is not None:
            k['oyukOverTorso'] = round((oyukY - snpY) / torso, 4); k['oyukFizik'] = oyukFizik(k['oyukOverTorso'], torso)
            if not k['oyukFizik']['ok']:
                k['oyukTabani']['OLCULEMEDI'] = 'fizik disi: bedenin koltukalti %.4f ustunde; medyan disi' % ANATOMIK_KOLTUKALTI; oyukFizikDisi.append((ad, k['oyukOverTorso']))
        if apexY is not None: k['apexVekilOverTorso'] = round((apexY - snpY) / torso, 4); k['apexVekilTipi'] = vekil; apexKayit.append((ad, k['apexVekilOverTorso'], vekil))
        if 'gogusHattiCizgisi' in k:
            k['gogusHattiOverTorso'] = round((k['gogusHattiCizgisi']['satirY'] - snpY) / torso, 4); apexKayit.append((ad, k['gogusHattiOverTorso'], 'gogus hatti cizgisi'))
    elif 'olculemezTorso' in c:
        k['torso'] = {'OLCULEMEDI': c['olculemezTorso']}
    if 'kolUcu' in c:
        pts = inkPts(px, W, H, *c['kolUcu'], esik); a, b2, mid = pca_uclar(pts)
        sx, sy = om['snapPX']; dx, dy = mid[0] - sx, mid[1] - sy
        k['kolUcu'] = {'yontem': 'kol agzi penceresi PCA ana ekseni uclari, ortasi', 'pencere': list(c['kolUcu']), 'uclar': [list(a), list(b2)], 'orta': list(mid), 'nMurekkep': len(pts)}
        k['kolAcisiDeg'] = {'deger': round(math.degrees(math.atan2(dy, abs(dx))), 1), 'tanim': 'omuz ucu -> kol ucu ortasi, yatayin ALTINA derece', 'dxdy': [round(dx, 1), round(dy, 1)]}
        bal = kolBalon(px, W, H, *c['kolPencere'], esik); agizW = math.hypot(b2[0] - a[0], b2[1] - a[1])
        k['kolPencere'] = list(c['kolPencere']); k['enGenisSatir'] = {'y': bal[0], 'genislikPX': bal[1], 'x': [bal[2], bal[3]]}; k['agizPX'] = round(agizW, 1)
        k['balonOran'] = round(bal[1] / agizW, 3)
        if c['boy'] == 'torso' and 'torsoPX' in k: k['kisa'] = dy < KISA_ESIK * k['torsoPX']; k['kisaOlcu'] = round(dy / k['torsoPX'], 3)
        else: k['kisa'] = c['boy'] == 'kisa'; k['boyKaynak'] = c.get('boyKaynak')
        balon = k['balonOran'] >= PUF_ESIK
        k['kolTipi'] = 'puf' if (balon and k['kisa']) else 'bishop' if balon else 'setin'
    elif 'kolTipi' in c: k['kolTipi'] = c['kolTipi']
    f3['flatler'][ad] = k

# ---------------------------------------------------------------- BOLUM 4 (F1 tur 6; karar ajani 6): Bugra Locket KISA PUF kol
# Eldeki satin alinmis birincil kaynak: patterns_real/Locket Top/5 Inspirations.jpg (satici urun gorseli, 6 kumas renklendirmesi
# ayni teknik cizim; 2000x2000 px). Okunur, degistirilmez, commit edilmez (telif); yalniz sayilar buraya. Ayni yontem: omuz ucu
# (kol kepinin omuz dikisine degdigi ust nokta) -> kol agzi ortasi (agiz bandinin iki ucunun ortasi), yatayin ALTINA derece.
# Tohumlar goz ile 50 px grid ustunde okundu (STRIPE ust, sol kol; scratchpad linen_grid.png), snap ile murekkebe cekildi.
LOCKET = os.path.join(HERE, '..', 'patterns_real', 'Locket Top', '5 Inspirations.jpg')
LOCKET_CFG = dict(esik=90, snap=8, omuzUcu=(822, 260), agizUclar=((713, 442), (803, 540)), cf=880, urun='Bugra (BB) Locket Top, kisa puf kol, satici teknik cizimi (STRIPE renklendirmesi, sol kol)')
if os.path.exists(LOCKET):
    im = Image.open(LOCKET).convert('L'); px, (W, H) = im.load(), im.size
    c = LOCKET_CFG; om = snap(px, W, H, c['omuzUcu'], c['snap'], c['esik'])
    u1 = snap(px, W, H, c['agizUclar'][0], c['snap'], c['esik']); u2 = snap(px, W, H, c['agizUclar'][1], c['snap'], c['esik'])
    k = {'urun': c['urun'], 'kaynak': 'patterns_real/Locket Top/5 Inspirations.jpg (satin alinmis, yerel, commit edilmez)', 'boyutPX': [W, H], 'esik': c['esik'],
         'omuzUcu': {'yontem': 'goz tohumu + snap', **om} if om else {'BULUNAMADI': list(c['omuzUcu'])},
         'kolUcu': {'yontem': 'agiz bandinin iki ucu goz tohumu + snap, ortasi', 'uclar': [u1 and u1['snapPX'], u2 and u2['snapPX']]},
         'kolTipi': 'puf', 'kisa': True, 'boyKaynak': 'kisa puf kol (satici: Upper Sleeve buzgulu + Lower Sleeve band; 2 Pattern Cutting.jpg parca 5/6)',
         'not': 'torso payda yok (SNP/bel penceresi bu gorselde olculmedi; yalniz kol acisi). Kol kepinde buzgu, agiz band ile toplanmis -> agiz ortasi omuz ucunun altinda: kol SARKAR, yana acilmaz.'}
    if om and u1 and u2:
        mid = ((u1['snapPX'][0] + u2['snapPX'][0]) / 2.0, (u1['snapPX'][1] + u2['snapPX'][1]) / 2.0)
        sx, sy = om['snapPX']; dx, dy = mid[0] - sx, mid[1] - sy
        k['kolUcu']['orta'] = [round(mid[0], 1), round(mid[1], 1)]
        k['kolAcisiDeg'] = {'deger': round(math.degrees(math.atan2(dy, abs(dx))), 1), 'tanim': 'omuz ucu -> kol agzi ortasi, yatayin ALTINA derece', 'dxdy': [round(dx, 1), round(dy, 1)]}
    # --- 6 OKUMA (F1 tur 7; karar ajani 'Locket 6 okuma'): ayni teknik cizim 6 kumas renklendirmesinde 6 kez basilmis.
    # Tek okuma (STRIPE, murekkep snap) okuma hatasini olcmez. Her renklendirme AYNI cizimin bir kopyasi oldugu icin
    # 6 okuma = ayni acinin 6 bagimsiz kaydi: medyan yazilir, yayilim okuma hatasidir. Yontem renkten bagimsiz olsun diye
    # murekkep esigi degil SILUET MASKESI kullanilir (arka plan tek renk (242,238,227); |px - bg|_1 > MASKE_ESIK = giysi).
    # Kayit: STRIPE sablonu (ust orta) diger 5 kopyaya maske IoU ile kaydedilir (kaba: 4x kucultme +-64 px, ince: tam
    # cozunurluk +-4 px); STRIPE tohumlari kaydirilir ve maske SINIRINA (4-komsusu arka plan olan maske pikseli) snap edilir.
    import numpy as np
    rgb = np.asarray(Image.open(LOCKET).convert('RGB')).astype(int)
    BG = np.array([242, 238, 227]); MASKE_ESIK = 40
    mask = (np.abs(rgb - BG).sum(axis=2) > MASKE_ESIK)
    RENKLER = {'linen': (-670, 0), 'stripe': (0, 0), 'navy-stripe': (660, 0), 'polka': (-670, 945), 'plaid': (0, 945), 'denim': (660, 945)}
    tx0, tx1, ty0, ty1 = 660, 1340, 190, 960   # STRIPE kopyasinin penceresi (tam cozunurluk)
    tmpl = mask[ty0:ty1, tx0:tx1]
    def iou(a, b):
        u = (a | b).sum(); return (a & b).sum() / u if u else 0.0
    def kaydir(dx, dy):
        y0, y1, x0, x1 = ty0 + dy, ty1 + dy, tx0 + dx, tx1 + dx
        if y0 < 0 or x0 < 0 or y1 > H or x1 > W: return None
        return mask[y0:y1, x0:x1]
    def sinir_snap(xy, r=12):
        best = None
        for yy in range(max(1, xy[1] - r), min(H - 1, xy[1] + r + 1)):
            for xx in range(max(1, xy[0] - r), min(W - 1, xy[0] + r + 1)):
                if mask[yy, xx] and not (mask[yy - 1, xx] and mask[yy + 1, xx] and mask[yy, xx - 1] and mask[yy, xx + 1]):
                    d = math.hypot(xx - xy[0], yy - xy[1])
                    if best is None or d < best[0]: best = (d, xx, yy)
        return None if best is None else {'tohum': [int(xy[0]), int(xy[1])], 'snapPX': [best[1], best[2]], 'mesafePX': round(best[0], 2), 'yaricapPX': r}
    okumalar = {}
    for ad, (ndx, ndy) in RENKLER.items():
        # kaba arama 4x kucultme
        ms = mask[::4, ::4]; t4 = tmpl[::4, ::4]
        best = None
        for dy in range(ndy - 64, ndy + 65, 4):
            for dx in range(ndx - 64, ndx + 65, 4):
                y0, x0 = (ty0 + dy) // 4, (tx0 + dx) // 4
                b = ms[y0:y0 + t4.shape[0], x0:x0 + t4.shape[1]]
                if b.shape != t4.shape: continue
                v = iou(t4, b)
                if best is None or v > best[0]: best = (v, dx, dy)
        _, bdx, bdy = best
        fine = None
        for dy in range(bdy - 4, bdy + 5):
            for dx in range(bdx - 4, bdx + 5):
                b = kaydir(dx, dy)
                if b is None: continue
                v = iou(tmpl, b)
                if fine is None or v > fine[0]: fine = (v, dx, dy)
        v, dx, dy = fine
        om6 = sinir_snap((c['omuzUcu'][0] + dx, c['omuzUcu'][1] + dy))
        a1 = sinir_snap((c['agizUclar'][0][0] + dx, c['agizUclar'][0][1] + dy)); a2 = sinir_snap((c['agizUclar'][1][0] + dx, c['agizUclar'][1][1] + dy))
        kayit = {'kayitDXDY': [dx, dy], 'maskeIoU': round(v, 4), 'omuzUcu': om6, 'agizUclar': [a1 and a1['snapPX'], a2 and a2['snapPX']]}
        if om6 and a1 and a2:
            mid = ((a1['snapPX'][0] + a2['snapPX'][0]) / 2.0, (a1['snapPX'][1] + a2['snapPX'][1]) / 2.0)
            ddx, ddy = mid[0] - om6['snapPX'][0], mid[1] - om6['snapPX'][1]
            kayit['agizOrta'] = [round(mid[0], 1), round(mid[1], 1)]
            kayit['kolAcisiDeg'] = round(math.degrees(math.atan2(ddy, abs(ddx))), 1)
        okumalar[ad] = kayit
    degs = sorted(o['kolAcisiDeg'] for o in okumalar.values() if 'kolAcisiDeg' in o)
    k['okumalar'] = {'yontem': 'siluet maskesi (|px-bg|_1 > %d), STRIPE sablonu IoU kaydi, tohum -> maske siniri snap r=12' % MASKE_ESIK,
                     'renklendirmeler': okumalar,
                     'n': len(degs), 'medyan': medyan(degs), 'min': min(degs), 'max': max(degs), 'yayilimDeg': round(max(degs) - min(degs), 1),
                     'stripeMurekkepOkumasi': k.get('kolAcisiDeg', {}).get('deger'),
                     'tanim': 'ayni cizimin 6 kopyasi = ayni acinin 6 okumasi; yayilim okuma hatasidir, cizim farki degil'}
    if degs and 'kolAcisiDeg' in k:
        k['kolAcisiDeg']['stripeMurekkep'] = k['kolAcisiDeg']['deger']
        k['kolAcisiDeg']['deger'] = medyan(degs)
        k['kolAcisiDeg']['tanim'] += '; deger = 6 renklendirme okumasinin medyani (okumalar), STRIPE murekkep okumasi stripeMurekkep alaninda'
    f3['flatler']['bugra-locket'] = k
else:
    f3['flatler']['bugra-locket'] = {'OKUNMADI': 'patterns_real/Locket Top/5 Inspirations.jpg bu makinede yok (satin alinmis kaynak, repoda degil)'}

# --- medyanlar: Bolum 2 + Bolum 3 birlesik ---
apexHepsi = [(ad, v, 'pens ucu') for ad, v in pensOran] + apexKayit
# 13 Mica bel pensi ucu: apexin ~2-3 cm altinda biter -> duzeltme (hakem: ham 0.77 degil ~0.71). Duzeltme = -0.06 torso
# (torso 390 mm'de 23 mm; 13'un kendi notu '2-3 cm'). Ham deger de kayitta durur.
MICA_DUZELTME = -0.06
apexHepsi = [(ad, (round(v + MICA_DUZELTME, 4) if ad.startswith('13-') else v), (t + ' (bel pensi, duzeltilmis %+.2f)' % MICA_DUZELTME if ad.startswith('13-') else t)) for ad, v, t in apexHepsi]
# SINIF (F1 tur 6, karar ajani 4): vekil apex'e GEOMETRIK iliskisiyle siniflanir; birincil medyan = DOGRUDAN + Y-NOTR + duzeltilmis Y-OFSETLI.
#  DOGRUDAN : cizili gogus hatti / apex isareti (apex seviyesi dogrudan)
#  Y-NOTR   : yan gogus pensi ucu — apexten YANA kisa biter, y'si apex hizasinda (Wyman: yan pens 0.6571 vs cizili hat 0.6535, fark 0.004)
#  Y-OFSETLI: bel pensi ucu — apexin 2.5-3 cm ALTINDA biter, olculen/standart ofsetle duzeltilir (13 Mica -0.06 torso)
#  DISARIDA : kol oyugu pensi ucu (06 Eleanor), prenses 45-derece dirsegi (Hampden/Lenox) — konumu stile bagli, apex'i olcmez;
#             medyana GIRMEZ, bilgi olarak kayitta durur (bilgi silme yasagi).
SINIF = {('04-a-line-puff-kol.png', 'pens ucu'): ('Y-NOTR', 'gogus altindan yana pens (CFG2 not), ucu apex hizasinda'),
         ('06-a-line-puff-kol-varyant.png', 'pens ucu'): ('DISARIDA', 'kol oyugu pensi (armhole dart): ucu apexin ust-disinda, stile bagli'),
         ('13-yuksek-bel-a-line.png', 'pens ucu (bel pensi, duzeltilmis -0.06)'): ('Y-OFSETLI', 'bel pensi ucu apexin 2-3 cm altinda; -0.06 torso (23 mm @390) duzeltildi'),
         ('cash-wyman.jpg', 'yan pens ucu'): ('Y-NOTR', 'yan pens ucu, ayni cizimde cizili gogus hattiyla 0.004 icinde'),
         ('cash-wyman.jpg', 'gogus hatti cizgisi'): ('DOGRUDAN', 'kesik gogus hatti cizgisi = apex seviyesi'),
         ('cash-hampden.jpg', 'prenses 45 derece'): ('DISARIDA', 'kol oyugu prensesi dirsegi apexin ustunde, stile bagli'),
         ('cash-lenox.jpg', 'prenses 45 derece'): ('DISARIDA', 'kol oyugu prensesi dirsegi apexin ustunde, stile bagli')}
def sinif(ad, t):
    s_ = SINIF.get((ad, t)); return s_ if s_ else ('SINIFSIZ', 'SINIF tablosunda yok — medyana girmez')
birincilV = [v for ad, v, t in apexHepsi if sinif(ad, t)[0] in ('DOGRUDAN', 'Y-NOTR', 'Y-OFSETLI')]
disaridaV = [v for ad, v, t in apexHepsi if sinif(ad, t)[0] == 'DISARIDA']
pensV = [v for _, v, t in apexHepsi if t.startswith('pens') or t.startswith('yan pens')]
prensesV = [v for _, v, t in apexHepsi if t.startswith('prenses')]
cizgiV = [v for _, v, t in apexHepsi if t.startswith('gogus')]
tumV = [v for _, v, _ in apexHepsi]
# kol acisi: Bolum 2 flat'lerin tipi YENI tanimla (Bolum 3 eski kayitlari), Bolum 3 yeni flat'ler
aci = {}
for ad, k in f3['flatler'].items():
    if 'kolAcisiDeg' in k:
        d = k['kolAcisiDeg']['deger'] if isinstance(k['kolAcisiDeg'], dict) else k['kolAcisiDeg']
        aci[ad] = {'deg': d, 'kolTipi': k['kolTipi'], 'balonOran': k.get('balonOran'), 'kisa': k.get('kisa')}
sarkan = {ad: v['deg'] for ad, v in aci.items() if v['kolTipi'] in ('setin', 'bishop')}
puf = {ad: v['deg'] for ad, v in aci.items() if v['kolTipi'] == 'puf'}
sv = sorted(sarkan.values())
def iqr(v):
    s = sorted(v); n = len(s); q1 = s[n // 4]; q3 = s[(3 * n) // 4]; return q1, q3
f3['medyanlar'] = {
  'apexOverTorso': {'n': len(tumV), 'medyanHepsi': medyan(tumV), 'kayitlar': [{'flat': ad, 'oran': v, 'vekil': t, 'sinif': sinif(ad, t)[0], 'sinifNeden': sinif(ad, t)[1]} for ad, v, t in apexHepsi],
                    'birincil': {'n': len(birincilV), 'medyan': medyan(birincilV), 'siniflar': ['DOGRUDAN', 'Y-NOTR', 'Y-OFSETLI'], 'degerler': sorted(birincilV),
                                 'tanim': 'karar ajani 4: apex\'e geometrik iliskisi bilinen vekiller; DISARIDA (prenses dirsegi, oyuk pensi) medyana girmez'},
                    'disarida': {'n': len(disaridaV), 'medyan': medyan(disaridaV), 'degerler': sorted(disaridaV), 'tanim': 'bilgi: apex\'i olcmez, kayitta durur'},
                    'pensUcu': {'n': len(pensV), 'medyan': medyan(pensV)}, 'prenses': {'n': len(prensesV), 'medyan': medyan(prensesV)},
                    'gogusHattiCizgisi': {'n': len(cizgiV), 'medyan': medyan(cizgiV)},
                    'ikiVekilFarki': (round(abs(medyan(pensV) - medyan(prensesV)), 4) if pensV and prensesV else None),
                    'micaDuzeltme': MICA_DUZELTME},
  'kolAcisiDeg': {'hepsi': aci, 'sarkan': {'n': len(sv), 'medyan': medyan(sv), 'min': min(sv), 'max': max(sv), 'iqr': iqr(sv), 'degerler': sarkan},
                  'puf': {'n': len(puf), 'degerler': puf, 'medyan': medyan(list(puf.values())) if puf else None,
                          'band': ([min(puf.values()), max(puf.values())] if len(puf) >= 3 else None),
                          'bandKurali': 'n >= 3 -> min/max (n < 10); n < 3 band yazilmaz (karar ajani 6)'}},
  'oyukOverTorso': {ad: k['oyukOverTorso'] for ad, k in f3['flatler'].items() if 'oyukOverTorso' in k},
  'oyukOverTorsoBirlesik': (lambda vals: {'n': len(vals), 'medyan': medyan([v for _, v in vals]), 'degerler': dict(vals), 'fizikDisi': dict(oyukFizikDisi),
                                          'esik': ANATOMIK_KOLTUKALTI, 'tanim': 'Bolum 2 + Bolum 3 oyuk tabani, fizik suzgeci gecenler (oyuk >= bedenin koltukalti - 1 px); croquisOranlar.underarmOverTorso ikinci kaynagi'})(
                              list(oyukOran) + [(ad, k['oyukOverTorso']) for ad, k in f3['flatler'].items() if 'oyukOverTorso' in k and k.get('oyukFizik', {}).get('ok')]),
}
sonuc['f1Tur5'] = f3
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
