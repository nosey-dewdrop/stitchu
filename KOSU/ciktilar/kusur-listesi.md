# G2-goz — kusur listesi (2026-09-02)

01-09 flat'leri gercek Etsy referanslarinin (GIRDI/iyi-flat/adaylar) yaninda
tek tek incelendi. Kapilar: `node engine/tests/cizim_giysi_mi.mjs` (a-k + g2)
ve `ctest -R 'golden|flat_mirror|manken_insan|edit_locality'` — hepsi YESIL.

## ONARILDI

### K1 — balon kol yatay "kanat" (02, 05) — EN KRITIK
- **Bolge:** kol. **Dosya:** `web/lib/flat-from-pattern.js` `sleeveGeometry`.
- **Ne yanlisti:** uzun balon kol neredeyse yatay aciliyordu (data-kol-aci 30.00,
  bandin tabani), omuzdan bilege tek kesintisiz diyagonal = Damla'nin "kanat"
  kusuru. Uzun DUZ kol (04) ayni Lf/Lu ile 36-38 dereceye sarkiyor ve dogru
  duruyordu.
- **Kok neden (CIZIM):** kolun aci tohumu kalibin kapanma ucgeninden geliyor;
  `cosPhi` formulunde etek-agzi genisligi Lh acisini SIGLASTIRIYOR. Balon kolun
  genis buzgulu mansedi (Lh 158 vs duz kolun 121) tohumu 20.6 dereceye cekiyor,
  o da 30 tabanina yuvarlaniyor. Manset genisligi bir STIL ekseni, sarkmayi
  belirlememeli.
- **Onarim:** taban artik kol UZUNLUGUYLA yukseliyor (Lf/Lh orani; kisa kolda
  ~1.9, uzunda 3.5+). Uzun kolda taban 38'e cikiyor (bilek kalca hizasina duser
  konvansiyonu), kisa kolda 30'da kaliyor. Band 20-40 sabit, kapi (j) etkilenmedi.
- **Sonuc:** 02, 05 artik 38 derece sarkiyor, uzun duz kardesiyle ayni. Duz kol
  (36-38 zaten) ve kisa kol degismedi.

### K2 — bel "kutusu" (01, 03, 04, 08, 09)
- **Bolge:** bel dikisi (beden-etek birlesim cizgisi). **Dosya:** ayni, ~satir 977.
- **Ne yanlisti:** beden bel dikisi HAM basiliyordu; her pens kapanmasi o kenarda
  bir kink birakir, cizimde ortada cukurlasan kirik yatay bir "kutu" olarak
  cikiyordu (etek ustunun smoothEdge'den once yasadigi ayni kusur).
- **Kok neden (CIZIM):** etek ustune smoothEdge (tek egri) uygulanmisti ama beden
  bel dikisine uygulanmamisti.
- **Onarim:** bel dikisi de artik `smoothEdge` ile tek egri. Iki uc nokta
  (yan kose + CF) byte-exact sabitleniyor, manken kazigi ve kapilar kimildamadi.

## ONARILMADI (durust liste)

### A1 — balon kol PUF hacmi yok (05, ve 02'de kismen)
- **Bolge:** kol. **Kok neden (KALIP):** cizim degil, motor eksigi. Balon kol
  sarkmasi artik dogru ama kolun kendisi duz koni; ust kenarda buzgulu puf
  KABARMASI cizilmiyor. CLAUDE.md zaten bunu biliyor: motorun eksigi "buzgulu
  ust katman operatoru" (Upper Sleeve, %29 buzgu). Kalip hatti bu operatoru
  uretmedigi icin cizim de basamaz. FAKE edilmedi (uydurma puf cizmek yasak).
- **Etki:** referans 04/10'daki kabarik puf gorunumu bizde yok; kol dogru sarkik
  ama "balon" degil "genis duz" okunuyor. Motor isi, cizim isi degil.

### A2 — 02 crew yaka CF'de kucuk centik + 05 vNeck derin/sivri
- **Bolge:** yaka cizgisi. **Kok neden (CIZIM/KONVANSIYON):** aynali iki yarim
  yaka egrisi CF'de teget uyusmadan bulusunca kucuk bir cusp (centik) kaliyor
  (02 crew'da hafif). 05'in vNeck'i derin ve sivri — ama bu KONVANSIYON GEREGI
  (contract: vNeck kendi derinligini korur, tavani 1.25 oran; musteri sectigi
  stil ekseni). vNeck'i sig crew'a kirpmak her yakayi crew yapardi.
- **Neden onarilmadi:** 02'deki centik cok kucuk (Etsy rafinda goze batmiyor);
  CF teget duzeltmesi poseBodice yaka geometrisine dokunur ve (g)/(k) yaka
  kapilarini riske atar — kazanci kucuk, riski buyuk. 05 vNeck by-spec, kusur
  degil. Ikisi de bilincli birakildi.

### A3 — bel dikisi CF'de hafif "V" inisi (01, 03, 08, 09)
- smoothEdge her yarimi temiz yay yapti ama iki aynali yay CF'de hafif acili
  bulusuyor, ortada nazik bir V inisi kaliyor. Fitted bel dikisi zaten CF'de
  biraz dususur; kirik kutu gitti, kalan inis dogal okunuyor. Birakildi.

## SON DEGERLENDIRME (kendi gozumle)
- **Raf-hazir:** 03, 06, 07, 08 (prenses en iyisi), 01 — Etsy vitrininde durur.
- **Iyilesti ama tam degil:** 02, 05 — kol sarkmasi duzeldi (kanat gitti), ama
  balon PUF hacmi yok (A1, motor isi). 05'in derin V'si by-spec.
- **04:** kol iyi sarkik; yatik yaka bebe-lob gibi cizilmis (flat collar sekli
  tartisilir ama kapidan gecti, kucuk).
- Genel: kanat ve kutu — iki en utandiran kusur — gitti. Kalan is motor tarafinda
  (puf operatoru), cizim tarafinda degil.

Once/sonra: `KOSU/ciktilar/goz-once-sonra.png`.

---

## TUR 1 ONARIM (2026-09-04) — KAPANANLAR VE ACIK KALANLAR

Bagimsiz denetci alti "satis-engelleyici" kusur yazdi. Uc tanesi kapandi,
biri kismen, ikisi ACIK ve gerekcesi asagida. Ayrica denetcinin iki kok-neden
hipotezi OLCUMLE CURUDU; dogrusu yazildi.

### KAPANDI

**K1 — Arkadan fermuar isteyene onden fermuar.** `web/js/prompt-parse.js`.
Kok neden: `exposedZip` ekseninin sozlukte UC degeri var (`none/centerFront/
centerBack`) ama ifade tablosu yalniz `centerFront`'u adlandiriyordu; yon
kelimesi ('back') serbest kelime kovasina dusuyor, eksen sessizce ilk degere
oturuyordu. Cozum tabloya kelime eklemek DEGIL, yapisal bir kural: bir eksen
Front/Back kardesi olan bir degere oturduysa, cumledeki tuketilmemis yon
kelimesi o eksenin isidir (`yonNiteleyiciBagla`). Olculdu, once/sonra:
- once: `exposedZip=centerFront`, anlasilmadi `[center, back]`
- sonra: `exposedZip=centerBack` (kelime "exposed zip center back"),
  anlasilmadi `[]`, hesap 14 token = 13 eslesen + 1 stop + 0 anlasilmayan.
Ayni cumledeki `gathered empire waist` de artik `skirtStyle=gathered`.
Kapi: `prompt_spec_check`, `expressability_check`, `vocab_source_check`,
`vocab_reference_check` — 4/4 PASS.

**K2 — Buzgulu etek cizime hic inmiyordu.** `web/lib/flat-from-pattern.js`.
Kok neden: `buzguOku` YALNIZ kolu olcuyor (kapak = sleeve_cap vs armhole,
etek = sleeve_hem vs cuff). Etek-bel dikisi hic olculmuyordu, cunku motorun
etek parcalari HIC edgeRoles tasimiyor (olculdu: `Skirt Front ||` — rol
listesi bos), rol tabanli olcum oraya uzanamiyordu. Cozum: ayni cinsten olcum,
geometriden — eteğin DIKILEN (pens kapanmis) bel kenari / bedenin dikilen bel
kenari, ayni esikle (`draft.gatherRatios.sleeveCapGathered` = 1.235). Olculdu
EU38 elbise: gathered ~1.43 (buzgu), aLine ~0.87 (buzgu degil). Cizimde ayni
tarak notasyonu (contract sevkPoz.buzgu.tarak, olculmus yogunluk), tikler
BUZULEN parcanin tarafinda = dikisin altinda ('asagi'). Sonuc: 12 tik x 2 yan
x 2 gorunum = 48 isaret, `data-buzgu="bel"` + oran + fazla-mm ile ilanli.
Kapi: golden, flat_mirror, flat_convention, cizim_giysi_mi, buzgu_katman,
flat_expresses_spec, flat_geometry_sellable, flat_sellable, flat_pattern_agree,
recipe_golden, recipe_dress_golden, vitrin_gercek — 12/12 PASS.

**K3 — Landing okunmuyordu.** `web/index.html`. Kok neden dogrulandi: sabit
gingham tuvalin (`#silk`) UZERINE dogrudan metin basiliyordu; sayfanin butun
kontrast sayilari (`--ink #1f3a5f`) BEYAZ zemine gore AA hesabiydi, desenli
zeminde o hesap gecersiz. Ayrica sus grafikleri `z-index:2`, metin z-index'siz
= sus metnin USTUNDE. Cozum: (a) hero metni sayfanin KENDI kart imzasina
(beyaz + 1px `--bb-line` + ayni golge) oturdu, (b) `.btn` z-index 1 +
pointer-events:none, (c) paylasilan header'a beyaz zemin + 1px alt cizgi
(desen uzerinde nav eriyor), (d) govde 14.5 -> 15px / 13 -> 14px ve ink
`--navy`. Kapi: `ios_zemin_check`, `vitrin_gercek_check` PASS; `site-health`
16 sayfa / 285 link / 0 kirik / tek surum.

**K4 (denetcinin "ek bulgu"su) — Ret ekrani gerekceyi konsola basiyordu.**
`web/js/render.js` + `web/js/i18n.js`. Motor hukmu ZATEN uretiyor ve wire'da
tasiyor (`bindings.cpp:344`, `issues[] = "[kural] Parca: ayrinti"`), ama UI
sadece `console.error`'a doküp genel bir cumle gosteriyordu. Alici konsol
acmaz. Artik ekranda, adiyla. Olculdu (bust 145 / bel 52 / kalca 170, tarayici,
CDP ile surulddu):
  "[proportion] A-line dress: waist 52 cm is implausibly small next to a
   145 cm bust — please re-check your measurements"
Ayrica olcu sihirbazinda kabul edilen aralik artik alanin ALTINDA, reddedilmeden
ONCE yaziyor (`create.measure.band`) ve input `type=number` + min/max tasiyor.
Sayilar yeni degil: `store.js MEASUREMENTS` tablosunun kendi min/max'i.
Olculdu: 8 adimin 8'inde band gorunuyor; kol boyu 185 adiyla reddediliyor ve
sihirbaz ILERLEMIYOR (denetcinin "sonuna kadar gittim ama kaydedilmedi"
gozlemi budur); 145/52/170/44/40/70/36 girildiginde localStorage'a AYNEN
yaziliyor. Ret ekraninda olu indirme dugmesi YOK (olculdu: ekrandaki dugmeler
["EN","TR","Change garment"]).

### ACIK — ve neden bu turda kapatilmadi

**A4 — 'Fitted' UST belde daralmiyor. (denetci kusur 3)**
Denetcinin hipotezi ("shaping ekseni yalniz PENS uretiyor, yan dikis EGRISI
uretmiyor") OLCUMLE CURUDU. Dogrusu daha basit ve daha kotu:
`engine/src/garment.cpp:63`, `extendPiece()`:

    // A waist dart's legs must sit on a seam edge; once the piece extends past
    // the waist there is no edge there, so the top goes boxy.
    result.markings.clear();

Yani beli gecen bir UST (topLength hip/tunic) icin motor `shaping=dart` olsa
bile BEL PENSLERINI SILIYOR. Olculdu, EU38 `top/crew/hip/straight.short`:
`Top Front` markings = `[]` (SIFIR pens), yan dikis x = 244.2 (koltukalti,
y=231) -> 244.4 (y=575), yani daralmak yerine 0.2mm GENISLIYOR. Cizilen siluet
profili: 244 / 250 / 247 — kutu. Karsilastirma, ayni govde ELBISE:
`Bodice Front` iki adet 25.05mm pens tasiyor ve cizilen siluet 244.2 (gogus)
-> 211.1 (bel) -> 228.0 (kalca), yani ELBISE BELDE DARALIYOR. Denetcinin
"fitted elbise daralmiyor" cumlesi elbise icin YANLIS, UST icin DOGRU.
Dogru cozum standart kaliphaneciliktir: beli gecen panelde bel pensi tek uclu
degil CIFT UCLU (fisheye/kontur) pens olur; ayrica uzatma egrisinin kontrol
noktasi olarak kullanilan bel noktasi gercek bir NOKTA olmali.
**Neden yapilmadi:** ikisi de KALIBI degistirir. `engine/golden-reference.csv`
(25116 satir) `top/.../hip` ve `.../tunic` hucrelerini bayt bayt pinliyor;
`golden_check.sh` bu durumda "INTENDED behavior change -> DECLARED re-pin ...
and get Damla's approval BEFORE pinning" diyor. Bu turda Damla'ya soru sormak
yasak, esik/kapi degistirmek yasak. Dolayisiyla kok sebep BULUNDU ve yeri tek
satira kadar yazildi; uygulanmasi ILAN EDILMIS bir golden re-pin karari.

**A5 — Bugra kaliginin AYNISI cikmiyor (%22-35 sapma). (denetci kusur 2)**
Acik. `KOSU/ciktilar/bugra-rapor.md` sapmalari zaten kendi yayinliyor. Kapanmasi
icin motorda BUGUN OLMAYAN eksenler gerekiyor: iki katmanli buzgu operatoru
(Upper Sleeve = %29 buzgulu dis katman), yakanin 'yatma yaricapi' ekseni, ve
mm hedefli ust boyu (topLengthMM). Ucu de yeni motor yetenegi = yeni kalip =
ayni golden re-pin kapisi. Tek turluk bir onarim degil, ayri bir insa.

**A6 — Ortada satilan bir sey yok (fiyat/sepet). (denetci kusur 6)**
Acik ve BILINCLI: reponun kendi kurali "bir prova dikilip yargilanmadan hicbir
seye fiyat konmaz". Bu bir kod kusuru degil, bir urun karari; tek tarafli
degistirilmedi.

**A7 — Buzgu, tarak notasyonundan oteye gecmiyor.** K2 dikisi adiyla ve
oraniyla isaretliyor (satici referanslarinin kullandigi notasyon budur), ama
`GIRDI/iyi-flat/adaylar/10-princess-a-line.png`'deki gibi bel dikisinden isin
gibi cikan KIRISIK cizgileri ve dalgali etek ucu YOK. Bunlar notasyon degil
illustrasyon; contract'ta olculmus bir kaynaklari yok, o yuzden uydurulmadi.
Kaynak olculmeden cizilmez.

**A8 — 'sweetheart' yaka sivri dar bir V olarak okunuyor.** Denetcinin
gozlemi dogrulandi (K2 turunda uretilen flat'te gorulur). Yaka konvansiyon
pozunun (`poseBodice`) isi; A2 ile ayni bolge ve ayni risk (yaka kapilari).
Bu turda dokunulmadi.
