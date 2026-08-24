# KOSU.md — v6 gece koşusu (24 Ağu 2026)

Protokol: GECE-KOSUSU-v6.md. v5 koşusunun kayıtları GECE/arsiv/v5-kosusu/
altındadır ve bu koşuda kanıt DEĞİLDİR.

## ŞU AN
Faz: **V3 KAPANDI** (tek nesne: flat ile kalıp aynı kabuktan). Sıradaki V4
(flat konvansiyonu + zevk ön-taraması). Son yeşil commit: yok — HEAD'de
6 kırmızı var: 4 MİRAS (sınıf (c) kaynak/karar eksiği) + V3'ün KENDİ 2 kapısı,
ikisi de kök teşhisli ve ölçülmüş adaylı. V3 iki yeni ad doğurdu ve İKİSİNİ DE
aynı gece kapattı (`bundle_fresh_check`, `vocab_reference_check`).
V3'ün ölçtüğü ağaç: `40dbd6b..HEAD`. Açılış ağacı: `b197ccf`.

## KAPANMIŞ FAZLAR
- **V0** — 7 kart, 6 alt kapı yeşil, 4.7 önce KALDI sonra 0F ile GEÇTİ. `GECE/V0.md`
- **V1** — 5 kart + 1 düzeltme turu. Hakem önce **KALDI** (mührü savunan tanık
  cümlesi UYDURMAYDI), `05156a1` düzeltince GEÇTİ. Kırmızı 6→4. `GECE/V1.md`
- **V2** — DEVRALINDI (§3.10). 6 kart sıralı. **3 yeni kapı**, test 105→108.
  4.3 önce 6 kırmızı buldu → V2-D → 4. Hakem GEÇTİ. `GECE/V2.md`
- **V3** — 6 kart (K‖R keşif/araştırma → A sıralı çekirdek → B‖C paralel →
  D sıralı onarım). **Kabuk yayınlandı: flat dış konturu artık ÇİZİLMİYOR,
  kalıbın beslendiği AYNI `GarmentSurf`'ten HESAPLANIYOR.** 2 yeni kapı
  (`flat_pattern_agree_check` · `flat_artifact_census`), test 108→110.
  Hakem GEÇTİ. Tutanak: `GECE/V3.md` · İşçiler: `V3-{K,R,A,B,C,D}.md`

## AÇIK KIRMIZILAR (6 — ad · nerede · sayı · 4.7 adayı)
1. `style_check` — `engine/STYLE-PIN` diskte YOK · kapsam **0/31** ·
   aday `repin-style.sh`; darboğaz **31 kez GÖZ**
2. `sizechart_source_check` — `contract/tables.json` · 7 kolonun **4'ü UNSOURCED**
   · iki birincil tablo ölçüldü, **dördü de BAĞLANAMAZ**; aday: kolonları AT
3. `contract_check` — `git ls-files patterns_real` = **41** takipli telifli dosya
   · aday V0'da ölçüldü (untrack → `GREEN, exit=0`) ama Damla kararı
4. `figure_check` — `dress_bandeau_circle` 31 stilin tek `fittedBand`'i ·
   iki ölçülmüş aday: 4. bant `[0.84,0.90]` ya da siluet düzeltmesi (oran 0.820)
5. **`flat_pattern_agree_check` (V3, YENİ)** — `body_length` flat 757.5584 vs
   kalıp 728.7870mm = **−%3.7979** (tolerans %1.5) + **UNMEASURED 3/6**.
   KÖK: sevk edilen kalıp **strapless**, kabuk omuz halkasından başlıyor = G5.
   Ölçülmüş hamle: tanım uyuşmazlığı düzeltildi (iki taraf da YAY), ihlal 4→1;
   gevşetme YAPILMADI. Kalan iş V7'nin kartı.
6. **`flat_artifact_census` (V3, YENİ)** — sınıf 3, 2 nokta, **20.5602° > 1°**,
   belde. KÖK: `surfacepattern.cpp:71-81`, skim zarfı ile halka interpolasyonu
   `skimBaseH`'de teğet koşulsuz buluşuyor = V köşesi.
   ÖLÇÜLDÜ VE REDDEDİLDİ: kalça emsali (`:55-60`, blendMM=50) bele uygulandı →
   kırık 20.5602°→0.4582° ama bel **724.92→761.04mm (+36.12)** ve **4 kapı
   kırmızıya döndü**; geri alındı (`GECE/log/V3-D.waistblend.rejected.txt`).
   İki aday daha var, ikisi de ÖLÇÜLMEDİ (tutanak §6).

KAPANAN (V1): `golden_check` · `recipe_dress_check`. (V0): `bundle_fresh_check`.
AÇILIP AYNI GECE KAPATILAN — V2: `bundle_fresh_check` · `vocab_reference_check` ·
`generated_ratchet_check`. **V3: `bundle_fresh_check`** (wasm 4 commit bayattı,
`495d58a` damga `7023c808195429b3`) · **`vocab_reference_check`** (+27 → kod
düzeltmesiyle +20 → taban yeniden kesildi).

## DEVİR ÜÇ SAYI (V4'e)
1. **KIRMIZI = 6** — miras 4 + V3'ün kendi 2 kapısı. Test **108 → 110**.
   ★ `GECE/V3-D.md`'nin *"sıfır ad eklendi"* cümlesi YANLIŞ (hakem yakaladı):
   ham ad kümesi 4→6; miras küme büyümedi, RULES 9 ihlali yok.
   Log: `GECE/log/V3.ctest.before.txt` → `GECE/log/V3-D.ctest.txt`
2. **SÖZLÜK TABANI = 10438 referans @ `495d58a` · RATCHET KİLİTLİ.** V3'te
   bilinçli yeniden kesildi (10418→10438); deltanın **18'i yorum metni** ve
   yorum silerek sayı düşürmek ARTEFAKT GİZLEME sayılıp reddedildi. Satır satır
   kaynak `d6cbb87` gövdesinde (emsal `e2f7aba`). Sayı yalnız DÜŞEBİLİR.
3. **TEK NESNE KURULDU, ÜÇ ÖLÇÜDE KIYASLANIYOR.** Flat ve kalıp aynı
   `buildGarmentSurf`'ten besleniyor (hakem kaynağı okuyarak doğruladı; sıfır
   düzeltme katsayısı). Kıyaslanabilir üçten **ikisi ≤0.15mm** tutuyor
   (hem −0.1494 · waist −0.1093), üçüncüsü **%3.80 sapıyor**;
   **UNMEASURED 3/6, ratchet tavanı 3.** Sayı yalnız düşebilir.
   ⚠ Hakemin uyarısı: `hem`/`waist`'in flat tarafı bir **HEDEF**, kalıp tarafı
   **GERÇEKLEŞEN** — gerçek round-trip testi ama "iki bağımsız ölçüm" DEĞİL.
   ⚠ V2'nin 3. sayısı (sürekli eksen 2/37) V3'te **ÖLÇÜLMEDİ**, olduğu gibi devrediyor.

## TABAN BANTLARI (§4.1 — sessizce aşılamaz)
`draftJSON` medyan **1.030 ms** (p95 1.107) · `gradeJSON` EU34→48 **8.198 ms** ·
5000 soak SURVIVED · native↔wasm en kötü **1e-4 mm** · çağrı yolu **main thread**
→ Worker refaktörü KUYRUK KARTI. Alet `engine/tools/wasm-baseline.mjs`.
⚠ Alet sayı ne olursa olsun **exit 0** dönüyor; V2-D'nin ölçülmüş adayı:
5 koşunun EN DÜŞÜK MEDYANI + tavan aşılınca exit 1 + ctest'e bağla.
YENİ EŞİKLER (V3): C1 **1.0°** = McNeel Rhino, güven YÜKSEK (daha sıkı emsal
CATIA 0.5°, kapıya BAĞLANMADI) · uyum **%1.5 yayından DEĞİL KARARDAN**
(`GECE/V3-R.md` EŞİK 2: yayınlanmış formül YOK) — ikisi de test başlığında yazılı.

## SONRAKİ FAZLARIN HAZIR GİRDİSİ
- V4 ← **V3'ün konturu hazır zemin**: `./engine/build/shell-flat EU38 --svg`
  `data-scale` + `data-source="GarmentSurf"` basıyor (konvansiyonun ölçek beyanı
  bedava). ⚠ AMA bugünkü kontur bir **siluet dış hattı**, teknik çizim değil:
  kol/oyuk/yaka YOK, ön=arka, kapalı kontur ayna kurgusu.
  **+ `figure_check`'in iki adayı (K-V1B)** — `figure-bands.json`'un kendi
  gerekçesindeki "%27 dar" cümlesi ÇÜRÜDÜ, gerçek fark **%5.9**.
  **+ eski flat hattı ÖLMEDİ:** `render-garment-flat.mjs` (~90 elle yazılmış
  katsayı, dosya:satır listesi `GECE/V3-K.md` §1.4) + `flat-engine/` referans
  kalemi (31 stil) — iki kalemin croquis'i uyuşmuyor (omuz x 57.80, n=29)
- V5 ← `GECE/V1-R.md` (dört kolon BAĞLANAMAZ + 5 erişilemeyen yayının künyesi)
  **+ V3'ten:** `pattern-measure.mjs` panel kenarlarını 0.05mm adımla ölçüyor
- V6 ← `GECE/V0-0B.md` (5 fotoda 1 tam doğru) **+ V2:** kelime listesi
  `gen-vision-vocab.mjs`'ten üretiliyor. ⚠ `NECKLINE_CLASSES` 7→9,
  `SKIRT_STYLE_CLASSES` 5→6: yeniden eğitim KARARA BAĞLANMADI
- V7 ← `52ae85c`'nin tavanı (*"tek kübik gerçek scye'nin S kavisini çizemiyor"*)
  **+ V3'ten: G5 ARTIK SAYIYLA KİLİTLİ** — üç UNMEASURED'ın (bust · neck ·
  shoulder) kökü tek: sevk edilen kalıpta omuz dikişi de kol oyuğu da YOK
- V9/V10 ← `GECE/V0-0C.md` (1248 iddia) **+ V2:** `?v` **136'da donmuş**
  **+ V3:** kâtip README'ye DOKUNMADI (gerekçe: siluet-only + iki kapı kırmızı)

## KUYRUKTAKİ KART TASLAKLARI (faz sahibi belli değil)
- Sürekli eksen açmak: 2/37 (emsal `FabricAxis`, `measurements.hpp:90-107`)
- `bundle_fresh_check` damgası bir İDDİA: artefaktı elle düzenleyip damgayı
  bırakmak kapıyı yeşil bırakır; kapı artefaktın kendi özetini hesaplamalı
- `buildGarmentSurf` ve `buildSheathPattern` `levelHeight`'ı ayrı ayrı okuyor —
  iki kopya, biri gitmeli (V3 vocab deltasının kalanı buradan)
- `shell-flat` yalnız ÖN görünüm basıyor; arka orta hat yayı (kalıp 772.2352mm)
  hesaplanıyor ama hiçbir kapıya bağlı değil
- `flat_geometry_sellable_check` PASS diyor ama 10 panelde ihlal basıyor
  (omuz/göğüs 1.0624 ≥ 1.0) — kapı, düzeltmeye çalıştığı kusuru VARSAYIYOR
- `h3b-rings.py` temiz makinede koşmuyor (`svgpathtools`, venv gitignore'da)
- 8 bedenin 7'sinde artefakt sayımı YAPILMADI (V3 yalnız EU38 ölçtü)

## DAMLA'YA DÜŞEN (bloke etmez — hepsi varsayılanıyla yürüyor)
- **K-FN1** kol oyuğu bandı: taban beden mi, sekiz beden mi · varsayılan (A) · V7
- **K-V0A** `patterns_real/` 41 takipli telifli dosya · varsayılan (A) dokunma
- **K-V0B** `style_check` yeniden pinleme · varsayılan (A) kırmızı kalsın
- **K-V1A** golden mührü yenilendi — onaylıyor musun? geri alma tek `git revert`.
  Varsayılan (A) YÜRÜDÜ. ★ Gözüne düşen sayı değil, yeni oyuk eğrisi
- **K-V1B** `figure_check`: 4. sınıf mı, siluet düzeltmesi mi · varsayılan (C) · V4
- **K-V1C** kaynaksız 4 kolon: aranacak mı, atılacak mı · varsayılan (C) · V5
- **K-V2A** görü kafası yeniden eğitilecek mi? (neckline 7→9, skirtStyle 5→6) ·
  varsayılan (A) eğitme, V6 ölçsün
- **K-V2B** site `?v=136`'da donmuş · varsayılan (A) deploy'a kadar dokunma · V9/V10
- **K-V3A** (yeni) **beldeki 20.56° teğet kırığı kapatılsın mı?** Tek ölçülmüş
  mekanizma (kalça emsali) kırığı 0.46°'ye indiriyor AMA bel halkasını
  **+36.12mm** bozuyor ve 4 kapıyı kırmızıya çeviriyor. (A) kırık kalsın, iki
  ölçülmemiş aday V4/V5'te denensin · (B) bel toleransı yeniden müzakere
  edilsin · **Varsayılan (A)** · V4
- **K-V3B** (yeni) **flat'in kaynağı hangisi olacak?** Bugün İKİ hat birden
  canlı: hesaplanan kabuk projeksiyonu (`shell-flat`, siluet-only, iki kapısı
  kırmızı) ve elle yazılmış çizim hattı (`render-garment-flat.mjs` + 31 stillik
  referans kalem). (A) ikisi de dursun, V4 konvansiyonu ölçsün · (B) çizim
  hattı `_LEGACY` bayrağına alınsın · **Varsayılan (A)** · V4
