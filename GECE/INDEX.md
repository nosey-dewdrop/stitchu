# GECE/ — yönlendirme

Bu koşu tek context'te yürümez. Aşağıdaki tabloya bakıp **sadece** ihtiyacın olan
dosyayı aç.

| şunu sorarsan | şu dosyaya bak |
|---|---|
| şu an neredeyiz, ne açık | `GECE/KOSU.md` (≤150 satır, canlı durum) |
| bir faz gerçekten kapandı mı, hakem ne dedi | `GECE/KAPI.md` |
| bugün ne var ne yok, sayılar nereden geldi | `GECE/F0.md` |
| kalıbın EU38 ölçüleri | `GECE/f0-pattern-EU38.json` (üreten: `GECE/f0-measure-pattern.py`) |
| flat'in siluet ölçüleri, ölçek beyanı var mı | `GECE/f0-flat-princess.json` (üreten: `GECE/f0-measure-flat.mjs`) |
| hangi operatör sevk edilmiş | `contract/garment-spec-v2.json` → `operators` |
| damar nedir, ne çizilir ne çizilmez | `ANAYASA.md:28-58` |
| flat ile kalıp neden aynı sayıyı vermiyor | `contract/tables.json` → `flat._layer` (kontrat beyanı); bugünkü FARKI basan kapı `node engine/tests/flat_pattern_agree_check.mjs` |
| flat çizimi konvansiyona uyuyor mu (tek croquis, ölçek, çizgi sınıfları, omuz) | `node engine/tests/flat_convention_check.mjs` basar; kanun `contract/flat-convention-v1.json` |
| farklı spec değeri farklı giysi çiziyor mu | `node engine/tests/flat_expresses_spec_check.mjs` basar (ölçü: çizen eleman kümesi + kontur uzunluğu, sha değil) |
| bugünkü flat'ler yan yana nasıl görünüyor | `node engine/tools/flat-board.mjs <çıktıDizini> [--eski <dizin>] [--ek <dizin>...]`; son iki koşu `GECE/log/V4-C.pano/`, `GECE/log/V4-D.pano/` |
| çizgi kalınlıkları / kesik oranları hangi yayına dayanıyor | `GECE/V4-R.md` (ISO 128-2:2020, ISO 128-3:2022, ISO 5455:1979 — birincil okundu / erişilemedi ayrımıyla) |
| flat'in dış konturu nereden geliyor | `engine/src/shellprojection.{hpp,cpp}` ← `GarmentSurf` (`engine/src/surfacepattern.hpp`); alet `./engine/build/shell-flat EU38 [--svg]`; teşhis `GECE/V3-A.md` |
| kalıbın kendi altı ölçüsü | `node engine/tools/pattern-measure.mjs <pattern.json>`; kenarı olmayan ölçü `null` + sebep (`GECE/V3-B.md`) |
| kabuk siluetinde artefakt var mı | `node engine/tests/flat_artifact_census.mjs` basar (dört sınıf, eşik kaynaklarıyla) |
| ctest bugün ne durumda | `GECE/KOSU.md` → AÇIK KIRMIZILAR |
| görü kelime listesi nereden geliyor | üreteç `engine/tools/gen-vision-vocab.mjs` → `vision-student/vocab.py` (elle düzenlenmez); bekçi `ctest -R vocab_source_check` |
| menü büyüdü mü, ratchet ne diyor | `engine/tests/vocab_reference_check.sh` basar; taban `engine/tests/vocab-reference-baseline.json` |
| sevk edilen bayt kaynağıyla aynı mı | `engine/tests/bundle_fresh_check.sh` basar; damgayı `engine/build-wasm.sh` koyuyor (`stitchu.source-stamp`) |
| sınır kesirli/eksik değere ne yapıyor | `ctest -R wasm_spec_honesty_check` basar; teşhis `GECE/V2-C.md` |

## V0 fazı — envanter (24 Ağu 2026)

Faz kuralı: ölçüm var, onarım yok. Tutanak ve kartlar aşağıda; ham çıktılar `GECE/log/`.

| dosya | içinde ne var |
|---|---|
| `GECE/V0.md` | fazın tutanağı: ölçülen kalemler, kapanan/açılan kırmızı adları, sonraki faza devredilen üç sayı ve taban bantları. |
| `GECE/V0-0A.md` | motor envanteri: `ctest` sayımı, `contract/garment-spec-v2.json` operatör sayımı ve damar yüzdelerinin adım adım yöntemi. |
| `GECE/V0-0B.md` | görü hattı ölçümü: `engine/tools/foto-spec-olcum.mjs` ve `vision/eval.js` koşularının okuması, hata sınıfları, ölçülemeyenlerin listesi. |
| `GECE/V0-0C.md` | vitrin taraması: `docs/` + `web/` + README iddia sayımı, taşıyıcı iddiaların yargısı, duran-iddia (RULES §6) hit dökümü, `site-health.mjs` okuması. |
| `GECE/V0-0D.md` | sözlük dili: `engine/vocab.json` eksen/değer sayımı, sevk edilen menü ile motor sözlüğü arasındaki kayma, `bindings.cpp` int ikamesi ve `collarType` NaN bulgusu. |
| `GECE/V0-0E.md` | wasm paritesi, tazelik kontrolü, `draftJSON`/`gradeJSON` süre tabanı, soak koşusu ve çağrı yolunun hangi iplikte olduğu. |
| `GECE/V0-0F.md` | altı kırmızının kök teşhisi ve her biri için ölçülmüş çözüm adayı (hiçbiri ana ağaca bırakılmadı). |
| `GECE/V0-0R.md` | eşiklerin kaynak araştırması: hangi eşik yayınlanmış bir kaynağa dayanıyor, hangisi için kaynak bulunamadı. |
| `GECE/KART/V0-0A-motor.md` … `V0-0R-arastirma.md` | yedi işçi kartının brief'i: her kartın kapalı kaynak listesi, çıktı dosya kümesi ve teslim şartı. |
| `GECE/log/V0-0A.ctest.txt` · `V0-SEF.ctest.txt` | `ctest --test-dir engine/build --output-on-failure` iki bağımsız koşusunun ham çıktısı. |
| `GECE/log/V0-0A.red-names.txt` · `V0-SEF.red-names.txt` | aynı iki koşudan süzülmüş kırmızı test ADLARI (`diff` ile karşılaştırılmak için). |
| `GECE/log/V0-0B.eval.txt` | görü değerlendirme koşularının ham çıktısı (foto-spec ölçümü + `vision/eval.js`). |
| `GECE/log/V0-0C.site-health.txt` · `V0-SEF.site-health.txt` | `node engine/tools/site-health.mjs` koşularının çıktısı ve exit kodu. |
| `GECE/log/V0-0D.enum-refs.txt` | eksen adı / enum değeri referans sayımını basan `grep` komutları ve çıktıları — V2'nin `vocab_reference_check` sayacının tabanı. |
| `GECE/log/V0-0E.wasm.txt` | `node --expose-gc engine/tools/wasm-baseline.mjs --reps 200 --soak 5000` çıktısı. |
| `GECE/log/V0-0F.aday.txt` · `V0-0F.hakem.txt` | çözüm adaylarının denendiği koşuların çıktısı ve hakemin bunları yeniden koşturduğu doğrulama. |
| `engine/tools/wasm-baseline.mjs` | native↔wasm parite, tek üretim/beden serisi süresi ve soak ölçümünü basan alet; taban bantları buradan okunur. |

## V1 fazı — onarım (24 Ağu 2026)

Faz kuralı: V0'ın saydığı kırmızılara dokunulur, ama devralınan kırmızı ADLARI büyüyemez
(RULES §9) ve her onarım kendi önce/sonra `ctest` çıktısını yanına bırakır.

| dosya | içinde ne var |
|---|---|
| `GECE/V1.md` | fazın tutanağı (şef yazar). |
| `GECE/V1-R.md` | araştırma hükümleri: beden tablosunun kaynaksız dört kolonu, golden yeniden-pinleme pratiği, `taban_v3` bandı sorusu. |
| `GECE/V1-SINIF.md` | devralınan kırmızıların sınıflandırması: hangisi kasten bayat pin, hangisi kaynak/karar boşluğu, hangisi regresyon. |
| `GECE/KART/V1-A-golden-mühür.md` · `V1-B-recete.md` · `V1-D-figure.md` · `V1-E-stylepin.md` · `V1-R-arastirma.md` | işçi kartlarının brief'i: kapalı kaynak listesi, çıktı dosya kümesi, teslim şartı. |
| `GECE/log/V1.ctest.before.txt` · `V1-A.ctest.after.txt` · `V1-A.ctest.after-precommit.txt` | turun BAŞINDAKİ ve SONUNDAKİ tam `ctest` koşuları. Kırmızı ADLARININ büyüyüp büyümediği bu dosyaların `diff`'inden okunur, buradaki bir cümleden değil. |
| `GECE/log/V1-A.olcum.txt` | golden yeniden-pinlemesinin ölçüm defteri: içerik diff'i, parça başına sapma, reçete yolunun koşusu. |
| `GECE/log/V1-B.ctest.before.txt` · `V1-B.ctest.after.txt` · `V1-B.ctest.recipe-applied.txt` · `V1-B.olcum.txt` · `V1-B.diff-tool.cpp` · `V1-B.recipe-FIXED.json` | reçete DSL'ine `scye` opu eklenirken alınan üç ctest koşusu, ölçüm defteri, kıyas aleti ve düzeltilmiş reçete belgesi. |
| `GECE/log/V1-D.kardes.txt` | `figure_check`: bandeau'nun devralabileceği bir kardeş stil var mı — bileşen tablosuyla gösterildi, iddiayla değil. |
| `GECE/log/V1-E.mutasyon.txt` | `style_check` kapsam kuralının mutasyon kanıtı: pin yok / tek pin / tam kapsam üç hâlde kapı ne diyor. |
| `GECE/log/V1-F.sloper-tanik.txt` | bağımsız tanık `sloper_check`'in değişimden ÖNCE ve SONRA koşuları (komut izi dahil) — golden mühür etiketindeki bir iddianın çürütüldüğü ölçüm. |
| `engine/GOLDEN-PIN.md` | golden yeniden-pinleme defteri. Deftersiz pin geçersiz; 2026-08-24 girdisi **Damla onayını BEKLİYOR (K-V1A)**, yani mühür kapanmış bir karar değil. |

## V2 fazı — sözlük kapıları + sevk hattı dürüstlüğü (24 Ağu 2026)

Faz kuralı: yön GENİŞLİK → DERİNLİK. Menü büyümez; ölçülmüş kusur onarılır ve onarımın
üstüne bir KAPI konur. Devralınan kırmızı ADLARI büyüyemez (RULES 9) — büyürse değişiklik
geri alınır (`f0c1398` bunun uygulandığı commit).

| dosya | içinde ne var |
|---|---|
| `GECE/V2-R.md` | araştırma hükümleri: GarmentCode/Seamly2D/FreeSewing primitif kıyası, ratchet kapılarının kaynak deseni (PHPStan / Android-lint / betterer / k8s `verify-generated.sh`), sözlük otoritesi hükmü (`engine/vocab.json` otorite, `contract/vocab-resolution-v1.json` alt katman). |
| `GECE/V2-A.md` | söküm hükmü: menü dilindeki her dosyanın BAĞLANDI / `_LEGACY`-adayı yargısı, damar kalemleri ve beş yok operatör sicile isimle yazıldı. Hüküm verir, sürgün yapmaz — `engine/` altına tek bayt yazılmadı. |
| `GECE/V2-B.md` | iki sözlük kapısı ctest'e bağlandı: `vocab_source_check` (`vision-student/vocab.py` artık üreteç çıktısı) ve `vocab_reference_check` (ratchet). Kartın `a6b473a` tabanının kesildiği gün kırmızı olduğu ölçüldü, taban `b799748`'de yeniden kesildi — sapma gerekçesiyle §2.1'de. |
| `GECE/V2-C.md` | sevk edilen sınırın iki ölçülmüş kusuru: 26 int ekseninde sessiz kırpma ve `collarType` NaN. NaN'ın kökü `bodice.cpp makeFacing()`'te çıktı; V0-0D'nin teşhisi anahtar adları tutmayan bir ölçüm gövdesinden geliyormuş (§5 madde 1). Kapı: `wasm_spec_honesty_check`. |
| `GECE/V2-D.md` | commit sonrası doğan iki kırmızı kapatıldı: sevk edilen üç artefakta kaynak özeti damgası (`build-wasm.sh`), ratchet tabanının yeniden kesilmesi. `?v` bump'ı yapıldı, `generated_ratchet_check`'i kırmızıya düşürdü ve **geri alındı** — kusur DURUYOR, §5.2'de ölçülmüş çözüm adayıyla. |
| `GECE/KART/V2-A-sokum-hukmu.md` · `V2-B-iki-kapi.md` · `V2-B2-kapilari-bitir.md` · `V2-C-sevk-hatti-durustlugu.md` · `V2-D-iki-yeni-kirmizi.md` · `V2-R-arastirma.md` | altı işçi kartının brief'i: kapalı kaynak listesi, çıktı dosya kümesi, teslim şartı. |
| `GECE/log/V2.ctest.before.txt` · `V2-B.ctest.after.txt` · `V2-C.ctest.{before,after}.txt` · `V2-D.ctest.after.txt` · `V2-SEF.ctest.{kanit,final}.txt` | fazın tam `ctest` koşuları. Kırmızı AD kümesinin büyüyüp büyümediği bu dosyaların `diff`'inden okunur, buradaki bir cümleden değil. |
| `GECE/log/V2-B.bostest.{source,ratchet}.txt` · `V2-C.bostest.txt` | BOŞ TEST: her yeni kapının faz ÖNCESİ ağaca/bayta karşı KIRMIZI düştüğü koşular. Kapatılmış test değil olduklarının kanıtı burada. |
| `GECE/log/V2-B.mutasyon.txt` · `V2-C.mutasyon.txt` · `V2-D.mutasyon.txt` | mutasyon kanıtı: her kapı için kasıtlı bozma → kırmızı, geri alma → yeşil. V2-C M3 ilk turda sağ kaldı ve kapı gevşetilmek yerine genişletildi; V2-D M2 damganın gerekliliğini bayt olarak gösteriyor. |
| `GECE/log/V2-D.vocab.{baseline,before,after,delta}.txt` | ratchet tabanının yeniden kesilmesinin ölçüm defteri: kımıldayan tek anahtar (`sleeveCap 144 → 146`) ve o +2'nin iki yorum satırından geldiği, kelimeyi taşıyan 40 dosyanın diğer 39'unun birebir aynı kaldığı. |
| `GECE/log/V2-C.baseline.txt` · `V2-D.baseline.txt` | `node engine/tools/wasm-baseline.mjs` koşuları. V2-D'de gecikme bantları AŞILDI; kök teşhis makine yükü (ölçülen modül baytı bu kartla aynı), `GECE/V2-D.md` §5.1. |
| `GECE/log/V2-D.{build-wasm,engine-bytes,bundle-fresh.after,generated-ratchet.after}.txt` | damgalı sevk hattının koşuları: `build-wasm.sh` exit'i, motor baytının değişmediğinin sha256'sı, iki kapının damgadan sonraki çıktısı. |
| `engine/tests/vocab-reference-baseline.json` | ratchet TABANI. Deftersiz taban geçersiz; yeniden kesme gerekçesi commit mesajına ve faz tutanağına yazılır (`--baseline` `_yasa` metnini yeniden ürettiği için taban dosyasına elle yazılan gerekçe bir sonraki kesmede silinir). |

## V3 fazı — flat'in dış konturu kabuktan hesaplanıyor (24 Ağu 2026)

Faz kuralı: flat ile kalıp AYNI 3B kabuktan beslenir; eski çizim hattı silinmez, yan yana
durur. Kurulan kapı kırmızı düşerse gevşetilmez, sayısıyla raporlanır (RULES §6, §9).

| dosya | içinde ne var |
|---|---|
| `GECE/V3-K.md` | keşif: flat hattı ve kalıp hattı bugün nereden çıkıyor, iki kalem (üretim + referans), `contract/flat-convention-v1.json`'un kaynaksız 6 sabiti, kalıp tarafının `BodySurface`→`GarmentSurf` zinciri, altı ölçüyü bugün hangi aletin basabildiği. Hüküm: ortak beden çizelgesi var, ORTAK KABUK YOK. |
| `GECE/V3-A.md` | `GarmentSurf` `surfacepattern.hpp`'ye yayınlandı, yapılandırma `buildGarmentSurf`'te tek yere indi, `shellprojection.{hpp,cpp}` ortografik izdüşümü, `shell-flat` aleti. Kalıp hattının bayt bayt değişmediğinin stash'li kanıtı §"KALIP HATTI BAYT BAYT DEĞİŞMEDİ". |
| `GECE/V3-B.md` | `engine/tools/pattern-measure.mjs`: kalıp panellerinden altı ölçü, üçü `null` + yazılı sebep. Determinizm (üç örnekleme adımında aynı dört basamak) ve `shell-flat` ile yan yana tablo. |
| `GECE/V3-C.md` | iki kapının kuruluşu ve İLK KIRMIZI hükümleri: eşiklerin kaynağı (1.0° McNeel; %1.5 kaynak DEĞİL karar), dört artefakt sınıfının sayımı, sınıf 4'ün sınıf 3'ü maskelediğinin bulunması. |
| `GECE/V3-D.md` | onarım turu: dejenere 6→0, `body_length` tanımının düzeltilmesi, iki devralınan kırmızının kapanması; bel köşe yuvarlamasının ölçülüp REDDEDİLMESİ ve geri alınması. Kırmızı AD kümesi büyümedi, küçüldü. |
| `engine/src/shellprojection.{hpp,cpp}` | ortografik izdüşüm; tek iddia (`siluet yarı-genişliği = a + d`) dosyanın başında beyanlı. |
| `engine/src/surfacepattern.hpp` | `GarmentSurf` bildirimi + `buildGarmentSurf`. Tanımlar `surfacepattern.cpp`'de; **ikinci kabuk sınıfı yazmak yasak**, gerekçesi dosyanın başında. |
| `engine/tools/shell-flat.cpp` | alet: `./engine/build/shell-flat EU38` → JSON, `--svg` → 1:1 SVG. |
| `engine/tools/pattern-measure.mjs` | kalıp tarafının cetveli; kenarı olmayan ölçüye sayı türetmez, `null` + sebep basar. |
| `engine/tests/flat_pattern_agree_check.mjs` | KAPI, **24 Ağu'da KIRMIZI: 1 ihlal** (`body_length` −3.7979%, tolerans %1.5) + UNMEASURED 3/6 ratchet tavanında. |
| `engine/tests/flat_artifact_census.mjs` | KAPI, **24 Ağu'da KIRMIZI: 1 ihlal** (sınıf 3, 2 nokta × 20.560216°, eşik 1.0°). Sınıf 1/2/4 sıfır basıyor. |
| `GECE/log/V3.ctest.{before,after}.txt` · `V3-D.ctest.txt` | fazın tam `ctest` koşuları. Kırmızı AD kümesinin büyüyüp büyümediği bu dosyaların `diff`'inden okunur. |
| `GECE/log/V3-C.vacuous.txt` | BOŞ TEST: faz ÖNCESİ flat artefaktı aynı aletlerle yargılandı, dört sınıfın dördü de ateşledi, altı ölçünün altısı kırmızı. Kapatılmış test olmadığının kanıtı. |
| `GECE/log/V3-C.mutation.txt` | mutasyon kanıtı: her kanat için kasıtlı bozma → kırmızı, geri alma → yeşil; +5mm'nin eşiği neden kırmadığı sayıyla. |
| `GECE/log/V3-D.census.{before,after1}.txt` · `V3-D.agree.after.txt` | dejenere segment 6→0 ve `body_length` tanım düzeltmesinin önce/sonra çıktıları. |
| `GECE/log/V3-D.waistblend.rejected.txt` | REDDEDİLEN hamle: bel köşe yuvarlaması kırığı 20.5602°→0.4582° kapatıyor ama bel halkasını +36.1166mm şişirip dört kapıyı kırmızıya düşürüyor. Tam ctest + geri alınan yamanın diff'i. |
| `GECE/log/V3-D.{wasm,vocab.after-dedup}.txt` | sevk edilen üç artefaktın tazelenmesi ve vocab ratchet tabanının yeniden kesilmesinin ölçüm defteri. |

Bu fazın kalıcı gerçekleri docs'a işlendi: `docs/ARCHITECTURE.md` §11 (hat, aletler, iki kapı,
reddedilen hamle, beyan edilmiş sınırlar), `docs/KATMAN-HARITASI.md` (yeni **L3a′** satırı +
boşluk 3/4/5), `docs/G5-OMUZ-PLANI.md` (G5'in açığını sayan kapı), `docs/H1.0-KAPI.md` K6
(`GarmentSurf` yayınlandı, `TopProfile` hâlâ kapalı), `docs/SATIS-SARTNAMESI.md` §1
(kontur hesaplanıyor ama listing flat'i değil).

## V4 fazı — flat konvansiyonu: croquis çıkarımı, ifade kapısı, zevk panosu (24 Ağu 2026)

Faz kuralı: kapı, düzeltmeye çalıştığı kusuru VARSAYAMAZ; eşik dış yayına ya da ölçüme
bağlanır, uydurulmaz; devralınan kırmızı ADLARI büyüyemez (RULES §9).

| dosya | içinde ne var |
|---|---|
| `GECE/V4-R.md` | eşiklerin yayınlanmış zemini: ISO 128-2:2020 md.5.1 izinli kalınlık serisi ve ±0,1d toleransı, Tablo 4 kesik alfabesi (3d boşluk / 6d / 12d / ≈24d), ISO 128-3:2022 md.4.12 detay callout'un dört şartı, ISO 5455:1979 ölçek dizisi. ★ `1:3` o dizide YOKTUR, yalnız md.5.1 NOTU'nun "intermediate scale" istisnasıyla meşrudur. ASME gövdeleri ödeme duvarında = **ERİŞİLEMEDİ**, "yok" değil. |
| `GECE/V4-K.md` | iki flat hattının ölçümü: HAT-1 (hesaplanan kabuk, `shell-flat`) vs HAT-2 (çizim kalemi, `render-garment-flat.mjs`). Beş konvansiyon maddesinin ikisi HAT-1'de ÜRETİLEMEZ (stil parametresi 0, beyanlı çizgi sınıfı 0); HAT-1'de ön panel = arka panelin ayna kopyası (fark 0.000000000 mm); teknik çizim öğesi sicili HAT-1 0/9, HAT-2 9/9. Hangi hattın yargılanacağı hükmü ve her seçeneğin ölçülmüş bedeli. |
| `GECE/V4-C.md` | zevk panosunun referans dili (Chanel / hızlı moda / Gen-Z / indie Etsy kalıp listingleri) ve her satır için "bizde karşılığı + ölçülebilir mi + eksiklik nasıl kapanır". ⚠ Chanel, Bershka PDP ve Etsy **403 / bot duvarı** — o kovalardan görsel doğrulama SIFIR. Ayrıca bugünkü 10 hücrelik ESKİ panosunun kaydı. |
| `GECE/V4-A.md` | croquis çıkarımının KÖKTEN değişmesi: omuz ucu artık "x'in ilk yerel maksimumu" değil, omuz kirişi ile kol oyuğu kirişinin buluştuğu köşe — omuz/göğüs oranından bağımsız. Ardından ölçülmüş düzeltme uygulandı: `shoulderTipX` 78.0u → **70.1799u**, `shoulderTipY` 19.36u → **16.8576u**. Mutasyon kanıtı + yan etki ölçümü. |
| `GECE/V4-B.md` | ifade kapısının kuruluşu (`flat_expresses_spec_check`) ve iki sessiz çökertmenin kökten onarımı (`sleeveStyle` puff yalnız sayısal alandan okunuyordu, raglan hiçbir dalın koşulu değildi). Kapalı-enum ratchet'inin onarımı; `flat_convention_check`'e 3b/3c/3d kanatları. |
| `GECE/V4-D.md` | ESKİ\|YENİ panosu (3 sayfa, 30 hücre) ve fazın **en sert bulgusu**: 10 stil hücresinin 10'u da eski ile bayt bayt AYNI, çünkü 9 stilin 9'u referans kaleme düşüyor — kanunun bağladığı kalem panoyu basan kalem DEĞİL. Kol ailesinde görünen fark ve kırpma sayımı (30 gömmenin 30'u `xMidYMid meet`, kırpma aracı 0). |
| `GECE/KART/V4-*.md` | altı işçi kartının brief'i: kapalı kaynak listesi, çıktı dosya kümesi, teslim şartı. |
| `engine/tests/flat_expresses_spec_check.mjs` | KAPI (yeni, `engine/CMakeLists.txt`'te kayıtlı). Kalemin ayırt ettiğini iddia ettiği her değer ölçülebilir biçimde FARKLI çizmeli; motorun kesemediği değer `data-engine-gap`'te eksik operatörün ADIYLA geçmeli. Bugün ayrılamayan eksenler gizlenmiyor, (C) bölümünde sayıyla basılıyor. |
| `engine/tools/flat-board.mjs` | zevk panosu / kıyas aleti. `--eski <dizin>` sol sütunu DİSKTEN okur (yoksa yüksek sesle çöker), `--ek` ek satır dizinleri ekler. Hücre altına `bayt bayt AYNI` / `FARK VAR` basar ama **exit kodunu etkilemez** — bugün bir kapı değil, gösterge. |
| `GECE/log/V4-C.pano/` · `V4-D.pano/` | panoların kendisi (PNG + SVG) ve hücre başına kaynak stil SVG'leri, kırpmasız. |
| `GECE/log/V4-B.kol/` · `V4-D.kol-eski/` | kol ailesinin YENİ (HEAD) ve ESKİ (`c396fb4` detached worktree'sinden üretilmiş) çıktıları. Sol sütun onsuz yeniden üretilemezdi. |
| `GECE/log/V4-A.inference.txt` | aynı çıkarımın iki croquis'te (omuz dışarıda / omuz içeride) doğru omuz ucunu bulduğunun kanıtı; eski çıkarımın koltukaltını omuz sandığı köşe dizisi yan yana. |
| `GECE/log/V4-A.mutasyon.txt` · `V4-B.mutasyon.txt` | mutasyon kanıtı: kasıtlı bozma → kırmızı + exit 1, geri alma → yeşil + exit 0. |
| `GECE/log/V4-B.ratchet.txt` | kapalı-enum ratchet'inin önce/sonra defteri. Taban YENİDEN KESİLMEDİ; artıran geri alındı. |
| `GECE/log/V4.ctest.before.txt` · `V4-A.ctest.after.txt` · `V4-B.ctest.after.txt` · `V4.ctest.after.txt` | fazın tam `ctest` koşuları. Kırmızı AD kümesinin büyüyüp büyümediği bu dosyaların `diff`'inden okunur, buradaki bir cümleden değil. ⚠ V4-D'de tam ctest KOŞULMADI (`engine/build` başka koşuda) — o kart bunu **DOĞRULANMADI** diye işaretliyor. |
| `GECE/log/V4-D.kapilar.txt` | üç node kapısının peş peşe koşusu (konvansiyon · ifade · geometri/satılabilirlik), yan sayılarıyla birlikte. |

Bu fazın kalıcı gerçekleri docs'a işlendi: `docs/ARCHITECTURE.md` §12 (croquis çıkarımı,
iki yeni kapı kanadı, iki kalem sorunu), `docs/KATMAN-HARITASI.md` L3a satırı + boşluk 6,
`docs/G5-OMUZ-PLANI.md` (flat croquis'inin omzu artık kaynaklı, yüzeyin omzu değil),
`docs/SATIS-SARTNAMESI.md` §1 (çizgi hiyerarşisi kutucuğunun bugünkü ölçüm durumu),
`README.md` (determinizm cümlesinin ayırt-etme yüzü).

## Ölçüm aletlerini çalıştır

```
python3 GECE/f0-measure-pattern.py EU38          # kalıp ölçüleri (cm)
node    GECE/f0-measure-flat.mjs <styleKey>      # flat siluet ölçüleri (birimsiz)
cd engine/build && ctest                          # 232 sn
```

## Kural
Bir faz açılırken context'e giren dosyalar SADECE: `GECE/KOSU.md` + `RULES.md` +
o fazın brief'i + fazın adıyla saydığı kaynaklar. `HEDEF.md`, `DAMLA-KUYRUK.md`,
`devlog.md`, `linkedin.md` **hiçbir faza girmez** — gerekirse `grep` ile tek satır.
