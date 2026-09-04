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

---

## TUR 2 ONARIM (2026-09-04) — KAPANANLAR VE ACIK KALANLAR

Denetci urunu tarayicida kosturdu ve alti kusur bildirdi. Dordu kapandi ve
tarayicida dogrulandi; ikisi acik ve nedeni asagida sayiyla yazili.

### KAPANDI

**K-T2.1 — cumle yanlis okunup 'okudum' deniyordu. (denetci kusur 1)**
Olculdu: `fitted dress with a back zipper` -> BASARI satiri
`fitted -> sleeveStyle: straight`. Istenmeyen duz kol ekleniyor, istenen
fermuar dusuyordu. `zipper at back` / `back zip dress` /
`arkadan fermuarli elbise` / `invisible zipper center back` -> 0 fermuar.
Iki ayri kok sebep bulundu, ikisi de kaynagindan kapatildi:
- `fitted` ifade tablosuna bir KOL es anlamlisi olarak yazilmisti. Artik
  yalniz cumlede bir kol ekseni varken kola baglanir (`long fitted sleeves`);
  yalniz bastaysa asagidaki ZATEN kanalina duser.
- Fermuar kelimeleri hicbir eksene inmiyordu, cunku ISTENEN SEY ZATEN
  CIZILIYOR ve parser onu bilmiyordu. Motor ciktisindan olculdu (varsayilan
  elbise, `engine/dist`): `pieces[Bodice Back].closure ===
  "invisible zipper (center back)"`, rehber adimi "Insert an invisible zipper
  in the center back", ve `Shaping::Dart` varsayilan olduğu icin Bodice Front
  iki bel pensi tasiyor. Yeni `zaten` kanali bu kelimeleri adiyla okuyup
  "zaten var" der; etek/ustte tersini durustce soyler ("bu giysinin fermuari
  yok"). Sozluge tek eksen/deger/ifade eklenmedi, `engine/vocab.json` bayt
  bayt ayni.
- Ayrica: `contract/vision-tasima-v1.json` `gorunurFermuar` kurali
  `(exposed|visible|...)` sinirsiz alternatifiyle **INVISIBLE** zipper'i
  'visible zip' diye eslesiyordu — gizli fermuar isteyene GORUNUR tasarim
  fermuari cikiyordu, tam tersi giysi. `\b` ile sinirlandi.
Tarayicida dogrulandi (EN create.html): "you already have it: back zipper —
already drawn: the dress closes with an invisible center-back zipper ...".

**K-T2.2 — canli sitede landing onarimi yoktu. (denetci kusur 2)**
Denetcinin hipotezi ("pushlanmamis") dogruydu ama YARIMDI: push edilse bile
YAYINLANAMAZDI. Olculdu: `gh run list --workflow=pages.yml` — 27 Agu'dan beri
HER kosu `failure`. Kok sebep, reponun kendi yasakladigi sey: **OLU HAT OLCEN
BIR KAPI.** `size-coverage-check.mjs` `web/atolye.html`'in kendi `draw()`'unu
kosuyor; `9483ba53` (2 Eyl) o sayfayi bilerek sildi (2027 satir). Kapi
olcemedigi seye dogru olarak yesil demedi ve sonsuza kadar `exit 2` verdi,
boylece TUM deploy hatti kapali kaldi. Kapinin kendisi ve yasasi
DEGISTIRILMEDI (dosya bayt bayt ayni); `pages.yml` adimi kapiyi konusu
SEVK EDILDIGINDE kosar, edilmediginde sevk edilen yuzeyi olcen kapiyi adiyla
soyler (`edge_case_supurme_check`, 10 beden EU34..EU52, issues 0).
Sonuc olculdu: kosu `success` (33822728592), canli `index.html` 77.634 ->
79.632 bayt, `web/index.html` ile **bayt bayt ayni**, hero metni beyaz okuma
karti uzerinde (ekran goruntusu alindi).

**K-T2.3 — Ingilizce arayuzde Turkce hata mesaji. (denetci kusur 3)**
Kok sebep: `anlasilmadi[].oneri` metinleri `prompt-parse.js` icinde TEK DILDE
sabit yaziliydi ve i18n katmanindan gecmiyordu; ayrica alici yuzeyine
`contract/primitives-v1.json` repo yolunu siziyordu. Her rapor cumlesi artik
kaynaginda IKI DILDE kuruluyor (`rapor(kelime, tr, en)`) ve `getLang()` ile
basiliyor; repo yolu hem bu dosyadan hem contract'in `bilinmeyen` metninden
kaldirildi. Ayrica: contract'in ZATEN cozdugu bir kelimeye harf-mesafesi
tahmini basiliyordu — `buttons` icin "en yakin primitif: op.extend" yazarken
ayni cagri onu `buttonRow` eksenine baglamisti; simdi contract'in cevabi
basiliyor. Tarayicida dogrulandi: "'gathered' is a word I know, but on its
own it does not say which detail you mean; try: gathered sleeve / ...".

**K-T2.4 — baslik ve dosya adi cizimle celisiyordu. (denetci kusur 5)**
Kok sebep motorda: `garment.cpp` giysi adini yalniz `SleeveStyle`'dan
(siluet ekseni) okuyor, `SleeveCap`'ten (tac ekseni) okumuyordu; iki eksen
ayni parcayi anlatiyor, ad birini goruyordu. `SleeveBlock::titleWord()` artik
parca adinin kullandigi TEK kaynak. Olculdu (yeniden derlenmis wasm):
`puff -> "gathered puff-sleeve dress"` + parca `Puff Sleeve`;
`plain -> straight-sleeve`, `balloon -> balloon-sleeve`,
`sleeveless -> "gathered dress"`. Dosya adlari ayni kaynaktan turedigi icin
onlar da duzeldi. `ctest -R golden` 3/3 PASS (isim golden CSV'de degil).

### ACIK — ve neden bu turda kapatilmadi

**A9 — Katmanli etek genislemiyor. (denetci kusur 6) — KOK SEBEP BULUNDU,
KALIPTA, VE SAYISI KAYNAKSIZ.**
Denetcinin gozlemi olculerek dogrulandi: K3'un dort katmaninin DORDU de
x-acikligi **479.40 mm** ile ciziliyor — hicbir genisleme yok.
Denetcinin hipotezi ("buzgu notasyon olarak basiliyor, silueti etkilemiyor")
YARIM cikti. Cizim gercekten katmani etegin KENDI egiminden turetiyor ve duz
etekte o egim 0, ama asil sorun daha derinde:
- `engine/src/ruffle.hpp` modeli ILAN EDIYOR: "tier i attaches to tier i-1's
  bottom edge, so its edge is edge x fullness^(i-1) and its cut length
  edge x fullness^i". Yani BITMIS etek ucu cevresi katman basina carpiliyor.
- `engine/constants.yaml ruffleFullnessDefault = 2.5`, `status: assumed`,
  kaynagi "hem ruffle default gather ratio" — yani TEK bir firfir seridi icin
  secilmis bir sayi. `ruffle.cpp draftTiers` onu `edge *= fullness` ile UC KEZ
  BILESIK uyguluyor.
- Sonuc, motorun kendi kesim talimatlarindan okundu: tier 1 total **2397 mm**,
  tier 2 **5993 mm**, tier 3 **14981 mm**. Bitmis etek ucu cevresi
  958.8 x 2.5^3 = **15 metre**. Bu bir giysi degil.
- DENENDI VE GERI ALINDI: cizim motorun ILAN ETTIGI sayilara oturtuldu
  (katman x-aciklklari 479 -> 1198 -> 2996 -> 7490 mm). Cizim genisledi ama
  `viewBox` 15151 mm oldu ve ekranda BOS SAYFA cikti. Bozuk bir resmi daha
  bozuk bir resimle degistirmek olurdu, o yuzden siluet elle GERI ALINDI.
- Dogru onarim katman basina bir oran (gercek kademeli eteklerde ~1.3-1.6)
  ister; o sayinin `engine/constants.yaml` icinde KAYNAGI yok ve bu turda
  uydurulmadi (CLAUDE.md: "patternmaking sayilarini tahmin etme").
- BU TURDA YINE DE KAPANAN PARCA: cizim, katmanin acik cevresi diye TEK
  SERIDIN kutusunu (1198.50 mm) okuyordu; gercek acik cevre serit sayisiyla
  carpilmis toplamdir. Ilan edilen `data-katman-buzgu-orani` bu yuzden
  tier 2'de **1.25** yaziyordu, olcusu **6.25** iken — alicinin gordugu
  dolgunluk besde bir kadar EKSIK BEYAN EDILIYORDU. Artik motorun kendi
  "(total N mm)" sayisi okunuyor: 2.50 / 6.25 / 15.62. Siluet degismedi,
  BEYAN duzeldi ve kalibin kacikligi artik cizimde GORUNUYOR.

**A6 (yineleniyor) — Ortada satilan bir sey yok. (denetci kusur 4)**
Hala acik ve hala bilincli. Denetci hakli: gorevin cumlesi "satilir flat" ve
bugun urun ucretsiz bir demoyla bitiyor. Ama fiyat, sepet, odeme ve teslimat
bir kod kusuru degil bir URUN KARARIDIR: hangi fiyat, hangi lisans, hangi
saglayici, hangi iade. Bir onarim ajaninin bunlari tek tarafli uydurmasi,
reponun kendi kuralini ("bir prova dikilip yargilanmadan hicbir seye fiyat
konmaz") ve kok kurali (bosluğu bir yonle doldurma) birden cignerdi.
Kapanmasi icin gereken tek sey bir SAYI ve bir SAGLAYICI karari.

**A10 — `flat_artifact_census` kirmizi (ONCEDEN kirik, bu turda degil).**
`FAIL [3 C1] 2 nokta teget farki 1 dereceyi asiyor`. Bu turun degisiklikleri
`git stash`'lenip kapi yeniden kosuldu: AYNI kirmizi. Yani gerileme degil,
devralinan bir kirmizi; bu turda dokunulmadi ve gizlenmedi.

---

# TUR 3 ONARIM (2026-09-04) — hakem hukmu "BITMEDI / ALMAZDIM"

Hakemin 6 kaleminden 4'u kapandi, 2'si acik. Acik olanlarin gerekcesi asagida;
"zaman yetmedi" bir gerekce degildir, o yuzden her kalemde neyin BENIM kararim
olmadigi ya da hangi onceki hakem kararinin yolu kapattigi yazili.

## ACIK KALDI

### T3-2 — ORTADA SATILAN BIR SEY YOK (fiyat / sepet / odeme / teslimat)
- **Yer:** `web/index.html:237` ("no price on this site yet"), site genelinde
  8 "Waitlist" + 2 "Join the Beta", 0 fiyat, 0 checkout.
- **Olcum:** `grep -rniE "stripe|checkout|gumroad|lemonsqueezy|paddle" web/ backend/`
  -> tek eslesme `index.html`'deki CSS `stripe` degiskeni (dama deseni). Yani
  odeme altyapisi repo'da HIC YOK, bayat/yarim degil.
- **Neden onarilmadi — bu bir KOD isi degil:** calisan bir kasa icin (a) bir
  saticinin (Damla'nin) adina acilmis bir merchant hesabi ve canli API anahtari,
  (b) bir fiyat, (c) mesafeli satis / iade / KVKV metinleri gerekiyor. Ucunun de
  sahibi Damla. Ajan olarak:
  - **Fiyat UYDURAMAM.** Bu repo'nun her sayisinin bir kaynagi var; fiyat
    Damla'nin karari, benim tahminim degil.
  - **Sahte "Satin al" dugmesi KOYAMAM.** Hicbir yere gitmeyen bir kasa, kasa
    olmamasindan beterdir (bu dosyanin ve CLAUDE.md'nin kendi yasasi).
  - Anahtarsiz, `STRIPE_*` env'i arkasina saklanmis bir entegrasyon yazmak da
    canli sitede hicbir seyi degistirmezdi — yani hakemin hukmu aynen kalirdi.
    "Is yapiyormus gibi gorunen" tam olarak budur.
- **SONRAKI ADIM (Damla'nin karari):** tek soru — bu paket kaca satiliyor ve
  hangi saglayiciyla? O iki cevap gelince kod tarafi kucuk: bir fiyat sabiti +
  Stripe Payment Link / Checkout Session + basari sayfasinda indirme kilidi.

### T3-4 — BUGRA PARITESI (Top Back %31, Puff Sleeve %35, Collar %22)
- **Yer:** `KOSU/ciktilar/bugra-rapor.md` (uretici: `node engine/tools/bugra-blind-compare.mjs`).
- **Bu turdaki olcum (yeniden kosuldu):** Top Front 1755 vs 1686 (%4) · Top Back
  1669 vs 1275 (%31) · Puff Sleeve 1177 vs 873 (%35) · Collar 692 vs 568 (%22).
  Chamfer ortalamalari bu turda BIR TIK IYILESTI (Top Front 37.0 -> 36.5,
  Top Back 47.7 -> 47.4, Puff Sleeve 89.9 -> 60.4) ama sapma sinifi duruyor.
- **Neden onarilmadi:** sapmanin govdesi yan dikiste degil, uc YAPI farkinda ve
  ucu de raporun kendi "motorun cizemedigi Bugra yapilari" kovasinda ADIYLA
  duruyor: (a) Bugra'nin Upper Sleeve'i ayri bir %29-35 buzgulu DIS KATMAN,
  motorda ikinci katman doguran operator yok; (b) on govdede buyume-yakali
  (grown-on) temizleme payi var, motor ayri facing parcasi ciziyor; (c) ayri
  yaka astari parcasi. Bunlar cevreyi dogrudan buyutur/kucultur.
- **Kalan kalem (on/arka bust bolusumu, on 244.2 / arka 224.8 mm) bir ONCEKI
  HAKEM KARARIYLA KAPALI:** rapordaki durum satiri aynen "hakem K5: SIMDI
  DOKUNMA, kendi fazini hak ediyor (butun bloklari oynatir, 8 bedende
  once/sonra ister)". Bir onarim turunda tek basima o karari bozmadim.
- **On/arka oyuk isaret ihlali 18.4 -> 22.5 mm** bu turda DEGISMEDI (22.5 mm
  girdi, 22.5 mm cikti); onceki turun K1/K4 duzeltmesinden geliyor ve regresyon
  cizgisi olarak ilan edilmis durumda.

### T3-EK — INDIRILEN DIKIS REHBERI TURKCE ve 0 GORSEL
  (hakemin gerekcesinde var, 6 numarali kusur listesinde yok — yine de yaziyorum)
- **Yer:** `web/lib/rehber-tr.js`, `web/js/create.js:1379`. Dosyanin adi bile
  `-tr`: rehber TEK DILDE yazilmis. `grep -c '<img|<svg'` = 0.
- **Kok sebep:** rehber metinleri `web/js/guide-tr.js`'te ID basina TURKCE
  sablon; Ingilizcesi motorun kendi `guideSteps` cumlesi (ekranda o basiliyor).
  Yani EN metin VAR, indirilen sayfa onu kullanmiyor. Gorseller ise hic yok:
  rehberde adim basina bir cizim uretecek bir kod yolu bulunmuyor.
- **Neden bu turda yapilmadi:** rehberin iki kapisi var
  (`rehber_kaynak_check`, `uctan_uca_check`) ve ikisi de basilan BAYTLARI
  yargiliyor; dili ikiye ayirmak sablon tablosunu, kapilari ve
  `guide_completeness_check`'in "kaynaksiz cumle 0" yasasini birlikte
  tasimayi gerektiriyor. Yarim yapilirsa kaynaksiz cumle uretir — bu repo'da
  en yasak sey. Tek turda oteki alti kalemle birlikte guvenle yapilamazdi.
- **SONRAKI ADIM:** `rehberHTML`'e `dil` parametresi (i18n.js'in mevcut
  `tr/en` anahtarini kullanir), her sablona `en` ikizi, kapiya "her ID iki
  dilde ayni sayilari basiyor" yargisi. Gorseller ayri ve daha buyuk bir is:
  adim basina cizim, `flat-from-pattern.js`'in parca cizicisinden turetilebilir.

## KAPANDI (kanit gate ciktilariyla, ana raporda)

- **T3-1** onden fermuar -> `web/js/prompt-parse.js` M7-yon (exposedZip:centerFront)
- **T3-3** katmanli etek -> `engine/src/ruffle.cpp` (katman orani = fullness^(1/tiers))
          + `web/lib/flat-from-pattern.js` (katman ilan ettigi cevreye cizilir)
          + `engine/src/hemflounce.cpp` (volan tutundugu kenara gore kesilir)
- **T3-5** 'fitted' kol sekline baglanmasi -> `prompt-parse.js` M7-mesafe
- **T3-6** fitted belde daralmiyor -> `engine/src/garment.cpp extendPiece`
          + `engine/src/bodice.cpp` prenses yan paneli (+ ILAN EDILMIS golden re-pin)
