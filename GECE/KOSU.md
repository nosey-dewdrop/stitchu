# KOSU.md — v6 gece koşusu (24-25 Ağu 2026)

Protokol: GECE-KOSUSU-v6.md. Eski v5 koşusunun kayıtları GECE/arsiv/ altındadır
ve bu koşuda kanıt DEĞİLDİR.

## ŞU AN
Faz: **V7 KAPANDI** (KOL — kenar kimliği KURULDU, oyuk↔kapak kapısı ÇİZİLEN
kenardan ölçüyor). Sıradaki V8. HEAD'de 6 kırmızı (miras), **114 test**.
Hakem **GEÇTİ** dedi (`GECE/KAPI.md` `067e084`) ve aynı turda fazın SOKTUĞU
canlı bir bug buldu → `8a8424f` ile düzeltildi, kanıtlı.

## KAPANMIŞ FAZLAR (tutanaklar `GECE/V0..V7.md`)
**V0** 7 kart · **V1** 5 kart, hakem önce KALDI, kırmızı 6→4 · **V2** 105→108 ·
**V3** 6 kart, flat konturu ÇİZİLMİYOR `GarmentSurf`'ten HESAPLANIYOR 108→110 ·
**V4** 7 kart 110→111 · **V5** 12 kart 111→113 · **V6** 10 kart 113→113 ·
**V7** 9 kart (R·A·B·C·D·E·F·G·H) 113→114. V5/V6/V7'de ad kümesi birebir.

## AÇIK KIRMIZILAR (6 — V7 hiçbirine dokunmadı, ad ad)
1. `style_check` — `engine/STYLE-PIN` diskte YOK · kapsam **0/31** · 31 kez GÖZ
2. `sizechart_source_check` — 7 kolonun **4'ü UNSOURCED**; aday AT (V5:
   `body.shoulder` 20→80cm'de geometri BAYT AYNI = **ÖLÜ GİRDİ**)
3. `contract_check` — **41** takipli telifli dosya · aday untrack → GREEN exit 0,
   Damla kararı. ⚠ Kapı metni "49" diyor, saydığı **41**
4. `figure_check` — tek `fittedBand` · ⚠ V4+V5+V6+**V7**'ye yazıldı, DÖRDÜNDE
   DE KESİLMEDİ
5. `flat_pattern_agree_check` — `body_length` −%3.7979 (tol %1.5) + UNMEASURED
   3/6. KÖK: strapless = G5
6. `flat_artifact_census` — sınıf 3, 2 nokta, **20.5602° > 1°**, belde. KÖK:
   `surfacepattern.cpp:71-81` — ⚠ o dosya SEVK EDİLMİYOR (aşağı bak)

## DEVİR ÜÇ SAYI (V8'e) — V7 şefi kendi ölçtü
1. **KIRMIZI = 6 · TEST = 114.** Açılış `GECE/log/V7.ctest.opening.txt`
   (113/6, 274.55 sn, `e4249b7`), kapanış `GECE/log/V7.ctest.final.txt`
   (114/6, 272.74 sn). **AD kümesi birebir**; hakem bağımsız `diff` aldı
2. **SÖZLÜK TABANI = 10438 @ `495d58a` · bugün 10432 (−6, tabanın ALTINDA),
   YEŞİL.** `bash engine/tests/vocab_reference_check.sh`. Yalnız DÜŞEBİLİR.
   ⚠ Gece bir kez FAIL'e düştü, **kökünden geri alındı** (aşağı bak)
3. **YENİ KİLİTLİ BANT — kol yedirmesi** (`sleeve_cap_ease_check.mjs`):
   `[S1]` tavan **38.1mm** (Linda Lee *Setting in a Sleeve* sl.6, YAYINLANMIŞ) ·
   `[S2]` işaret **POZİTİF** zorunlu · `[S3]` ölçülen **15.0430…19.1027mm**
   REPORTED (alt uç için yayın YOK) · `[S4]` puf/balon nicel kapısı **YOK** ·
   ADSIZ oyuk borcu **3 spec**. Yalnız SIKILAŞABİLİR. ★ İFADE RATCHET **5
   UNEXPRESSED** (kol **0/0** · yaka 4/4 · omuz 1/1), V7 yaka/omza DOKUNMADI.
   Taban bantlar (§4.1) V6'dan DEĞİŞMEDİ

## ★ FOTO→SPEC İSABETİ: **%20.0 → %20.0** (V11'in 3. sorusu)
V7 görü hattına DOKUNMADI (prompt/model değişmedi = §5.3 veto). v2 ifade
edilebilirliği **15/68 = %22.1 → %22.1, fark 0**; kol tek başına 68 okumanın
**35'ini** düşürüyor — V7 kolu ÇİZİM+DOĞRULAMA'da kurdu, SİCİL'de `sleeve`
bilinçli absent kaldı (karar B). ⚠ **V0-0B'nin %36.8 aleti REPODA YOK** →
yeniden üretilemiyor.

## ★ V7'NİN ÖLÇTÜĞÜ + KATTIĞI (ayrıntı `GECE/V7.md`)
- **"KOL 0/8 İFADESİZ" İDDİASI DÜŞTÜ.** `flat_expresses_spec_check.mjs` →
  `sleeveStyle UNEXPRESSED **0/0**`; doğru okunuş "8'in 0'ı ifadesiz", kol
  kapının **en temiz ekseni** (8 değer = 4 kanonik + 4 beyanlı eşanlam, 4 ayrı
  geometri). İfadesiz olan **yaka 4/4 + omuz 1/1**
- **SEVK EDİLEN HAT:** wasm → `bindings.cpp:339` → `garment.cpp:303,621` →
  `sleeve.cpp`; `grep -c surfacepattern engine/build-wasm.sh` = **0**, yüzey
  motorunun ürün tarafında tüketicisi YOK = **KAPSAM KAYMASI**, karar **(B)**
- ★★ **KAPI BİR TAUTOLOJİYMİŞ:** `bodice.cpp:509` skaleri yazıyor →
  `sleeve.cpp:55` uyuyor → `validator.cpp:300` **aynı skalerle** doğruluyor =
  "0.00mm oyuk↔kapak uyumu" **aynı sayının kendisiyle uyumuydu**
- **KENAR KİMLİĞİ** (`geometry.hpp:40-71 EdgeRole`): komut aralığı + uç-nokta
  çapası, **uzunluk alanı bilerek YOK**, çapa bayatlarsa rol DÜŞER. Adlandırılmış
  kenar **0 → 5**; yeni kaynak dosya **0**; golden BAYT-AYNI. `reanchorEdgeRoles()`
  — bayatlama teorik değil **canlı**: tüketici taşınınca **5 kapı düştü**
  (`locket·cup·yoke·boxpleat·compose`). ★ **YARIM AD, AD DEĞİLDİR**
- **YENİ KAPI `sleeve_cap_ease_check`** sevk edilen **wasm** artefaktını yükler,
  iki yayı ÇİZİLEN komutlardan ölçer: **48 satır 0 ihlal**, EU38 **+16.1246mm =
  %3.9887**. Boş test §4.2 birincil usul: `e4249b7` artefaktı → **EXIT 1, 184
  ihlal**; mutasyon §4.5 **üç ayrı yönden** kırıyor. **7 PNG** (RULES md.3)

## ★ RULES md.9 BİR KEZ İHLAL EDİLDİ, AYNI GECE KÖKÜNDEN GERİ ALINDI
`vocab_reference_check` 7. kırmızı düştü (`garment +3`, `sleeveCap +1`). Şef
izole etti: kırmızının **TAMAMI** V7-F'in `contract/garment-spec-v2.json`'a
yazdığı **ŞERH DÜZ YAZISIYDI** (`grep -cw garment` 4→7; `validator.cpp` 22→22).
Onarım `75c9103`: şerh **işaretçiye indi**, çıkarılan **10 dizginin 10'u**
`GECE/V7-F.md` §5'te kelimesi kelimesine duruyor (`grep -F` kanıtlı). **Taban
KESİLMEDİ**, SCOPE/EXCL ellenmedi. Hakem: **"GİZLEME DEĞİL, YER DEĞİŞTİRME"**,
ama kapsam dışına taşındığını kayda geçirdi (**K-V7A**). ⚠ **KAPININ BİLİNEN
SINIFI:** ratchet `grep -w` ile ham kelime sayıyor; `contract/` altındaki bir
Türkçe cümlede eksen adı geçince sözlük büyümese de kırmızı düşer — betiğin
kendi başlığı "KNOWN NOISE, unfixed on purpose" diyor.

## ★ HAKEM FAZIN SOKTUĞU CANLI BUG'I BULDU (V7-H `8a8424f`)
`validator.cpp:419` format 6 belirteç / 7 argüman, `%.1f`'e `const char*`; `fmt`
varargs ve format attribute YOK → derleyici sessizdi. **Kullanıcıya UYDURMA
SAYI:** `armhole 0.0 (-60261330 named edge(s))` → düzeltilmiş `armhole 375.9
(4 named edge(s))`, 375.9×1.04=391.0 ✓ (`GECE/log/V7-H.fmt.txt`). KORUMA:
`__attribute__((format(printf,1,2)))`; bozuk dizgi geri konunca **4 `-Wformat`**,
başka yerde **0 uyarı** = gizli başka format hatası YOK.
★ Fazın 8 işçisi ve 5 yeşil kapısı bu bugu GÖRMEDİ. Hakem kapısı süs değil.
## ★ V7'NİN AÇIK BIRAKTIĞI BORÇ (tam liste `GECE/V7.md`; gizlenmedi)
- **ADSIZ OYUK:** oyuk adlandırılmamışsa validator eski skalere düşüyor. Kapı
  borcu her koşuda ADIYLA sayıyor: `bardot_off_shoulder · yoke_top ·
  cupseam_bustier` ADSIZ · `boxpleat_swing` ADLI. Tautoloji varsayılan hatta
  ÖLDÜ, bu 3 pas'ta yaşıyor
- ★ **[S2] işaret şartı kaynağıyla aynı çizgide DEĞİL** (hakem): V7-R "KESİM
  çizgisinde pozitif" diyor, `commands` **DİKİŞ** çizgisi; Buğra dikiş
  çizgisinde 8/8 NEGATİF → **kapı referans kalıbı kırmızı düşürürdü.** Motor %4
  çözdüğü için ateşlemiyor. **KARARA BAĞLANMADI**
- ★ **[S1] 38.1mm tavanı bugün hiçbir şeyi bağlamıyor** (bant 15.04…19.10);
  bağlayan tek şart rol çözünürlüğü + işaret. Ölçülen %4.00 ± 0.055 puan beyan
  edilen `kCap[0]`'a karşı → **henüz boş bir farkı ölçüyor** (hakem kaydı)
- `sleeve_underarm` çifti yargılanmıyor · prensesde oyuk süreklilik/sıra şartı
  yok · yaka/yan dikiş/bel/etek ucu hâlâ **ADSIZ** · `recipe-json-dump.cpp`
  `edgeRoles` basmıyor · `engine/tests/` ratchet KAPSAMI DIŞINDA · `fmt` 256B'de
  sessizce kırpıyor · `h10_gate_check` **Disabled** (sebebi DOĞRULANMADI) ·
  `render-garment-flat.mjs:381` `hasSleeve` **HAM değer** (`kimono`/`dolman`
  reddedilmiyor, set-in kolla geometri-özdeş = RULES md.1 ihlali) · `:648`
  **`raglan` arka kapısı** · `cap` motorda kalıp tarafında YOK · UI 8'in **3'ünü**
  sunuyor
- **GİZLİLİK:** `patterns_real/` **41 dosya takipli, `.gitignore`'da HİÇ YOK**;
  `dataset/` 6 takipli. CLAUDE.md ikisini de "ASLA push edilmez" diyor

## SONRAKİ FAZLARIN HAZIR GİRDİSİ + KUYRUKTAKİ KARTLAR
- **V8 (kumaş)** ← `GECE/V5-R.md` §C · **+V7:** ADSIZ oyuk borcu (3 spec) ·
  `[S2]` kesim↔dikiş çizgisi kararı · `sleeve_underarm` çift kapısı · yaka ve
  omuz İFADE borcu (4/4 + 1/1, kolun yolundan gidilebilir) · `raglan` arka kapısı
- V9/V10 ← `GECE/V0-0C.md` (1248 iddia) · `?v` **136'da donmuş** · kâtip V7 turu
  bitti (`6c90b58`: ARCHITECTURE §15, KATMAN-HARITASI boşluk 11, INDEX V7)
- ★ `sewability_check` ratchet'i **SAYIYI tavanlıyor, YERİ değil** ·
  `edit_locality_check` tek beden/tek spec'te ölçüyor · `back_neck_drop` SINIF
  hatası kapısız · repo **iki üretim toleransı** (0.79375 vs 3.0) ·
  `virtual-sew.js` çürük · `flat-board.mjs` exit koduna bağlı DEĞİL ·
  `h3b-rings.py` koşmuyor · ⚠ WebFetch'e PDF özetletmek YANLIŞ SAYI üretti ·
  `vision/eval/photos` 29 dosya 19 etiket · `vision/eval.js` ↔ `foto-spec-olcum`
  aynı banka farklı sayı (%94/%92.2) · ★ **V7-R: `drafting-math-eu38.md`'nin
  "HIGH" cap-ease tablosu birincil yayında BULUNAMADI → DOĞRULANMADI**

## ★ PROTOKOL DERSİ (V8 ŞEFİNE — kart değil KURAL)
1. **Devralınan cümleyi ÖLÇMEDEN kartına yazma.** V7'nin brief'i "kol 0/8
   ifadesiz" diyordu; ölçüm ÇÜRÜTTÜ. Ölçüm kartı kesilmeseydi faz **yanlış bir
   problemi** çözecekti. 2. **Kapı kurmadan önce kapının bugün NE ölçtüğünü
   ölç** — tautoloji ancak "bugün hangi kod eşliyor" diye SORULDUĞU için çıktı.
   3. Orakçı işletildi; **V7-D tavanı ~2s20dk'ya taştı** ama COMMIT'ledi; diğer
   8 işçi tavanın altında, her işçi kendi commit'ini attı.
## DAMLA'YA DÜŞEN (bloke etmez — tam gövdeler `DAMLA-KUYRUK.md`'de)
- **K-FN1** kol oyuğu bandı (A) — **V7 KUYRUĞU OKUDU**, (A) yürüdü, EU34/36 oyma
  işi V7'ye kart OLMADI — **K-V0A** `patterns_real/` 41 telifli dosya (A) —
  **K-V0B** `style_check` pinleme (A) — **K-V1A** golden mührü — **K-V1B**
  `figure_check` ⚠ V4+V5+V6+**V7**'ye yazıldı, DÖRDÜNDE DE KESİLMEDİ — **K-V1C**
  kaynaksız 4 kolon — **K-V2A** görü kafası — **K-V2B** `?v=136` — **K-V3A**
  20.56° kırığı (A) — **K-V4A/B/C** pano · ISO 5455 · tanınmayan değer —
  **K-V5A** pay yayınlanmış minimumun ALTINDA (A) — **K-V5B** Buğra levhaları —
  **K-V6A** çıpa/editleme işi REDDEDİLDİ, yan dalda `3d8903c` (A)
- **K-V7A** (YENİ) V7-F'in sicil şerhi ratchet'i kırdığı için **işaretçiye
  indirildi** (tam metin `GECE/V7-F.md` §5): (A) böyle kalsın · (B) tam metin
  sicile dönsün, ratchet tabanı elle kesilsin · **VARSAYILAN (A)** · ETKİLER V9
