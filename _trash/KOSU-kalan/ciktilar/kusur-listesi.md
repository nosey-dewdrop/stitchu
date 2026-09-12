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

---

## TUR 4 ONARIM (2026-09-04) — KAPANANLAR VE ACIK KALANLAR

Bagimsiz denetci alti kusur yazdi (dordu satis-engelleyici, ikisi gorunur).
Dordu KAPANDI, biri KISMEN, biri urun karari oldugu icin ACIK.
Kapi ciktilari ana raporda; asagisi kok sebep + kalan.

### KAPANDI — K2 pens havada duran cizik (denetci kusur 2)
- **Yer:** `web/lib/flat-from-pattern.js` (`pensiDikiseOturt`, buildView icinde).
- **Kok sebep OLCULDU, hipotez degil.** Denetci "pens tek cizgi cizilmis,
  konvansiyon ince kapali V ister" dedi. Referans OLCULDU ve hipotez CURUDU:
  `GIRDI/iyi-flat/adaylar/13-yuksek-bel-a-line.png` on bedeninde pens TEK
  cizgidir (yari basina bir tane), V degil. Yani cizgi sayisi degil, cizginin
  NEREDE BITTIGI yanlisti: pens agzi, pens kapanmasinin biraktigi KINK'in
  ustunde duruyor, cizilen bel dikisi ise o kinki temizleyen egri
  (`smoothEdge`, G2-goz/K2). Olculen bosluk, EU38 'gathered mini' elbisede:
  on pensler **9.14 / 6.03 mm**, arka pensler **5.51 / 4.47 mm**. Etek
  pensleri daha kotu: onlarin agzi etegin KENDI ham ust kenarinda ve o kenar
  bir elbisede HIC CIZILMIYOR.
- **Onarim:** bacak kendi ekseninde (apeks -> agiz) uzatilip cizilen dikisle
  KESISTIRILIYOR; kesisim yoksa en yakin nokta izdusumu; ikisi de yoksa bacak
  oldugu gibi kalir ve sebep `cizilemeyen:` yorumuna yazilir.
- **Kanit:** ayni iki spec'te olculen bosluk **0.00 mm** (8 pensin 8'i).
  Kemerin kasten kisalttigi bacak (wbDepth) dokunulmadan birakilir.
- **KAPI:** `node engine/tests/cizim_giysi_mi.mjs` (a)-(k)+(g2) YESIL.

### KAPANDI — K1a balon kol "kagit ucak kanadi" (denetci kusur 1, kol yarisi)
- **Yer:** ayni dosya, kol blogu (`innCiz` / `balonKabarmaMM`).
- **Kok sebep OLCULDU:** motor `Balloon Sleeve` + `Sleeve Cuff` basiyor,
  `buzguOku` etek buzgu oranini **1.8005** olarak OKUYOR — ama cizim manset
  cizgisini kolun kendi genis etek yarisina (**169.45 mm**) basiyordu.
  Mansetin gercek bitmis yarisi **94.12 mm**. Manset kolla ayni genislikte
  cizilince balon kolun tek tanimlayici ozelligi (bilekte kisilmesi) silinir
  ve geriye duz kama kalir. Oran zaten olculuyordu, cizime hic uygulanmiyordu.
- **Onarim:** etek kosesi mansetin bitmis yarisina cekildi; koltukalti konturu,
  olculen buzgu fazlasi kadar (**Lh - Lc = 75.34 mm**) katlama cizgisinden
  UZAGA kabartildi, tepesi buzgunun oldugu ucta (manset) — kapak buzgusundeki
  yasanin aynisi, aynalanmis profil. Hicbir genislik secilmedi.
- **Kanit:** cizimde `data-manset-yarim-mm="94.12"`,
  `data-kol-etek-yarim-mm="169.45"`, `data-balon-kabarma-mm="75.34"`.
  Gorsel: `KOSU/ciktilar/02-elbise-balon-uzun-kol-dik-yaka.png`,
  `05-ust-balon-uzun-kol.png` (yeniden uretildi).

### KAPANDI — K1b buzgulu etek "ucgen koni, tek drape cizgisi yok"
- **Yer:** ayni dosya (`DOKUM_X_ORAN` / `DOKUM_BASLANGIC`) +
  `contract/flat-convention-v1.json sevkPoz.buzgu.etekDokumu`.
- **Sayilar UYDURULMADI, referanstan OLCULDU** (tarak yogunlugunun olculdugu
  yontemin aynisi): `GIRDI/iyi-flat/adaylar/08-empire-buzgu-etek.png`,
  1050x1400 px, gorunus A on etegi, pencere x 40-470 / y 240-760, esik
  luma<128. Her satirda siluet kenarlari bulundu, ic cizgi gruplari cikarildi,
  on orta dikeyi haric tutuldu. Sonuc: **yari basina 3 cizgi**, x konumlari
  yari-genisligin **0.19 / 0.40 / 0.66**'si (etegin %70, %80, %90
  derinliginde AYNI, +-0.02), baslangic derinlikleri **0.41 / 0.56 / 0.63**,
  ucu de etek ucuna iniyor.
- **Yalniz OLCULEN buzguda cizilir:** kosul `out.notes.buzguBel`, yani etek
  bel kenari / beden bel kenari >= 1.235 (contract gatherRatios). A-line ya da
  duz etek tek cizgi almaz — denetci hakli bir sekilde "her flat'e susleme"
  koymamizi istemiyordu.
- **Cizgi silüetin O YUKSEKLIKTEKI kendi yari-genisliginin kesridir**, sabit
  bir egri degil; etek genisledikce cizgiler de acilir.

### KAPANDI — K3 flat sonuc ekraninda yok (denetci kusur 3)
- **Yer:** `web/js/create.js` (`flatKarti`), `web/css/app.css` (.flat-panel),
  `web/js/i18n.js` (create.flatcard.*).
- **Kok sebep:** sonuc ekrani kalip merkezli kuruldu; flat cikti listesine bir
  DOSYA TURU olarak eklendi, render hattina hic baglanmadi.
- **Onarim:** sonuc ekraninda, indirme dugmelerinin USTUNDE, "What you are
  about to cut" karti. Cizim ayni `flatSVG()` cagrisidir — ikinci bir kalem
  yok, indirilen dosyayla ayni baytlar. Cizim reddederse (`cizilemeyen:`)
  sebep kartin altina basilir, kart sessizce kaybolmaz.
- **Kanit (tarayicida kosuldu, CDP, 127.0.0.1:8931):** iki promptta da
  `.flat-panel` var, icinde 1 SVG, konsol hatasi 0.
  Ekran goruntusu alindi ve GOZLE bakildi.

### KAPANDI — K5 baslik alicinin cumlesiyle celisiyor (denetci kusur 5)
- **Yer:** yeni `web/lib/baslik.js` + `web/js/create.js draftedTitle`.
- **Kok sebep OLCULDU (motor kaynagi):** `engine/src/garment.cpp:748-757`
  basligi `title(spec.skirtStyle) + sleeveWord + "dress"` diye kuruyor — yani
  SADECE iki eksenden. O iki eksen secilmemisse motorun VARSAYILANI ("A-line",
  "straight-sleeve") baslikta bir IDDIA olarak basiliyordu; alicinin acikca
  yazdigi wrapFront / skirtLength / exposedZip / collarType / topLength
  eksenleri ise basliga hic girmiyordu.
- **Yasa:** baslik yalnizca kaynagi `soruldu` (alici yazdi/secti) ya da
  `gorulen` (fotografta okundu) olan ekseni tasiyabilir; `cikarildi` (host
  default) ve `zorunlu` (dikilebilirlik) BASLIGA GIREMEZ. Kelime de
  uydurulmaz: once alicinin KENDI kelimesi, sonra menunun etiketi, sonra
  eksen degerinin insan hali. Sira alicinin kendi cumle sirasidir.
- **Once / sonra (canli hattan olculdu):**
  - `long sleeve maxi wrap dress ... knit fabric, deep v neckline`
    "A-line straight-sleeve dress" -> **"Long sleeve maxi wrap dress with
    knit, v neckline"**
  - `a top with a zipper at the front and a peter pan collar`
    "Cropped top" -> **"Top with zipper front, peter pan"**
  - `fitted gathered midi dress with puff sleeves`
    "A-line puff-sleeve dress" -> **"Midi dress with puff sleeves"**
  - `a dress with a gathered skirt and balloon sleeves, mini`
    -> **"Dress with gathered skirt, balloon, mini"**
- Ayni baslik dosya adina, A4 kapagina ve rehbere de gider (tek kaynak).

### KAPANDI — K6 "not understood" gurultusu (denetci kusur 6)
- **Yer:** `web/js/prompt-parse.js` (`eksenAdiYut` + komsu-eksen cumlesi).
- **Kok sebep, iki ayri sey:**
  1. `P` tablosu ekseni STIL kelimesiyle tasiyor ('knit', 'peter pan'), eksenin
     KENDI adiyla degil. Cumledeki 'fabric' / 'collar' / 'sleeves' kelimeleri
     hicbir ifadeye ait olmadigi icin artik kaliyor ve dogrudan "en yakin
     primitif" cikmaz sokagina dusuyordu — karsiligi AYNI satirda okunmusken.
  2. Okunmus bir ifadenin yanindaki sifat ('deep') `enYakinPrimitif`'e
     dusuyordu; o olcu METIN yakinligidir, anlam degil, ve "closest thing I
     can draw is the edge" gibi sacma bir oneri uretiyordu.
- **Onarim, TABLOYA HICBIR KELIME EKLEMEDEN:** (1) artik kelime bir spec eksen
  ADINI karsiliyorsa (`collarType` -> collar|type, `fabric` -> fabric) VE O
  EKSEN ZATEN OKUNDUYSA, kirmizi "anlamadim" degil notr "you already have it"
  satiri olur; okunmamis eksenin adi hala kirmizidir. (2) komsusu okunmus bir
  artik icin cumle komsudan turer: "I read neckline from 'v neckline' next to
  it; there is no separate dial for 'deep'".
- **Once / sonra (canli hattan):** `long sleeve maxi wrap dress ... deep v
  neckline` -> kirmizi satir **4 -> 3** (kalan ucu de eyleme donuk: tie ->
  tieClosure ekseni, waist -> "gathered waist yaz", deep -> ayri kadran yok);
  `a top with a zipper at the front and a peter pan collar` -> kirmizi satir
  **2 -> 0**; `a dress with a gathered skirt and balloon sleeves, mini` ->
  **1 -> 0**.
- **KAPI:** `node engine/tests/prompt_spec_check.mjs` GREEN.

## ONARILMADI (durust liste, T4)

### T4-4 — ORTADA SATILAN BIR SEY YOK (denetci kusur 4)
- **Durum bir onceki turdan AYNEN gecerli** ve o turun gerekcesi bu dosyada
  yukarida duruyor: fiyat UYDURULAMAZ (Damla'nin karari), hicbir yere gitmeyen
  sahte bir "Satin al" dugmesi kasa olmamasindan beterdir, anahtarsiz bir
  Stripe iskeleti de canli sitede hicbir seyi degistirmez.
- Ayrica site bunu artik ACIKCA ILAN EDIYOR (`web/index.html`: "no price on
  this site yet: nothing gets a price before a toile is sewn and judged").
  Bir ajanin tek basina bozabilecegi bir cumle degil.
- **SONRAKI ADIM (tek soru, Damla'nin karari):** bu paket kaca satiliyor ve
  hangi saglayiciyla? Cevap gelince kod tarafi kucuk: fiyat sabiti + Stripe
  Payment Link + basari sayfasinda indirme kilidi.

### T4-1c — ETEK UCU DALGASI (festoon) CIZILMEDI
- Referans 08'de buzgulu etegin ucu DALGALIDIR ve bunu cizmedim.
- **Gerekce:** etek ucu, kalip tarafindaki (g)/(g2) kapilarinin milimetresiyle
  olctugu kenardir. Onu dalgalandirmak cizimi guzellestirirken OLCULEN bir
  kenari oynatir. Susleme ugruna olculen bir kenari kimildatmak bu deponun
  yasagi. Karar contract'a da yazildi (`etekDokumu._cizilmeyen`).
- **SONRAKI ADIM:** dalga, siluet konturunun degil ayri bir `dokum` yolunun
  ustune cizilirse kapilara dokunmadan eklenebilir; o zaman dalga sayisi da
  ayni referanstan olculur (kivrim basina bir dalga).

### T4-1d — BALON KOLUN DIS KONTURU HALA DUZ
- Balon kolun katlama cizgisi (dis siluet) S -> out duz cizgisidir; kolun
  kabarmasi yalniz koltukalti tarafinda. Referans 04/06/09'da lob iki taraflidir.
- **Gerekce:** katlama cizgisi kolun KENDI olculen boyudur (Lf) ve onu
  kabartmak icin bir kaynak sayi YOK — kapak buzgusu olculdugunde (bz.kapak)
  zaten kabartiliyor, balonda kapak buzgusu OLCULMUYOR (motorun balon kolu
  kapakta degil etekte buzuyor). Uydurma genlikle kabartmadim.
- **SONRAKI ADIM:** motor tarafi — balon kol kapaginda da olculebilir bir
  buzgu varsa `sleeve_cap` kenari uzun cizilmeli; o zaman mevcut `yay`
  operatoru hicbir yeni sayi olmadan lobu basar.

### T4-EK — ONCEDEN KIRMIZI, BENIM DEGIL: flat_artifact_census
- `ctest -R flat_artifact_census` KIRMIZI: "[3 C1] 2 nokta teget farki 1 dereceyi
  asiyor". Bu kapi 3B kabuk hattini (`shell-flat`) olcuyor, etiketi
  ARASTIRMA_HATTI_SEVK_DISI, ve bu turda degistirdigim hicbir dosyaya
  bakmiyor. DOGRULANDI: `web/lib/flat-from-pattern.js` stash'lenip HEAD haline
  dondurulunce AYNI iki ihlalle AYNI sekilde dusuyor. Yani devraldigim kirmizi.

### T4-EK2 — generated_ratchet_check ONCEDEN KIRMIZIYDI, MUHURLENDI
- `contract/generated-paths.sha256` `engine/golden-reference.csv` icin
  2a2f5dad… ilan ediyordu, HEAD'de commitli dosyanin sha'si 70895ffa…
  (yani bir onceki tur goldeni yeniden uretip manifesti ayni commit'e
  koymamis). Dosyaya DOKUNMADIM; yalnizca manifest, commitli baytlara
  yeniden muhurlendi (`--accept`) ve `golden_check` zaten yesildi.

---

# T5 — BAGIMSIZ DENETCI TUR 5, ONARIM TURU (2026-09-04)

Denetci hukmu: BITMEDI / ALMAZDIM. Alti kusur. Asagida her biri, kok sebebiyle
ve kanitiyla. Kanit = kosulan komut ve ciktisi, "baktim iyiydi" degil.

## ONARILDI

### T5-1 — CANLI SITEDE FOTOGRAF YOLU OLUYDU (satis engelleyici)
- **Bulgu:** gercek Chrome ile create.html'e fotograf yuklendiginde /api/analyze'a
  SIFIR istek gitti, ekrana `Cannot read properties of undefined (reading 'then')`
  basildi. O sirada 8 JS kapisinin 8'i de yesildi.
- **KOK SEBEP, OLCULDU (tahmin degil):** Cloudflare'in kendi `api.js`'i indirilip
  okundu — `execute:function` govdesindeki HER dal ciplak `return;` ile bitiyor,
  yani `turnstile.execute()` HICBIR SEY DONDURMEZ. `analyze.js` uzerine `.then`
  yaziyordu, o yuzden her fotograf yuklemesinin ILK isi TypeError atmakti. Bu
  hicbir zaman calismamis bir yol: 600010'a da, adblock'a da bagli degil.
  Gercek tarayicida dogrulandi: `execute()` -> `typeof undefined`, `hasThen=false`.
- **ONARIM:** token artik `render()`'in `callback` / `error-callback` /
  `timeout-callback` secenegiyle aliniyor; `render()` undefined donerse okunabilir
  bir ret ciliyor ve widget bir sonraki denemede yeniden kuruluyor.
- **KAPI (yeni):** `engine/tests/foto_yolu_check.mjs`, ctest'e bagli. Iki yarim:
  statik kaynak + GERCEK Chrome'da sevk edilen `analyze.js` modulu, gercek
  Cloudflare test sitekey'i, /api/analyze'i dinleyen yerel sunucu.
  Kosuldu: `gercek tarayici fotografi gecirdi: OK garment=dress px=1024x658 ·
  /api/analyze tam 1 kez cagrildi · istek turnstile token tasiyor (21 karakter) ·
  kucultulmus JPEG gonderildi (9848 base64 bayt)`.
- **MUTASYON KANITI:** eski `.then` bicimi geri konuldugunda kapi denetcinin
  cumlesini birebir basiyor: `THREW Cannot read properties of undefined
  (reading 'then')` + `/api/analyze HIC cagrilmadi`. Kapi olu hat degil.
- ⚠ **GERI CEKILEN IDDIA:** ilk olcumde "display:none host challenge'i hic
  cozmuyor" cikti (3 sn sonra getResponse undefined). Ayni kapiya display:none
  MUTASYONU sokulunca kapi YESIL kaldi — callback yoluyla token 45 sn icinde
  geliyor. Ilk olcum erken okumaydi; iddia DOGRULANMADI ve kapida bir kural
  olarak DURMUYOR. Host yine ekran disinda tutuluyor ama bu bir yasa degil.
- ⚠ **CANLIDA DOGRULANMADI:** onarim yerelde kanitlandi; canli sitede
  gecerli olmasi icin deploy gerekiyor (bu turda push yok). Denetcinin gordugu
  `600010` sitekey/hostname baglantisi ayrica DOGRULANMADI — ama artik o hal
  bile ham yigin izi degil, okunabilir bir ret uretiyor.

### T5-2a — KATMANLI ETEK ILAN ETTIGI BOYU ASIYORDU (satis engelleyici)
- **Bulgu:** `a maxi tiered skirt` -> Front paneli 912 mm (maxi'nin TAMAMI) ve
  ONUN ALTINA 104+104+102 mm kademe. Dikilen giysi belden 1222 mm: yerde
  suruyor. Cizim de bunu dogru gosteriyordu (tam boy koni + abajur).
- **KOK SEBEP:** `engine/src/garment.cpp` firfir blogu etegin hemine EKLIYOR,
  hicbir yerde boydan DUSMUYORDU. Kademeli etekte kademeler boyu BOLER.
- **ONARIM:** `GarmentDrafter::draft` artik firfir acikken etek boyunu
  `kademe x derinlik` kadar kisaltiyor; rezerv kalca cizgisinin (skirt.hpp
  `hipDepth`) altina inemiyor, dayanirsa kademe derinligi kisaliyor ve kisalma
  dikis rehberine SAYIYLA yaziliyor. Yeni sabit yok — iki sayi da zaten vardi.
- **KAPI:** `tiered_ruffle_check` hukmu SERTLESTIRILDI (gevsetilmedi): eski hali
  "tiers acikken butun parcalar bayt bayt ayni" diyordu ve tam da bu kusuru
  muhurluyordu. Yeni hali (a) etek disi her parca bayt bayt ayni + (b) etek
  paneli TAM OLARAK kademelerin kapladigi kadar kisa. Kosuldu:
  `Skirt Front: 662.00 -> 392.00 mm (kademeler 270 mm'i geri veriyor)`, 27/27 PASS.
- `ctest -R golden` 3/3 yesil (goldenlerde firfir yok, kalip hatti kimildamadi).

### T5-4 — INGILIZCE SITEDE REHBER TURKCE INIYORDU (satis engelleyici)
- **Bulgu:** dugmenin adi "HTML, sewing guide (Turkish)", inen 129 satirin
  tamami Turkce.
- **KOK SEBEP:** `web/lib/rehber-tr.js` tek dilli yazilmisti ve i18n katmani
  ustune ceviri koymuyor, etikete parantezle "(Turkish)" yazip durumu
  kabulleniyordu.
- **ONARIM, TEK CUMLE UYDURULMADAN:** Ingilizce zaten VARDI ve KAYNAKTI —
  motorun her `rehber` kaydi kendi Ingilizce cumlesini (`a.text`) ve `basis`
  sayilarini tasiyor; buradaki Turkce sablonlar zaten onun cevirisiydi.
  `guideSteps` de zaten Ingilizce, `sewing-guide.json` zaten `en` alani tasiyor.
  Cevrilen tek sey sayfanin kendi mobilyasi (baslik, tablo etiketi, kaynak
  satiri). `rehberHTML(..., {dil})` eklendi, create.js sayfanin dilini geciriyor,
  etiketten "(Turkish)" kalkti.
- Motorun kendi Ingilizce metnindeki Turkce onculer de duzeltildi
  (`Puf nokta:` -> `Worth knowing:`, `Zor nokta — ...` -> `Hard spot — ...`,
  `Uc zor nokta:` -> `Hard spots:`, `Tela / interfacing:` -> `Interfacing:`).
- **KANIT:** ayni kalip iki dilde uretildi, govdedeki Turkce'ye ozgu harf sayisi
  `en: 0` / `tr: 604`. Ingilizce metin gozle okundu, ISO kodlari, igne bandi ve
  kaynak satirlari yerinde. `rehber_kaynak_check` 46/46 yesil, `uctan_uca_check`
  yesil.

### T5-6 — ALICININ CUMLESI DOSYAYA/BASLIGA ULASMIYORDU
Uc ayri kok sebep, ucu de kapandi:
- **(a) DOSYA ADI IKI AYRI SABLONDAN.** `stitchu-${pattern.garment}-${skirtStyle}`
  — motorun YALNIZCA skirtStyle+kol ekseninden kurdugu ad + tek bir eksenin ham
  degeri. O yuzden 'gathered' iki kez yaziliyordu ve alicinin yazmadigi 'a-line'
  dosyaya giriyordu. Ad artik ekrandaki BASLIKTAN turuyor (tek kaynak).
  OLCULDU: `a maxi tiered skirt...` -> `stitchu-a-line-skirt-aline` ->
  **`stitchu-maxi-tiered-skirt`**; `a fitted midi dress with balloon sleeves...`
  -> `stitchu-gathered-balloon-sleeve-dress-gathered` ->
  **`stitchu-midi-dress-with-balloon-sleeves-gathered-skirt-sweetheart`**.
- **(b) 'with balloon' YARIM CUMLESI.** `eksenAdiYut` bitisik yazilan eksen
  ismini ("sleeves") "zaten okundu" diye yutuyor ama ALICININ IFADESINE geri
  yazmiyordu. Artik bitisikse ifadeye ekleniyor (yeni deger/tablo yok).
  OLCULDU: `sleeveStyle = balloon <- "balloon"` -> `<- "balloon sleeves"`.
- **(c) 'fitted' KOLA BAGLANIYORDU.** `a fitted dress with puff sleeves` ->
  `sleeveStyle: straight` + `sleeveCap: puffed`, iki celisen okuma yan yana.
  Mesafe butcesi (1+GAP=3) kisa cumlede yetmiyordu. Kural artik dilbilgisel:
  sifat ile eksen ARASINDA giysinin adi duruyorsa sifat giysinindir, baglanmaz.
  `long fitted sleeves` baglanmaya devam ediyor (sifat gercekten kolun yaninda).
- **(d) YANLIS GEREKCE.** `'tiers'` icin ekrana "I read garment from 'skirt'
  next to it" yaziliyordu — 'skirt' 3., 'tiers' 6. token, ve dogru cevap ayni
  cumlede okunmus `ruffle` ekseniydi. Iki hata: dongu mesafeye bakmadan obje
  sirasindaki ilk ekseni seciyordu, ve kelimenin zaten okunmus bir kelimenin
  cekimi oldugu hic sorulmuyordu. Simdi: once ayni kok, sonra EN YAKIN eksen.
  OLCULDU: `tiers -> ruffle was already read in this sentence from 'tiered';
  'tiers' repeats it and opens no separate dial`.
  (Kok karsilastirmasi RAPOR METNI icin ayri ve genis bir kok kullanir;
  eslestiriciye ('govdeler') dokunulmadi — dokunulsa 'gathered' -> 'gather'
  olurdu ve tablo eslesmeleri kayardi.)

### T5-3 — PUF KOLUN HACMI: DENETCININ HUKMU ARTIK GECERLI DEGIL
- Denetci "flat'te kol iki duz cizgiden ibaret bir kama, sifir hacim" dedi ve
  `kusur-listesi.md`'nin "A1 — ONARILMADI" kaydini dayanak gosterdi.
- **OLCULDU, BU TURDA, SEVK EDILEN CIZIMDE:**
  - `sleeveCap: puffed` (referans 09/10'un giysisi): `data-buzgu-kapak-oran
    = 1.2901`, `data-buzgu-kapak-fazla-mm = 122.66`. Cizilen kol DISBUKEY,
    kubbeli, omuz cizgisinin ustune kabaran bir kutle — `/tmp/flat-bak/
    a-fitted-dress-with-puff-sleeves-flat.png` ile gozle dogrulandi.
  - `sleeveStyle: balloon`: kapak buzgu orani ESIGIN ALTINDA (nitelik hic
    basilmiyor), cunku motorun balon kolu KAPAKTA degil ETEKTE buzuyor —
    `data-buzgu-etek-oran = 1.6903`, `data-manset-yarim-mm = 94.12` (kolun
    kendi etek yarisi 159.09), `data-balon-kabarma-mm = 64.97`.
- Yani cizim, kalibin TASIDIGI buzguyu tasiyor. Denetcinin gosterdigi "1.35x
  tac" sayisi (buzgu_katman_check) puf kolun DUZ KOLA orani; cizimin kullandigi
  dikis buyuklugu ise tac/kol-oyugu oranidir — ayni sayi degil.
- **ACIK KALAN, KUCULEREK:** balon kolun DIS konturu (katlama cizgisi) hala
  duz; kabarma yalniz koltukalti tarafinda. Gerekce T4-1d'de yaziliydi ve hala
  gecerli: balon kolun kapaginda olculebilir bir buzgu YOK, uydurma genlikle
  kabartmak bu deponun yasagi. Motor tarafi is.

## ONARILMADI — GEREKCESIYLE

### T5-2b — KATMANLI ETEGIN CIZILEN GENISLIGI (siluet)
- Boy kusuru kapandi (T5-2a) ama cizilen siluet hala genis aciliyor: son
  kademenin cizilen yarim genisligi ~749 mm (kalca yarisi ~300 mm).
- **BU BIR UYDURMA DEGIL, KALIBIN KENDI SAYISI:** kademe bir DIKDORTGEN
  serittir; ust kenari ustteki kademeye buzulur, ALT kenari serbest asilir, yani
  bitmis alt cevresi kendi kesim uzunlugudur (tier 3 = 2997 mm -> 2997/4 = 749).
  Yayinlanmis dolgunluk bandi (2.0-3.0) uygulandiginda 3 metrelik etek ucu
  fizikte dogru sonuctur.
- **NEDEN DOKUNMADIM:** teknik flat konvansiyonu ASILAN siluete cizer, acik
  cevreye degil — bunu `GIRDI/iyi-flat/adaylar/08-empire-buzgu-etek.png`
  uzerinde olctum: buzgulu etek belden eteg ucuna yalnizca 0.63 -> 0.81 (gogus
  genisligine gore) aciliyor, yani ~1.29x; hicbir referans 2.5x'e yaklasmiyor.
  AMA 15 referansin HICBIRI kademeli (tiered) etek DEGIL. Kademeli bir etegin
  cizilen dokum genisligi icin bu depoda kaynakli bir sayi YOK, ve
  `feedback_once_konvansiyon_arastir` acikca "sayiyla contract'a yaz, sonra ciz"
  diyor. Kaynaksiz bir carpan koymadim.
- **SONRAKI ADIM:** GIRDI'ye en az iki yayinlanmis TIERED etek teknik cizimi
  eklenip ayni piksel penceresiyle olculursa (08 icin yapildigi gibi), sayi
  `contract/flat-convention-v1.json sevkPoz.buzgu` altina kaynagiyla yazilir ve
  cizim tek satirda o sayiya oturur.

### T5-5 — ORTADA SATILAN BIR SEY YOK (besinci tur)
- Fiyat/sepet/odeme/teslimat yok; tek donusum yolu e-posta kutusu.
- **BU TEKNIK BIR EKSIK DEGIL, KAPANMAMIS BIR URUN KARARI.** Site gerekceyi
  kendisi yaziyor (index.html:237 "nothing gets a price before a toile is sewn
  and judged"). O toile hic dikilmedi. Bir ajanin dikebilecegi bir sey degil ve
  fiyat koymak Damla'nin karari — kod yazarak kapatmaya calismak, karari
  gaspetmek olurdu.
- Altyapi hazir: bekleme listesi endpoint'i calisiyor (denetci olctu, HTTP 200).

### T5-EK — BUZGULU ETEK (kademesiz) CIZIMDE BOS BIR DIKDORTGEN
- Sorulmadi ama bu turda gorduğum ve bildirmeden gecemeyecegim sey:
  `--spec '{"garment":"skirt","skirtStyle":"gathered","skirtLength":"maxi"}'`
  ciziminde belde TEK bir buzgu tiki, govdede tek bir dokum cizgisi yok —
  dumduz bos bir dikdortgen iniyor. Sebep okunabiliyor: bel buzgu olcumu
  (`out.notes.bodiceWaistMM > 0`) yalniz ELBISEDE var, ETEKTE bedene ait bir
  bel kenari olmadigi icin hic calismiyor. ELBISEDE ayni ozellik calisiyor.
  Onarilmadi: bu turda sirasi gelmedi, ve tahminle degil ayni olcum yoluyla
  (etegin bel kenari / kemerin bitmis uzunlugu) kapanmali.

### T5-EK2 — ONCEDEN KIRMIZI, BENIM DEGIL (uc kapi)
- `flat_artifact_census`: 3B kabuk hattinin bel C1 kirigi (20.56°), etiketi
  ARASTIRMA_HATTI_SEVK_DISI. Kapinin KENDI aciklamasi bu sayiyi (20.5594°) ve
  "bu ajanin yetkisi DEGIL" notunu zaten tasiyor. `git diff` ile dogrulandi:
  kapinin adiyla gosterdigi iki dosyada (`shellprojection.cpp`,
  `surfacepattern.cpp`) bu turda TEK BAYT degismedi.
- `style_check`: `engine/STYLE-PIN` diskte YOK (0 stil pinli). Dosyaya
  dokunmadim, olusturmadim — pin basmak stilleri dondurmak demek, karar.
- `sizechart_source_check`: `shoulderCM/backLengthCM/armLengthCM/neckCM`
  kaynaksiz (CLAUDE.md'de K10 olarak zaten kayitli). `contract/tables.json`
  bu turda degismedi.
