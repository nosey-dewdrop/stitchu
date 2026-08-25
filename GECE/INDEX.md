# GECE/ — yönlendirme

Bu koşu tek context'te yürümez. Aşağıdaki tabloya bakıp **sadece** ihtiyacın olan
dosyayı aç.

| şunu sorarsan | şu dosyaya bak |
|---|---|
| şu an neredeyiz, ne açık | `GECE/KOSU.md` (≤150 satır, canlı durum) |
| bir faz gerçekten kapandı mı, hakem ne dedi | `GECE/KAPI.md` |
| bugün ne var ne yok, sayılar nereden geldi | `GECE/V9-A.md` (25 Ağu sayımı). ⚠ Eski satırın gösterdiği `GECE/F0.md` bu ağaçta **YOK** (`test -e` başarısız) |
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
| sevk edilen kalıp dikilebilir mi, hangi soru sorulamıyor | `node engine/tests/sewability_check.mjs` basar; cevaplanamayan soru `ABSENT:` satırı olur, teşhis `GECE/V5-A.md` |
| kalıbın ölçüleri yayınlanmış bir bloğa uyuyor mu | `node engine/tests/draft_math_check.mjs` basar; kaynağı olmayan kalem `KAYNAKSIZ` basar, künyeler `GECE/V5-R.md` |
| bu iki kapı "yeşil" derken ne diyor | tavanlar `engine/tests/v5-ratchet-baseline.json`'da; yeşil = "ihlal ≤ dondurulmuş tavan", ihlaller yine adıyla basılıyor (`GECE/V5-E.md` §ŞEF EKİ) |
| motorun parçası Buğra'nınkiyle nasıl örtüşüyor | `node engine/tools/bugra/overlay-png.mjs locket --size=36 --out=<dizin>`; son koşu `GECE/log/V5-B2.overlay/`, `V5-B2.corset/`. **Alet, kapı değil** |
| görü kelime listesi nereden geliyor | üreteç `engine/tools/gen-vision-vocab.mjs` → `vision-student/vocab.py` (elle düzenlenmez); bekçi `ctest -R vocab_source_check` |
| menü büyüdü mü, ratchet ne diyor | `engine/tests/vocab_reference_check.sh` basar; taban `engine/tests/vocab-reference-baseline.json` |
| sevk edilen bayt kaynağıyla aynı mı | `engine/tests/bundle_fresh_check.sh` basar; damgayı `engine/build-wasm.sh` koyuyor (`stitchu.source-stamp`) |
| sınır kesirli/eksik değere ne yapıyor | `ctest -R wasm_spec_honesty_check` basar; teşhis `GECE/V2-C.md` |
| bir edit bölgesinde kaldı mı, kapı ne kadar ince ölçüyor | `node engine/tests/edit_locality_check.mjs` basar; kanun `contract/edit-locality-v1.json` (ELLE yazılmış, bekçisi YOK), granülarite ilanı `engine/tools/spec-diff.mjs` `LOCALITY_GRANULARITY`; teşhis `GECE/V6-B.md`, onarım `GECE/V6-E.md` |
| "şuraya ekle" bugün neyi gösterebiliyor | PANELİ, kenarı değil — `GECE/V6-C.md` (88 spec'te 0 adlandırılmış kenar). Kenar çıpası işi yan dalda: `research/v6-cipa-editleme` @ `3d8903c`, dönüş şartı `DAMLA-KUYRUK.md` K-V6A |
| bir kenarın ADI var mı, kim veriyor | `engine/src/geometry.hpp:40-71` `struct EdgeRole` (rol + komut aralığı + uç-nokta çapası, **uzunluk YOK**); çapa bayatlarsa ad DÜŞER (`geometry.cpp:233-262 reanchorEdgeRoles`, tek boğaz noktası `garment.cpp:1077-1085`). Teşhis `GECE/V7-A.md`, kuruluş `GECE/V7-C.md` |
| kol kapağı oyuğa uyuyor mu, hangi çizgiden ölçülüyor | `node engine/tests/sleeve_cap_ease_check.mjs` basar — oyuk (`armhole_front`+`armhole_back`) ve kapak (`sleeve_cap`) **ÇİZİLEN kenardan**, skaler kopyadan değil; eşik künyesi dosyanın kendi başlığında. Teşhis `GECE/V7-D.md` |
| hangi yollarda oyuk hâlâ ADSIZ (borç) | aynı kapının `ADSIZ OYUK SAYIMI` bölümü — 25 Ağu: `bardot_off_shoulder`, `yoke_top`, `cupseam_bustier`. Gerekçe `validator.cpp:333-352`, kayıt `GECE/V7-D.md` §8.5 |
| cap ease için yayınlanmış sayı var mı | `GECE/V7-R.md` (yayınlanmış / ikincil / DOĞRULANMADI ayrımıyla). Bedene göre ölçekleyen formül **BULUNAMADI**; puf/balonun nicel tanımı da yok |
| sevk edilen paketten kollu kalıp/flat nasıl görünüyor | `GECE/log/V7-E.png/` (3 kalıp PNG + 4 flat kol PNG/SVG); üreten `node engine/tools/render-pages.mjs <dizin>`, hat doğrulaması `GECE/V7-E.md` §0 |
| foto→spec isabeti bugün kaç | `node engine/tools/foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json` basar; payda **5** ve neden büyütülemediği `GECE/V6-A.md` §1 |
| sitenin cümleleri motorun gerçeğini mi söylüyor | `node engine/tests/landing_truth_check.mjs` basar (ctest adı `landing_truth_check`); beş denetim L1…L5, kayıtlı borç `engine/tests/landing-truth-baseline.json`. Kapı cümlenin BİÇİMİNİ ölçer, DOĞRULUĞUNU değil — sınırları kendi başlığında |
| sitede hangi bedenler yazabilir | L5 tek kaynağa bağlar: `contract/layers/shape-ratios.json` beden kümesi; kullanıcının seçebildiği liste (`web/js/create.js` `EU_SIZES`) motorun kümesinin üstkümesi olamaz |
| MTM (ısmarlama) dili siteden nasıl çıktı | `GECE/V10-C.md` (landing) → `GECE/V10-D.md` (site geneli) → `GECE/V10-F.md` (üreteçler) → `GECE/V10-G.md` (kapıdan kaçan 20 kalıp). Cümle cümle önce/sonra tablosu her dosyanın içinde |
| sayfa 320/390/1440 px'te taşıyor mu | `node GECE/v10-e-olcu.mjs` basar; ölçümler `GECE/log/V10-E.olcum-{320,390,1440}.json`, ekran görüntüleri `GECE/log/V10-E.png/` (9 PNG), tutanak `GECE/V10-E.md` |

## Faz tutanakları — tek satır, tek yol

Faz başına ŞEF tutanağı. Alt tutanaklar ve loglar aşağıdaki faz bölümlerinde.

| faz | ne yaptı | tutanak |
|---|---|---|
| V0 | dürüst envanter: motor/görü/vitrin/sözlük/wasm sayıldı, onarım yapılmadı | `GECE/V0.md` |
| V1 | pin ve kaynak temizliği: devralınan kırmızıların sınıflandırılması ve golden mühür defteri | `GECE/V1.md` |
| V2 | sözlük reformu + sevk hattı dürüstlüğü: iki sözlük kapısı ve sınırın iki kusuru | `GECE/V2.md` |
| V3 | tek nesne: flat ile kalıp aynı 3B kabuktan besleniyor, iki kapı kuruldu | `GECE/V3.md` |
| V4 | flat konvansiyonu: croquis çıkarımı, ifade kapısı, zevk ön-taraması | `GECE/V4.md` |
| V5 | dikilebilirlik + kalıp matematiği kapıları, ratchet'li | `GECE/V5.md` |
| V6 | giriş hattı: foto+prompt → spec ve editleme lokalliği | `GECE/V6.md` |
| V7 | kol çekirdek fazı: kenar kimliği + oyuk↔kapak kapısı | `GECE/V7.md` |
| V9 | doküman doğruluğu: sayım, `docs_truth_check`, kâtip turları | ⚠ şef tutanağı `GECE/V9.md` bu satır yazılırken **diskte YOK**; alt tutanaklar aşağıda |
| V10 | site doğruluğu: MTM dili ve duran iddialar `web/`'den ve üreteçlerden söküldü, sabit 8 beden (EU34–48) `landing_truth_check` ile mekanik hâle geldi | `GECE/V10.md` (şef yazacak; kâtip bu satırı yazarken **diskte YOK**) — alt tutanaklar aşağıda |

⚠ **V8 fazı YOKTUR** — numara atlanmıştır, kayıp dosya değildir (`GECE/V8*.md` diskte yok).

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
| `GECE/V3-R.md` | fazın araştırma çıktısı (kart `GECE/KART/V3-R.md`, §5.1): eşiklerin yayın zemini. |
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
| `GECE/V4-E.md` | hakemin KALDI hükmünün iki kusurunun onarımı: ifade kapısının değer alanı artık ELLE YAZILMIYOR, beş kaynaktan türetiliyor (takipli JSON'lardaki fiili kullanım + vocab kapalı enum'u + üç sözleşme) — ve fiilen en çok kullanılan puf yazımı (`balloon`, 35 kullanım) sessiz çökertmeden çıkarılıp gerçekten ifade edildi. İfade edilemeyen 5 değer ADIYLA UNEXPRESSED'e yazıldı ve RATCHET'landı (yaka 4, omuz 1). Raglan: 4 kopya basan yinelenen çizim kökten öldü, kol parçası artık yaka tabanından başlıyor, ve raglanın YANLIŞ EKSENDE (kol yerine omuz) durduğu ölçüldü. |
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

## V5 fazı — dikilebilirlik + kalıp matematiği kapıları, RATCHET'li (25 Ağu 2026)

Faz kuralı: eşik yayına bağlanır ya da **KAYNAKSIZ** diye basılır, uydurulmaz; cevaplanamayan
soru geçmiş sayılmaz, `ABSENT:` diye ADIYLA basılır; devralınan kırmızı ADLARI büyüyemez
(RULES §9) — bu yüzden iki yeni kapı ctest'e ancak ölçülmüş bir tavanla girdi.

| dosya | içinde ne var |
|---|---|
| `GECE/V5-R.md` | eşiklerin kaynak sicili (761 satır): 1/32 inç toleransı için **yayın bulunamadı** hükmü ve reponun `seamrules.py:33-35`'teki Fasanella alıntısının ÇÜRÜTÜLMESİ · Aldrich blok formülleri (scye derinliği, omuz, yaka) baskı baskı ayrıştırılmış · Threads #221 s.71 minimum ease tablosu birincil · ANSUR II baş/omuz antropometrisi ham CSV'den hesaplanmış · Coats'un 2.5 cm gizli fermuar kuralı. Erişilemeyenler ve DOĞRULANMADI'lar ayrı bölümde. |
| `GECE/V5-A.md` | `sewability_check`'in kuruluşu: 16 draft · 112 parça · 96 kapalı kontur, **585 ihlal kalemi adıyla**, ve cevaplanamayan **7 soru ABSENT olarak**. Kök teşhis: sevk edilen artefaktta dikiş grafiği YOK, `notches` tipsiz tek kanal; çentikler parçanın kendi sınırından bağımsız bir x'e basılıyor ve sapma bedenle büyüyor (EU34 28.83 → EU48 78.93 mm). |
| `GECE/V5-B.md` | `overlay-png.mjs`'in kanıt koşusu: locket_top ve corset_bustier beden 36, parça başına Δbbox/Δçevre/sapma tablosu, ve kesilen oturumun koşusuyla bayt bayt aynı çıktığının `diff`/`md5` kanıtı. **Kapı değil, alet** — buradan "kalıp yanlış" hükmü çıkmaz. |
| `GECE/V5-D.md` | `draft_math_check`'in kuruluşu: 8 kalem × 8 beden = 64 yargı (GEÇTİ 12 · KALDI 12 · **KAYNAKSIZ 40**). **12 ease ihlali adıyla**; kök teşhis payın CİNSİ (motor çarpımsal, yayın toplamsal — kalça payı/kalçaCM 8 bedende bit-sabit 0.2000). Çözüm adayları ve kıracakları golden pinler adıyla yazılı, UYGULANMADI. Ayrıca `body.shoulder`'ın ölü girdi olduğunun ölçümü. |
| `GECE/V5-E.md` | iki kapının ctest'e BAĞLANMASI: **111 → 113 test**, `reddiff` boş (yeni kırmızı ad yok). Ratchet'in ne yakalayıp ne yakalamadığı §ŞEF EKİ'nde: ham kapı faz-öncesi motorda kırmızı düşüyor, **ratchet katmanı düşmüyor** — çünkü ratchet bugünkü kusuru dondurur, BÜYÜMESİNİ yakalar. |
| `GECE/KART/V5-E.md` · `V5-RAP.md` | iki işçi kartının brief'i: kapalı kaynak listesi, çıktı dosya kümesi, teslim şartı. |
| `engine/tests/sewability_check.mjs` · `draft_math_check.mjs` | KAPILAR, `engine/CMakeLists.txt`'te kayıtlı ve gerekçesi `add_test`'in üstünde. İkisi de her ihlali ADIYLA basar; exit kodu tabana bağlıdır. |
| `engine/tests/v5-ratchet-baseline.json` | ratchet TABANI — iki kapının bütün tavanları, her tavanın künyesi + ölçüm tarihi + ölçüm ağacı + basan komut. Tavan ELLE BÜYÜTÜLEMEZ; altına düşünce kapı `TAVAN DÜŞÜRÜLEBİLİR: X -> Y` basar ve dosyayı güncellemek AYRI bir commit'tir. Emsal: `vocab-reference-baseline.json`. |
| `engine/tools/bugra/overlay-png.mjs` | ALET: motor parçasını satın alınmış Buğra halkasıyla 1:1 mm üst üste basar (döndürme/en-iyi-oturtma/ölçek yok, eşleme elle yazılmış `NAME_MAP`'ten), yanına sayısal fark tablosu çıkarır. Exit kodu bir hüküm taşımaz. |
| `GECE/log/V5-B2.overlay/` · `V5-B2.corset/` | levhaların kendisi (6+6 PNG + 6+6 SVG), kırpmasız, `data-scale="1:1"`. Sayı tabloları `V5-B2.rerun.txt` ve `V5-B2.corset.txt`. |
| `GECE/log/V5-A.bostest.txt` · `V5-D.bostest.txt` | BOŞ TEST: iki kapının da ratchet'siz hâliyle faz-öncesi ağaca karşı **exit 1** düştüğü koşular. Kapatılmış test olmadıklarının kanıtı burada. |
| `GECE/log/V5-A.mutasyon.txt` · `V5-D.mutasyon.txt` · `V5-E.mutasyon.txt` | mutasyon kanıtı. Sonuncusu ratchet katmanının 8 bozmasını taşıyor: 8/8 exit 1, geri alınca iki kapı da exit 0. |
| `GECE/log/V5.ctest.opening.txt` · `V5-A.ctest.after.txt` · `V5-E.ctest.after.txt` · `V5-E.reddiff.txt` | fazın tam `ctest` koşuları ve kırmızı AD farkı. Kümenin büyüyüp büyümediği bu dosyaların `diff`'inden okunur, buradaki bir cümleden değil. |
| `GECE/log/V5-A.8beden.txt` · `V5-D.run.txt` · `V5-D.remedy.txt` · `V5-D.addtest.txt` | beden beden dökümler, kapının ham koşusu, ölçülmüş çözüm adaylarının koşusu ve `add_test` satırının hazırlığı. ⚠ `V5-D.remedy.txt`'in "hepsi bantta ✔" çözüm adayı V5-F'te YENİDEN KOŞULDU ve **aritmetik olarak çürüdü** (halka artışı doğrudan paya eklenmiş; gerçek kazanç 16.65 değil 1.65 mm). Dosya düzeltilmedi; çürütme `GECE/V5-F.md` §KÖK TEŞHİS'te. |
| `GECE/V5-Z.md` | ZEMİN KEŞFİ — onarım yok, yalnız ölçüm. **Fazın en ağır bulgusu burada: sevk edilen kalıp motoru TEK-YÜZEY motoru DEĞİL**, eski 2B çizici `GarmentDrafter::draft` (`engine/src/garment.cpp`). Hükmü kesen alet sembol grep'i değil wasm KAYNAK LİSTESİ (`grep -c "surfacepattern\|flatten.cpp\|…" engine/build-wasm.sh` → 0, aynı altı dosya `engine/CMakeLists.txt:12-17`'de VAR). Ayrıca sekiz kalemlik grep sicili (dikiş çifti · çentik · kapalılık · köşe açısı · giyilebilirlik · geri projeksiyon · strain · ölçüm aleti) ve Buğra overlay'i için diskte hazır olanın envanteri. |
| `GECE/V5-F.md` | **§7.1 DÜZELTMESİ: YAYINLANMIŞ BİR BANT RATCHET'LENEMEZ.** `draft_math_check`'in ease bölümü tavandan çıkarılıp REGRESYON ÇİZGİSİNE bağlandı; 12 ihlal her koşuda `SERT HUKUM, ratchet DEGIL` diye beden+mm+bant+künyeyle basılıyor, kapanması Damla kararı (`K-V5A`). Ayrıca V5-D'nin çözüm adayının çürütülmesi ve adayın ölçülmüş BEDELİ: 8 bugün-yeşil kapı risk altında, en pahalısı `bugra_bridge_check` (75.38 sn). |
| `GECE/V5-G.md` · `GECE/KART/V5-G.md` · `KART/V5-H.md` | uzlaşma + hakem turları: kırmızı AD kümesini 6→7 büyüten hamlenin geri alınması (RULES §9), `DAMLA-KUYRUK.md` K-V5A satırının yazılması, hakemin büyüklük körlüğünün kapatılması. |
| `GECE/V5-H.md` | hakemin büyüklük (magnitüd) körlüğünün kapatılması ve ikinci kör yönün ölçümü; kart `GECE/KART/V5-H.md`. |
| `GECE/V5-I.md` | kapı dosyasındaki çürümüş sayıya şerh düşülmesi; kart `GECE/KART/V5-I.md`, doğrulama `GECE/log/V5-I.dogrulama.txt`. |
| `GECE/V5-R-kurtarma.md` | kesilen şefin banklayamadığı iki araştırma çıktısının kurtarılması; ikinci kesim `GECE/V5-R.md`, kartı `GECE/KART/V5-R2.md`. |
| `GECE/log/V5-F.mutasyon.txt` · `V5-F.ctest.after.txt` · `V5-F.reddiff.txt` · `V5-G.*` · `V5.ctest.final.txt` | V5-F'in 8 koşuluk mutasyon defteri — bandın ALT ve ÜST ucunun ayrı ayrı bekçilik ettiği, ve ratchet ile bandın exit kodunu AYRI AYRI düşürdüğü orada görülüyor — artı fazın kapanış ctest'i. |

Bu fazın kalıcı gerçekleri docs'a işlendi: `docs/ARCHITECTURE.md` §13 (sevk edilen motorun
kimliği · iki kapı · ratchet'in NEREDE meşru nerede değil · overlay aleti · çürütülen
tolerans künyesi) + §10'a düşülen şerh + "Known limits" beş satır,
`docs/KATMAN-HARITASI.md` L3b satırı + boşluk 7 (dikiş grafiği yok), 8 (`shoulderCM` ölü
girdi), 9 (L3b'nin sevk edilen hattı haritanın tanımı değil),
`docs/G5-OMUZ-PLANI.md` (üç kapının da künyesi: tolerans, armhole bandı, Buğra paritesi aleti),
`docs/SATIS-SARTNAMESI.md` §4b (rehberin ölçülmeyen baş-geçiş kontrolü) + montaj sırası
maddesine "hangi artefaktta dikiş grafiği var" şerhi,
`README.md` (mühürlü mimari ile sevk edilen hattın AYRIŞTIRILMASI — iki yerde, biri
çürütülmüş bir cümlenin üstü çizilerek; iki kapının halka açık ifadesi; payın cinsi
dürüst limit olarak).

⚠ **25 Ağu düzeltmesi:** bu bölümün ilk hâli iki kapıyı da "ratchet" diye anlatıyordu.
V5-F o cümleyi böldü — `sewability_check` düz ratchet, `draft_math_check` ise (a)+(c)'de
ratchet ama (b) girth ease'de **değil**. Eski cümle silinmedi, docs'ta gerekçesiyle
güncellendi.

## V6 fazı — editleme zinciri: lokallik kapısının dişi + çıpa granülaritesi (25 Ağu 2026)

Faz kuralı: kapı GEVŞETİLMEZ; devralınan kırmızı ADLARI büyüyemez (RULES §9) — bu faz o kuralı
İHLAL ETTİ, hakem **KALDI** dedi, ve yeşile dönüş kapıyı kandırarak değil **işi geri alarak**
yapıldı. Ana dala kalan net mühendislik **89 satır**: `edit_locality_check.mjs` +79,
`spec-diff.mjs` +10. Kalan her şey tutanak/log/kart ya da yan dal.

| dosya | içinde ne var |
|---|---|
| `GECE/V6-R.md` | araştırma hükümleri (549 satır): ChatGarment (CVPR 2025, arXiv:2412.17811, kod Apache-2.0) VLM→GarmentCode JSON'da üç sadeleştirme — koşullu alan budama (900→350 token), float [0,1] normalizasyonu, sayıyı dilden ayırıp MLP ile çözme — ve konumlu edit dili emsalleri. Her sayı kaynağın HTML gövdesinden birebir; görülemeyen sayı "metinde bulunamadı" diye yazılı, tahmin edilmedi. |
| `GECE/V6-A.md` | foto→spec ÖNCE ölçümü: `--bank` bayrağı neden eklendi (banka adı tarih damgalıydı, dünkü koşu tekrar edilemiyordu), bugünkü isabet (FOTO 5 · TAM DOĞRU SPEC 1 · ALAN 47/51), paydanın neden 5'ten büyük yapılamadığı (14 etiketli foto ücretli çağrı ister), dört tahmin dosyasının EŞİT OLMAYAN paydalarla yan yana tablosu, KONUM hata sınıfının tanımı ve iki sicilin (terms.json / vocab-canonical.json) 26 terimden 0'ını tanıması. |
| `GECE/V6-B.md` | `edit_locality_check` TEŞHİSİ (onarım yok): kapının hangi motoru koştuğu dosya:satır kanıtıyla (WASM, kaynak damgası sevk edilen baytla aynı), 12 vakanın panel-yargısı dökümü, bölge listesinin ELLE yazıldığının kanıtı + `_bolge_kaynagi` iddiasının 22 bileşende 3 YANLIŞ ölçülmesi, ve dört mutasyon: M2/M3/M4 kırdı, **M1 KIRMADI** (bayt→panel varlığı, kapı yeşil kaldı). |
| `GECE/V6-C.md` | çıpa kaynağı teşhisi: kenar granülaritesinde ÜRETİLEMEZ (88 spec'te 0 adlandırılmış kenar; `primitives-v1.json` `edge.label` alanını tanımlıyor, dolduran yok), panel granülaritesinde üretiliyor (35 serbest bölge-panel çifti). Üç aday kontrat dosyası isim isim açılmış. |
| `GECE/V6-E.md` | **ana dala kalan onarım.** M1 açığının kök teşhisi (`antiCaught > 0` mutlak sıfır eşiği), A1 tabanı (`A1_FLOOR = 10`, iki yönlü ratchet), sessiz atlama tavanı (`A1_SKIP_CAP = 1`, atlananlar ADIYLA), A4 granülarite mandalı (ilan + 0.001mm oynatma + oynatmasız kontrol). Üç mutasyon, üçü de kırıyor. "10/12"nin gerçek anlamı: 10 yakalandı + 1 yakalanmadı + 1 hiç koşulamadı. |
| `GECE/V6-J.md` | **kapanış:** reddedilen işin yan dala alınması ve ana dalın yeşile dönmesi. Beş adımlı ölçüm zinciri (10448 FAIL → 10452 FAIL → 10448 → 10438 **hâlâ FAIL** → 10432 YEŞİL) ve iki dersi: toplamı tabana eşitlemek yeşillik değildir (ratchet anahtar bazında yargılar), ve V6-E'nin ratchet maliyeti ÖLÇÜLDÜ = **sıfır satır**, o yüzden ana dalda kaldı. |
| `GECE/V6-D.md` · `V6-F.md` · `V6-G.md` · `V6-H.md` · `V6-I.md` | **REDDEDİLEN İŞİN KAYDI — ana dalda karşılığı YOK.** Çıpa sözlüğü üreteci + `anchor_source_check` (D) · sözlüğün indekslenmesi ve kapının yeşile DÖNEMEYECEĞİNİN ölçülmesi (F) · operatör sicil reddi + KONUM/`--v2` ölçüm eklentileri (G) · ratchet borcunun 46→20 ödenmesi (H) · borcun 20→16'ya inmesi ve kartın önerdiği yolun KAPALI çıkması (I). ⚠ V6-F'in "RULES md.9 ihlal edilmedi" hükmü YANLIŞ TABANDAN (`ada3bf9`, faz öncesi değil) çıktı; V6-H doğru tabanla (`3fa8002`) ölçüp düzeltti ama F metni düzeltilmedi. ⚠ `6b3378f` kapıyı yorumdan kelime silerek geçen commit'tir, hakem adıyla düşürdü, V6-J geri aldı. |
| `research/v6-cipa-editleme` @ `3d8903c` | **YAN DAL, origin'e pushlu, hiçbir satır silinmedi.** ⚠ Bu satırın saydığı üç yol (`contract/anchors-v1.json` · `engine/tools/gen-anchors.mjs` · `engine/tests/anchor_source_check.mjs`) ANA AĞAÇTA **YOK** (`test -e` başarısız); yalnız o dalda vardır. `contract/anchors-v1.json` (1382 satır) · `engine/tools/gen-anchors.mjs` (421) · `engine/tests/anchor_source_check.mjs` (294) · `foto-spec-olcum.mjs` KONUM/`--v2` ekleri · `spec-diff.mjs` V6-G ekleri · `edit_locality_check.mjs` A5/A6. Ana dala dönüş şartı = `DAMLA-KUYRUK.md` **K-V6A** (ölçülmüş bedel: +10 satır ratchet borcu, dosya dosya dökülü). |
| `engine/tests/edit_locality_check.mjs` | KAPI (ctest'te `edit_locality_check`). A1 tabanı + sessiz atlama tavanı + A2/A3 + A4 granülarite mandalı. Taban sayıları dosyanın içinde, yanlarında ölçüm tarihi ve yakalanmayan iki vakanın ADI. |
| `engine/tools/spec-diff.mjs` | editleme zinciri. `LOCALITY_GRANULARITY = 'bayt'` İLANI ve `pieceBytes`'ın export'u burada — denetim kopyayı değil GERÇEK karşılaştırma fonksiyonunu ölçsün diye. |
| `GECE/log/V6-B.mutasyon.txt` · `V6-E.mutasyon.txt` | mutasyon defterleri. B'de M1 exit **0** basıyor (dişin olmadığı yön), E'de aynı mutasyon exit **1** + 2 KIRMIZI. İkisini yan yana okumak onarımın ne yaptığını tek bakışta gösterir. |
| `GECE/log/V6-D.mutasyon.txt` · `V6-G.mutasyon.txt` · `V6-F.mutasyon.txt` | yan dala giden işin mutasyon defterleri. ⚠ `V6-F.mutasyon.txt`'de üç mutasyonun `EXIT=` satırı BOŞ ve sondaki `git diff --stat` geri almadan sonra hâlâ fark gösteriyor — o logun "GERİ ALINDI" iddiası çıkış koduyla kanıtlanmıyor (hakemin bulgusu; kusurlu olan LOG, kapı değil). |
| `GECE/log/V6-J.kapi.txt` · `V6-H.kapi.txt` · `V6-I.kapi.txt` · `V6-F.kapi.{ONCE,SONRA}.txt` · `V6-H.3fa8002.txt` | `vocab_reference_check` koşuları. Kapının `--tree` ile AĞACI, bayraksız COMMIT'i ölçtüğü ayrımı ve faz-öncesi tabanın (`3fa8002`, YEŞİL) ölçümü burada. |
| `GECE/log/V6.ctest.opening.txt` · `V6.ctest.final.txt` | fazın tam `ctest` koşuları. Kırmızı AD kümesinin büyüyüp büyümediği bu iki dosyanın `diff`'inden okunur, buradaki bir cümleden değil. |
| `GECE/log/V6-A.olcum.txt` · `V6-C.topoloji.txt` · `V6-D.{ctest,kapsam}.txt` · `V6-G.olcum.txt` · `V6-H.{borc-dagilimi,korumalar}.txt` · `V6-I.korumalar.txt` · `V6-F.{ada3bf9,indeks-denemesi,revert-tavani}.txt` · `V6.build.opening.txt` | ham ölçüm çıktıları; her sayının yanında onu basan komut. |
| `GECE/KART/V6-A.md` … `V6-R.md` | on bir işçi kartının brief'i: kapalı kaynak listesi, çıktı dosya kümesi, teslim şartı. Reddedilen kartlar da duruyor. |

Bu fazın kalıcı gerçekleri docs'a işlendi: `docs/ARCHITECTURE.md` §14 (editleme zinciri, kapının
dişsiz yönü ve onarımı, panel granülaritesi, yan dala alınan iş, foto→spec paydası) + §10'a
eşit-olmayan-payda şerhi + "Known limits" dört satır, `docs/KATMAN-HARITASI.md` boşluk 10,
`README.md` (editleme invariantının halka açık ifadesi, "önce dişsiz ölçüldü, sonra SIKILAŞTIRILDI"
diye).

## V7 fazı — kenar kimliği + kol oyuğu↔kapak kapısı (25 Ağu 2026)

Faz kuralı: yargı bir SKALER KOPYADAN değil ÇİZİLEN kenardan kurulur; eşik yayına bağlanır
ya da **REPORTED** basılır (§7.6: kaynaksız eşik yasak); devralınan kırmızı ADLARI büyüyemez
(RULES §9); adın olmaması ile adın çözülmemesi AYRI muamele görür — ilki üreticideki borçtur
ve ADIYLA sayılır, ikincisi bütünlük hatasıdır ve reddedilir.

| dosya | içinde ne var |
|---|---|
| `GECE/V7-A.md` | ÖLÇÜM: `PatternPiece` bir kenar ADI TAŞIMIYOR, sevk edilen artefaktta adlandırılmış kenar **0**, ve oyuk↔kapak eşleşmesi ÜÇ tahminle kuruluyor — parça adında `"Sleeve"` alt-dizgisi (`validator.cpp:280-286`), sabit `commands[0..2]` indeksi (`:289-295`), ve çizilen kenar yerine skaler `bodice.armholeLength` (`bodice.cpp:509`). Kol o skalere ikili aramayla uydurulduğu için (`sleeve.cpp:46-96`) ölçülen uyum AYNI SAYININ KENDİSİYLE uyumuydu. Her iddia dosya:satır. |
| `GECE/V7-B.md` | ÖLÇÜM: sekiz kol yazımının nerede tanımlı olduğu (4 kanonik + 4 BEYANLI eşanlam, `engine/vocab.json:9-10`) ve kartın öncülünün ölçümle DÜŞMESİ — flat sekizi aynı çizmiyor, dört ayrı geometri üretiyor (sha256 tablosu). `cap` değerinin tek kaynaklı olduğu (yalnız `contract/spec-grammar.json:47`) burada. |
| `GECE/V7-C.md` | ONARIM: `struct EdgeRole` (`geometry.hpp:40-71`) ve dört rol adı sevk edilen hatta girdi. Uzunluk alanı BİLEREK yok. `edgePathOf()` çapa tutmazsa BOŞ döner (reddet, uydurma). Artefaktta adlandırılmış kenar **0 → 5** (4 panelli kollu üstte); yay uzunluğu motordan alınmıyor, JSON'un kendi komutlarından yeniden hesaplanıyor. Yeni kaynak dosya: 0. |
| `GECE/V7-D.md` | KAPI: `sleeve_cap_ease_check` ctest'e bağlandı (ratchet YOK, **0 ihlalle**). Tüketici taşındı: parça-adı tahmini → rol, sabit indeks → `edgeLengthOf`, skaler → `armhole_front`+`armhole_back` toplamı. 48 satır (spec × beden) ölçüm tablosu. ★ §7: kartın görmediği üç kök engel — `locket.cpp rebuildFront()` rolü BAYATLATIYORDU (V7-C'nin teorik sandığı delik canlı hatta çıktı), sonra dört kapı daha aynı sebeple düştü ve tek boğaz noktası (`reanchorEdgeRoles`) kuruldu. ★ §8.5: **DÜRÜST SINIR** — adlandırılmış oyuk yoksa skalere düşülüyor, düşen üç yol ADIYLA sayılıyor, ve "yarım ad ad değildir" kuralı. §9: açık bırakılanlar. |
| `GECE/V7-E.md` | GÖRÜNÜR ÇIKTI (hüküm yok, yol + bayt + sha): sevk hattının damgayla doğrulanması (`dist` ile `vendor` farkı tam **127 bayt** = kaynak-damgası yorumu, `vendor.includes(dist)` true), üç kollu kalıbın A4 strip PNG'si ve dört kol yazımının flat'i. Yüzey motoru (`surfacepattern`) sevk EDİLMİYOR (`grep -c` = 0), ondan render alınmadı. |
| `GECE/V7-F.md` | KARAR (B): sicildeki `sleeve` operatörü `absent` KALDI, çelişki ŞERH olarak yazıldı. Gerekçe ölçümle: sicilin 10 bağının 10'u `SheathOptions::`, kolu basan kod (`garment.cpp:303` → `SleeveBlock::draft`) `SheathOptions`'a **0 kez** dokunuyor, yani uydurulmadan yazılabilecek tek bir `binds` yok. Hüküm: *çelişki bir yalan değil KAPSAM kaymasıdır* — sicil `surfacepattern.cpp`'yi anlatıyor, sevkiyat `garment.cpp`'yi yapıyor. Ürünün gerçeği hangi motor: **Damla kararı, seçilmedi.** |
| `GECE/V7-G.md` | RULES 9 ONARIMI: 7. kırmızının kökü V7-F'in sicile eklediği ŞERH DÜZ YAZISIYDI. Kapı GEVŞETİLMEDİ, taban YENİDEN KESİLMEDİ — kırmızıyı doğuran 10 dizgi geri alındı, hüküm/karar/kanıt yolu sicilde KALDI, indirmenin sebebi de sicilin içine yazıldı (`_serh._neden_isaretci`). |
| `GECE/V7-H.md` | UYDURULMUŞ SAYI: `validator.cpp:419`'da 6 belirteç / 7 argüman — reddiye mesajı `armhole 0.0 (-60261330 named edge(s))` basıyordu. Dal canlı ve erişilebilirdi ama sevk edilen 48 satırın hiçbiri onu açmıyor, o yüzden hiçbir kapı görmedi. Onarım tek karakterle bitmedi: `fmt` artık `__attribute__((format(printf,1,2)))` taşıyor, yani bütün hata SINIFI derleme hatası. |
| `GECE/V7-R.md` | ARAŞTIRMA (kod yazılmadı): cap ease künyeleri **yayınlanmış / ikincil / DOĞRULANMADI** diye ayrıştırılmış. Birincil sayfasından doğrulanan tek tavan Linda Lee'nin 1½ in'i (38.1mm). ★ **Bedene göre ölçekleyen yayınlanmış formül YOK** ve puf/balonun NİCEL tanımı için eşik BULUNAMADI. Ayrıca kapak yüksekliğinde üç yayının 2× mertebesinde çeliştiği (AH/3 vs AH/4 vs AH/6) bağımsız olarak doğrulandı. |
| `GECE/KART/V7-A.md` … `V7-G.md` · `V7-R.md` | işçi kartlarının brief'i: kapalı kaynak listesi, çıktı dosya kümesi, teslim şartı. ⚠ V7-H'nin kartı YOK — o iş bir kapı çıktısından değil, hakemin bulduğu biçim-dizgisi hatasından doğdu. |
| `engine/tests/sleeve_cap_ease_check.mjs` | KAPI, `engine/CMakeLists.txt:143-151`'de kayıtlı, gerekçesi `add_test`'in üstünde. Motoru `web/vendor/stitchu-engine.js` üzerinden yükler → aynı koşu **WASM paritesi** kanıtıdır. Eşik künyesi dosyanın kendi başlığında: [S1] 38.1mm tavan (Linda Lee, YAYINLANMIŞ) · [S2] işaret şartı (motorun kendi `fabricease.hpp kCap` gerekçesinden) · [S3] alt uç **REPORTED, yargılanmaz** (yayın yok) · [S4] büzgülü/puf başta tavan UYGULANMAZ — gevşetme değil KAPSAM. |
| `GECE/log/V7-D.bostest.txt` | BOŞ TEST: AYNI alet, faz-ÖNCESİ (`e4249b7`) paketin ürettiği artefakta verildi → **EXIT=1, 184 ihlal, 48 satırın hepsi `[a]` ile**. Bugünkü artefaktla EXIT=0. Değişen tek şey GİRDİ, derleme hatası değil. Adlandırılmış kenar: faz öncesi 0 / sonrası 240. |
| `GECE/log/V7-D.mutasyon.txt` | mutasyon: kapak +40mm → `[c]` tavan · kapak −40mm → `[b]` işaret · kenarın ucu +5mm (post-pass taklidi) → `[a]` BAYAT ROL (88 ihlal). Üçü de geri alınınca PASS. Sonuncusu V7-C'nin açıkça açık bıraktığı deliği kapatan mutasyondur. |
| `GECE/log/V7.ctest.opening.txt` · `V7-C.ctest.txt` · `V7-D.ctest.txt` · `V7-H.ctest.txt` · `V7.ctest.final.txt` | fazın tam `ctest` koşuları. Kırmızı AD kümesinin büyüyüp büyümediği bu dosyaların `diff`'inden okunur, buradaki bir cümleden değil. ⚠ V7-D koşusunda ARADA dört kırmızı düştü (`cup_check`, `yoke_check`, `boxpleat_check`, `compose_check`) ve koşu içinde KÖKTEN kapatıldı — kayıt `GECE/V7-D.md` §8'de duruyor ki "hiç kırmızı olmadı" gibi okunmasın. |
| `GECE/log/V7-F.gate.txt` · `V7-G.gate.txt` · `V7-G.vocab.txt` | sicil değişikliğinin kapı çıktıları: `specv2-check.mjs` ve `vocab_reference_check`'in şerh eklenmeden önceki/sonraki okumaları. |
| `GECE/log/V7-H.fmt.txt` | biçim-dizgisi hatasının ÖNCE/SONRA çıktısı. Dal her koşuda ateşlesin diye mandal geçici olarak `if (true)` yapıldı, ölçüm alındı, geri konuldu. |
| `GECE/log/V7-E.png/` | sevk edilen bayttan üretilmiş görsel artefaktlar: üç kollu kalıbın A4 strip PNG'si (+`.info.txt` parça listeleri) ve dört kol yazımının flat PNG/SVG'si. |

Bu fazın kalıcı gerçekleri docs'a işlendi: `docs/ARCHITECTURE.md` §15 (kenar rolü, çapa/bayatlama
disiplini, kapı ve eşik künyesi, ADSIZ oyuk borcu, uydurulmuş sayı, karara bağlanmayanlar) + §5'e
düşülen şerh + §13/§14'ün "0 adlandırılmış kenar" cümlelerinin düzeltilmesi + "Known limits" iki
yeni satır, `docs/KATMAN-HARITASI.md` boşluk 7 (kısmen aşıldı) + 9 (sevk hattı yeniden ölçüldü) +
10 (bayat cümle düzeltildi) + **yeni boşluk 11** (kenar kimliği girdi, üç pas'ta hâlâ yok),
`docs/SATIS-SARTNAMESI.md` montaj maddesine `edgeRoles` şerhi,
`README.md` (dikiş-çifti eşitliğinin "hiç iddia edilemez" kuyruğunun düzeltilmesi).

## V9 fazı — doküman doğruluğu: sayım, kapı, kâtipler (25 Ağu 2026)

Faz kuralı: sayım önce, onarım sonra; kapı önce faz-öncesi ağaca karşı KIRMIZI düşürülür,
sonra bağlanır; kâtip turları ayrı dosyalara yazar. Bu bölümdeki her satır bir YOLDUR —
kapanma hükmü `GECE/KAPI.md`'de hakemindir.

| dosya | içinde ne var |
|---|---|
| `GECE/V9-A.md` | bugünkü sayım (ölçüm, onarım YOK): `docs/**` + `README.md` kapsamında duran-iddia ve ölü-yol taraması; `GECE/V0-0C.md` devralınmadı, tazelendi. |
| `GECE/V9-B.md` | `docs_truth_check` kapısının tutanağı: taban, ctest adı, boş-test ve mutasyon kanıtı; `docs/` ve `README.md` içeriğine dokunulmadığının `git status` kanıtı. |
| `GECE/V9-R.md` | araştırma (kod yazılmadı): doküman doğruluğunun yayınlanmış pratiği, kapının kalıp listesi/eşiği/kaçış mekanizması için kaynak taban. |
| `GECE/V9-C.md` | kâtip 1'in tutanağı — `README.md` + `docs/ARCHITECTURE.md`. Kart: `GECE/KART/V9-C.md`. ⚠ bu satır yazılırken diskte **YOK** (paralel işçi yazıyor). |
| `GECE/V9-D.md` | kâtip 2'nin tutanağı — `docs/H1.0-KAPI.md` + `docs/G5-OMUZ-PLANI.md`. Kart: `GECE/KART/V9-D.md`. ⚠ bu satır yazılırken diskte **YOK**. |
| `GECE/V9-E.md` | kâtip 3'ün tutanağı — `docs/SATIS-SARTNAMESI.md` + `docs/KATMAN-HARITASI.md` + `docs/loop-engineering.md` + arşiv mock. Kart: `GECE/KART/V9-E.md`. ⚠ bu satır yazılırken diskte **YOK**. |
| `GECE/V9-F.md` | bu tablonun tutanağı: kaç yol tablolandı, kaçı `test -e` ile doğrulandı, hangi yol bulunamadı. Kart: `GECE/KART/V9-F.md`. |
| `engine/tests/docs_truth_check.mjs` | KAPI (node, bağımlılık yok), ctest adı `docs_truth_check`. Duran-iddia kalıpları ve ölü yol taraması; her ihlal adıyla basılır. |
| `engine/tests/docs-truth-baseline.json` | kapının TABANI. Deftersiz taban geçersiz; yeniden kesme gerekçesi tutanağa yazılır. Emsal: `engine/tests/vocab-reference-baseline.json`. |
| `GECE/log/V9.build.opening.txt` · `V9.ctest.opening.txt` | fazın AÇILIŞ build'i ve tam `ctest` koşusu. Kırmızı AD kümesi buradan okunur, buradaki bir cümleden değil. |
| `GECE/log/V9-B.red-before.txt` | BOŞ TEST: kapı, faz-öncesi ONARILMAMIŞ ağaçta (`--no-baseline`) kırmızı düşüyor. Kapatılmış test olmadığının kanıtı. |
| `GECE/log/V9-B.mutasyon.txt` | mutasyon kanıtı: iki kasıtlı ihlal (D1 duran iddia, D2 ölü yol) enjekte edilip kapının kırılıp kırılmadığı ölçülüyor. |
| `GECE/log/V9-B.ctest-full.txt` | kapı bağlandıktan sonraki tam `ctest` koşusu. |
| `GECE/log/V9-A.census.py` · `V9-A.links.py` | sayımı ve link taramasını basan iki alet (hüküm basmaz, sayı basar). |
| `GECE/log/V9-A.links.txt` · `V9-A.standing.txt` | o iki aletin ham çıktısı: dosya:satır → hedef → TICK/VAR-YOK tablosu, ve duran-iddia taramasının ham dökümü. |
| `GECE/KART/V9-A.md` … `V9-F.md` · `V9-R.md` | fazın **7 işçi kartı**: kapalı kaynak listesi, çıktı dosya kümesi, teslim şartı. |

## V10 fazı — site doğruluğu: MTM dili söküldü, beden ekseni kapıya bağlandı (25 Ağu 2026)

Fazın tek cümlesi: **sitenin sattığı ürün ile motorun yaptığı ürün aynı şey değildi.** Sayfalar
ısmarlama (made-to-measure) ve EU34–52 bir beden koşusu satıyordu; motorun yayınlanmış beden
kümesi `contract/layers/shape-ratios.json`'daki **sekiz sabit beden, EU34–48**. Faz o farkı önce
saydı, sonra sayfalardan ve o sayfaları YAZAN üreteçlerden söktü, sonra beden eksenini bir
kapıya bağladı ki aynı yalan elle geri gelemesin. Bu bölümdeki her satır bir YOLDUR — kapanma
hükmü `GECE/KAPI.md`'de hakemindir.

| dosya | içinde ne var |
|---|---|
| `GECE/V10-A.md` | bugünkü sayım (ölçüm, onarım YOK): `web/` genelindeki her iddia motorun bugünkü hâline karşı ölçüldü; ham tablo `GECE/log/V10-A.iddia.tsv`. |
| `GECE/V10-B.md` | `landing_truth_check` kapısının tutanağı: beş denetim (L1…L5), taban kesimi, boş-test ve mutasyon kanıtı. |
| `GECE/V10-C.md` | landing tasarımı + cümle cümle önce/sonra: `web/index.html` MTM satmayı bıraktı, üç çıktı gerçek çıktı olarak sayfaya girdi, vizyon bloğu gelecek zamana çevrildi, `EU_SIZES` motorun kümesinden türedi. |
| `GECE/V10-D.md` | site geneli süpürme: kalan MTM dili ve duran iddialar `web/` altından çıkarıldı, `landing-truth-baseline.json` kesildi. |
| `GECE/V10-E.md` | ekran kanıtı: 320 / 390 / 1440 CSS px'te gerçek tarayıcı render'ı ve taşma ölçümü. Aleti `GECE/v10-e-olcu.mjs`. |
| `GECE/V10-F.md` | üreteçler: sayfaları yazan `engine/tools/gen-*.mjs` ailesi aynı yalanı KAYNAKTA basmayı bıraktı — düzeltilmemiş üreteç, düzeltilmiş sayfayı bir sonraki koşuda geri bozar. |
| `GECE/V10-G.md` | kapıdan KAÇAN MTM cümleleri: kapının `BANNED` listesi 13 → 20 kalıba çıkarıldı, kaçan her cümle dosya:satır ile yargılandı, 7/7 mutasyon + yanlış-pozitif negatif kontrolü. |
| `GECE/V10-R.md` | araştırma (kod yazılmadı): landing iddialarının dayanağı ve reflow eşikleri için yayınlanmış kaynak tabanı. |
| `GECE/V10.md` | fazın ŞEF tutanağı. ⚠ bu satır yazılırken diskte **YOK** — şef yazacak. |
| `engine/tests/landing_truth_check.mjs` | KAPI (node, bağımlılık yok), ctest adı `landing_truth_check`. Kapsam `web/**/*.html` + `web/js/*.js`, iddia bloklarına AYRIŞTIRILARAK; `--dir=<yol>` ile fikstüre gösterilebilir. |
| `engine/tests/landing-truth-baseline.json` | kapının TABANI / kayıtlı borcu. Emsal `engine/tests/docs-truth-baseline.json`; liste yalnız küçülebilir, yeniden kesim `--baseline --note=` ile bilinçli bir commit'tir. |
| `GECE/log/V10.build.opening.txt` · `V10.ctest.opening.txt` | fazın AÇILIŞ build'i ve tam `ctest` koşusu. Kırmızı AD kümesi buradan okunur, buradaki bir cümleden değil. |
| `GECE/log/V10.build.final.txt` · `V10.ctest.final.txt` | fazın KAPANIŞ build'i ve tam `ctest` koşusu; kırmızı AD kümesinin büyüyüp büyümediği açılışla `diff`'lenerek okunur (RULES md.9). |
| `GECE/log/V10-A.iddia.tsv` · `V10-A.site-health.txt` | sayımın ham çıktısı: iddia tablosu ve site sağlığı koşusu. |
| `GECE/log/V10-B.red-before.txt` | BOŞ TEST: kapı, faz-öncesi ONARILMAMIŞ `web/` ağacına karşı kırmızı düşüyor. Kapatılmış test olmadığının kanıtı. |
| `GECE/log/V10-B.mutasyon.sh` · `V10-B.mutasyon.txt` | kapının ilk mutasyon koşusu: koşucu betik ve çıktısı. |
| `GECE/log/V10-C.landing-truth.txt` · `V10-C.site-health.txt` | landing turunun kapı ve site-sağlığı çıktıları. |
| `GECE/log/V10-D.kapi.txt` · `V10-D.site-health.txt` | süpürme turunun kapı ve site-sağlığı çıktıları. |
| `GECE/log/V10-E.kapi.txt` · `V10-E.olcum-{320,390,1440}.json` | ekran turunun kapı çıktısı ve üç genişlikteki ham taşma ölçümü. |
| `GECE/log/V10-E.png/` (9 PNG) | `index` · `create` · `api` sayfalarının 320 / 390 / 1440 px ekran görüntüleri — RULES invariant 3'ün istediği dosya YOLU budur. |
| `GECE/log/V10-F.uretec.txt` | üreteç turunun çıktısı: hangi üreteç hangi cümleyi basıyordu. |
| `GECE/log/V10-G.kapi.txt` · `V10-G.mutasyon.sh` · `V10-G.mutasyon.txt` | sıkılaştırılmış kapının çıktısı + 7 yeni kalıbın 7/7 mutasyon kanıtı ve doğru cümleyi cezalandırmadığını gösteren negatif kontrol. |
| `GECE/v10-e-olcu.mjs` | ekran ölçüm aleti (kapı değil, alet): sayfayı üç genişlikte açar, taşan elemanı basar. |
| `GECE/log/V10-K.docs-truth.txt` | kâtip turunun kapanış koşusu: `docs/` + `README.md` düzeltildikten sonra `ctest -R docs_truth_check` çıktısı, komut ve commit satırıyla. |
| `GECE/KART/V10-A-envanter.md` … `V10-G-kacan-yalan.md` · `V10-R-arastirma.md` | fazın **8 işçi kartı**: kapalı kaynak listesi, çıktı dosya kümesi, teslim şartı. |

## `GECE/KART/` — kart dosyaları (faz başına)

Kart = işçinin brief'i: kapalı kaynak listesi + çıktı dosya kümesi + teslim şartı.
Kart kart liste burada yok; kartın kendisi dizinde adıyla duruyor.

| faz | kart sayısı | dizindeki adlar |
|---|---|---|
| V0 | 7 | `GECE/KART/V0-0A-motor.md` … `V0-0R-arastirma.md` |
| V1 | 5 | `GECE/KART/V1-A-golden-mühür.md` … `V1-R-arastirma.md` |
| V2 | 6 | `GECE/KART/V2-A-sokum-hukmu.md` … `V2-R-arastirma.md` |
| V3 | 6 | `GECE/KART/V3-A.md` … `V3-R.md` |
| V4 | 7 | `GECE/KART/V4-A.md` … `V4-R.md` |
| V5 | 13 | `GECE/KART/V5-A.md` … `V5-Z.md` (reddedilen/ikinci kesim kartları dâhil) |
| V6 | 11 | `GECE/KART/V6-A.md` … `V6-R.md` (reddedilen kartlar da duruyor) |
| V7 | 8 | `GECE/KART/V7-A.md` … `V7-R.md`. ⚠ V7-H'nin kartı YOK — o iş hakemin bulgusundan doğdu |
| V9 | 7 | `GECE/KART/V9-A.md` · `V9-B.md` · `V9-C.md` · `V9-D.md` · `V9-E.md` · `V9-F.md` · `V9-R.md` |
| V10 | 8 | `GECE/KART/V10-A-envanter.md` · `V10-B-kapi.md` · `V10-C-tasarim.md` · `V10-D-yalan-suprugu.md` · `V10-E-ekran.md` · `V10-F-uretec.md` · `V10-G-kacan-yalan.md` · `V10-R-arastirma.md` |

## `GECE/log/` — faz dışı ve devralınan loglar

Faz loglarının çoğu yukarıdaki faz bölümlerinde adıyla duruyor. Burada yalnız o
bölümlere girmeyenler var.

| yol | ne |
|---|---|
| `GECE/log/F0*.txt` · `F6*` · `F9*` · `F10*` · `F11*` · `F-C…F-N1*` (101 dosya) | ÖNCEKİ koşunun (v5) log yığını; bu koşuda kanıt değil, yalnız tarihsel kıyas için duruyor. |
| `GECE/log/F-D.shots/` · `F-E.shots/` · `F-H.shots/` · `F-K.shots/` | önceki koşunun görsel artefaktları (5 · 10 · 3 · 8 dosya). |
| `GECE/log/armhole-basis.txt` · `gece.txt` | tarihsiz tek koşu çıktıları; hangi faza ait olduğu dosya adından okunamıyor (**DOĞRULANMADI**). |
| `GECE/log/flat_convention.mutasyon.txt` · `preset_resolve.mutasyon.txt` · `garment_armhole.vacuous.txt` | faz eki taşımayan mutasyon / boş-test logları. |

## Kalıcı yardımcı dosyalar

| yol | ne |
|---|---|
| `GECE/KAPI.md` | hakem hükümleri: faz · alt kapı · GEÇTİ/KALDI · gerekçe · log yolu. Bir fazın kapandığını söyleyen TEK dosya. |
| `GECE/KOSU.md` | koşunun canlı durumu (≤150 satır): şu an neredeyiz, ne açık. Şefin dosyası. |
| `GECE/kapi.sh` · `GECE/kapi.sha` | kapı koşturucu betik ve onun sha kaydı. |
| `GECE/mutasyon.sh` · `GECE/mutasyon.tsv` | mutasyon koşturucu betik ve mutasyon tablosu. |
| `GECE/f0-measure-pattern.py` → `GECE/f0-pattern-EU38.json` | kalıp ölçüleri (cm): üreteç ve çıktısı. |
| `GECE/f0-measure-flat.mjs` → `GECE/f0-flat-princess.json` | flat siluet ölçüleri (birimsiz): üreteç ve çıktısı. |
| `GECE/f-d-kalip-plot.mjs` · `GECE/f-e-shot.mjs` | önceki koşudan kalan iki çizim/ekran-görüntüsü aleti. |
| `GECE/probe/` (5 dosya) | tek seferlik sondalar: `selfintersect-probe.cpp` · `si-cross.cpp` · `si-one.cpp` (kendini kesme) · `v4k-census-hat2.mjs` · `v4k-measure.mjs` (V4-K ölçümü). Kapı değil, sonda. |
| `GECE/kurtarma/` (13 dosya) | geri alma malzemesi: silinen `add_test` satırları, `LastTest.log.gz` yedekleri, `F9.arch-backup.md`, `F10.index.html.orig`/`.yedek`, `mut.*` mutasyon notları. |
| `GECE/arsiv/` | önceki koşuların tutanakları; bu koşuda **KANIT DEĞİL, açılmaz**. |

## `docs/` ağacı

| yol | ne anlatıyor |
|---|---|
| `docs/ARCHITECTURE.md` | mimarinin tek yeri: hat, aletler, kapılar, beyan edilmiş sınırlar (§11-§15 bu koşunun fazları) + "Known limits". |
| `docs/KATMAN-HARITASI.md` | kim kimi okur, kim kimi OKUYAMAZ — katman katman + numaralı boşluk listesi. |
| `docs/H1.0-KAPI.md` | giyilebilirliğin kabul kapısı: hangi şart hangi ölçümle karşılanıyor. |
| `docs/G5-OMUZ-PLANI.md` | omuz/kol oyuğu/yaka yüzeye inerken izlenecek icra planı ve o açığı sayan kapılar. |
| `docs/SATIS-SARTNAMESI.md` | satılabilir paketin şartnamesi: listing, rehber, montaj sırası. |
| `docs/loop-engineering.md` | ölçüme-dallanan ajan zincirlerinin yöntemi (İngilizce, dışa dönük). |
| `docs/edit/` (4 dosya) | editleme örneği: `base-eu38-dress.json`, `diff-yakayi-degistir.json`, `once.png`, `sonra.png`. |
| `docs/reference/dis-llm-panel-a.html` | dış LLM panel çıktısı, referans. |
| `docs/archive/` | **ARŞİV** — `asset-guide/` (3) · `flat-engine/` (2) · `mocks/` (9) · `tools/` (18). Tarihsel; bugünkü hat için kanıt değil. |

## Ölçüm aletlerini çalıştır

```
python3 GECE/f0-measure-pattern.py EU38          # kalıp ölçüleri (cm)
node    GECE/f0-measure-flat.mjs <styleKey>      # flat siluet ölçüleri (birimsiz)
cd engine/build && ctest                          # sayıyı koşunun kendisi basar;
                                                  # V5 boyunca üç okuma:
                                                  #   302.32 sn / 111 test  (V5.ctest.opening)
                                                  #   325.59 sn / 113 test  (V5-E.ctest.after)
                                                  #   310.93 sn / 113 test, 6 kırmızı
                                                  #                         (V5.ctest.final)
                                                  # kırmızı ADLARI logdan okunur, buradan değil
node engine/tests/sewability_check.mjs            # dikilebilirlik: ihlal + ABSENT, adıyla
node engine/tests/draft_math_check.mjs            # kalıp matematiği: 3 ayrı hüküm satırı,
                                                  # exit kodunu düşüren bölüm ADIYLA basılır
node engine/tests/landing_truth_check.mjs         # sitenin cümleleri: L1..L5, her ihlal adıyla
                                                  # --dir=<yol> fikstüre gösterir, --no-baseline
                                                  # tabanı yok sayan hard-0 kipidir
node engine/tests/docs_truth_check.mjs            # docs/ + README.md: duran iddia, ölü yol,
                                                  # sağlayıcısız sayı (D1/D2/D3)
```

## Kural
Bir faz açılırken context'e giren dosyalar SADECE: `GECE/KOSU.md` + `RULES.md` +
o fazın brief'i + fazın adıyla saydığı kaynaklar. `HEDEF.md`, `DAMLA-KUYRUK.md`,
`devlog.md`, `linkedin.md` **hiçbir faza girmez** — gerekirse `grep` ile tek satır.
