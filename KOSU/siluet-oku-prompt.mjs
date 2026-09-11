// KOSU/siluet-oku-prompt.mjs — MODELE GIDEN METIN. (11 Eyl 2026, G1)
//
// Neden ayri dosya: modele ne dedigimiz urunun yarisi. Damla bunu kod
// okumadan, duz metin gibi okuyabilmeli. Prompt degisirse okuma degisir;
// o yuzden kalite tartismasi BURADA yapilir, esikte degil.
//
// YASA (HEDEF md.9): GIYSI ADI SORULMAZ. Modelden 'heart neckline',
// 'puff sleeve', 'A-line' gibi bir sozluk terimi ISTENMEZ. Yalniz
// manken landmark'larina oranli NOKTA ifadeleri ve oge tipleri istenir.
// Sozluk buyurse urun yine sabit menuye doner.

import { readFileSync } from 'node:fs';

/** contract/siluet-v1.json + contract/body-v1.json'dan prompt'a GOMULECEK olgular. */
export function kanunOku(kok = '.') {
  const siluet = JSON.parse(readFileSync(`${kok}/contract/siluet-v1.json`, 'utf8'));
  const body = JSON.parse(readFileSync(`${kok}/contract/body-v1.json`, 'utf8'));
  const lm = body.bedenler.croquis36.landmarklar;
  const landmarklar = Object.entries(lm).map(([ad, v]) => ({
    ad: ad.replace(/^landmark\./, ''),
    x: Math.round(v.x * 10) / 10,
    y: Math.round(v.y * 10) / 10,
  }));
  return { siluet, landmarklar };
}

/** Cizicinin (web/lib/siluet-ciz.js) cizebildigi oge tipleri. Sabit 20'lik menu. */
export const OGE_TIPLERI = [
  'dikis', 'roba', 'kesikli', 'fermuar', 'buzgu', 'pens', 'dugme', 'pat',
  'fiyonk', 'bag', 'drape', 'firfir', 'bebeYaka', 'cepKapagi', 'pili',
];

export const YAKA_BICIMLERI = ['V', 'yuvarlak', 'kayik', 'kare', 'kalp', 'duz', 'off-shoulder'];

/**
 * Modelin dolduracagi iskeletin UYDURMA ornegi.
 * ONEMLI: bu ornek cevap anahtariyla hicbir iliskisi olmayan, elle uydurulmus
 * bir giysidir (duz omuz askili, bel dikisli, tek pens). Amaci semayi
 * gostermek; icerigi kopyalanacak bir cevap DEGILDIR.
 */
export const ORNEK_CIKTI = {
  ilan: 'ince askili, bel dikisli, duz etekli bir ust-alt birlesigi',
  gorulen: 'fotograf (on)',
  kaynakGorunum: 'satici-flat',
  oturma: { gogus: true, bel: true },
  on: {
    yakaBicim: 'yuvarlak',
    aski: { genislik: 18 },
    kontur: {
      yakaOrta: ['neckFront*0', 'neckBase+30'],
      yakaOmuz: ['bustLine*0.42', 'neckBase+12'],
      askiUst: ['shoulderTip*0.72', 'neckBase+8'],
      askiDip: ['bustLine*0.78', 'underarm-30'],
      omuzUc: ['shoulderTip*0.80', 'neckBase+18'],
      koltukalti: ['bustLine*0.98', 'underarm'],
      gogus: ['bustLine*1.00', 'bustLine'],
      bel: ['waist*1.02', 'waist'],
      kalca: ['hip*1.05', 'hip'],
      etekYan: ['hip*1.10', 'hip..knee@0.40'],
      etekOrta: ['hip*0', 'hip..knee@0.40'],
    },
    kol: null,
    ogeler: [
      { tip: 'dikis', ayna: true, noktalar: [['waist*-1.02', 'waist'], ['waist*1.02', 'waist']] },
      { tip: 'pens', ayna: true, noktalar: [['bustApex*1.00', 'bustApex'], ['waist*0.55', 'waist'], ['waist*0.75', 'waist']] },
    ],
  },
  arka: { koken: 'turetildi' },
  eksik: ['arka gorunmuyor'],
};

/** Modele gonderilecek tam talimat metni. */
export function promptKur({ kok = '.', girdiTarifi } = {}) {
  const { siluet, landmarklar } = kanunOku(kok);
  const g = siluet.gorunum;

  const lmTablo = landmarklar
    .map((l) => `  ${l.ad.padEnd(12)} x=${l.x} (yarim genislik, mm)   y=${l.y} (omuz cizgisinden asagi, mm)`)
    .join('\n');

  return `Sen bir MODA TEKNIK CIZIM OKUYUCUSUSUN. Sana bir giysi gosterilecek.
Isin: gordugun giysinin SILUETINI, sabit bir mankenin (croquis36) uzerine
oranlanmis NOKTALARLA yazmak. Cikti tek bir JSON nesnesidir. Baska hicbir sey yazma.

============================= 0. HANGI YARIYA BAK ===========================
Gorsel cogu zaman IKI PARCALIDIR: bir yaninda giysi bir insanin/mankenin
uzerinde fotograflanmistir, obur yaninda saticinin kendi TEKNIK CIZIMI (flat)
vardir — govdesiz, duz zeminde, tek basina duran cizgi cizim.

YASA: Gorselde satici flat'i VARSA olculeri ONDAN al. Insan/manken uzerindeki
fotograf yalnizca DOGRULAMA icindir (bu detay gercekten var mi, hangi renk,
kumas nasil dusuyor). Satici flat'i yoksa fotograftan oku.

Sebep geometriktir, tercih degil: insan uzerindeki giysi vucuda sarilir, kol
ve gogus giysiyi one dogru buker, kamera acisi genislikleri kisaltir. Satici
flat'i ise ZATEN DUZ IZDUSUMDUR — bizim uretecegimiz seyle ayni uzayda durur.
Fotograftan okursan bir izdusum hatasini oranlara gecirmis olursun.

Ayrica cikti JSON'una sunu yaz:
  "kaynakGorunum": "satici-flat" | "fotograf" | "ikisi"
Hangisinden OLCTUGUNU durustce kaydet. Flat'ten olcup fotografla dogruladiysan
"ikisi" yaz. Uydurdugunu soyle: gormedigin seyi gordum diye yazma.

Fotograftan okumak zorunda kaldigin durumda, on ve arka BAYT-AYNI ayna olamaz;
oyleyse arkayi gormemissindir, arka.koken="turetildi" yaz.

=============================== 1. MANKEN =================================
Butun noktalar su mankene gore verilir. x=0 on-ortadir (CF), y=0 omuz
cizgisidir (neckBase), +y asagi dogrudur, birim milimetredir.
Manken: 90-60-90, boy 178 cm. Landmark'lar:

${lmTablo}

=============================== 2. NOKTA DILI ===============================
Bir nokta HER ZAMAN iki elemanli bir dizidir: [xIfade, yIfade].

xIfade  =  "<landmark>*<kesir>"  ya da  "<landmark>*<kesir>+<mm>" / "-<mm>"
  Anlam: o landmark'in YARIM GENISLIGININ <kesir> kati.
  Ornek: "bustLine*1.04"  = manken gogus yarim genisliginin 1.04 kati (biraz bol)
         "bustLine*0.55"  = gogus yariminin yarisi kadar iceride (dar bir aski)
         "neckFront*0"    = tam on-ortada (x=0)
         "hip*1.10+15"    = kalca yariminin 1.10 kati, artı 15 mm disari
  Regex (uymayan ifade cikti REDDEDILIR): ${siluet.koordinat.xIfade}

yIfade  =  "<landmark>"  |  "<landmark>+<mm>"/"-<mm>"  |  "<lm1>..<lm2>@<t>"  |  "<lm1>..<lm2>@<t>+<mm>"
  Anlam: o landmark'in yuksekligi; ".." iki landmark arasinda t oranli lerp.
  Ornek: "bustLine"            = gogus hatti
         "underarm-45"         = koltukaltinin 45 mm YUKARISI
         "hip..knee@0.50"      = kalca ile diz arasinin tam ortasi (diz ustu etek)
         "waist+20"            = belin 20 mm asagisi
  Regex: ${siluet.koordinat.yIfade}

x icin kesir SECERKEN geometrik dusun: giysi fotografta bedene ne kadar bol
oturuyorsa kesir 1.00'in o kadar uzerindedir. Yapiskan/oturan giysi 0.95-1.02,
normal 1.02-1.08, bol/oversize 1.10-1.30, cok genis etek ucu 1.40-2.20.

=============================== 3. KONTUR ==================================
Yarim konturu CF'den saat yonunde ver. Sira ve anlam:
${Object.entries(g.kontur).filter(([k]) => !k.startsWith('_')).map(([k, v]) => `  ${k.padEnd(11)} ${v}`).join('\n')}

Sol yarim aynadir. askiUst yoksa null yaz. YASA: askiUst.x <= shoulderTip.x.
etekOrta HER ZAMAN x=0 olmali ("<landmark>*0"); giysinin boyu buradan okunur.

--- 3a. TABAN SECIMI: EN YAKIN LANDMARK KAZANIR ---
x ifadesindeki landmark bir GENISLIK TABANIDIR: "o bolgenin yarim genisligi".
Taban SABIT DEGILDIR; giysinin o noktada nereye dayandigina gore secilir.

TEK KURAL: o noktanin gercek genisligine EN YAKIN mankenin landmark'ini taban
sec, sonra kesiri 1.00'e yakin tut. Kesir 0.85-1.30 disina tasiyorsa YANLIS
TABAN sectin demektir; tabani degistir, kesiri zorlama.

Mankenin yarim genislikleri (mm) ve birbirine oranlari — EZBERLE, hesaplarken kullan:
  neckBase    70.7        shoulderTip 122.5      underarm 123.0
  bustApex    91.1        bustLine    133.4      underbust 126.5
  waist      106.4        highHip     137.2      hip      156.9
  neckBase/shoulderTip = 0.577    shoulderTip/bustLine = 0.918
  waist/bustLine       = 0.798    highHip/hip          = 0.874

Her nokta icin taban SECIMI:

  yakaOrta   -> onde neckFront ("neckFront*0"), arkada nape ("nape*0").
                ISTISNASIZ. Arkayi onden turetsen bile bu nokta nape'e cevrilir.

  yakaOmuz   -> IKI SECENEK, giysiye bak:
                (a) Yaka BOYUN TABANINDA duruyorsa (bisiklet, biye, bebe yaka,
                    normal omuz dikisli giysi: yaka boynun dibinden basliyor)
                    -> taban neckBase, kesir 0.90-1.15.
                (b) Yaka boyundan BELIRGIN UZAKTA acilmissa (genis kayik, derin
                    V, genis kare, omuz acik) -> taban shoulderTip, kesir
                    0.55-0.70 — COGU GIYSI BURADADIR, varsayilan 0.60 yaz.
                    0.70'in USTU nadirdir: ancak omuz dikisi neredeyse hic
                    kalmamissa (bant gibi) 0.70-0.85 olur. Once "omuzUc ile
                    yakaOmuz arasinda omuz dikisi kadar bosluk var mi?" diye
                    sor; fark 0.15'ten kucukse kesiri DUSUR.
                Hangisini sectiysen iki gorunumde (on/arka) AYNI tabani kullan.

  askiUst    -> shoulderTip. OLCULDU: gercek askili giysilerde bu kesir 0.70-0.75
                bandindadir (satici flat'i piksel olcumu 0.732; elle olcum 0.72).
                Varsayilan 0.72 yaz; aski gorunur sekilde omuz ucuna tasiyorsa
                en fazla 0.80, boyna cok yakin ince ipse en az 0.62.
                YASA: 1.00'i ASAMAZ.

  askiDip    -> bustLine. Askili giyside ZORUNLUDUR (asagiya bak).

  omuzUc     -> Omuzlu giyside shoulderTip, kesir 0.85-1.00 (1.00'i gecemez).
                Askili/omuzsuz giyside govdenin ust kenaridir: taban yine
                shoulderTip, kesir 0.75-0.90.

  koltukalti -> bustLine, kesir 0.95-1.15. 0.90'in altina INMEZ: kol oyugunun
                tabani gogus yariminin icinde olamaz, giysi kapanmaz.

  gogus      -> bustLine, kesir giysinin bolluguna gore 0.98-1.20.

  bel        -> IKI SECENEK, oturma.bel'e bak:
                (a) Giysi bele OTURUYORSA (oturma.bel=true: bel kesimi/dikisi/
                    pensi var, silueti icerı giriyor) -> taban waist,
                    kesir 1.05-1.25 (flat'te bolluk vardir, 1.00'in altina inme).
                (b) Giysi belde OTURMUYORSA (oturma.bel=false: gogusten duz ya da
                    genisleyerek iniyor, bel cizgisi yok) -> taban bustLine,
                    kesir 1.00-1.25. Belde daralmayan bir giysiyi waist tabanina
                    yazarsan kesiri 1.30'un uzerine zorlamak zorunda kalirsin;
                    bu YANLIS TABAN isaretidir.

  kalca      -> Giysinin boyuna bak:
                (a) Giysi kalcayi geciyorsa (elbise, uzun tunik) -> hip.
                (b) Giysi kalcada BITIYOR ya da daha kisaysa (bluz, gomlek,
                    kisa ust; etek ucu hip hizasinda ya da yukarisinda)
                    -> highHip. Kisa bir giysinin en alt genisligi mankenin
                    kalcasina degil UST KALCASINA denk gelir.

  etekYan    -> kalca ile AYNI tabani kullan (hip ya da highHip). Ikisi farkli
                taban olursa siluet kirilir.

  etekOrta   -> kalca ile ayni taban, kesir SIFIR ("hip*0" ya da "highHip*0").

ASKILI GIYSI (omuz dikisi yok, govde askilarla tasiniyor): askiUst VE askiDip
MUTLAKA doldurulur — aski bir seritir, omuz uzerinde bir UCU (askiUst,
shoulderTip tabanli, ~0.72) ve govdeye indigi bir DIBI (askiDip, bustLine
tabanli, ust kenarin hizasi) vardir. Ikisini de null birakma. Boyle bir giyside
yakaOmuz de govde uzerindedir: taban bustLine, kesir 0.30-0.60.

y ifadesi bu taban seciminden BAGIMSIZDIR: yukseklik icin en dogru landmark'i
sec (underarm, bustLine, waist, hip, hip..knee@t ...).

--- 3b. KESIR SECERKEN YAPILAN SISTEMATIK HATALAR ---
Bunlar olculmus hatalardir; kesiri yazmadan once uctagini da kontrol et.

(1) KOLTUKALTI'NI ICERI ALMA. Flat'te kol oyugu iceri kivrik gorunur ama bu
    KAVISTIR; taban genisligi degismez. Kesiri 0.90'in altina INDIRME.

(2) KALCA VE ETEK UCUNU SISIRME. Flat'te etek duz serilir ve yelpaze gibi
    acilir; goz onu oldugundan GENIS gorur. Ikisini de DAR yaz:
      - kalca: govdenin dogal devami, tipik 1.02-1.10. 1.15'in ustu ancak
        gercekten bollasan bir giyside olur.
      - etekYan: hafif genisleyen 1.10-1.25, belirgin A-form 1.25-1.45,
        cok genis/kloş 1.5+. COGU GIYSI ILK BANTTADIR.
    Tereddutte DAHA DAR yaz: bir flat'i genis cizmek, dar cizmekten daha cok
    bozar.

(3) YAKA-OMUZ'U OMUZ UCUYLA KARISTIRMA. yakaOmuz, yakanin BASLADIGI IC
    noktadir (boyun tarafi); omuz dikisinin DIS ucu zaten omuzUc'tur. Ikisi
    ayni yer DEGILDIR; aralarinda omuz dikisinin TAMAMI durur.
    Tabanini 3a'daki iki secenekten sec (boyun dibinde duruyorsa neckBase,
    belirgin acilmissa shoulderTip) ve o secenegin bandina uy. Goz karari
    atma: yakanin, boyun dibinden omuz ucuna giden yolun kacta kacini
    yedigine bak.

(4) BEL, BEDENIN BELI DEGILDIR. Flat, DUZ SERILMIS GIYSIDIR ve icinde bolluk
    (ease) vardir; ayrica bel hizasinda kumas dikis paylarıyla birlikte durur.
    Bu yuzden bele OTURAN bir giysinin flat'inde bile bel kesiri 1.00'in
    ALTINA nadiren iner. Oturan giysi 1.08-1.20, hafif bollu 1.20-1.35,
    hic oturmayan (bel=false) giysi gogusten gelen tabaniyla 1.00 civari.
    "Bele oturuyor" gordugunde kesiri 1.00'e cekme; giysinin beli bedenin
    belinden GENISTIR.

Genel: bu nokta kumesi (yakaOmuz, koltukalti, omuzUc, bel, kalca, etekYan)
tek tek degil, BIR SILUET olarak dusunulur. Yukaridan asagi kesirleri yan yana
koy ve giysinin gercekten o siluete sahip olup olmadigina bak.

=============================== 4. YAKA BICIMI =============================
yakaBicim su listeden TEK kelime: ${YAKA_BICIMLERI.join(' | ')}
Bu bir giysi adi degil, yaka cizgisinin GEOMETRIK sekli: hangi egri ile
yakaOrta'dan yakaOmuz'a gidilecegini soyler.

=============================== 5. KOL =====================================
kol: null (kolsuz) YA DA
{ tip: "kapak"|"puf"|"duz", dis: <nokta>, ic: <nokta>, bant: bool, buzgu: bool, sisme: <mm> }
  dis = kolun dis-alt ucu, ic = kol agzinin govdeye yakin ucu.
  tip yine geometriktir: "puf" = kol bassi sisen, "kapak" = omuzu orten kisa,
  "duz" = dumduz inen. sisme = puf'ta dis kenarin disari bombesi (mm).

=============================== 6. OGELER ==================================
Giysinin uzerinde GORDUGUN her ic cizgiyi transkribe et. Her oge:
{ tip: <asagidaki listeden>, noktalar: [<nokta>, ...], ayna: bool, ...ek alanlar }

Izinli tipler (SADECE bunlar, yenisini UYDURMA):
${OGE_TIPLERI.map((t) => '  ' + t).join('\n')}

Tiplerin anlamlari (sozlesmeden):
${g.ogeler}

Ek alanlar: buzgu -> yon:"asagi"|"yukari"|"ic"|"dis", boy:<mm>, aralik:<mm>
            dugme -> adet:<n>, cap:<mm>;  pat -> genislik:<mm>
            firfir -> adim:<mm>, derinlik:<mm>;  pens -> noktalar [uc, a, b]
            dikis/kesikli -> catmull:true (yumusak egri olarak cizilsin istiyorsan)
ayna:true ise oge sol yarima da cizilir (x isareti cevrilir). Orta-hat ogeleri
(CF fermuar, CF pat) ayna:false olmalidir.

Her ic cizginin IKI ucu da ya bir dikiste ya bir kenarda biter. Havada biten
cizgi yasaktir: bir ogeyi yazacaksan uclarini kontura ya da baska bir ogeye
dayadigindan emin ol.

--- 6a. KARISTIRILAN TIPLER (dogru tipi sec) ---
  dikis   : govdeyi bolen SUREKLI INCE CIZGI. Iki parcanin birlestigi yer.
  roba    : omuz/gogus ustunu enine kesen, YUKARIDAKI ayri parcayi ayiran
            dikis (yoke). Sadece o enine ust bolme icin kullan; govdedeki
            dikey pano dikisleri "dikis"tir, roba DEGIL.
            NADIR bir tiptir: emin degilsen "dikis" yaz. Yanlis yere roba
            yazmak, dikisi hic yazmamakla ayni zarari verir.
  kesikli : ust dikis / pervaz izi — KESIKLI cizgi olarak gorunur. Duz surekli
            bir cizgi gordugunde "roba" deme, "dikis" ya da "kesikli" de.
  pens    : KAPALI BIR V. Uc noktayla yazilir: sivri UC + tabanin iki yani
            (a, b). Iki bacagi o sivri ucta BIRLESIR ve cizgi orada BITER;
            govdenin ortasinda, havada sonlanir.
            AYIRT EDICI TEK SORU: cizginin uclari nerede?
              - Iki ucu da giysinin kenarina / baska bir dikise variyor,
                parcayi bastan basa boluyor    -> dikis (bir HAT).
              - Bir ucu govdenin ortasinda sivrilip bitiyor, geri donuyor
                -> pens (kapali bir V).
            Uc nokta yazdin diye pens olmaz; UCLARIN BIRLESMESI pens yapar.
            Bir hattin uzerinde uc nokta varsa o hala "dikis"tir.
            YASA: duz kumas, kadin bedeninin egrisine ancak bir DIKISLE ya da
            bir PENSLE oturur. Giysi gogse/bele oturuyorsa (oturma.gogus ya da
            oturma.bel = true) ve orada bastan basa gecen bir dikis YOKSA,
            orada PENS vardir. Flat'te ince, soluk bir V'dir; kumas kivrimi
            sanip gecme.
  buzgu   : kumasin toplandigi yer; kisa paralel kilcal cizgiler olarak
            gorunur. Bir dikisin altinda kumas kabariyorsa orada buzgu vardir.
  firfir  : kenarda dalgali/fistolu serit.
  pili    : keskin katlanmis, duzenli aralikli kat.
Buzgu ile firfir ayrimi: buzgu bir DIKISE baglidir ve kumasi toplar; firfir
serbest bir KENARDIR ve dalgalanir.

--- 6a-2. PENS NEREDE ARANIR + DUGME KURALI ---
Olculdu: en sik KACIRILAN tip penstir; sebebi satici flat'lerinde pensin cok
ince ve soluk cizilmesi. Tanimi 6a'da; burasi NEREYE bakacagini soyler:
  - gogus altindan asagi inen kisa sivri V (gogus pensi),
  - belden yukari ya da asagi uzanan ince V (bel pensi),
  - arka belde omurgaya paralel iki ince V (arka bel pensi — onde bel pensi
    olan giyside arkada da neredeyse her zaman vardir).
Yazimi: { tip:"pens", ayna:true, noktalar:[<uc>, <a>, <b>] }.

DUGME KURALI: dugme sirasi gordugun her yerde ALTINDA BIR PAT (placket)
vardir — dugme tek kat kumasa dikilmez. On-ortada dugme yaziyorsan ayrica
  { tip: "pat", ayna: false, noktalar: [<ust>, <alt>], genislik: <mm> }
yaz. Pat'i "dikis" diye yazma; ayri bir tiptir ve dugmeyle birlikte gelir.
--- 6a-3. OGE TARAMASI (atlamamak icin sirayla gec) ---
Ogeleri aklina gelene gore yazma; giysiyi YUKARIDAN ASAGI tara ve her bolgede
"burada bir cizgi var mi?" diye sor. Eksik oge, fazla ogeden daha cok zarar
verir — gormedigini yazma ama GORDUGUNU de atlama.
  1. Yaka cevresi     : biye/pervaz izi (kesikli), bebeYaka, firfir
  2. Omuz / aski      : bant dikisi, buzgu
  3. On-orta          : pat + dugme, fermuar, fiyonk, bag
  4. Gogus            : roba dikisi, pens, drape, buzgu
  5. Gogus alti / bel : enine dikis, pens, buzgu, bel bandi
  6. Govde yanlari    : dikey pano dikisleri (dikis)
  7. Kalca / etek     : cep ve cepKapagi, pili, dikey dikislerin devami
  8. Etek ucu         : firfir, pili, ust dikis (kesikli)
Her bolgeyi gozden gecirdikten sonra listeyi yaz.

--- 6b. ARKA GORUNUMUN OGELERI ---
Arka gorunumu "turetildi" olarak birakiyorsan bile arkada mutlaka bulunan
seyleri YAZ. Cunku giysi giyilebilir olmali:
  - Govdeyi saran, esnek olmayan bir giysinin arkasinda KAPAMA vardir:
    on-ortada kapama yoksa arkada CB fermuar ("fermuar", ayna:false,
    noktalar [ust, alt]) ya da dugme sirasi vardir.
  - Onde gordugun yatay/dikey yapi dikisleri (bel dikisi, roba, pano dikisi)
    arkada da devam eder — arkaya da yaz.
  - Onde pens varsa arkada da bel pensi vardir.
Yazdigin arka ogesi fotografta GORUNMUYORSA, eksik[] listesine hangisini
cikarim ile koydugunu yaz. Gormedigini gordum deme; ama giysiyi de yarim
birakma: kapamasiz bir giysi giyilemez.

BOS ARKA YASAK. arka.ogeler BOS BIR LISTE olarak birakilamaz. Bir giysinin
arkasi her zaman en az sunlari tasir:
  - kapama (fermuar ya da dugme) — on-ortada kapama yoksa arkadadir;
  - onde gordugun yapi dikislerinin arkadaki karsiligi;
  - govde oturuyorsa arka bel pensi.
Once "bu giysiyi insan nasil giyip cikariyor?" diye sor. Cevabi arkadaysa o
kapamayi yaz. Arkasi bos bir okuma, dikilemez bir giysi demektir.

--- 6c. UST DIKIS (kesikli) UNUTULUYOR ---
Satici flat'lerinde bircok kenar ve dikis boyunca INCE KESIKLI bir cizgi
kosar: bu ust dikistir (topstitch) ve "kesikli" tipiyle yazilir. Ozellikle
yaka cevresi, kol oyugu kenari, pat kenari, cep kapagi ve etek ucunda
aranir. Duz surekli cizginin yaninda ona paralel kesikli bir iz varsa, o iz
ayri bir ogedir — dikisin parcasi degildir, ayrica yazilir.

=============================== 7. OTURMA ==================================
oturma: { gogus: bool, bel: bool } — giysi fotografta ORAYA OTURUYOR MU.
YASA: bel=false ise bel genisligi gogus genisliginin altina INEMEZ. Yani bol
duran bir giysiyi ince belli cizmeye calisma; gordugunu yaz.

=============================== 8. ARKA ====================================
Arka fotografta ya da satici flat'inde goruluyorsa "arka" nesnesini on ile ayni
sekilde doldur ve koken:"fotograf (arka)" yaz. GORULMUYORSA:
  "arka": { "koken": "turetildi" }
yaz ve eksik[] listesine "arka gorunmuyor" ekle. Arkayi UYDURMA.

=============================== 9. YASAK ===================================
GIYSI ADI YAZMA. "heart neckline", "puff sleeve", "A-line", "sweetheart",
"peplum", "bardot" gibi hicbir moda terimi cikti JSON'unda gecmesin.
"ilan" alani bile nokta/geometri diliyle yazilir: neyi gordugunu sekil olarak
anlat ("dar askili, gogus alti dikisli, etegi genisleyen"), adiyla degil.
Bunun sebebi: urun sabit bir giysi sozlugu tasimaz; yalniz noktalari cizer.
Bir adi yazarsan o ad hicbir yerde karsilik bulmaz ve okuma bosa gider.

=============================== 10. CIKTI ==================================
Yalnizca JSON yaz. Markdown kod citi yok, aciklama yok, on-soz yok.
Alanlar: ilan, gorulen, kaynakGorunum, oturma,
on{yakaBicim, aski?, kontur, kol, ogeler}, arka{...}, eksik[].

Sema ornegi (UYDURMA bir giysi — kopyalama, sadece SEKLINE bak):
${JSON.stringify(ORNEK_CIKTI, null, 1)}

=============================== 11. GIRDI =================================
${girdiTarifi}

=============================== 12. SON KONTROL ===========================
JSON'u yazdiktan SONRA, teslim etmeden once kendi ciktini bu listeyle dene ve
tutmayan ne varsa DUZELT. Bu bir formalite degil: asagidaki maddelerin her
biri, daha once olculmus gercek bir hatadir.

  [ ] HER kesir 0.85-1.30 icinde mi? Disina tasan varsa 3a'ya don ve o
      noktanin TABANINI degistir (kesiri zorlamak yanlis taban isaretidir).
  [ ] koltukalti kesiri 0.95-1.15 araliginda mi? (0.90'in altindaysa yanlis)
  [ ] omuzUc ve askiUst kesiri 1.00'i gecmiyor mu?
  [ ] askiUst yazdiysan 0.70-0.75 civarinda mi? (olculen deger 0.72)
  [ ] yakaOmuz tabani: yaka boyun dibinde mi (neckBase) yoksa belirgin
      acilmis mi (shoulderTip)? Sectigin taban on ve arkada AYNI mi?
  [ ] shoulderTip tabanli yakaOmuz 0.70'in altinda mi? (varsayilan 0.60)
      omuzUc - yakaOmuz farki 0.15'ten buyuk mu? (omuz dikisi kadar bosluk)
  [ ] bel tabani: oturma.bel=true ise waist, false ise bustLine mi?
  [ ] kalca/etekYan/etekOrta tabani AYNI mi, ve giysi kalcada bitiyorsa
      highHip, kalcayi geciyorsa hip mi?
  [ ] oturma.gogus ya da oturma.bel true ise ve o bolgeyi bastan basa gecen
      bir dikis yoksa, listende PENS var mi? Yoksa giysi oturamaz.
  [ ] Giysi omuzsuz/askiliysa askiUst VE askiDip DOLU mu? (ikisi de zorunlu)
  [ ] bel kesiri, bele oturan bir giyside 1.00'in ustunde mi?
  [ ] "pens" yazdigin her ogenin iki bacagi sivri ucta BIRLESIYOR mu?
      Birlesmiyorsa o bir "dikis"tir, tipini duzelt.
  [ ] etekYan kesiri giysinin gercek genisligiyle uyusuyor mu; sisirdin mi?
  [ ] arka.yakaOrta tabani nape mi?
  [ ] Govde oturuyorsa PENS yazdin mi (ya da oturmayi saglayan dikisi)?
  [ ] Dugme yazdiysan altinda PAT var mi?
  [ ] arka.ogeler bos degil, en az kapama tasiyor mu?
  [ ] Ust dikis (kesikli) izlerini taradin mi?
  [ ] Her ic cizginin iki ucu da bir dikise/kenara dayaniyor mu?
  [ ] Ciktida hicbir moda terimi (yaka/kol/giysi adi) gecmiyor, degil mi?

Simdi bu giysinin okumasini JSON olarak yaz.`;
}
