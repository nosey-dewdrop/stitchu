# KATMAN HARİTASI — kim kimi okur, kim kimi OKUYAMAZ? (2026-08-10)

> Amaç: her arıza TEK katmana mühürlenebilsin. Teşhis harnesi `engine-check/harness/run-all.sh`;
> yasak-okuma zabıtası `scripts/katman-lint.py`. Kural: her katman sadece bir ALTININ
> KONTRAT ÇIKTISINI okur — içini asla.

## Katmanlar?

| Katman | Ne | Mevcut dosyalar | Kontrat çıktısı | OKUYAMAZ |
|---|---|---|---|---|
| **L0 VÜCUT** | Tek vücut gerçeği | `contract/figure-bands.json` (figur_croquis), `engine/src/bodysurface.{cpp,hpp}`, `engine/pattern-bridge/bodies/mean_all.yaml` | `contract/layers/body.EU38.json` (26 ölçü + girth mm + croquis px↔mm kalibrasyonu) | üst katmanların hiçbirini |
| **L1 TASARIM** | Stil uzayı (vücutsuz) | atolye state (46 kadran), `engine/flat-engine/styles.json`, `contract/figure-bands.json garment_ease` (bel/gogus çarpanları) | design-state JSON — **içinde mm YASAK**, sadece oran/enum/çarpan | L0'ın mm'lerini |
| **L2 GİYSİ YÜZEYİ** | vücut+tasarım → 3B shell | `engine/src/garmentshell.{cpp,hpp}`, `drape.{cpp,hpp}`, `volume.hpp` | shell ölçüm raporu: `rings.waist_mm` TEK SAYI, bust/hip, ease hacmi | L3/L4'ü |
| **L3a FLAT (croquis hattı)** | Yüzeyin çizimi | `engine/flat-engine/_engine-full.mjs` (referans kalem, 31 stil, SALT-OKUNUR), `engine/tools/render-garment-flat.mjs` (üretim kalemi) | SVG. ⚠ **"ölçüsüz" artık iki kalem için ayrı ayrı okunur (24 Ağu, V4):** üretim kalemi `data-scale="1:3"` + `data-unit-mm="3"` + `data-croquis` + `data-ref-size` beyan ediyor ve kanunu `contract/flat-convention-v1.json`; referans kalem **31 stilin 0'ında** `data-scale` beyan ediyor ve stilize kalıyor | kalıp dünyasından HİÇBİR ŞEYİ (`body.yaml`, specification, mapping) |
| **L3a′ FLAT (kabuk projeksiyonu)** ★ 24 Ağu | Yüzeyin İZDÜŞÜMÜ — çizim değil | `engine/src/shellprojection.{cpp,hpp}`, alet `engine/build/shell-flat` | JSON: 6 ölçü mm + ön/arka kontur + halka aralığı; `--svg` ile `data-scale="1"` 1:1 SVG | — **L2'nin kabuğunu DOĞRUDAN okur** (aynı `GarmentSurf`), bu istisna kasıtlı |
| **L3b KALIP** | Yüzeyin düzleştirilmesi | `engine/src/bodice.cpp` vb., `engine/pattern-bridge/mapping.py`, GarmentCode (kara kutu) | `stitchu_specification.json` + panel kenar uzunlukları mm | `figur_croquis`'i doğrudan; kalemi |
| **L4 DOĞRULAMA** | Hakem | `engine/pattern-bridge/walk.py`, `printpack.py`, `test_seamdeed.py` | tapu + print-report | üretici katmanların İÇİNİ |

## Bugünkü bilinen ihlaller / boşluklar (lint --report envanteri günceller)?

1. **L0 ÇİFT KAYNAK:** flat vücudu `figur_croquis`'ten (px), kalıp vücudu `mean_all.yaml`'dan (cm)
   okuyor; ikisinin tutarlılığını ölçen tek test H0'dır (harness). Ömürlük çözüm: tek
   `contract/layers/body.EU*.json` → ikisi de oradan.
2. **L3b İKİ BEL PARAMETRESİ:** `mapping.py` bodice ve etek beline ayrı değer basıyor; toplam bel
   kontrolü yok → 2.95mm / 17 kombinasyon arızası (kanıt `Logs/paket-2026-08-06`). Harness H3b-rings
   bu sınırın bekçisi. Kök çözüm Faz C (bel = 3B'de tek spline).
3. **L3a↔L3b köprüsü sadece pinli makas:** `preview-truth` stilizasyon makasını ölçüp pinliyor;
   makası kapatan şey değil. Kök çözüm Faz C (ikisi tek yüzeyden türetilir).
   ⚠ **KISMEN AŞILDI 24 Ağu (V3):** yeni **L3a′** satırı tam olarak o kök çözümün ilk parçası —
   dış kontur artık kalıbın kesildiği AYNI kabuktan (`GarmentSurf`) ortografik izdüşümle
   hesaplanıyor, stilize edilmiyor. Ama **eski L3a hattı silinmedi ve makas kapanmadı**: iki hat
   yan yana duruyor, aynı EU38 belinde farklı sayı taşıyorlar (croquis sıfır bolluk, kabuk
   bolluklu). Bugünkü farkı basan kapı `node engine/tests/flat_pattern_agree_check.mjs`.
4. **L3a′ ↔ L3b altı ölçünün üçünü kıyaslayamıyor:** kalıp tarafı STRAPLESS bir giysi üretiyor,
   kabuk projeksiyonu omuz halkasından başlıyor. `bust`/`neck_opening_width`/`shoulder_width`
   kalıp tarafında ölçülecek kenar bulamıyor ve `null` + sebep dönüyor
   (`engine/tools/pattern-measure.mjs`). Tek kök: açık G5 işi (omuz/oyuk/yaka yüzeyde).
   Kapı bu boşluğu her koşuda adıyla sayıyor ve 3'te ratchet'liyor.
5. **Kabuk siluetinde belde teğet kırığı var:** bel yüksekliğinin üstünde skim zarfı, altında
   halka interpolasyonu, aralarında hiçbir teğet koşulu yok. Sayıyı basan kapı
   `node engine/tests/flat_artifact_census.mjs` (sınıf 3). Kalçadaki köşe yuvarlaması emsali
   denendi, bel halkasını şişirdiği için geri alındı — ölçüm `GECE/V3-D.md` §2.

6. **L3a KENDİ İÇİNDE İKİYE BÖLÜNMÜŞ, kanun yalnız birine ulaşıyor (24 Ağu, V4).** Konvansiyon
   kanunu (`contract/flat-convention-v1.json`) yalnız ÜRETİM kalemini bağlıyor; canlı sitenin
   31 stili ve zevk panosunun 10 hücresinin 9'u REFERANS kalemden çıkıyor. Ölçüldü: bu gecenin
   iki kök düzeltmesinden sonra panonun 10 stil hücresinin 10'u da eski commit'le **bayt bayt
   aynı** (`cmp`, `GECE/V4-D.md` §1) — yani kanuna uygunluk kapısını geçen bir onarım, alıcının
   gördüğü çizimde hiç görünmeyebiliyor. Sayan aletler: `node engine/tests/flat_convention_check.mjs`
   (üretim kalemi, 8 stil) ve `node engine/tools/flat-board.mjs <dizin> --eski <dizin>`.
   Kök çözüm — stilleri kanunun bağladığı kaleme taşımak — YAPILMADI, karar alınmadı.

7. **L3b'nin SEVK ETTİĞİ ARTEFAKT DİKİŞ GRAFİĞİ TAŞIMIYOR (25 Ağu, V5).** L4'ün hakemleri
   (`walk.py`, `printpack.py`) motorun kendi içindeki dikiş planını okuyabiliyor, ama
   `draftJSON` sınırından geçen artefaktta o plan YOK: 112 parçada
   `seams`/`seamGraph`/`edges`/`edgeNames`/`pairs`/`stitches` alan sayısı **0**, yalnız
   `cutLine` + isimsiz işaret çizgileri var. Sonuç: dikiş çifti uzunluk eşitliği ve çentik
   ÇİFTİ eşleşmesi bu katmandan **sorulamıyor**. Ek olarak `notches` **tipsiz tek kanal**
   (`type` yalnız `move`/`line`), yani kenar çentiği / katlama / iç işaret ayrımı artefakttan
   çıkarılamıyor. Sayan kapı: `node engine/tests/sewability_check.mjs` — cevaplayamadığı her
   soruyu ADIYLA `ABSENT:` diye basıyor (bugün 7). Teşhis `GECE/V5-A.md`.
8. **L0 ↔ L3b: `shoulderCM` hem KAYNAKSIZ hem KULLANILMIYOR (25 Ağu, V5).** `contract/tables.json`
   alıcıya on beden için `shoulderCM` yayınlıyor (`_sources` status **NONE**, bekçisi kırmızı:
   `sizechart_source_check`), ama L3b geometrisi o girdiden **bağımsız**: `body.shoulder`
   20…80 cm arasında değiştirildiğinde draftJSON bayt bayt aynı kalıyor (`GECE/V5-D.md`).
   Motor omzu kendi çiziyor ve Aldrich'in yayınlanmış omuz boyundan ön −8.30 mm / arka
   −18.18 mm kısa düşüyor. Yani L0'ın bu kolonu ne besliyor ne de doğrulanabiliyor.
   ⚠ Aynı kesişimin `neckCM` için de var olduğu iki çıktı yan yana konarak görüldü ama
   nedensel bağ **DOĞRULANMADI**.

## Teşhis ilkesi?

Her harness testi SADECE kontrat dosyası okur. H3b FAIL + H0 PASS ⇒ arıza kesin L3b'de.
H0 FAIL ⇒ vücut kaynakları zaten ayrık, önce onu kapat — aşağı katmana bakma.
