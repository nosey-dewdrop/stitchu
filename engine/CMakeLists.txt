cmake_minimum_required(VERSION 3.20)
project(stitchu_engine CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_library(engine
    src/geometry.cpp
    src/volume.cpp
    src/flatten.cpp
    src/surfacepattern.cpp
    src/curvefit.cpp
    src/shellprojection.cpp
    src/seamplan.cpp
    src/dartrotate.cpp
    src/dartsuppress.cpp
    src/panelsplit.cpp
    src/planops.cpp
    src/patternedit.cpp
    src/bodysurface.cpp
    src/garmentshell.cpp
    src/bodice.cpp
    src/skirt.cpp
    src/ruffle.cpp
    src/keyhole.cpp
    src/placket.cpp
    src/tie.cpp
    src/collar.cpp
    src/gather.cpp
    src/openback.cpp
    src/laceupback.cpp
    src/wrapfront.cpp
    src/slit.cpp
    src/strap.cpp
    src/peplum.cpp
    src/hemflounce.cpp
    src/cupseam.cpp
    src/locket.cpp
    src/yoke.cpp
    src/boxpleat.cpp
    src/pocket.cpp
    src/neckext.cpp
    src/cuff.cpp
    src/hem.cpp
    src/shoulder.cpp
    src/buttonrow.cpp
    src/exposedzip.cpp
    src/backdetail.cpp
    src/offshoulder.cpp
    src/sleeve.cpp
    src/garment.cpp
    src/wearability.cpp
    src/validator.cpp
    src/recipe.cpp
    src/dxf.cpp
    src/nest.cpp
    src/drape.cpp)
target_include_directories(engine PUBLIC src)
target_compile_options(engine PRIVATE -Wall -Wextra)

enable_testing()
add_executable(test_geometry tests/test_geometry.cpp)
target_link_libraries(test_geometry PRIVATE engine)
add_test(NAME geometry COMMAND test_geometry)

add_executable(engine_check tests/engine_check.cpp)
target_link_libraries(engine_check PRIVATE engine)
add_test(NAME engine_check COMMAND engine_check)

add_executable(golden_dump tests/golden_dump.cpp)
target_link_libraries(golden_dump PRIVATE engine)
# The real golden test: fresh dump vs the REPO PIN (engine/golden-reference.csv).
# Regen-vs-regen is not a golden check. Pin moves only via scripts/repin-golden.sh
# with a declared label in engine/GOLDEN-PIN.md.
add_test(NAME golden_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/golden_check.sh
    $<TARGET_FILE:golden_dump>
    ${CMAKE_CURRENT_SOURCE_DIR}/golden-reference.csv
    ${CMAKE_CURRENT_SOURCE_DIR}/GOLDEN-PIN.md)

# generated_ratchet_check: K21. guard.json's protectedPaths are enforced inside
# rabadon's Edit/Write branch only (native/gate.cpp:2892) — TOOL-shaped, not
# PATH-shaped — and TUR 13/13C wrote to protected paths from `node /tmp/*.mjs`.
# The command-line shapes were closed in guard.json (no-shell-write-protected-path,
# 23/23); a path that lives INSIDE a script cannot be closed there at all. This is
# the door on the repo side: a generated file whose bytes move without its declared
# sha256 moving with it, in the same commit, is refused. Mutation proof 2026-08-17:
# `node /tmp/mutate.mjs` (13C's exact route) is ALLOW at the guard and FAIL(1) here.
add_test(NAME generated_ratchet_check
    COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/generated_ratchet_check.sh)

# bundle_fresh_check: the SHIPPED PAIR may not be older than its source.
# Measured 22 Aug 2026: web/vendor/stitchu-engine.js and both
# backend/engine/stitchu-worker.* files were last built 28 Jul (dd30846) while
# 53 commits had landed in engine/src since. Every other ctest was green for
# those four weeks, because not one of them looks at the shipped artefact —
# the repo could prove the source was right, never that the right source had
# actually shipped. Compares COMMIT DATES, not mtimes, so `touch` cannot turn
# it green (proven 22 Aug: bytes identical, gate stayed red at 53 commits).
add_test(NAME bundle_fresh_check
    COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/bundle_fresh_check.sh)

# flat_convention_check (F-D, 2026-08-23): "flatlerin hepsi aynı convention'da
# değil — hepsinin AYNI MODELDEN ÇIKMA gibi olması lazım" (Damla). Üretim
# kalemini 8 farklı stilde koşturur, SVG'yi PARSE eder, altı şartı MEKANİK ölçer:
# tek croquis ±2mm · data-scale beyanlı + kaynaklı beden çizelgesiyle tutarlı ·
# çizgi ağırlık sınıfları beyanlı ve kullanılmış · gradient/gölge/tint 0 ·
# ön+arka · tek kontur rengi. Kanun: contract/flat-convention-v1.json.
add_test(NAME flat_convention_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/flat_convention_check.mjs)

# flat_expresses_spec_check (V4-B, 2026-08-24): konvansiyon "hepsi aynı MANKEN"
# demektir, "hepsi aynı ÇİZİM" değil. Ölçüldü: kalem sleeveStyle set/raglan/puff
# için BAYT BAYT aynı flat'i, collarType 1/2/3 için de aynısını basıyordu —
# RULES invariant 1'in yasakladığı sessiz çökertme (emsal: CLAUDE.md, sleeveStyle
# 'puff' silently dropped, 2026-07-18). Kapsamı contract/garment-spec-v2.json
# SİCİLİ belirler (salt okunur): `shipped` olan her değer ölçülebilir biçimde
# FARKLI bir flat üretmek zorunda; olmayan değer ADIYLA reddedilmek VE
# çizilmemek zorunda. Fark ölçüsü sha değil GEOMETRİ (çizen eleman kümesi +
# kontur uzunluğu), yargı eşitlik/eşitsizlik — gevşetilecek eşik yok.
add_test(NAME flat_expresses_spec_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/flat_expresses_spec_check.mjs)

# flat_geometry_sellable_check (F-E, 2026-08-23): "flat ETSY'LİK Mİ" kapısının
# GEOMETRİ yarısı. F-D konvansiyonu tutar (tek croquis, tek mürekkep, ölçek);
# bu kapı çizilenin bir GİYSİ gibi davranıp davranmadığını tutar: kol gövdeyle
# uçlarını paylaşıyor mu, kol oyuğu içbükey mi, puff'ın eti toplanmış mı, etek
# boyla genişliyor mu. Eşikler SATIN ALINMIŞ Buğra Locket EU38 kalıbından ve
# kaynaklı beden çizelgesinden; motorun kendi çıktısından TÜRETİLEN eşik yok.
add_test(NAME flat_geometry_sellable_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/flat_geometry_sellable_check.mjs)

# flat_pattern_agree_check (V3-C kanat (a), 2026-08-24): aynı bedenden üretilen
# TEKNİK ÇİZİM (shell-flat) ile KALIP (surface-pattern + tools/pattern-measure.mjs)
# altı ölçüde %1.5 içinde mi. ★ %1.5 YAYINDAN DEĞİL KARARDAN — GECE/V3-R.md
# "EŞİK 2": technical flat ↔ kalıp uyumu için yayınlanmış formül YOK. Ölçüm aleti
# diskte yoksa kapı SKIP değil KIRMIZI düşer; `null` gelen ölçü atlanmaz,
# UNMEASURED olarak sayılır ve kapıyı düşürür.
add_test(NAME flat_pattern_agree_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/flat_pattern_agree_check.mjs)

# tek_nesne_check (GECE7 / F3, 2026-08-26): flat ile kalıp AYNI DİKİŞ PLANINDAN
# mı çıkıyor. ⚠ Bu kapı flat_pattern_agree_check'in EŞİTLİK sorusunu SORMAZ ve
# sormamalı — KOSU-v7 §2: flat 36 ile kalıp 36 farklı bedenlerdir, eşitlik
# kuran kapı yanlıştır. Burada ölçülen tek kaynak + tek ilan edilmiş dönüşüm:
# yakayı 20mm derinleştiren TEK spec değişikliği iki okumayı da, aynı düğümden,
# aynı bölgede oynatıyor mu (ön oynar, arka durur, iki tarafta da).
add_test(NAME tek_nesne_check
         COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/tek_nesne_check.mjs
                 $<TARGET_FILE:seam-plan> $<TARGET_FILE:shell-audit>)

# rotate_check (GECE7 / F5-A, K27): op.rotate — pens transferi. Rijit hareketin
# korunan üç niceliği (ALAN, PENS AÇISI, TRUE BACAKLAR) birebir ölçülür; çevre
# EŞİTLİK olarak DEĞİL bir KİMLİK olarak yargılanır
# (cevre_sonra = cevre_once − 2·Lold + 2·Lnew), çünkü belde duran bir pens kol
# oyuğundakinden uzundur ve "çevre korunur" YANLIŞ bir kapı olurdu.
# ⏱ op_fixture (GECE7 / F5-C İŞ 0a, borç 43 / K37) — PAYLAŞILAN OPERATÖR
# FİKSTÜRÜ. ÖLÇÜLDÜ: `suppress-op` 375.74 sn sürüyor ve o sürenin ~%96'sı TEK
# bir plan kurulumundan geliyor (skimBodice=OFF + motorun kendi pensleri AÇIK —
# çift bastırma koşumu; shipped ~5 sn, following ~8 sn, doubled ~360 sn).
# O 375 saniye süitte İKİ KEZ ödeniyordu: bir kez `suppress_check`, bir kez
# `rotate_check`'in R0 çapraz ölçümü için. Araç artık BURADA bir kez koşar ve
# JSON'unu yazar; iki kapı (ve `split_check`'in yan yana bastığı sayı) onu okur.
#
# ⚠ KAPI SİLİNMEDİ, GEVŞETİLMEDİ, ESİK OYNAMADI (§3.8 md.4). Okunan JSON aynı
# ikilinin aynı koşumudur, ölçülen hiçbir sayı değişmez. K36 korunuyor: R0 hâlâ
# ÇAPRAZ bir ölçüm — kıyaslanan sayı hâlâ suppress-op'un motordan okuduğu
# develop-deficit, bir sabit değil; iki kapı da dosyanın `op` alanını denetliyor.
add_test(NAME op_fixture
         COMMAND $<TARGET_FILE:suppress-op> EU38
                 -o ${CMAKE_CURRENT_BINARY_DIR}/op-suppress.json)
set_tests_properties(op_fixture PROPERTIES FIXTURES_SETUP OPFIX TIMEOUT 1800)

add_test(NAME rotate_check
         COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/rotate_check.mjs
                 $<TARGET_FILE:rotate-op> ${CMAKE_CURRENT_BINARY_DIR}/op-suppress.json)
set_tests_properties(rotate_check PROPERTIES FIXTURES_REQUIRED OPFIX)

# expressability_check (GECE7 / F5-A, §4A'nın kapanış testi): H8-İFADE — ADLI
# gerçek kalıpların kaçı bugünkü operatör kümesiyle bir programa çevrilebiliyor,
# çevrilemeyen her biri EKSİK OPERATÖRÜN ADINI veriyor. ⚠ Bu sayı
# hedef_kosu.mjs'in H8'i DEĞİLDİR: o bir SÖZLÜK sayacıdır ve sözlük daraltılarak
# düşürülebilir (§0B reward-hacking yüzeyi). İkisi ayrı basılır, harmanlanmaz.
# suppress_check (GECE7 / F5-B, K30/§4A): op.suppress — the wedge angle falls
# out of the panel's measured develop-deficit or the operator refuses. Two
# mutations turn it red: making the angle a constant, and marking a wedge opened
# while leaving the geometry alone.
add_test(NAME suppress_check
         COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/suppress_check.mjs
                 ${CMAKE_CURRENT_BINARY_DIR}/op-suppress.json)
set_tests_properties(suppress_check PROPERTIES FIXTURES_REQUIRED OPFIX)

# split_check (GECE7 / F5-C, §4A): op.split — panel bölme. Bölme YERİ bir
# kesirden değil, panelin KENDİ ölçülen sütun-deficit profilinden düşer ve bu
# kapı o argmin'i kendi içinde YENİDEN HESAPLAYIP karşılaştırır; bölme yerini
# bir sabite çeviren mutasyon orada yanar. Korunan nicelikler ÖLÇÜLÜR (alan,
# işaretli deficit, kesilen kenarın iki tarafı), KORUNMAYAN (çevre) bir eşitlik
# olarak değil bir KİMLİK olarak yargılanır (K29). Ve süite ÜÇÜNCÜ bir 375
# saniyelik kapı eklemez: split-op yalnız iki ucuz planı kuruyor, 12.8 sn.
#
# 🚨 K35: `op.split`'in `motorda_kapi`'si TAM OLARAK bu adı taşımak zorunda —
# `op.X -> X_check`. Var olan bir kapının adını ödünç almak kırmızı yanar.
add_test(NAME split_check
         COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/split_check.mjs
                 $<TARGET_FILE:split-op>)

# op_program_check (GECE7 / F5-D, borç 45+49+51 / K46): ÜRÜN YOLU. Üç operatör
# de sevk edilen dikiş planına BAĞLI mı, bölünen panelin iki parçası plana PANEL
# olarak girdi mi, kesilen kenarın iki tarafı DİKİŞ ÇİFTİ olarak ilan edildi mi,
# ve her adım bir `sebep` taşıyor mu (H4'ün ilk katmanı). RET de bir cevaptır ve
# sayısıyla görünmek zorundadır — sessizce boş dönen bir operatör §0B ihlalidir.
add_test(NAME op_program_check
         COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/op_program_check.mjs
                 $<TARGET_FILE:plan-ops>)

add_test(NAME expressability_check
         COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/expressability_check.mjs)

# sewability_check (V5-A) ve draft_math_check (V5-D), ctest'e V5-E'de BAĞLANDI.
# İkisi de RATCHET'li: eşikler (Aldrich/Threads bantları, çentik kesim-çizgisi
# kuralı, Hopf Umlaufsatz, ANSUR II zarfı) DEĞİŞMEDİ ve her ihlal ADIYLA
# basılmaya devam ediyor; exit kodu "ihlal = 0" yerine "ihlal ≤ bugünkü ölçülmüş
# tavan"a bağlı. Tavanlar elle yazılmaz, tek kaynak:
# engine/tests/v5-ratchet-baseline.json (künye + ölçüm tarihi + basan komut).
# Gerekçe: bağlanmayan kapı çürür; kırmızı AD eklemek RULES 9 ihlali olurdu.
add_test(NAME sewability_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/sewability_check.mjs)
add_test(NAME draft_math_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/draft_math_check.mjs)

# sleeve_cap_ease_check (V7-D, 2026-08-25): oyuk yayı ↔ kapak yayı, İKİSİ DE
# ÇİZİLEN kenardan (V7-C'nin `edgeRoles` adları), skaler `bodice.armholeLength`
# kopyasından DEĞİL. Aynı koşu WASM PARİTESİ kanıtıdır: kapı motoru
# `web/vendor/stitchu-engine.js` üzerinden yükler, yani SEVK EDİLEN artefaktı
# ölçer — native yeşil + wasm patlak burada kırmızı düşer. Eşik künyesi
# (Linda Lee 38.1mm tavanı, işaret şartı, kaynağı OLMAYAN alt uç = REPORTED,
# büzgülü başta tavanın uygulanMAması) dosyanın kendi başlığındadır; kaynaksız
# eşik yok (§7.6). RATCHET YOK, tavan yok: kapı 0 ihlalle bağlandı.
add_test(NAME sleeve_cap_ease_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/sleeve_cap_ease_check.mjs)

# flat_artifact_census (V3-C kanat (b)+(c), 2026-08-24): shell-flat konturunda
# dört artefakt sınıfını SAYAR ve her birini kaynak satırına + tek cümlelik kök
# çözüme bağlar: tırtıklı kenar · kendini kesen kontur (global overlap) · C1
# kırığı · dejenere segment / sıfır alan. C1 eşiği 1.0°, kaynak McNeel Rhino
# "Understanding Tolerances" doküman açı toleransı varsayılanı (GECE/V3-R.md
# EŞİK 1, güven YÜKSEK); daha sıkı emsal CATIA V5 GSD 0.5° dosya başlığında NOT.
# Kırpma/smoothing/çözünürlük düşürme YOK — bulunan sayılır ve basılır.
add_test(NAME flat_artifact_census COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/flat_artifact_census.mjs)

# style_check: GOLDEN-PIN'in görsel kardeşi. Damla "kalemim" dediği her flat
# render'ı REPO PİNİNE (engine/STYLE-PIN/<style>.svg) diff'ler. node script.
add_test(NAME style_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/style_check.mjs)

# bridge_guard: köprü sessiz-düşürme yasağı (2026-07-23). princess/straps spec
# eşleşen styleKey yokken plain dart/scoop REFERANS tank'e degrade OLMAMALI (ikame).
add_test(NAME bridge_guard COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/bridge_guard.mjs)

# wallet_fuse_check (KOSU-v8 / G1): kimse Damla'nın parasını harcayamaz.
# 27 Ağu 2026'da CANLI ölçüldü: /api/analyze, Origin başlığı HİÇ OLMAYAN bir
# curl'e de gövde doğrulayıcısını (400) döndürüyordu — yani var olan bütün
# kapılardan geçmişti; worker.js'te Origin mantığı yoktu ve ACAO '*' idi. Tek
# fren IP başına 3/dk + 15/gün, global tavan sıfır. Kapı üç katmanı ayrı ayrı
# sınar (Origin · Turnstile · günlük harcama tavanı) ve ÖZELLİKLE Origin'in tek
# başına yetmediğini kilitler: doğru Origin'i taklit eden curl katman 1'i geçer,
# o yüzden KOSU-v8'in "Origin'i reddetmeye çevir" reçetesi tek başına kaçağı
# kapatmıyordu. Altı mutasyonun altısı da kırmızıya çevirdi (Origin'siz izin ·
# secret'sız geçiş · KV'siz sınırsız harcama · tavan×1000 · ACAO '*' ·
# Cloudflare'in hükmünü yoksay). Muhafızlar backend/guard.js'te, WASM'siz.
add_test(NAME wallet_fuse_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/wallet_fuse_check.mjs)

# 27 Tem kopuk kablo mandalları (json-el adli raporu): dört sessiz kopukluk.
# api_wire_check: skirtLengthMM API yolunda motora ULAŞIR (backend normalize
# spec taşır, web=backend aynı mm, 353!=1100 kalıp, 0/atlanmış default aynı).
add_test(NAME api_wire_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/api_wire_check.mjs)
# collar_bridge_check: şema enum'unun HER collar tipi ya köprüde çizilir ya
# missing.js kartına düşer — peterPan camelCase sessiz-düşme sınıfı ölü.
add_test(NAME collar_bridge_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/collar_bridge_check.mjs)
# skirtlen_refresh_check: foto mm'i gövdeyi İZLER (foto-anı donması yasak),
# elle mini/midi/maxi seçimi mm'i düşük tutar, create.js kablosu takılı.
add_test(NAME skirtlen_refresh_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/skirtlen_refresh_check.mjs)
# compile_dialect_check: compile() web lehçesini (waistline/fabric/skirtLengthMM)
# meşru tanır — flat byte-identical, mm motora ulaşır, geçersiz değer dürüst red.
add_test(NAME compile_dialect_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/compile_dialect_check.mjs)
# photo_ratio_wire_check: ölçülen oranlar kullanıcı akışına bağlı (2026-07-27).
# Sayının tek kaynağı deterministik piksel ölçümü (measure.js); LLM ratios{}
# yapısal ölü (ratiosMeasured tanığı). Aynı foto + farklı gövde -> farklı mm;
# farklı L/W -> farklı spec (mm + fullness sınıfı); tablo + veto deterministik.
add_test(NAME photo_ratio_wire_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/photo_ratio_wire_check.mjs)

# sizechart_source_check: KAYNAK BEYANI KAPISI (TUR 18B, 2026-08-17). The 70
# numbers of contract/tables.json draft.euSizeChart are the whole body of the
# engine and a buyer picks a size off them, and from 77193d5 (7 Jul 2026) until
# 17 Aug they carried NO source at all — one comment, "EU size chart (German
# convention)", written inside a TEST HARNESS next to invented tall/petite/pear
# bodies, copied verbatim into the engine by 1eafc16. This gate asks one
# question per column: does it name the publication it came from, and does it
# still match that publication value-for-value. ⚠ BORN RED ON PURPOSE, 4 of 7:
# bust/waist/hip are exact against burda style's published Damen Maßtabelle
# (so the +6cm regime above EU46 is now SOURCED, not just self-consistent);
# shoulder/backLength/armLength/neck are a VERIFIED ABSENCE, recorded not
# deleted, and queued in DAMLA-KUYRUK K10. It closes by finding a publication or
# by Damla replacing the numbers from a named one — NOT by editing the chart and
# NOT by softening the question (seven mutation probes are what stop that).
add_test(NAME sizechart_source_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/sizechart_source_check.mjs)

add_executable(ruffle_check tests/ruffle_check.cpp)
target_link_libraries(ruffle_check PRIVATE engine)
add_test(NAME ruffle_check COMMAND ruffle_check)

add_executable(tiered_ruffle_check tests/tiered_ruffle_check.cpp)
target_link_libraries(tiered_ruffle_check PRIVATE engine)
add_test(NAME tiered_ruffle_check COMMAND tiered_ruffle_check)

add_executable(sweetheart_check tests/sweetheart_check.cpp)
target_link_libraries(sweetheart_check PRIVATE engine)
add_test(NAME sweetheart_check COMMAND sweetheart_check)

add_executable(keyhole_check tests/keyhole_check.cpp)
target_link_libraries(keyhole_check PRIVATE engine)
add_test(NAME keyhole_check COMMAND keyhole_check)

add_executable(placket_check tests/placket_check.cpp)
target_link_libraries(placket_check PRIVATE engine)
add_test(NAME placket_check COMMAND placket_check)

add_executable(tie_check tests/tie_check.cpp)
target_link_libraries(tie_check PRIVATE engine)
add_test(NAME tie_check COMMAND tie_check)

add_executable(collar_check tests/collar_check.cpp)
target_link_libraries(collar_check PRIVATE engine)
add_test(NAME collar_check COMMAND collar_check)

# F-K: bir düz/Peter Pan yaka YATMAK zorunda. Truing sadece UZUNLUK ölçtüğü için
# düz çizgi bir boyun kenarı yeşil geçiyordu; bu kapı ŞEKLİ ölçer (sagitta > 0 +
# eğrilik yönü giysinin yaka çizgisiyle aynı). Tolerans gevşetilmedi.
add_executable(collar_lies_flat_check tests/collar_lies_flat_check.cpp)
target_link_libraries(collar_lies_flat_check PRIVATE engine)
add_test(NAME collar_lies_flat_check COMMAND collar_lies_flat_check)

add_executable(gather_check tests/gather_check.cpp)
target_link_libraries(gather_check PRIVATE engine)
add_test(NAME gather_check COMMAND gather_check)

add_executable(backopen_check tests/backopen_check.cpp)
target_link_libraries(backopen_check PRIVATE engine)
add_test(NAME backopen_check COMMAND backopen_check)

add_executable(laceupback_check tests/laceupback_check.cpp)
target_link_libraries(laceupback_check PRIVATE engine)
add_test(NAME laceupback_check COMMAND laceupback_check)

add_executable(wrapfront_check tests/wrapfront_check.cpp)
target_link_libraries(wrapfront_check PRIVATE engine)
add_test(NAME wrapfront_check COMMAND wrapfront_check)

add_executable(slit_check tests/slit_check.cpp)
target_link_libraries(slit_check PRIVATE engine)
add_test(NAME slit_check COMMAND slit_check)

add_executable(skirtlen_check tests/skirtlen_check.cpp)
target_link_libraries(skirtlen_check PRIVATE engine)
add_test(NAME skirtlen_check COMMAND skirtlen_check)

add_executable(strap_check tests/strap_check.cpp)
target_link_libraries(strap_check PRIVATE engine)
add_test(NAME strap_check COMMAND strap_check)

add_executable(peplum_check tests/peplum_check.cpp)
target_link_libraries(peplum_check PRIVATE engine)
add_test(NAME peplum_check COMMAND peplum_check)

add_executable(hemflounce_check tests/hemflounce_check.cpp)
target_link_libraries(hemflounce_check PRIVATE engine)
add_test(NAME hemflounce_check COMMAND hemflounce_check)

add_executable(gore_check tests/gore_check.cpp)
target_link_libraries(gore_check PRIVATE engine)
add_test(NAME gore_check COMMAND gore_check)

add_executable(pocket_check tests/pocket_check.cpp)
target_link_libraries(pocket_check PRIVATE engine)
add_test(NAME pocket_check COMMAND pocket_check)

add_executable(bustier_check tests/bustier_check.cpp)
target_link_libraries(bustier_check PRIVATE engine)
add_test(NAME bustier_check COMMAND bustier_check)
add_executable(locket_check tests/locket_check.cpp)
target_link_libraries(locket_check PRIVATE engine)
add_test(NAME locket_check COMMAND locket_check)
# cuttable_output_check — the six missing materials gate (F-G): seam allowance,
# grain line and cut-on-fold must be DRAWN geometry on the EU38 Locket output,
# and the side-seam notches must walk. Anti-hack sabotages inside.
add_executable(cuttable_output_check tests/cuttable_output_check.cpp)
target_link_libraries(cuttable_output_check PRIVATE engine)
add_test(NAME cuttable_output_check COMMAND cuttable_output_check)
add_executable(cup_check tests/cup_check.cpp)
target_link_libraries(cup_check PRIVATE engine)
add_test(NAME cup_check COMMAND cup_check)
add_executable(yoke_check tests/yoke_check.cpp)
target_link_libraries(yoke_check PRIVATE engine)
add_test(NAME yoke_check COMMAND yoke_check)
add_executable(boxpleat_check tests/boxpleat_check.cpp)
target_link_libraries(boxpleat_check PRIVATE engine)
add_test(NAME boxpleat_check COMMAND boxpleat_check)
add_executable(cuff_check tests/cuff_check.cpp)
target_link_libraries(cuff_check PRIVATE engine)
add_test(NAME cuff_check COMMAND cuff_check)

add_executable(neckline_ext_check tests/neckline_ext_check.cpp)
target_link_libraries(neckline_ext_check PRIVATE engine)
add_test(NAME neckline_ext_check COMMAND neckline_ext_check)

add_executable(hem_check tests/hem_check.cpp)
target_link_libraries(hem_check PRIVATE engine)
add_test(NAME hem_check COMMAND hem_check)

add_executable(halter_check tests/halter_check.cpp)
target_link_libraries(halter_check PRIVATE engine)
add_test(NAME halter_check COMMAND halter_check)

add_executable(bias_check tests/bias_check.cpp)
target_link_libraries(bias_check PRIVATE engine)
add_test(NAME bias_check COMMAND bias_check)

add_executable(cutline_check tests/cutline_check.cpp)
target_link_libraries(cutline_check PRIVATE engine)
add_test(NAME cutline_check COMMAND cutline_check)

add_executable(sleeve_check tests/sleeve_check.cpp)
target_link_libraries(sleeve_check PRIVATE engine)
add_test(NAME sleeve_check COMMAND sleeve_check)

add_executable(cap_sleeve_check tests/cap_sleeve_check.cpp)
target_link_libraries(cap_sleeve_check PRIVATE engine)
add_test(NAME cap_sleeve_check COMMAND cap_sleeve_check)

add_executable(placket_asym_check tests/placket_asym_check.cpp)
target_link_libraries(placket_asym_check PRIVATE engine)
add_test(NAME placket_asym_check COMMAND placket_asym_check)

add_executable(fit_proof tests/fit_proof.cpp)
target_link_libraries(fit_proof PRIVATE engine)
add_test(NAME fit_proof COMMAND fit_proof)

add_executable(sloper_check tests/sloper_check.cpp)
target_link_libraries(sloper_check PRIVATE engine)
add_test(NAME sloper_check COMMAND sloper_check)

add_executable(fba_check tests/fba_check.cpp)
target_link_libraries(fba_check PRIVATE engine)
add_test(NAME fba_check COMMAND fba_check)

add_executable(grade_check tests/grade_check.cpp)
target_link_libraries(grade_check PRIVATE engine)
add_test(NAME grade_check COMMAND grade_check)

add_executable(wearability_check tests/wearability_check.cpp)
target_link_libraries(wearability_check PRIVATE engine)
add_test(NAME wearability_check COMMAND wearability_check)

add_executable(wearability-bench tools/wearability-bench.cpp)
target_link_libraries(wearability-bench PRIVATE engine)

# Bugra corset micro-loop dump (patterns_real IoU harness input; not a test)
# F-H ÇIKTI: same spec on two fabrics (SVG) + the rehber as a printed page (PDF).
add_executable(fabric-axis-shot tools/fabric-axis-shot.cpp)
target_link_libraries(fabric-axis-shot PRIVATE engine)

add_executable(bugra-dump tools/bugra-dump.cpp)
target_link_libraries(bugra-dump PRIVATE engine)

add_executable(armhole-basis-probe tools/armhole-basis-probe.cpp)
target_link_libraries(armhole-basis-probe PRIVATE engine)

add_executable(neck-basis-probe tools/neck-basis-probe.cpp)
target_link_libraries(neck-basis-probe PRIVATE engine)

add_executable(shoulder_check tests/shoulder_check.cpp)
target_link_libraries(shoulder_check PRIVATE engine)
add_test(NAME shoulder_check COMMAND shoulder_check)

add_executable(buttonrow_check tests/buttonrow_check.cpp)
target_link_libraries(buttonrow_check PRIVATE engine)
add_test(NAME buttonrow_check COMMAND buttonrow_check)

add_executable(exposedzip_check tests/exposedzip_check.cpp)
target_link_libraries(exposedzip_check PRIVATE engine)
add_test(NAME exposedzip_check COMMAND exposedzip_check)

add_executable(backdetail_check tests/backdetail_check.cpp)
target_link_libraries(backdetail_check PRIVATE engine)
add_test(NAME backdetail_check COMMAND backdetail_check)

add_executable(fronttie_check tests/fronttie_check.cpp)
target_link_libraries(fronttie_check PRIVATE engine)
add_test(NAME fronttie_check COMMAND fronttie_check)

add_executable(offshoulder_check tests/offshoulder_check.cpp)
target_link_libraries(offshoulder_check PRIVATE engine)
add_test(NAME offshoulder_check COMMAND offshoulder_check)

add_executable(sideseam_adversarial_check tests/sideseam_adversarial_check.cpp)
target_link_libraries(sideseam_adversarial_check PRIVATE engine)
add_test(NAME sideseam_adversarial_check COMMAND sideseam_adversarial_check)

add_executable(notch_alignment_check tests/notch_alignment_check.cpp)
target_link_libraries(notch_alignment_check PRIVATE engine)
add_test(NAME notch_alignment_check COMMAND notch_alignment_check)

add_executable(closed_garment_check tests/closed_garment_check.cpp)
target_link_libraries(closed_garment_check PRIVATE engine)
add_test(NAME closed_garment_check COMMAND closed_garment_check)

add_executable(sewable_census tests/sewable_census.cpp)
target_link_libraries(sewable_census PRIVATE engine)
add_test(NAME sewable_census COMMAND sewable_census)

add_executable(roundtrip_check tests/roundtrip_check.cpp)
target_link_libraries(roundtrip_check PRIVATE engine)
add_test(NAME roundtrip_check COMMAND roundtrip_check)

# KUMAŞ EKSENİ (F-H İŞ 1): the fabric axis is a real axis, not a relabelled knit.
add_executable(fabric_ease_check tests/fabric_ease_check.cpp)
target_link_libraries(fabric_ease_check PRIVATE engine)
add_test(NAME fabric_ease_check COMMAND fabric_ease_check)

# REHBER (F-H İŞ 2): every printed advice is computed off this draft or cited.
# The repo root is handed in so the gate can read the source registry AND the
# wasm emit site (an advice the engine never hands out does not exist).
add_executable(guide_completeness_check tests/guide_completeness_check.cpp)
target_link_libraries(guide_completeness_check PRIVATE engine)
target_compile_definitions(guide_completeness_check PRIVATE
    STITCHU_REPO_ROOT="${CMAKE_CURRENT_SOURCE_DIR}/..")
add_test(NAME guide_completeness_check COMMAND guide_completeness_check)

# KUMAŞ KATALOĞU (F6 İŞ 1): one spec, three fabrics, three MEASURED patterns.
# The repo root is handed in so the gate can read the catalog it audits against.
add_executable(fabric_catalog_check tests/fabric_catalog_check.cpp)
target_link_libraries(fabric_catalog_check PRIVATE engine)
target_compile_definitions(fabric_catalog_check PRIVATE
    STITCHU_REPO_ROOT="${CMAKE_CURRENT_SOURCE_DIR}/..")
add_test(NAME fabric_catalog_check COMMAND fabric_catalog_check)

# ⭐ EDIT KATMANI (GECE7 / F7, §4A · K35) — op.extend ve op.attach'in KENDI
# kapilari. K35 sarti: bir operatorun kapisi KENDI adini tasir (`op.X -> X_check`);
# var olan bir kapinin adini odunc almak `expressability_check`te kirmizi yanar.
#
# Ikisi de INDIRILEN nesne uzerinde olcer: ayni spec iki kez cizilir (edit KAPALI
# ve ACIK) ve fark DRAWN komutlardan geri turetilir — operatorun kendi raporu
# okunmaz (K30/K49 dersi). extend_check ayrica "bolge disindaki cikti bayt-ayni"
# sartini komut komut yargilar; attach_check centigin ELLE YAZILMADIGINI, yani
# ev sahibi kenarin kendi yay ortasinda oldugunu, kenari kendisi yurüyerek
# dogrular ve o noktanin kutu ortasi OLMADIGINI ayrica olcer (§3.10).
add_executable(extend_check tests/extend_check.cpp)
target_link_libraries(extend_check PRIVATE engine)
add_test(NAME extend_check COMMAND extend_check)

add_executable(attach_check tests/attach_check.cpp)
target_link_libraries(attach_check PRIVATE engine)
add_test(NAME attach_check COMMAND attach_check)

add_executable(guide_check tests/guide_check.cpp)
target_link_libraries(guide_check PRIVATE engine)
add_test(NAME guide_check COMMAND guide_check)

# Gate 1 recipe path (PIPELINE Asama 1, docs/RECETE-SPEC.md). recipe_check:
# (a) same recipe + two pinned bodies -> two different CORRECT patterns
# (dart topology flips 2->1, waist/side-seam equalization measured, validator
# clean) + (c) seam checks on the RECIPE output + Err-path enforcement
# (RULES invariant 1) + the K0 const parity latch (RECETE-SPEC 2.3).
add_executable(recipe_check tests/recipe_check.cpp)
target_link_libraries(recipe_check PRIVATE engine)
add_test(NAME recipe_check COMMAND recipe_check
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/skirt-aline-dart.json)

# Gate 1(b): the recipe path vs the REPO PIN subset (grep '|skirt/aLine/' of
# golden-reference.csv). Expected comes from the PIN, never from a fresh motor
# dump — regen-vs-regen is forbidden as evidence (DERSLER.md:12).
add_executable(recipe_golden_dump tests/recipe_golden_dump.cpp)
target_link_libraries(recipe_golden_dump PRIVATE engine)
add_test(NAME recipe_golden_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/recipe_golden_check.sh
    $<TARGET_FILE:recipe_golden_dump>
    ${CMAKE_CURRENT_SOURCE_DIR}/golden-reference.csv
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/skirt-aline-dart.json)

# v1.1 top kernel (RECETE-SPEC §6): the damar-içi shift-dress recipe.
# recipe_dress_check: K0 const latch (incl. exact-double trig), motor
# cross-parity at the pinned extension point, body-follows-widths, measured
# side-seam equalization, drawn-vs-declared neck coupling, validator clean,
# Err paths for every v1.1 seal violation.
add_executable(recipe_dress_check tests/recipe_dress_check.cpp)
target_link_libraries(recipe_dress_check PRIVATE engine)
add_test(NAME recipe_dress_check COMMAND recipe_dress_check
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/shift-dress-square-spaghetti.json)

# v1.1 byte gate: recipe top path vs the REPO PIN subset (outline lines of
# top/square/tunic/none.short; probe-cleared for -ffp-contract, RECETE-SPEC §6).
add_executable(recipe_dress_golden_dump tests/recipe_dress_golden_dump.cpp)
target_link_libraries(recipe_dress_golden_dump PRIVATE engine)
add_test(NAME recipe_dress_golden_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/recipe_dress_golden_check.sh
    $<TARGET_FILE:recipe_dress_golden_dump>
    ${CMAKE_CURRENT_SOURCE_DIR}/golden-reference.csv
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/shift-dress-square-spaghetti.json)

# Grading / beden serisi (PIPELINE Aşama 5, recipe path): the SAME recipe
# re-evaluated against every standard body in euSizeChart() must produce a full
# graded set that is validator-clean + front/back seam-matched at every EU size,
# grows monotonically EU34->EU52, and keeps its dart topology constant across
# the whole series (RECETE-SPEC §2.1 `when`-flip warning). Complements the
# motor-path grade_check with the recipe (CAD document) path.
add_executable(recipe_grade_check tests/recipe_grade_check.cpp)
target_link_libraries(recipe_grade_check PRIVATE engine)
add_test(NAME recipe_grade_check COMMAND recipe_grade_check
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/skirt-aline-dart.json
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/shift-dress-square-spaghetti.json)

# recipe-json-dump (tool, not a test): recipe-path pattern as draftJSON-shaped
# JSON for the A4 sheet renderer (Gate 1d visual proof via render-recipe.mjs).
add_executable(recipe-json-dump tools/recipe-json-dump.cpp)
target_link_libraries(recipe-json-dump PRIVATE engine)

# Aşama 2 (KANVAS) mandalı: the WASM recipe path (engine/dist/stitchu-engine.js,
# draftRecipeJSON) is byte-equal to the native interpreter for the same recipe
# + body + params, err paths refuse honestly at the boundary, and the web copy
# of the recipe document (web/recipes/) is byte-identical to the canonical one
# these tests pin. Requires engine/build-wasm.sh output, same as api_wire_check.
add_test(NAME recipe_wasm_parity COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/recipe_wasm_parity_check.mjs
    $<TARGET_FILE:recipe-json-dump>
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/skirt-aline-dart.json)

# Same latch for the in-vein dress recipe the studio ships as its default
# (Kapı 2 material): wasm parity at the declared extendMM range ends + the
# web/recipes/ copy stays byte-identical (no silent fork of what Damla sees).
add_test(NAME recipe_wasm_parity_dress COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/recipe_wasm_parity_check.mjs
    $<TARGET_FILE:recipe-json-dump>
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/shift-dress-square-spaghetti.json)

# Aşama 5 tarayıcı-parite mandalı (2026-07-28): the DXF-AAMA/ASTM export the
# studio hands a shopper (wasm dxfRecipeJSON) is BYTE-IDENTICAL to the native
# dxf-export tool the outside-CAD proof (dxf_check.sh, ezdxf + mm-parity) runs
# on — same recipe + body + param, both range ends, three pinned bodies — plus
# three honest refusal paths at the wasm boundary. Requires engine/build-wasm.sh
# output (same as recipe_wasm_parity). Pins the browser download to the proven
# native geometry so "green suite" means the industry file is real in the browser.
add_test(NAME dxf_wasm_parity COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/dxf_wasm_parity_check.mjs
    $<TARGET_FILE:dxf-export>
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/skirt-aline-dart.json)
add_test(NAME dxf_wasm_parity_dress COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/dxf_wasm_parity_check.mjs
    $<TARGET_FILE:dxf-export>
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/shift-dress-square-spaghetti.json)

# KART V2-C ratchet: the shipped wasm boundary keeps RULES invariant 1 on the
# INT vocabulary axes (an in-between value is refused by name, never truncated
# into a neighbouring member) and always returns valid, finite JSON for every
# collarType. Both defects were measured on the shipped byte first
# (GECE/V0-0D.md §4a and §5 item 1); this gate is what keeps them closed.
# Requires engine/build-wasm.sh output (same as recipe_wasm_parity).
add_test(NAME wasm_spec_honesty_check COMMAND node
    ${CMAKE_CURRENT_SOURCE_DIR}/tests/wasm_spec_honesty_check.mjs)

# Aşama 3 köprü v1 mandalı (2026-07-28): izlenen Buğra mm konturu (pinli
# trace-ring dökümü) -> ring2recipe fit reçetesi. İddialar: üretim 2 koşu +
# repo pini bayt-özdeş; reçete çizimi 2 koşu bayt-özdeş; ring-compare
# toleransları (bbox ±%1.3, çevre vs pens-kapalı vektör ±%1.3, nokta-mesafe
# regresyon kilidi) aşımda FAIL. python3 ister (tracer araçları gibi).
add_test(NAME bugra_bridge_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/bugra_bridge_check.sh
    $<TARGET_FILE:recipe-json-dump>
    ${CMAKE_CURRENT_SOURCE_DIR}/..)

# dxf-export (tool, not a test): the recipe-path DraftedPattern as a
# DXF-AAMA/ASTM R12 interchange file (PIPELINE Aşama 5). Consumed by dxf_check.
add_executable(dxf-export tools/dxf-export.cpp)
target_link_libraries(dxf-export PRIVATE engine)

# Aşama 5 mandalı (2026-07-28): DXF-AAMA/ASTM export doğrulaması. dxf-export
# üretir, ezdxf (STANDART CAD kütüphanesi) açar, motorun mm geometrisine karşı
# layer + vertex paritesi kontrol edilir (≤1e-4mm), determinizm 2 koşu
# bayt-özdeş. ezdxf: engine/.venv-dxf; yoksa verify FAIL eder (sessiz skip yok).
add_test(NAME dxf_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/dxf_check.sh
    $<TARGET_FILE:dxf-export>
    $<TARGET_FILE:recipe-json-dump>
    ${CMAKE_CURRENT_SOURCE_DIR}/..)

# nest-marker (tool, not a test): lays the recipe-path DraftedPattern's cut
# pieces onto fabric of a given width without overlap, reports efficiency, and
# writes the marker (SVG + DXF). Consumed by nest_marker_check.
add_executable(nest-marker tools/nest-marker.cpp)
target_link_libraries(nest-marker PRIVATE engine)

# Aşama 6 mandalı (marker/yerleşim, 2026-07-28): the MARKER gate. Drafts both
# recipes across the pinned bodies + two industry fabric widths, nests them, and
# proves on the TRUE cut polygons (motor flattenCubic, zero tolerance): no two
# placed pieces overlap, every piece is inside the fabric width, efficiency is
# the measured area / consumed rectangle, the packer is deterministic, a too-
# narrow fabric is an HONEST refuse (no silent drop), and the overlap detector
# itself fires on a controlled overlap (a green gate that can't see overlap is
# worthless).
add_executable(nest_check tests/nest_check.cpp)
target_link_libraries(nest_check PRIVATE engine)
add_test(NAME nest_check COMMAND nest_check
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/skirt-aline-dart.json
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/shift-dress-square-spaghetti.json)

# Aşama 6 dış-CAD mandalı (marker/yerleşim, 2026-07-28): nest-marker'ın ürettiği
# marker DXF'i STANDART ezdxf ile açılır (AAMA boundary layer + mm), her parça
# kumaş eni içinde, ve overlap=0 BAĞIMSIZ bir geometri çekirdeğiyle (shapely /
# pure-python) doğrulanır — motorun kendi C++ overlap kanıtının dış-dünya aynası.
# Determinizm 2 koşu bayt-özdeş. ezdxf yoksa verify FAIL eder (sessiz skip yok).
add_test(NAME nest_marker_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/nest_marker_check.sh
    $<TARGET_FILE:nest-marker>
    ${CMAKE_CURRENT_SOURCE_DIR}/..)

# drape-preview (tool, not a test): FIRST real attempt at a 3D drape preview off
# the deterministic pattern geometry — a Provot-style mass-spring cloth (drape.hpp)
# hung under gravity around a body cylinder, projected to an SVG. NOT a physical /
# CLO3D sim (honest scope in drape.hpp): a deterministic geometric preview.
# Consumed by drape_check + tracer/svg2png.mjs (PNG visual proof).
add_executable(drape-preview tools/drape-preview.cpp)
target_link_libraries(drape-preview PRIVATE engine)

# drape_check (Aşama 2/6 mandalı, 2026-07-28): the DRAPE gate. Drapes the recipe-
# path skirt Front for pinned bodies and proves the settle is REAL + deterministic
# (byte-identical across two runs), the pinned edge stays fixed, no NaN, the hem
# actually falls below the flat lay, body-collision penetration ~0 AND the
# penetration detector is not blind (an unsettled flat sheet inside the cylinder
# is seen deep + settling reduces it), and a piece with no outline is an honest
# refuse (no fabricated preview). It never judges taste — that is Damla at Kapı 2.
add_executable(drape_check tests/drape_check.cpp)
target_link_libraries(drape_check PRIVATE engine)
add_test(NAME drape_check COMMAND drape_check
    ${CMAKE_CURRENT_SOURCE_DIR}/../recipes/skirt-aline-dart.json)

# tech-pack (tool, not a test): grades ONE recipe across the full EU size chart
# and assembles the industrial production package (size table + cut list +
# fabric/gramaj + marker efficiency + graded DXF per size) into one machine-
# readable JSON manifest. Everything motor-derived; a refused/blocked size is
# reported honestly. Consumed by tech_pack_check + gen-techpack-pdf.mjs.
add_executable(tech-pack tools/tech-pack.cpp)
target_link_libraries(tech-pack PRIVATE engine)

# tech_pack_check (Aşama 5/6 birleşim mandalı, 2026-07-28): the PRODUCTION
# package gate. Grades each recipe across the full EU size chart and assembles
# the factory tech pack (size table + cut list + fabric/gramaj + marker
# efficiency + graded DXF per size) into one machine-readable JSON manifest +
# one human-readable PDF spec sheet. Proves from the OUTSIDE: manifest + every
# graded DXF byte-identical over 2 runs (deterministic); manifest matches the
# stitchu.techpack/1 schema; every marker efficiency == measured area /
# (width x roll) and every fabric weight == meters x 1.40 x gsm (cross-checked);
# the grade is monotonic EU34->EU52; every graded DXF opens in ezdxf (AAMA layer
# + mm) and the PDF opens in poppler. ezdxf/poppler missing = FAIL (no silent
# skip). Requires node + the .venv-dxf ezdxf + poppler (pdfinfo/pdftoppm).
add_test(NAME tech_pack_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/tech_pack_check.sh
    $<TARGET_FILE:tech-pack>
    ${CMAKE_CURRENT_SOURCE_DIR}/tools/gen-techpack-pdf.mjs
    ${CMAKE_CURRENT_SOURCE_DIR}/..)

# K2 composition ratchet (2026-07-19): the declared component x host and
# component x component conflict matrix (contract/composition.json via
# composition.gen.hpp) is re-derived by actually drafting every combination.
# A silent no-op not declared "ignored", or any declared-vs-observed class
# drift, fails the suite.
add_executable(compose_check tests/compose_check.cpp)
target_link_libraries(compose_check PRIVATE engine)
add_test(NAME compose_check COMMAND compose_check)

# K1 contract ratchet (2026-07-19): schema + term registry + generated
# consumers + flat recipes + runtime vision gate all validated in one node
# script. Any drift between contract/ and its consumers fails the suite.
find_program(NODE_EXECUTABLE node REQUIRED)
add_test(NAME contract_check COMMAND ${NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tools/validate-contract.mjs)

# specv2_check: the garment-spec v2 seal (H2.1, 2026-08-17). The v2 contract sat
# as a .DRAFT.md for five days with "kod bağlanmadı" written at the top; this is
# what stops it being a draft. It holds the generated schema in sync with its
# single source, and it holds the OPERATOR REGISTRY against the engine: every
# operator declared `shipped`/`flagged` must still bind a real SheathOptions
# field with the declared default, and every operator declared `absent` must
# still bind nothing. Then it runs the fixtures the bitiş tanımı is made of — a
# valid spec passes, a bad enum is rejected rather than substituted (DERSLER: a
# silent puff->None fallback is hallucination), and an unbuildable garment is
# refused BY THE MISSING OPERATOR'S NAME. That last fixture is H2.7's foundation
# and it fails if a refusal ever stops naming what is missing.
add_test(NAME specv2_check COMMAND ${NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tools/specv2-check.mjs)

# specv1v2_map_check (Tur 11, 2026-08-17): v1 ile v2 arasinda iki dogru kalmasin.
# contract/garment-spec.schema.json (v1) OLU DEGIL — contract_check ve
# collar_bridge_check onu okuyor ve gen-contract.mjs $defs.visionReading'i
# backend/ + web/ icine gomuyor. Ama v1 79 enum degeri OKUYOR, v2 sicili bugun
# bunlarin 31'ini URETEBILIYOR. Bosluk kusur degil, bitis taniminin kendisidir:
# bir giysiyi ADIYLA reddedebilmek icin once onu okuyabilmek gerekir. Tehlike,
# birinin v1'in enum'una bakip "motor peterPan yaka cikarir" demesidir. Bu kapi
# contract/spec-v1-v2-map.json'u iki sozlesmeden YENIDEN URETIP diskteki ile
# karsilastirir: v1'e bir kelime eklenirse ya da v2'de bir operator durum
# degistirirse tablo bayatlar ve test KIRMIZI olur. Hukum tabloya yazilmaz,
# hesaplanir — elle "guncellendi" denemez.
add_test(NAME specv1v2_map_check COMMAND ${NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tools/gen-spec-v1v2-map.mjs --check)

# flat_tables_check (F-INDIR 2. tur, 2026-08-26): the flat pen moved into the
# published root (web/lib/flat-core.js) so a shopper can download a technical
# flat, and it can no longer readFileSync the five contract tables it reasons
# from. They are emitted as web/lib/flat-tables.gen.js. A generated mirror with
# no gate on it IS a second truth; this gate re-emits it from contract/ +
# engine/vocab.json and fails when the committed module drifts by one byte.
add_test(NAME flat_tables_check COMMAND ${NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tools/gen-flat-tables.mjs --check)

# K2 flat render lint (2026-07-19): every flat style record in styles.json is
# rendered headlessly and checked for self-intersection, inconsistent winding
# (reversed normals), zero-area loops and sampleX y-monotonicity.
add_test(NAME flat_render_lint COMMAND ${NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tools/render-lint.mjs)

# K3 preview truth (2026-07-19): one semantic JSON per flat style projected
# twice (display flat + drafted pattern); structural equality is hard (every
# drawn element needs a pattern counterpart, declared gaps allowlisted with
# contract refs), landmark deviation is soft 8% with pinned stylisation
# envelopes (contract/preview-truth.json) — drift beyond a pin fails.
add_test(NAME preview_truth_check COMMAND ${NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tools/preview-truth.mjs)

# FIGURE_BASE mandalı (2026-07-22): her flat stilin gövde outline'ından bel
# oyuğu (waist/bust) ölçülür — figürel top [0.72,0.84] bandında, boxy >0.93
# kutu (iki yönlü: figürelleşirse de FAIL), dress/pinli taban değere ±0.02
# drift-lock (contract/figure-bands.json mandal). Bir daha kimse fark etmeden
# boru üretemez.
add_test(NAME figure_check COMMAND ${NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tools/figure-lint.mjs)

# VOLUME kernel ratchet (2026-08-09): the integrator is validated against solids
# with closed-form area / volume / centroid / total curvature. Sphere, ellipsoid
# and torus must all come back inside 1e-8 relative, and the Gauss-Bonnet total
# must report chi=2 for the spheres and chi=0 for the torus, so a closed surface
# proves its own topology out of the same pass that measured it.
add_executable(volume_check tests/volume_check.cpp)
target_link_libraries(volume_check PRIVATE engine)
add_test(NAME volume_check COMMAND volume_check)

# BODY SURFACE gate. The test file landed on 2026-08-08 but its target never did:
# commit 192a9cc wired only volume.cpp / volume_check, so bodysurface.cpp was
# never compiled and this check has never run inside the suite. Wired 2026-08-10.
add_executable(body_volume_check tests/body_volume_check.cpp)
target_link_libraries(body_volume_check PRIVATE engine)
add_test(NAME body_volume_check COMMAND body_volume_check)

# GARMENT SHELL gate (2026-08-10): ease stops being a number a draftsman types
# and becomes the OUTER PARALLEL BODY of the section. Steiner's formulae make
# girth -> offset exact (P_d = P + 2.pi.d, A_d = A + d.P + pi.d^2), so the shell
# is checked against its own theorems, a declared ease is re-measured at the ring
# it was declared at, ease comes back as a VOLUME, and a shell that would fold
# through itself is refused together with the radius of curvature that killed it.
add_executable(render-shell tools/render-shell.cpp)
target_link_libraries(render-shell PRIVATE engine)

add_executable(garment_shell_check tests/garment_shell_check.cpp)
target_link_libraries(garment_shell_check PRIVATE engine)
add_test(NAME garment_shell_check COMMAND garment_shell_check)

# flatten_check: the C++ port of the CERTIFIED ARAP solver (flatten-research/15,
# Faz C / G1) held to the same analytic gates — cone unrolls to its exact sector,
# calotte darts land on the develop-deficit. Python 15 is the proof of record;
# a disagreement means the port broke, never the proof.
add_executable(flatten_check tests/flatten_check.cpp)
target_link_libraries(flatten_check PRIVATE engine)
add_test(NAME flatten_check COMMAND flatten_check)

# surface_pattern_check: the single-surface line (waist ring sampled ONCE, both
# panels cut from it, certified-ARAP flattened) judged at the production doors:
# chart girth ±0.5mm, H3b ring door ±1.0mm, strain 0.5%, seam deed 0.79375mm.
add_executable(surface_pattern_check tests/surface_pattern_check.cpp)
target_link_libraries(surface_pattern_check PRIVATE engine)
add_test(NAME surface_pattern_check COMMAND surface_pattern_check)

# h10_gate_check: H1.0'ın KABUL KAPISI — giyilebilirlik. Tanım docs/H1.0-KAPI.md.
# Altı şart x sekiz beden: kol oyuğu çevresi + grade, omuz dikişinin VARLIĞI,
# omuz ön/arka dengesi (arka uzun, kürek payı), yakanın KAPALI delik olması ve
# çevresi, omzun üstünden geçen taşıyıcı yüzey. Sayılar satın alınmış Buğra
# kalıbından ölçülü; tahmin edilen sayı yok. KIRMIZI DOĞMASI beklenendir.
# DEVRE DIŞI 2026-08-23 (GECE/KART/F-F-kalip.md "AYRICA"). SİLİNMEDİ, LEGACY.
# Sebep: bu kapı SurfacePattern hattını yargılıyor, ama `surfacepattern`
# engine/src'den SIFIR kez include ediliyor (ölçüldü: grep, 0 satır). Yani
# sevk edilen giysiyi değil, hattın dışında duran bir hattı yargılıyordu.
# Sevk edilen hattın kapısı: garment_armhole_check (aşağıda).
add_executable(h10_gate_check tests/h10_gate_check_LEGACY.cpp)
target_link_libraries(h10_gate_check PRIVATE engine)
add_test(NAME h10_gate_check COMMAND h10_gate_check)
set_tests_properties(h10_gate_check PROPERTIES DISABLED TRUE)

# garment_armhole_check: SEVK EDİLEN hattın (BodiceBlock::draft, varsayılan
# BodiceOptions) kol oyuğu + yaka kapısı. K1 yayınlanmış Aldrich bandı,
# K2 grade adımı, K3 yaka >= boyun. Buğra sütunları PARİTE, hüküm vermez.
add_executable(garment_armhole_check tests/garment_armhole_check.cpp)
target_link_libraries(garment_armhole_check PRIVATE engine)
add_test(NAME garment_armhole_check COMMAND garment_armhole_check)

# surface-pattern: emits the single-surface sheath as specification.json so
# h3b-rings.py / walk.py judge the new line without referee changes.
add_executable(surface-pattern tools/surface-pattern.cpp)
target_link_libraries(surface-pattern PRIVATE engine)

# shell-flat: the fashion flat computed as an orthographic projection of the
# SAME GarmentSurf the pattern is cut from, instead of drawn from a 2D croquis.
add_executable(shell-flat tools/shell-flat.cpp)
target_link_libraries(shell-flat PRIVATE engine)

# seam-plan: the ONE seam plan printed in its two readings (kalıp / flat), so
# the F3 gate interrogates the shipped engine instead of a re-implementation.
add_executable(seam-plan tools/seam-plan.cpp)
target_link_libraries(seam-plan PRIVATE engine)

# rotate-op (GECE7 / F5-A): op.rotate — dart transfer / pivot — run against the
# LIVE seam plan's front torso panel. Same rule as seam-plan: the tool holds no
# geometry, every number comes out of src/dartrotate.cpp.
add_executable(rotate-op tools/rotate-op.cpp)
target_link_libraries(rotate-op PRIVATE engine)

# suppress-op (GECE7 / F5-B): op.suppress — the panel's own develop-deficit
# opened as a wedge, or REFUSED. Same rule as seam-plan and rotate-op: the tool
# holds no geometry, and here it holds no angle either — suppressPanel() reads
# the angle off the panel and has no parameter for it.
add_executable(suppress-op tools/suppress-op.cpp)
target_link_libraries(suppress-op PRIVATE engine)

# split-op (GECE7 / F5-C): op.split — the panel divided at the column its OWN
# measured per-column develop-deficit picks out. Same rule as seam-plan,
# rotate-op and suppress-op: the tool holds no geometry, and here it holds no
# FRACTION either — splitPanel() takes a panel and nothing else.
add_executable(split-op tools/split-op.cpp)
target_link_libraries(split-op PRIVATE engine)

# plan-ops (GECE7 / F5-D, borç 45+49+51 / K46): THE OPERATOR PROGRAM. The three
# operators asked of the SHIPPED seam plan and their answers — refusals included
# — written back into a COPY of it. This is the same call the wasm binding
# `opsJSON` makes and the same one web/js/engine.js reaches, so the gate below
# measures the artifact the user gets rather than a driver written for a gate.
add_executable(plan-ops tools/plan-ops.cpp)
target_link_libraries(plan-ops PRIVATE engine)

# shell-audit (GECE7 / F5-B, IS 0b): a DENSE POLYLINE sampling of the shipped
# shell, so a gate can recompute every published ShellMeasure by a second path
# and ask whether the number the user downloads is CORRECT — not merely whether
# it came from the same object (which is all F3 and F5-A established).
add_executable(shell-audit tools/shell-audit.cpp)
target_link_libraries(shell-audit PRIVATE engine)

# waistfold-probe: DIAGNOSTIC, not a gate and not in ctest. Re-runs the sheath
# with solver knobs that carry no geometric meaning and prints the waist fold,
# so "is the fold the flatten solver's or the contour's?" is answered by a
# measurement instead of by reading the code.
add_executable(waistfold-probe tools/waistfold-probe.cpp)
target_link_libraries(waistfold-probe PRIVATE engine)

# arapconv-probe: DIAGNOSTIC, not a gate and not in ctest. One line per size
# carrying the three numbers the ARAP convergence stop has to move together —
# the waist turn angle, the h3c mm residual, and the worst panel strain.
add_executable(arapconv-probe tools/arapconv-probe.cpp)
target_link_libraries(arapconv-probe PRIVATE engine)

# section_check: the body cross-section has a FRONT and a BACK. Girth, back-arc
# share, convexity, Steiner exactness, side-point smoothness, and the asymmetry
# itself — each a gate, so the symmetric-ellipse body cannot come back quietly.
add_executable(section_check tests/section_check.cpp)
target_link_libraries(section_check PRIVATE engine)
add_test(NAME section_check COMMAND section_check)

# capability_check: a capability is not a dial. Turning one off must make the
# suite RED, not green — see the file header for the incident that caused it.
add_executable(capability_check tests/capability_check.cpp)
target_link_libraries(capability_check PRIVATE engine)
add_test(NAME capability_check COMMAND capability_check)

# wearable_check: can a person put this on? A geometric gate cannot catch a neck
# opening the head will not pass — see the file header for the night it did not.
add_executable(wearable_check tests/wearable_check.cpp)
target_link_libraries(wearable_check PRIVATE engine)
add_test(NAME wearable_check COMMAND wearable_check)

# edgemono_check: a panel edge that folds back on itself. The ring-based
# self-intersection check in panelcheck.py reports a PROPER crossing, and says
# in its own header that touching is not crossing — so a cut line that runs out
# and returns along nearly the same line is a tangency, its determinant is
# zero, and it passes. Eight sizes, specifications generated fresh from
# surface-pattern rather than read off a past run's pack. Needs the garmentcode
# venv for svgpathtools; a missing venv FAILS instead of skipping silently.
add_test(NAME edgemono_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/edgemono_check.sh
         $<TARGET_FILE:surface-pattern> ${CMAKE_CURRENT_SOURCE_DIR}/..)

# walkgate_check: the seam deed's own verdict, wired to an exit code. walk.py
# printed FAIL rows for sixty of sixty-four panels and exited 0 anyway, so
# taban.sh wrote `walk:OK` on all eight sizes. The gate now leaves the process
# as a status; this test is what stops it floating again. Which finding is a
# verdict and which is information is written into walk.py's gate() header.
add_test(NAME walkgate_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/walkgate_check.sh
         $<TARGET_FILE:surface-pattern> ${CMAKE_CURRENT_SOURCE_DIR}/..)

# cutplan_check: the cut plan's own verdict, wired to an exit code. cutplan.py
# had no exit code and no __main__ at all, so its hardest finding — the naming
# rule and the outlines contradicting each other on a mirrored pair — was a
# sentence printed into print-report.txt and read by nobody. That is the exact
# class of the Tur 12/13 mirror-seam defect, which stood in the shipped garment
# in five of eight sizes for the same reason. Which finding is a verdict and
# which is information is written into cutplan.py's verdict() header.
add_test(NAME cutplan_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/cutplan_check.sh
         $<TARGET_FILE:surface-pattern> ${CMAKE_CURRENT_SOURCE_DIR}/..)

# printpack_sheet_check: what the PRINTED pack actually says. Twice now a
# sentence was derived, proved, and shipped only into print-report.txt -- the
# audit file, which no buyer holds: the assembly order (T4) and the "BURAYI
# DİKMEYİN" opening warning (T10). Both commit messages said the pack carried
# it; the pack did not. No test guarded printpack at all, because printpack is
# Python and this suite is C++. This is that latch: it drafts a spec off
# surface-pattern, prints the pack, and reads the PDF back. Needs the
# garmentcode venv and pdftotext; either missing FAILS instead of skipping.
add_test(NAME printpack_sheet_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/printpack_sheet_check.sh
         $<TARGET_FILE:surface-pattern> ${CMAKE_CURRENT_SOURCE_DIR}/..)

# F-C MUTFAK (GECE-KOSUSU-v5 SSB-4): the price of admission into the vocabulary.
# Every Layer-3 menu name must resolve into Layer-1 primitives AND draw a
# distinct panel chain in this engine; what cannot is marked `absent` with a
# reason, never deleted and never invented around.
add_executable(preset_resolve_check tests/preset_resolve_check.cpp)
target_link_libraries(preset_resolve_check PRIVATE engine)
add_test(NAME preset_resolve_check COMMAND preset_resolve_check
         ${CMAKE_CURRENT_SOURCE_DIR}/vocab.json
         ${CMAKE_CURRENT_SOURCE_DIR}/../contract/primitives-v1.json
         ${CMAKE_CURRENT_SOURCE_DIR}/../contract/vocab-resolution-v1.json)

# F-I EDİTLEME KAPISI: "yakayı değiştir" deyince dokunulmayan paneller
# BAYT-AYNI kalmalı. Bölge ilanı contract/edit-locality-v1.json'da (kaynağı
# composition.json'un conflictClass'ı), motorun çıktısından türetilmiş değil.
# Üç anti-hack mandalı test dosyasının başında yazılı; en sertı: aynı düzenleme
# "tüm spec'i yeniden yaz" kipinde uygulanınca kapı KIRMIZI düşmek zorunda.
add_test(NAME edit_locality_check COMMAND ${NODE_EXECUTABLE}
         ${CMAKE_CURRENT_SOURCE_DIR}/tests/edit_locality_check.mjs)

# V2-B, KAPI 1/2 — vocab_source_check: the vision word list is a BUILD PRODUCT.
# vision-student/vocab.py opened with "the classes MUST stay identical to the
# teacher schema" and nothing checked the sentence; measured against
# engine/vocab.json it was false on three of its four lists (neckline 7 vs 9,
# garment carried two words no engine axis has, skirtStyle 5 vs 6). Same
# regen-and-diff pattern as specv2_check, with the k8s twist: the generator
# writes into mktemp, never into the tree it is judging. The tolerance is zero
# bytes. A word that cannot ship lands in _UNRESOLVED with its reason and the
# gate re-derives that block from the JSON tables, so the generator cannot pass
# itself by writing both sides of the diff.
add_test(NAME vocab_source_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/vocab_source_check.sh)

# V2-B, KAPI 2/2 — vocab_reference_check: the closed-enum ratchet. V2's
# direction is BREADTH -> DEPTH, so a reference to a closed enum value may fall
# and may not rise. The floor is a committed count file, and both sides are
# counted in a detached git worktree — the unit is the COMMIT, so a parallel
# worker's dirty tree cannot move the number. A fall leaves the gate green and
# does NOT rewrite the floor; locking a decrease in is a separate, deliberate
# `--baseline` commit. Read the per-key deltas before touching the baseline:
# this signature counts comments and prose too, on purpose (stability over
# accuracy), and the reasons are in the script's header.
add_test(NAME vocab_reference_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/vocab_reference_check.sh)

# V9-B — docs_truth_check: DOKÜMAN DOĞRULUK KAPISI. RULES §6 ("Numbers live in
# TEST OUTPUT, not in docs — name the tool/test that prints the number") bugüne
# kadar hiçbir şeyin koşmadığı bir cümleydi; V9-A onu elle ölçtü (16 ham
# duran-iddia hit'i, 502 yol referansı, 238 iddia cümlesi) ve o sayılar bir
# markdown dosyasında durdu, yani kimsenin kıramayacağı sayılardı. Bu kapı üç
# alt denetimi tek exit koduna bağlar: D1 duran iddia (hard 0, kayıtlı borç
# listesiyle), D2 ölü repo yolu (hard 0, aynı liste), D3 sağlayıcısız sayısal
# satır (RATCHET, taban yalnız DÜŞEBİLİR — vocab_reference_check emsali).
# İSTİSNA KURALI ZORUNLU: tırnak/kod-span içindeki hit ve tarihli ölçüm
# bağlamındaki hit DÜŞER, yoksa kapı RULES §6 ONARIMINI cezalandırır (V9-A §2B:
# 16 hit'in 13'ü yanlış pozitif). Kaçış mekanizması yayınlanmış pratikten
# (V9-R §2: doctest +SKIP, Vale accept.txt, woke .wokeignore) ve GÖRÜNÜR:
# yanlış pozitif kapıyı gevşetmez, aynı commit'te tabana yazılır.
# Kırmızı kanıtı GECE/log/V9-B.red-before.txt, mutasyon kanıtı
# GECE/log/V9-B.mutasyon.txt.
add_test(NAME docs_truth_check COMMAND ${NODE_EXECUTABLE}
         ${CMAKE_CURRENT_SOURCE_DIR}/tests/docs_truth_check.mjs)

# V10-B — landing_truth_check: SİTE DOĞRULUK KAPISI. docs_truth_check dokümanı
# denetliyordu; ALICININ GÖRDÜĞÜ yüzeyi (`web/**`) hiçbir şey denetlemiyordu.
# V10-A o yüzeyi ELLE ölçtü (985 iddia örneği: DOĞRU 54 · YALAN 298 · KANITSIZ
# 633) ve sayılar bir markdown dosyasında durdu — yani kimsenin kıramayacağı
# sayılardı. Bu kapı beş denetimi tek exit koduna bağlar:
#   L1 sağlayıcısız sayı (ratchet)  · L2 yasak vaat + duran iddia (ratchet)
#   L3 vizyon zamanı (data-vision="1" işareti) · L4 ölü link (site-health.mjs)
#   L5 beden dürüstlüğü (contract/layers/shape-ratios.json `sizes`)
# Sağlayıcı ad kümesi `add_test(NAME …)` ∪ `git ls-files engine/tools`'tan çıkar,
# DİSKTEN değil (V9-B3 taşınabilirlik dersi); build dizini varsa `ctest -N` ile
# karşılaştırılıp fark BASILIR. Kaçış grameri ADLANDIRILMIŞ ve SAYILABİLİR
# (V10-R §4 / Vale scope dersi): `<style>`, `<script>`, html-yorumu, SVG `d=`
# verisi ve JS yorumu kapsam dışıdır ve her koşuda SAYISI basılır.
# Taban `engine/tests/landing-truth-baseline.json`, YALNIZ DÜŞEBİLİR; 0 DEĞİL ve
# neden 0 olamadığı tabanın `_neden0Degil` alanında kart adıyla (V10-C) yazılı.
# Kırmızı kanıtı GECE/log/V10-B.red-before.txt (EXIT 1), mutasyon kanıtı
# GECE/log/V10-B.mutasyon.txt (beş denetimin BEŞİ de kırıldı ve geri döndü;
# mutasyon `web/` DIŞINDA bir git worktree fikstüründe koştu — `--dir=`).
add_test(NAME landing_truth_check COMMAND ${NODE_EXECUTABLE}
         ${CMAKE_CURRENT_SOURCE_DIR}/tests/landing_truth_check.mjs)

# hedef_kosu (KOŞU v7 §3.6, Halka 0 — 2026-08-26): COMPOUNDING ERROR KİLİDİ.
# Uzun koşuda asıl tehlike her fazın kendi kapısını geçip HEDEFTEN yavaşça
# sapmasıdır. Bu yüzden hedefin kendisi bir teste çevrildi ve her fazın sonunda
# koşar: fotoğraf + prompt -> kalıp + flat, zincirin hiçbir halkası taklit
# edilmeden (bankalı `seen` -> web/js/vision-bridge.js -> engine/dist draftJSON
# -> engine/tools/render-garment-flat.mjs).
# SIFIR API ÇAĞRISI, SIFIR KURUŞ (§3.9): VLM cevapları vision/eval/live-2026-08-22.json'a
# bir kez bankalandı; fixture'ı yenilemek bir FAZ KARARIDIR, kartta maliyetiyle yazılır.
# Cırcır: contract/hedef-kosu-taban.json'daki sayıların hiçbiri kötüleşemez.
# §3.8 md.1 gereği FAZ AJANI o dosyaya DOKUNAMAZ; değiştiren hakemdir ve
# önceki/sonraki sayıyı yan yana yazar.
# H11 (süre) bilerek cırcıra değil TAVANA bağlı (<10 sn): duvar saati ±0.3ms
# sallanıyor, eşitlik cırcırına bağlansa kapı gürültüde kırmızı yanar ve herkes
# onu yok saymayı öğrenir.
# Mutasyon kanıtı (§3.8 md.3) GECE7/log/halka0.mutasyon.txt: değişmeden üç koşu
# yeşil · taban sıkılınca EXIT 1 · motor kırılınca H1 5/5 -> 0/5 EXIT 1 · geri
# alınca yeşil. H4/H6/H9 bugün ÖLÇÜLEMİYOR ve karta "ÖLÇEMEDİM" diye basılıyor.
add_test(NAME hedef_kosu COMMAND ${NODE_EXECUTABLE}
         ${CMAKE_CURRENT_SOURCE_DIR}/tests/hedef_kosu.mjs)

# indir_check (KOŞU v7, F-İNDİR — 2026-08-26): KULLANICI EVE BİR DOSYA GÖTÜRÜYOR MU?
# 26 Ağu'da ölçüldü: web/js/create.js içinde `download`/`dxf` geçen satır sayısı
# SIFIRDI. Kullanıcı fotoğraf yüklüyor, kalıbı ekranda görüyor ve elinde hiçbir
# dosya olmadan çıkıyordu. O gün 118 testin hiçbiri bunu göremiyordu, çünkü
# hiçbiri "ürün bir dosya teslim ediyor mu" diye sormuyordu.
# Bu kapı, TARAYICININ YÜKLEDİĞİ modüllerin kendisini koşturur (web/js/download.js,
# web/js/pdf-core.js, engine/dist wasm) — node'a özel bir kopyayı değil, çünkü
# kopyanın yeşil olması inen dosya hakkında hiçbir şey söylemez.
# Ölçtükleri: dxfSpecJSON var mı (create.html'in tarif metni yok, bu bağlanma
# olmadan DXF butonu KURULAMAZ) · DXF R12 + ASTM katmanları · SVG gerçek mm +
# her parça etiketli · A4 paketinin kapağındaki KALİBRASYON KARESİ 30.000 mm
# ÖLÇÜYOR (iddia "kare var" değil, "kare 3 cm") · A0 tek sayfa 841x1189 mm ·
# ve REDDETME: geçersiz enum / kullanılamaz beden HİÇBİR dosya vermiyor
# (RULES invariant 1 — bloklu taslak temiz görünen bir endüstri dosyası olarak
# inerse kullanıcı ona göre kumaş keser).
# Sıfır API çağrısı, sıfır kuruş: saf geometri, VLM'e hiç gitmez.
add_test(NAME indir_check COMMAND ${NODE_EXECUTABLE}
         ${CMAKE_CURRENT_SOURCE_DIR}/tests/indir_check.mjs)

# bugra_parity_check (GECE7 / F8, §1.6) — KÖR KONTROL BİR KAPI OLDU.
# `tools/bugra/bugra-parity.mjs` fazlardır satın alınmış iki Buğra kalıbının
# GERÇEK mm geometrisine karşı bir sayı basıyordu ve o sayıyı hiçbir build
# okumuyordu. Bu kapı okuyor: bustier'in PARÇA EKSİĞİ 0 · eşlenen parçalar ad
# değil GERÇEK bölme (Center/Side konturları ayrı, alanları ayrı) · ve kontrol
# KÖR kalıyor (harness `cupSeam: bugra` / `locketTop: bugra` ezber değerlerini
# seçmiyor — garment.cpp:568/593 o değerleri görünce Buğra'nın kendi ease ve
# princess paylarını sabit yüklüyor).
# ⚠ SAPMA YÜZDESİ KAPILANMAZ (§1.6 "kör kontrol ayar vidası değildir") — motoru
# satın alınmış bir kalıba göre ayarlamak tam olarak bu kıyasın öldürdüğü şeydir.
# ⚠ locket-top'un DÖRT eksiği bir hedef değil, PİNLENMİŞ bir kayıt (K54).
add_test(NAME bugra_parity_check COMMAND ${NODE_EXECUTABLE}
         ${CMAKE_CURRENT_SOURCE_DIR}/tests/bugra_parity_check.mjs)

# al_dene_check (GECE7 / F8) — "AL DENE" bir cumle degil, bir yol.
# Sayfanin ON fotografi contract/hedef-kosu-taban.json'un MUHURLU onudur ·
# hakemin holdout dortlusu (11 12 30 35) ve yedek besi (10 14 15 34 36) BURADA
# YOKTUR (K16) · sevk edilen jpeg'ler kredilendirilen dosyalarla BAYT AYNI
# (yeniden kodlanmis bir kopya measure.js'te farkli olculur) · bankali okumalar
# circirin fixture'lariyla BAYT AYNI (H1 10/10 iddiasi ancak boyle bu sayfaya
# baglanir) · ve ornek yolu PARA HARCAMIYOR (analyzeBankedPhoto BACKEND_URL'e
# hic dokunmuyor, §3.9).
# ⚠ "10/10 ciziliyor"u BU KAPI OLCMEZ — hedef_kosu H1 olcuyor; "PDF iniyor"u
# indir_check olcuyor. Buradaki iddia o iki olcumun BAGLANDIGIdir.
add_test(NAME al_dene_check COMMAND ${NODE_EXECUTABLE}
         ${CMAKE_CURRENT_SOURCE_DIR}/tests/al_dene_check.mjs)

# vitrin_check (GECE7 / F9) — VITRIN OLCULUR, PROVA OKUNMAZ.
# landing_truth_check "bu sayisal cumle var olan bir aleti aniyor mu" diye
# soruyor ve iyi bir soru; soramadigi iki sey burada olculuyor:
#   1. SAYI BUGUNKU SAYI MI. engine/tools/gen-vitrin.mjs burada YENIDEN kosuyor
#      ve ciktisi web/data/vitrin.json ile ve sayfalarin data-v ogeleriyle
#      BIREBIR ayni olmak zorunda. "1 of 5 exact, 47 of 51 fields" gercek bir
#      alet adi tasiyordu ve cevap anahtari degistikten haftalar sonra canliydi.
#   2. URUN NE YAPAMIYOR, SAYFA SOYLUYOR MU. Sevk edilen giysi STRAPLESS
#      (CLAUDE.md: balensiz durmaz, listelenemez) ve suitte BES kirmizi var —
#      ikisi de sayfada ADIYLA gecmek zorunda.
# Ayrica: "unlimited"/"sinirsiz" kelimesi YASAK (K45, motorda slash-spread ve
# merge YOK) · patterns_real/ altina TEK BAGLANTI cikmaz ve web/ altindaki hicbir
# dosya satin alinmis bir kalibin BAYT KOPYASI olamaz (§4C md.7).
add_test(NAME vitrin_check COMMAND ${NODE_EXECUTABLE}
         ${CMAKE_CURRENT_SOURCE_DIR}/tests/vitrin_check.mjs)
