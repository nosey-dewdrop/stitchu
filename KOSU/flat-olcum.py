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
#   kolTipi: F1 karar ajani 3b (tur 10 uygulama): BOLUM 2'de ELLE kolTipi YOK; kollu flatlerin kolTipi'si CFG3.etiket x CFG3.boy'dan
#            kolTipiEtiketten ile turetilir (f1Kapanis == f1Tur5, defterde tek etiket). Yalniz CFG3'te olmayan kolsuz/kap kayitlar (13 'yok',
#            15 'kap') kolTipi'ni burada tasir, kolTipiKaynak='tarihce'. Tur 9 elle etiketleri (02 robe setin, 07 Celia setin) git 918c103a'da.
CFG2 = {
  '01-kaftan-maxi-uzun-kol.png': dict(olculemez='kaftan: omuz dikisi, kol oyugu ve dogal bel cizimde yok (govde hatti gorunmez)'),
  '02-uzun-robe-dress.png': dict(
    urun='Folkwear robe (tarama, 1036 px)', esik=160, cf=246, snap=8,
    snpTohum=(203, 168), omuzUcu=(145, 180), oyuk=dict(tip='tohum', xy=(169, 323)),
    bel=dict(x=(100, 400), bant=(360, 400)), kolUcu=(100, 156, 410, 452),
    not_='tarama kalitesi dusuk: SNP ve oyuk tohumla (snap); sal yaka SNP penceresini bozar. Kol oyugu 1940 robe: dusuk oyuk'),
  '03-empire-dress-uc-boy.png': dict(
    urun='Folkwear empire (Simple Version Front, ~200 px figur)', esik=160, cf=157, snap=6,
    omuzUcu=(98, 328), kolUcu=(22, 60, 340, 385),
    olculemezTorso='empire kesim: dogal bel cizimde yok; kare yaka: SNP yok; oyuk puf altinda',
    not_='yalniz kol acisi (kisa PUF kol: kol yana acilir, sarkan kol degil — medyanda ayri etiketle)'),
  '04-a-line-puff-kol.png': dict(
    urun="Helen's Closet Holmes, view A", esik=160, cf=350, snap=6,
    snp=(290, 312, 55, 85), omuzUcu=(249, 89),
    oyukOlculemez='kol ic kenari govde yan dikisiyle CAKISIK (tek cizgi x~271, y 175-232), kol agzi ic kosesi govdeye deger: oyuk tabani kosesi cizimde yok; zoom ile bakildi (2026-09-05)',
    bel=dict(x=(190, 510), bant=(232, 262)), pens=(270, 296, 174, 196), kolUcu=(195, 266, 195, 235),
    not_='kisa set-in kol, V yaka, buzgulu bel; pens: gogus altindan yana pens, ucu apex vekili'),
  '05-a-line-top-ve-elbise.png': dict(
    urun="Helen's Closet March, view A (gri croquis ustunde)", esik=100, cf=304, snap=6,
    snp=(232, 252, 245, 272), omuzUcu=(167, 277), oyuk=dict(tip='bosluk', x=(180, 206), y=(350, 400)),
    kolUcu=(100, 165, 590, 636),
    olculemezTorso='empire/yoke kesim: dogal bel cizimde yok',
    not_='esik 100: arkadaki croquis govde acik gri, murekkep koyu; uzun bishop kol manset'),
  '06-a-line-puff-kol-varyant.png': dict(
    urun='Deer&Doe Eleanor, view A', esik=160, cf=283, snap=6,
    snp=(225, 250, 60, 95), omuzUcu=(194, 88), oyuk=dict(tip='bosluk', x=(176, 206), y=(150, 230)),
    bel=dict(x=(111, 475), bant=(230, 300)), pens=(205, 230, 172, 195), kolUcu=(125, 190, 200, 240),
    not_='set-in kisa kol (omuzda hafif buzgu); pens: kol oyugundan gogse pens (armhole dart), ucu apex vekili. Oyuk penceresi x<=206: pens cizgisi (x 193-222, y 183-193) dikise bagli, pencereye girse tek parca sayilir'),
  '07-uzun-kol-akiskan-etek.png': dict(
    urun='Deer&Doe Celia, gorunum A', esik=160, cf=278, snap=6,
    snp=(245, 265, 15, 45), omuzUcu=(195, 60), oyuk=dict(tip='bosluk', x=(185, 215), y=(120, 190)),
    bel=dict(x=(51, 443), bant=(194, 240)), kolUcu=(140, 190, 170, 200),
    not_='kisa set-in kol (omuzda buzgu), V yaka, bel dikisi; pens yok (buzgu)'),
  '08-empire-buzgu-etek.png': dict(olculemez='kimono kol: omuz ucu ve kol oyugu yok'),
  '09-a-line-puff-kol-midi.png': dict(olculemez='kare yaka omuzsuz: SNP yok; balon kol bagli, kol ekseni tanimsiz'),
  '10-princess-a-line.png': dict(
    urun='Alice (4375 px)', esik=160, cf=1104, snap=12,
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
# F1 tur 9 (hakem ENGEL 1+2): PUF_ESIK ve KISA_ESIK TEK KAYNAKTAN okunur — contract/flat-convention-v1.json
# sevkPoz.kolAcisiDeg.kosulluBant[0].kosul (agizBuzguOranMin, kolBoyuOverTorsoMax). Bu dosya BOLUM 5'te kisa alt kume
# boslugunu ve kol boyu boslugunu URETIR ve dosyanin sonunda contract'taki sayiyla KARSILASTIRIR: fark varsa 'ESIK UYUMSUZ'
# basar, exit 2. Ayni esik icin repoda iki sayi olamaz (tur 8'de PUF_ESIK 1.28 / contract 1.21 ikiligi buradan cikti).
# F1 tur 10 (hakem ENGEL 2): esikler HICBIR ETIKET VERMEZ. Tur 9'da eski 13 kolun duz/buzgulu etiketi kolTipi'nden
# (balonOran >= PUF_ESIK) ve olculen kollarin kisa/uzun etiketi kolBoyuOverTorso < KISA_ESIK'ten geliyordu: uretici kendi
# esigine bagliydi, kontrol yalniz 'contract kendi sabit noktasinda mi' diyordu (1.713/[1.51,1.916] da gecerdi). Simdi:
# agiz etiketi (duz/buzgulu) HER kolda CFG3/CFG5'te cizim konvansiyonundan elle (agizda buzgu/lastik/buzgulu manset cizili mi),
# boy etiketi (kisa/uzun/dirsek) urun tanimindan ya da cizimden elle (boyKaynak); kolTipi bu ikisinden turetilir. Oranlar
# (balonOranDik, kolBoyuOverTorso) YALNIZ bosluk hesabinda kullanilir. PUF_ESIK/KISA_ESIK bu dosyada yalniz dosya
# sonundaki contract-uretici karsilastirmasinda okunur. FLAT_CONTRACT ortam degiskeni negatif test icin baska bir contract
# dosyasi gosterir (beyan: 1.713/[1.51,1.916] ve 0.7/[0.656,0.704] -> exit 2).
CONTRACT_FC = os.environ.get('FLAT_CONTRACT') or os.path.join(HERE, '..', 'contract', 'flat-convention-v1.json')
KOSUL = json.load(open(CONTRACT_FC))['sevkPoz']['kolAcisiDeg']['kosulluBant'][0]['kosul']
PUF_ESIK, KISA_ESIK = KOSUL['agizBuzguOranMin'], KOSUL['kolBoyuOverTorsoMax']
EGRI_ESIK, EGRI_PENCERE, APEX_TOL, APEX_PENCERE = 0.12, 12, 2, 6
YEREL = os.path.join(HERE, 'ciktilar', '_yerel', 'yeni-flat')
os.makedirs(YEREL, exist_ok=True)

def boyEtiket(boy):
    # F1 tur 10: kisa True / uzun False / dirsek None (ne kisa ne uzun; Mabel ornegi, sinifa sayilmaz). 'torso' artik etiket degil.
    assert boy in ('kisa', 'uzun', 'dirsek'), 'boy etiketi urun taniminden elle yazilir: kisa/uzun/dirsek, %r' % boy
    return {'kisa': True, 'uzun': False, 'dirsek': None}[boy]
def kolTipiEtiketten(etiket, kisa):
    # kolTipi = agiz etiketi x boy etiketi; oran okunmaz. puf yalniz kisa+buzgulu (yana acilir, sarkan banda girmez).
    if etiket == 'buzgulu': return 'puf' if kisa is True else 'bishop'
    return 'setin'

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
    kolUcu=(100, 335, 1600, 1720), kolPencere=(0, 330, 1150, 1600), boy='uzun', torsoOlc=True,
    boyKaynak='bilek boyu set-in kol (cizim: agiz bel dikisinin ~330 px altinda, etek yaninda); urun sayfasi kol boyu yazmaz',
    etiket='duz', etiketNeden='agiz acik duz kenar, manset/buzgu cizgisi yok',
    not_='sloper: yan gogus pensi + bel pensleri + bel dikisi + KESIK GOGUS HATTI cizgisi (apex seviyesi dogrudan). Uzun set-in kol.'),
  'cash-hampden.jpg': dict(
    url='https://cdn.shopify.com/s/files/1/0735/5719/files/Cashmerette-1111Hampden-tech-ill-IG.jpg?v=1780419534',
    sayfa='https://www.cashmerette.com/products/hampden-dress-pdf-pattern', urun='Cashmerette Hampden Dress',
    esik=200, cf=655, snap=10, snp=(430, 470, 650, 690), omuzUcu=(337, 702),
    oyuk=dict(tip='tohum', xy=(330, 1052)), oyukNot='kisa kol: kol agzi ic kosesi = kol oyugu dikisi + yan dikis kesisimi (uc cizgi bir noktada)',
    bel=dict(tip='bant', pencere=(560, 760, 1240, 1330)),
    prenses=dict(x=(400, 560), y=(945, 1262)), pensTipi='prenses 45 derece',
    kolUcu=(150, 340, 985, 1060), kolPencere=(150, 335, 720, 1052), boy='kisa', torsoOlc=True,
    boyKaynak='kisa set-in kol (cizim: agiz omuz ucunun ~300 px altinda, bel bandinin 200 px ustunde, dirsek ustu)',
    etiket='duz', etiketNeden='agiz acik duz kenar (kesik cizgi = bastirma dikisi), buzgu yok',
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
    etiket='buzgulu', etiketNeden='agizda manset bandi, bandin ustunde buzgu cizgileri; kep de buzgulu',
    not_='mansetli kisa puf kol (yalniz kol tipi + acisi)'),
  'dd-orage.png': dict(
    url='https://cdn.shopify.com/s/files/1/0632/8217/files/D0046S-dessin_technique.png?v=1710965602',
    sayfa='https://www.deer-and-doe.fr/products/orage-dress-top-skirt-pattern', sayfaYonlenme='https://closetcorepatterns.com/products/orage-dress-top-skirt-pattern (deer-and-doe.fr tumden 301; curl 2026-09-05 HTTP 200)', urun='Deer&Doe Orage Dress, gorunum A (siyah dolgu)',
    esik=100, cf=262, snap=15, omuzUcu=(163, 222),
    olculemezTorso='siyah dolgu: pens/dikis okunmaz (yalniz siluet); yalniz kol',
    kolUcu=(128, 178, 478, 500), kolPencere=(110, 200, 300, 480), boy='uzun', boyKaynak='uzun kol: agiz bel dikisinin (y 375) 120 px altinda; urun sayfasi (Closet Core): "Version A has long sleeves"',
    etiket='duz', etiketNeden='oturan orgu kol, bilege dogru daralir, agiz duz kenar; siyah siluette buzgu/manset cizgisi yok (tur 9 kolTipi bishop etiketi orandan gelmisti, konvansiyonla DUZ)',
    not_='uzun set-in kol, bel dikisi (beyaz cizgi)'),
  'dd-passiflore.jpg': dict(
    url='https://cdn.shopify.com/s/files/1/0632/8217/files/Passiflore-dress-pattern_Deer-and-doe_techflat.jpg?v=1710966857',
    sayfa='https://www.deer-and-doe.fr/products/passiflore-dress-shirt-pattern', sayfaYonlenme='https://closetcorepatterns.com/products/passiflore-dress-shirt-pattern (deer-and-doe.fr tumden 301; curl 2026-09-05 HTTP 200)', urun='Deer&Doe Passiflore Dress, gorunum A (siyah dolgu)',
    esik=100, cf=262, snap=15, omuzUcu=(175, 150),
    olculemezTorso='siyah dolgu; yalniz kol',
    kolUcu=(150, 205, 190, 250), kolPencere=(140, 215, 160, 250), boy='kisa', boyKaynak='kisa kol: agiz omuzun ~85 px altinda, bel bandi (y 275) ustunde',
    etiket='duz', etiketNeden='agiz acik duz kenar (ince manset cizgisi, buzgu yok)',
    not_='kisa set-in kol'),
  'dd-magnolia.jpg': dict(
    url='https://cdn.shopify.com/s/files/1/0632/8217/files/magnolia-dress-pattern-tech-flat.jpg?v=1710966606',
    sayfa='https://www.deer-and-doe.fr/products/magnolia-dress-pattern', sayfaYonlenme='https://closetcorepatterns.com/products/magnolia-dress-pattern (deer-and-doe.fr tumden 301; curl 2026-09-05 HTTP 200)', urun='Deer&Doe Magnolia Dress, gorunum A (siyah dolgu)',
    esik=100, cf=262, snap=15, omuzUcu=(178, 142),
    olculemezTorso='siyah dolgu; yalniz kol',
    kolUcu=(190, 245, 322, 352), kolPencere=(180, 250, 200, 352), boy='uzun', boyKaynak='uzun kol: agiz bel bandinin (y 250) 90 px altinda; urun sayfasi: "a long set-in sleeve"',
    etiket='buzgulu', etiketNeden='agizda kisa buzgu cizgileri (siyah siluette 5-6 dikey cizgi), kol mansete toplanir (tur 9 kolTipi setin etiketi orandan gelmisti, konvansiyonla BUZGULU)',
    not_='uzun set-in kol, mansetli'),
  # --- eski flat'lerin kolTipi yeniden etiketi (ayni GIRDI dosyalari) ---
  # etiket/boy F1 tur 10: konvansiyondan ve urun tanimindan elle, kolTipi/orandan DEGIL (hakem ENGEL 2)
  '03-empire-dress-uc-boy.png': dict(eski=True, kolPencere=(25, 92, 318, 398), boy='kisa', boyKaynak='agiz omuz ucunun 34 px altinda, figur ~200 px: dirsek ustu',
    etiket='buzgulu', etiketNeden='Folkwear empire Simple Version: agizda buzgulu band, kep buzgulu (puf)'),
  '04-a-line-puff-kol.png': dict(eski=True, kolPencere=(195, 272, 100, 240), boy='kisa', torsoOlc=True,
    boyKaynak='Helen\'s Closet Holmes urun sayfasi: "a button-front bodice, and short sleeves"; cizim: agiz bel bandinin ustunde, dirsek ustu',
    etiket='duz', etiketNeden='agiz acik duz kenar (bastirma dikisi kesik cizgi), buzgu/manset yok'),
  '06-a-line-puff-kol-varyant.png': dict(eski=True, kolPencere=(125, 203, 110, 235), boy='kisa', torsoOlc=True,
    boyKaynak='Deer&Doe Eleanor urun sayfasi (Closet Core): view A "The sleeve ends above the elbow with a gentle puff at the shoulder"',
    etiket='duz', etiketNeden='buzgu OMUZDA, agiz acik duz kenar (BOLUM 3 kurali: omuz buzgusu tipi degistirmez)'),
  '02-uzun-robe-dress.png': dict(eski=True, kolPencere=(100, 170, 330, 452), boy='uzun', torsoOlc=True,
    boyKaynak='Folkwear 1940 robe: bilek boyu kol (cizim: agiz bel hizasinin altinda, kol dirsegi gecer)',
    etiket='buzgulu', etiketNeden='alt kolda yatay buzgu (shirring) cizgileri, agiz buzgulu manset gibi toplanmis (tur 9 kolTipi setin etiketi orandan gelmisti, konvansiyonla BUZGULU)'),
  '05-a-line-top-ve-elbise.png': dict(eski=True, kolPencere=(95, 185, 400, 636), boy='uzun', boyKaynak='agiz omuzun 325 px altinda, figur govdesi ~300 px',
    etiket='buzgulu', etiketNeden="Helen's Closet March: agizda manset bandi + buzgu cizgileri (bishop)"),
  '07-uzun-kol-akiskan-etek.png': dict(eski=True, kolPencere=(135, 190, 130, 200), boy='kisa', torsoOlc=True,
    boyKaynak='satici tech flat (birincil; GIRDI/iyi-flat/adaylar/KAYNAKLAR.md satir 25, CDN Crew_Celia_Dress_Tech_Flats_0-20.jpg?v=1761925539, HTTP 200): agiz bel dikisinin ustunde, dirsek ustu; urun sayfasi https://www.deer-and-doe.fr/products/2025-11-this-month (301 -> https://closetcorepatterns.com/products/2025-11-this-month, HTTP 200, "Celia Dress - Crew Pattern") "gently puffed sleeves taper at the hem with an inverted box pleat", boy kelimesi yok (musteri yorumu ikincil, kanit degil). Olcum kolBoyuOverTorso 0.656 kisa kumesinde. F1 karar ajani 4: DOGRULANMADI kalkti (eski slug 404 idi, kaynak satir 25 dogru)',
    etiket='duz', etiketNeden='buzgu omuzda; agizda pili (inverted box pleat), buzgu/lastik/manset cizgisi yok -> agiz duz sayilir'),
  '10-princess-a-line.png': dict(eski=True, kolPencere=(300, 700, 700, 1500), boy='uzun', boyKaynak='agiz omuzun ~1000 px altinda (4375 px goruntu)',
    etiket='buzgulu', etiketNeden='Alice: agizda manset bandi + buzgu cizgileri (bishop)'),
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
    # kolTipi tek kaynaktan (karar ajani 3b): CFG3 etiket/boy varsa oradan turetilir, yoksa (kolsuz/kap) CFG2 tarihce
    if ad in CFG3: kolTipi, kolTipiKaynak = kolTipiEtiketten(CFG3[ad]['etiket'], boyEtiket(CFG3[ad]['boy'])), 'CFG3.etiket x CFG3.boy (kolTipiEtiketten)'
    else: kolTipi, kolTipiKaynak = c['kolTipi'], 'tarihce (BOLUM 2 elle; CFG3\'te kol kaydi yok)'
    k = {'urun': c['urun'], 'boyutPX': [W, H], 'esik': esik, 'kolTipi': kolTipi, 'kolTipiKaynak': kolTipiKaynak, 'cfX': c['cf'], 'not': c['not_']}
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
        acilarHepsi.append((ad, aci, kolTipi))
        if kolTipi in ('setin', 'bishop'): acilarSarkan.append((ad, aci))
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
# KOL TIPI TANIMI — F1 tur 10 (hakem ENGEL 2): etiket ORANDAN CIKMAZ. Agiz etiketi (duz/buzgulu) her kolda CFG3.etiket
#   (cizim konvansiyonu: agizda buzgu/lastik/buzgulu manset cizili mi), boy etiketi CFG3.boy (kisa/uzun/dirsek; urun tanimi
#   ya da cizim, boyKaynak). kolTipi = kolTipiEtiketten(etiket, kisa). balonOran ve kisaOlcu asagida BILGI/bosluk icin olculur.
#   Asagidaki tur 5-9 tanimi tarihce (esik-tureve etiket): tur 10'da yalniz oranlarin OLCUMU kaldi, etiket kismi gecersiz.
# (tarihce) KOL TIPI TANIMI (olculebilir; hakem: 'puf = omuzda buzgu mu, agizda mi?'):
#   balonOran = kolPencere icindeki EN GENIS murekkep satiri (kolun govdesi) / kol agzi PCA uzunlugu.
#   agiz buzgulu/mansetli kol: balonOran >= PUF_ESIK (1.28) — kol govdesi agizdan genis. 1.28 = olculen kumede
#   duz/klos kollarin maksimumu (1.231, 02 robe) ile buzgulu kollarin minimumu (1.334, 03 empire puf) ortasi;
#   DOGRULANMADI: yayin kaynagi yok, veri bosluguna kondu (kume: 13 kol).
#   (tarihce) kol boyu: agiz ortasi omuz ucundan  < KISA_ESIK x torso asagidaysa KISA (0.6 secilmisti). F1 karar ajani 2 (tur 10):
#   kolBoyuOverTorso boslugu bir SINIF degil OLCUM EKSIGIDIR; bosluga dusen deger (dirsek boyu dahil) 'kisa' SAYILMAZ, band secmez,
#   adiyla kirmizi verir (contract kosul._boslukKurali). Dirsek kollar BOLUM 5'te boy='dirsek', kisa=None ile OLCULUR (CFG5).
#   F1 tur 9 (hakem ENGEL 2): 'kisa' olcusu DIKEY mesafe degil, KOL EKSENI BOYUNCA kol boyu (omuz ucu -> agiz ortasi,
#   hypot(dx, dy)) / torso. Dikey = kolBoyu x sin(kolAcisi) idi: kosul, sececegi bandin acisina bagliydi (dongusel) ve F2 grafi
#   kol boyunu bilir, dikeyi bilmez. kisaOlcu = kolBoyu/torso (HUKUM), kisaOlcuDikey = eski dikey deger (BILGI).
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
                   'kolTipi': 'F1 tur 10: etiket (agiz duz/buzgulu, cizim konvansiyonu, CFG3.etiket) + boy (kisa/uzun/dirsek, urun tanimi/cizim, CFG3.boy) -> buzgulu+kisa = puf (banda girmez), buzgulu+uzun = bishop, duz = setin. balonOran BILGI, etiket vermez',
                   'kisa': 'F1 tur 10: boy etiketi CFG3.boy (urun tanimi / cizim, boyKaynak), esikten bagimsiz; kolBoyuOverTorso (omuz ucu -> agiz ortasi, kol EKSENI boyunca, hypot) / torso yalniz torsoOlc kollarda olculur ve YALNIZ bosluk hesabina girer; kisaOlcuDikey eski dikey deger bilgi'},
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
        if c.get('torsoOlc'):
            kb = math.hypot(eski['kolUcu']['orta'][0] - eski['omuzUcu']['snapPX'][0], dy)
            k['kisaOlcu'] = round(kb / eski['torsoPX'], 3); k['kisaOlcuDikey'] = round(dy / eski['torsoPX'], 3)
        k['boy'] = c['boy']; k['boyKaynak'] = c['boyKaynak']; k['kisa'] = boyEtiket(c['boy'])
        k['etiket'] = c['etiket']; k['etiketNeden'] = c['etiketNeden']; k['kolTipi'] = kolTipiEtiketten(k['etiket'], k['kisa'])
        k['kolAcisiDeg'] = eski['kolAcisiDeg']['deger']   # kolTipiEski kalkti: BOLUM 2 artik ayni turetimi kullanir (karar ajani 3b)
        f3['flatler'][ad] = k
        continue
    yol = indir(c['url'], ad)
    im = Image.open(yol).convert('L'); px, (W, H) = im.load(), im.size
    esik, r = c['esik'], c['snap']
    k = {'urun': c['urun'], 'sayfa': c['sayfa'], 'gorselURL': c['url'], 'boyutPX': [W, H], 'esik': esik, 'cfX': c['cf'], 'not': c['not_']}
    if 'sayfaYonlenme' in c: k['sayfaYonlenme'] = c['sayfaYonlenme']
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
        if c.get('torsoOlc') and 'torsoPX' in k:
            k['kisaOlcu'] = round(math.hypot(dx, dy) / k['torsoPX'], 3); k['kisaOlcuDikey'] = round(dy / k['torsoPX'], 3)
        k['boy'] = c['boy']; k['boyKaynak'] = c.get('boyKaynak'); k['kisa'] = boyEtiket(c['boy'])
        k['etiket'] = c['etiket']; k['etiketNeden'] = c['etiketNeden']; k['kolTipi'] = kolTipiEtiketten(k['etiket'], k['kisa'])
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

# ---------------------------------------------------------------- BOLUM 5 (F1 tur 8, 2026-09-05; karar ajani 3: kosulluBant esiklerine IKINCI KAYNAK)
# Soru: kosulluBant.kosul esikleri (agizBuzguOranMin 1.28, agizOmuzDikeyOverTorsoMax 0.6) 13 kolluk kumeden, DOGRULANMADI.
# Karar: F2'ye gecmeden mevcut kumede OLMAYAN marka ailelerinden (By Hand London, Tilly and the Buttons, Named Clothing)
# >= 5 agzi buzgulu/mansetli ve >= 5 duz/klos kol AYNI yontemle olculur; birlesik kumede iki sinif arasinda bosluk
# KALIYORSA esik boslugun ortasindan yeniden kesilir, KAPANIYORSA skaler esik yanlis ayiricidir (esik gevsetilmez).
# ETIKET (sinifin ne oldugu) OLCUMDEN BAGIMSIZ, cizimin kendi konvansiyonundan okunur: agizda buzgu cizgileri / lastik /
# buzgulu manset varsa 'buzgulu'; agiz acik kenar ya da duz (govdeden dar olmayan) manset ise 'duz'. balonOran bu etiketi
# BILMEDEN olculur; sonra iki sinifin balonOran dagilimi karsilastirilir.
# IKI GENISLIK OLCUSU (ikisi de kayitta):
#   balonOranYatay = BOLUM 3 tanimi: kolPencere icindeki EN GENIS YATAY murekkep satiri / agiz PCA uzunlugu.
#   balonOranDik   = kol EKSENINE DIK en genis kesit / agiz PCA uzunlugu. Eksen = omuz ucu -> agiz ortasi. Yatay satir
#                    yalniz sarkan (eksen ~dusey) kolda kol genisligidir; dusuk omuzlu 3/4 kol (Stevie, 26 derece) ya da
#                    yana acilan kisa puf (Lucy, ~yatay) kolda yatay satir kolun BOYUNU olcer (Stevie yatay 3.07 vs dik ~1).
#                    F2 grafta panel genisligi zaten eksene diktir; hukum balonOranDik'e baglanir, yatay kayit kalir.
#                    Eski 13 kol da ayni dik yontemle YENIDEN olculur (kendi pencereleriyle) ki birlesik kume tek olcuyle kiyaslansin.
#   agizOmuzDikeyOverTorso = (agiz ortasi.y - omuz ucu.y) / (bel.y - SNP.y); torso yoksa boy elle + boyKaynak (BOLUM 3 gibi).
#   F1 tur 9 (hakem ENGEL 2): HUKUM olcusu kolBoyuOverTorso = hypot(dx, dy) / torso (kol ekseni boyunca kol boyu); dikey
#                    deger BILGI olarak kalir (dikey = kolBoyu x sin(aci): banda bagli, dongusel). 'kisa' bununla karar verilir.
#   F1 tur 9 (hakem ENGEL 1): kisa alt kume boslugu ELLE degil BURADA hesaplanir (kisaAltKume): yalniz kisa == True kollar
#                    (olculen kolBoyuOverTorso < KISA_ESIK ya da boyKaynak ile acikca kisa); kisa None (dirsek boyu, torso yok:
#                    Mabel) 'olculmedi' listesine ADIYLA girer, sinifa sayilmaz. Contract esigi bu alandan kopyalanir.
#   Duz mansetli kolda (Coco turn-back, Ilta/Frida gomlek manseti) agiz = mansetin ALT kenari, kolPencere manseti DISLAR.
# Omuz ucu: 'omuzKutu' penceresinde EN UST murekkep (kol kepinin tepesi = omuz dikisi noktasi; BOLUM 2 SNP yontemiyle ayni).
# Pencereler ORIJINAL piksel, 50/20 px grid ustunde gozle okundu; her olcum icin kontrol overlay'i
# KOSU/ciktilar/_yerel/yeni-flat/overlay-<ad>.png'ye yazilir (telif: commit edilmez). Dosyalar ayni klasore indirilir.
# Raglan (Loren) ve dusuk omuz (Stevie, Ilta, Frida) kollarda 'omuz ucu' = kol ust konturunun tepesi (raglan) ya da dusuk
# omuz dikisinin ust ucu; aci set-in ile bire bir kiyaslanmaz, kayitta 'omuzNot' durur.
# OLCULMEDI: BHL Anna (kimono: kol/govde tek parca, kol genisligi tanimsiz), BHL Zeena (flat degil illustrasyon),
#   Tilly Lyra kisa kol ve Frida kisa kol (pencere okunamadi, duz sinif zaten n >= 5), Mabel elbise (Mabel bluzla ayni kol).
def _tilly(u, sayfa, urun): return dict(url=u, sayfa=sayfa, urun=urun, marka='Tilly and the Buttons', esik=200)
MARNIE_U = 'https://cdn.shopify.com/s/files/1/0364/2693/products/Tilly_and_the_Buttons_Marnie_sewing_pattern_tech.png?v=1660047282'
MABEL_U = 'https://cdn.shopify.com/s/files/1/0364/2693/products/Tilly_and_Buttons_Mabel_Dress_Blouse_sewing_pattern_tech.jpg?v=1679905178'
NELL_U = 'https://cdn.shopify.com/s/files/1/0364/2693/files/Nell-sewing-pattern-technical-drawing.jpg?v=1756997194'
LYRA_U = 'https://cdn.shopify.com/s/files/1/0364/2693/products/Lyra6-34techimage.png?v=1658821438'
STEVIE_U = 'https://cdn.shopify.com/s/files/1/0364/2693/products/Tilly_and_the_Buttons_Stevie_add-on_Sewing_Pattern_tech.jpg?v=1665478696'
COCO_U = 'https://cdn.shopify.com/s/files/1/0364/2693/products/Cocotechnicalgarmentillustrations2020.jpg?v=1652170339'
AGNES_U = 'https://cdn.shopify.com/s/files/1/0364/2693/products/Tilly_and_the_Buttons_Agnes_sewing_pattern_tech_drawings.png?v=1675096946'
FRIDA_U = 'https://cdn.shopify.com/s/files/1/0364/2693/files/frida-shirt-sewing-pattern-tilly-and-the-buttons-tech-drawing.png?v=1772114163'
CFG5 = {
  # ---------------- DIRSEK boyu (F1 karar ajani 2, tur 10 uygulama): satici cumlesi 'elbow-length', SNP + bel cizili, boy='dirsek', kisa=None ----------------
  # Hedef >= 3 buzgulu + >= 3 duz. Bulunan: 1 duz (Duxbury). Aranip ELENENLER (5 Eyl 2026): Rivermont 'short, elbow, or long' ama cizimde tek kol (hangi boy
  # belirsiz); Sew Over It Cassie 'just above the elbow' (buzgulu) — sitede teknik cizim yok, yalniz foto; Seamwork Sloan/Pomme puf (boy kelimesi yok / cizim yok);
  # Megan Nielsen Sudley A 'above elbow sleeves' bluz (bel yok); Tilly Mabel ELBOW LENGTH (off-shoulder, SNP yok, asagida); Tilly Etta 'three-quarter';
  # Cashmerette Roseclair 3/4 buzgulu manset (dirsek kelimesi yok); Sew Liberated Ember '3/4' (lastik dirsek USTUNDE, dirsek boyu degil); Deer&Doe Eleanor 'above the elbow' (kisa, CFG3).
  'cash-duxbury.jpg': dict(url='https://www.cashmerette.com/cdn/shop/files/Cashmerette-1302-Duxbury-tech-ill-4x5-gray.jpg?v=1779195202',
    sayfa='https://www.cashmerette.com/products/duxbury-dress-pdf-pattern', urun='Cashmerette Duxbury Dress (dirsek boyu set-in kol, derin bask; alt sol on gorunum)', marka='Cashmerette',
    etiket='duz', etiketNeden='agiz acik duz kenar, kesik cizgi = derin bask dikisi (satici: deep hem), buzgu/lastik/manset yok', esik=160,
    omuzKutu=(548, 568, 1615, 1640), kolUcu=(405, 545, 1868, 1930), kolPencere=(400, 560, 1620, 1930), boy='dirsek', torsoOlc=True,
    boyKaynak='urun sayfasi: "Sleeveless bound armholes, elbow-length sleeves with deep hem" (curl 2026-09-05 HTTP 200); cizim: agiz bel dikisinin (y~2040) ~120 px ustunde',
    snp=(630, 670, 1585, 1610), bel=dict(tip='yatayCizgi', pencere=(600, 800, 2030, 2048)), belNot='bel dikisi (bodice/etek): pencerede en cok murekkepli satir'),
  # ---------------- agzi buzgulu / lastikli / buzgulu mansetli ----------------
  'bhl-alix-1.jpg': dict(url='https://cdn.shopify.com/s/files/1/0289/4249/products/tech_illos2-01.jpg?v=1477044717',
    sayfa='https://byhandlondon.com/products/alix-dress-pdf-sewing-pattern', urun='By Hand London Alix Dress (bishop kol, lastikli manset)', marka='By Hand London',
    etiket='buzgulu', etiketNeden='agizda lastik + buzgu cizgileri, altinda kucuk firfir', esik=160,
    omuzKutu=(135, 165, 8, 30), omuzNot='raglan (satici: "raglan sleeves"): omuz ucu yok; kol ust konturunun tepesi (F1 karar ajani 3c: not eksikti, eklendi)', kolUcu=(22, 74, 250, 270), kolPencere=(12, 150, 110, 240), boy='uzun', torsoOlc=True,
    boyKaynak='urun sayfasi: "long, billowing raglan sleeves secured at the wrist with a delicate elasticated cuff" (bitmis kol boyu 61-64.5 cm)',
    snp=(150, 240, 10, 25), bel=dict(tip='yatayCizgi', pencere=(165, 265, 183, 192)), belNot='bel bandi cizgisi (yatayCizgi: bandin ust ya da alt cizgisi, +-7 px)'),
  'bhl-marie-dress.jpg': dict(url='https://cdn.shopify.com/s/files/1/0289/4249/products/Technicalillustrations_Dress_B.jpg?v=1639823609',
    sayfa='https://byhandlondon.com/products/marie-shirt-dress-pdf-sewing-pattern-uk-2-38', urun='By Hand London Marie Dress B (bishop kol, buzgulu manset + firfir)', marka='By Hand London',
    etiket='buzgulu', etiketNeden='agizda buzgu cizgileri, manset bandi, firfir', esik=120,
    omuzKutu=(300, 370, 200, 240), kolUcu=(135, 275, 1030, 1075), kolPencere=(90, 340, 230, 1030), boy='uzun', boyKaynak='bilek boyu bishop: agiz omuzun ~830 px altinda, elbise etek ucu 1750; bel dikisi yok',
    agizNot='manset bandi dikdortgeni PCA: ana eksen bandin uzun kenari; band yuksekligi 35 px oldugundan uzunluk en cok %6 fazla okunur'),
  'bhl-loren-1.png': dict(url='https://cdn.shopify.com/s/files/1/0289/4249/products/Technicalillustrations-01.png?v=1621505173',
    sayfa='https://byhandlondon.com/products/loren-blouse-dress-pdf-sewing-pattern', urun='By Hand London Loren Dress (raglan kol, buzgulu manset + firfir)', marka='By Hand London',
    etiket='buzgulu', etiketNeden='agizda buzgulu lastik bandi + firfir', esik=120,
    omuzKutu=(520, 660, 170, 210), omuzNot='raglan: omuz ucu yok; kol ust konturunun tepesi', kolUcu=(105, 250, 735, 825), kolPencere=(100, 470, 450, 720), boy='uzun', boyKaynak='bilek boyu: agiz omuzun ~600 px altinda; bel dikisi yok'),
  'bhl-lucy-puff.jpg': dict(url='https://cdn.shopify.com/s/files/1/0289/4249/files/Technicalillustrations_puffsleeve_colour.jpg?v=1689767047',
    sayfa='https://byhandlondon.com/products/bhl-draft-it-yourself-lucy-dress', urun='By Hand London Lucy Dress (kisa puf kol, lastikli agiz + firfir; kol yana ~yatay acilir)', marka='By Hand London',
    etiket='buzgulu', etiketNeden='agizda lastik + firfir, kep buzgulu', esik=130,
    omuzKutu=(255, 275, 95, 130), kolUcu=(150, 170, 140, 200), kolPencere=(150, 248, 95, 225), boy='kisa', boyKaynak='kisa puf: agiz omuz hizasinda yana acilir, empire dikis 265, figur bel yok'),
  'tilly-marnie.png': dict(**_tilly(MARNIE_U, 'https://tillyandthebuttons.com/products/marnie-blouse-dress-sewing-pattern', 'Tilly and the Buttons Marnie Blouse (bishop kol, lastikli agiz)'),
    etiket='buzgulu', etiketNeden='agizda lastik + buzgu cizgileri',
    omuzKutu=(225, 260, 335, 360), kolUcu=(38, 140, 636, 700), kolPencere=(35, 225, 450, 640), boy='uzun', boyKaynak='bilek boyu: agiz omuzun ~330 px altinda, bluz etegi 800; bel dikisi yok'),
  'tilly-mabel.jpg#bluz': dict(dosya='tilly-mabel.jpg', **_tilly(MABEL_U, 'https://tillyandthebuttons.com/products/mabel-dress-blouse-sewing-pattern', 'Tilly and the Buttons Mabel Blouse (dirsek boyu puf kol, buzgulu (shirred) manset)'),
    etiket='buzgulu', etiketNeden='agizda shirring bandi + firfir',
    omuzKutu=(255, 300, 85, 105), omuzNot='omuz acik (off-shoulder): kol kepinin tepesi', kolUcu=(160, 225, 296, 352), kolPencere=(175, 318, 130, 295), boy='dirsek', boyKaynak='urun adi ELBOW LENGTH; agiz ~y 325, shirred bel bandi 405-445; SNP cizili degil (off-shoulder), torso olculemez'),
  'tilly-nell.jpg#puf': dict(dosya='tilly-nell.jpg', **_tilly(NELL_U, 'https://tillyandthebuttons.com/products/nell-blouse-dress-sewing-pattern', 'Tilly and the Buttons Nell Blouse (puffball kisa kol: agiz icine katlanmis, govdeden dar)'),
    etiket='buzgulu', etiketNeden='puffball: agiz govdeden dar, buzgu cizgileri agizda',
    omuzKutu=(280, 340, 280, 310), kolUcu=(262, 312, 486, 520), kolPencere=(200, 340, 300, 490), boy='kisa', boyKaynak='kisa: agiz omuzun ~230 px altinda, bluz etegi 740'),
  'tilly-lyra.png#uzun': dict(dosya='tilly-lyra.png', **_tilly(LYRA_U, 'https://tillyandthebuttons.com/products/lyra-dress-sewing-pattern', 'Tilly and the Buttons Lyra Dress (uzun kol, lastikli agiz)'),
    etiket='buzgulu', etiketNeden='agizda lastik + buzgu, kucuk firfir',
    omuzKutu=(295, 330, 105, 125), kolUcu=(150, 240, 530, 590), kolPencere=(170, 312, 280, 470), boy='uzun', boyKaynak='bilek boyu: agiz omuzun ~470 px altinda, yaka altindaki buzgulu dikis 390'),
  # ---------------- duz / klos (agiz acik ya da duz manset) ----------------
  'tilly-stevie-addon.jpg#tunik': dict(dosya='tilly-stevie-addon.jpg', **_tilly(STEVIE_U, 'https://tillyandthebuttons.com/products/stevie-add-on-sewing-pattern', 'Tilly and the Buttons Stevie Add-On tunik (dusuk omuz, 3/4 duz kol)'),
    etiket='duz', etiketNeden='agiz acik duz kenar',
    omuzKutu=(175, 200, 805, 830), omuzNot='dusuk omuz: kol dikisinin ust ucu', kolUcu=(8, 30, 862, 920), kolPencere=(8, 150, 800, 920), boy='uzun', boyKaynak='THREE-QUARTER LENGTH: agiz dirsegin altinda'),
  'tilly-coco.jpg#v1': dict(dosya='tilly-coco.jpg', **_tilly(COCO_U, 'https://tillyandthebuttons.com/products/coco-top-dress-sewing-pattern', 'Tilly and the Buttons Coco Top v1 (3/4 duz oturan kol)'),
    etiket='duz', etiketNeden='agiz acik duz kenar',
    omuzKutu=(260, 300, 70, 100), kolUcu=(128, 212, 608, 640), kolPencere=(135, 270, 380, 580), boy='uzun', boyKaynak='3/4 kol: agiz (y~605) etek ucuna (700) yakin, dirsegin altinda'),
  'tilly-agnes.png#kisa': dict(dosya='tilly-agnes.png', **_tilly(AGNES_U, 'https://tillyandthebuttons.com/products/agnes-jersey-top-sewing-pattern', 'Tilly and the Buttons Agnes (straight cropped sleeve)'),
    etiket='duz', etiketNeden='agiz acik duz kenar',
    omuzKutu=(150, 200, 232, 262), kolUcu=(75, 175, 522, 552), kolPencere=(0, 195, 300, 535), boy='kisa', boyKaynak='CROPPED SLEEVE: agiz dirsegin ustunde (etek ucu 750, agiz 550)'),
  'tilly-agnes.png#buzgulu-omuz': dict(dosya='tilly-agnes.png', **_tilly(AGNES_U, 'https://tillyandthebuttons.com/products/agnes-jersey-top-sewing-pattern', 'Tilly and the Buttons Agnes (ruched cropped sleeve: OMUZDA buzgu, agiz acik)'),
    etiket='duz', etiketNeden='buzgu omuzda, agiz acik duz kenar (BOLUM 3 kurali: omuz buzgusu tipi degistirmez)',
    omuzKutu=(890, 960, 205, 230), kolUcu=(858, 962, 514, 540), kolPencere=(855, 970, 240, 500), boy='kisa', boyKaynak='CROPPED SLEEVE: agiz dirsegin ustunde'),
  'tilly-agnes.png#uzun': dict(dosya='tilly-agnes.png', **_tilly(AGNES_U, 'https://tillyandthebuttons.com/products/agnes-jersey-top-sewing-pattern', 'Tilly and the Buttons Agnes (straight long sleeve)'),
    etiket='duz', etiketNeden='agiz acik duz kenar',
    omuzKutu=(150, 200, 1065, 1100), kolUcu=(44, 135, 1610, 1634), kolPencere=(40, 180, 1300, 1400), boy='uzun', boyKaynak='LONG SLEEVE'),
  'tilly-nell.jpg#kisa-duz': dict(dosya='tilly-nell.jpg', **_tilly(NELL_U, 'https://tillyandthebuttons.com/products/nell-blouse-dress-sewing-pattern', 'Tilly and the Buttons Nell Midi Dress (short straight sleeves)'),
    etiket='duz', etiketNeden='agiz acik duz kenar',
    omuzKutu=(600, 665, 1095, 1125), kolUcu=(560, 650, 1214, 1250), kolPencere=(560, 672, 1105, 1215), boy='kisa', torsoOlc=True,
    boyKaynak='urun sayfasi: "Four sleeve options: short and straight, bracelet-length, flutter, or lined puffball" -> short and straight',
    snp=(700, 745, 1085, 1100), bel=dict(tip='yatayCizgi', pencere=(640, 760, 1325, 1345)), belNot='bel dikisi (etek buzgusunun ustu)'),
  'tilly-nell.jpg#bilezik': dict(dosya='tilly-nell.jpg', **_tilly(NELL_U, 'https://tillyandthebuttons.com/products/nell-blouse-dress-sewing-pattern', 'Tilly and the Buttons Nell Knee-length Dress (bracelet sleeves)'),
    etiket='duz', etiketNeden='agiz acik duz kenar',
    omuzKutu=(170, 215, 1095, 1115), kolUcu=(45, 120, 1434, 1462), kolPencere=(40, 170, 1150, 1330), boy='uzun', torsoOlc=True,
    boyKaynak='urun sayfasi: "Four sleeve options: short and straight, bracelet-length, flutter, or lined puffball" -> bracelet-length (bilek ustu, dirsegin altinda)',
    snp=(240, 280, 1085, 1102), bel=dict(tip='yatayCizgi', pencere=(150, 320, 1325, 1345)), belNot='bel dikisi (etek buzgusunun ustu)'),
  'named-ilta.png': dict(url='https://cdn.shopify.com/s/files/1/0414/6003/9840/files/api.ILTAdress_linedrawing.png?v=1763639851',
    sayfa='https://www.namedclothing.com/en-us/products/ilta-ruched-shirt-dress', urun='Named Clothing Ilta Ruched Shirt Dress (dusuk omuz uzun kol, yirtmacli DUZ gomlek manseti)', marka='Named Clothing',
    etiket='duz', etiketNeden='gomlek manseti: kapali dikdortgen kontur, agizda buzgu cizgisi yok', esik=160,
    omuzKutu=(135, 165, 40, 65), omuzNot='dusuk omuz: kol dikisinin ust ucu', kolUcu=(0, 70, 350, 376), kolPencere=(5, 165, 60, 300), boy='uzun', boyKaynak='bilek boyu, manset alt kenari y~350, bel kusagi 230-260'),
  'tilly-frida.png#uzun': dict(dosya='tilly-frida.png', **_tilly(FRIDA_U, 'https://tillyandthebuttons.com/products/frida-shirt-sewing-pattern', 'Tilly and the Buttons Frida Shirt (uzun kol, DUZ gomlek manseti)'),
    etiket='duz', etiketNeden='gomlek manseti: kapali dikdortgen kontur, agizda buzgu cizgisi yok',
    omuzKutu=(170, 200, 385, 410), omuzNot='dusuk omuz: kol dikisinin ust ucu', kolUcu=(48, 130, 822, 856), kolPencere=(40, 245, 450, 600), boy='uzun', boyKaynak='LONG SLEEVES, manset alt kenari y~860, gomlek etegi 720 (manset etegin altinda)'),
}
OLCULMEDI5 = {'bhl-anna-1.jpg': 'kimono kol: kol ile govde tek parca, kol govdesinin en genis kesiti tanimsiz (BHL Anna Dress, https://cdn.shopify.com/s/files/1/0289/4249/products/Anna_Tech_1.jpg)',
              'bhl-zeena-short.jpg': 'teknik flat degil, figurlu illustrasyon (BHL Zeena)',
              'tilly-lyra.png#kisa': 'kisa duz kol penceresi 50 px gridde guvenle okunamadi; duz sinif n >= 5 zaten sagli',
              'tilly-frida.png#kisa': 'ayni', 'tilly-mabel.jpg#elbise': 'Mabel bluzla ayni kol cizimi (uzun hali), ikinci kez sayilmadi',
              'tilly-coco.jpg#v2': 'turn-back mansetli 3/4 kol: manset bolgesi 50 px gridde guvenle okunamadi (kol x 830-950, y 60-390 olculdu ama manset penceresi yok); duz sinif n >= 5 zaten sagli'}

def kolGenislikDik(pts, omuz, agizOrta):
    # kol eksenine (omuz ucu -> agiz ortasi) DIK en genis kesit: noktalar eksene izdusurulur (s), dik uzaklik (t);
    # s 1 px'lik kutulara bolunur, kutudaki t araligi (max - min) kesit genisligidir; en genis kutu doner.
    ux, uy = agizOrta[0] - omuz[0], agizOrta[1] - omuz[1]; L = math.hypot(ux, uy); ux, uy = ux / L, uy / L
    nx, ny = -uy, ux; kutu = {}
    for (x, y) in pts:
        s = int(round((x - omuz[0]) * ux + (y - omuz[1]) * uy)); t = (x - omuz[0]) * nx + (y - omuz[1]) * ny
        lo, hi = kutu.get(s, (t, t)); kutu[s] = (min(lo, t), max(hi, t))
    best = max(kutu.items(), key=lambda kv: kv[1][1] - kv[1][0])
    s, (lo, hi) = best
    p = lambda t: (round(omuz[0] + s * ux + t * nx, 1), round(omuz[1] + s * uy + t * ny, 1))
    return {'genislikPX': round(hi - lo, 1), 'eksenS': s, 'uclar': [p(lo), p(hi)], 'eksenAciDeg': round(math.degrees(math.atan2(uy, abs(ux))), 1)}

def overlay5(yol, ad, c, k, om, agiz, bal, dik):
    from PIL import ImageDraw
    im = Image.open(yol).convert('RGB'); d = ImageDraw.Draw(im)
    for key, col in (('kolUcu', (255, 0, 0)), ('kolPencere', (0, 128, 255)), ('snp', (0, 160, 0)), ('omuzKutu', (0, 160, 0))):
        if key in c: x0, x1, y0, y1 = c[key]; d.rectangle([x0, y0, x1, y1], outline=col, width=2)
    if 'bel' in c: x0, x1, y0, y1 = c['bel']['pencere']; d.rectangle([x0, y0, x1, y1], outline=(160, 0, 160), width=2)
    if bal: d.line([(bal[2], bal[0]), (bal[3], bal[0])], fill=(0, 128, 255), width=2)
    if dik: d.line([tuple(dik['uclar'][0]), tuple(dik['uclar'][1])], fill=(255, 140, 0), width=3)
    if agiz: d.line([tuple(agiz[0]), tuple(agiz[1])], fill=(255, 0, 0), width=3)
    if om:
        sx, sy = om; d.ellipse([sx - 5, sy - 5, sx + 5, sy + 5], outline=(0, 160, 0), width=3)
        if agiz: mid = ((agiz[0][0] + agiz[1][0]) / 2, (agiz[0][1] + agiz[1][1]) / 2); d.line([(sx, sy), mid], fill=(0, 160, 0), width=2)
    if 'belY' in k: d.line([(0, k['belY']), (im.size[0], k['belY'])], fill=(160, 0, 160), width=1)
    if 'snpY' in k: d.line([(0, k['snpY']), (im.size[0], k['snpY'])], fill=(0, 160, 0), width=1)
    boxes = [c['kolUcu'], c['kolPencere'], c['omuzKutu']] + ([c['snp']] if 'snp' in c else []) + ([c['bel']['pencere']] if 'bel' in c else [])
    m = 30; box = (max(0, min(b[0] for b in boxes) - m), max(0, min(b[2] for b in boxes) - m), min(im.size[0], max(b[1] for b in boxes) + m), min(im.size[1], max(b[3] for b in boxes) + m))
    cr = im.crop(box); W, H = cr.size
    if W < 600: cr = cr.resize((600, int(H * 600 / W)))
    govde, _, ek = ad.partition('#'); out = os.path.join(YEREL, 'overlay-' + govde.rsplit('.', 1)[0] + ('_' + ek if ek else '') + '.png'); cr.save(out); return out

f5 = {'_ne': 'F1 tur 8 (karar ajani 3): kosulluBant esiklerine ikinci kaynak. 3 yeni marka ailesi (By Hand London, Tilly and the Buttons, Named Clothing), '
             '8 agzi buzgulu + 9 duz/klos kol; etiket cizim konvansiyonundan (agizda buzgu/lastik/buzgulu manset var mi), balonOran etiketi bilmeden olculur. '
             'F1 tur 10: boy etiketi (kisa/uzun/dirsek) de urun taniminden elle (boyKaynak), kolBoyuOverTorso yalniz bosluk hesabinda. '
             'Yontem BOLUM 3 (agiz PCA / omuz) + eksene DIK kesit (kolGenislikDik; gerekce dosya basliginda). Dosyalar ve overlay kontrol gorselleri KOSU/ciktilar/_yerel/yeni-flat/ (telif; commit edilmez).',
      'olculmedi': OLCULMEDI5, 'flatler': {}}
for ad, c in CFG5.items():
    dosya = c.get('dosya', ad); yol = indir(c['url'], dosya)
    im = Image.open(yol).convert('L'); px, (W, H) = im.load(), im.size
    esik = c['esik']
    k = {'dosya': dosya, 'urun': c['urun'], 'marka': c['marka'], 'sayfa': c['sayfa'], 'gorselURL': c['url'], 'boyutPX': [W, H], 'esik': esik,
         'etiket': c['etiket'], 'etiketNeden': c['etiketNeden']}
    opts = inkPts(px, W, H, *c['omuzKutu'], esik)
    if not opts:
        print('UYARI', ad, 'omuz kutusunda murekkep yok', c['omuzKutu']); k['omuzUcu'] = {'BULUNAMADI': list(c['omuzKutu'])}; f5['flatler'][ad] = k; continue
    om = min(opts, key=lambda p: (p[1], p[0]))
    k['omuzUcu'] = {'yontem': 'omuzKutu penceresinde en ust murekkep (kol kepi tepesi)', 'pencere': list(c['omuzKutu']), 'xy': list(om)}
    if 'omuzNot' in c: k['omuzUcu']['not'] = c['omuzNot']
    pts = inkPts(px, W, H, *c['kolUcu'], esik)
    if len(pts) < 4:
        print('UYARI', ad, 'kol agzi penceresinde murekkep yok', c['kolUcu']); k['kolUcu'] = {'BULUNAMADI': list(c['kolUcu'])}; f5['flatler'][ad] = k; continue
    a, b2, mid = pca_uclar(pts)
    sx, sy = om; dx, dy = mid[0] - sx, mid[1] - sy
    k['kolUcu'] = {'yontem': 'kol agzi penceresi PCA ana ekseni uclari, ortasi', 'pencere': list(c['kolUcu']), 'uclar': [list(a), list(b2)], 'orta': [round(mid[0], 1), round(mid[1], 1)], 'nMurekkep': len(pts)}
    if 'agizNot' in c: k['kolUcu']['not'] = c['agizNot']
    k['kolAcisiDeg'] = {'deger': round(math.degrees(math.atan2(dy, abs(dx))), 1), 'tanim': 'omuz ucu -> kol ucu ortasi, yatayin ALTINA derece', 'dxdy': [round(dx, 1), round(dy, 1)]}
    agizW = math.hypot(b2[0] - a[0], b2[1] - a[1]); k['agizPX'] = round(agizW, 1); k['kolPencere'] = list(c['kolPencere'])
    bal = kolBalon(px, W, H, *c['kolPencere'], esik)
    k['enGenisYataySatir'] = {'y': bal[0], 'genislikPX': bal[1], 'x': [bal[2], bal[3]]}; k['balonOranYatay'] = round(bal[1] / agizW, 3)
    gpts = inkPts(px, W, H, *c['kolPencere'], esik); dik = kolGenislikDik(gpts, om, mid)
    k['enGenisDikKesit'] = dik; k['balonOranDik'] = round(dik['genislikPX'] / agizW, 3)
    if c.get('torsoOlc'):
        spts = inkPts(px, W, H, *c['snp'], esik); top = min(spts, key=lambda p: (p[1], p[0]))
        k['snp'] = {'yontem': 'pencerede en ust murekkep', 'pencere': list(c['snp']), 'xy': list(top)}; k['snpY'] = top[1]
        y, n = yatayCizgiSatiri(px, W, *c['bel']['pencere'], esik)
        k['bel'] = {'yontem': 'bel dikisi: pencerede en cok murekkepli satir', 'pencere': list(c['bel']['pencere']), 'satirY': y, 'nMurekkep': n, 'not': c.get('belNot')}; k['belY'] = y
        k['torsoPX'] = y - top[1]
        k['agizOmuzDikeyOverTorso'] = round(dy / k['torsoPX'], 3)   # BILGI: eski tanim (dikey), hukum tasimaz (F1 tur 9)
        k['kolBoyuOverTorso'] = round(math.hypot(dx, dy) / k['torsoPX'], 3)   # YALNIZ bosluk hesabi icin; etiket vermez (F1 tur 10)
    k['boy'] = c['boy']; k['boyKaynak'] = c['boyKaynak']; k['kisa'] = boyEtiket(c['boy'])
    k['overlay'] = os.path.relpath(overlay5(yol, ad, c, k, om, [list(a), list(b2)], bal, dik), os.path.join(HERE, '..'))
    f5['flatler'][ad] = k

# --- eski 13 kolun DIK yeniden olcumu (kendi pencereleri, kendi omuz/agiz noktalari; goruntu ayni) ---
eskiDik = {}
for ad, k3 in f3['flatler'].items():
    if k3.get('balonOran') is None or 'kolPencere' not in k3: continue
    if k3.get('eskiKayit'):
        yol = os.path.join(BASE, ad); esik = CFG2[ad]['esik']; k2 = f1['flatler'][ad]; om = k2['omuzUcu']['snapPX']; mid = k2['kolUcu']['orta']; agizW = k3['agizPX']
    else:
        yol = os.path.join(YEREL, ad); esik = k3['esik']; om = k3['omuzUcu']['snapPX']; mid = k3['kolUcu']['orta']; agizW = k3['agizPX']
    im = Image.open(yol).convert('L'); px, (W, H) = im.load(), im.size
    dik = kolGenislikDik(inkPts(px, W, H, *k3['kolPencere'], esik), om, mid)
    eskiDik[ad] = {'enGenisDikKesit': dik, 'balonOranDik': round(dik['genislikPX'] / agizW, 3), 'balonOranYatay': k3['balonOran']}
f5['eskiKumeDik'] = {'_ne': 'BOLUM 3 kollari eksene dik kesitle yeniden olculdu (pencereler/omuz/agiz BOLUM 3 kaydindan, degismedi)', 'flatler': eskiDik}

# --- birlesik kume: eski 13 (etiket CFG3.etiket: cizim konvansiyonu, F1 tur 10; kolTipi'nden/orandan DEGIL) + yeni ---
eskiKume = {ad: {'balonOranDik': eskiDik[ad]['balonOranDik'], 'balonOranYatay': k['balonOran'], 'etiket': k['etiket'], 'etiketNeden': k['etiketNeden'],
                 'kisaOlcu': k.get('kisaOlcu'), 'kisaOlcuDikey': k.get('kisaOlcuDikey'), 'kisa': k.get('kisa'), 'boyKaynak': k.get('boyKaynak'),
                 'kolAcisiDeg': (k['kolAcisiDeg']['deger'] if isinstance(k['kolAcisiDeg'], dict) else k['kolAcisiDeg'])}
           for ad, k in f3['flatler'].items() if ad in eskiDik}
yeniKume = {ad: {'balonOranDik': k['balonOranDik'], 'balonOranYatay': k['balonOranYatay'], 'etiket': k['etiket'], 'kisaOlcu': k.get('kolBoyuOverTorso'), 'kisaOlcuDikey': k.get('agizOmuzDikeyOverTorso'),
                 'kisa': k.get('kisa'), 'boyKaynak': k.get('boyKaynak'), 'kolAcisiDeg': k['kolAcisiDeg']['deger'], 'marka': k['marka']}
            for ad, k in f5['flatler'].items() if k.get('balonOranDik') is not None}
def sinifOzet(kume, etiket, alan):
    v = sorted((k[alan], ad) for ad, k in kume.items() if k['etiket'] == etiket)
    return {'n': len(v), 'degerler': {ad: b for b, ad in v}, 'min': (v[0][0] if v else None), 'max': (v[-1][0] if v else None)}
def boslukHukmu(kume, alan):
    duz, buz = sinifOzet(kume, 'duz', alan), sinifOzet(kume, 'buzgulu', alan)
    if duz['n'] and buz['n'] and duz['max'] < buz['min']:
        return {'alan': alan, 'duz': duz, 'buzgulu': buz, 'bosluk': [duz['max'], buz['min']], 'ortaNokta': round((duz['max'] + buz['min']) / 2, 4), 'hukum': 'BOSLUK KALDI: skaler esik ayirici; yeni esik = boslugun ortasi'}
    ortusen = {ad: k[alan] for ad, k in kume.items() if (k['etiket'] == 'duz' and k[alan] >= (buz['min'] or 0)) or (k['etiket'] == 'buzgulu' and k[alan] <= (duz['max'] or 9))}
    return {'alan': alan, 'duz': duz, 'buzgulu': buz, 'bosluk': None, 'ortusenler': ortusen, 'hukum': 'ORTUSME: iki sinif bu eksende ayrilmiyor; skaler esik yanlis ayirici (karar ajani 3c)'}
def kisaAltKume(kume, alan):
    # F1 tur 9 (hakem ENGEL 1): kosulun IKI bacagi birlikte: yalniz kisa == True kollar sinifa girer. kisa None (torso
    # olculemedi ve boy 'dirsek': ne kisa ne uzun) ADIYLA 'olculmedi'ye yazilir; olculemeyen ornek olculmus sayilmaz.
    kisa = {ad: k for ad, k in kume.items() if k.get('kisa') is True}
    h = boslukHukmu(kisa, alan)
    h['duzMax'], h['buzMin'] = h['duz']['max'], h['buzgulu']['min']
    h['uyeler'] = {'duz': sorted(ad for ad, k in kisa.items() if k['etiket'] == 'duz'), 'buzgulu': sorted(ad for ad, k in kisa.items() if k['etiket'] == 'buzgulu')}
    h['olculmedi'] = {ad: 'kisa=None: ' + str(k.get('boyKaynak')) for ad, k in kume.items() if k.get('kisa') is None}
    h['disarida_uzun'] = sorted(ad for ad, k in kume.items() if k.get('kisa') is False)
    return h
birlesik = {**eskiKume, **yeniKume}
kisaOlcumler = sorted((k['kisaOlcu'], ad, k['kisa']) for ad, k in birlesik.items() if k.get('kisaOlcu') is not None)
dikeyOlcumler = sorted((k['kisaOlcuDikey'], ad, k['kisa']) for ad, k in birlesik.items() if k.get('kisaOlcuDikey') is not None)
kisaMax = max([v for v, _, kk in kisaOlcumler if kk is True] or [None]); uzunMin = min([v for v, _, kk in kisaOlcumler if kk is False] or [None])
# --- F1 karar ajani 2 (tur 10 uygulama): DIRSEK boyu kollar (boy='dirsek', kisa=None) ayri kova; kisa/uzun sinifina GIRMEZ, bosluk hesabina girmez.
#   Hukum yalniz n >= 3 buzgulu VE n >= 3 duz dirsek kol olculunce: buzgulu dirsek acilari sarkan IQR'a dusuyorsa dirsek = 'uzun' (kosul icin kisa=False,
#   bosluk ustten daralir); puf bandina dusuyorsa 'kisa' (alttan daralir); ikiye bolunuyorsa ayirici yanlis (3c) ve ancak o zaman n>=3 kendi bandiyla ucuncu
#   kosulluBant. Su an olcum sayisi yetersiz -> 'HUKUM YOK', sayilar kayitta (bilgi silme yasagi).
dirsekKume = {ad: k for ad, k in birlesik.items() if k.get('kisa') is None and k.get('kisaOlcu') is not None}
_sarkanIQR = f3['medyanlar']['kolAcisiDeg']['sarkan']['iqr']; _pufBand = f3['medyanlar']['kolAcisiDeg']['puf']['band']
def _konum(a):
    if _sarkanIQR[0] <= a <= _sarkanIQR[1]: return 'sarkan IQR icinde'
    if _pufBand and _pufBand[0] <= a <= _pufBand[1]: return 'puf bandi icinde'
    return 'iki bandin disinda'
dirsekOlcum = {ad: {'etiket': k['etiket'], 'kolBoyuOverTorso': k['kisaOlcu'], 'kolAcisiDeg': k['kolAcisiDeg'], 'aciKonumu': _konum(k['kolAcisiDeg']), 'boyKaynak': k.get('boyKaynak')} for ad, k in dirsekKume.items()}
nDirsekBuz = sum(1 for k in dirsekKume.values() if k['etiket'] == 'buzgulu'); nDirsekDuz = sum(1 for k in dirsekKume.values() if k['etiket'] == 'duz')
dirsekHukmu = {'n': len(dirsekKume), 'nBuzgulu': nDirsekBuz, 'nDuz': nDirsekDuz, 'gerekli': 'n >= 3 buzgulu VE n >= 3 duz', 'olcumler': dirsekOlcum,
               'sarkanIQR': _sarkanIQR, 'pufBand': _pufBand,
               'hukum': ('HUKUM YOK: olcum yetersiz (buzgulu %d/3, duz %d/3); dirsek kollar kisa/uzun sinifina ve bosluga GIRMEZ, kosulda bosluga dusen deger adli kirmizi (contract kosul._boslukKurali)' % (nDirsekBuz, nDirsekDuz))
                         if (nDirsekBuz < 3 or nDirsekDuz < 3) else 'OLCUM TAMAM: karar ajani 2 kurali uygulanir (buzgulu dirsek acilari -> sarkan IQR: uzun / puf bandi: kisa / bolunme: 3c)'}
f5['medyanlar'] = {
  'balonOranDik': {'eskiKume13': boslukHukmu(eskiKume, 'balonOranDik'), 'yeniKume': boslukHukmu(yeniKume, 'balonOranDik'), 'birlesik': boslukHukmu(birlesik, 'balonOranDik'),
                   'kisaAltKume': {'eskiKume13': kisaAltKume(eskiKume, 'balonOranDik'), 'yeniKume': kisaAltKume(yeniKume, 'balonOranDik'), 'birlesik': kisaAltKume(birlesik, 'balonOranDik'),
                                   'tanim': 'HUKUM (F1 tur 9). kosulluBant kosulu kisa VE agiz buzgulu oldugu icin esik KISA alt kumeden kesilir: kisa == True kollarda duz max / buzgulu min / bosluk / ortaNokta. '
                                            'contract kosul.agizBuzguOranMin = birlesik.ortaNokta, kosul.agizBuzguOranBosluk = birlesik.bosluk (kopya; dosya sonu kontrol eder). kisa None kollar olculmedi listesinde.'},
                   'tanim': 'HUKUM EKSENI. kol eksenine dik en genis kesit / agiz uzunlugu; etiket cizim konvansiyonundan. Bosluk = duz maksimumu ile buzgulu minimumu arasi. TUM kume boslugu bilgi (ortusur), hukum kisaAltKume.'},
  'balonOranYatay': {'eskiKume13': boslukHukmu(eskiKume, 'balonOranYatay'), 'yeniKume': boslukHukmu(yeniKume, 'balonOranYatay'), 'birlesik': boslukHukmu(birlesik, 'balonOranYatay'),
                     'tanim': 'BILGI. BOLUM 3 yatay satir tanimi; eksen dusey olmayan kollarda kol boyunu olcer (Stevie/Lucy), hukum tasimaz.'},
  'kolBoyuOverTorso': {'n': len(kisaOlcumler), 'degerler': [{'flat': ad, 'oran': v, 'kisa': kk, 'dikey': next(d for d, a2, _ in dikeyOlcumler if a2 == ad), 'kolAcisiDeg': birlesik[ad]['kolAcisiDeg']} for v, ad, kk in kisaOlcumler],
                       'nDirsek': len(dirsekKume), 'kisaMax': kisaMax, 'uzunMin': uzunMin, 'bosluk': ([kisaMax, uzunMin] if (kisaMax is not None and uzunMin is not None and kisaMax < uzunMin) else None),
                       'ortaNokta': (round((kisaMax + uzunMin) / 2, 4) if (kisaMax is not None and uzunMin is not None and kisaMax < uzunMin) else None),
                       'esik': KISA_ESIK, 'esikBoslukIcinde': (kisaMax is not None and uzunMin is not None and kisaMax < KISA_ESIK < uzunMin),
                       'tanim': 'HUKUM (F1 tur 9, hakem ENGEL 2). kol boyu = omuz ucu -> agiz ortasi, kol EKSENI boyunca (hypot(dx,dy)) / torso (SNP->bel). Eski dikey deger = kolBoyu x sin(kolAcisiDeg) (degerler[].dikey, bilgi): '
                                'aciya bagli oldugu icin band secen kosul olarak donguseldi; F2 grafta kol boyunu bilir, aciyi bilmez. F1 tur 10: kisa etiketi urun taniminda (boyKaynak), orandan DEGIL; oran yalniz bosluk. Esik boslugun icindeyse kalir, degilse ortaNokta.'},
  'dirsek': dirsekHukmu,
  'agizOmuzDikeyOverTorso': {'n': len(dikeyOlcumler), 'degerler': [{'flat': ad, 'oran': v, 'kisa': kk} for v, ad, kk in dikeyOlcumler],
                             'kisaMax': max([v for v, _, kk in dikeyOlcumler if kk] or [None]), 'uzunMin': min([v for v, _, kk in dikeyOlcumler if not kk] or [None]),
                             'tanim': 'BILGI (eski tanim, F1 tur 8; hukum tasimaz). Dikey mesafe / torso; kisa etiketi artik kolBoyuOverTorso ile.'},
  'kolAcisiDeg': {'buzgulu': {ad: k['kolAcisiDeg'] for ad, k in yeniKume.items() if k['etiket'] == 'buzgulu'}, 'duz': {ad: k['kolAcisiDeg'] for ad, k in yeniKume.items() if k['etiket'] == 'duz'},
                  'not': 'bilgi: raglan/dusuk omuz/off-shoulder kollarin omuz ucu set-in ile ayni nokta degil (omuzNot), banda girmez'},
}
sonuc['f1Tur8'] = f5
print('\n=== BOLUM 5 (F1 tur 8) balonOran ===')
for ad, k in f5['flatler'].items():
    print('%-30s %-8s dik %-6s yatay %-6s aci %-5s eksen %-5s boy %-6s kolBoyu/torso %s (dikey %s)' % (ad, k.get('etiket'), k.get('balonOranDik'), k.get('balonOranYatay'), (k.get('kolAcisiDeg') or {}).get('deger'), (k.get('enGenisDikKesit') or {}).get('eksenAciDeg'), k.get('boy'), k.get('kolBoyuOverTorso'), k.get('agizOmuzDikeyOverTorso')))
print('--- eski kume dik / yatay')
for ad, v in eskiDik.items(): print('%-34s dik %-6s yatay %-6s %s' % (ad, v['balonOranDik'], v['balonOranYatay'], eskiKume[ad]['etiket']))
for alan in ('balonOranDik', 'balonOranYatay'):
    h = f5['medyanlar'][alan]['birlesik']; print(alan, 'BIRLESIK:', h['hukum'], 'bosluk', h.get('bosluk'), 'orta', h.get('ortaNokta'), 'duzMax', h['duz']['max'], 'buzMin', h['buzgulu']['min'], 'ortusen', h.get('ortusenler'))
for kum in ('eskiKume13', 'yeniKume', 'birlesik'):
    h = f5['medyanlar']['balonOranDik']['kisaAltKume'][kum]
    print('KISA ALT KUME', kum, h['hukum'], 'duzMax', h['duzMax'], 'buzMin', h['buzMin'], 'bosluk', h.get('bosluk'), 'orta', h.get('ortaNokta'), 'uyeler', h['uyeler'], 'olculmedi', h['olculmedi'])
kb = f5['medyanlar']['kolBoyuOverTorso']
print('kolBoyuOverTorso:', json.dumps(kb['degerler']), 'kisaMax', kb['kisaMax'], 'uzunMin', kb['uzunMin'], 'bosluk', kb['bosluk'], 'orta', kb['ortaNokta'], 'esik', kb['esik'], 'icinde', kb['esikBoslukIcinde'])

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w') as f:
    json.dump(sonuc, f, indent=1, ensure_ascii=False)

# --- F1 tur 9: contract esikleri ile URETICI ciktisi ayni mi? (tek kaynak kontrolu; JSON yazildiktan sonra, fark exit 2) ---
hK = f5['medyanlar']['balonOranDik']['kisaAltKume']['birlesik']; uyumsuz = []
if hK.get('bosluk') is None: uyumsuz.append('kisa alt kume boslugu KAPANDI: skaler esik ayirici degil (karar ajani 3c), contract esigi gecersiz')
else:
    if KOSUL['agizBuzguOranMin'] != hK['ortaNokta']: uyumsuz.append('agizBuzguOranMin contract %s != uretici ortaNokta %s' % (KOSUL['agizBuzguOranMin'], hK['ortaNokta']))
    if list(KOSUL['agizBuzguOranBosluk']) != list(hK['bosluk']): uyumsuz.append('agizBuzguOranBosluk contract %s != uretici %s' % (KOSUL['agizBuzguOranBosluk'], hK['bosluk']))
if kb['bosluk'] is None: uyumsuz.append('kolBoyuOverTorso kisa/uzun boslugu KAPANDI')
else:
    if not kb['esikBoslukIcinde']: uyumsuz.append('kolBoyuOverTorsoMax %s bosluk %s DISINDA; ortaNokta %s' % (KISA_ESIK, kb['bosluk'], kb['ortaNokta']))
    if list(KOSUL['kolBoyuOverTorsoBosluk']) != list(kb['bosluk']): uyumsuz.append('kolBoyuOverTorsoBosluk contract %s != uretici %s' % (KOSUL['kolBoyuOverTorsoBosluk'], kb['bosluk']))
if uyumsuz:
    print('ESIK UYUMSUZ (contract/flat-convention-v1.json kosulluBant[0].kosul vs flat-olcum.json f1Tur8):'); [print('  -', u) for u in uyumsuz]
    import sys; sys.exit(2)
print('ESIK KONTROL OK: agizBuzguOranMin %s = kisa alt kume orta, bosluk %s; kolBoyuOverTorsoMax %s bosluk %s icinde' % (KOSUL['agizBuzguOranMin'], hK['bosluk'], KISA_ESIK, kb['bosluk']))
print(json.dumps(sonuc['oranlar'], indent=1, ensure_ascii=False))
for ad, k in f1['flatler'].items():
    if 'OLCULEMEDI' in k: print(ad, 'OLCULEMEDI:', k['OLCULEMEDI']); continue
    print(ad, '| snp', k.get('snp', {}).get('xy') or k.get('snp', {}).get('snapPX'), '| bel', k.get('bel', {}).get('satirY'),
          '| oyuk', k.get('oyukTabani', {}).get('satirY') or k.get('oyukTabani', {}).get('snapPX'), '| pens', k.get('pensUcu', {}).get('xy'),
          '| omuz', k['omuzUcu']['snapPX'], '| kolUcu', k.get('kolUcu', {}).get('orta'),
          '| oyuk/torso', k.get('oyukOverTorso'), '| pens/torso', k.get('pensUcuOverTorso'), '| aci', k.get('kolAcisiDeg', {}).get('deger'))
print(json.dumps(f1['medyanlar'], indent=1, ensure_ascii=False))
