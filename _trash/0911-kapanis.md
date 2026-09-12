# KAPANIS kosusu — 11 Eyl 2026

> Otorite: HEDEF.md > bu belge. Kapi = `KOSU/kapi.sh` exit kodu. Ajan hukmu kapi DEGILDIR.

## Neden bu kosu farkli

Onceki 24 A4 turu bosa gitti. Iki olculmus sebep:

1. **Hakem olcu degildi.** Her tur internetten FARKLI satici setini olcut cekti
   (tur25 Tilly/TrueBias, tur26 Friday/Papercut -> 0/11, tur27 Cashmerette/Grainline -> 7/11).
   Olcut oynak => skor gurultu => 24 tur yukselen egri YOK (3/11 -> 10/11 -> 0/11 -> 7/11).
2. **Kapiyi gecirеn sey kod degil elle veriydi.** Son 14 commit'te `KOSU/onbellek`
   dosyalarina 3720 satir elle yazilmis, ciziciye 168 satir. Her faz elle veri
   duzelterek gecti, bir sonraki fotografta coktu.

=> Yeni kurulumda kapi bir SCRIPT'in exit kodu ve elle dokunmayi da yakaliyor.

## Kapi (KOSU/kapi.sh) — 5 evrensel kural, her gorevde kosar

| kural | ne yakalar |
|---|---|
| E1 | `KOSU/onbellek/**`, `ops*.json`, `hedefler.json`, `siluet.json` elle degismis |
| E2 | `contract/*.json` / `engine/tests/**` esik sayisi degismis (beklenti dusurme) |
| E3 | muhurlu 5 fotograf degismis |
| E4 | `engine/vocab.json` deger sayisi artmis (HEDEF md.9) |
| E5 | cizicide `case` sayisi artmis (sabit menu buyumesi) |

Ilk kosusunda yarim kalan tur 29'u yakaladi: siluet.json elle duzenlenmis + ciziciye
`pili` case eklenmis (19->20). Bu kapi kurulu olsaydi tur 29 gecemezdi.

## Muhur + altin kopya (G1 kacak kapatma)

`KOSU/muhur.txt`: 5 Etsy ilan gorseli (Damla'nin gercek girdisi).
Muze/podyum fotograflari DENENDI ve ELENDI (3/4 aci, desen, kalabalik arkaplan) —
onlarla sinamak imkansiz kapi kurmak olurdu, bu da olcut kaydirmanin tersi.

`KOSU/altin/`: bu 5'in ELLE yazilmis okumasi = insan hukmu.
G1 okuyucusu altini GORMEZ (kapi sizintiyi ayrica denetler); urettigi okuma
`KOSU/altin-kiyas.mjs` ile altinla kiyaslanir. Yanlislama: kendisiyle GECTI,
baska giysiyle KALDI, bos okumayla KALDI (3/3 dogru).

## Gorevler

| # | is | durum |
|---|---|---|
| G2 | urunde tek flat hatti | **GECTI** 11 Eyl |
| G1 | fotograf/prompt okuyucu (`KOSU/siluet-oku.mjs`) | sirada |
| G3 | uctan uca canli (wasm, /api/analyze, al-dene) | acilmadi |
| G4 | durustluk (kaynaksiz shoulderCM, docs_truth, H7) | acilmadi |

Sira notu: G2, G1'den ONCE kosuldu. Sebep: okuyucunun ciktisi bir ciziciye
baglanacak; iki hat yasarken yazilirsa yanlis hatta baglanir ve yeniden yazilir.

## G2 — ne yapildi (11 Eyl, kapi exit 0)

- `KOSU/siluet-ciz.mjs` govdesi -> `web/lib/siluet-ciz.js`. Kopya degil TASIMA:
  eski ve yeni ayni okumadan BAYT-AYNI SVG uretiyor (4068 bayt, cmp temiz).
  CLI artik 36 satirlik sarmalayici; node ile tarayici tek geometriyi kosuyor.
- SILINDI: `web/lib/flat-from-pattern.js`, `flat-from-plan.js`, `flat-geom.js`.
  `enum_dallanma_check`: js.dallanma 18->6, js.sabitMM 2->0.
- `flat_mirror_check` KIRMIZI -> YESIL (3 ihlal -> 0). `cizim_giysi_mi` olctugu
  dosya oldugu icin kayittan dustu.
- Madde 4 (sessiz default yasak) uygulandi: web'de siluet okumasi YOK, iki cagiran
  da `ERR_OKUMA_YOK` basiyor. Uydurma yok.

### ⚠ G2'nin BIRAKTIGI BORC (dururken kirmizi, G3'un isi)

Silinen kalemi olcen 8 kapi vardi. 4'u kayittan dustu (nesnesi yok).
Dordu YESILDEN KIRMIZIYA dondu ve BILEREK oyle birakildi:

| kapi | neden kirmizi |
|---|---|
| `vitrin_gercek_check` | `web/index.html`'in 12 flat SVG'si silinen kalemle uretilmisti; landing artik kalemi olmayan resim sergiliyor |
| `indir_check` | "spec -> flat dosyasi" iddiasini olcuyor; madde 4 bunu reddettirdi |
| `uctan_uca_check` | ayni sebep; **G3'un kapisi** |
| `manken_insan_ayrim_check` | ayni sebep |

Bunlar ya siluet hattina yeniden baglanacak ya olu ilan edilecek. G3'un isi.

**Yazili borc:** silinen kapilarin hukumleri (cizim giysi mi / satilir mi /
konvansiyon / kalip mutabakati) yeni kaleme BAGLANMADI — girdisi artik spec degil
fotograf okumasi. Bugun o hukumler yalniz `siluet-yanlisla` ve kor hakem turunda
kosuyor, ctest kapisi YOK. CMakeLists'te acik yazili.

## Arastirmadan cikan ve yonu degistiren bulgular

Ayrinti: bu oturumun olcumleri. Ozet:

1. **Flat croquis'ten DEGIL POM'dan cizilir, 1:8 olcekte.** "Hepsi ayni insana
   cizilmis gibi" (HEDEF md.5) estetik hedef degil; ayni POM vektorunden ayni
   olcekle turetmenin MATEMATIKSEL SONUCU. Croquis oran sayilari blog seviyesi ve
   celiskili (omuz 2 bas mi 1.5 bas mi) -> contract'a sayi olarak YAZILMAYACAK.
2. **Ticari bosluk kalipta degil FLAT'te.** CLO3D 3D'den vektor flat uretmiyor,
   sadece render veriyor; sektorde flat hala elle ciziliyor. Kalip tarafi akademide
   kalabalik (GarmentCode, Sewformer, NGL, GarmageNet). Wrapper testini gecen yer burasi.
3. **Negatif payda TUZAK:** formul %75 strec icin %43 der, sektor tablosu %5 der.
   Motor TABLOYU alacak, formulu degil. Negatif pay anizotropik: yatay %8-12, dikey %0.
4. **Dart = ayriklastirilmis Gaussian curvature** (md.7'nin cevabi). Parca sayisi
   estetik karar degil geometrik zorunluluk. Pens ACI olarak saklanmali (pivot'ta
   korunan sey aci), genislik olarak degil: sin(θ/2) = (genislik/2)/uzunluk.
5. **Cizgi agirligi ORAN sabit:** outline = ic detayin TAM 2 KATI (2 bagimsiz kaynak).
   Semantik: solid=seam, dashed=topstitch, dotted=gizli dikis/fold. Topstitch rounded cap.
   dash/gap sayisi hicbir kaynakta YOK -> olcege ORANTILI tanimlanacak.
   ⚠ Mevcut contract: outer 2.4 / seam 1.0 / hair 0.55 -> 2.4:1. Sektor 2:1. KONTROL.
6. **Graf dogru soyutlama, kanit:** GarmentCode component'i SERIALIZE ETMIYOR,
   diske panel+stitch yaziyor. Kanonik sema NeuralTailor (2021'den beri fiili standart),
   curvature = QUADRATIC Bezier (cubic degil). Lisans: GarmentCode/NeuralTailor MIT,
   Seamly2D GPLv3+ (bulasici, ticaride kod alinmaz).

### Okunacak (siradaki tur)
- NGL arXiv 2602.20700 — training-free VLM->spec->deterministik kalip. EN GUNCEL RAKIP.
- Design2GarmentCode arXiv 2412.08603 — LLM'e parametre mi doldurtmali KOD mu yazdirmali?
  Bu secim G1 okuyucusunun tavanini belirler.
