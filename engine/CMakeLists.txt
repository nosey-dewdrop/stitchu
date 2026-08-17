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

# style_check: GOLDEN-PIN'in görsel kardeşi. Damla "kalemim" dediği her flat
# render'ı REPO PİNİNE (engine/STYLE-PIN/<style>.svg) diff'ler. node script.
add_test(NAME style_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/style_check.mjs)

# bridge_guard: köprü sessiz-düşürme yasağı (2026-07-23). princess/straps spec
# eşleşen styleKey yokken plain dart/scoop REFERANS tank'e degrade OLMAMALI (ikame).
add_test(NAME bridge_guard COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/bridge_guard.mjs)

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
add_executable(bugra-dump tools/bugra-dump.cpp)
target_link_libraries(bugra-dump PRIVATE engine)

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
add_executable(h10_gate_check tests/h10_gate_check.cpp)
target_link_libraries(h10_gate_check PRIVATE engine)
add_test(NAME h10_gate_check COMMAND h10_gate_check)

# surface-pattern: emits the single-surface sheath as specification.json so
# h3b-rings.py / walk.py judge the new line without referee changes.
add_executable(surface-pattern tools/surface-pattern.cpp)
target_link_libraries(surface-pattern PRIVATE engine)

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
