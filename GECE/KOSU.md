# KOSU.md — v6 gece koşusu (24-25 Ağu 2026)

Protokol: GECE-KOSUSU-v6.md. Eski (farklı) v5 koşusunun kayıtları
GECE/arsiv/v5-kosusu/ altındadır ve bu koşuda kanıt DEĞİLDİR.

## ŞU AN
Faz: **V5 KAPANDI** (dikilebilirlik: sevk edilen kalıbın kusuru artık
SAKLANAMAZ — iki kapı ölçüyor ve adlandırıyor, ama bir milimetre onarılmadı).
Sıradaki V6 (giriş hattı: foto+prompt → spec, editleme temeli). Son yeşil
commit: yok — HEAD'de 6 kırmızı (4 MİRAS + V3'ün kendi 2 kapısı). V5
**DEVRALINDI** (§3.10): kesilen oturumun diskteki işi silinmedi, yeniden
üretilmedi, yeniden ÖLÇÜLEREK doğrulandı. Hakem **GEÇTİ ×2** (ayrı temiz
oturumlar). Ağaç: `17f5656..2e5fb75`.

## KAPANMIŞ FAZLAR
- **V0** — 7 kart, 6 alt kapı yeşil, 4.7 önce KALDI sonra 0F ile GEÇTİ. `GECE/V0.md`
- **V1** — 5 kart. Hakem önce **KALDI** (tanık cümlesi UYDURMAYDI), `05156a1`
  düzeltince GEÇTİ. Kırmızı 6→4. `GECE/V1.md`
- **V2** — DEVRALINDI. 6 kart. **3 yeni kapı**, test 105→108. `GECE/V2.md`
- **V3** — 6 kart. **Kabuk yayınlandı: flat dış konturu ÇİZİLMİYOR, kalıbın
  beslendiği AYNI `GarmentSurf`'ten HESAPLANIYOR.** 108→110. `GECE/V3.md`
- **V4** — 7 kart. **Sessiz çökertme kapıya bağlandı** (110→111), croquis
  kökten düzeltildi. Hakem KALDI→GEÇTİ. `GECE/V4.md`
- **V5** — DEVRALINDI. 9 kart (Z·R·R2·B·B2·A·D·E·F·G). **2 yeni kapı,
  111→113**, kırmızı AD kümesi BÜYÜMEDİ. `GECE/V5.md`

## AÇIK KIRMIZILAR (6 — ad · nerede · sayı · 4.7 adayı)
1. `style_check` — `engine/STYLE-PIN` diskte YOK · kapsam **0/31** · aday
   `repin-style.sh`; darboğaz **31 kez GÖZ**
2. `sizechart_source_check` — `contract/tables.json` · 7 kolonun **4'ü
   UNSOURCED**; aday: AT. ⚠ V5 iki yönden çürüttü: `shoulderCM` 36-42cm
   hiçbir yayında vücut ölçüsü değil (her sistem 11.75-14.2cm) VE
   `body.shoulder` 20→80cm arasında kalıp geometrisi BAYT AYNI = **ÖLÜ GİRDİ**
3. `contract_check` — `git ls-files patterns_real` = **41** takipli telifli
   dosya · aday V0'da ölçüldü (untrack → `GREEN, exit=0`) ama Damla kararı
4. `figure_check` — `dress_bandeau_circle` 31 stilin tek `fittedBand`'i · iki
   aday: 4. bant `[0.84,0.90]` ya da siluet düzeltmesi (0.820) ⚠ V4'e ve
   V5'e kart yazıldı, İKİSİNDE DE KESİLMEDİ
5. `flat_pattern_agree_check` (V3) — `body_length` flat 757.5584 vs kalıp
   728.7870mm = **−%3.7979** (tolerans %1.5) + **UNMEASURED 3/6**. KÖK:
   strapless = G5. ⚠ **V5-D ÇELİŞKİ ÖLÇTÜ:** bu kapı `surfacepattern` hattını
   yargılıyor, orada omuz/yaka/oyuk YOK; ama `draftJSON` hattının kalıbında
   ÜÇÜ DE VAR ve ölçüldü. **İki hat iki ayrı giysi sevk ediyor**
6. `flat_artifact_census` (V3) — sınıf 3, 2 nokta, **20.5602° > 1°**, belde.
   KÖK: `surfacepattern.cpp:71-81`. Kalça emsali ölçülüp REDDEDİLDİ (bel
   +36.12mm bozuluyor). İki aday ÖLÇÜLMEDİ; C1 ÖRNEKLEME ADIMINA bağlı

KAPANAN (V1): `golden_check` · `recipe_dress_check`. (V0): `bundle_fresh_check`.
AÇILIP AYNI GECE KAPATILAN — V2: 3 ad · V3: 2 ad · V4: `vocab_reference_check`.
**V5: 0 açtı, 0 kapadı** — iki yeni kapı YEŞİL doğdu (ratchet'li, aşağıda).

## DEVİR ÜÇ SAYI (V6'ya) — V5 şefi kendi ölçtü
1. **KIRMIZI = 6 · TEST = 113.** Açılış 111/6 → kapanış 113/6, **AD kümesi
   birebir aynı** (`GECE/log/V5-G.reddiff.txt` BOŞ, iki hakem bağımsız
   doğruladı). Log: `GECE/log/V5.ctest.opening.txt` → `V5-G.ctest.after.txt`
2. **SÖZLÜK TABANI = 10438 @ `495d58a` · KİLİTLİ, YEŞİL.** Bugün **10432**
   (−6, tabanın ALTINDA). V5 sözlüğe DOKUNMADI. Sayı yalnız DÜŞEBİLİR
3. **İFADE RATCHET = 5 UNEXPRESSED · TAVAN KİLİTLİ** — kol 0/0 · yaka 4/4
   [shirt·mock·flat·crescent] · omuz 1/1 [dropped]. V5 dokunmadı. ⚠ Üç tuzak
   AÇIK: ratchet ALANI tavanlamıyor · tanınmayan değer hâlâ ÇİZİLİYOR ·
   V3'ün 3. sayısı hâlâ ölçülmedi

## ★ V5'İN KİLİTLEDİĞİ DÖRDÜNCÜ BANT (`engine/tests/v5-ratchet-baseline.json`)
Ölçüm 2026-08-25, ağaç `d566a8a`. Yalnız DÜŞEBİLİR; tavanı ELLE BÜYÜTMEK
yasak — aşılıyorsa cevap kusuru düzeltmektir. Tam liste: `GECE/V5.md` §6.
- `sewability_check`: notch_off_boundary **211** · over_seam_allowance **32** ·
  far_from_edge **342** · unclosed/selfintersect/turn/engine_error **0**
- `draft_math_check` (a) tolerans YAYIN YOK: scye_depth **11.40** · omuz ön
  **8.2988** · omuz arka **18.1823** · back_neck_drop **8.40** mm
- (b) YAYINLANMIŞ BANT, **RATCHET DEĞİL** — İKİ çizgi: bant dışı beden
  bust **4/8** · waist **0/8** · hip **8/8**, **VE** en kötü mm sapması
  (hip 33.60 · bust 14.35). Kapı ihlali "geçti" diye ADLANDIRMIYOR
  (`grep -c PASS` = 0), exit 0'ın gerekçesini ADIYLA basıyor

## ★ V5'İN DÜRÜST SINIRI (V6/V7'nin 1. KARTI)
**İki kapı da `engine/src/` altında SIFIR satır değiştirdi.** Sevk edilen
kalıp bu gece bir milimetre düzelmedi; düzelen şey kusurun SAKLANAMAZ olması.
- **Çentik: 607 işaretin 211'i kesim çizgisinde DEĞİL**, sapma bedenle
  büyüyor (EU34 28.83 → EU48 78.93mm) = sistematik inşa hatası. Aday ölçüldü
  (max izdüşüm 15.0mm, dikiş payı bandında) → 211→0. `notches` kanalı TİPSİZ
- **★ Madde 5 (GEÇİŞ) boşluğu SATILAN METNİN İÇİNDE:** rehber `guideSteps[2]`
  alıcıya *"yaka açıklığını kendi baş çevrenle karşılaştır"* dedirtiyor;
  kapanma donanımı **0/16**, motor bitmiş yaka açıklığını hiç basmıyor.
  Antropometri hazır (ANSUR II omuz çevresi 944/1027/1119mm), kapı yok ·
  **Madde 1 ve 6 ABSENT çünkü artefakt DİKİŞ GRAFİĞİ taşımıyor** (0/112)

## TABAN BANTLARI (§4.1 — sessizce aşılamaz)
`draftJSON` medyan **1.030 ms** (p95 1.107) · `gradeJSON` EU34→48 **8.198 ms** ·
5000 soak SURVIVED · native↔wasm en kötü **1e-4 mm** · çağrı yolu **main thread**
→ Worker refaktörü KUYRUK KARTI. Alet `engine/tools/wasm-baseline.mjs`.
⚠ Alet sayı ne olursa olsun **exit 0** dönüyor; aday: 5 koşunun EN DÜŞÜK
MEDYANI + tavan aşılınca exit 1 + ctest'e bağla.
EŞİKLER: C1 **1.0°** = McNeel Rhino · uyum **%1.5 KARARDAN**, yayın YOK ·
çizgi kalınlığı **±0,1d** = ISO 128-2:2020 md.5.2 · **ease** = Threads #221
s.71 + Aldrich 4.bs s.28 · **blok formülleri** Aldrich 4.bs s.11/14/16/28/171
(tam metin okundu, birincil-verbatim).
⚠ **1/32" (0.79375mm) İÇİN APPAREL YAYINI YOK** — 73 tam-metin eşleşmesinin
hiçbiri giyim değil. "Üretim standardı" DENEMEZ, **ev değeri** denir.
⚠ **Reponun büst payı künyesi ÇÜRÜDÜ:** repo +60mm, Threads minimumu
**63.5mm**. V5 wasm paritesi BOŞ: `git diff 17f5656..HEAD -- engine/src web/`.

## SONRAKİ FAZLARIN HAZIR GİRDİSİ
- V6 ← `GECE/V0-0B.md` **+ V4:** `raglan` OMUZ ekseninde; `cap` çelişiyor;
  `mandarin`/`notched`/`sailor` sayısal karşılığı YOK
- V7 ← `52ae85c` tavanı **+ V3: G5 SAYIYLA KİLİTLİ** **+ V5:** çentik
  izdüşümü · `notches` TÜR ALANI · GEÇİŞ kapısı · dikiş grafiği artefakta ·
  payın CİNSİ (K-V5A) — **beşi de `engine/src/` işi**
- V8 ← `GECE/V5-R.md` §C (KES-F/FAST, birincil)
- V9/V10 ← `GECE/V0-0C.md` (1248 iddia) **+ V2:** `?v` **136'da donmuş**
  **+ V5:** kâtip ARCHITECTURE §13 + README + INDEX'i tazeledi (`0aebee0`)

## KUYRUKTAKİ KART TASLAKLARI (tamamı + gerekçe: `GECE/V5.md` §5)
- ★ Kanunu SEVK EDİLEN kaleme bağla (V4'ün dürüst sınırı) — flat tarafı
- ~~★ Magnitüd + beden körlüğü~~ **V5-H'de KAPANDI** (`a40c888`): bant artık
  İKİ çizgi (beden sayısı **+ en kötü mm**), (a) BEDEN BAŞINA çizgi taşıyor.
  Şef doğruladı: `hip_ease:-15` · `bust_ease:-3` · `scye_depth@EU48:4` üçü de
  artık **exit 1** (önce exit 0'dı). ctest 113/6, ad kümesi aynı
- ★ AÇIK aynı sınıf: **`sewability_check` ratchet'i SAYIYI tavanlıyor, YERİ
  değil** — daha kötü yerdeki 211 çentik yeşil geçer
- `back_neck_drop` **SINIF hatası** kapısız: Aldrich SABİT 1.5cm, motor
  `0.6 × yakaCM` GRADUATE ediyor · `armhole_circumference` hükümsüz (yayın yok)
- Repo **iki üretim toleransı** taşıyor (`surfacepattern.cpp:19` 0.79375 vs
  `validator.hpp:23` 3.0), haritalanmadı · `virtual-sew.js` **çürük** (ölü
  `engine/dist/`) · `raster.mjs` timeout'u ısırmıyor (öksüz Chrome 19 dk)
- ⚠ **WebFetch'e PDF özetletmek YANLIŞ SAYI üretti** (ANSUR II bideltoid
  374/410/450 döndü, gerçek 406/450/499 — bir beden sapma) → PDF'ten WebFetch
  ile çekilmiş her antropometrik sayı ŞÜPHELİ · **Aldrich'in KENDİSİ çelişkili
  çizelge basıyor**: s.10 büst 88 = beden 12, s.11 büst 88 = beden 10
- Sürekli eksen 2/37 · `bundle_fresh_check` damgası İDDİA · `flat-board.mjs`
  `FARK VAR` basıyor ama exit koduna bağlı DEĞİL · `h3b-rings.py` koşmuyor

## DAMLA'YA DÜŞEN (bloke etmez — hepsi varsayılanıyla yürüyor)
- **K-FN1** kol oyuğu bandı (A) · V7 — **K-V0A** `patterns_real/` 41 takipli
  telifli dosya (A) dokunma — **K-V0B** `style_check` pinleme (A) kırmızı kalsın
- **K-V1A** golden mührü yenilendi, onaylıyor musun? geri alma tek `git revert`
  — **K-V1B** `figure_check`: 4. sınıf mı, siluet düzeltmesi mi (C) ⚠ V4'e VE
  V5'e yazıldı, İKİSİNDE DE KESİLMEDİ — **K-V1C** kaynaksız 4 kolon (C)
- **K-V2A** görü kafası yeniden eğitilsin mi? (A) · V6 — **K-V2B** site
  `?v=136`'da donmuş (A) · **K-V3A** beldeki 20.56° kırığı **(A)** kalsın
- **K-V4A** ESKİ|YENİ panosu zevk hükmü: `GECE/log/V4-D.pano/*.png` · **(A)** —
  **K-V4B** `data-scale="1:3"` ISO 5455 dizisinde YOK · **(A)** ara ölçek —
  **K-V4C** tanınmayan kol/yaka değeri çizilsin mi, reddedilsin mi · **(A)**
- **K-V5A** (yeni) **sevk edilen kalıbın payı yayınlanmış minimumun ALTINDA**:
  kalça **8/8**, göğüs **4/8** bedende. (A) bugünkü pay kalsın, kapı ihlali
  adıyla basmaya devam etsin · ~~(B) gövde girdisini kaydır~~ **ÇÜRÜDÜ**
  (aritmetik hata; gerçek kazanç 1.65mm, bant için kalça **+168cm** gerekir)
  · (B′) payın CİNSİ çarpımsal→toplamsal, `engine/src/` ⚠ **BEDELİ
  ÖLÇÜLMEDİ**, 8 bugün-yeşil kapı risk altında · **VARSAYILAN (A)** · V7
- **K-V5B** (yeni) **BİLGİ HÜKMÜ SENİN**: Buğra üst üste bindirme levhaları —
  `GECE/log/V5-B2.overlay/` (locket 6 PNG) · `V5-B2.corset/` (6 PNG); fark
  tabloları `V5-B2.rerun.txt` · `V5-B2.corset.txt`. Hiçbir kapıya bağlı DEĞİL
  ve bağlanamaz (§7.3) · bloke etmez
